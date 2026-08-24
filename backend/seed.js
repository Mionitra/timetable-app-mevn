/**
 * ============================================================
 * SEED DE DÉMONSTRATION — couvre TOUS les champs de TOUS les
 * schémas du projet :
 *
 *   - User             (tous rôles, tous champs profil)
 *   - Group            (référentiel groupes)
 *   - Salle            (référentiel salles)
 *   - Matiere          (référentiel matières multi-semestres)
 *   - Indisponibilite  (créneaux récurrents par enseignant)
 *   - Cours            (grille complète semaine ISO courante)
 *
 * Exécution : node seed.js   (depuis le dossier backend/)
 * ============================================================
 */

import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

import User from "./src/Models/User.js";
import Group from "./src/Models/Group.js";
import Salle from "./src/Models/Salle.js";
import Matiere from "./src/Models/Matiere.js";
import Indisponibilite from "./src/Models/Indisponibilite.js";
import Cours from "./src/Models/Cours.js";
import { getISOWeek, SLOTS, DAYS } from "./src/config/slots.js";

dotenv.config();

// ============================================================
// HELPERS
// ============================================================

const DAY_LABEL = (d) => DAYS.find((x) => x.value === d)?.label ?? `J${d}`;
const SLOT_LABEL = (s) => {
  const slot = SLOTS.find((x) => x.index === s);
  return slot ? `${slot.startTime}–${slot.endTime}` : `Créneau ${s}`;
};

/**
 * Contrôle applicatif identique aux règles du conflictChecker :
 * sur un même (year, weekNumber, dayOfWeek, slotIndex) il ne peut
 * y avoir ni doublon de salle, ni doublon d'enseignant,
 * ni doublon de groupe. Retourne la liste des conflits détectés.
 */
const detectConflicts = (coursList) => {
  const conflicts = [];
  const seen = { salle: new Map(), enseignant: new Map(), groupe: new Map() };

  const creneauKey = (c) =>
    `${c.year}|${c.weekNumber}|${c.dayOfWeek}|${c.slotIndex}`;

  const describe = (c) =>
    `${DAY_LABEL(c.dayOfWeek)} ${SLOT_LABEL(c.slotIndex)} (S${c.weekNumber} ${c.year})`;

  for (const cours of coursList) {
    const key = creneauKey(cours);

    for (const [dimension, refField] of [
      ["salle", "salleId"],
      ["enseignant", "teacherId"],
      ["groupe", "groupId"],
    ]) {
      const mapKey = `${key}|${cours[refField]}`;

      if (seen[dimension].has(mapKey)) {
        conflicts.push({
          type: dimension.toUpperCase(),
          message: `${describe(cours)} : ${dimension} déjà occupé(e)`,
        });
      } else {
        seen[dimension].set(mapKey, cours);
      }
    }
  }

  return conflicts;
};

// ============================================================
// SEED PRINCIPAL
// ============================================================

