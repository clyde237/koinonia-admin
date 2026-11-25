# Koinonia Admin

Administration React, TypeScript et Vite utilisant le même univers visuel que Koinonia App : logo, typographies Montserrat/Poppins, vert et bleu nuit, illustration et photographie locales.

## Démarrer

Node.js 22.18 ou supérieur (exécution native des tests TypeScript), compatible avec Vite.

```bash
npm install
cp .env.example .env.local
npm run dev
```

Ouvrir http://localhost:5173 et lancer également `npm run dev` dans `../koinonia-api`. Le proxy Vite transmet `/api` au backend ; `API_PROXY_TARGET` permet de changer sa destination. Ajouter `http://localhost:5173` à `TRUSTED_ORIGINS` côté API.

## Connexion et comptes

L’administration possède une instance Better Auth indépendante dans Koinonia API, avec ses propres tables, secret et cookies HttpOnly. Les comptes mobiles restent dans le fournisseur Neon Auth existant. Une adresse peut être identique dans les deux espaces avec des mots de passe distincts. Les opérations administratives utilisent la session web propre à l’administration, sans échange de JWT mobile.

Le premier responsable est créé par la commande `admin:bootstrap` de l’API après application des migrations et configuration de `ADMIN_AUTH_SECRET`. Le mot de passe temporaire généré doit être remplacé à la première connexion, avant toute opération de gestion. Le fichier privé `.data/first-admin-independent.json` côté API contient cet accès initial.

Depuis l’écran des comptes, les administrateurs peuvent créer :

| Rôle | Autorisations |
| --- | --- |
| Responsable initial | Gestion des comptes et droits éditoriaux |
| Administrateur | Gestion des comptes et droits éditoriaux |
| Éditeur Breakfast | Préparation et programmation des Breakfasts |

Les nouveaux comptes reçoivent un mot de passe temporaire affiché une fois à l’opérateur. Celui-ci le transmet personnellement au destinataire. Le changement est obligatoire à la première connexion. Aucun formulaire d’inscription publique n’est proposé dans l’administration.

Les permissions éditoriales sont définies côté API. Les écrans de rédaction et de programmation sont disponibles pour la préparation locale ; leur publication centralisée reste à raccorder. La récupération du mot de passe, la modification/retrait des rôles et les périmètres par communauté restent à réaliser, selon [MODULES_ADMINISTRATION.md](./MODULES_ADMINISTRATION.md).

## Vérifier

```bash
npm test
npm run lint
npm run typecheck
npm run build
```

Les tests d’autorisation et de changement obligatoire sont dans `../koinonia-api/tests/admin.test.ts`. La compilation produit `dist/`.

## Déploiement

Configurer un repli SPA vers `index.html` pour les routes de navigation (`/breakfasts`, `/membres`, etc.), en laissant `/api` au reverse proxy. Servir `dist/` en HTTPS et configurer un reverse proxy de la même origine pour `/api` vers Koinonia API. Le proxy Vite fonctionne uniquement en développement. Ajouter l’origine publique de l’administration dans `TRUSTED_ORIGINS` côté API. Les cookies sont marqués Secure lorsque `NODE_ENV=production`.

Les identifiants PostgreSQL et secrets restent côté API. Aucun secret ne doit être ajouté aux variables publiques `VITE_*`.

## Diagnostic des erreurs en développement

`my-bad` est activé comme plugin Vite : les erreurs de compilation affichent le fichier, la ligne et le contexte dans une superposition sur la page. Il n’est pas ajouté au bundle de production. Les erreurs HTTP de l’API restent affichées dans les formulaires ; leur trace serveur détaillée est disponible dans le terminal de `koinonia-api`.

Une indisponibilité de Neon ou de Better Auth est distinguée d’un mot de passe incorrect. Si la base ne répond pas, l’API renvoie `DATABASE_UNAVAILABLE` avec un statut 503, au lieu d’un message générique de connexion.

## Espace de gestion

La plateforme reprend la charte de l’app : ivoire, surfaces blanches, vert profond, bleu nuit, Montserrat/Poppins, photographies et couvertures originales. La sidebar est regroupée par métier et devient un tiroir sur mobile. Le header, la recherche globale, le compte et les messages préparés sont partagés par les pages.

| Rubrique | Pages et interactions |
| --- | --- |
| Vue d’ensemble | Dashboard, compteurs dérivés des données présentes, statistiques, prochaines publications et activité |
| Breakfasts | Liste/grille, recherche, filtres, pagination, duplication, archivage local et export CSV |
| Rédaction | Texte, référence, auteur, thèmes, couvertures de lecture, vidéo/PDF et prévisualisation |
| Programmation | Calendrier mensuel, journée sélectionnée et contrôle des dates futures en heure de Douala |
| Médiathèque | Recherche, types, sélection et détails des références de fichiers |
| Diffusion Facebook | Composition d’un message et copie du texte, état de connexion explicite |
| Communauté | Fiches membres, communautés, adhésions, conversations et traitement des signalements |
| Communication | Événements informatifs, brouillons de notifications et aperçu du message |
| Bible | Consultation des livres/chapitres LSG 1910 et références de versets |
| Administration | Comptes de l’équipe, permissions visibles, préférences, journal et profil |
| Accompagnement | Aide, explication des sources et modules prévus après le lancement |

### Sources et limites

- **Service central existant** : authentification, première connexion, liste et création des comptes de gestion via `/api/admin` ; consultation des Breakfasts via `/api/breakfasts` et de la Bible via `/api/bible`.
- **Préparation locale** : contenus, programmations, fiches membres, communautés, adhésions, messages, événements, notifications et préférences. Ces données persistent dans ce navigateur, par identité administrative. Elles ne sont pas publiées dans l’app et ne constituent pas un journal serveur.
- **Fichiers** : la sélection conserve une référence descriptive. Les octets ne sont ni téléversés ni sauvegardés par cet écran. Les URL de médias déjà publiés restent fournies par l’API.
- **Permissions** : la navigation et les pages de gestion sont adaptées au rôle. Les endpoints existants conservent leurs contrôles côté API ; les futurs endpoints métier devront appliquer leurs propres autorisations.
- **Mesure** : les statistiques comptent les données disponibles. Les vues, utilisateurs actifs et temps de lecture ne sont pas simulés dans l’espace connecté.

### Aperçu de développement

Ouvrir `http://localhost:5173/?apercu=1` pour parcourir les pages avec des exemples identifiés. Ce mode est disponible uniquement avec Vite en développement. Il n’interroge pas les endpoints administratifs, ne crée aucun compte et utilise un stockage séparé. L’authentification et le changement obligatoire de mot de passe restent requis dans la version de production.

### Organisation du code

`src/workspace/Workspace.tsx` porte la structure et les routes ; `navigation.ts` déclare les rubriques. Les pages métier sont regroupées dans `pages/`. `context.ts` et `store.tsx` séparent les données de préparation, les requêtes publiques et leurs erreurs. `model.ts` contient validation, lecture du stockage et export. Les composants partagés sont dans `ui.tsx` et le gestionnaire de comptes existant dans `src/components/AccountManagement.tsx`.

### Vérification de ce lot

Les huit tests de `tests/workspace.test.mjs` couvrent la conservation des brouillons, la reprise après données invalides, les dates de programmation, le fuseau Douala et l’échappement des exports CSV. Les parcours de création/rechargement d’un brouillon et d’une fiche membre, la recherche globale et la navigation ont été exercés dans Chrome. Le calendrier et la navigation ont aussi été examinés à 390 px de large. Cette vérification frontend ne remplace pas la recette des futures écritures métier sur l’API.
