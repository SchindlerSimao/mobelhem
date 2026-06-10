---
title: 'MÖBELHEM'
sub_title: 'Ville scandinave ou meuble IKEA ?'
author: 'Colin Stefani, Louis Bindschedler, Quentin Eschmann, Simão Schindler'
theme:
  name: 'light'
---

<!-- speaker_note: |
  Bonjour à tous. Aujourd'hui, nous allons vous présenter l'architecture technique de notre projet libre de fin de semestre : Möbelhem. Il s'agit d'un quiz multijoueur en temps réel où l'objectif est de deviner si un nom désigne un meuble IKEA, une ville scandinave, ou les deux.

  Ce projet était l'occasion d'explorer une stack technologique différente des frameworks que nous utilisons habituellement dans un cadre professionnel, comme Angular ou React. L'objectif de cette présentation est de détailler nos choix d'outils pour répondre à trois besoins centraux : la réactivité du frontend, la gestion du temps réel et la persistance des données, ainsi que les enseignements que nous en avons tirés.
-->

# L'architecture globale

![Architecture](architecture.png)

- **Serveur** — SvelteKit + Socket.io (`server.ts`)
- **Client** — Svelte 5 (Runes)
- **Données** — SQLite + Drizzle ORM

<!-- speaker_note: |
  Pour l'architecture globale, nous avons opté pour une approche unifiée avec SvelteKit. Au lieu de maintenir un frontend et une API séparés, SvelteKit regroupe le routage, le rendu de l'interface via Svelte 5 et la logique applicative au sein de la même base de code, ce qui a grandement simplifié le développement.
  
  Cependant, le besoin d'une communication bidirectionnelle performante pour le quiz nous a poussés à adapter ce modèle. Nous avons mis en place un serveur Node.js sur mesure, géré par notre fichier server.ts :
  
  - Côté serveur : Ce fichier sert de point d'entrée. Il héberge l'application SvelteKit tout en y attachant notre serveur WebSocket via Socket.io pour gérer la logique multijoueur. Quentin détaillera cette mécanique.
  - Côté client : L'interface s'appuie sur les récentes évolutions de Svelte 5, que Colin vous présentera juste après.
  - Côté base de données : La persistance s'intègre directement dans cet écosystème via une base SQLite locale et l'ORM Drizzle. Louis expliquera ce choix d'architecture légère et notre méthode de collecte des données.
-->

<!-- end_slide -->

# Choix technologiques

| Besoin | Choix | Alternative écartée |
|---|---|---|
| Frontend | **Svelte 5** | React, Angular |
| Full-stack | **SvelteKit** | Next.js |
| Temps réel | **Socket.io** | WebSocket natif |
| ORM | **Drizzle** | Prisma |
| Base de données | **SQLite** | PostgreSQL |
| Tests | **Vitest + Playwright** | Jest + Cypress |

## Philosophie

- **Léger > lourd** · **Explicite > magique** · **Expérimental > conventionnel**

<!-- speaker_note: |
  Ce projet était l'occasion de sortir de notre zone de confort. En stage et en cours, on utilise surtout React, Angular, PostgreSQL — des outils éprouvés mais qu'on maîtrise déjà. Là, on voulait expérimenter.
  
  Chaque choix répond à un besoin précis :
  
  **Svelte 5** plutôt que React ou Angular : pas de virtual DOM, compilation à la place, bundles minuscules. Les Runes apportent une réactivité fine sans le boilerplate des hooks.
  
  **SvelteKit** plutôt que Next.js : même base de code pour le frontend et les API routes. Pas de séparation artificielle entre client et serveur.
  
  **Socket.io** plutôt que WebSocket natif : rooms intégrées pour isoler les parties, reconnexion automatique, fallback sur long-polling si WebSocket bloqué. WebSocket natif = tout réinventer.
  
  **Drizzle** plutôt que Prisma : TypeScript-first, requêtes proches du SQL pur, pas de langage de schéma propriétaire. Prisma masque trop le SQL à notre goût.
  
  **SQLite** plutôt que PostgreSQL : un simple fichier, zéro configuration, driver synchrone ultra-rapide. PostgreSQL serait overkill pour un quiz local.
  
  **Vitest + Playwright** plutôt que Jest + Cypress : Vitest natif Vite sans transformation Babel, Playwright multi-navigateurs avec contextes isolés.
  
  La philosophie globale : léger plutôt que lourd, explicite plutôt que magique, expérimental plutôt que conventionnel. C'est un projet libre, l'occasion idéale pour tester des outils qu'on n'utiliserait pas forcément en production.
