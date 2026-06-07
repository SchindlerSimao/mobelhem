//confirm the IKEA villages for the "both" types

import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { COUNTRY_BY_QID } from '../config.ts';
import { fetchJson } from './lib/http.ts';
import { frWikipediaSummary } from './lib/wikipedia.ts';
import type { IkeaName } from './2-parse-ikea.ts';
import type { City } from './3-fetch-cities.ts';

//a confirmed IKEA village
export interface IkeaPlace {
	name: string; //IKEA name in upper
	country: 'SE' | 'NO' | 'DK' | 'FI';
	lat: number;
	lng: number;
	cityDesc: string;
}

//builds the SPARQL verification query for a given label
//returns all the candidates because the same name can designate
//several places (like there are several "Hemnes" in Norway which made me tear out my hair) We will then choose
//the right one in JS.
function verifyQuery(label: string): string {
	//we escape the possible quotes/backslashes of the label
	const safe = label.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
	//we test the label in the nordic languages + english/german.
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

//minimal type of a SPARQL response.
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

//a "place" candidate returned by Wikidata.
interface Candidate {
	country: 'SE' | 'NO' | 'DK' | 'FI';
	lat: number;
	lng: number;
	article: string | null;
}

//extracts the article title from a Wikipedia URL.
function titleFromUrl(url: string): string {
	const segment = url.split('/wiki/')[1] ?? '';
	return decodeURIComponent(segment).replace(/_/g, ' ');
}

const ikeaNames: IkeaName[] = JSON.parse(readFileSync(join('data', 'ikea-names.json'), 'utf-8'));
const cities: City[] = JSON.parse(readFileSync(join('data', 'cities.json'), 'utf-8'));
const cityNames = new Set(cities.map((c) => c.name)); //already handled at step 3

//we only keep the geographic names not already covered by the cities
const candidates = ikeaNames.filter((n) => n.isGeo && !cityNames.has(n.name));
console.log(`[4/5] ${candidates.length} IKEA geographic names to verify...`);

const places: IkeaPlace[] = [];
let done = 0;

for (const candidate of candidates) {
	done++;
	if (done % 50 === 0) console.log(`[4/5]   ... ${done}/${candidates.length}`);

	//label to search = the name in proper case taken from the lar5 Maps link
	//otherwise an approximation (1st letter uppercase)
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
		continue; //occasional network error -> we skip this name
	}

	//we transform each row into a usable candidate
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
	if (found.length === 0) continue; //not a nordic locality -> discarded (like lake, islands)

	//a name can have several places so we look for the closest geo points
	const ref = candidate; //reference coords coming from lar5
	const best =
		ref.lat !== null && ref.lng !== null
			? found.reduce((a, b) => {
					const dist = (c: Candidate) =>
						(c.lat - ref.lat!) ** 2 + (c.lng - ref.lng!) ** 2;
					return dist(b) < dist(a) ? b : a;
				})
			: found[0];

	//french description : via the Wikipedia article if it exists, otherwise we
	//try directly with the label
	const title = best.article ? titleFromUrl(best.article) : label;
	const summary = await frWikipediaSummary(title);
	const cityDesc = summary?.extract ?? '';

	places.push({ name: candidate.name, country: best.country, lat: best.lat, lng: best.lng, cityDesc });
}

const output = join('data', 'ikea-places.json');
writeFileSync(output, JSON.stringify(places, null, 2), 'utf-8');
console.log(`[4/5] ${places.length} IKEA villages confirmed as localities (type=both) -> ${output}`);
