//confirmer les villages IKEA pour les types "both"

import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { COUNTRY_BY_QID } from '../config.ts';
import { fetchJson } from './lib/http.ts';
import { frWikipediaSummary } from './lib/wikipedia.ts';
import type { IkeaName } from './2-parse-ikea.ts';
import type { City } from './3-fetch-cities.ts';

//un village IKEA confirmé
export interface IkeaPlace {
	name: string; //nom IKEA en maj
	country: 'SE' | 'NO' | 'DK' | 'FI';
	lat: number;
	lng: number;
	cityDesc: string;
}

//construit la requête SPARQL de vérification pour un libellé donné
//renvoie tous les candidats car un même nom peut désigner
//plusieurs lieux (genre il existe plusieurs "Hemnes" en Norvège ce qui m'a fait arraché mes cheveux) On choisira
//ensuite le bon en JS.
function verifyQuery(label: string): string {
	//on échappe les éventuels guillemets/antislashs du libellé
	const safe = label.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
	//on teste le libellé dans les langues nordiques + anglais/allemand.
	const langs = ['sv', 'nb', 'nn', 'no', 'fi', 'da', 'en', 'de'];
	const values = langs.map((l) => `"${safe}"@${l}`).join(' ');
	return `
SELECT ?city ?countryItem ?coord ?article WHERE {
  VALUES ?label { ${values} }
  ?city rdfs:label ?label .
  VALUES ?countryItem { wd:Q34 wd:Q20 wd:Q35 wd:Q33 }
  ?city wdt:P17 ?countryItem .
  ?city wdt:P31/wdt:P279* wd:Q486972 .
  ?city wdt:P625 ?coord .
  OPTIONAL { ?article schema:about ?city ; schema:isPartOf <https://fr.wikipedia.org/> . }
}
LIMIT 20`;
}

//type minimal d'une réponse SPARQL.
interface SparqlResponse {
	results: {
		bindings: Array<{
			city?: { value: string }; // .../entity/Q...
			countryItem?: { value: string }; // .../entity/Q34
			coord?: { value: string }; //point(LNG LAT)
			article?: { value: string }; //URL fr.wikipedia
		}>;
	};
}

//un candidat "lieu" renvoyé par Wikidata.
interface Candidate {
	country: 'SE' | 'NO' | 'DK' | 'FI';
	lat: number;
	lng: number;
	article: string | null;
}

//extrait le titre d'article depuis une URL Wikipédia.
function titleFromUrl(url: string): string {
	const segment = url.split('/wiki/')[1] ?? '';
	return decodeURIComponent(segment).replace(/_/g, ' ');
}

const ikeaNames: IkeaName[] = JSON.parse(readFileSync(join('data', 'ikea-names.json'), 'utf-8'));
const cities: City[] = JSON.parse(readFileSync(join('data', 'cities.json'), 'utf-8'));
const cityNames = new Set(cities.map((c) => c.name)); //déjà traitées à l'étape 3

//on garde que les noms géographiques pas déjà couverts par les villes
const candidates = ikeaNames.filter((n) => n.isGeo && !cityNames.has(n.name));
console.log(`[4/5] ${candidates.length} noms géographiques IKEA à vérifier...`);

const places: IkeaPlace[] = [];
let done = 0;

for (const candidate of candidates) {
	done++;
	if (done % 50 === 0) console.log(`[4/5]   ... ${done}/${candidates.length}`);

	//libellé à chercher = le nom en casse propre tiré du lien Maps de lar5
	//sinon une approximation (1re lettre majuscule)
	const label =
		candidate.placeName ??
		candidate.name.charAt(0) + candidate.name.slice(1).toLowerCase();

	const url =
		'https://query.wikidata.org/sparql?format=json&query=' +
		encodeURIComponent(verifyQuery(label));

	let data: SparqlResponse;
	try {
		data = await fetchJson<SparqlResponse>(url);
	} catch {
		continue; //erreur réseau ponctuelle -> on passe ce nom
	}

	//on transforme chaque ligne en candidat exploitable
	const found: Candidate[] = [];
	for (const row of data.results.bindings) {
		const qid = (row.countryItem?.value ?? '').split('/').pop() ?? '';
		const country = COUNTRY_BY_QID[qid];
		const coords = (row.coord?.value ?? '').match(/Point\(([-\d.]+) ([-\d.]+)\)/);
		if (!country || !coords) continue;
		found.push({
			country,
			lng: parseFloat(coords[1]),
			lat: parseFloat(coords[2]),
			article: row.article ? row.article.value : null
		});
	}
	if (found.length === 0) continue; //pas une localité nordique -> écarté (genre lac, îles)

	//un nom peut avoir plusieurs lieux on cherche donc les points geo les plus proches
	const ref = candidate; //coords de référence venant de lar5
	const best =
		ref.lat !== null && ref.lng !== null
			? found.reduce((a, b) => {
					const dist = (c: Candidate) =>
						(c.lat - ref.lat!) ** 2 + (c.lng - ref.lng!) ** 2;
					return dist(b) < dist(a) ? b : a;
				})
			: found[0];

	//description française : via l'article Wikipédia s'il existe, sinon on
	//tente directement avec le libellé
	const title = best.article ? titleFromUrl(best.article) : label;
	const summary = await frWikipediaSummary(title);
	const cityDesc = summary?.extract ?? '';

	places.push({ name: candidate.name, country: best.country, lat: best.lat, lng: best.lng, cityDesc });
}

const output = join('data', 'ikea-places.json');
writeFileSync(output, JSON.stringify(places, null, 2), 'utf-8');
console.log(`[4/5] ${places.length} villages IKEA confirmés comme localités (type=both) -> ${output}`);
