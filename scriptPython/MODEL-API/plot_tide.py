#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import json
import numpy as np
import matplotlib.pyplot as plt
import matplotlib.dates as mdates
from datetime import datetime, timedelta
import re
import os
import csv

def extraire_heures_minutes(heure_str):
    """Extraire les heures et minutes d'une chaîne au format 'HHhMM'"""
    match = re.match(r"(\d+)h(\d+)", heure_str)
    if match:
        heures, minutes = match.groups()
        return int(heures), int(minutes)
    return 0, 0

def convertir_hauteur(hauteur_str):
    """Convertir une chaîne de hauteur (par ex. '3,74m') en valeur numérique"""
    match = re.match(r"(\d+),(\d+)m", hauteur_str)
    if match:
        partie_entiere, partie_decimale = match.groups()
        return float(f"{partie_entiere}.{partie_decimale}")
    return 0.0

def calculer_courbe_maree(temps_marees, hauteurs_marees, date_reference=None):
    """
    Calculer une courbe de marée continue à partir des points de pleine et basse mer.
    Utilise une approximation sinusoïdale entre les points.
    
    Args:
        temps_marees: Liste des temps (objets datetime)
        hauteurs_marees: Liste des hauteurs correspondantes
        date_reference: Date de référence pour le calcul
        
    Returns:
        Tuple (temps_courbe, hauteurs_courbe)
    """
    if date_reference is None:
        # Si aucune date n'est fournie, utiliser la date actuelle
        date_reference = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)
    
    # Créer une série temporelle couvrant toute la journée (de 00h00 à 23h59)
    temps_debut = date_reference  # 00h00
    temps_fin = date_reference + timedelta(hours=23, minutes=59)  # 23h59
    
    # Générer des points toutes les 10 minutes
    temps_courbe = []
    temps_courant = temps_debut
    while temps_courant <= temps_fin:
        temps_courbe.append(temps_courant)
        temps_courant += timedelta(minutes=10)
    
    # Interpoler les hauteurs de marée
    hauteurs_courbe = []
    
    for t in temps_courbe:
        # Trouver entre quels points de marée nous sommes
        if t < temps_marees[0]:
            # Avant le premier point, on utilise une interpolation entre
            # le dernier point de la veille et le premier point du jour
            dernier_point = temps_marees[-1] - timedelta(days=1)
            premier_point = temps_marees[0]
            duree_totale = (premier_point - dernier_point).total_seconds()
            position_relative = (t - dernier_point).total_seconds() / duree_totale
            
            hauteur_debut = hauteurs_marees[-1]
            hauteur_fin = hauteurs_marees[0]
            
            # Interpolation sinusoïdale
            hauteur = hauteur_debut + (hauteur_fin - hauteur_debut) * (1 - np.cos(np.pi * position_relative)) / 2
            hauteurs_courbe.append(hauteur)
            
        elif t > temps_marees[-1]:
            # Après le dernier point, on utilise une interpolation entre
            # le dernier point du jour et le premier point du lendemain
            dernier_point = temps_marees[-1]
            premier_point = temps_marees[0] + timedelta(days=1)
            duree_totale = (premier_point - dernier_point).total_seconds()
            position_relative = (t - dernier_point).total_seconds() / duree_totale
            
            hauteur_debut = hauteurs_marees[-1]
            hauteur_fin = hauteurs_marees[0]
            
            # Interpolation sinusoïdale
            hauteur = hauteur_debut + (hauteur_fin - hauteur_debut) * (1 - np.cos(np.pi * position_relative)) / 2
            hauteurs_courbe.append(hauteur)
            
        else:
            # Entre deux points de marée
            for i in range(len(temps_marees) - 1):
                if temps_marees[i] <= t < temps_marees[i+1]:
                    duree_totale = (temps_marees[i+1] - temps_marees[i]).total_seconds()
                    position_relative = (t - temps_marees[i]).total_seconds() / duree_totale
                    
                    hauteur_debut = hauteurs_marees[i]
                    hauteur_fin = hauteurs_marees[i+1]
                    
                    # Interpolation sinusoïdale (plus réaliste pour les marées)
                    hauteur = hauteur_debut + (hauteur_fin - hauteur_debut) * (1 - np.cos(np.pi * position_relative)) / 2
                    hauteurs_courbe.append(hauteur)
                    break
            else:
                # Si on arrive ici, c'est qu'on est exactement sur le dernier point
                hauteurs_courbe.append(hauteurs_marees[-1])
    
    return temps_courbe, hauteurs_courbe