-->

<!-- end_slide -->

# Svelte 5 & SvelteKit

## Runes : réactivité fine

- `$state` — state réactif
- `$derived` — valeurs calculées
- `$effect` — effets de bord

## SvelteKit

- Routage fichier, SSR/SSG/CSR
- API routes intégrées

<!-- speaker_note: |
  Svelte 5 introduit les Runes, un nouveau système de réactivité qui remplace l'ancien modèle basé sur les stores et les déclarations `$:`.
  
  **$state** déclare une variable réactive. Contrairement à `useState` en React, pas besoin de setter dédié — on modifie directement la variable.
  
  **$derived** crée des valeurs calculées automatiquement. Équivalent de `useMemo` mais sans dépendances explicites à lister.
  
  **$effect** gère les effets de bord synchronisés avec le state. Similaire à `useEffect` mais avec tracking automatique des dépendances.
  
  L'avantage majeur : pas de hooks, pas de règles spéciales sur quand les appeler, pas de problèmes de stale closures. La réactivité est au niveau du compilateur, pas de la librairie.
  
  SvelteKit apporte le routage basé sur le système de fichiers (comme Next.js), le support SSR/SSG/CSR dans le même projet, et des API routes intégrées. Ça nous permet d'avoir frontend et backend dans une seule base de code, sans séparation artificielle.
  
  Pour un quiz multijoueur, c'est idéal : les pages de jeu utilisent le rendu côté client pour la réactivité, les API routes gèrent la logique légère, et Socket.io (qu'on verra juste après) s'occupe du temps réel.
-->

<!-- end_slide -->

# Socket.io

## Temps réel bidirectionnel

- Événements personnalisés (`game:start`, `player:answer`)
- WebSocket + fallback long-polling

## Rooms

- Isolation des parties
- Diffusion ciblée (`io.to(room).emit(...)`)
- Reconnexion automatique

<!-- speaker_note: |
  Socket.io gère toute la communication temps réel du quiz. On utilise des événements personnalisés pour chaque action :
  
  - `room:create` / `room:join` — création et rejoindre une partie
  - `game:start` — lancement de la manche
  - `player:answer` — réponse d'un joueur
  - `game:round-end` — fin de round avec scores
  - `player:disconnect` — déconnexion d'un joueur
  
  Les rooms isolent les parties : chaque salon a un code à 6 caractères, et les événements ne sont diffusés qu'aux joueurs de ce salon via `io.to(roomCode).emit(...)`.
  
  La reconnexion automatique est cruciale : si un joueur perd sa connexion pendant une partie, Socket.io tente de se reconnecter et restaure son état. On a ajouté un timeout de 30 secondes — si le joueur ne revient pas, il est exclu et la partie continue.
  
  Le fallback long-polling est important en environnement universitaire : certains réseaux bloquent les WebSockets. Socket.io détecte automatiquement et bascule sur du polling HTTP, moins performant mais fonctionnel partout.
  
  Côté serveur, le `RoomManager` (dans `src/lib/server/game/`) gère l'état de chaque partie : joueurs connectés, round en cours, scores, timer. Tout en mémoire, pas en base — les parties sont éphémères par nature.
-->

