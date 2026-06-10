# Data Scraper

Reproducible pipeline to generate `words.csv` from free sources (no API key, no AI).

## Data sources

- **lar5.com** - "The IKEA Dictionary" (~1300 IKEA product names)
- **Wikidata** - SPARQL queries for Nordic cities (coordinates, country)
- **Wikipedia (FR)** - REST API for the French descriptions

## 5-step pipeline

| Step      | Command                           | Description                                 |
| --------- | --------------------------------- | ------------------------------------------- |
| 1. Fetch  | `make fetch` or `npm run fetch`   | Downloads the lar5.com page                 |
| 2. Parse  | `make parse` or `npm run parse`   | Extracts the IKEA names with Cheerio        |
| 3. Cities | `make cities` or `npm run cities` | Queries Wikidata (SPARQL) + Wikipedia       |
| 4. Geo    | `make geo` or `npm run geo`       | Checks which IKEA names are also localities |
| 5. Build  | `make build` or `npm run build`   | Assembles the final `words.csv`             |

## Usage

```bash
# Install (once)
make install

# Run the whole pipeline
make all

# Or step by step
make fetch
make parse
make cities
make geo
make build

# Clean the cache (forces a re-download)
make clean
```

Alternatively with npm:

```bash
npm install
npm run fetch && npm run parse && npm run cities && npm run geo && npm run build
```

## Data structure

### Intermediate files (`data/`)

- `raw/lar5.html` - Raw downloaded page
- `ikea-names.json` - Extracted IKEA names
- `cities.json` - Nordic cities with descriptions
- `ikea-places.json` - IKEA names confirmed as localities (type=both)

### Final CSV format

```csv
name;type;country;lat;lng;cityDesc
AALBORG;city;DK;57.05;9.9167;Aalborg est une ville du Danemark...
ABSORB;ikea;;;;
ASKER;both;NO;59.8353;10.435;Asker est une localité de Norvège...
```

| Field      | Type   | Description                         |
| ---------- | ------ | ----------------------------------- |
| `name`     | string | Uppercase name                      |
| `type`     | enum   | `ikea`, `city`, or `both`           |
| `country`  | string | Country code (SE/NO/DK/FI) or empty |
| `lat`      | number | Latitude (4 decimals) or empty      |
| `lng`      | number | Longitude (4 decimals) or empty     |
| `cityDesc` | string | French description (for cities)     |

## Configuration

Edit `config.ts` to change:

- `POP_MIN` - Minimum city population (default: 50000)
- `MAX_IKEA` - Max number of IKEA furniture items (default: 250)
- `COUNTRY_BY_QID` - Nordic countries to include
- `USER_AGENT` - Identifier for the HTTP requests
- `REQUEST_DELAY_MS` - Delay between requests (default: 1100ms)

## Technical details

### SPARQL & Wikidata

Wikidata uses an identifier-based data model:

- **Q** = entities (Q34 = Sweden, Q486972 = human settlement)
- **P** = properties (P31 = "instance of", P17 = "country", P625 = "coordinates")

The SPARQL query checks that a place is really a city (via the P31/P279\* hierarchy) and retrieves its official coordinates.

### Cache

Every network response is cached in `data/raw/`. Re-running the pipeline is instant and 100% reproducible.

## Notes

- Rate limits respected with an identifiable `USER_AGENT`
- Configurable delay between requests to avoid overloading the free servers
- Ambiguity handling (e.g. several "Hemnes" in Norway → we keep the one closest to the lar5 coordinates)
- Automatic backup of the existing `words.csv` to `words.csv.bak`
