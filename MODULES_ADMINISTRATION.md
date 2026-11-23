# Modules de l’administration Koinonia

Document de réalisation · 23 novembre 2026

## Objet et état du projet

Ce document recense les modules de `koinonia-admin`, depuis l’accès des administrateurs jusqu’aux évolutions futures de l’application. Il sert de référence pour les prochains lots de développement.

Le projet utilise React, TypeScript et Vite. Le premier lot comprend désormais la connexion Better Auth, la restauration et la fermeture de session, le changement obligatoire de mot de passe et la création de comptes administratifs avec rôles. Les fonctionnalités métier et les compléments indiqués ci-dessous restent à réaliser.

Le périmètre reprend `../PRODUCT.md`, `../Contexte_et_cadrage_MVP.md` et les décisions suivantes prises depuis le cadrage initial.

- L’administration utilise React et communique avec `koinonia-api`.
- Une fiche Breakfast associe les versions écrite et vidéo sous un même identifiant.
- Chaque format conserve sa préparation, sa programmation et son état de diffusion.
- Le Breakfast mis à la une est présenté une seule fois. Les publications précédentes alimentent l’historique.
- Les quatre Breakfasts provisoires disposent de vidéos, PDF originaux, textes extraits, miniatures vidéo et couvertures de lecture.

## Architecture commune

| Élément | Responsabilité |
| --- | --- |
| `koinonia-admin` | Interface web de l’équipe, formulaires, prévisualisation et suivi des opérations |
| `koinonia-app` | Consultation mobile des contenus publiés et parcours des membres |
| `koinonia-api` | Backend central, autorisations, règles métier, données, publication et accès aux médias |
| PostgreSQL sur Neon | Profils et données métier persistantes |
| Better Auth | Identités administratives indépendantes dans l’API ; Neon Auth conservé pour le mobile |
| Stockage des médias | Stockage local actuel, puis Cloudflare R2 prévu au cadrage |

Les opérations administratives passent par l’API. Les accès PostgreSQL, clés de stockage et jetons Facebook appartiennent au backend. Les variables publiques du navigateur contiennent uniquement les paramètres destinés au client.

Les routes administratives proposées utilisent le préfixe `/api/admin`. Leur contrat sera défini avec les routes publiques déjà consommées par le mobile. Les noms de routes de ce document sont des propositions d’organisation.

## Index des modules

| Module | Périmètre | Première livraison |
| --- | --- | --- |
| 01 · Authentification et sessions | Lancement | Lot 1 |
| 02 · Administrateurs, rôles et permissions | Lancement | Lot 1 |
| 03 · Structure et compte personnel | Lancement | Lot 1 |
| 04 · Tableau de bord | Lancement | Lot 2 |
| 05 · Membres et profils | Lancement | Lot 3 |
| 06 · Gestion éditoriale des Breakfasts | Lancement | Lot 2 |
| 07 · Médiathèque et documents | Lancement | Lot 2 |
| 08 · Calendrier et programmation | Lancement | Lot 2 |
| 09 · Diffusion Facebook | Lancement | Lot 2 |
| 10 · Communautés | Lancement | Lot 3 |
| 11 · Adhésions et accès aux communautés | Lancement | Lot 3 |
| 12 · Conversations et animation | Lancement | Lot 3 |
| 13 · Signalements et modération | Lancement | Lot 3 |
| 14 · Événements informatifs | Lancement | Lot 4 |
| 15 · Notifications | Lancement | Lots 2 à 4 |
| 16 · Bible et verset du jour | Lancement | Lot 4 |
| 17 · Statistiques et tendances | Lancement | Lot 4 |
| 18 · Paramètres de la plateforme | Lancement | Lots 1 à 4 |
| 19 · Journal et suivi des services | Socle d’exploitation | Dès le lot 1 |
| 20 · Cantiques | Reporté | Évolution |
| 21 · Bibliothèque | Reporté | Évolution |
| 22 · Boutique et paiements | Reporté | Évolution |
| 23 · Inscriptions aux événements | Reporté | Évolution |
| 24 · Médias dans les conversations | Reporté | Évolution |
| 25 · Assistant IA et recherche transversale | Reporté | Évolution |

## Modules du lancement

### 01 · Authentification et sessions

**Livré dans le premier lot** : connexion Better Auth, session web HttpOnly indépendante, contrôle d’accès API, déconnexion et changement obligatoire du mot de passe avant accès à la gestion.

**Périmètre complet et compléments à réaliser**

