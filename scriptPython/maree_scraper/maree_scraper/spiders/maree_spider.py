import scrapy
from scrapy_playwright.page import PageMethod
import re


class MareeSpider(scrapy.Spider):
    name = "maree"
    start_urls = ["https://maree.info/137"]

    def start_requests(self):
        # Première URL pour maree.info
        yield scrapy.Request(
            url=self.start_urls[0],
            meta={
                "playwright": True,
                "playwright_include_page": True,
                "playwright_page_methods": [
                    # Attendre que les tables des marées soient chargées
                    PageMethod("wait_for_selector", "table#MareeJourDetail_0 td"),
                    PageMethod("wait_for_selector", "table#MareeJours tr.MJ"),
                ],
            },
            callback=self.parse,
        )
        
        # Deuxième URL pour cabaigne.net
        yield scrapy.Request(
            url="https://www.cabaigne.net/france/landes/biscarrosse/",
            callback=self.parse_cabaigne,
        )

    def parse(self, response):
        self.logger.info("Page chargée : %s", response.url)
        result = {}

        # Récupération des données de MareeJourDetail_0 (détails de la journée actuelle)
        maree_detail_data = self.extract_maree_detail(response)
        if maree_detail_data:
            result["details_jour_actuel"] = maree_detail_data

        # Récupération des données des tables MareeJours_0 à MareeJours_6 (semaine)
        maree_jours_data = self.extract_maree_jours(response)
        if maree_jours_data:
            result["previsions_semaine"] = maree_jours_data

        yield result
    
    def parse_cabaigne(self, response):
        self.logger.info("Page cabaigne.net chargée : %s", response.url)
        
        # Recherche de la température de l'eau de plusieurs façons pour plus de robustesse
        temperature_eau = None
        
        # Méthode 1: Chercher dans la section "well" qui contient généralement les informations principales
        temperature_section = response.css('div.well h3')
        if temperature_section:
            temperature_text = temperature_section.get()
            match = re.search(r'<b>(\d+)°C</b>', temperature_text)
            if match:
                temperature_eau = match.group(1)
        
        # Méthode 2: Chercher directement le modèle "XX°C" dans la section well
        if not temperature_eau:
            well_text = response.css('div.well').get()
            if well_text:
                match = re.search(r'<b>(\d+)°C</b>', well_text)
                if match:
                    temperature_eau = match.group(1)
        
        # Méthode 3: Recherche plus large dans la page
        if not temperature_eau:
            match = re.search(r'température de l\'eau.*?<b>(\d+)°C</b>', response.text, re.IGNORECASE | re.DOTALL)
            if match:
                temperature_eau = match.group(1)
        
        # Créer un résultat pour cabaigne avec uniquement la température de l'eau
        if temperature_eau:
            yield {
                "temperature_eau": temperature_eau
            }

    def extract_maree_detail(self, response):
        """Extrait les données détaillées de la table MareeJourDetail_0"""
        rows = response.xpath('//table[@id="MareeJourDetail_0"]//tr[td]')
        if not rows:
            self.logger.warning("Aucune ligne trouvée dans la table MareeJourDetail_0")
            return []

        detailed_data = []
        for row in rows:
            cols = row.xpath(".//td")
            if len(cols) < 10:
                continue  # Ignore lignes incomplètes

            # Extraction des données de marée
            maree_texte = cols[0].xpath("string(.)").get().strip()
            coefficient_texte = cols[1].xpath("string(.)").get().strip()
            heures_texte = cols[2].xpath("string(.)").get().strip()
            duree_texte = cols[3].xpath("string(.)").get().strip()
            heure_maree_texte = cols[4].xpath("string(.)").get().strip()
            hauteur_texte = cols[5].xpath("string(.)").get().strip()
            marnage_texte = cols[6].xpath("string(.)").get().strip()
            un_douzieme_texte = cols[7].xpath("string(.)").get().strip()
            un_quart_texte = cols[8].xpath("string(.)").get().strip()
            demi_texte = cols[9].xpath("string(.)").get().strip()

            # Séparation des valeurs multiples (BM/PM, heures, hauteurs, etc.)
            marees = [m.strip() for m in maree_texte.split('\n') if m.strip()]
            coefficients = [c.strip() for c in coefficient_texte.split('\n') if c.strip()]
            heures = [h.strip() for h in heures_texte.split('\n') if h.strip()]
            durees = [d.strip() for d in duree_texte.split('\n') if d.strip()]
            heures_maree = [h.strip() for h in heure_maree_texte.split('\n') if h.strip()]
            hauteurs = [h.strip() for h in hauteur_texte.split('\n') if h.strip()]
            marnages = [m.strip() for m in marnage_texte.split('\n') if m.strip()]
            douzieme_vals = [d.strip() for d in un_douzieme_texte.split('\n') if d.strip()]
            quart_vals = [q.strip() for q in un_quart_texte.split('\n') if q.strip()]
            demi_vals = [d.strip() for d in demi_texte.split('\n') if d.strip()]

            # Création des entrées individuelles pour chaque marée
            max_items = max(len(marees), len(heures), len(hauteurs))
            for i in range(max_items):
                entry = {
                    "type": marees[i] if i < len(marees) else None,
                    "coefficient": coefficients[i] if i < len(coefficients) else None,
                    "heure": heures[i] if i < len(heures) else None,
                    "duree": durees[i % len(durees)] if durees else None,
                    "heure_maree": heures_maree[i % len(heures_maree)] if heures_maree else None,
                    "hauteur": hauteurs[i] if i < len(hauteurs) else None,
                    "marnage": marnages[i % len(marnages)] if marnages else None,
                    "un_douzieme": douzieme_vals[i % len(douzieme_vals)] if douzieme_vals else None,
                    "un_quart": quart_vals[i % len(quart_vals)] if quart_vals else None,
                    "demi": demi_vals[i % len(demi_vals)] if demi_vals else None,
                }
                detailed_data.append(entry)

        return detailed_data

    def extract_maree_jours(self, response):
        """Extrait les données des tables MareeJours_0 à MareeJours_6"""
        jours_data = []

        # Pour chaque jour de la semaine (0 à 6)
        for jour_idx in range(7):
            # Sélectionner la ligne correspondante dans la table
            row = response.xpath(f'//tr[@id="MareeJours_{jour_idx}"]')
            if not row:
                self.logger.warning(f"Ligne MareeJours_{jour_idx} non trouvée")
                continue

            # Extraire la date
            date_raw = row.xpath(".//th//text()").getall()
            date_raw = [d.strip() for d in date_raw if d.strip()]
            jour_semaine = date_raw[0] if len(date_raw) > 0 else ""
            jour_num = date_raw[1] if len(date_raw) > 1 else ""

            # Extraire les heures
            heures_raw = row.xpath(".//td[1]//text()").getall()
            heures = [h.strip() for h in heures_raw if h.strip()]

            # Extraire les hauteurs
            hauteurs_raw = row.xpath(".//td[2]//text()").getall()
            hauteurs = [h.strip() for h in hauteurs_raw if h.strip()]

            # Extraire les coefficients
            coefficients_raw = row.xpath(".//td[3]//text()").getall()
            coefficients = [c.strip() for c in coefficients_raw if c.strip() and c.strip() != '&nbsp;']

            # Fusionner les données de marée
            marées = []
            for i in range(len(heures)):
                type_maree = "BM" if (i % 2) == 1 else "PM"  # Alternance BM/PM
                coef = ""
                if i < len(coefficients):
                    coef = coefficients[i]

                marée = {
                    "type": type_maree,
                    "heure": heures[i] if i < len(heures) else "",
                    "hauteur": hauteurs[i] if i < len(hauteurs) else "",
                    "coefficient": coef
                }
                marées.append(marée)

            # Créer une entrée pour ce jour
            jour_data = {
                "jour_semaine": jour_semaine,
                "jour_num": jour_num,
                "marées": marées
            }
            jours_data.append(jour_data)

        return jours_data

    def clean_text(self, text):
        """Nettoie le texte en supprimant les espaces et sauts de ligne superflus"""
        if not text:
            return ""
        return re.sub(r'\s+', ' ', text).strip()