# Koinonia Admin

Administration React, TypeScript et Vite utilisant le même univers visuel que Koinonia App : logo, typographies Montserrat/Poppins, vert et bleu nuit, illustration et photographie locales.

## Démarrer

Node.js 22.12 ou supérieur, compatible avec Vite.

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

Les permissions éditoriales sont définies côté API. Les écrans de création et de programmation des Breakfasts appartiennent au prochain lot. La récupération du mot de passe, la modification/retrait des rôles et les périmètres par communauté restent à réaliser, selon [MODULES_ADMINISTRATION.md](./MODULES_ADMINISTRATION.md).

## Vérifier

```bash
npm run lint
npm run typecheck
npm run build
```

Les tests d’autorisation et de changement obligatoire sont dans `../koinonia-api/tests/admin.test.ts`. La compilation produit `dist/`.

## Déploiement

Servir `dist/` en HTTPS et configurer un reverse proxy de la même origine pour `/api` vers Koinonia API. Le proxy Vite fonctionne uniquement en développement. Ajouter l’origine publique de l’administration dans `TRUSTED_ORIGINS` côté API. Les cookies sont marqués Secure lorsque `NODE_ENV=production`.

Les identifiants PostgreSQL et secrets restent côté API. Aucun secret ne doit être ajouté aux variables publiques `VITE_*`.

## Diagnostic des erreurs en développement

`my-bad` est activé comme plugin Vite : les erreurs de compilation affichent le fichier, la ligne et le contexte dans une superposition sur la page. Il n’est pas ajouté au bundle de production. Les erreurs HTTP de l’API restent affichées dans les formulaires ; leur trace serveur détaillée est disponible dans le terminal de `koinonia-api`.

Une indisponibilité de Neon ou de Better Auth est distinguée d’un mot de passe incorrect. Si la base ne répond pas, l’API renvoie `DATABASE_UNAVAILABLE` avec un statut 503, au lieu d’un message générique de connexion.
