//assembler le fichier final words.csv

import { copyFileSync, existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { MAX_IKEA } from '../config.ts';
import type { IkeaName } from './2-parse-ikea.ts';
import type { City } from './3-fetch-cities.ts';
import type { IkeaPlace } from './4-verify-ikea-geo.ts';

//une ligne du CSV final
interface Row {
	name: string;
	type: 'ikea' | 'city' | 'both';
	country: string; //'' si inconnu
	lat: number | null;
	lng: number | null;
	cityDesc: string;
}

//charge un JSON intermédiaire.
function readJson<T>(file: string): T {
	return JSON.parse(readFileSync(join('data', file), 'utf-8')) as T;
}

//nettoyage du texte pour tenir sur une ligne csv
function cleanDesc(text: string): string {
	let t = text.replace(/\s+/g, ' ').replace(/;/g, ',').trim();
	//on coupe à la fin de la première phrase qui est relativement longue
	const end = t.indexOf('. ', 30);
	if (end !== -1) t = t.slice(0, end + 1);
	//longueur maximale raisonnable
	if (t.length > 240) t = t.slice(0, 239).trimEnd() + '…';
	return t;
}

//arrondit une coordonnée à 4 décimales pour lisibilité
function round(n: number | null): number | null {
	return n === null ? null : Number(n.toFixed(4));
}

//chargement des ressources

const ikeaNames = readJson<IkeaName[]>('ikea-names.json');
const cities = readJson<City[]>('cities.json');
const ikeaPlaces = readJson<IkeaPlace[]>('ikea-places.json');

const ikeaNameSet = new Set(ikeaNames.map((n) => n.name)); //tous les produits IKEA
const rows = new Map<string, Row>(); //clé = name, évite les doublons

//les grandes villes (étape 3) si le nom est aussi un produit IKEA -> both.
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

//les villages IKEA confirmés (étape 4) -> toujours both.
for (const p of ikeaPlaces) {
	if (rows.has(p.name)) continue; //déjà couvert par une ville
	rows.set(p.name, {
		name: p.name,
		type: 'both',
		country: p.country,
		lat: round(p.lat),
		lng: round(p.lng),
		cityDesc: cleanDesc(p.cityDesc)
	});
}

//tous les autres noms IKEA (pas de lieu associé) -> ikea.
for (const name of ikeaNameSet) {
	if (rows.has(name)) continue;
	rows.set(name, { name, type: 'ikea', country: '', lat: null, lng: null, cityDesc: '' });
}

//on sépare les lieux des meubles pour garder tous les lieux mais ajuster le nb de meumbles pour l'équilibrage
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

//écriture du csv (yippie)

//tri alphabétique
const sorted = [...places, ...ikeaOnly].sort((a, b) => a.name.localeCompare(b.name, 'sv'));

const header = 'name;type;country;lat;lng;cityDesc';
const lines = sorted.map((r) =>
	[r.name, r.type, r.country, r.lat ?? '', r.lng ?? '', r.cityDesc].join(';')
);
const csv = header + '\n' + lines.join('\n') + '\n';

//save de l'ancien fichier une fois au cas ou
const target = join('..', 'words.csv');
const backup = join('..', 'words.csv.bak');
if (existsSync(target) && !existsSync(backup)) {
	copyFileSync(target, backup);
}
writeFileSync(target, csv, 'utf-8');

//petit bilan affiché à l'utilisateur
const count = (t: string) => sorted.filter((r) => r.type === t).length;
console.log(
	`[5/5] ${sorted.length} mots écrits -> ${target} ` +
		`(ikea: ${count('ikea')}, city: ${count('city')}, both: ${count('both')}) ` +
		`| ancien fichier sauvegardé dans words.csv.bak`
);
