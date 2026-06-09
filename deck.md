---
title: 'MÖBELHEM'
sub_title: 'Ville scandinave ou meuble IKEA ?'
author: 'Colin Stefani, Louis Bindschedler, Quentin Eschmann, Simão Schindler'
theme:
  name: 'light'
---

<!-- speaker_note: |
  Bonjour à tous. Aujourd'hui, nous allons vous présenter les coulisses techniques de notre projet libre de cette fin de semestre, un jeu de quiz multijoueur en temps réel où le but est de deviner si un nom désigne un meuble IKEA, une ville ou région scandinave, ou les deux à la fois.

  Pour ce projet, nous avons fait des choix technologiques bien précis pour allier réactivité de l'interface client, communication temps réel bidirectionnelle et persistance efficace des données. C'était surtout pour nous l'opportunité de sortir des sentiers battus et de tester des technologies modernes et assez originales, qui nous changent des frameworks plus traditionnels que nous utilisons habituellement dans notre cadre professionnel, comme Angular ou React.

  L'objectif de cette présentation est de vous faire découvrir notre stack technique, pourquoi nous avons choisi chaque outil et ce que nous avons appris en chemin.

  Je vais commencer par vous présenter brièvement l'architecture globale de notre projet,


  nous terminerons par une démo et vous pourrez nous poser toutes vos questions à la fin.
-->

# L'architecture globale

<!-- alignment: center -->

![Architecture](architecture.png)

<!-- speaker_note: |
    Regardons d'abord la vue d'ensemble. Möbelhem repose sur une architecture client-serveur monolithique classique mais avec une claire séparation des responsabilités :
  - Côté client : L'interface est gérée par Svelte 5. Colin reviendra plus en détails sur le frontend.
  - Côté serveur : Nous utilisons un serveur Node.js (défini dans server.ts) que Quentin vous présentera.
  - Côté base de données : Un fichier SQLite local géré via l'ORM Drizzle. Louis vous expliquera pourquoi nous avons opté pour ces technologies et comment nous nous sommes procuré les données.
-->

<!-- end_slide -->

# Svelte 5 & SvelteKit

<!-- jump_to_middle -->
<!-- column_layout: [1, 2, 1] -->
<!-- column: 1 -->

- **Frontend réactif**
<!-- new_line -->
- **Runes :** `$state`, `$derived`, `$effect`

<!-- reset_layout -->

<!-- end_slide -->

# Socket.io

<!-- jump_to_middle -->
<!-- column_layout: [1, 2, 1] -->
<!-- column: 1 -->

- **Temps réel bidirectionnel**
<!-- new_line -->
- **WebSocket & long-polling fallbacks**
<!-- new_line -->
- **Gestion de salons (rooms)**

<!-- reset_layout -->

<!-- end_slide -->

# Drizzle ORM & SQLite

<!-- jump_to_middle -->
<!-- column_layout: [1, 2, 1] -->
<!-- column: 1 -->

- **Persistance légère**
<!-- new_line -->
- **better-sqlite3 (driver synchrone)**
<!-- new_line -->
- **TypeScript-first**

<!-- reset_layout -->

<!-- speaker_note: |
  Pour la persistance, c'est-à-dire stocker les mots du jeu et les scores des joueurs, nous avons choisi SQLite avec l'ORM Drizzle.

  Drizzle est un ORM "TypeScript-first" : on définit nos tables directement en TypeScript, et les requêtes s'écrivent presque comme du SQL pur (par exemple db.select().from(words)), tout en garantissant un typage strict de bout en bout, de la base de données jusqu'au client. C'est sa grande différence avec un ORM comme Prisma, qui utilise son propre langage de schéma et masque davantage le SQL.

  Côté base de données, SQLite stocke tout dans un simple fichier local (local.db), sans aucun serveur à configurer. Et le driver better-sqlite3 est synchrone : il s'exécute dans le même processus que notre serveur Node, donc sans latence réseau, ce qui le rend très rapide et le code beaucoup plus simple à écrire pour notre volume de données.

  Mais une base de données, aussi rapide soit-elle, reste vide au départ. Il nous fallait un vrai catalogue de mots fiable. Et c'est là que ça devient intéressant : comment se procurer ces données ? C'est ce que je vais vous montrer maintenant.
