# Architecture du Backend (Node.js / Express / Mongoose)

Ce dossier contient l'application serveur de la solution de gestion d'emploi du temps **MEVN**.

## Structure des Dossiers

- **`config/`** : Configuration système (connexion MongoDB `db.js`, référentiel de créneaux `slots.js`, config JWT `jwt.js`).
- **`controllers/`** : Contrôleurs HTTP qui reçoivent les requêtes, orchestrent la logique métier et renvoient les réponses JSON.
- **`middlewares/`** : Guards de sécurité (`authMiddleware.js` pour la vérification du Token JWT, `roleMiddleware.js` pour les autorisations RBAC).
- **`Models/`** : Schémas Mongoose pour MongoDB (`User.js`, `Salle.js`, `Group.js`, `Subject.js`, `Cours.js` / `ScheduleSlot`, `Indisponibilite.js`, `Alerte.js`).
- **`routes/`** : Endpoints REST Express associant les routes HTTP aux contrôleurs.
- **`services/`** : Moteur de détection de conflits `conflictChecker.js` (source de vérité unique pour valider la non-chevauchement des salles, enseignants et groupes).

## Rôle des Fichiers Clés

- **`src/index.js`** : Fichier de démarrage du serveur Node.js (charge l'environnement, se connecte à la DB, lance le serveur).
- **`src/app.js`** : Application Express configurée avec les middlewares globaux (CORS, JSON) et la déclaration des routes.
- **`src/config/db.js`** : Module d'établissement de la connexion Mongoose vers MongoDB.
- **`seed.js`** : Script d'initialisation des données de démo.
