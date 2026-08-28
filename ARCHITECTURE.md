# Rapport d'Architecture et Guide de Structure (MEVN Timetable App)

 Ce document présente les choix d'architecture, l'organisation des dossiers et le dictionnaire détaillé des fichiers du projet **Gestion d'Emploi du Temps (Stack MEVN)**, en stricte conformité avec le cahier des charges `AGENT.md`.

---

## 1. Choix d'Architecture Globale

Le projet repose sur la stack **MEVN** (**M**ongoDB, **E**xpress.js, **V**ue.js, **N**ode.js), 100% exécutable en environnement local.

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           FRONTEND (Vue.js)                             │
│       Vue Router (Niveau de rôle) + Pinia Stores (Auth, Timetable)     │
│       Vite + Tailwind CSS / SCSS                                        │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │ Appel HTTP / REST (Axios + JWT)
┌────────────────────────────────────▼────────────────────────────────────┐
│                           BACKEND (Node.js / Express)                   │
│       Routes Express ──► Middlewares (AuthGuard, RoleGuard)             │
│       Controlleurs ──► Service ConflictChecker ──► Modèles Mongoose     │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │ Driver Mongoose
┌────────────────────────────────────▼────────────────────────────────────┐
│                           BASE DE DONNÉES (MongoDB)                    │
│       Collections: users, salles, groupes, matieres, schedule_slots     │
└─────────────────────────────────────────────────────────────────────────┘
```

### Principes Architecturaux Clefs (spécifiés dans `AGENT.md`)

1. **Modèle de Créneaux Déterministe (`slotIndex`)**
   - 10 créneaux horaires fixes par jour (`slotIndex` 1 à 10) et 5 jours par semaine (`dayOfWeek` 1 à 5).
   - Évite les comparaisons complexes de dates/heures au profit de triplets entiers `(weekNumber, dayOfWeek, slotIndex)`.

2. **Moteur Unique de Détection de Conflits (`conflictChecker.js`)**
   - Source de vérité unique pour empêcher tout conflit de **salle**, d'**enseignant** (y compris indisponibilités) ou de **groupe**.
   - Aucun cours ne peut être créé/modifié en base s'il génère un conflit, même à l'état de brouillon.

3. **Séparation Brouillon / Publié (`isPublished`)**
   - Les `ScheduleSlot` possèdent un état `isPublished`. Seuls les cours avec `isPublished = true` sont visibles par les étudiants et les enseignants dans leur planning.

4. **Intégrité Référentielle Applicative & Soft Deletes**
   - Utilisation de références Mongoose (`ObjectId` + `ref`).
   - Toute suppression de salle, groupe ou matière est un **Soft Delete** (`isArchived: true` ou `isActive: false`) pour ne pas rompre les cours historiques.

5. **Sécurité et Contrôle d'Accès par Rôle (RBAC)**
   - Authentification basée sur des tokens JWT.
   - Contrôle strict via middlewares `authGuard` et `roleGuard` (rôles `admin`, `teacher`, `student`).

---

## 2. Organisation des Dossiers (Spécification par Répertoire)

### Architecture `backend/`

| Dossier | Contenu et Rôle |
|---|---|
| `backend/config/` | Fichiers de configuration globale du serveur (connexion DB, référentiels de créneaux, JWT). |
| `backend/src/controllers/` | Contrôleurs Express gérant les requêtes HTTP, la validation des entrées et les réponses aux clients. |
| `backend/src/middlewares/` | Middlewares d'authentification (`authGuard`), d'autorisation par rôle (`roleGuard`) et de gestion globale des erreurs. |
| `backend/src/Models/` | Modèles et schémas Mongoose définissant les collections MongoDB et les index de performance. |
| `backend/src/routes/` | Définition des endpoints d'API REST associant les URLs aux contrôleurs et middlewares. |
| `backend/src/services/` | Logique métier centralisée et réutilisable, notamment le moteur de vérification de conflits `conflictChecker.js`. |

---

### Architecture `frontend/`

| Dossier | Contenu et Rôle |
|---|---|
| `frontend/src/assets/` | Ressources statiques (images, SVGs, styles SCSS/CSS globaux, charte graphique). |
| `frontend/src/components/` | Composants Vue réutilisables dans l'ensemble de l'application (en-tête, notifications, items d'indisponibilité, grilles). |
| `frontend/src/router/` | Configuration du routeur client (Vue Router) et garde-fous de navigation par rôle. |
| `frontend/src/services/` | Couche client HTTP (Axios) pour émettre les requêtes d'API REST vers le backend. |
| `frontend/src/stores/` | Gestion centralisée de l'état applicatif avec Pinia (authentification, plannings, référentiels). |
| `frontend/src/views/` | Composants de pages principales découpés par rôle d'utilisateur (`auth/`, `admin/`, `enseignant/`, `etudiant/`). |

---

## 3. Dictionnaire Détaillé des Fichiers

### 📁 Fichiers Backend (`backend/`)

- **`backend/src/index.js`** : Point d'entrée principal du serveur backend. Initialise les variables d'environnement, établit la connexion MongoDB et lance l'écoute HTTP Express.
- **`backend/src/app.js`** : Configuration centrale d'Express. Enregistre les middlewares globaux (CORS, body-parser JSON) et associe les routes d'API aux différents préfixes d'URL.
- **`backend/src/config/db.js`** : Module de connexion Mongoose à l'instance MongoDB locale via `MONGO_URI`.
- **`backend/seed.js`** : Script utilitaire pour peupler la base de données avec un jeu de démonstration (utilisateurs, salles, matières, groupes).

#### Modèles Mongoose (`backend/src/Models/`)
- **`User.js`** : Schéma utilisateur gérant les rôles (`admin`, `teacher`, `student`), l'état d'activation (`isActive`), et les champs spécifiques (matricule, groupe, discipline).
- **`Salle.js`** : Schéma des salles de cours (nom, capacité, bâtiment, flag d'archivage `isArchived`).
- **`Group.js`** : Schéma des groupes d'étudiants (nom, promotion, effectif indicatif).
- **`Subject.js`** : Schéma des matières/unités d'enseignement (nom, semestre, volume horaire).
- **`Cours.js` / `Course.js`** : Schéma principal des créneaux d'emploi du temps (`ScheduleSlot` avec `weekNumber`, `year`, `dayOfWeek`, `slotIndex`, `type`, `isPublished` et références).
- **`Indisponibilite.js`** : Schéma des indisponibilités récurrentes des enseignants (`teacherId`, `dayOfWeek`, `slotIndex`).
- **`Semester.js`** : Schéma de gestion des semestres d'études.
- **`AcademicYear.js`** : Schéma d'année académique.
- **`Alerte.js`** : Schéma de notifications et alertes système.
- **`index.js`** : Point d'exportation centralisé de l'ensemble des modèles Mongoose.

#### Contrôleurs & Routes (`backend/src/controllers/` & `backend/src/routes/`)
- **`authController.js` / `authRoutes.js`** : Gestion de l'inscription étudiant (`/api/auth/register`) et de la connexion JWT (`/api/auth/login`).
- **`studentController.js` / `studentRoutes.js`** : Endpoints dédiés à la gestion des étudiants et aux validations administrateur.
- **`indisponibiliteController.js` / `indisponibiliteRoutes.js`** : Déclaration, consultation et suppression des indisponibilités enseignants.
- **`alerteController.js` / `alerteRoutes.js`** : Endpoint de gestion et diffusion des alertes.

#### Middlewares (`backend/src/middlewares/`)
- **`authMiddleware.js`** : Verifie la présence et la validité du Token JWT fourni dans les en-têtes de requête HTTP.
- **`roleMiddleware.js`** : Filtre l'accès aux routes d'API selon le rôle de l'utilisateur connecté (`admin`, `teacher`, `student`).

---

### 📁 Fichiers Frontend (`frontend/`)

- **`frontend/src/main.ts`** : Point d'entrée de l'application front-end. Instancie l'application Vue 3, attache le router et les stores Pinia.
- **`frontend/src/App.vue`** : Composant racine gérant le layout global et l'affichage des vues dynamiques `<router-view />`.
- **`frontend/src/style.css`** : Feuille de style globale intégrant Tailwind CSS et les règles esthétiques du projet.

#### Composants (`frontend/src/components/`)
- **`Header.vue`** : Barre de navigation supérieure affichant les informations utilisateur, le rôle et le bouton de déconnexion.
- **`Notification.vue`** : Composant d'affichage des bannières d'alerte et notifications.
- **`IndisponibiliteItem.vue`** : Carte d'affichage et suppression d'un créneau d'indisponibilité pour les enseignants.

#### Services & Router (`frontend/src/services/` & `frontend/src/router/`)
- **`services/api.js`** : Instance Axios configurée pour interroger l'API backend avec injection automatique des headers JWT d'autorisation.
- **`router/index.js`** : Définition des routes frontend et des gardes de navigation (redirection vers `/login` si non authentifié, restriction selon le rôle).

#### Stores Pinia (`frontend/src/stores/`)
- **`auth.js`** : Store de gestion de la session (stockage du token JWT, profil utilisateur, méthodes `login` et `logout`).
- **`enseignant.js`** : Store dédié au planning et aux indisponibilités des enseignants.
- **`etudiant.js`** : Store dédié aux cours publiés et aux informations de l'étudiant connecté.

#### Vues (`frontend/src/views/`)
- **`auth/Login.vue` & `Register.vue`** : Pages d'authentification et d'inscription.
- **`admin/AdminDashboard.vue`** : Dashboard complet d'administration (CRUD référentiels, édition d'emploi du temps, détection de conflits, publication).
- **`enseignant/EnseignantDashboard.vue` & `DashboardOverview.vue` & `IndisponibilitesView.vue`** : Espace enseignant pour consulter son planning personnel et gérer ses créneaux d'indisponibilité.
- **`etudiant/EtudiantDashboard.vue`, `ScheduleView.vue`, `SubjectsView.vue`, `ProfileView.vue`, `SettingsView.vue`** : Espace étudiant permettant la consultation exclusive des cours publiés de son groupe, le détail des matières, et l'export PDF du planning.

---

## 4. Conformité aux Règles de Développement `AGENT.md`

1. **Réutilisation** : Aucun composant ou utilitaire existant ne doit être dupliqué.
2. **Design System** : Conservation de la charte esthétique (Tailwind CSS, palette sombre/moderne).
3. **Sécurité** : Les contrôles de permissions (`groupId`, `role`) sont **toujours** exécutés côté backend à partir du token déchiffré.
