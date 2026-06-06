//analyser la page lar5 et en extraire la liste des noms IKEA

import { load } from 'cheerio';
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

//forme d'une entrée extraite de lar5.
export interface IkeaName {
	name: string; //exemple : "KALLAX"
	isGeo: boolean; //true si la catégorie est "geographic"
	placeName: string | null; //nom du lieu en casse propre afin de l'utiliser après avec Wikidata
	meaning: string; //courte explication
	lat: number | null; //latitude lue sur le lien Google Maps, seulement pour lieux
	lng: number | null; //longitude idem
}

const html = readFileSync(join('data', 'raw', 'lar5.html'), 'utf-8');
const $ = load(html);

const names: IkeaName[] = [];
const seen = new Set<string>(); //pour éviter les doublons

//chaque entrée est une div contenant un lien vers la recherche IKEA
//on parcourt tous les divs et on ne garde que ceux-là.
$('div').each((_, element) => {
	const div = $(element);
	const link = div.find('a').first();
	const href = link.attr('href') ?? '';

	//ignore les divs qui sont pas une entrée produit
	if (!href.includes('query=')) return;

	const name = link.text().trim();
	if (!name || seen.has(name)) return;
	seen.add(name);

	//la catégorie est portée par la classe CSS du premier span.
	//"gr" = geographic => lieu réel.
	const categoryClass = div.find('span').first().attr('class') ?? '';
	const isGeo = categoryClass === 'gr';

	//pour les lieux, lar5 ajoute un lien Google Maps de la forme
	//maps?q=Nom@LAT,LNG&
	//on récupp deux choses : les coordonnées lat/lng et le nom du lien en casse propre, pour interroger Wikidata
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

	//tout le texte de la div sans le nom
	const meaning = div.text().replace(name, '').trim();

	names.push({ name, isGeo, placeName, meaning, lat, lng });
});

//sauvegarde du résultat pour l'étape suivante.
const output = join('data', 'ikea-names.json');
writeFileSync(output, JSON.stringify(names, null, 2), 'utf-8');

const geoCount = names.filter((n) => n.isGeo).length;
console.log(
	`[2/5] ${names.length} noms IKEA extraits (dont ${geoCount} géographiques) -> ${output}`
);