<!-- end_slide -->

# Drizzle ORM & SQLite

## Drizzle : TypeScript-first

- Schémas en TypeScript, typage strict bout en bout
- Requêtes quasi-SQL : `db.select().from(words)`

## SQLite + better-sqlite3

- Fichier local (`local.db`), zéro serveur
- Driver synchrone — même processus Node, pas de latence

<!-- speaker_note: |
  Pour la persistance, c'est-à-dire stocker les mots du jeu et les scores des joueurs, nous avons choisi SQLite avec l'ORM Drizzle.

  Drizzle est un ORM "TypeScript-first" : on définit nos tables directement en TypeScript, et les requêtes s'écrivent presque comme du SQL pur (par exemple db.select().from(words)), tout en garantissant un typage strict de bout en bout, de la base de données jusqu'au client. C'est sa grande différence avec un ORM comme Prisma, qui utilise son propre langage de schéma et masque davantage le SQL.

  Côté base de données, SQLite stocke tout dans un simple fichier local (local.db), sans aucun serveur à configurer. Et le driver better-sqlite3 est synchrone : il s'exécute dans le même processus que notre serveur Node, donc sans latence réseau, ce qui le rend très rapide et le code beaucoup plus simple à écrire pour notre volume de données.

  Mais une base de données, aussi rapide soit-elle, reste vide au départ. Il nous fallait un vrai catalogue de mots fiable. Et c'est là que ça devient intéressant : comment se procurer ces données ? C'est ce que je vais vous montrer maintenant.
-->

<!-- end_slide -->

# Le scraping des données

## Trois sources publiques

| Source | Données |
|---|---|
| lar5.com + cheerio | ~1300 noms IKEA |
| Wikidata + SPARQL | Villes, pays, coordonnées |
| Wikipédia FR (API) | Descriptions |

## Pipeline reproductible

- **Makefile** : fetch → parse → cities → geo → CSV
- Cache disque, rate-limiting, sans clé d'API, sans IA

