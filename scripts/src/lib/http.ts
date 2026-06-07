//HTTP utility with disk cache : when restart scraper we re-read the data/raw file instead of re download

import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { REQUEST_DELAY_MS, USER_AGENT } from '../../config.ts';

//folder where we store all the raw responses (cache).
const CACHE_DIR = join('data', 'raw');
mkdirSync(CACHE_DIR, { recursive: true });

//transforms a URL into a cache file name that is both readable and unique.
//example : https://fr.wikipedia.org/.../Kallax -> fr_wikipedia_org_..._a1b2c3.cache
function cacheFile(url: string): string {
	//short fingerprint of the URL -> guarantees uniqueness even if the URLS start the same
	const hash = createHash('sha1').update(url).digest('hex').slice(0, 10);
	//readable bit of the URL -> lets us recognize the files at a glance.
	const readable = url
		.replace(/^https?:\/\//, '')
		.replace(/[^a-zA-Z0-9]+/g, '_')
		.slice(0, 60);
	return join(CACHE_DIR, `${readable}_${hash}.cache`);
}

//very simple asynchronous pause
function sleep(ms: number): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

//grab the TEXT content of a URL (with disk cache)
export async function fetchText(url: string): Promise<string> {
	const file = cacheFile(url);

	//already cached ? we re-read the file, no network
	if (existsSync(file)) {
		return readFileSync(file, 'utf-8');
	}

	//otherwise small pause then real request to avoid the script blocking indefinitely if server doesn't respond
	await sleep(REQUEST_DELAY_MS);
	const response = await fetch(url, {
		headers: { 'User-Agent': USER_AGENT },
		signal: AbortSignal.timeout(20_000)
	});
	if (!response.ok) {
		throw new Error(`Request failed (HTTP ${response.status}) : ${url}`);
	}
	const text = await response.text();

	//we cache it for the next execution
	writeFileSync(file, text, 'utf-8');
	return text;
}

//handy variant : fetches a URL and parses the JSON directly
export async function fetchJson<T = unknown>(url: string): Promise<T> {
	return JSON.parse(await fetchText(url)) as T;
}