- Connexion avec l’identité existante et accès réservé aux comptes autorisés.
- Restauration de session, expiration, reconnexion et déconnexion.
- Récupération du mot de passe et changement du mot de passe via le fournisseur d’identité.
- Vérification d’adresse lorsque le fournisseur ou la politique retenue l’exige.
- Écrans d’attente, d’échec de connexion et d’accès refusé.
- Retour vers la page demandée après reconnexion, dans le périmètre autorisé.

**Travail API**

Réutiliser la vérification d’identité et ajouter la résolution des droits administratifs. Prévoir un point d’entrée tel que `GET /api/admin/me`. Définir le mécanisme web de session et les origines autorisées avec le fournisseur existant.

**Critère de livraison**

Un membre ordinaire ne peut accéder aux données administratives. Une session expirée déclenche un parcours de reconnexion cohérent.

### 02 · Administrateurs, rôles et permissions

**Livré dans le premier lot** : responsable initial, liste et création des comptes, rôles administrateur et éditeur Breakfast, mot de passe temporaire à usage initial, auteur et date de création enregistrés. Les permissions de rédaction et programmation sont prêtes pour les futurs endpoints métier. Modification, retrait, journal détaillé et périmètres par communauté restent à réaliser.

- Liste des administrateurs et accès à leurs affectations.
- Attribution et retrait des droits par une personne habilitée.
- Rôles de plateforme et affectations limitées à certaines communautés.
- Permissions de consultation, rédaction, publication, modération et configuration.
- Retrait d’accès effectif dans l’API et protection contre la perte du dernier accès d’administration générale.
- Traçabilité de l’auteur et de la date des changements de droits.

Le cadrage confirme deux niveaux, administration de plateforme et administration de communauté. Les rôles d’éditeur ou de modérateur sont des propositions à préciser lors de ce module.

**Critère de livraison**

Chaque opération est vérifiée côté serveur, avec le périmètre de la ressource concernée. Un administrateur de communauté peut agir uniquement sur ses communautés.

### 03 · Structure de l’espace et compte personnel

- Navigation commune, en-tête, fil d’Ariane et pages de détail.
- Menus adaptés aux droits, page introuvable et page d’accès refusé.
- Mise en page utilisable sur ordinateur, tablette et petit écran.
- Profil personnel, préférences d’affichage et actions de compte.
- Composants communs pour tableaux, pagination, filtres, formulaires, confirmations et retours d’état.
- Gestion des formulaires non enregistrés et des erreurs réseau.

**Critère de livraison**

Les écrans partagent les mêmes conventions et restent utilisables au clavier. Les champs et erreurs ont des libellés accessibles.

### 04 · Tableau de bord

- Vue des publications du jour, prochaines publications et brouillons.
- Mise en évidence des échecs de diffusion à reprendre.
- Demandes d’adhésion et signalements en attente selon les droits.
- Indicateurs disponibles et liens vers les listes correspondantes.
- Période et date de mise à jour visibles pour les données chiffrées.

**Critère de livraison**

Chaque indicateur provient de l’API et ouvre un contenu vérifiable. Les données indisponibles ont un état explicite.

### 05 · Membres et profils

- Liste paginée, recherche et filtres des membres.
- Détail du profil, état du compte et communautés rejointes.
- Consultation des informations facultatives selon les droits attribués.
- Blocage et réactivation avec motif administratif.
- Déclenchement du parcours de récupération de compte par le fournisseur.
- Traitement d’une demande de modification ou de suppression selon la politique retenue.
- Distinction entre préférence de communauté enregistrée pendant l’onboarding et demande d’adhésion effective.

**Critère de livraison**

Une action confirmée persiste après rechargement. Les informations d’église ou d’assemblée sont accessibles uniquement aux personnes habilitées.

### 06 · Gestion éditoriale des Breakfasts

- Liste des fiches avec recherche, filtres de date, format et état.
- Création et modification du titre, introduction, corps de texte, référence biblique et auteur lorsque renseigné.
- Association du texte, de son image de couverture, du PDF et de la vidéo sur une fiche commune.
- Formats disponibles indépendamment, avec leurs propres états et horaires.
- Prévisualisation des versions Lire et Regarder.
- Brouillon, publication immédiate, programmation, dépublication et archivage.
- Recherche dans tout l’historique publié, indépendamment de la période affichée par le membre.
- Reprise des quatre Breakfasts et de leurs ressources dans les données administrables.

**Travail API**

