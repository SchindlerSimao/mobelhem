//scraper la list des villes nordquies

import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { COUNTRY_BY_QID, POP_MIN } from '../config.ts';
import { fetchJson } from './lib/http.ts';
import { frWikipediaSummary } from './lib/wikipedia.ts';

//forme d'une ville prête pour le CSV.
export interface City {
	name: string; //exemple "HELSINKI"
	country: 'SE' | 'NO' | 'DK' | 'FI';
	lat: number;
	lng: number;
	cityDesc: string; //description française de wikipedia
}

//construit la requête SPARQL pour un pays donné
//pour la perfo (après des requêtes qui ont flop de zinzin): on filtre pour commencer sur le pays, la
//population et l'existence d'un article FR. Ca permet d'avoir moins de values en résultat
//après on verif que c'est un établissement humain (P31/P279* wd:Q486972) pour dégager les régions et comtés.
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

//type minimal d'une réponse SPARQL de Wikidata.
interface SparqlResponse {
	results: {
		bindings: Array<{
			coordinate?: { value: string };
			art?: { value: string }; //URL de l'article fr.wikipedia
		}>;
	};
}

//extrait le titre d'article depuis une URL Wikipédia.
//https://fr.wikipedia.org/wiki/Helsinki ça sera genre "Helsinki"
function titleFromUrl(url: string): string {
	const segment = url.split('/wiki/')[1] ?? '';
	return decodeURIComponent(segment).replace(/_/g, ' ');
}


const cities: City[] = [];
const seen = new Set<string>(); //anti-doublon par nom

for (const [qid, countryCode] of Object.entries(COUNTRY_BY_QID)) {
	//requête SPARQL pour ce pays, on met la réponse en cache.
	const url =
		'https://query.wikidata.org/sparql?format=json&query=' +
		encodeURIComponent(sparqlQuery(qid));
	const data = await fetchJson<SparqlResponse>(url);
	const rows = data.results.bindings;
	console.log(`[3/5] ${countryCode} : ${rows.length} villes trouvées (pop > ${POP_MIN})`);

	//pour chaque ville, on recup sa description française (baguette)
	for (const row of rows) {
		const article = row.art?.value;
		const point = row.coordinate?.value;
		if (!article || !point) continue;

		//le titre de l'article sert à la fois de nom et de clé Wikipédia
		const title = titleFromUrl(article);
		//nom pour le CSV : en majuscules, sans suffixe entre parenthèses
		//exemple : "Vasa (Finlande)" devient "VASA"
		const name = title
			.replace(/\s*\(.*\)\s*$/, '')
			.trim()
			.toUpperCase();
		if (!name || seen.has(name)) continue;

		//coordonnées, le format WKT est Point(longitude latitude)
		const coords = point.match(/Point\(([-\d.]+) ([-\d.]+)\)/);
		if (!coords) continue;
		const lng = parseFloat(coords[1]);
		const lat = parseFloat(coords[2]);

		//description française via Wikipédia.
		const summary = await frWikipediaSummary(title);
		if (!summary) continue; //pas de description -> on saute la ville

		seen.add(name);
		cities.push({ name, country: countryCode, lat, lng, cityDesc: summary.extract });
	}
}

const output = join('data', 'cities.json');
writeFileSync(output, JSON.stringify(cities, null, 2), 'utf-8');
console.log(`[3/5] ${cities.length} villes au total avec description -> ${output}`);
