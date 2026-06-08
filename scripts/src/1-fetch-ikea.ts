//download of the Ikea Dictionary page from lar5.com
//it's the source for the list of IKEA product names

import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fetchText } from './lib/http.ts';

const LAR5_URL = 'https://lar5.com/ikea/';
const OUTPUT = join('data', 'raw', 'lar5.html');

const html = await fetchText(LAR5_URL);
writeFileSync(OUTPUT, html, 'utf-8');

console.log(`[1/5] lar5 page downloaded : ${html.length} characters -> ${OUTPUT}`);
