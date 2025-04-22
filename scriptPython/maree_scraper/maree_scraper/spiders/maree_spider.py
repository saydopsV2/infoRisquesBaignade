import scrapy
from scrapy_playwright.page import PageMethod


class MareeSpider(scrapy.Spider):
    name = "maree"
    start_urls = ["https://maree.info/137"]

    def start_requests(self):
        yield scrapy.Request(
            url=self.start_urls[0],
            meta={
                "playwright": True,
                "playwright_include_page": True,
                "playwright_page_methods": [
                    PageMethod("wait_for_selector", "table#MareeJourDetail_0 td"),
                ],
            },
            callback=self.parse,
        )

    def parse(self, response):
        self.logger.info("Page chargée : %s", response.url)

        rows = response.xpath('//table[@id="MareeJourDetail_0"]//tr[td]')
        if not rows:
            self.logger.warning("Aucune ligne trouvée dans la table")

        for row in rows:
            cols = row.xpath(".//td")
            if len(cols) < 10:
                continue  # Ignore lignes incomplètes

            yield {
                "marée": cols[0].xpath("string(.)").get().strip(),
                "coefficient": cols[1].xpath("string(.)").get().strip(),
                "heures": cols[2].xpath("string(.)").get().strip(),
                "durée": cols[3].xpath("string(.)").get().strip(),
                "heure_marée": cols[4].xpath("string(.)").get().strip(),
                "hauteur": cols[5].xpath("string(.)").get().strip(),
                "marnage": cols[6].xpath("string(.)").get().strip(),
                "un_douzieme": cols[7].xpath("string(.)").get().strip(),
                "un_quart": cols[8].xpath("string(.)").get().strip(),
                "demi": cols[9].xpath("string(.)").get().strip(),
            }