<!-- speaker_note: |
  Pour chaque mot du jeu, il nous fallait savoir : est-ce un meuble IKEA, une ville, ou les deux ? Et pour les lieux : leur pays, leurs coordonnées et une petite description. Notre contrainte : générer ce catalogue de façon reproductible, gratuitement, sans clé d'API et sans intelligence artificielle. Pour ça, on combine trois sources publiques.

  Première source : un site appelé lar5.com, "The IKEA Dictionary", qui recense environ 1300 noms de produits IKEA. On télécharge la page et on l'analyse avec cheerio, une librairie qui permet de naviguer dans le HTML côté serveur exactement comme on le ferait avec jQuery dans le navigateur (on sélectionne les éléments, on lit leur texte). Ça nous donne la liste des noms IKEA.

  Deuxième source, et la plus intéressante techniquement : Wikidata, qu'on interroge en SPARQL. SPARQL, c'est le langage de requête du web sémantique. Le concept à retenir : dans Wikidata, tout est codé par des identifiants indépendants de la langue. Les "Q" désignent des choses (Q34 = la Suède, Q486972 = la notion d'établissement humain) et les "P" désignent des relations (P31 = "est une instance de", P279 = "est une sous-classe de", P17 = "pays", P625 = "coordonnées"). Notre requête vérifie qu'un nom est bien une vraie localité nordique et récupère son pays et ses coordonnées officielles. Le petit bout magique, c'est le filtre P31/P279* : il remonte toute la hiérarchie des catégories pour ne garder que ce qui est, même indirectement, une ville, et écarter ainsi les régions et les comtés.

  Troisième source : l'API REST de Wikipédia en français. Son endpoint "summary" renvoie un résumé d'article en français plus des coordonnées : c'est ce qui nous sert de description pour chaque ville.

  Tout ça est orchestré par un simple Makefile, étape par étape : on télécharge, on parse, on récupère les villes, on vérifie les lieux, on assemble le CSV final. Chaque réponse réseau est mise en cache sur le disque : relancer le scraper est donc instantané et 100% reproductible, et on reste polis envers ces serveurs gratuits avec un User-Agent identifiable et une pause entre chaque requête.

  Ce qu'on a appris : les bases de SPARQL et du modèle de données de Wikidata, qui sont assez déroutants au début ; gérer l'ambiguïté des noms, par exemple il existe plusieurs "Hemnes" en Norvège, donc on garde celui dont les coordonnées sont les plus proches de celles données par notre première source ; et au passage, que Node version 24 sait exécuter du TypeScript natativement, sans étape de compilation.

  Les avantages : c'est gratuit, sans clé d'API, sans IA, entièrement reproductible grâce au cache, et vérifiable puisqu'on s'appuie sur les vraies coordonnées de Wikidata. Les inconvénients : la couverture des sources n'est pas parfaite (lar5 ne liste pas les produits IKEA les plus récents) ; la modélisation de Wikidata varie d'un pays à l'autre (parfois la population est rattachée à la commune et pas à la ville) ; c'est rate-limité, donc lent au premier lancement ; et surtout, le contenu purement rédactionnel (descriptions marketing, anecdotes) n'est tout simplement pas "scrapable" sans IA, ce qui nous a amenés à simplifier le format de nos données.
-->

<!-- end_slide -->

# SPARQL & Wikidata

- **Q** = entités (Q34 = Suède), **P** = relations (P31 = "instance de")
- `P31/P279*` : remonte la hiérarchie → filtre les vraies villes

```sparql
?city wdt:P17 wd:Q34 .          # pays = Suède
?city wdt:P31 ?type .
?type wdt:P279* wd:Q486972 .    # sous-classe d'établissement humain
```

<!-- speaker_note: |
SPARQL, c'est le langage de requête du web sémantique, utilisé par Wikidata. Le concept clé : tout est codé par des identifiants indépendants de la langue.

Les "Q" désignent des entités (des "choses") :
- Q34 = la Suède
- Q486972 = la notion d'établissement humain
- Q515 = ville

Les "P" désignent des relations (des "propriétés") :
- P31 = "est une instance de"
- P279 = "est une sous-classe de"
- P17 = "pays"
- P625 = "coordonnées géographiques"
- P1082 = "population"

Notre requête fait trois choses :

1. **Filtre par pays** : `wdt:P17 wd:Q34` = l'entité a pour pays la Suède
2. **Récupère les données** : population et coordonnées
3. **Vérifie que c'est une ville** : c'est là que la magie opère avec `P31/P279*`

Le `P279*` (avec l'astérisque) remonte toute la hiérarchie des sous-classes. Par exemple :
- Stockholm (Q31121) → P31 → ville (Q515)
- ville (Q515) → P279 → établissement humain (Q486972)

Donc Stockholm est bien un établissement humain, même indirectement. Ce filtre nous permet d'exclure les régions (Q10686), les comtés (Q166050), et autres divisions administratives qui ne sont pas des villes.

Sans ce filtre, on récupérerait n'importe quoi : des provinces, des municipalités, des diocèses... Avec, on est sûrs d'avoir de vrais lieux habités.

Exemple de résultat pour la Suède : Stockholm, Göteborg, Malmö, Uppsala... Pour chaque ville, on récupère ses coordonnées exactes et l'URL de son article Wikipédia en français, qui nous sert ensuite à récupérer la description.
-->

<!-- end_slide -->

# Playwright & Vitest

## Vitest — tests unitaires

- Natif Vite, exécution rapide
- Isolation des modules

## Playwright — tests E2E

- Chromium, Firefox, WebKit
- Contextes navigateur isolés

<!-- speaker_note: |
Notre stratégie de tests combine deux niveaux complémentaires.

**Vitest pour les tests unitaires** : runner natif Vite, donc même config que le dev, pas de transformation Babel séparée comme avec Jest. Exécution en quelques secondes, isolation des modules, mocks intégrés. On teste la logique pure : calcul de scores, validation de réponses, gestion du timer, utilitaires.

**Playwright pour les tests E2E** : lance de vrais navigateurs (Chromium, Firefox, WebKit) et simule des scénarios utilisateurs complets. On teste des flux entiers : création de partie, connexion d'un deuxième joueur, soumission de réponses, vérification que les scores se mettent à jour en temps réel.

L'isolation des contextes est clé : chaque test tourne dans un navigateur frais, sans cookies ni état partagé. Pas d'interférence entre tests, pas de flakiness.

Pour le temps réel, Playwright attend les événements Socket.io avant de continuer. Exemple : `await page.waitForEvent('websocket')` pour s'assurer que la connexion est établie avant d'envoyer une réponse.

Les deux outils sont complémentaires : Vitest valide que chaque fonction fait ce qu'elle doit faire, Playwright valide que l'ensemble du système fonctionne comme attendu. Couverture globale > 94%, confiance élevée à chaque commit.
-->

<!-- end_slide -->

# Couverture des tests

| Zone | Couverture |
|---|---|
| **Globale** | > 94% |
| Composants UI | ~91% |
| Serveur & utilitaires | 96–100% |

<!-- speaker_note: |
  Pour valider la qualité et la robustesse de notre codebase, nous avons mis en place une mesure de couverture de code rigoureuse.

  Les résultats sont extrêmement satisfaisants :
  - Nous atteignons plus de 94 % de couverture globale sur l'ensemble du projet.
  - Les composants d'interface utilisateur (comme le bouton, la carte, la liste des joueurs ou la barre de temps) tournent autour de 91 % de couverture.
  - La logique du serveur de jeu (le RoomManager, le calcul des scores) ainsi que tous nos fichiers utilitaires sont couverts entre 96 % et 100 %.

  Cette couverture élevée nous donne une grande confiance dans le code, en limitant les régressions visuelles et fonctionnelles à chaque modification.
-->

<!-- end_slide -->

<!-- alignment: center -->
<!-- jump_to_middle -->

# Démo en direct

<!-- speaker_note: |
Pour illustrer comment ces différentes briques interagissent, nous allons passer à une courte démonstration. Nous allons instancier une partie, connecter un second joueur et lancer une manche de quiz en direct.
-->

<!-- end_slide -->

# Conclusion

## Succès

- Svelte 5 · Socket.io · Drizzle + SQLite

## Échec formateur

- Radicle → migration GitHub

## Leçon

- Abandonner une techno quand elle freine

<!-- speaker_note: |
En conclusion, la réalisation de ce projet nous a permis d'évaluer concrètement la maturité d'outils récents.

Certains de nos choix techniques se sont révélés très pertinents :

- La prise en main de Svelte 5 et de sa nouvelle gestion de la réactivité avec les Runes.
- La stabilité du backend temps réel implémenté avec Socket.io.
- La simplicité de la persistance avec le couple Drizzle ORM et SQLite.

D'autres choix ont été moins concluants, mais tout aussi instructifs. Par exemple, nous avions initialement opté pour Radicle à la place de GitHub pour la gestion de version. Après avoir investi un temps conséquent dans la configuration des nœuds et la stabilisation de la synchronisation, nous avons dû constater que l'outil n'était pas adapté à notre rythme de développement collaboratif, ce qui nous a obligés à migrer vers GitHub.

Ce travail d'exploration technique nous a poussés à justifier nos choix d'architecture, et surtout à savoir abandonner une technologie lorsqu'elle devenait un frein.

Merci pour votre attention, nous sommes à votre disposition pour répondre à vos questions.
-->

<!-- end_slide -->

<!-- alignment: center -->
<!-- jump_to_middle -->

# Questions

<!-- end_slide -->
