# Documentation des schémas MongoDB — Gestion d'emploi du temps

## Vue d'ensemble

Le système repose sur 9 collections. Trois grandes familles :

- **Identité & rôles** : `User`, `Enseignant`, `Etudiant`
- **Ressources pédagogiques** : `Matiere`, `Salle`, `Groupe`
- **Planification** : `Contrainte`, `Seance`, `EmploiDuTemps`

---

## 1. User

Collection racine pour l'authentification. Tout compte (admin, enseignant, étudiant) possède un document `User`.

| Champ | Type | Description |
|---|---|---|
| `nom`, `prenom` | String | Identité civile |
| `email` | String | Unique, utilisé comme identifiant de connexion |
| `motDePasseHash` | String | Hash bcrypt, `select: false` (jamais renvoyé par défaut dans les requêtes) |
| `role` | String (enum) | `administrateur` \| `enseignant` \| `etudiant` — détermine les permissions |
| `actif` | Boolean | Permet de désactiver un compte sans le supprimer |
| `derniereConnexion` | Date | Utile pour l'audit / sécurité |

**Logique intégrée :**
- Hook `pre('save')` : hash automatique du mot de passe si modifié
- Méthode `verifierMotDePasse()` : compare le mot de passe en clair au hash (login)

**Pourquoi ce découpage ?** Séparer l'authentification (`User`) du profil métier (`Enseignant`/`Etudiant`) évite de dupliquer la logique de login et permet d'ajouter facilement un 4ème rôle plus tard sans toucher aux deux autres collections.

---

## 2. Enseignant

Extension du profil `User` pour les enseignants. Relation 1-à-1 avec `User` via `userId`.

| Champ | Type | Description |
|---|---|---|
| `userId` | ObjectId → `User` | Référence unique, un enseignant = un seul compte |
| `matieresIds` | [ObjectId] → `Matiere` | Matières que l'enseignant peut assurer |
| `volumeHoraireMax` | Number | Plafond hebdomadaire (heures), défaut 20 |
| `grade` | String | Ex : "Maître de conférences", "Vacataire" |
| `indisponibilites` | [Sous-document] | Voir ci-dessous |

**Sous-document `indisponibilite` (embarqué) :**

| Champ | Type | Description |
|---|---|---|
| `jour` | String (enum) | lundi → samedi |
| `heureDebut`, `heureFin` | String | Format `HH:mm` |
| `motif` | String | Raison optionnelle (facultatif, texte libre) |
| `recurrente` | Boolean | `true` si la contrainte se répète chaque semaine |

**Pourquoi embarqué et pas une collection séparée ?** Les indisponibilités sont toujours consultées/modifiées avec leur enseignant, jamais interrogées de façon indépendante — l'embarquement évite une jointure (`populate`) systématique.

---

## 3. Etudiant

Extension du profil `User` pour les étudiants. Relation 1-à-1 avec `User`, relation N-à-1 avec `Groupe`.

| Champ | Type | Description |
|---|---|---|
| `userId` | ObjectId → `User` | Référence unique |
| `groupeId` | ObjectId → `Groupe` | Groupe/classe d'appartenance |
| `numeroEtudiant` | String | Identifiant unique (matricule) |
| `anneeInscription` | Number | Défaut : année courante |

**Index :** `{ groupeId: 1 }` — accélère la requête "tous les étudiants d'un groupe X", utile pour l'affichage de listes et l'export.

---

## 4. Matiere

Décrit une unité d'enseignement (UE) avec ses contraintes de ressources.

| Champ | Type | Description |
|---|---|---|
| `nom` | String | Nom complet |
| `code` | String | Unique, majuscule (ex: `INFO301`) |
| `volumeHoraire` | Number | Total d'heures sur le semestre |
| `dureeSeance` | Number | Durée d'une séance en minutes (défaut 90) — sert à découper `volumeHoraire` en séances lors de la génération |
| `typeSalleRequis` | String (enum) | `amphi` \| `TD` \| `TP` \| `laboratoire` \| `indifferent` — contrainte dure pour l'algo |
| `equipementsRequis` | [String] | Ex: `['videoprojecteur', 'ordinateurs']` — doit matcher les équipements de la salle choisie |
| `enseignantsIds` | [ObjectId] → `Enseignant` | Enseignants habilités à dispenser cette matière |

**Rôle dans l'algorithme :** c'est `volumeHoraire ÷ dureeSeance` qui donne le nombre de `Seance` à générer pour cette matière, et `typeSalleRequis`/`equipementsRequis` filtrent les salles candidates.

---

## 5. Salle

Ressource physique réservable.