-->

<!-- end_slide -->

# Le scraping des données

<!-- jump_to_middle -->
<!-- column_layout: [1, 2, 1] -->
<!-- column: 1 -->

- **Web scraping (lar5 + cheerio)**
<!-- new_line -->
- **Wikidata — requêtes SPARQL**
<!-- new_line -->
- **API REST Wikipédia (FR)**
<!-- new_line -->
- **Pipeline reproductible (Makefile + cache)**

<!-- reset_layout -->

<!-- speaker_note: |
  Pour chaque mot du jeu, il nous fallait savoir : est-ce un meuble IKEA, une ville, ou les deux ? Et pour les lieux : leur pays, leurs coordonnées et une petite description. Notre contrainte : générer ce catalogue de façon reproductible, gratuitement, sans clé d'API et sans intelligence artificielle. Pour ça, on combine trois sources publiques.

  Première source : un site appelé lar5.com, "The IKEA Dictionary", qui recense environ 1300 noms de produits IKEA. On télécharge la page et on l'analyse avec cheerio, une librairie qui permet de naviguer dans le HTML côté serveur exactement comme on le ferait avec jQuery dans le navigateur (on sélectionne les éléments, on lit leur texte). Ça nous donne la liste des noms IKEA.

  Deuxième source, et la plus intéressante techniquement : Wikidata, qu'on interroge en SPARQL. SPARQL, c'est le langage de requête du web sémantique. Le concept à retenir : dans Wikidata, tout est codé par des identifiants indépendants de la langue. Les "Q" désignent des choses (Q34 = la Suède, Q486972 = la notion d'établissement humain) et les "P" désignent des relations (P31 = "est une instance de", P279 = "est une sous-classe de", P17 = "pays", P625 = "coordonnées"). Notre requête vérifie qu'un nom est bien une vraie localité nordique et récupère son pays et ses coordonnées officielles. Le petit bout magique, c'est le filtre P31/P279* : il remonte toute la hiérarchie des catégories pour ne garder que ce qui est, même indirectement, une ville, et écarter ainsi les régions et les comtés.

  Troisième source : l'API REST de Wikipédia en français. Son endpoint "summary" renvoie un résumé d'article en français plus des coordonnées : c'est ce qui nous sert de description pour chaque ville.

  Tout ça est orchestré par un simple Makefile, étape par étape : on télécharge, on parse, on récupère les villes, on vérifie les lieux, on assemble le CSV final. Chaque réponse réseau est mise en cache sur le disque : relancer le scraper est donc instantané et 100% reproductible, et on reste polis envers ces serveurs gratuits avec un User-Agent identifiable et une pause entre chaque requête.

  Ce qu'on a appris : les bases de SPARQL et du modèle de données de Wikidata, qui sont assez déroutants au début ; gérer l'ambiguïté des noms — par exemple il existe plusieurs "Hemnes" en Norvège, donc on garde celui dont les coordonnées sont les plus proches de celles données par notre première source ; et au passage, que Node version 24 sait exécuter du TypeScript nativement, sans étape de compilation.

  Les avantages : c'est gratuit, sans clé d'API, sans IA, entièrement reproductible grâce au cache, et vérifiable puisqu'on s'appuie sur les vraies coordonnées de Wikidata. Les inconvénients : la couverture des sources n'est pas parfaite (lar5 ne liste pas les produits IKEA les plus récents) ; la modélisation de Wikidata varie d'un pays à l'autre (parfois la population est rattachée à la commune et pas à la ville) ; c'est rate-limité, donc lent au premier lancement ; et surtout, le contenu purement rédactionnel — descriptions marketing, anecdotes — n'est tout simplement pas "scrapable" sans IA, ce qui nous a amenés à simplifier le format de nos données.
-->

<!-- end_slide -->

# Playwright & Vitest

<!-- jump_to_middle -->
<!-- column_layout: [1, 2, 1] -->
<!-- column: 1 -->

- **Tests unitaires rapides (Vitest)**
<!-- new_line -->
- **Tests E2E multi-navigateurs (Playwright)**
<!-- new_line -->
- **Isolation des contextes**

<!-- reset_layout -->

<!-- end_slide -->

# Couverture des tests

<!-- jump_to_middle -->
<!-- column_layout: [1, 2, 1] -->
<!-- column: 1 -->

- **Couverture globale : > 94%** (lignes et instructions)
<!-- new_line -->
- **Composants UI : ~91%** de couverture
<!-- new_line -->
- **Logique serveur & utilitaires : 96% à 100%** de couverture

<!-- reset_layout -->

<!-- speaker_note: |
  Pour valider la qualité et la robustesse de notre codebase, nous avons mis en place une mesure de couverture de code rigoureuse.

  Les résultats sont extrêmement satisfaisants :
  - Nous atteignons plus de 94 % de couverture globale sur l'ensemble du projet.
  - Les composants d'interface utilisateur (comme le bouton, la carte, la liste des joueurs ou la barre de temps) tournent autour de 91 % de couverture.
  - La logique du serveur de jeu (le RoomManager, le calcul des scores) ainsi que tous nos fichiers utilitaires sont couverts entre 96 % et 100 %.

  Cette couverture élevée nous donne une grande confiance dans le code, en limitant les régressions visuelles et fonctionnelles à chaque modification.
-->

<!-- end_slide -->

# Place à la démo !

<!-- alignment: center -->
<!-- jump_to_middle -->

## 🎮 Démo en direct

<!-- new_line -->

Lancement d'une partie de Möbelhem.

<!-- speaker_note: |
  Maintenant que nous avons fait le tour de l'architecture et de la théorie, passons à la pratique.

  Je vous propose de lancer une démo en direct de Möbelhem pour voir comment tout cela fonctionne. Nous allons créer une partie multijoueurs, faire rejoindre un deuxième joueur, et lancer le quiz.
-->

<!-- end_slide -->

# Conclusion

<!-- jump_to_middle -->
<!-- column_layout: [1, 2, 1] -->
<!-- column: 1 -->

- **Terrain d'expérimentations**
<!-- new_line -->
- **Succès techniques (Svelte 5, Sockets, Drizzle)**
<!-- new_line -->
- **Échecs formateurs (Radicle vs GitHub)**

<!-- reset_layout -->

<!-- speaker_note: |
  En conclusion, ce projet libre de fin de semestre a surtout été pour notre équipe un formidable terrain d'expérimentation et d'apprentissage, l'occasion idéale de sortir de notre zone de confort technique.

  Certaines expérimentations ont été de francs succès :
  - L'intégration de Svelte 5 et de son nouveau modèle de Runes réactives.
  - La conception du backend temps réel résilient avec Socket.io.
  - L'implémentation de la persistance ultra-légère avec Drizzle ORM et SQLite.

  D'autres essais ont été moins fructueux, mais tout aussi riches d'enseignements. Par exemple, avoir tenté d'utiliser Radicle à la place de GitHub. Après pas mal de temps perdu à essayer de configurer les nœuds et de stabiliser le workflow de synchronisation collaboratif, nous avons dû admettre que ce n'était pas encore mûr pour notre usage et nous sommes revenus sur GitHub.

  C'est le propre d'un projet académique libre : tester de nouvelles choses, commettre des erreurs, apprendre à mesurer les coûts/bénéfices et savoir pivoter rapidement quand c'est nécessaire.

  Merci pour votre attention, et nous sommes désormais ouverts à toutes vos questions !
-->
