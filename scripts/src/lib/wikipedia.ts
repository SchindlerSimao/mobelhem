//petit client pour l'API "summary" de Wikipedia FR

import { fetchJson } from './http.ts';

//ce que l'on garde d'un article Wikipédia
export interface WikiSummary {
	extract: string; //résumé en français (1 à 2 phrases)
	lat: number | null; //latitude si l'article en a
	lng: number | null; //longitude si l'article en a
}

//interroge Wikipédia FR pour un titre d'article donné
//renvoie null si l'article n'existe pas ou n'a pas de résumé exploitable
export async function frWikipediaSummary(title: string): Promise<WikiSummary | null> {
	//le titre doit être encodé pour l'URL (espaces, accents, etc.)
	const url = `https://fr.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`;

	try {
		//fetchJson lève une erreur si la page n'existe pas (HTTP 404)
		const data = await fetchJson<{
			type?: string;
			extract?: string;
			coordinates?: { lat: number; lon: number };
		}>(url);

		const extract = (data.extract ?? '').trim();
		if (!extract) return null; //article vide -> inutile

		return {
			extract,
			lat: data.coordinates?.lat ?? null,
			lng: data.coordinates?.lon ?? null
		};
	} catch {
		//404 ou JSON invalide -> on considère qu'il n'y a pas d'article
		return null;
	}
}
