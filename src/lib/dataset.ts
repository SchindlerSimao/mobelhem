export interface GameItem {
	name: string;
	type: 'ikea' | 'city' | 'both';
	country: 'SE' | 'NO' | 'DK' | 'FI' | null;
	lat?: number;
	lng?: number;
	ikeaDesc?: string;
	cityDesc?: string;
	funFact: string;
}

export const dataset: GameItem[] = [
	{
		name: 'HEMNES',
		type: 'both',
		country: 'NO',
		lat: 66.2263,
		lng: 13.6158,
		ikeaDesc: 'Une série emblématique de meubles de chambre et de salon en bois massif.',
		cityDesc: 'Une commune du comté de Nordland en Norvège, bordée par de magnifiques fjords.',
		funFact:
			"Chez IKEA, les lits, armoires et meubles de hall d'entrée portent généralement des noms de lieux norvégiens."
	},
	{
		name: 'KALLAX',
		type: 'both',
		country: 'SE',
		lat: 65.5947,
		lng: 22.0838,
		ikeaDesc:
			'La célébrissime étagère à cases personnalisables, adorée notamment par les collectionneurs de vinyles.',
		cityDesc:
			'Un petit village côtier suédois situé près de la ville de Luleå, tout au nord du pays.',
		funFact:
			"Le village de Kallax compte moins de 1 000 habitants, mais son nom est mondialement connu grâce à l'étagère !"
	},
	{
		name: 'KLIPPAN',
		type: 'both',
		country: 'SE',
		lat: 56.1309,
		lng: 13.1311,
		ikeaDesc:
			'Un canapé compact à deux places, très abordable et doté de housses interchangeables depuis les années 1980.',
		cityDesc: 'Une municipalité de Scanie dans le sud de la Suède.',
		funFact:
			"Le canapé KLIPPAN a été conçu pour résister aux enfants qui sautent dessus, d'où ses lignes arrondies et sa structure solide."
	},
	{
		name: 'MALM',
		type: 'both',
		country: 'NO',
		lat: 64.0725,
		lng: 11.2186,
		ikeaDesc:
			'Une gamme de meubles de chambre (lits, commodes, tables de chevet) aux lignes épurées et minimalistes.',
		cityDesc: 'Un ancien village minier situé dans la municipalité de Steinkjer, en Norvège.',
		funFact:
			"Le mot 'Malm' signifie également 'minerai' en suédois, un clin d'œil à l'histoire minière du village norvégien."
	},
	{
		name: 'EKTORP',
		type: 'both',
		country: 'SE',
		lat: 59.3167,
		lng: 18.2167,
		ikeaDesc:
			'Une série de canapés et fauteuils ultra-confortables avec des coussins généreux et des housses lavables.',
		cityDesc:
			"Une banlieue résidentielle calme de la municipalité de Nacka, juste à l'est de Stockholm.",
		funFact:
			"C'est l'un des canapés les plus vendus au monde pour son style de maison de campagne anglaise traditionnelle."
	},
	{
		name: 'BRIMNES',
		type: 'both',
		country: 'NO',
		lat: 60.4704,
		lng: 7.0274,
		ikeaDesc:
			'Une série fonctionnelle de lits avec rangements intégrés et de meubles TV pour petits espaces.',
		cityDesc:
			'Un tout petit hameau situé sur la rive du Hardangerfjord dans le comté de Vestland, en Norvège.',
		funFact:
			'Brimnes était historiquement connu pour son service de ferry traversant le fjord avant la construction du pont de Hardanger.'
	},
	{
		name: 'LANDSKRONA',
		type: 'both',
		country: 'SE',
		lat: 55.8708,
		lng: 12.8302,
		ikeaDesc:
			'Une série de canapés et de fauteuils modernes en cuir ou en tissu avec des pieds en bois ou en métal.',
		cityDesc:
			'Une ville côtière historique de Scanie, dans le sud de la Suède, fondée au XVe siècle.',
		funFact:
			'La ville possède la seule citadelle du XVIIe siècle entièrement préservée de Scandinavie.'
	},
	{
		name: 'JOKKMOKK',
		type: 'both',
		country: 'SE',
		lat: 66.6072,
		lng: 19.8222,
		ikeaDesc: 'Un ensemble table et 4 chaises en pin massif teinté, très rustique.',
		cityDesc: 'Une ville de Laponie suédoise, située juste au nord du cercle polaire arctique.',
		funFact:
			"Jokkmokk est le centre de la culture Samie en Suède, célèbre pour son marché d'hiver annuel qui existe depuis plus de 400 ans."
	},
	{
		name: 'POÄNG',
		type: 'ikea',
		country: null,
		ikeaDesc:
			'Le légendaire fauteuil suspendu en multiplis de bois courbé, créé en 1976 par le designer japonais Noboru Nakamura.',
		funFact:
			"Le mot suédois 'Poäng' signifie 'point' ou 'score'. Plus de 30 millions d'exemplaires ont été vendus depuis sa création."
	},
	{
		name: 'LACK',
		type: 'ikea',
		country: null,
		ikeaDesc:
			'La fameuse petite table basse carrée et ultra-légère disponible dans de nombreuses couleurs.',
		funFact:
			"Le nom signifie 'laque' en suédois. Sa structure interne utilise du carton alvéolé (technique sandwich) pour rester légère et solide."
	},
	{
		name: 'PAX',
		type: 'ikea',
		country: null,
		ikeaDesc:
			"L'armoire de rangement entièrement personnalisable avec portes coulissantes ou battantes.",
		funFact:
			"Le mot 'Pax' signifie 'paix' en latin. C'est l'un des systèmes de rangement les plus modulables de la marque."
	},
	{
		name: 'FRAKTA',
		type: 'ikea',
		country: null,
		ikeaDesc: "Le grand sac cabas bleu en plastique, symbole ultime d'IKEA.",
		funFact:
			"Le nom signifie 'transporter' ou 'expédier' en suédois. Il a même été revisité par des créateurs de haute couture !"
	},
	{
		name: 'GLADOM',
		type: 'ikea',
		country: null,
		ikeaDesc:
			"Une petite table d'appoint en métal dont le plateau supérieur amovible peut servir de plateau de service.",
		funFact: "Le mot signifie approximativement 'joyeux' ou 'heureux' en suédois dialectal."
	},
	{
		name: 'BÄSTIS',
		type: 'ikea',
		country: null,
		ikeaDesc:
			'La brosse adhésive anti-poils et anti-poussière indispensable pour les vêtements et canapés.',
		funFact:
			"En argot suédois, 'Bästis' signifie 'meilleur ami'. Un ami fidèle pour vos vêtements noirs !"
	},
	{
		name: 'FEJKA',
		type: 'ikea',
		country: null,
		ikeaDesc: "La gamme de plantes et fleurs artificielles en pot, d'intérieur et d'extérieur.",
		funFact:
			"Le nom vient directement du verbe suédois 'fejka' qui signifie 'simuler' ou 'contrefaire'."
	},
	{
		name: 'IVAR',
		type: 'ikea',
		country: null,
		ikeaDesc:
			'Le système de rangement modulable en pin massif brut, présent dans le catalogue depuis plus de 50 ans.',
		funFact:
			"Ivar est un prénom masculin scandinave d'origine norroise, signifiant 'guerrier à l'arc'."
	},
	{
		name: 'STOCKHOLM',
		type: 'both',
		country: 'SE',
		lat: 59.3293,
		lng: 18.0686,
		ikeaDesc:
			"Une collection haut de gamme d'IKEA, mettant l'accent sur le design scandinave classique et les matériaux nobles.",
		cityDesc:
			'La capitale et plus grande ville de la Suède, construite sur 14 îles reliées par 57 ponts.',
		funFact: "Stockholm est surnommée la 'Venise du Nord' pour son omniprésence de l'eau."
	},
	{
		name: 'UPPSALA',
		type: 'city',
		country: 'SE',
		lat: 59.8586,
		lng: 17.6389,
		cityDesc:
			'La quatrième ville de Suède, célèbre pour sa cathédrale historique et sa prestigieuse université fondée en 1477.',
		funFact:
			"C'est la ville natale du célèbre réalisateur Ingmar Bergman et du physicien Anders Celsius."
	},
	{
		name: 'GÖTEBORG',
		type: 'city',
		country: 'SE',
		lat: 57.7089,
		lng: 11.9746,
		cityDesc:
			'Une grande ville portuaire située sur la côte ouest de la Suède, deuxième ville du pays.',
		funFact:
			"Elle abrite le plus grand parc d'attractions de Scandinavie, Liseberg, ainsi que le constructeur automobile Volvo."
	},
	{
		name: 'OSLO',
		type: 'city',
		country: 'NO',
		lat: 59.9139,
		lng: 10.7522,
		cityDesc: 'La capitale de la Norvège, située au fond du magnifique Oslofjord.',
		funFact: "C'est à Oslo que le Prix Nobel de la Paix est remis chaque année au mois de décembre."
	},
	{
		name: 'BERGEN',
		type: 'city',
		country: 'NO',
		lat: 60.3913,
		lng: 5.3221,
		cityDesc:
			'Une ville côtière entourée de sept montagnes, réputée pour son quartier en bois historique de Bryggen.',
		funFact:
			"C'est l'une des villes les plus pluvieuses d'Europe, avec environ 240 jours de pluie par au !"
	},
	{
		name: 'TRONDHEIM',
		type: 'city',
		country: 'NO',
		lat: 63.4305,
		lng: 10.3951,
		cityDesc:
			'Une ville historique fondée par les Vikings en 997, abritant la cathédrale de Nidaros.',
		funFact: "C'était la première capitale de la Norvège historique sous le nom de Nidaros."
	},
	{
		name: 'COPENHAGUE',
		type: 'city',
		country: 'DK',
		lat: 55.6761,
		lng: 12.5683,
		cityDesc:
			'La capitale du Danemark, célèbre pour son port coloré de Nyhavn et sa statue de la Petite Sirène.',
		funFact:
			"C'est l'une des villes les plus adaptées au vélo au monde, avec plus de vélos que d'habitants !"
	},
	{
		name: 'AARHUS',
		type: 'city',
		country: 'DK',
		lat: 56.1567,
		lng: 10.2108,
		cityDesc: 'La deuxième ville du Danemark, située sur la côte est de la péninsule du Jutland.',
		funFact:
			"Elle abrite le musée d'art ARoS avec sa célèbre passerelle arc-en-ciel circulaire ('Your rainbow panorama')."
	},
	{
		name: 'ODENSE',
		type: 'city',
		country: 'DK',
		lat: 55.4038,
		lng: 10.4024,
		cityDesc: "Une charmante ville située sur l'île de Fionie, au cœur du Danemark.",
		funFact: "C'est la ville natale du célèbre écrivain de contes de fées Hans Christian Andersen."
	},
	{
		name: 'HELSINKI',
		type: 'city',
		country: 'FI',
		lat: 60.1699,
		lng: 24.9384,
		cityDesc:
			"La capitale de la Finlande, située sur une presqu'île bordée par le golfe de Finlande.",
		funFact:
			'La ville possède un réseau de plus de 10 000 saunas, dont un situé dans une grande roue !'
	},
	{
		name: 'TAMPERE',
		type: 'city',
		country: 'FI',
		lat: 61.4978,
		lng: 23.761,
		cityDesc:
			'Une ville finlandaise pittoresque construite entre deux grands lacs, Näsijärvi et Pyhäjärvi.',
		funFact: "C'est la 'capitale mondiale du sauna' avec plus de 50 saunas publics dans la région."
	},
	{
		name: 'TURKU',
		type: 'city',
		country: 'FI',
		lat: 60.4518,
		lng: 22.2666,
		cityDesc:
			"La plus ancienne ville de Finlande et son ancienne capitale historique jusqu'au XIXe siècle.",
		funFact: "Chaque année au mois de décembre, la ville proclame solennellement la 'Paix de Noël'."
	},
	{
		name: 'TROMSØ',
		type: 'city',
		country: 'NO',
		lat: 69.6492,
		lng: 18.9553,
		cityDesc:
			'Une ville dynamique située au-dessus du cercle polaire arctique, réputée pour ses aurores boréales.',
		funFact:
			'Elle abrite la brasserie la plus septentrionale du monde et une cathédrale arctique au design unique.'
	},
	{
		name: 'VISBY',
		type: 'city',
		country: 'SE',
		lat: 57.6348,
		lng: 18.2948,
		cityDesc:
			"Une superbe ville médiévale fortifiée sur l'île suédoise de Gotland, inscrite à l'UNESCO.",
		funFact: 'Ses remparts médiévaux de 3,4 kilomètres de long comportent encore 36 tours de guet.'
	},
	{
		name: 'KIRUNA',
		type: 'city',
		country: 'SE',
		lat: 67.8558,
		lng: 20.2253,
		cityDesc:
			'La ville la plus septentrionale de Suède, célèbre pour sa mine de fer géante et son hôtel de glace.',
		funFact:
			"La ville entière est actuellement déplacée de 3 kilomètres vers l'est pour éviter de s'effondrer dans la mine !"
	},
	{
		name: 'STRÖMSTAD',
		type: 'both',
		country: 'SE',
		lat: 58.9372,
		lng: 11.1738,
		ikeaDesc: "Une série de robinets et d'éviers de cuisine robustes.",
		cityDesc:
			'Une ville côtière à la frontière avec la Norvège, très populaire pour la plaisance et le tourisme.',
		funFact:
			'La ville est célèbre pour accueillir des milliers de Norvégiens venant faire leurs courses pas chères le jour de Pâques.'
	},
	{
		name: 'BILLY',
		type: 'ikea',
		country: null,
		ikeaDesc: "La bibliothèque la plus vendue de l'histoire, conçue par Gillis Lundgren en 1979.",
		funFact:
			"Elle doit son nom à Billy Liljedahl, un employé d'IKEA qui avait exprimé le souhait d'avoir une bibliothèque simple."
	},
	{
		name: 'SÖDERHAMN',
		type: 'both',
		country: 'SE',
		lat: 61.3032,
		lng: 17.0592,
		ikeaDesc:
			'Un système de canapé modulable ultra-moderne avec des sièges très profonds et un grand confort.',
		cityDesc: 'Une jolie commune de la côte est de la Suède, dans le comté de Gävleborg.',
		funFact:
			"La ville possède une tour d'observation octogonale en bois blanc très instagrammable appelée Oscarsborg."
	},
	{
		name: 'FREDDE',
		type: 'ikea',
		country: null,
		ikeaDesc: "Le bureau de gaming d'IKEA avec des étagères et des supports de moniteur intégrés.",
		funFact:
			'Ce nom est un diminutif familier suédois du prénom Fredrik. Le bureau a été conçu spécifiquement pour les joueurs.'
	},
	{
		name: 'TOFTBYN',
		type: 'both',
		country: 'SE',
		lat: 60.741,
		lng: 15.795,
		ikeaDesc: 'Une série de miroirs classiques avec moulures élégantes.',
		cityDesc:
			'Un charmant village suédois situé dans la pittoresque région de Dalécarlie (Dalarna).',
		funFact:
			'La Dalécarlie est considérée comme le cœur historique et culturel de la Suède (berceau des chevaux de Dala).'
	},
	{
		name: 'ÄPPLARÖ',
		type: 'both',
		country: 'SE',
		lat: 59.4833,
		lng: 18.7167,
		ikeaDesc:
			"Une série classique de mobilier d'extérieur en bois d'acacia traité contre les intempéries.",
		cityDesc:
			"Une île idyllique de l'archipel de Stockholm contenant des maisons en bois rouge typiques.",
		funFact: "L'archipel de Stockholm compte plus de 30 000 îles, îlots et récifs !"
	},
	{
		name: 'RYDEBÄCK',
		type: 'both',
		country: 'SE',
		lat: 55.9739,
		lng: 12.7753,
		ikeaDesc:
			'Un plateau de table en bois robuste souvent associé à des tréteaux ou des pieds métalliques.',
		cityDesc:
			'Une localité côtière du sud-ouest de la Suède, réputée pour ses longues plages de sable.',
		funFact: 'Par temps clair, on peut apercevoir les côtes du Danemark juste en face de Rydebäck.'
	},
	{
		name: 'STAVANGER',
		type: 'both',
		country: 'NO',
		lat: 58.97,
		lng: 5.7331,
		ikeaDesc: 'Un sommier à ressorts haut de gamme offrant un excellent soutien pour les matelas.',
		cityDesc:
			"La quatrième ville de Norvège, considérée comme la capitale de l'industrie pétrolière du pays.",
		funFact:
			'Stavanger abrite le célèbre Preikestolen (la Chaire), une falaise impressionnante de 604 mètres surplombant le Lysefjord.'
	},
	{
		name: 'FLISAT',
		type: 'ikea',
		country: null,
		ikeaDesc:
			"Une gamme de meubles et d'accessoires de rangement en bois de pin conçue spécifiquement pour les chambres d'enfants.",
		funFact: "En dialecte suédois, 'flisa' signifie un petit éclat de bois ou une écharde."
	},
	{
		name: 'SKÅDIS',
		type: 'ikea',
		country: null,
		ikeaDesc:
			'Le panneau perforé mural ultra-populaire avec divers crochets, paniers et pinces pour organiser son bureau.',
		funFact:
			"En argot suédois, 'Skådis' est un diminutif pour 'skådespelare', qui signifie un acteur de théâtre ou de cinéma."
	},
	{
		name: 'LILLÅSEN',
		type: 'both',
		country: 'SE',
		lat: 59.2144,
		lng: 18.175,
		ikeaDesc:
			'Un petit bureau élégant en bambou naturel avec des pieds métalliques et trois tiroirs pratiques.',
		cityDesc:
			'Un espace forestier et une petite réserve naturelle situés dans la région métropolitaine de Stockholm.',
		funFact:
			'Le bambou utilisé par IKEA grandit extrêmement vite et constitue une alternative écologique au bois dur traditionnel.'
	},
	{
		name: 'NORDLI',
		type: 'both',
		country: 'NO',
		lat: 64.4644,
		lng: 13.5939,
		ikeaDesc: 'Un système de commodes modulables superposables et personnalisables à volonté.',
		cityDesc:
			'Un village de montagne situé dans la municipalité de Lierne, près de la frontière suédoise.',
		funFact:
			"Cette région de Norvège possède l'une des plus faibles densités de population d'Europe, idéale pour la faune sauvage (ours, loups)."
	},
	{
		name: 'RÅSHULT',
		type: 'both',
		country: 'SE',
		lat: 56.6186,
		lng: 14.2008,
		ikeaDesc:
			'Une desserte de cuisine en acier à trois niveaux, version plus compacte du célèbre chariot RÅSKOG.',
		cityDesc: 'Une ferme historique suédoise située dans la province de Småland.',
		funFact:
			'Råshult est le lieu de naissance officiel du célèbre botaniste suédois Carl von Linné (le père de la classification moderne des espèces).'
	}
];

export function shuffle(array: GameItem[]): GameItem[] {
	const newArray = [...array];
	for (let i = newArray.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[newArray[i], newArray[j]] = [newArray[j], newArray[i]];
	}
	return newArray;
}