def export_vers_csv(temps, hauteurs, niveau_base=2.4, nom_fichier='valeurs_maree.csv'):
    """
    Exporte les valeurs de hauteur de marée dans un fichier CSV.
    
    Args:
        temps: Liste des temps (objets datetime)
        hauteurs: Liste des hauteurs correspondantes
        niveau_base: Niveau de référence (zéro) pour les hauteurs
        nom_fichier: Nom du fichier CSV à créer
    """
    try:
        with open(nom_fichier, 'w', newline='') as csvfile:
            writer = csv.writer(csvfile)
            # Écrire l'en-tête
            writer.writerow(['Heure', 'Hauteur (m)', 'Hauteur relative (m)'])
            
            # Écrire les données
            for t, h in zip(temps, hauteurs):
                # Formater l'heure au format HH:MM
                heure_formatee = t.strftime('%H:%M')
                # Formater la hauteur avec 2 décimales et remplacer le point par une virgule
                hauteur_formatee = f"{h:.2f}".replace('.', ',')
                # Calculer et formater la hauteur relative
                hauteur_relative = h - niveau_base
                hauteur_relative_formatee = f"{hauteur_relative:.2f}".replace('.', ',')
                
                writer.writerow([heure_formatee, hauteur_formatee, hauteur_relative_formatee])
        
        print(f"Les données ont été exportées avec succès dans le fichier '{nom_fichier}'")
        print(f"Le fichier contient {len(temps)} entrées (une toutes les 10 minutes)")
        
    except Exception as e:
        print(f"Erreur lors de l'exportation des données vers CSV: {e}")

