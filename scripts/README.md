# Data Scraper

Pipeline reproductible pour générer `words.csv` à partir de sources gratuites (sans API key, sans IA).

## Sources de données

- **lar5.com** - "The IKEA Dictionary" (~1300 noms de produits IKEA)
- **Wikidata** - Requêtes SPARQL pour les villes nordiques (coordonnées, pays)
- **Wikipedia (FR)** - API REST pour les descriptions en français

## Pipeline en 5 étapes

| Étape     | Commande                          | Description                                        |
| --------- | --------------------------------- | -------------------------------------------------- |
| 1. Fetch  | `make fetch` ou `npm run fetch`   | Télécharge la page lar5.com                        |
| 2. Parse  | `make parse` ou `npm run parse`   | Extrait les noms IKEA avec Cheerio                 |
| 3. Cities | `make cities` ou `npm run cities` | Interroge Wikidata (SPARQL) + Wikipedia            |
| 4. Geo    | `make geo` ou `npm run geo`       | Vérifie les noms IKEA qui sont aussi des localités |
| 5. Build  | `make build` ou `npm run build`   | Assemble `words.csv` final                         |

## Utilisation

```bash
# Installation (une seule fois)
make install

# Exécuter tout le pipeline
make all

# Ou étape par étape
make fetch
make parse
make cities
make geo
make build

# Nettoyer le cache (force re-téléchargement)
make clean
```

Alternativement avec npm:

```bash
npm install
npm run fetch && npm run parse && npm run cities && npm run geo && npm run build
```

## Structure des données

### Fichiers intermédiaires (`data/`)

- `raw/lar5.html` - Page brute téléchargée
- `ikea-names.json` - Noms IKEA extraits
- `cities.json` - Villes nordiques avec descriptions
- `ikea-places.json` - Noms IKEA confirmés comme localités (type=both)

### Format CSV final

```csv
name;type;country;lat;lng;cityDesc
AALBORG;city;DK;57.05;9.9167;Aalborg est une ville du Danemark...
ABSORB;ikea;;;;
ASKER;both;NO;59.8353;10.435;Asker est une localité de Norvège...
```

| Champ      | Type   | Description                               |
| ---------- | ------ | ----------------------------------------- | ------ | ----------------- |
| `name`     | string | Nom en MAJUSCULES                         |
| `type`     | enum   | `ikea`                                    | `city` | `both` (les deux) |
| `country`  | string | Code pays (SE/NO/DK/FI) ou vide           |
| `lat`      | number | Latitude (4 décimales) ou vide            |
| `lng`      | number | Longitude (4 décimales) ou vide           |
| `cityDesc` | string | Description en français (pour les villes) |

## Configuration

Éditez `config.ts` pour modifier:

- `POP_MIN` - Population minimale des villes (défaut: 50000)
- `MAX_IKEA` - Nombre max de meubles IKEA (défaut: 250)
- `COUNTRY_BY_QID` - Pays nordiques à inclure
- `USER_AGENT` - Identifiant pour les requêtes HTTP
- `REQUEST_DELAY_MS` - Délai entre requêtes (défaut: 1100ms)

## Architecture technique

### SPARQL & Wikidata

Wikidata utilise un modèle de données basé sur des identifiants:

- **Q** = entités (Q34 = Suède, Q486972 = établissement humain)
- **P** = propriétés (P31 = "est une", P17 = "pays", P625 = "coordonnées")

La requête SPARQL vérifie qu'une localité est bien une ville (via P31/P279\* hiérarchie) et récupère ses coordonnées officielles.

### Cache

Chaque réponse réseau est mise en cache dans `data/raw/`. Relancer le pipeline est instantané et 100% reproductible.

## Notes

- Respect des rate limits avec `USER_AGENT` identifiable
- Délai configurable entre requêtes pour ne pas surcharger les serveurs gratuits
- Gestion des ambiguïtés (ex: plusieurs "Hemnes" en Norvège → on garde le plus proche des coordonnées lar5)
- Backup automatique de `words.csv` existant vers `words.csv.bak`