Remplacer progressivement le catalogue défini dans le code par des fiches persistantes. Préserver les identifiants existants et les références de lecture ou de téléchargement.

**Critère de livraison**

Une modification publiée apparaît sur la bonne fiche mobile. Le contenu du jour apparaît une fois et les publications précédentes sont ordonnées dans l’historique.

### 07 · Médiathèque et documents

- Import des vidéos, couvertures, PDF et ressources associées.
- Association des fichiers à une fiche et visualisation de leurs usages.
- Progression des transferts, reprise des erreurs et contrôle des formats acceptés.
- Extraction des miniatures vidéo et mesure de la durée réelle.
- Conservation des PDF originaux et extraction de texte avec prévisualisation et correction éditoriale.
- Gestion d’un fichier audio ou de sous-titres lorsque ces ressources sont fournies.
- Remplacement d’un média et traitement des fichiers devenus inutilisés.
- Protection des ressources de brouillon et accès aux seuls médias publiés depuis le parcours public.

**Travail API**

Préparer le stockage persistant et l’intégration R2. Les transferts volumineux doivent suivre une stratégie adaptée aux vidéos, avec finalisation contrôlée. Définir les limites de fichiers à partir des contenus réels.

**Critère de livraison**

Le média annoncé disponible existe et peut être lu ou téléchargé. Une extraction défaillante reste visible et peut être reprise.

### 08 · Calendrier éditorial et programmation

- Agenda et liste des publications par jour, heure et format.
- Définition du fuseau éditorial, initialement proposé à `Africa/Douala`.
- Programmation distincte de l’écrit et de la vidéo.
- Modification et annulation d’une programmation avant exécution.
- Traitement des conflits de mise à la une pour un même format.
- Suivi des états prévus, en cours, publiés et échoués.
- Reprise après une indisponibilité du serveur et suivi des tentatives.

**Critère de livraison**

Une publication est diffusée à l’échéance prévue. Une reprise du traitement ne crée pas de doublon. Un contenu futur reste absent des routes publiques jusqu’à sa publication.

### 09 · Diffusion Facebook

La publication sur la page Facebook du mouvement fait partie du MVP confirmé.

- Connexion de la page avec les autorisations nécessaires.
- Choix des destinations lors de la publication et de la programmation.
- Création distincte d’un post texte-image et d’une publication vidéo.
- États de diffusion séparés pour Koinonia et Facebook.
- Lien vers la publication distante et suivi de son identifiant.
- Gestion d’un jeton expiré, d’une permission retirée et d’un échec de diffusion.
- Relance ciblée et prévention des publications en double.

**Dépendance**

Choisir et vérifier l’intégration directe ou un prestataire à la réalisation. Les conditions commerciales mentionnées dans les anciens documents doivent être vérifiées à cette occasion.

**Critère de livraison**

Une publication de test autorisée est visible sur la page réelle. Son état est confirmé dans l’administration.

### 10 · Communautés

- Création, modification et archivage des communautés.
- Nom, description, image et informations de découverte.
- Affectation de leurs administrateurs.
- Liste et gestion des membres.
- Réglage de l’écriture ouverte ou réservée aux administrateurs.
- Préservation de la consultation des conversations autorisées lors des changements d’état.

**Critère de livraison**

Le paramétrage enregistré est appliqué dans l’app et contrôlé par l’API.

### 11 · Adhésions et accès aux communautés

- Liste des demandes en attente, acceptées et refusées.
- Détail d’une demande et décision d’un administrateur habilité.
- Motif de refus facultatif.
- Gestion de plusieurs demandes du même membre vers des communautés différentes.
- Retour de l’état au membre et notification de la décision lorsque prévue.
- Traitement cohérent des décisions répétées ou concurrentes.

**Critère de livraison**

L’acceptation ouvre l’accès à la bonne communauté et un refus conserve son état consultable par le demandeur.

### 12 · Conversations et animation des communautés

- Consultation et publication des messages texte avec émojis.
- Animation des échanges par les administrateurs du groupe.
- Application du mode lecture seule.
- Modération des messages selon les droits.
- Chargement progressif de l’historique et cohérence avec le mobile.
- Gestion des erreurs d’envoi et prévention des messages en double lors d’une relance.

**Critère de livraison**

Un message envoyé apparaît chez les destinataires autorisés. Le mode lecture seule est appliqué par le serveur.

### 13 · Signalements et modération

- Réception des signalements de comptes ou de messages.
- Liste des dossiers à traiter, contexte et historique des décisions.
- Classement sans suite ou action sur un compte, un message ou un accès communautaire.
- Motif, auteur et date de traitement.
- Visibilité limitée au périmètre de modération de l’opérateur.

