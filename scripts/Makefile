# Typical usage:
#     make install - installs the dependencies (only once)
#     make all - runs the whole pipeline and generates ../words.csv

NODE = node --disable-warning=ExperimentalWarning

.PHONY: all install fetch parse cities geo build clean

#complete pipeline in order
all: fetch parse cities geo build

#install the deps (Cheerio)
install:
	npm install

#1) download the lar5 page (list of IKEA names).
fetch:
	$(NODE) src/1-fetch-ikea.ts

#2) : extract the IKEA names from the page.
parse:
	$(NODE) src/2-parse-ikea.ts

#3) : scrape the nordic cities (Wikidata + Wikipedia).
cities:
	$(NODE) src/3-fetch-cities.ts

#4) : confirm the IKEA villages (type=both).
geo:
	$(NODE) src/4-verify-ikea-geo.ts

#5) : assemble the final words.csv (overwrites ../words.csv, backup .bak).
build:
	$(NODE) src/5-build-csv.ts

#cleanup = we empty the cache of network responses (forces a re-download)
clean:
	rm -rf data/raw
