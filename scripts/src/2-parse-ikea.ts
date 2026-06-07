//analyse the lar5 page and extract the list of IKEA names from it

import { load } from 'cheerio';
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

//shape of an entry extracted from lar5.
export interface IkeaName {
	name: string; //example : "KALLAX"
	isGeo: boolean; //true if the category is "geographic"
	placeName: string | null; //name of the place in proper case so we can use it later with Wikidata
	meaning: string; //short explanation
	lat: number | null; //latitude read on the Google Maps link, only for places
	lng: number | null; //longitude idem
}

const html = readFileSync(join('data', 'raw', 'lar5.html'), 'utf-8');
const $ = load(html);

const names: IkeaName[] = [];
const seen = new Set<string>(); //to avoid duplicates

//each entry is a div containing a link to the IKEA search
//we go through all the divs and we only keep those.
$('div').each((_, element) => {
	const div = $(element);
	const link = div.find('a').first();
	const href = link.attr('href') ?? '';

	//ignore the divs that are not a product entry
	if (!href.includes('query=')) return;

	const name = link.text().trim();
	if (!name || seen.has(name)) return;
	seen.add(name);

	//the category is carried by the CSS class of the first span.
	//"gr" = geographic => real place.
	const categoryClass = div.find('span').first().attr('class') ?? '';
	const isGeo = categoryClass === 'gr';

	//for places, lar5 adds a Google Maps link of the form
	//maps?q=Name@LAT,LNG&
	//we grab two things : the lat/lng coordinates and the name from the link in proper case, to query Wikidata
	let lat: number | null = null;
	let lng: number | null = null;
	let placeName: string | null = null;
	const mapHref = div.find('a[href*="maps?q="]').attr('href') ?? '';
	const mapMatch = mapHref.match(/q=([^@]+)@(-?\d+\.?\d*),(-?\d+\.?\d*)/);
	if (mapMatch) {
		placeName = decodeURIComponent(mapMatch[1]).trim();
		lat = parseFloat(mapMatch[2]);
		lng = parseFloat(mapMatch[3]);
	}

	//all the text of the div without the name
	const meaning = div.text().replace(name, '').trim();

	names.push({ name, isGeo, placeName, meaning, lat, lng });
});

//save of the result for the next step.
const output = join('data', 'ikea-names.json');
writeFileSync(output, JSON.stringify(names, null, 2), 'utf-8');

const geoCount = names.filter((n) => n.isGeo).length;
console.log(
	`[2/5] ${names.length} IKEA names extracted (of which ${geoCount} geographic) -> ${output}`
);