def graphique_multi_jours(donnees_semaine, niveau_base=2.4, jours_a_afficher=3, nom_fichier=None):
    """
    Crée un graphique avec les courbes de marée pour plusieurs jours
    avec une continuité entre les jours
    
    Args:
        donnees_semaine: Données de marée pour la semaine
        niveau_base: Niveau de référence (zéro) pour les hauteurs
        jours_a_afficher: Nombre de jours à afficher
        nom_fichier: Fichier pour enregistrer l'image (si None, pas d'enregistrement)
    """
    plt.figure(figsize=(15, 8))
    
    # Date de référence (aujourd'hui)
    date_reference = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)
    
    # Couleurs pour les différents jours
    couleurs = ['blue', 'green', 'red', 'purple', 'orange', 'brown', 'pink']
    
    jours_a_traiter = min(jours_a_afficher, len(donnees_semaine))
    
    # Collecter toutes les données de marée sur la période complète
    temps_marees_global = []
    hauteurs_marees_global = []
    types_marees_global = []
    
    for j in range(jours_a_traiter):
        jour = donnees_semaine[j]
        
        for maree in jour["marées"]:
            h, m = extraire_heures_minutes(maree["heure"])
            temps_maree = date_reference + timedelta(days=j, hours=h, minutes=m)
            temps_marees_global.append(temps_maree)
            
            hauteur = convertir_hauteur(maree["hauteur"])
            hauteurs_marees_global.append(hauteur)
            
            types_marees_global.append(maree["type"])
    
    # Trier les points de marée par temps
    indices_tries = sorted(range(len(temps_marees_global)), key=lambda i: temps_marees_global[i])
    temps_marees_global = [temps_marees_global[i] for i in indices_tries]
    hauteurs_marees_global = [hauteurs_marees_global[i] for i in indices_tries]
    types_marees_global = [types_marees_global[i] for i in indices_tries]
    
    # Calculer une seule courbe continue pour tous les jours
    temps_debut = date_reference
    temps_fin = date_reference + timedelta(days=jours_a_traiter, hours=0)
    
    # Générer des points toutes les 10 minutes sur toute la période
    temps_courbe = []
    temps_courant = temps_debut
    while temps_courant < temps_fin:
        temps_courbe.append(temps_courant)
        temps_courant += timedelta(minutes=10)
    
    # Interpoler les hauteurs de marée
    hauteurs_courbe = []
    
    for t in temps_courbe:
        # Trouver entre quels points de marée nous sommes
        if t < temps_marees_global[0]:
            # Avant le premier point, extrapoler
            hauteurs_courbe.append(hauteurs_marees_global[0])
        elif t > temps_marees_global[-1]:
            # Après le dernier point, extrapoler
            hauteurs_courbe.append(hauteurs_marees_global[-1])
        else:
            # Entre deux points de marée
            for i in range(len(temps_marees_global) - 1):
                if temps_marees_global[i] <= t < temps_marees_global[i+1]:
                    duree_totale = (temps_marees_global[i+1] - temps_marees_global[i]).total_seconds()
                    position_relative = (t - temps_marees_global[i]).total_seconds() / duree_totale
                    
                    hauteur_debut = hauteurs_marees_global[i]
                    hauteur_fin = hauteurs_marees_global[i+1]
                    
                    # Interpolation sinusoïdale (plus réaliste pour les marées)
                    hauteur = hauteur_debut + (hauteur_fin - hauteur_debut) * (1 - np.cos(np.pi * position_relative)) / 2
                    hauteurs_courbe.append(hauteur)
                    break
            else:
                # Si on arrive ici, c'est qu'on est exactement sur le dernier point
                hauteurs_courbe.append(hauteurs_marees_global[-1])
    
    # Transformer les hauteurs pour qu'elles soient relatives au niveau de base
    hauteurs_courbe_relatives = [h - niveau_base for h in hauteurs_courbe]
    hauteurs_marees_relatives = [h - niveau_base for h in hauteurs_marees_global]
    
    # Tracer la courbe continue
    plt.plot(temps_courbe, hauteurs_courbe_relatives, color='blue', linewidth=2, label='Prédiction continue')
    
    # Ajouter les points de marée et visualiser les jours
    for j in range(jours_a_traiter):
        jour = donnees_semaine[j]
        jour_num = int(jour["jour_num"])
        
        # Extraire les temps et hauteurs pour l'affichage des points de ce jour
        temps_jour = []
        hauteurs_jour = []
        types_jour = []
        
        for maree in jour["marées"]:
            h, m = extraire_heures_minutes(maree["heure"])
            temps_maree = date_reference + timedelta(days=j, hours=h, minutes=m)
            temps_jour.append(temps_maree)
            
            hauteur = convertir_hauteur(maree["hauteur"])
            hauteurs_jour.append(hauteur)
            
            types_jour.append(maree["type"])
        
        # Transformer les hauteurs pour qu'elles soient relatives au niveau de base
        hauteurs_jour_relatives = [h - niveau_base for h in hauteurs_jour]
        
        # Ajouter les points de marée avec une couleur spécifique au jour
        for i, (t, h, h_rel, type_maree) in enumerate(zip(temps_jour, hauteurs_jour, hauteurs_jour_relatives, types_jour)):
            plt.scatter([t], [h_rel], color=couleurs[j % len(couleurs)], s=50, zorder=5)
            
            # Ajouter des annotations pour les marées
            plt.annotate(f"{type_maree}\n{t.strftime('%Hh%M')}\n{h:.2f}m", 
                        (t, h_rel), textcoords="offset points", 
                        xytext=(0, 10 if type_maree == "BM" else -30), 
                        ha='center', fontsize=8)
    
        # Ajouter des lignes verticales pour séparer les jours visuellement
        if j > 0:
            jour_debut = date_reference + timedelta(days=j)
            plt.axvline(x=jour_debut, color='gray', linestyle='--', alpha=0.5)
    
    # Ajouter une ligne horizontale pour le niveau de base (0m relatif)
    plt.axhline(y=0, color='red', linestyle='-', alpha=0.5, label=f'Niveau de base ({niveau_base}m)')
    
    # Formatage de l'axe des X pour afficher les heures et jours
    plt.gca().xaxis.set_major_formatter(mdates.DateFormatter('%d/%m %Hh'))
    plt.gca().xaxis.set_major_locator(mdates.HourLocator(interval=6))
    
    # Labels et titre
    plt.title(f'Prédiction de marée continue sur {jours_a_traiter} jours (relatif à {niveau_base}m)')
    plt.xlabel('Date et heure')
    plt.ylabel(f'Hauteur relative au niveau {niveau_base}m')
    plt.grid(True)
    
    # Ajouter une légende pour les jours
    for j in range(jours_a_traiter):
        jour = donnees_semaine[j]
        plt.scatter([], [], color=couleurs[j % len(couleurs)], s=50, 
                   label=f"{jour['jour_semaine']} {jour['jour_num']}")
    
    plt.legend()
    
    # Rotation des labels de l'axe X pour une meilleure lisibilité
    plt.xticks(rotation=45)
    
    plt.tight_layout()
    
    # Enregistrer l'image si un nom de fichier est fourni
    if nom_fichier:
        try:
            plt.savefig(nom_fichier)
            print(f"Graphique enregistré dans '{nom_fichier}'")
        except Exception as e:
            print(f"Erreur lors de l'enregistrement du graphique: {e}")

