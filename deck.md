---
title: "MÖBELHEM"
sub_title: "Ville scandinave ou meuble IKEA ?"
author: "Colin Stefani, Louis Bindschedler, Quentin Eschmann, Simão Schindler"
theme:
    name: "light"
---

<!-- speaker_note: |
  Bonjour à tous. Aujourd'hui, je vais vous présenter les coulisses techniques de Möbelhem, un jeu de quiz multijoueurs en temps réel où le but est de deviner si un nom étrange désigne un meuble IKEA, une ville nordique, ou les deux.
  
  Pour ce projet, nous avons fait des choix technologiques bien précis pour allier réactivité de l'interface client, communication temps réel bidirectionnelle et persistance efficace des données.
  
  L'objectif de cette présentation est de vous faire découvrir notre stack technique, pourquoi nous avons choisi chaque outil, ce que nous avons appris en chemin, ainsi que leurs forces et faiblesses respectives.
-->

# L'architecture globale

<!-- alignment: center -->

![Architecture](architecture.png)

<!-- speaker_note: |
  Regardons d'abord la vue d'ensemble. Möbelhem repose sur une architecture client-serveur monolithique mais modulaire :
  - Côté client : L'interface est gérée par Svelte 5, qui communique avec le serveur via HTTP pour les pages classiques et les requêtes initiales, et via WebSockets (Socket.io) pour les sessions multijoueurs.
  - Côté serveur : Nous utilisons un serveur Node.js personnalisé (défini dans server.ts). Ce serveur enveloppe le "handler" généré par SvelteKit (via l'adaptateur Node) et instancie un serveur Socket.io sur le même port HTTP.
  - Côté base de données : Un fichier SQLite local géré via l'ORM Drizzle.
  
  Pourquoi ce choix ? Les WebSockets nécessitent un serveur persistant ("stateful") pour maintenir les connexions ouvertes. C'est pourquoi nous n'avons pas pu utiliser un déploiement "serverless" classique (comme Vercel ou Netlify sans serveur externe). L'utilisation d'un serveur Node unique simplifie grandement l'hébergement et évite de devoir gérer un serveur de WebSockets séparé.
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

<!-- speaker_note: |
  Pour l'interface utilisateur, nous utilisons Svelte 5, la toute dernière version majeure du framework.
  Svelte 5 introduit un changement de paradigme fondamental avec les "Runes".
  
  Qu'est-ce que c'est ?
  Dans Svelte 4, la réactivité était magique mais parfois opaque : on déclarait `let count = 0` et le compilateur interceptait les affectations. Mais si on voulait sortir cette logique dans un fichier JS externe, on devait utiliser des "stores" complexes comme `writable`.
  Svelte 5 résout cela avec les Runes :
  - $state(valeur) : Crée un état réactif. Sous le capot, Svelte utilise désormais des Proxies JavaScript. Cela signifie que la réactivité est "fine-grained" (ultra-précise) : seul le nœud exact du DOM lié à la variable est mis à jour, sans comparaison globale de composants (pas de Virtual DOM).
  - $derived(expression) : Remplace l'ancienne syntaxe $: pour les valeurs calculées. Il met à jour automatiquement sa valeur dès qu'un état dont il dépend change (par exemple, dériver l'item courant à partir de la liste mélangée et de l'index).
  - $effect(callback) : Permet de gérer les effets de bord (comme lancer la connexion socket ou gérer le chronomètre de la partie). Il remplace les hooks de cycle de vie comme `onMount` et retourne une fonction de nettoyage (cleanup) indispensable pour fermer les connexions.
  
  Pourquoi Svelte 5 ?
  Pour sa légèreté et sa simplicité de développement. Les Runes rendent la gestion de l'état local et partagé très intuitive.
  
  Avantages :
  - Performances exceptionnelles : pas de Virtual DOM, le code est compilé en manipulations directes du DOM.
  - Code plus explicite et réutilisable hors des composants (.svelte.ts).
  - Gestion native et ultra-fluide des transitions d'interface (fonctions `fade`, `slide`, etc.).
  
  Inconvénients :
  - Courbe d'apprentissage pour ceux habitués à Svelte 4.
  - Écosystème de librairies tierces encore en transition pour adopter pleinement Svelte 5.
-->

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

<!-- speaker_note: |
  Pour le mode multijoueur, le temps réel est crucial : il faut synchroniser les joueurs dans un salon, démarrer la partie en temps réel dans la même pièce. Nous utilisons Socket.io.
  
  Apprenons quelque chose sur Socket.io vs les WebSockets bruts :
  Un WebSocket brut (protocole `ws://`) est un canal de communication bidirectionnel persistant. Cependant, l'utiliser brut en production est complexe car il ne gère pas les micro-coupures de réseau, les pare-feux d'entreprise qui bloquent le port 80/443 pour les protocoles inconnus, ou la répartition des messages.
  Socket.io apporte une couche d'abstraction essentielle :
  1. Connexion résiliente : Si le WebSocket échoue, Socket.io bascule automatiquement sur du "HTTP long-polling" (requêtes HTTP répétées) de manière transparente.
  2. Détection de déconnexion ("Heartbeats") : Des pings/pongs réguliers s'assurent que le client est toujours en ligne. S'il ne répond pas, le serveur libère ses ressources.
  3. Notion de Salons ("Rooms") : C'est une fonctionnalité native de Socket.io côté serveur. Avec `socket.join(roomCode)`, on isole les connexions des joueurs dans un groupe virtuel. Pour envoyer un message uniquement aux joueurs d'une partie, il suffit de faire `io.to(roomCode).emit('evenement')`.
  
  Pourquoi ce choix ?
  Il nous évite de réinventer la roue pour la gestion de la reconnexion et des salons virtuels, ce qui représente des centaines de lignes de code complexes.
  
  Avantages :
  - Extrêmement robuste face aux déconnexions réseau.
  - APIs très simples pour créer et gérer des salons virtuels.
  - Reconnexion automatique intégrée.
  
  Inconvénients :
  - Légère surcharge de protocole par rapport à des WebSockets bruts.
  - Rend le serveur "stateful" : si on veut passer à l'échelle (plusieurs serveurs derrière un répartiteur de charge), on doit utiliser un "Adapter" externe comme Redis sur plusieurs instances, ce qui complique l'architecture.
-->

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
  Pour sauvegarder les mots du jeu et les scores des joueurs, nous utilisons SQLite avec l'ORM Drizzle.
  
  Apprenons une différence clé sur les ORM, notamment Drizzle vs Prisma :
  Prisma fonctionne avec son propre langage de schéma (fichier `.prisma`) et un moteur écrit en Rust. Il fait beaucoup d'abstractions, ce qui peut nuire aux performances des requêtes complexes et alourdir le projet.
  Drizzle, au contraire, est "TypeScript-first". On définit les tables directement en TypeScript. Les requêtes Drizzle s'écrivent presque comme du SQL pur, par exemple `db.select().from(words)`, tout en garantissant un typage strict à 100% de la base de données au client.
  
  Pourquoi SQLite et better-sqlite3 ?
  SQLite stocke la base dans un simple fichier local (`local.db`). `better-sqlite3` est le pilote Node le plus rapide car il fonctionne de manière synchrone. Contrairement aux autres bases de données qui sont sur un serveur distant (comme PostgreSQL), SQLite s'exécute dans le même processus que notre serveur Node. Effectuer des requêtes est donc ultra-rapide (pas de latence réseau). De plus, comme Node exécute le code sur un seul thread par requête, le côté synchrone de `better-sqlite3` simplifie le code sans bloquer les performances pour notre volume d'écritures.
  
  Avantages :
  - Drizzle offre une sécurité de typage totale et un contrôle SQL précis.
  - SQLite nécessite zéro configuration de serveur de base de données, parfait pour le développement et la portabilité.
  - Rapidité d'exécution incroyable en local.
  
  Inconvénients :
  - SQLite bloque la base lors des écritures (verrouillage de fichier). Il n'est pas adapté pour des applications géantes avec des milliers d'écritures par seconde.
  - Moins adapté au déploiement "serverless" car le fichier local serait réinitialisé à chaque extinction d'instance (sauf si l'on utilise un SQLite hébergé comme Turso).
