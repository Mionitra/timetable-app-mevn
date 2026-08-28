**Stack :** Vue, TypeScript, Tailwind, MongoDB, Express, Node.js.

**Règles :** Utilise des composants fonctionnels, ne modifie pas les fichiers hors de la tâche demandée, écris des types stricts, n'ajoute aucune nouvelle dépendance sans demander.

**Rôle :** Agis comme un Expert Développeur Fullstack MEVN (MongoDB, Express, Vue 3, Node).

### **Respect strict de l'architecture existante :**

Avant de générer ou de modifier du code, analyse l'architecture, les patterns et les conventions de nommage déjà présents dans le projet.

**Conformité :** Suis scrupuleusement la structure de dossiers, la gestion d'état, la gestion des erreurs et le style de code existants.

**Réutilisation :** N'invente pas de nouveaux patterns ou utilitaires si une solution équivalente existe déjà dans le projet. Réutilise les composants et utilitaires existants.

**Consistance :** Le code généré doit être indiscernable du reste de la codebase.

**Avertissement :** Si ma demande nécessite de dévier de l'architecture actuelle, signale-le-moi et demande mon accord avant d'écrire le code.

# Cahier des Charges Technique et Fonctionnel v5
## Projet : Gestion d'Emploi du Temps (Stack MEVN)

> Ce document est écrit pour être consommé directement par un agent de développement (humain ou IA). Chaque section vise l'exhaustivité : règles métier, contrats d'API, schéma de données, structure de dossiers, cas limites. L'objectif est qu'aucune décision d'implémentation majeure ne soit laissée à l'interprétation.

---

## 0. Résumé Exécutif

- **Nom du projet** : Gestion d'Emploi du Temps (EDT)
- **Stack** : MongoDB, Express.js, Vue.js (Vue 3 + Vuex), Node.js — 100% local, aucun déploiement cloud requis
- **Utilisateurs** : Admin, Enseignant, Étudiant
- **Cœur fonctionnel** : construction manuelle/assistée d'un emploi du temps hebdomadaire par groupe, avec détection de conflits en temps réel (salle / enseignant / groupe), publication contrôlée, consultation en lecture seule et export PDF côté étudiant.
- **Contrainte de délai** : livraison réaliste en 4-5 jours de développement → le périmètre MVP défini en section 2 est un plafond, pas un plancher à dépasser sans arbitrage.

---

## 1. Corrections Apportées à la v4 (Traçabilité des Décisions)

| # | Incohérence détectée dans v4 | Décision retenue en v5 | Justification |
|---|---|---|---|
| 1 | Stack annoncée MEVN (MongoDB) mais schéma fourni en `CREATE TABLE` SQL | **MongoDB / Mongoose** exclusivement. Le schéma complet est réécrit en section 3. | Cohérence avec l'acronyme MEVN et avec l'environnement local déjà en place. |
| 2 | Créneaux définis à la fois comme horaires fixes 1h (`RF-CAL-01`) et comme couple `start_time`/`end_time` avec `start_date`/`end_date` globaux | Un **index de créneau** (`slotIndex`, entier 1 à 10) fixe et documenté (voir table des créneaux en 2.3), combiné à `dayOfWeek` (1-5) et `weekNumber` + `year`. Aucune donnée `Date`/`Time` libre n'est stockée pour les créneaux. | Simplifie radicalement la détection de conflits (comparaison d'entiers) et l'édition interactive (clic sur une cellule de grille = un triplet `(dayOfWeek, slotIndex, weekNumber)`). |
| 3 | Ambiguïté sur l'état de publication et la semaine ciblée à la création d'un cours | Séparation stricte : chaque `ScheduleSlot` porte un flag `isPublished` (par défaut `false`). Un cours n'est visible côté étudiant que si `isPublished = true` **et** que sa semaine correspond à la semaine consultée. L'admin choisit explicitement la semaine cible avant toute édition (voir Module D). | Élimine les cas où un étudiant verrait un cours en cours de construction. |
| 4 | Relations SQL par clés étrangères (`FOREIGN KEY ... REFERENCES`) | Remplacées par des **références Mongoose** (`ObjectId` + `ref`), avec un choix explicite embed vs référence justifié par document (section 3.1). | MongoDB n'a pas de contraintes FK natives ; il faut documenter où la cohérence est garantie applicativement. |

