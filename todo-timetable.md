# 📋 ToDo List - MVP Timetable Application

Feuille de route pas-à-pas pour le développement MVP local de l'application de gestion d'emploi du temps (MEVN Stack).

> **Périmètre fonctionnel MVP :**
> 1. 👤 **Gestion des Utilisateurs** (Ajout & gestion des enseignants par l'Admin)
> 2. 🏛️ **CRUD Salles** (Gestion des salles de cours/bâtiments)
> 3. 👥 **CRUD Groupes** (Gestion des promotions/groupes d'étudiants)
> 4. 📅 **CRUD Cours** (Planification et gestion des séances dans l'emploi du temps)

---

## 🏗️ Phase 1 : Modèles Mongoose & BDD (Backend - Couche Données)

### 1.1 Model Room (Salles)
- [ ] **Tâche 1.1** : Créer le modèle Mongoose `Room` avec validation (nom, capacité, bâtiment, type de salle : Amphi/TP/TD/Standard).
  -  *Fichiers à créer :* `backend/src/Models/Room.js`

### 1.2 Model Group (Groupes)
- [ ] **Tâche 1.2** : Créer le modèle Mongoose `Group` avec validation (nom du groupe, niveau : L1/L2/L3, filière : GL/IAD/ARSB/SIG/R&T, effectif).
  -  *Fichiers à créer :* `backend/src/Models/Group.js`

### 1.3 Adaptation du Model Course & User
- [ ] **Tâche 1.3** : Mettre à jour le schéma `Course` pour lier les références Mongoose `room` (Ref: `Room`) et `group` (Ref: `Group`).
  -  *Fichiers impactés :* `backend/src/Models/Course.js`
- [ ] **Tâche 1.4** : Enrichir le script de seed de données pour inclure des salles, des groupes et des enseignants de test.
  -  *Fichiers impactés :* `backend/seed.js`

---

## ⚙️ Phase 2 : Contrôleurs & Routes API REST (Backend - Couche API)

### 2.1 Gestion des Enseignants (Admin)
- [ ] **Tâche 2.1** : Créer les méthodes du contrôleur pour la création d'enseignants par l'Admin (avec génération de mot de passe / inscription) et le listing des enseignants.
  -  *Fichiers à créer/impactés :* `backend/src/controllers/teacherController.js`, `backend/src/controllers/authController.js`
- [ ] **Tâche 2.2** : Définir les routes d'administration d'enseignants sécurisées par middlewares `protect` et `authorize("admin")`.
  -  *Fichiers à créer/impactés :* `backend/src/routes/teacherRoutes.js`, `backend/src/app.js`

### 2.2 CRUD Salles (Rooms)
- [ ] **Tâche 2.3** : Implémenter `roomController.js` avec toutes les opérations CRUD (createRoom, getRooms, getRoomById, updateRoom, deleteRoom).
  -  *Fichiers à créer :* `backend/src/controllers/roomController.js`
- [ ] **Tâche 2.4** : Définir les routes REST pour les salles `/api/rooms` et les enregistrer dans l'application Express.
  -  *Fichiers à créer/impactés :* `backend/src/routes/roomRoutes.js`, `backend/src/app.js`

### 2.3 CRUD Groupes (Groups)
- [ ] **Tâche 2.5** : Implémenter `groupController.js` avec les opérations CRUD (createGroup, getGroups, getGroupById, updateGroup, deleteGroup).
  -  *Fichiers à créer :* `backend/src/controllers/groupController.js`
- [ ] **Tâche 2.6** : Définir les routes REST pour les groupes `/api/groups` et les enregistrer dans l'application Express.
  -  *Fichiers à créer/impactés :* `backend/src/routes/groupRoutes.js`, `backend/src/app.js`

### 2.4 CRUD Cours (Courses)
- [ ] **Tâche 2.7** : Implémenter `courseController.js` avec la logique métier CRUD, vérification de chevauchement d'horaires (détection de conflits de salle/enseignant) et filtres (par groupe, salle, enseignant, date).
  -  *Fichiers à créer :* `backend/src/controllers/courseController.js`
- [ ] **Tâche 2.8** : Définir les routes REST `/api/courses` et les connecter dans Express.
  -  *Fichiers à créer/impactés :* `backend/src/routes/courseRoutes.js`, `backend/src/app.js`

---

## 💻 Phase 3 : Services HTTP & State Management (Frontend - Couche Données Client)

### 3.1 Services d'API Axios
- [ ] **Tâche 3.1** : Créer les modules de service API pour interagir avec les endpoints backend (`teacherService.js`, `roomService.js`, `groupService.js`, `courseService.js`).
  -  *Fichiers à créer :* `frontend/src/services/teacherService.js`, `frontend/src/services/roomService.js`, `frontend/src/services/groupService.js`, `frontend/src/services/courseService.js`

### 3.2 Stores Pinia
- [ ] **Tâche 3.2** : Créer le store Pinia `useTeacherStore` pour la gestion de l'état des enseignants (state, actions fetch/create/update/delete).
  -  *Fichiers à créer :* `frontend/src/stores/teacher.js`
- [ ] **Tâche 3.3** : Créer le store Pinia `useRoomStore` pour la gestion centralisée des salles.
  -  *Fichiers à créer :* `frontend/src/stores/room.js`
- [ ] **Tâche 3.4** : Créer le store Pinia `useGroupStore` pour la gestion des groupes d'étudiants.
  -  *Fichiers à créer :* `frontend/src/stores/group.js`
- [ ] **Tâche 3.5** : Créer le store Pinia `useCourseStore` pour les cours et l'emploi du temps.
  -  *Fichiers à créer :* `frontend/src/stores/course.js`

---

## 🎨 Phase 4 : Vues & Composants UI (Frontend - Interface Utilisateur)

### 4.1 Interface Gestion Enseignants (Admin)
- [ ] **Tâche 4.1** : Créer le composant modal/formulaire de création et d'édition d'un enseignant (`TeacherFormModal.vue`).
  -  *Fichiers à créer :* `frontend/src/components/admin/TeacherFormModal.vue`
- [ ] **Tâche 4.2** : Créer la vue d'administration des enseignants avec tableau récapitulatif, recherche et actions.
  -  *Fichiers à créer :* `frontend/src/views/admin/AdminTeachersView.vue`

### 4.2 Interface CRUD Salles
- [ ] **Tâche 4.3** : Créer le composant modal/formulaire pour ajouter ou modifier une salle (`RoomFormModal.vue`).
  -  *Fichiers à créer :* `frontend/src/components/admin/RoomFormModal.vue`
- [ ] **Tâche 4.4** : Créer la vue d'administration des salles (`AdminRoomsView.vue`) incluant la liste des salles, cartes/tableau, filtres et suppression.
  -  *Fichiers à créer :* `frontend/src/views/admin/AdminRoomsView.vue`

### 4.3 Interface CRUD Groupes
- [ ] **Tâche 4.5** : Créer le composant modal/formulaire pour ajouter ou modifier un groupe d'étudiants (`GroupFormModal.vue`).
  -  *Fichiers à créer :* `frontend/src/components/admin/GroupFormModal.vue`
- [ ] **Tâche 4.6** : Créer la vue d'administration des groupes (`AdminGroupsView.vue`) avec affichage par niveau/filière et gestion des effectifs.
  -  *Fichiers à créer :* `frontend/src/views/admin/AdminGroupsView.vue`

### 4.4 Interface CRUD Cours & Emploi du temps
- [ ] **Tâche 4.7** : Créer le composant modal/formulaire de planification de cours avec sélecteurs dynamiques (Matière, Enseignant, Salle, Groupe, Créneau horaire).
  -  *Fichiers à créer :* `frontend/src/components/admin/CourseFormModal.vue`
- [ ] **Tâche 4.8** : Créer la vue d'administration globale des cours (`AdminCoursesView.vue`) pour créer, modifier, annuler ou supprimer une séance.
  -  *Fichiers à créer :* `frontend/src/views/admin/AdminCoursesView.vue`

### 4.4 Configuration du Routage Frontend
- [ ] **Tâche 4.9** : Déclarer l'ensemble des nouvelles routes admin dans Vue Router et mettre à jour la navigation / le menu latéral du Dashboard Admin.
  -  *Fichiers impactés :* `frontend/src/router/index.js`, `frontend/src/views/admin/AdminDashboard.vue`

---

## 🔗 Phase 5 : Intégration & Validation E2E (Tests & Finalisation)

- [ ] **Tâche 5.1** : Exécuter le script de seed mis à jour et vérifier le peuplement initial MongoDB.
  -  *Fichiers impactés :* `backend/seed.js`
- [ ] **Tâche 5.2** : Tester le flux complet d'ajout d'un enseignant depuis l'interface Admin et vérifier sa capacité de connexion.
- [ ] **Tâche 5.3** : Tester le flux CRUD complet des Salles et des Groupes (Création, Lecture, Édition, Suppression).
- [ ] **Tâche 5.4** : Tester la création d'un Cours, vérifier la détection de conflit de salle/créneau et l'affichage dynamique dans l'emploi du temps de l'étudiant/enseignant.
  -  *Fichiers impactés :* `frontend/src/views/etudiant/ScheduleView.vue`