**Critère de livraison**

Le signalement reçoit un état de traitement explicite et la mesure retenue est appliquée dans l’application.

### 14 · Événements informatifs

- Liste, création, modification, publication et archivage.
- Titre, description, dates, horaires, lieu, visuel et lien utile selon les besoins confirmés.
- Mise à la une avec période de début et de fin.
- Prévisualisation et cohérence avec les fiches mobiles.
- Gestion d’un événement annulé ou terminé.

Les inscriptions et la gestion de places appartiennent au module futur 23.

**Critère de livraison**

Un événement publié apparaît aux emplacements prévus et sa mise à la une expire à l’échéance définie.

### 15 · Notifications

- Modèles et déclencheurs pour les Breakfasts, messages communautaires et décisions d’adhésion.
- Liens ouvrant la bonne fiche ou conversation dans l’application.
- Envois ciblés par communauté et respect des préférences du membre.
- Suivi de file, réussite technique, erreur et relance.
- Mise à jour des jetons d’appareil invalides.
- Prévention des notifications en double.
- Messages administratifs généraux si ce besoin est confirmé.

**Dépendance**

Choisir le service de notifications et tester les appareils réels.

**Critère de livraison**

Les notifications reçues correspondent aux préférences autorisées. Distinguer la confirmation technique du fournisseur de la lecture effective par le membre.

### 16 · Bible et verset du jour

- Consultation du corpus Louis Segond 1910 déjà importé.
- Contrôle de la disponibilité des livres, chapitres et recherches.
- Suivi de la génération et du calendrier des versets du jour.
- Détection d’un échec du traitement et relance maîtrisée.
- Consultation de la provenance du corpus et des opérations d’import.

Le besoin porte sur la gestion du service et du calendrier. Une fonction de correction du texte biblique demanderait une décision éditoriale spécifique.

**Critère de livraison**

Le verset du jour correspond à une référence existante et le corpus reste cohérent avec les données mobiles.

### 17 · Statistiques et tendances

- Évolution du nombre de membres et des inscriptions.
- Indicateurs d’activité disponibles pour les Breakfasts et communautés.
- Répartition agrégée par pays, ville et centres d’intérêt lorsque les données sont renseignées.
- Filtres par période et définition visible des indicateurs.
- Consultation des tendances utiles à la programmation éditoriale.
- Exports agrégés si leur utilité est confirmée.

**Travail API**

Définir les événements réellement collectés et les agrégations avant d’afficher les indicateurs. Réduire les informations personnelles accessibles à chaque rôle.

**Critère de livraison**

Les chiffres sont reproductibles sur une période donnée et leur méthode de calcul est connue.

### 18 · Paramètres de la plateforme

- Informations et coordonnées du mouvement.
- Ressources d’identité et textes d’aide administrables.
- Centres d’intérêt et catégories de contenus.
- Choix d’historique proposés aux membres.
- Fuseau éditorial et valeurs par défaut pertinentes.
- Informations de contact, confidentialité et conditions d’utilisation approuvées.
- État des connexions Facebook, stockage et notifications pour les personnes habilitées.

**Critère de livraison**

Les paramètres enregistrés sont persistants et leur effet est visible dans les interfaces concernées. Les secrets des services restent gérés côté serveur.

### 19 · Journal des actions et suivi des services

- Historique des changements de droits, publications, décisions de modération et réglages sensibles.
- Auteur, ressource concernée, action, date et résultat.
- Suivi des tâches de publication, imports, extractions et notifications.
- Diagnostic d’une erreur avec un identifiant de suivi exploitable.
- Consultation des états de services et des dernières opérations pertinentes.
- Procédure de sauvegarde et de restauration des données et références de médias.
- Affichage d’un résultat de sauvegarde uniquement après vérification de l’opération.

**Critère de livraison**

Une action administrative importante peut être retrouvée et reliée à son résultat. Les journaux accessibles dans le navigateur excluent les jetons et mots de passe.

## Modules reportés et évolutions futures

### 20 · Cantiques

Administrer les recueils, paroles, classements et recherche lorsque les droits de diffusion et la source des textes seront établis. Cette rubrique est actuellement en pause.

### 21 · Bibliothèque

Gérer les ouvrages, auteurs, catégories, couvertures, fichiers, droits de diffusion et disponibilité des ressources. Le modèle de consultation ou de téléchargement reste à préciser.