| Champ | Type | Description |
|---|---|---|
| `nom` | String | Ex: `B204` |
| `batiment` | String | Optionnel, utile si plusieurs bâtiments |
| `capacite` | Number | Nombre de places — comparé à `Groupe.effectif` |
| `type` | String (enum) | `amphi` \| `TD` \| `TP` \| `laboratoire` \| `salle_reunion` |
| `equipements` | [String] | Doit inclure `Matiere.equipementsRequis` pour être compatible |
| `disponible` | Boolean | `false` = en maintenance, exclue temporairement de la génération |

**Index :** `{ type: 1, capacite: 1 }` — la requête la plus fréquente de l'algorithme est "trouver une salle de type X avec capacité ≥ Y", cet index composé la rend efficace.

---

## 6. Groupe

Représente une classe/promotion d'étudiants suivant un tronc commun de matières.

| Champ | Type | Description |
|---|---|---|
| `nom` | String | Ex: `L3 Info Groupe A` |
| `niveau` | String | Ex: `L3`, `M1` |
| `filiere` | String | Ex: `Informatique` |
| `effectif` | Number | Nombre d'étudiants — contrainte dure vs `Salle.capacite` |
| `matieresIds` | [ObjectId] → `Matiere` | Cursus du groupe |

**Relation avec `Etudiant` :** relation inverse — chaque `Etudiant` référence un seul `groupeId`, mais `Groupe` ne liste pas ses étudiants (évite un tableau qui grossit indéfiniment ; on interroge plutôt `Etudiant.find({ groupeId })`).

---

## 7. Seance

**Unité atomique** manipulée par l'algorithme de génération (CSP/backtracking). Un document = un cours précis, à un moment précis, dans une salle précise.

| Champ | Type | Description |
|---|---|---|
| `matiereId` | ObjectId → `Matiere` | Quelle matière |
| `enseignantId` | ObjectId → `Enseignant` | Quel enseignant |
| `salleId` | ObjectId → `Salle` | Quelle salle |
| `groupeId` | ObjectId → `Groupe` | Quel groupe d'étudiants |
| `jour` | String (enum) | lundi → samedi |
| `heureDebut`, `heureFin` | String | Format `HH:mm` |
| `typeSeance` | String (enum) | `cours` \| `TD` \| `TP` \| `examen` |
| `conflit` | Boolean | Positionné par le module de détection de conflits |
| `detailsConflit` | String | Description lisible du conflit (pour l'admin) |

**Index composés (critiques pour la performance) :**
- `{ enseignantId: 1, jour: 1, heureDebut: 1 }`
- `{ salleId: 1, jour: 1, heureDebut: 1 }`
- `{ groupeId: 1, jour: 1, heureDebut: 1 }`

Ces trois index permettent de vérifier en O(log n) si un enseignant/une salle/un groupe est déjà occupé sur un créneau donné — c'est l'opération répétée des milliers de fois pendant la génération et la détection de conflits.

---

## 8. EmploiDuTemps

Regroupe un ensemble de `Seance` en un emploi du temps versionné, avec un cycle de vie explicite.

| Champ | Type | Description |
|---|---|---|
| `nom` | String | Ex: `EDT L3 Info - Semestre 1 2026` |
| `semestre` | String | Ex: `S1-2026` |
| `seancesIds` | [ObjectId] → `Seance` | Les séances qui composent cet EDT |
| `statut` | String (enum) | `brouillon` → `genere` → `valide` → `publie` → `archive` |
| `genereParAlgorithme` | Boolean | Traçabilité : généré automatiquement ou saisi manuellement |
| `nombreConflitsDetectes` | Number | Compteur mis à jour après chaque passage du détecteur de conflits |
| `valideParUserId` | ObjectId → `User` | Qui a validé (traçabilité admin) |
| `dateValidation`, `datePublication` | Date | Horodatage du cycle de validation |

**Cycle de vie (`statut`) :**

```
brouillon → genere → valide → publie → (archive)
```

- `brouillon` : structure créée, séances pas encore générées
- `genere` : l'algorithme a produit des séances, potentiellement avec des conflits résiduels
- `valide` : un admin a revu et approuvé (nombreConflitsDetectes doit être à 0)
- `publie` : visible par enseignants/étudiants (`datePublication` renseignée)
- `archive` : ancien semestre, conservé pour historique

---

## Relations — résumé

```
User ──1:1── Enseignant ──N:N── Matiere ──N:N── Groupe
User ──1:1── Etudiant ──N:1── Groupe

Enseignant ──1:N── Indisponibilite (embarqué)

Seance ──N:1── Matiere
Seance ──N:1── Enseignant
Seance ──N:1── Salle
Seance ──N:1── Groupe

EmploiDuTemps ──N:N── Seance (via seancesIds)
Contrainte ──(logique, pas de référence directe)── régit la génération de Seance
```