def calculer_courbe_maree_globale(donnees_semaine, niveau_base=2.4, intervalle_minutes=10):
    """
    Calcule une courbe de marée continue pour toute la semaine sans discontinuité.
    
    Args:
        donnees_semaine: Données de marée pour la semaine
        niveau_base: Niveau de référence (zéro) pour les hauteurs
        intervalle_minutes: Intervalle en minutes entre les points de la courbe
        
    Returns:
        Tuple (temps_courbe, hauteurs_courbe, hauteurs_courbe_relatives)
    """
    # Date de référence (aujourd'hui)
    date_reference = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)
    
    # Collecter tous les points de marée de la semaine
    temps_marees_global = []
    hauteurs_marees_global = []
    
    for j, jour in enumerate(donnees_semaine):
        for maree in jour["marées"]:
            h, m = extraire_heures_minutes(maree["heure"])
            temps_maree = date_reference + timedelta(days=j, hours=h, minutes=m)
            temps_marees_global.append(temps_maree)
            
            hauteur = convertir_hauteur(maree["hauteur"])
            hauteurs_marees_global.append(hauteur)
    
    # Trier les points de marée par temps
    indices_tries = sorted(range(len(temps_marees_global)), key=lambda i: temps_marees_global[i])
    temps_marees_global = [temps_marees_global[i] for i in indices_tries]
    hauteurs_marees_global = [hauteurs_marees_global[i] for i in indices_tries]
    
    # Créer une grille temporelle pour toute la période
    nb_jours = len(donnees_semaine)
    temps_debut = date_reference
    temps_fin = date_reference + timedelta(days=nb_jours)
    
    # Générer des points à intervalles réguliers
    temps_courbe = []
    temps_courant = temps_debut
    while temps_courant < temps_fin:
        temps_courbe.append(temps_courant)
        temps_courant += timedelta(minutes=intervalle_minutes)
    
    # Interpoler les hauteurs de marée
    hauteurs_courbe = []
    
    for t in temps_courbe:
        if t < temps_marees_global[0]:
            # Avant le premier point, extrapoler
            hauteurs_courbe.append(hauteurs_marees_global[0])
        elif t > temps_marees_global[-1]:
            # Après le dernier point, extrapoler
            hauteurs_courbe.append(hauteurs_marees_global[-1])
        else:
            # Entre deux points de marée
            for i in range(len(temps_marees_global) - 1):
                if temps_marees_global[i] <= t < temps_marees_global[i+1]:
                    duree_totale = (temps_marees_global[i+1] - temps_marees_global[i]).total_seconds()
                    position_relative = (t - temps_marees_global[i]).total_seconds() / duree_totale
                    
                    hauteur_debut = hauteurs_marees_global[i]
                    hauteur_fin = hauteurs_marees_global[i+1]
                    
                    # Interpolation sinusoïdale (plus réaliste pour les marées)
                    hauteur = hauteur_debut + (hauteur_fin - hauteur_debut) * (1 - np.cos(np.pi * position_relative)) / 2
                    hauteurs_courbe.append(hauteur)
                    break
            else:
                # Si on arrive ici, c'est qu'on est exactement sur le dernier point
                hauteurs_courbe.append(hauteurs_marees_global[-1])
    
    # Calculer les hauteurs relatives au niveau de base
    hauteurs_courbe_relatives = [h - niveau_base for h in hauteurs_courbe]
    
    return temps_courbe, hauteurs_courbe, hauteurs_courbe_relatives

