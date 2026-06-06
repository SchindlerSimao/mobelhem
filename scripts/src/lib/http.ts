// ===========================================================================
//  Petit utilitaire HTTP « poli » avec cache sur disque
//  ---------------------------------------------------------------------------
//  Deux idées simples :
//   1. CACHE : chaque URL téléchargée est sauvegardée dans data/raw/. Si on
//      relance le scraper, on relit le fichier au lieu de re-télécharger.
//      -> exécution reproductible ET rapide.
//   2. POLITESSE : on s'identifie (User-Agent) et on attend un court instant
//      entre deux vraies requêtes réseau.
// ===========================================================================

//utilitaire HTTP avec cache sur disque : quand restart scraper on relit le fichier data/raw au lieu de re download

import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { REQUEST_DELAY_MS, USER_AGENT } from '../../config.ts';

//dossier où l'on stocke toutes les réponses brutes (cache).
const CACHE_DIR = join('data', 'raw');
mkdirSync(CACHE_DIR, { recursive: true });

//transforme une URL en un nom de fichier de cache à la fois lisible et unique.
//exemple : https://fr.wikipedia.org/.../Kallax -> fr_wikipedia_org_..._a1b2c3.cache
function cacheFile(url: string): string {
	//empreinte courte de l'URL -> garantit l'unicité même si les URLS commencent pareil
	const hash = createHash('sha1').update(url).digest('hex').slice(0, 10);
	//bout lisible de l'URL -> permet de reconnaître les fichiers à l'oeil.
	const readable = url
		.replace(/^https?:\/\//, '')
		.replace(/[^a-zA-Z0-9]+/g, '_')
		.slice(0, 60);
	return join(CACHE_DIR, `${readable}_${hash}.cache`);
}

//pause asynchrone toute simple
function sleep(ms: number): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

//récup le contenu TEXTE d'une URL (avec cache disque)
export async function fetchText(url: string): Promise<string> {
	const file = cacheFile(url);

	//déjà en cache ? on relit le fichier, pas de réseau
	if (existsSync(file)) {
		return readFileSync(file, 'utf-8');
	}

	//sinon petite pause puis vrai requête pour éviter que le script se bloque indéfiniment si serveur répond pas
	await sleep(REQUEST_DELAY_MS);
	const response = await fetch(url, {
		headers: { 'User-Agent': USER_AGENT },
		signal: AbortSignal.timeout(20_000)
	});
	if (!response.ok) {
		throw new Error(`Requête échouée (HTTP ${response.status}) : ${url}`);
	}
	const text = await response.text();

	//on met en cache pour la prochaine exécution
	writeFileSync(file, text, 'utf-8');
	return text;
}

//variante pratique : récupère une URL et parse directement le JSON
export async function fetchJson<T = unknown>(url: string): Promise<T> {
	return JSON.parse(await fetchText(url)) as T;
}
