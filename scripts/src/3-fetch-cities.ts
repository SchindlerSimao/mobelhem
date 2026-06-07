//scrape the list of nordic cities

import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { COUNTRY_BY_QID, POP_MIN } from '../config.ts';
import { fetchJson } from './lib/http.ts';
import { frWikipediaSummary } from './lib/wikipedia.ts';

//shape of a city ready for the CSV.
export interface City {
	name: string; //example "HELSINKI"
	country: 'SE' | 'NO' | 'DK' | 'FI';
	lat: number;
	lng: number;
	cityDesc: string; //french description from wikipedia
}

//builds the SPARQL query for a given country
//for perf (after requests that flopped like crazy): we filter to start on the country, the
//population and the existence of a FR article. This lets us have fewer values in the result
//then we check that it's a human settlement (P31(is a)/P279* wd:Q486972) to get rid of regions and counties. (prob need some clarification during presentation)
function sparqlQuery(countryQid: string): string {
	return `
SELECT ?coordinate ?art ?population WHERE {
  {
    SELECT ?city (SAMPLE(?coord) AS ?coordinate) (SAMPLE(?article) AS ?art) (MAX(?pop) AS ?population) WHERE {
      ?city wdt:P17 wd:${countryQid} ;
            wdt:P1082 ?pop ;
            wdt:P625 ?coord .
      FILTER(?pop > ${POP_MIN})
      ?article schema:about ?city ; schema:isPartOf <https://fr.wikipedia.org/> .
    }
    GROUP BY ?city
  }
  ?city wdt:P31 ?type .
  ?type wdt:P279* wd:Q486972 .
}`;
}

//minimal type of a SPARQL response from Wikidata.
interface SparqlResponse {
	results: {
		bindings: Array<{
			coordinate?: { value: string };
			art?: { value: string }; //URL of the fr.wikipedia article
		}>;
	};
}

//extracts the article title from a Wikipedia URL.
//https://fr.wikipedia.org/wiki/Helsinki will be like "Helsinki"
function titleFromUrl(url: string): string {
	const segment = url.split('/wiki/')[1] ?? '';
	return decodeURIComponent(segment).replace(/_/g, ' ');
}


const cities: City[] = [];
const seen = new Set<string>(); //anti-duplicate by name

for (const [qid, countryCode] of Object.entries(COUNTRY_BY_QID)) {
	//SPARQL query for this country, we cache the response.
	const url =
		'https://query.wikidata.org/sparql?format=json&query=' +
		encodeURIComponent(sparqlQuery(qid));
	const data = await fetchJson<SparqlResponse>(url);
	const rows = data.results.bindings;
	console.log(`[3/5] ${countryCode} : ${rows.length} cities found (pop > ${POP_MIN})`);

	//for each city, we grab its french description (baguette)
	for (const row of rows) {
		const article = row.art?.value;
		const point = row.coordinate?.value;
		if (!article || !point) continue;

		//the article title serves both as name and as Wikipedia key
		const title = titleFromUrl(article);
		//name for the CSV : in uppercase, without suffix in parentheses
		//example : "Vasa (Finlande)" becomes "VASA"
		const name = title
			.replace(/\s*\(.*\)\s*$/, '')
			.trim()
			.toUpperCase();
		if (!name || seen.has(name)) continue;

		//coordinates, the WKT format is Point(longitude latitude)
		const coords = point.match(/Point\(([-\d.]+) ([-\d.]+)\)/);
		if (!coords) continue;
		const lng = parseFloat(coords[1]);
		const lat = parseFloat(coords[2]);

		//french description via Wikipedia.
		const summary = await frWikipediaSummary(title);
		if (!summary) continue; //no description -> we skip the city

		seen.add(name);
		cities.push({ name, country: countryCode, lat, lng, cityDesc: summary.extract });
	}
}

const output = join('data', 'cities.json');
writeFileSync(output, JSON.stringify(cities, null, 2), 'utf-8');
console.log(`[3/5] ${cities.length} cities in total with description -> ${output}`);