def main():
    # Niveau de base pour les hauteurs de marée (zéro en ordonnées)
    niveau_base = 2.4  # Défini à 2.4m comme demandé
    
    # Chemin du fichier JSON
    json_file = 'result_scraper_tide.json'
    
    # Vérifier que le fichier existe
    if not os.path.exists(json_file):
        print(f"Erreur: Le fichier {json_file} n'existe pas dans le répertoire courant.")
        print(f"Répertoire courant: {os.getcwd()}")
        print(f"Fichiers disponibles: {os.listdir('.')}")
        return
    
    # Charger les données JSON
    try:
        with open(json_file, 'r') as f:
            donnees_brutes = json.load(f)
    except json.JSONDecodeError as e:
        print(f"Erreur lors du décodage du JSON: {e}")
        return
    except Exception as e:
        print(f"Erreur lors de la lecture du fichier: {e}")
        return
    
    # Vérifier la structure des données
    if not donnees_brutes or "previsions_semaine" not in donnees_brutes[0]:
        print("Erreur: Le fichier JSON n'a pas la structure attendue.")
        return
    
    # Récupérer les prévisions pour la semaine
    donnees_semaine = donnees_brutes[0]["previsions_semaine"]
    
    # Extraire les données du jour actuel
    jour_actuel = donnees_semaine[0]
    print(f"Traitement des données pour {jour_actuel['jour_semaine']} {jour_actuel['jour_num']}")
    
    # Date de référence (aujourd'hui à minuit)
    date_reference = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)
    
    # Créer un CSV pour les 7 jours avec une courbe continue (sans discontinuités)
    print("Génération des données de marée continues pour les 7 jours...")
    
    # Calculer la courbe globale pour toute la semaine
    temps_courbe, hauteurs_courbe, hauteurs_relatives = calculer_courbe_maree_globale(donnees_semaine, niveau_base)
    
    # Ouvrir le fichier CSV pour écriture
    try:
        with open('valeurs_maree_7jours.csv', 'w', newline='') as csvfile:
            writer = csv.writer(csvfile)
            # Écrire l'en-tête
            writer.writerow(['Date', 'Heure', 'Hauteur (m)', f'Hauteur relative à {niveau_base}m'])
            
            # Écrire les données
            for t, h, h_rel in zip(temps_courbe, hauteurs_courbe, hauteurs_relatives):
                # Formater la date au format ISO 8601 (YYYY-MM-DD)
                date_formatee = t.strftime('%Y-%m-%d')
                heure_formatee = t.strftime('%H:%M')
                # Formater la hauteur avec 2 décimales et remplacer le point par une virgule
                hauteur_formatee = f"{h:.2f}".replace('.', ',')
                # Formater la hauteur relative
                hauteur_relative_formatee = f"{h_rel:.2f}".replace('.', ',')
                
                writer.writerow([date_formatee, heure_formatee, hauteur_formatee, hauteur_relative_formatee])
        
        print(f"Les données de marée continues pour les 7 jours ont été exportées avec succès dans 'valeurs_maree_7jours.csv'")
        print(f"Le fichier contient {len(temps_courbe)} entrées (une toutes les 10 minutes)")
        
    except Exception as e:
        print(f"Erreur lors de l'exportation des données: {e}")
    
    # Extraire les temps et hauteurs pour le jour actuel pour l'affichage
    temps_marees = []
    hauteurs_marees = []
    
    for maree in jour_actuel["marées"]:
        h, m = extraire_heures_minutes(maree["heure"])
        temps_marees.append(date_reference + timedelta(hours=h, minutes=m))
        
        hauteur = convertir_hauteur(maree["hauteur"])
        hauteurs_marees.append(hauteur)
    
    # Calculer la courbe de marée pour le jour actuel (pour l'affichage)
    temps_courbe_jour, hauteurs_courbe_jour = calculer_courbe_maree(temps_marees, hauteurs_marees, date_reference)
    
    # Transformer les hauteurs pour qu'elles soient relatives au niveau de base
    hauteurs_courbe_relatives = [h - niveau_base for h in hauteurs_courbe_jour]
    hauteurs_marees_relatives = [h - niveau_base for h in hauteurs_marees]
    
    # Créer un graphique pour le jour actuel
    plt.figure(figsize=(12, 6))
    plt.plot(temps_courbe_jour, hauteurs_courbe_relatives, 'b-', linewidth=2)
    
    # Ajouter une ligne horizontale pour le niveau de base (0m relatif)
    plt.axhline(y=0, color='red', linestyle='-', alpha=0.5, label=f'Niveau de base ({niveau_base}m)')
    
    # Ajouter les points de marée réels
    for i, (t, h, h_rel, maree) in enumerate(zip(temps_marees, hauteurs_marees, hauteurs_marees_relatives, jour_actuel["marées"])):
        plt.scatter([t], [h_rel], color='red', s=50, zorder=5)
        
        # Ajouter des annotations pour les marées
        label = f"{maree['type']}\n{maree['heure']}\n{maree['hauteur']}"
        vert_pos = 10 if maree['type'] == "BM" else -30  # Position verticale selon le type
        
        plt.annotate(label, (t, h_rel), textcoords="offset points", 
                    xytext=(0, vert_pos), ha='center', fontsize=9)
    
    # Formatage de l'axe des X pour afficher les heures
    plt.gca().xaxis.set_major_formatter(mdates.DateFormatter('%Hh%M'))
    plt.gca().xaxis.set_major_locator(mdates.HourLocator(interval=2))
    
    # Définir les limites de l'axe X pour montrer toute la journée
    plt.xlim(date_reference, date_reference + timedelta(hours=24))
    
    # Ajouter le coefficient de marée si disponible
    coefficients = [m["coefficient"] for m in jour_actuel["marées"] if m["coefficient"]]
    if coefficients:
        coef_str = " - ".join(coefficients)
        plt.figtext(0.02, 0.02, f"Coefficient de marée: {coef_str}", fontsize=10)
    
    # Labels et titre
    plt.title(f'Prédiction de marée - {jour_actuel["jour_semaine"]} {jour_actuel["jour_num"]} (relatif à {niveau_base}m)')
    plt.xlabel('Heure')
    plt.ylabel(f'Hauteur relative au niveau {niveau_base}m')
    plt.grid(True)
    
    # Rotation des labels de l'axe X pour une meilleure lisibilité
    plt.xticks(rotation=45)
    
    plt.tight_layout()
    
    # Enregistrer et afficher
    try:
        plt.savefig('courbe_maree_jour_actuel.png')
        print("Courbe du jour actuel enregistrée dans 'courbe_maree_jour_actuel.png'")
    except Exception as e:
        print(f"Erreur lors de l'enregistrement de l'image: {e}")
    
    # Créer un graphique multi-jours (5 jours par défaut)
    graphique_multi_jours(donnees_semaine, niveau_base=niveau_base, jours_a_afficher=5, nom_fichier='courbe_maree_5jours.png')
    
    # Afficher les graphiques
    try:
        plt.show()
    except Exception as e:
        print(f"Avertissement: Impossible d'afficher le graphique: {e}")
        print("Les graphiques ont été enregistrés dans des fichiers image")

if __name__ == "__main__":
    try:
        main()
    except Exception as e:
        print(f"Une erreur est survenue: {e}")
        import traceback
        traceback.print_exc()