### 22 · Boutique et paiements

Administrer les produits payants, prix, commandes, paiements, remboursements et droits d’accès après achat. Le prestataire de paiement, les règles commerciales et le périmètre de vente restent à décider.

### 23 · Inscriptions aux événements

Gérer les formulaires, participants, quotas éventuels, confirmations et annulations. Les événements du MVP restent informatifs jusqu’à validation de cette extension.

### 24 · Médias dans les conversations

Étendre les échanges aux images, fichiers audio et vidéos, avec stockage, limites, consultation et modération adaptés. Les conversations du lancement restent centrées sur le texte et les émojis.

### 25 · Assistant IA et recherche transversale

Administrer les sources autorisées, l’indexation, les traitements et le suivi de qualité d’un assistant de méditation. Prévoir la recherche dans les Breakfasts, la Bible et la bibliothèque, avec références vérifiables. Les modèles, l’hébergement, les coûts et les droits d’utilisation restent à définir.

## Ordre de réalisation

| Lot | Résultat utilisateur attendu | Modules principaux |
| --- | --- | --- |
| 1 | Un administrateur autorisé se connecte à un espace navigable | 01, 02, 03, premiers paramètres et journal |
| 2 | L’équipe prépare un Breakfast et le retrouve publié dans l’app et sur Facebook | 04, 06, 07, 08, 09, notifications de publication |
| 3 | Les administrateurs gèrent leurs communautés et les demandes des membres | 05, 10, 11, 12, 13, notifications communautaires |
| 4 | Les fonctions restantes du lancement sont administrables | 14, 16, 17 et finalisation de 15, 18, 19 |
| Évolutions | Les fonctions reportées sont cadrées puis ajoutées selon les priorités | 20 à 25 |

La première tranche fonctionnelle complète du lot 2 doit couvrir la création d’une fiche, l’import de ses ressources, sa programmation, sa publication et sa consultation mobile avec le même identifiant.

## Préparation nécessaire dans le backend

| Chantier | Résultat attendu |
| --- | --- |
| Autorisations | Droits administratifs persistants reliés aux identités vérifiées |
| API web | Session navigateur et configuration des origines autorisées |
| Données éditoriales | Fiches, variantes, dates et états stockés en PostgreSQL |
| Médias | Ressources persistantes avec contrôle de disponibilité et d’accès |
| Migration initiale | Reprise des quatre Breakfasts et conservation de leurs identifiants |
| Publication | Traitements planifiés avec relance et suivi de chaque destination |
| Communautés | Modèles de groupes, affectations, demandes et messages |
| Notifications | Préférences, appareils, événements et résultat des envois |
| Mesure et journal | Événements d’usage définis et opérations administratives traçables |

Le middleware actuel des écritures de profil mobile utilise un marqueur de client mobile. Le parcours web d’administration devra disposer de son propre contrat d’accès, avec les contrôles d’origine et d’autorisation correspondants.

## Vérifications communes à chaque livraison

- Le parcours est exercé dans l’administration et confirmé dans l’API.
- Une création ou modification est relue après rechargement.
- Les droits sont vérifiés sur les points d’entrée serveur.
- Les erreurs, refus, transferts interrompus et relances pertinents sont couverts.
- Les routes publiques et la consommation mobile restent compatibles avec le contrat validé.
- Les listes utilisent recherche, filtres et pagination adaptés à leur volume.
- Les écrans sont vérifiés au clavier, sur petit écran et avec texte agrandi.
- Une opération longue affiche sa progression ou son état observable.
- Les traitements programmés et la diffusion externe sont vérifiés sur des services réels de test avant d’être annoncés opérationnels.

## Sources et décisions à reprendre

- `../PRODUCT.md` pour les capacités et priorités du produit.
- `../Contexte_et_cadrage_MVP.md` pour le périmètre initial et les fonctions reportées.
- `../design/DESIGN_SYSTEM_KOINONIA.md` pour l’identité et les conventions visuelles.
- `../koinonia-api/README.md` pour l’architecture et les services existants.
- Les décisions de cette conversation priment sur les propositions anciennes concernant le choix de React et l’association des formats.

Les détails de l’outillage frontend et de la gestion des variables publiques suivent les documentations officielles. [Vite](https://vite.dev/guide/) · [Variables d’environnement Vite](https://vite.dev/guide/env-and-mode.html)

Les contrôles d’accès seront mis en œuvre à chaque requête administrative et avec le périmètre de la ressource. [OWASP Authorization Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html)