-->

<!-- end_slide -->

# Tailwind CSS v4

<!-- jump_to_middle -->
<!-- column_layout: [1, 2, 1] -->
<!-- column: 1 -->

- **Rust compiler (Oxide)**
<!-- new_line -->
- **CSS-first configuration**
<!-- new_line -->
- **Intégration Vite native**

<!-- reset_layout -->

<!-- speaker_note: |
  Pour le design visuel de Möbelhem, nous avons choisi Tailwind CSS v4.
  
  Apprenons ce qui change dans Tailwind v4 :
  Jusqu'à la version 3, Tailwind nécessitait un fichier de configuration JavaScript (`tailwind.config.js`) et s'intégrait via PostCSS.
  La version 4 réécrit entièrement le moteur de compilation en Rust (projet Oxide). Elle supprime le besoin de configuration JS. Tout se passe désormais directement dans notre fichier CSS principal (`layout.css` ou `app.css`). On utilise la directive `@theme` pour définir nos variables et extensions de thème. Le compilateur scanne nos fichiers Svelte, extrait les classes utilisées, et génère le CSS final à une vitesse 10 fois supérieure aux anciennes versions.
  
  Pourquoi ce choix ?
  Pour intégrer un design moderne et responsive en un temps record sans écrire de fichiers CSS personnalisés interminables.
  
  Avantages :
  - Rapidité de build impressionnante grâce au compilateur Rust.
  - Configuration unifiée directement en CSS, ce qui respecte mieux les standards du web.
  - Intégration Vite native simplifiée.
  
  Inconvénients :
  - Encore récent, donc certaines anciennes extensions ou plugins de l'écosystème v3 ne sont pas encore pleinement compatibles.
  - Les classes utilitaires dans le HTML peuvent vite surcharger le code si l'on ne découpe pas bien nos pages en composants réutilisables.
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

