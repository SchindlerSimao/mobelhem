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

<!-- alignment: center -->

![Architecture](architecture.png)

<!-- speaker_note: |
Pour l'architecture globale, nous avons opté pour une approche unifiée avec SvelteKit. Au lieu de maintenir un frontend et une API séparés, SvelteKit regroupe le routage, le rendu de l'interface via Svelte 5 et la logique applicative au sein de la même base de code, ce qui a grandement simplifié le développement.

Cependant, le besoin d'une communication bidirectionnelle performante pour le quiz nous a poussés à adapter ce modèle. Nous avons mis en place un serveur Node.js sur mesure, géré par notre fichier server.ts :

- Côté serveur : Ce fichier sert de point d'entrée. Il héberge l'application SvelteKit tout en y attachant notre serveur WebSocket via Socket.io pour gérer la logique multijoueur. Quentin détaillera cette mécanique.
- Côté client : L'interface s'appuie sur les récentes évolutions de Svelte 5, que Colin vous présentera juste après.
- Côté base de données : La persistance s'intègre directement dans cet écosystème via une base SQLite locale et l'ORM Drizzle. Louis expliquera ce choix d'architecture légère et notre méthode de collecte des données.
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

<!-- alignment: center -->
<!-- jump_to_middle -->

# 🎮 Démo en direct

<!-- speaker_note: |
Pour illustrer comment ces différentes briques interagissent, nous allons passer à une courte démonstration. Nous allons instancier une partie, connecter un second joueur et lancer une manche de quiz en direct.
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