---

## 2. Périmètre Fonctionnel

### 2.1 Rôles et Permissions (RBAC)

| Rôle | Peut faire | Ne peut pas faire |
|---|---|---|
| `admin` | CRUD salles, groupes, matières, enseignants ; valider/activer un compte étudiant ; créer/modifier/supprimer des `ScheduleSlot` (brouillon et publié) ; publier/dépublier un emploi du temps ; consulter tous les emplois du temps et toutes les indisponibilités | Modifier son propre rôle |
| `teacher` | Déclarer/supprimer ses propres indisponibilités ; consulter son planning personnel (tous groupes confondus, cours publiés uniquement) | Modifier un `ScheduleSlot` ; voir le planning d'un autre enseignant ; voir un emploi du temps non publié |
| `student` | Consulter l'emploi du temps publié de son groupe ; exporter en PDF | Voir un autre groupe ; voir un cours `isPublished = false` ; modifier quoi que ce soit |

Un utilisateur non authentifié ne peut accéder qu'à : la page de connexion et le formulaire d'inscription étudiant.

### 2.2 Schéma Global des Flux

```
                       ┌────────────────────────────────────────┐
                       │           SYSTÈME D'AUTH (JWT)          │
                       │   Access token (courte durée, ~1h)      │
                       │   + refresh token (localStorage/cookie) │
                       └───────────────────┬────────────────────┘
                                            │
         ┌──────────────────────────────────┼──────────────────────────────────┐
         ▼                                  ▼                                  ▼
┌──────────────────┐               ┌──────────────────┐               ┌──────────────────┐
│      ADMIN        │               │    ENSEIGNANT     │               │     ÉTUDIANT       │
├────────────────────┤               ├────────────────────┤               ├────────────────────┤
│ • Valider élèves    │               │ • Déclarer          │               │ • Consulter EDT     │
│ • CRUD Salles       │               │   indisponibilités  │               │   publié de son     │
│ • CRUD Groupes      │               │ • Consulter son     │               │   groupe            │
│ • CRUD Matières     │               │   planning          │               │ • Export PDF        │
│ • CRUD Enseignants  │               │   personnel          │               │ • Header simplifié  │
│ • Édition EDT        │               │                     │               │                     │
│   interactive        │               │                     │               │                     │
│ • Publier/dépublier   │               │                     │               │                     │
└──────────────────────┘               └──────────────────────┘               └──────────────────────┘
```

### 2.3 Table des Créneaux (Référentiel Fixe)

Ce référentiel doit être codé en dur dans `backend/config/slots.js` (ou équivalent) et réutilisé côté frontend pour garantir la cohérence d'affichage.

| slotIndex | Heure indicative | Notes |
|---|---|---|
| 1 | 07h00 - 08h00 | |
| 2 | 08h00 - 09h00 | |
| 3 | 09h00 - 10h00 | |
| 4 | 10h15 - 11h15 | pause de 15 min avant |
| 5 | 11h15 - 12h15 | |
| 6 | 12h15 - 13h15 | pause déjeuner possible après (à valider avec l'utilisateur, non bloquant pour le MVP) |
| 7 | 14h00 - 15h00 | |
| 8 | 15h00 - 16h00 | |
| 9 | 16h15 - 17h15 | |
| 10 | 17h15 - 18h15 | |

`dayOfWeek` : entier 1 (Lundi) à 5 (Vendredi). Le samedi/dimanche sont hors périmètre MVP.

### 2.4 Module A — Authentification & Sécurité

**RF-AUTH-01 — Inscription étudiante**
- Formulaire public : nom, prénom, email institutionnel, mot de passe, groupe cible (sélection dans une liste existante), matricule étudiant (`studentId`).
- À la création : `isActive = false`, `role = 'student'`.
- Un compte inactif ne peut pas obtenir de token JWT en se connectant → l'API `/auth/login` doit retourner une erreur explicite `403 ACCOUNT_PENDING_ACTIVATION` (pas un `401` générique, pour permettre au frontend d'afficher un message distinct de "mauvais mot de passe").

**RF-AUTH-02 — Activation par l'admin**
- Vue admin listant tous les comptes `role='student'` et `isActive=false`.
- Action "Activer" → `PATCH /api/users/:id/activate` → passe `isActive` à `true`. Aucun email n'est requis (pas de service de mail dans le périmètre local).

