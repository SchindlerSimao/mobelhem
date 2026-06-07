//small client for the "summary" API of Wikipedia FR

import { fetchJson } from './http.ts';

//what we keep from a Wikipedia article
export interface WikiSummary {
	extract: string; //summary in french (1 to 2 sentences)
	lat: number | null; //latitude if the article has one
	lng: number | null; //longitude if the article has one
}

//queries Wikipedia FR for a given article title
//returns null if the article doesn't exist or doesn't have a usable summary
export async function frWikipediaSummary(title: string): Promise<WikiSummary | null> {
	//the title must be encoded for the URL (spaces, accents, etc.)
	const url = `https://fr.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`;

	try {
		//fetchJson throws an error if the page doesn't exist (HTTP 404)
		const data = await fetchJson<{
			type?: string;
			extract?: string;
			coordinates?: { lat: number; lon: number };
		}>(url);

		const extract = (data.extract ?? '').trim();
		if (!extract) return null; //empty article -> useless

		return {
			extract,
			lat: data.coordinates?.lat ?? null,
			lng: data.coordinates?.lon ?? null
		};
	} catch {
		//404 or invalid JSON -> we consider there is no article
		return null;
	}
}
