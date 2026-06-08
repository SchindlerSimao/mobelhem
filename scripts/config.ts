//central config of the scraper

//minimum number of inhabitants
export const POP_MIN = 50000;

//maximum number of IKEA furnitures
export const MAX_IKEA = 250;

//the nordic countries of the game, key = identifier of the "country" entity in Wikidata, value = letter code used in words.csv
export const COUNTRY_BY_QID: Record<string, 'SE' | 'NO' | 'DK' | 'FI'> = {
	Q34: 'SE', //Sweden
	Q20: 'NO', //Norway
	Q35: 'DK', //Denmark
	Q33: 'FI' //Finland
};

//the public APIs ask that we identify ourselves so we put a sort of project name
export const USER_AGENT = 'MobelhemScraper/1.0 (projet etudiant HEIG-VD WEB)';

//minimal pause between two real network requests (in milliseconds), to not hammer the free servers that we use
export const REQUEST_DELAY_MS = 1100;