**RF-AUTH-03 — Création d'un enseignant**
- Formulaire admin uniquement : nom, prénom, email, `teacherType` (permanent/vacataire), `discipline`.
- Génération d'un mot de passe temporaire affiché une seule fois à l'admin à la création (pas d'envoi automatique). L'enseignant est créé avec `isActive = true` directement (pas de workflow de validation, contrairement aux étudiants).

**RF-AUTH-04 — Connexion & JWT**
- `POST /api/auth/login` → `{ email, password }` → retourne `{ accessToken, user }`.
- Le token embarque `{ userId, role }`.
- Middleware `authGuard` : vérifie et décode le token, injecte `req.user`.
- Middleware `roleGuard(...roles)` : à poser sur chaque route sensible, retourne `403 FORBIDDEN` si le rôle ne correspond pas.

### 2.5 Module B — Administration & Référentiels

**RF-ADMIN-01 — Salles**
- CRUD complet : `name`, `capacite` (entier > 0), `batiment` (optionnel).
- Champ `isOccupied` retiré du modèle persistant (voir note en 3.3) : l'occupation est **calculée dynamiquement** à partir des `ScheduleSlot` existants pour un `(dayOfWeek, slotIndex, weekNumber)` donné, jamais stockée en dur (sinon désynchronisation garantie).

**RF-ADMIN-02 — Groupes**
- CRUD : `name` (ex: "L3-Info-A"), `promotion`/niveau, effectif indicatif.

**RF-ADMIN-03 — Matières**
- CRUD : `name`, `semester`, `volumeHoraireCreneaux` (nombre de créneaux total sur le semestre, utilisé uniquement à titre indicatif/reporting, pas de blocage automatique si dépassé dans le MVP).

**RF-ADMIN-04 — Enseignants**
- Liste, modification de `discipline`/`teacherType`, désactivation d'un compte (pas de suppression physique, pour préserver l'historique des `ScheduleSlot` déjà créés — voir 3.1 sur l'intégrité référentielle).

### 2.6 Module C — Moteur de Détection de Conflits (`conflictChecker`)

**Règle absolue : aucune écriture en base ne doit jamais créer un conflit, brouillon ou publié confondus.** Le brouillon n'est pas une exemption à la validation — il permet seulement de ne pas être visible des étudiants.

Avant toute création ou modification d'un `ScheduleSlot`, le backend exécute `conflictChecker.check(payload)` qui vérifie, pour le triplet `(weekNumber, year, dayOfWeek, slotIndex)` cible :

1. **Conflit de salle** : existe-t-il déjà un `ScheduleSlot` avec le même `salleId` sur ce triplet (en excluant l'éventuel document en cours d'édition par son `_id`) ?
2. **Conflit enseignant** :
   a. Existe-t-il déjà un `ScheduleSlot` avec le même `teacherId` sur ce triplet ?
   b. L'enseignant a-t-il déclaré une `Indisponibilite` couvrant ce `(dayOfWeek, slotIndex)` (les indisponibilités sont récurrentes par défaut, non liées à une semaine précise — voir 3.1) ?
3. **Conflit de groupe** : existe-t-il déjà un `ScheduleSlot` avec le même `groupId` sur ce triplet ?

Si un conflit est détecté, l'API retourne `409 CONFLICT` avec un corps structuré :
```json
{
  "error": "SCHEDULE_CONFLICT",
  "conflicts": [
    { "type": "SALLE", "message": "Salle B12 déjà occupée à ce créneau" },
    { "type": "TEACHER_UNAVAILABLE", "message": "Enseignant indisponible sur ce créneau" }
  ]
}
```
Le frontend doit afficher **tous** les conflits retournés, pas seulement le premier, pour éviter les allers-retours répétés.

Le service `conflictChecker` est appelé aux deux points d'entrée suivants, sans dupliquer la logique :
- `POST /api/slots/check-conflict` (vérification à la volée, sans écriture, utilisée par le frontend avant de soumettre le formulaire — améliore l'UX en évitant une soumission qui échoue)
- En interne, avant tout `POST /api/slots` ou `PUT /api/slots/:id`

### 2.7 Module D — Interface d'Édition Interactive (Admin)

**Prérequis avant toute édition** : l'admin sélectionne obligatoirement, via deux dropdowns en haut de la vue :
1. `groupId` cible
2. `weekNumber` + `year` cible (la semaine courante est proposée par défaut mais reste modifiable — la contrainte "hors semaine courante" de la v4 est levée : elle n'apporte pas de valeur métier claire et complexifie inutilement l'UX)

**Comportement de la grille (haut de l'écran)** :
- Grille 5 colonnes (jours) × 10 lignes (créneaux), rendue à partir des `ScheduleSlot` existants pour `(groupId, weekNumber, year)` sélectionnés.
- Chaque cellule occupée affiche : nom de la matière, type (CM/TD/TP), nom de l'enseignant, salle.
- Cellule vide → couleur neutre, cliquable.
- Cellule occupée → couleur selon `isPublished` (ex: gris = brouillon, vert = publié), cliquable pour édition.

**Comportement du formulaire (bas de l'écran)** :
- Clic sur cellule vide → pré-remplit `dayOfWeek` et `slotIndex` dans le formulaire (lecture seule pour ces deux champs, modifiables uniquement en resélectionnant une autre cellule) ; l'admin complète `subjectId`, `teacherId`, `salleId`, `type`.
- Clic sur cellule occupée → charge le document complet dans le formulaire, avec deux actions possibles : "Enregistrer les modifications" (`PUT /api/slots/:id`) ou "Supprimer" (`DELETE /api/slots/:id`, avec confirmation modale).
- Avant soumission (création ou modification), appel automatique à `check-conflict` ; le bouton de soumission reste désactivé tant qu'un conflit bloquant est présent.
- Toggle `isPublished` disponible : soit par cours individuellement, soit une action globale "Publier toute la semaine pour ce groupe" (`PATCH /api/slots/publish-week`, body `{ groupId, weekNumber, year }`) qui bascule tous les `ScheduleSlot` correspondants à `isPublished = true` en une seule opération atomique.

### 2.8 Module E — Espace Enseignant

**RF-TEACH-01 — Indisponibilités**
- Formulaire simple : sélection de `dayOfWeek` + `slotIndex` (multi-sélection possible via cases à cocher sur une mini-grille 5×10), bouton "Enregistrer".
- Liste des indisponibilités déclarées avec suppression individuelle.
- Ces indisponibilités sont **récurrentes** (pas liées à une `weekNumber`) dans le MVP : elles s'appliquent à toutes les semaines. Une indisponibilité ponctuelle sur une seule semaine est explicitement **hors périmètre MVP**.

**RF-TEACH-02 — Planning personnel**
- Vue lecture seule de tous les `ScheduleSlot` où `teacherId = req.user.id` et `isPublished = true`, filtrable par semaine.

### 2.9 Module F — Espace Étudiant

**RF-STUD-01 — Header simplifié**
- Nom du projet/établissement, nom du profil connecté, bouton déconnexion. Aucune autre navigation.

**RF-STUD-02 — Vue emploi du temps**
- Grille en lecture seule des `ScheduleSlot` où `groupId = req.user.groupId` et `isPublished = true`, pour la semaine sélectionnée (sélecteur de semaine simple, défaut = semaine courante).
- Aucun accès à un autre groupe, même en modifiant l'URL (vérification du `groupId` toujours faite côté backend à partir du token, jamais depuis un paramètre client).

**RF-STUD-03 — Export PDF**
- Bouton "Exporter en PDF" déclenchant `html2pdf.js` côté client sur le conteneur DOM de la grille filtrée actuellement affichée.
- Le PDF doit reproduire fidèlement la grille telle qu'affichée à l'écran (même filtre de semaine, mêmes couleurs/style).

---

## 3. Modèle de Données (MongoDB / Mongoose)

### 3.1 Principes de Modélisation

- **Références plutôt qu'embedding** pour toutes les entités qui ont un cycle de vie propre et sont consultées indépendamment (`User`, `Salle`, `Groupe`, `Matiere`, `ScheduleSlot`, `Indisponibilite`). MongoDB n'imposant pas de contrainte d'intégrité référentielle native, **toute suppression d'une entité référencée (salle, groupe, matière, enseignant) doit être un "soft delete"** (`isActive: false` ou `isArchived: true`) plutôt qu'une suppression physique, afin de ne jamais laisser un `ScheduleSlot` pointer vers un document supprimé.
- **Pas d'embedding** de l'historique des `ScheduleSlot` dans `User` ou `Groupe` : le volume et la fréquence de mise à jour indépendante justifient des collections séparées interrogées par index.
- **Index composés obligatoires** sur `schedule_slots` pour la performance de `conflictChecker` (voir 3.2).

### 3.2 Schéma `User`

```javascript
// models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true, trim: true },
  lastName: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['admin', 'teacher', 'student'], required: true, default: 'student' },

  // Champs spécifiques étudiant
  studentId: { type: String, default: null },
  groupId: { type: mongoose.Schema.Types.ObjectId, ref: 'Groupe', default: null },

  // Champs spécifiques enseignant
  teacherType: { type: String, enum: ['permanent', 'vacataire'], default: null },
  discipline: { type: String, default: null },

  isActive: { type: Boolean, default: false },
}, { timestamps: true });

userSchema.index({ role: 1, isActive: 1 }); // pour la liste "étudiants en attente d'activation"

module.exports = mongoose.model('User', userSchema);
```

### 3.3 Schéma `Salle`

```javascript
// models/Salle.js
const salleSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true, trim: true },
  capacite: { type: Number, required: true, min: 1 },
  batiment: { type: String, default: null },
  isArchived: { type: Boolean, default: false }, // soft delete
}, { timestamps: true });

module.exports = mongoose.model('Salle', salleSchema);
```
Note : `isOccupied` n'est pas persisté (voir RF-ADMIN-01) ; il se calcule à la demande via une requête sur `ScheduleSlot`.

### 3.4 Schéma `Groupe`

```javascript
// models/Groupe.js
const groupeSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true, trim: true }, // ex: "L3-Info-A"
  promotion: { type: String, required: true },
  effectifIndicatif: { type: Number, default: null },
  isArchived: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('Groupe', groupeSchema);
```

### 3.5 Schéma `Matiere`

```javascript
// models/Matiere.js
const matiereSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  semester: { type: String, required: true }, // ex: "S5"
  volumeHoraireCreneaux: { type: Number, default: null },
  isArchived: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('Matiere', matiereSchema);
```

### 3.6 Schéma `Indisponibilite`

```javascript
// models/Indisponibilite.js
const indisponibiliteSchema = new mongoose.Schema({
  teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  dayOfWeek: { type: Number, required: true, min: 1, max: 5 },
  slotIndex: { type: Number, required: true, min: 1, max: 10 },
}, { timestamps: true });

indisponibiliteSchema.index({ teacherId: 1, dayOfWeek: 1, slotIndex: 1 }, { unique: true }); // évite les doublons

module.exports = mongoose.model('Indisponibilite', indisponibiliteSchema);
```

### 3.7 Schéma `ScheduleSlot` (cœur du système)

```javascript
// models/ScheduleSlot.js
const scheduleSlotSchema = new mongoose.Schema({
  weekNumber: { type: Number, required: true, min: 1, max: 53 },
  year: { type: Number, required: true },

  groupId: { type: mongoose.Schema.Types.ObjectId, ref: 'Groupe', required: true },
  subjectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Matiere', required: true },
  teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  salleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Salle', required: true },

  dayOfWeek: { type: Number, required: true, min: 1, max: 5 },
  slotIndex: { type: Number, required: true, min: 1, max: 10 },

  type: { type: String, enum: ['CM', 'TD', 'TP'], required: true },
  isPublished: { type: Boolean, default: false },
}, { timestamps: true });

// Index critique pour conflictChecker : recherche par créneau + semaine
scheduleSlotSchema.index({ year: 1, weekNumber: 1, dayOfWeek: 1, slotIndex: 1 });
// Index pour la vue "planning enseignant"
scheduleSlotSchema.index({ teacherId: 1, isPublished: 1 });
// Index pour la vue "planning étudiant / grille admin par groupe"
scheduleSlotSchema.index({ groupId: 1, year: 1, weekNumber: 1 });
// Empêche deux cours identiques strictement dupliqués (même salle/créneau/semaine)
scheduleSlotSchema.index(
  { year: 1, weekNumber: 1, dayOfWeek: 1, slotIndex: 1, salleId: 1 },
  { unique: true }
);

module.exports = mongoose.model('ScheduleSlot', scheduleSlotSchema);
```

> ⚠️ L'index unique sur `(year, weekNumber, dayOfWeek, slotIndex, salleId)` garantit au niveau base qu'une même salle ne peut jamais avoir deux cours sur le même créneau — dernier filet de sécurité même en cas de bug applicatif dans `conflictChecker`. Les conflits enseignant/groupe restent uniquement vérifiés en application (une contrainte unique équivalente sur `teacherId` ou `groupId` casserait la légitime coexistence de plusieurs salles sur un même créneau).

---

## 4. Contrat d'API (Routes REST)

| Méthode | Route | Rôle requis | Description |
|---|---|---|---|
| POST | `/api/auth/register` | public | Inscription étudiante (`isActive=false`) |
| POST | `/api/auth/login` | public | Connexion, retourne `accessToken` |
| GET | `/api/users/pending` | admin | Liste des étudiants en attente d'activation |
| PATCH | `/api/users/:id/activate` | admin | Active un compte étudiant |
| POST | `/api/users/teacher` | admin | Crée un compte enseignant |
| GET | `/api/salles` | admin, teacher | Liste des salles actives |
| POST | `/api/salles` | admin | Crée une salle |
| PUT | `/api/salles/:id` | admin | Modifie une salle |
| DELETE | `/api/salles/:id` | admin | Archive une salle (soft delete) |
| GET / POST / PUT / DELETE | `/api/groupes` | admin (lecture ouverte à teacher/student pour leur propre groupe) | CRUD groupes |
| GET / POST / PUT / DELETE | `/api/matieres` | admin | CRUD matières |
| GET | `/api/indisponibilites/me` | teacher | Liste ses propres indisponibilités |
| POST | `/api/indisponibilites` | teacher | Déclare une indisponibilité |
| DELETE | `/api/indisponibilites/:id` | teacher (propriétaire uniquement) | Supprime une indisponibilité |
| POST | `/api/slots/check-conflict` | admin | Vérifie un conflit sans écrire |
| POST | `/api/slots` | admin | Crée un `ScheduleSlot` |
| PUT | `/api/slots/:id` | admin | Modifie un `ScheduleSlot` |
| DELETE | `/api/slots/:id` | admin | Supprime un `ScheduleSlot` |
| PATCH | `/api/slots/publish-week` | admin | Publie tous les slots d'un groupe/semaine |
| GET | `/api/slots?groupId=&weekNumber=&year=` | admin, student (groupe restreint au sien) | Grille pour un groupe/semaine (filtrée `isPublished` selon rôle) |
| GET | `/api/slots/me?weekNumber=&year=` | teacher | Planning personnel publié |

Toutes les routes protégées passent par `authGuard` puis `roleGuard(...)`. Toute erreur métier retourne un corps `{ error: "CODE_ERREUR", message: "..." }` avec un code HTTP cohérent (`400` validation, `401` non authentifié, `403` interdit, `404` non trouvé, `409` conflit).

---

## 5. Architecture & Structure de Projet Cible

```text
mevn-schedule/
├── backend/
│   ├── config/
│   │   ├── db.js            # Connexion Mongoose
│   │   ├── slots.js         # Référentiel des 10 créneaux horaires (section 2.3)
│   │   └── jwt.js           # Config secret/expiration JWT
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── userController.js
│   │   ├── salleController.js
│   │   ├── groupeController.js
│   │   ├── matiereController.js
│   │   ├── indisponibiliteController.js
│   │   └── slotController.js
│   ├── middlewares/
│   │   ├── authGuard.js
│   │   ├── roleGuard.js
│   │   └── errorHandler.js
│   ├── models/               # Schémas Mongoose (section 3)
│   ├── routes/                # Un fichier de routes Express par ressource
│   ├── services/
│   │   └── conflictChecker.js # Source de vérité unique de la détection de conflits (section 2.6)
│   └── app.js
└── frontend/
    ├── src/
    │   ├── assets/            # Styles SCSS/CSS existants, charte graphique — à conserver telle quelle
    │   ├── components/
    │   │   ├── ScheduleGrid.vue     # Grille réutilisable (admin édition / teacher lecture / student lecture)
    │   │   ├── SlotFormModal.vue    # Formulaire de création/édition d'un cours
    │   │   └── ConflictBanner.vue   # Affichage des conflits retournés par l'API
    │   ├── router/             # Vue Router + Navigation Guards par rôle
    │   ├── store/              # Vuex : modules auth, slots, referentiels
    │   └── views/
    │       ├── AdminDashboard.vue
    │       ├── TeacherDashboard.vue
    │       └── StudentDashboard.vue
```

---

## 6. Directives d'Exécution pour l'Agent de Développement

| Règle | Consigne d'exécution |
|---|---|
| **Périmètre existant** | Conservation stricte : ne jamais supprimer ou réécrire un composant fonctionnel déjà en place. Effectuer uniquement des refactorisations ou ajustements ciblés, documentés en commentaire de commit/PR. |
| **Pas de duplication** | Ne pas créer de doublons de fichiers/composants. Nettoyer les fichiers dormants non importés **si et seulement si** leur suppression ne rompt aucune dépendance (vérifier les imports avant suppression). |
| **Documentation in-code** | Ajouter un en-tête `/** ... */` synthétique pour chaque fichier/fonction clé (rôle, entrées, sorties) sans commentaires triviaux ligne par ligne. |
| **Design system** | Conserver la palette de couleurs, le style des formulaires et l'ergonomie visuelle existants — aucune refonte visuelle non demandée. |
| **Source de vérité unique** | Toute logique de détection de conflit doit passer par `services/conflictChecker.js`, jamais dupliquée dans un contrôleur. |
| **Sécurité groupe/rôle** | Ne jamais faire confiance à un `groupId` ou `role` envoyé par le client dans le body/query ; toujours dériver ces valeurs de `req.user` (token décodé) côté backend pour les routes de lecture restreinte (étudiant, enseignant). |
| **Validation d'entrée** | Valider chaque payload (ex: via `express-validator` ou équivalent léger) avant d'atteindre `conflictChecker`, pour ne jamais interroger la base avec des types incohérents (`dayOfWeek` hors 1-5, `slotIndex` hors 1-10, etc.). |
| **Transactions** | `publish-week` (mise à jour de plusieurs documents en une opération logique) doit utiliser une session Mongoose (`startSession`/`withTransaction`) si l'environnement MongoDB local le permet (replica set), sinon documenter explicitement l'absence d'atomicité stricte dans le code. |

---

## 7. Exigences Non-Fonctionnelles

- **Environnement** : exécution 100% locale (MongoDB local ou conteneurisé, pas de service cloud). Aucune variable d'environnement ne doit pointer vers un service tiers payant.
- **Performance** : la vérification de conflit doit répondre en moins de 300ms sur un jeu de données de démonstration (quelques centaines de `ScheduleSlot`) grâce aux index définis en 3.7.
- **Compatibilité navigateur** : cible Chrome/Firefox récents uniquement (pas de support IE ni de polyfills étendus, hors périmètre MVP).
- **Accessibilité** : hors périmètre MVP explicite (à ne pas sur-engineerer dans les 4-5 jours impartis).

---

## 8. Critères de Validation (Definition of Done)

- [ ] **Détection invariable** : aucun conflit (salle, enseignant, groupe) ne peut passer la validation backend, y compris en cas de double-clic rapide côté frontend (idempotence/guard à prévoir sur le bouton de soumission).
- [ ] **Séparation brouillon/publié** : un étudiant ne voit jamais un `ScheduleSlot` avec `isPublished = false`, vérifié à la fois en test manuel et en test automatisé si le temps le permet.
- [ ] **Fidélité export PDF** : le rendu du PDF exporté correspond visuellement à la grille filtrée affichée à l'écran au moment du clic.
- [ ] **Workflow d'inscription complet** : Inscription étudiant → compte inactif → activation admin → connexion réussie → consultation de l'emploi du temps publié du bon groupe uniquement.
- [ ] **Cohérence graphique** : l'espace étudiant respecte rigoureusement la charte esthétique globale préexistante (aucun nouveau design system introduit).
- [ ] **Intégrité référentielle applicative** : la suppression d'une salle/groupe/matière/enseignant réalise un soft delete et ne casse jamais l'affichage des `ScheduleSlot` historiques qui la référencent.