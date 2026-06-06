//téléchargement de la page Ikea Dictionary de lar5.com
//c'est la source pour la liste des noms de produits IKEA

import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fetchText } from './lib/http.ts';

const LAR5_URL = 'https://lar5.com/ikea/';
const OUTPUT = join('data', 'raw', 'lar5.html');

const html = await fetchText(LAR5_URL);
writeFileSync(OUTPUT, html, 'utf-8');

console.log(`[1/5] Page lar5 téléchargée : ${html.length} caractères -> ${OUTPUT}`);
