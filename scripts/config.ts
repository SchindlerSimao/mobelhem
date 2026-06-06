//config centrale du scraper

//nombre d'habitant minimum
export const POP_MIN = 50000;

//nombre maximum de meubles IKEA
export const MAX_IKEA = 250;

//les pays nordiques du jeu, clé = identifiant de l'entitié "pays" dans Wikidata, valeur = code à 2 lettre utilisé dans words.csv
export const COUNTRY_BY_QID: Record<string, 'SE' | 'NO' | 'DK' | 'FI'> = {
	Q34: 'SE', //Suède
	Q20: 'NO', //Norvège
	Q35: 'DK', //Danemark
	Q33: 'FI' //Finlande
};

//les API publiques demandent qu'on s'identifie donc on identique un sorte de nom de projet
export const USER_AGENT =
	'MobelhemScraper/1.0 (projet etudiant HEIG-VD WEB)';

//pause minimale entre deux vraies requêtes réseau (en millisecondes), pour ne pas marteler les serveurs gratuits que l'on utilise
export const REQUEST_DELAY_MS = 1100;