<!-- speaker_note: |
  Enfin, pour garantir la qualité de l'application, nous avons mis en place des tests automatisés avec Vitest (pour les fonctions pures comme le calcul des scores) et Playwright (pour l'expérience utilisateur globale).
  
  Une astuce intéressante avec Playwright :
  Tester une application temps réel multijoueurs est complexe, car il faut simuler plusieurs utilisateurs connectés en temps réel dans la même pièce.
  Playwright permet de créer facilement plusieurs contextes de navigation indépendants au sein d'un même script de test. Cela signifie que dans un seul test de quelques lignes, Playwright peut :
  1. Ouvrir une fenêtre pour le "Joueur 1" qui crée une partie et obtient un code.
  2. Ouvrir une fenêtre isolée pour le "Joueur 2" qui saisit le code et rejoint le salon.
  3. Vérifier que la liste des joueurs s'actualise en temps réel sur les deux écrans grâce aux WebSockets.
  
  Pourquoi ce choix ?
  Il nous garantit qu'aucune mise à jour de notre code ne casse le flux de jeu multijoueurs, ce qui est presque impossible à tester manuellement de façon exhaustive à chaque modification.
  
  Avantages :
  - Tests ultra-fidèles à la réalité des utilisateurs.
  - Très bon outil de débogage (génération de vidéos, rapports HTML, inspecteur pas-à-pas).
  - Vitest est extrêmement rapide pour les tests unitaires grâce à son intégration directe avec Vite.
  
  Inconvénients :
  - L'installation des binaires de navigateurs de Playwright est lourde au premier démarrage.
  - Les tests E2E sont plus lents à s'exécuter que les tests unitaires et nécessitent un environnement stable pour éviter les tests instables (flaky tests).
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
  
  Je vous propose de lancer une démo en direct de Möbelhem pour voir comment tout cela fonctionne. Nous allons créer une partie multijoueurs, faire rejoindre un deuxième joueur (en simulant cela ou avec l'un d'entre vous), et lancer le quiz.
  
  Observez en particulier la réactivité lors de la validation des réponses et la synchronisation en temps réel de l'état du jeu entre les écrans.
-->

<!-- end_slide -->

# Conclusion

<!-- jump_to_middle -->
<!-- column_layout: [1, 2, 1] -->
<!-- column: 1 -->

- **Svelte 5 runes**
<!-- new_line -->
- **Socket.io résilience**
<!-- new_line -->
- **Drizzle SQL-like typage**

<!-- reset_layout -->

<!-- speaker_note: |
  En conclusion, Möbelhem nous a permis de manipuler des technologies modernes et performantes :
  1. Nous avons appris à maîtriser le nouveau modèle de réactivité de Svelte 5, les Runes, qui clarifie grandement le code et améliore les performances globales.
  2. Nous avons conçu un backend temps réel avec Socket.io en comprenant comment gérer la résilience des connexions.
  3. Nous avons exploré une approche de base de données ultra-rapide et sécurisée en TypeScript avec Drizzle et SQLite.
  
  Chaque technologie a ses forces et ses contraintes. La clé a été de concevoir une architecture homogène où chaque outil comble les faiblesses des autres (par exemple, le serveur Node persistant obligatoire pour Socket.io qui nous permet aussi de faire tourner une base SQLite locale hyper performante).
  
  Merci pour votre attention, et si vous avez des questions sur cette stack technique, je serais ravi d'y répondre !
-->
