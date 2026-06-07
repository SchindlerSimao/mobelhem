//assemble the final words.csv file

import { copyFileSync, existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { MAX_IKEA } from '../config.ts';
import type { IkeaName } from './2-parse-ikea.ts';
import type { City } from './3-fetch-cities.ts';
import type { IkeaPlace } from './4-verify-ikea-geo.ts';

//a row of the final CSV
interface Row {
	name: string;
	type: 'ikea' | 'city' | 'both';
	country: string; //'' if unknown
	lat: number | null;
	lng: number | null;
	cityDesc: string;
}

//loads an intermediate JSON.
function readJson<T>(file: string): T {
	return JSON.parse(readFileSync(join('data', file), 'utf-8')) as T;
}

//cleanup of the text to fit on one csv line
function cleanDesc(text: string): string {
	let t = text.replace(/\s+/g, ' ').replace(/;/g, ',').trim();
	//we cut at the end of the first sentence that is relatively long
	const end = t.indexOf('. ', 30);
	if (end !== -1) t = t.slice(0, end + 1);
	//reasonable maximum length
	if (t.length > 240) t = t.slice(0, 239).trimEnd() + '…';
	return t;
}

//rounds a coordinate to 4 decimals for readability
function round(n: number | null): number | null {
	return n === null ? null : Number(n.toFixed(4));
}

//loading of the resources

const ikeaNames = readJson<IkeaName[]>('ikea-names.json');
const cities = readJson<City[]>('cities.json');
const ikeaPlaces = readJson<IkeaPlace[]>('ikea-places.json');

const ikeaNameSet = new Set(ikeaNames.map((n) => n.name)); //all the IKEA products
const rows = new Map<string, Row>(); //key = name, avoids duplicates

//the big cities (step 3) if the name is also an IKEA product -> both.
for (const c of cities) {
	rows.set(c.name, {
		name: c.name,
		type: ikeaNameSet.has(c.name) ? 'both' : 'city',
		country: c.country,
		lat: round(c.lat),
		lng: round(c.lng),
		cityDesc: cleanDesc(c.cityDesc)
	});
}

//the confirmed IKEA villages (step 4) -> always both.
for (const p of ikeaPlaces) {
	if (rows.has(p.name)) continue; //already covered by a city
	rows.set(p.name, {
		name: p.name,
		type: 'both',
		country: p.country,
		lat: round(p.lat),
		lng: round(p.lng),
		cityDesc: cleanDesc(p.cityDesc)
	});
}

//all the other IKEA names (no associated place) -> ikea.
for (const name of ikeaNameSet) {
	if (rows.has(name)) continue;
	rows.set(name, { name, type: 'ikea', country: '', lat: null, lng: null, cityDesc: '' });
}

//we separate the places from the furnitures to keep all the places but adjust the nb of furnitures for the balancing
const all = [...rows.values()];
const places = all.filter((r) => r.type !== 'ikea');
let ikeaOnly = all
	.filter((r) => r.type === 'ikea')
	.sort((a, b) => a.name.localeCompare(b.name, 'sv'));

if (ikeaOnly.length > MAX_IKEA) {
	const step = ikeaOnly.length / MAX_IKEA;
	const sample: Row[] = [];
	for (let i = 0; i < MAX_IKEA; i++) sample.push(ikeaOnly[Math.floor(i * step)]);
	ikeaOnly = sample;
}

//writing of the csv (yippie)

//alphabetical sort
const sorted = [...places, ...ikeaOnly].sort((a, b) => a.name.localeCompare(b.name, 'sv'));

const header = 'name;type;country;lat;lng;cityDesc';
const lines = sorted.map((r) =>
	[r.name, r.type, r.country, r.lat ?? '', r.lng ?? '', r.cityDesc].join(';')
);
const csv = header + '\n' + lines.join('\n') + '\n';

//save of the old file once just in case
const target = join('..', 'words.csv');
const backup = join('..', 'words.csv.bak');
if (existsSync(target) && !existsSync(backup)) {
	copyFileSync(target, backup);
}
writeFileSync(target, csv, 'utf-8');

//small summary displayed to the user
const count = (t: string) => sorted.filter((r) => r.type === t).length;
console.log(
	`[5/5] ${sorted.length} words written -> ${target} ` +
		`(ikea: ${count('ikea')}, city: ${count('city')}, both: ${count('both')}) ` +
		`| old file saved in words.csv.bak`
);
