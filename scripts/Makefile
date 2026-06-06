# Usage typique :
#     make install - installe les dépendances (une seule fois)
#     make all - lance tout le pipeline et génère ../words.csv

NODE = node --disable-warning=ExperimentalWarning

.PHONY: all install fetch parse cities geo build clean

#pipeline complet dans l'ordre
all: fetch parse cities geo build

#install les deps (Cheerio)
install:
	npm install

#1) télécharger la page lar5 (liste des noms IKEA).
fetch:
	$(NODE) src/1-fetch-ikea.ts

#2) : extraire les noms IKEA de la page.
parse:
	$(NODE) src/2-parse-ikea.ts

#3) : scraper les villes nordiques (Wikidata + Wikipédia).
cities:
	$(NODE) src/3-fetch-cities.ts

#4) : confirmer les villages IKEA (type=both).
geo:
	$(NODE) src/4-verify-ikea-geo.ts

#5) : assembler le words.csv final (écrase ../words.csv, backup .bak).
build:
	$(NODE) src/5-build-csv.ts

#nettoyage = on vide le cache des réponses réseau (force un re-téléchargement)
clean:
	rm -rf data/raw