const seed = async () => {
  try {
    // --------------------------------------------------------
    // CONNEXION MONGODB
    // --------------------------------------------------------

    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI n'est pas défini dans le fichier .env");
    }

    await mongoose.connect(process.env.MONGO_URI);

    console.log("✅ MongoDB connecté pour le seed");

    // --------------------------------------------------------
    // NETTOYAGE COMPLET DES COLLECTIONS DU DOMAINE
    // --------------------------------------------------------

    await Cours.deleteMany({});
    await Indisponibilite.deleteMany({});
    await Matiere.deleteMany({});
    await Salle.deleteMany({});
    await Group.deleteMany({});

    // Utilisateurs : uniquement les comptes de démonstration ;
    // les comptes réels créés via Register sont préservés.
    const seedEmails = [
      "admin@gmail.com",
      "enseignant@gmail.com",
      "enseignant2@gmail.com",
      "enseignant3@gmail.com",
      "etudiant@gmail.com",
      "etudiant2@gmail.com",
      "etudiant3@gmail.com",
      "etudiant4@gmail.com",
      "etudiant5@gmail.com",
    ];

    await User.deleteMany({ email: { $in: seedEmails } });

    console.log("🧹 Anciennes données de démonstration supprimées");

    // --------------------------------------------------------
    // MOT DE PASSE COMMUN
    // --------------------------------------------------------

    const demoPassword = "12345678";
    const passwordHash = await bcrypt.hash(demoPassword, 10);

    // --------------------------------------------------------
    // GROUPES — name / promotion / effectifIndicatif / isArchived
    // --------------------------------------------------------

    const groups = await Group.insertMany([
      {
        name: "L3-GL-A",
        promotion: "L3 2025-2026",
        effectifIndicatif: 28,
        isArchived: false,
      },
      {
        name: "L3-ARSB-A",
        promotion: "L3 2025-2026",
        effectifIndicatif: 24,
        isArchived: false,
      },
      {
        name: "L2-GL-B",
        promotion: "L2 2025-2026",
        effectifIndicatif: 32,
        isArchived: false,
      },
      {
        name: "L1-IAD-A",
        promotion: "L1 2025-2026",
        effectifIndicatif: 35,
        isArchived: false,
      },
    ]);

    const getGroup = (name) => groups.find((g) => g.name === name);
    console.log(`🏫 Groupes créés : ${groups.length}`);

    // --------------------------------------------------------
    // SALLES — name / capacite / batiment / isArchived
    // --------------------------------------------------------

    const salles = await Salle.insertMany([
      {
        name: "Amphi A",
        capacite: 150,
        batiment: "Bâtiment Central",
        isArchived: false,
      },
      {
        name: "Amphi B",
        capacite: 100,
        batiment: "Bâtiment Central",
        isArchived: false,
      },
      {
        name: "Salle TD B101",
        capacite: 40,
        batiment: "Bâtiment B",
        isArchived: false,
      },
      {
        name: "Salle Info B204",
        capacite: 25,
        batiment: "Bâtiment B",
        isArchived: false,
      },
      {
        name: "Labo TP C105",
        capacite: 30,
        batiment: "Bâtiment C",
        isArchived: false,
      },
      {
        name: "Salle TD C102",
        capacite: 40,
        batiment: "Bâtiment C",
        isArchived: false,
      },
    ]);

    const getSalle = (name) => salles.find((s) => s.name === name);
    console.log(`🏢 Salles créées : ${salles.length}`);

    // --------------------------------------------------------
    // MATIÈRES — name / semester / volumeHoraireCreneaux /
    // isArchived (multi-semestres pour couvrir L1→L3)
    // --------------------------------------------------------

    const matieres = await Matiere.insertMany([
      {
        name: "Base de données",
        semester: "S5",
        volumeHoraireCreneaux: 24,
        isArchived: false,
      },
      {
        name: "Algorithmique & Structures de données",
        semester: "S5",
        volumeHoraireCreneaux: 30,
        isArchived: false,
      },
      {
        name: "Développement Web Avancé",
        semester: "S5",
        volumeHoraireCreneaux: 20,
        isArchived: false,
      },
      {
        name: "Réseaux Informatiques",
        semester: "S5",
        volumeHoraireCreneaux: 22,
        isArchived: false,
      },
      {
        name: "Probabilités & Statistiques",
        semester: "S5",
        volumeHoraireCreneaux: 26,
        isArchived: false,
      },
      {
        name: "Anglais Technique",
        semester: "S5",
        volumeHoraireCreneaux: 12,
        isArchived: false,
      },
      {
        name: "Systèmes d'exploitation",
        semester: "S4",
        volumeHoraireCreneaux: 28,
        isArchived: false,
      },
      {
        name: "Mathématiques discrètes",
        semester: "S3",
        volumeHoraireCreneaux: 18,
        isArchived: false,
      },
    ]);

    const getMatiere = (name) => matieres.find((m) => m.name === name);
    console.log(`📚 Matières créées : ${matieres.length}`);

    // --------------------------------------------------------
    // UTILISATEURS — tous les champs du schéma User :
    // firstName, lastName, email, password, role, isActive,
    // profileImage, coverImage, studentId, groupId, niveau,
    // filiere, typeEnseignant, discipline, phone, bio, address,
    // joinDate, lastLogin
    // --------------------------------------------------------

    const joinDateStaff = new Date("2023-09-01");
    const joinDateStudent = new Date("2025-09-15");

    // ----- Admin -----
    await User.create({
      firstName: "Admin",
      lastName: "Principal",
      email: "admin@gmail.com",
      password: passwordHash,
      role: "admin",
      isActive: true,
      profileImage: null,
      coverImage: null,
      phone: "+261 34 00 000 00",
      bio: "Responsable de la planification des emplois du temps.",
      address: "Campus Universitaire, Ankatso",
      joinDate: joinDateStaff,
      lastLogin: null,
    });

    console.log("👑 Admin créé : admin@gmail.com");

    // ----- Enseignants (couvre les 3 valeurs de l'enum
    // typeEnseignant : permanent / vacataire / contractuel) -----
    const teachers = await User.insertMany([
      {
        firstName: "Jean",
        lastName: "Rakoto",
        email: "enseignant@gmail.com",
        password: passwordHash,
        role: "enseignant",
        typeEnseignant: "permanent",
        discipline: "informatique",
        isActive: true,
        profileImage: null,
        coverImage: null,
        phone: "+261 34 11 111 11",
        bio: "Enseignant-chercheur en génie logiciel et bases de données.",
        address: "Lot II M 12, Antananarivo",
        joinDate: joinDateStaff,
        lastLogin: new Date(),
      },
      {
        firstName: "Marie",
        lastName: "Andriamaro",
        email: "enseignant2@gmail.com",
        password: passwordHash,
        role: "enseignant",
        typeEnseignant: "vacataire",
        discipline: "mathematiques",
        isActive: true,
        profileImage: null,
        coverImage: null,
        phone: "+261 32 22 222 22",
        bio: "Intervenante en probabilités, statistiques et langues.",
        address: "Villa 8, Ambatobe",
        joinDate: joinDateStaff,
        lastLogin: null,
      },
      {
        firstName: "Hery",
        lastName: "Ravelo",
        email: "enseignant3@gmail.com",
        password: passwordHash,
        role: "enseignant",
        typeEnseignant: "contractuel",
        discipline: "informatique",
        isActive: true,
        profileImage: null,
        coverImage: null,
        phone: "+261 33 33 333 33",
        bio: "Contractuel spécialisé en systèmes et réseaux.",
        address: "Immeuble Fanja, Ivandry",
        joinDate: joinDateStaff,
        lastLogin: null,
      },
    ]);

    const [teacherJean, teacherMarie, teacherHery] = teachers;
    console.log(`👨‍🏫 Enseignants créés : ${teachers.length}`);

    // ----- Étudiants (actifs + en attente d'activation,
    // un représentant par groupe, enums niveau/filière couverts) -----
    const [, studentPending1, , , studentPending2] = await User.insertMany([
      {
        firstName: "Fidy",
        lastName: "Razafy",
        email: "etudiant@gmail.com",
        password: passwordHash,
        role: "etudiant",
        isActive: true,
        studentId: "ETU-2025-0001",
        groupId: getGroup("L3-GL-A")._id,
        niveau: "L3",
        filiere: "GL",
        profileImage: null,
        coverImage: null,
        phone: "+261 34 44 444 41",
        bio: "Étudiant en Génie Logiciel, passionné par le développement web.",
        address: "Logement C2, Cité Universitaire",
        joinDate: joinDateStudent,
        lastLogin: new Date(),
      },
      {
        firstName: "Lala",
        lastName: "Ratsimbazafy",
        email: "etudiant2@gmail.com",
        password: passwordHash,
        role: "etudiant",
        isActive: false, // en attente d'activation par l'admin (RF-AUTH-02)
        studentId: "ETU-2025-0002",
        groupId: getGroup("L3-GL-A")._id,
        niveau: "L3",
        filiere: "GL",
        profileImage: null,
        coverImage: null,
        phone: "+261 34 44 444 42",
        bio: "",
        address: "Analamahitsy, Antananarivo",
        joinDate: joinDateStudent,
        lastLogin: null,
      },
      {
        firstName: "Naina",
        lastName: "Rabemananjara",
        email: "etudiant3@gmail.com",
        password: passwordHash,
        role: "etudiant",
        isActive: true,
        studentId: "ETU-2025-0003",
        groupId: getGroup("L3-ARSB-A")._id,
        niveau: "L3",
        filiere: "ARSB",
        profileImage: null,
        coverImage: null,
        phone: "+261 34 44 444 43",
        bio: "Réseaux, sécurité et blockchain.",
        address: "Cité Universitaire, Bloc D",
        joinDate: joinDateStudent,
        lastLogin: null,
      },
      {
        firstName: "Soa",
        lastName: "Randrianarisoa",
        email: "etudiant4@gmail.com",
        password: passwordHash,
        role: "etudiant",
        isActive: true,
        studentId: "ETU-2025-0004",
        groupId: getGroup("L2-GL-B")._id,
        niveau: "L2",
        filiere: "GL",
        profileImage: null,
        coverImage: null,
        phone: "+261 34 44 444 44",
        bio: "Deuxième année Génie Logiciel.",
        address: "Andraharo, Antananarivo",
        joinDate: joinDateStudent,
        lastLogin: null,
      },
      {
        firstName: "Miora",
        lastName: "Rajaonarivelo",
        email: "etudiant5@gmail.com",
        password: passwordHash,
        role: "etudiant",
        isActive: false, // en attente d'activation par l'admin (RF-AUTH-02)
        studentId: "ETU-2025-0005",
        groupId: getGroup("L3-ARSB-A")._id,
        niveau: "L3",
        filiere: "ARSB",
        profileImage: null,
        coverImage: null,
        phone: "+261 34 44 444 45",
        bio: "",
        address: "Ankazomanga, Antananarivo",
        joinDate: joinDateStudent,
        lastLogin: null,
      },
    ]);

    console.log(
      "🎓 Étudiants créés : 3 actifs + 2 en attente " +
        `(${studentPending1.email}, ${studentPending2.email})`
    );

    // --------------------------------------------------------
    // INDISPONIBILITÉS RÉCURRENTES
    // teacherId / dayOfWeek (1-5) / slotIndex (1-10)
    // --------------------------------------------------------

    const indisponibilites = [
      // Jean : indisponible le mardi après-midi (créneaux 7 et 8)
      { teacherId: teacherJean._id, dayOfWeek: 2, slotIndex: 7 },
      { teacherId: teacherJean._id, dayOfWeek: 2, slotIndex: 8 },
      // Marie : indisponible le vendredi matin (créneaux 1 et 2)
      { teacherId: teacherMarie._id, dayOfWeek: 5, slotIndex: 1 },
      { teacherId: teacherMarie._id, dayOfWeek: 5, slotIndex: 2 },
      // Hery : indisponible le lundi fin de journée (créneau 10)
      { teacherId: teacherHery._id, dayOfWeek: 1, slotIndex: 10 },
    ];

    await Indisponibilite.insertMany(indisponibilites);
    console.log(
      `⛔ Indisponibilités récurrentes créées : ${indisponibilites.length}`
    );

    // --------------------------------------------------------
    // COURS — grille de la semaine ISO courante
    // weekNumber / year / groupId / subjectId / teacherId /
    // salleId / dayOfWeek / slotIndex / type / isPublished
    // (brouillons inclus pour tester la visibilité RBAC)
    // --------------------------------------------------------

    const { weekNumber, year } = getISOWeek(new Date());
    console.log(`📆 Semaine cible du seed : S${weekNumber} ${year}`);

    const l3gl = getGroup("L3-GL-A")._id;
    const l3arsb = getGroup("L3-ARSB-A")._id;
    const l2gl = getGroup("L2-GL-B")._id;

    // Raccourcis référentiels
    const amphiA = getSalle("Amphi A")._id;
    const amphiB = getSalle("Amphi B")._id;
    const tdB101 = getSalle("Salle TD B101")._id;
    const infoB204 = getSalle("Salle Info B204")._id;
    const tpC105 = getSalle("Labo TP C105")._id;
    const tdC102 = getSalle("Salle TD C102")._id;

    const bd = getMatiere("Base de données")._id;
    const algo = getMatiere("Algorithmique & Structures de données")._id;
    const web = getMatiere("Développement Web Avancé")._id;
    const reseaux = getMatiere("Réseaux Informatiques")._id;
    const probas = getMatiere("Probabilités & Statistiques")._id;
    const anglais = getMatiere("Anglais Technique")._id;
    const systemes = getMatiere("Systèmes d'exploitation")._id;
    const mathsDisc = getMatiere("Mathématiques discrètes")._id;

    /**
     * Fabrique un objet cours complet (tous les champs du schéma).
     */
    const buildCours = ({
      dayOfWeek,
      slotIndex,
      type,
      groupId,
      subjectId,
      teacherId,
      salleId,
      isPublished = true,
    }) => ({
      weekNumber,
      year,
      groupId,
      subjectId,
      teacherId,
      salleId,
      dayOfWeek,
      slotIndex,
      type,
      isPublished,
    });

    const coursList = [
      // ================= L3-GL-A =================

      // Lundi : CM Base de données (Amphi A)
      buildCours({
        dayOfWeek: 1,
        slotIndex: 2,
        type: "CM",
        groupId: l3gl,
        subjectId: bd,
        teacherId: teacherJean._id,
        salleId: amphiA,
      }),

      // Lundi : TD Algorithmique
      buildCours({
        dayOfWeek: 1,
        slotIndex: 4,
        type: "TD",
        groupId: l3gl,
        subjectId: algo,
        teacherId: teacherJean._id,
        salleId: tdB101,
      }),

      // Mardi : CM Développement Web
      buildCours({
        dayOfWeek: 2,
        slotIndex: 3,
        type: "CM",
        groupId: l3gl,
        subjectId: web,
        teacherId: teacherJean._id,
        salleId: amphiB,
      }),

      // Mercredi : TP Développement Web — BROUILLON
      buildCours({
        dayOfWeek: 3,
        slotIndex: 7,
        type: "TP",
        groupId: l3gl,
        subjectId: web,
        teacherId: teacherJean._id,
        salleId: infoB204,
        isPublished: false, // invisible côté étudiant tant que non publié
      }),

      // Jeudi : TD Anglais Technique
      buildCours({
        dayOfWeek: 4,
        slotIndex: 5,
        type: "TD",
        groupId: l3gl,
        subjectId: anglais,
        teacherId: teacherMarie._id,
        salleId: tdC102,
      }),

      // Jeudi : CM Probabilités & Statistiques
      buildCours({
        dayOfWeek: 4,
        slotIndex: 9,
        type: "CM",
        groupId: l3gl,
        subjectId: probas,
        teacherId: teacherMarie._id,
        salleId: amphiA,
      }),

      // Vendredi : TP Base de données
      buildCours({
        dayOfWeek: 5,
        slotIndex: 2,
        type: "TP",
        groupId: l3gl,
        subjectId: bd,
        teacherId: teacherJean._id,
        salleId: tpC105,
      }),

      // ================= L3-ARSB-A =================

      // Mardi : CM Réseaux
      buildCours({
        dayOfWeek: 2,
        slotIndex: 5,
        type: "CM",
        groupId: l3arsb,
        subjectId: reseaux,
        teacherId: teacherJean._id,
        salleId: amphiA,
      }),

      // Mardi : TP Réseaux
      buildCours({
        dayOfWeek: 2,
        slotIndex: 9,
        type: "TP",
        groupId: l3arsb,
        subjectId: reseaux,
        teacherId: teacherHery._id,
        salleId: infoB204,
      }),

      // Mercredi : TD Anglais Technique
      buildCours({
        dayOfWeek: 3,
        slotIndex: 3,
        type: "TD",
        groupId: l3arsb,
        subjectId: anglais,
        teacherId: teacherMarie._id,
        salleId: tdB101,
      }),

      // Vendredi : CM Probabilités & Statistiques
      buildCours({
        dayOfWeek: 5,
        slotIndex: 7,
        type: "CM",
        groupId: l3arsb,
        subjectId: probas,
        teacherId: teacherMarie._id,
        salleId: amphiB,
      }),

      // ================= L2-GL-B =================

      // Lundi : CM Systèmes d'exploitation
      buildCours({
        dayOfWeek: 1,
        slotIndex: 7,
        type: "CM",
        groupId: l2gl,
        subjectId: systemes,
        teacherId: teacherHery._id,
        salleId: amphiB,
      }),

      // Mercredi : TP Systèmes d'exploitation
      buildCours({
        dayOfWeek: 3,
        slotIndex: 5,
        type: "TP",
        groupId: l2gl,
        subjectId: systemes,
        teacherId: teacherHery._id,
        salleId: infoB204,
      }),

      // Vendredi : TD Mathématiques discrètes
      buildCours({
        dayOfWeek: 5,
        slotIndex: 9,
        type: "TD",
        groupId: l2gl,
        subjectId: mathsDisc,
        teacherId: teacherMarie._id,
        salleId: tdC102,
      }),
    ];

    // Filet de sécurité : mêmes règles que le conflictChecker
    // applicatif — le seed ne doit JAMAIS créer de conflit.
    const conflicts = detectConflicts(coursList);
    if (conflicts.length > 0) {
      throw new Error(
        `Conflits dans le jeu de données du seed :\n` +
          conflicts.map((c) => `  - [${c.type}] ${c.message}`).join("\n")
      );
    }

    // Vérifie qu'aucun cours n'empiète sur une indisponibilité
    // récurrente déclarée ci-dessus.
    const indipoClash = coursList.filter((c) =>
      indisponibilites.some(
        (i) =>
          i.teacherId.toString() === String(c.teacherId) &&
          i.dayOfWeek === c.dayOfWeek &&
          i.slotIndex === c.slotIndex
      )
    );
    if (indipoClash.length > 0) {
      throw new Error(
        "Un ou plusieurs cours empiètent sur une indisponibilité déclarée"
      );
    }

    await Cours.insertMany(coursList);

    const drafts = coursList.filter((c) => !c.isPublished).length;
    console.log(
      `📅 Emploi du temps créé : ${coursList.length} cours ` +
        `(${coursList.length - drafts} publiés, ${drafts} brouillons)`
    );

    // --------------------------------------------------------
    // RÉCAPITULATIF DES COMPTES DE DÉMONSTRATION
    // --------------------------------------------------------

    console.log("");
    console.log("──────────────────────────────────────────────");
    console.log(`Comptes de démonstration (mot de passe : ${demoPassword})`);
    console.log("  Admin       : admin@gmail.com");
    console.log("  Enseignant  : enseignant@gmail.com  (Jean Rakoto)");
    console.log("  Enseignant  : enseignant2@gmail.com (Marie Andriamaro)");
    console.log("  Enseignant  : enseignant3@gmail.com (Hery Ravelo)");
    console.log("  Étudiant    : etudiant@gmail.com    (Fidy Razafy, actif)");
    console.log("  Étudiant    : etudiant3@gmail.com   (Naina Rabemananjara, actif)");
    console.log("  Étudiant    : etudiant4@gmail.com   (Soa Randrianarisoa, actif)");
    console.log("  Étudiant    : etudiant2@gmail.com   (en attente d'activation)");
    console.log("  Étudiant    : etudiant5@gmail.com   (en attente d'activation)");
    console.log("──────────────────────────────────────────────");

    await mongoose.connection.close();

    process.exit(0);
  } catch (error) {
    console.error("");
    console.error("❌ ERREUR LORS DU SEED");
    console.error(error);

    await mongoose.connection.close().catch(() => {});

    process.exit(1);
  }
};

seed();
