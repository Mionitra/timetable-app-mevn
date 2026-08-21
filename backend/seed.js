import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

dotenv.config();

import {
  User,
  AcademicYear,
  Semester,
  Group,
  Salle,
  Subject,
  Enrollment,
  Indisponibilite,
  Cours,
  Alerte,
} from "./src/Models/index.js";

const seed = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI n'est pas défini dans .env");
    }
    await mongoose.connect(process.env.MONGO_URI);

    await Alerte.deleteMany({});
    await Enrollment.deleteMany({});
    await Cours.deleteMany({});
    await Indisponibilite.deleteMany({});
    await Subject.deleteMany({});
    await Salle.deleteMany({});
    await User.deleteMany({});
    await Group.deleteMany({});
    await Semester.deleteMany({});
    await AcademicYear.deleteMany({});

    console.log("🗑️ Anciennes données supprimées");

    const year = await AcademicYear.create({
      name: "2025-2026",
      start_date: new Date("2025-09-01"),
      end_date: new Date("2026-06-30"),
      is_current: true,
    });

    console.log(`📅 Année académique créée : ${year.name}`);

    const [s1, s2] = await Semester.insertMany([
      {
        academic_year_id: year._id,
        name: "Semestre 1",
        start_date: new Date("2025-09-01"),
        end_date: new Date("2025-12-20"),
      },
      {
        academic_year_id: year._id,
        name: "Semestre 2",
        start_date: new Date("2026-01-10"),
        end_date: new Date("2026-05-30"),
      },
    ]);

    console.log(`📚 Semestres créés : ${s1.name}, ${s2.name}`);

    const groups = await Group.insertMany([
      {
        name: "L1",
        study_level: "L1",
        department: "Général",
        academic_year_id: year._id,
      },
      {
        name: "L2 GL",
        study_level: "L2",
        department: "GL",
        academic_year_id: year._id,
      },
      {
        name: "L2 ARSB",
        study_level: "L2",
        department: "ARSB",
        academic_year_id: year._id,
      },
      {
        name: "L2 AID",
        study_level: "L2",
        department: "AID",
        academic_year_id: year._id,
      },
      {
        name: "L3 GL",
        study_level: "L3",
        department: "GL",
        academic_year_id: year._id,
      },
      {
        name: "L3 ARSB",
        study_level: "L3",
        department: "ARSB",
        academic_year_id: year._id,
      },
      {
        name: "L3 AID",
        study_level: "L3",
        department: "AID",
        academic_year_id: year._id,
      },
    ]);

    const getGroup = (name) => {
      const group = groups.find((g) => g.name === name);
      if (!group) {
        throw new Error(`Groupe introuvable : ${name}`);
      }
      return group;
    };

    console.log(`🏫 Groupes créés : ${groups.length}`);

    const hash = await bcrypt.hash("12345678", 10);

    const admin = await User.create({
      first_name: "Admin",
      last_name: "Principal",
      email: "admin@gmail.com",
      password_hash: hash,
      role: "admin",
      is_active: true,
    });

    console.log(`👑 Admin créé : ${admin.email}`);

    const [teacher1, teacher2] = await User.insertMany([
      {
        first_name: "Jean",
        last_name: "Rakoto",
        email: "enseignant1@gmail.com",
        password_hash: hash,
        role: "enseignant",
        teacher_type: "permanent",
        discipline: "informatique",
        is_active: true,
      },
      {
        first_name: "Marie",
        last_name: "Andriamaro",
        email: "enseignant2@gmail.com",
        password_hash: hash,
        role: "enseignant",
        teacher_type: "vacataire",
        discipline: "mathematiques",
        is_active: true,
      },
    ]);

    console.log("👨‍🏫 Enseignants créés : 2");

    const [student1, student2, student3] = await User.insertMany([
      {
        first_name: "Fidy",
        last_name: "Razafy",
        email: "etudiant1@gmail.com",
        password_hash: hash,
        role: "etudiant",
        student_id: "STU001",
        group_id: getGroup("L2 GL")._id,
        join_date: new Date("2025-09-01"),
        is_active: true,
      },
      {
        first_name: "Lala",
        last_name: "Ratsimbazafy",
        email: "etudiant2@gmail.com",
        password_hash: hash,
        role: "etudiant",
        student_id: "STU002",
        group_id: getGroup("L2 ARSB")._id,
        join_date: new Date("2025-09-01"),
        is_active: true,
      },
      {
        first_name: "Tia",
        last_name: "Randria",
        email: "etudiant3@gmail.com",
        password_hash: hash,
        role: "etudiant",
        student_id: "STU003",
        group_id: getGroup("L3 GL")._id,
        join_date: new Date("2025-09-01"),
        is_active: true,
      },
    ]);

    console.log("🎓 Étudiants créés : 3");
    console.log("👥 Total utilisateurs créés : 6");

    // ---- CORRECTION DES SALLES ----
    // Noms uniques, ajout des salles manquantes (Salle TD1, Salle Info B204)
    const salles = await Salle.insertMany([
      // Bâtiment 1
      { name: "Salle 1", capacite: 120, batiment: "Bâtiment 1" },
      { name: "Salle 2", capacite: 30, batiment: "Bâtiment 1" },
      { name: "Salle 3", capacite: 30, batiment: "Bâtiment 1" },
      { name: "Salle 4", capacite: 120, batiment: "Bâtiment 1" },
      { name: "Salle 5", capacite: 50, batiment: "Bâtiment 1" },
      { name: "Salle 6", capacite: 30, batiment: "Bâtiment 1" },
      // Bâtiment 2 (renommage pour éviter les doublons)
      { name: "Salle 7", capacite: 60, batiment: "Bâtiment 2" },
      { name: "Salle 8", capacite: 50, batiment: "Bâtiment 2" },
      { name: "Salle 9", capacite: 70, batiment: "Bâtiment 2" },
      { name: "Salle 10", capacite: 60, batiment: "Bâtiment 2" },
      { name: "Salle 11", capacite: 80, batiment: "Bâtiment 2" },
      // Salles spécifiques utilisées dans les cours
      { name: "Salle TD1", capacite: 30, batiment: "Bâtiment 1" },
      { name: "Salle Info B204", capacite: 50, batiment: "Bâtiment 2" },
    ]);

    const getSalle = (name) => {
      const salle = salles.find((s) => s.name === name);
      if (!salle) {
        throw new Error(`Salle introuvable : ${name}`);
      }
      return salle;
    };

    console.log(`🏢 Salles créées : ${salles.length}`);

    const subjects = await Subject.insertMany([
      {
        name: "Base de données",
        code: "INF301",
        credits: 4,
        duree: 120,
        description: "Introduction aux SGBD relationnels et NoSQL.",
        color: "blue",
        semester_id: s1._id,
        user_id: teacher1._id,
      },
      {
        name: "Algorithmique & Structures",
        code: "INF302",
        credits: 6,
        duree: 120,
        description: "Conception d'algorithmes, structures avancées.",
        color: "purple",
        semester_id: s1._id,
        user_id: teacher1._id,
      },
      {
        name: "Développement Web Avancé",
        code: "INF303",
        credits: 5,
        duree: 120,
        description: "Frameworks modernes, API REST, Vue.js, Node.js.",
        color: "emerald",
        semester_id: s2._id,
        user_id: teacher1._id,
      },
      {
        name: "Mathématiques Appliquées",
        code: "MAT301",
        credits: 5,
        duree: 120,
        description: "Statistiques, probabilités, mathématiques discrètes.",
        color: "amber",
        semester_id: s1._id,
        user_id: teacher2._id,
      },
      {
        name: "Réseaux Informatiques",
        code: "INF304",
        credits: 4,
        duree: 120,
        description: "Protocoles, architecture TCP/IP, sécurité.",
        color: "rose",
        semester_id: s2._id,
        user_id: teacher1._id,
      },
      {
        name: "Anglais Technique",
        code: "LAN301",
        credits: 2,
        duree: 90,
        description: "Communication technique en anglais pour l'informatique.",
        color: "indigo",
        semester_id: s1._id,
        user_id: teacher2._id,
      },
    ]);

    const getSub = (code) => {
      const subject = subjects.find((s) => s.code === code);
      if (!subject) {
        throw new Error(`Matière introuvable : ${code}`);
      }
      return subject;
    };

    console.log(`📚 Matières créées : ${subjects.length}`);

    await Indisponibilite.insertMany([
      {
        user_id: teacher1._id,
        day_of_week: 2,
        start_time: "14:00",
        end_time: "16:00",
        start_date: new Date("2025-09-01"),
        end_date: new Date("2025-12-20"),
      },
      {
        user_id: teacher1._id,
        day_of_week: 5,
        start_time: "08:00",
        end_time: "10:00",
        start_date: new Date("2025-09-01"),
        end_date: new Date("2025-12-20"),
      },
      {
        user_id: teacher2._id,
        day_of_week: 3,
        start_time: "13:00",
        end_time: "15:00",
        start_date: new Date("2025-09-01"),
        end_date: new Date("2025-12-20"),
      },
    ]);

    console.log("⛔ Indisponibilités créées : 3");

    // ---- CORRECTION DES RÉFÉRENCES AUX SALLES ----
    const coursData = [
      // LUNDI
      {
        subject_id: getSub("INF301")._id,
        teacher_id: teacher1._id,
        group_id: getGroup("L2 GL")._id,
        salle_id: getSalle("Salle 1")._id,
        day_of_week: 1,
        start_time: "08:00",
        end_time: "10:00",
        start_date: new Date("2025-09-01"),
        end_date: new Date("2025-12-20"),
        type: "CM",
        description: "Introduction aux bases de données",
      },
      {
        subject_id: getSub("INF302")._id,
        teacher_id: teacher1._id,
        group_id: getGroup("L2 GL")._id,
        salle_id: getSalle("Salle TD1")._id,
        day_of_week: 1,
        start_time: "10:30",
        end_time: "12:30",
        start_date: new Date("2025-09-01"),
        end_date: new Date("2025-12-20"),
        type: "TD",
        description: "Exercices tris et recherches",
      },
      // MARDI
      {
        subject_id: getSub("INF304")._id,
        teacher_id: teacher1._id,
        group_id: getGroup("L2 ARSB")._id,
        salle_id: getSalle("Salle 2")._id,
        day_of_week: 2,
        start_time: "09:00",
        end_time: "11:00",
        start_date: new Date("2025-09-01"),
        end_date: new Date("2025-12-20"),
        type: "CM",
        description: "Protocoles TCP/IP, UDP",
      },
      // MERCREDI
      {
        subject_id: getSub("INF301")._id,
        teacher_id: teacher1._id,
        group_id: getGroup("L2 GL")._id,
        salle_id: getSalle("Salle Info B204")._id,
        day_of_week: 3,
        start_time: "08:00",
        end_time: "12:00",
        start_date: new Date("2025-09-01"),
        end_date: new Date("2025-12-20"),
        type: "TP",
        description: "TP MongoDB et requêtes NoSQL",
      },
      // JEUDI
      {
        subject_id: getSub("LAN301")._id,
        teacher_id: teacher2._id,
        group_id: getGroup("L2 GL")._id,
        salle_id: getSalle("Salle TD1")._id,
        day_of_week: 4,
        start_time: "13:00",
        end_time: "15:00",
        start_date: new Date("2025-09-01"),
        end_date: new Date("2025-12-20"),
        type: "TD",
        description: "Technical English: API documentation",
      },
      {
        subject_id: getSub("INF302")._id,
        teacher_id: teacher1._id,
        group_id: getGroup("L3 GL")._id,
        salle_id: getSalle("Salle 1")._id,
        day_of_week: 4,
        start_time: "15:30",
        end_time: "17:30",
        start_date: new Date("2025-09-01"),
        end_date: new Date("2025-12-20"),
        type: "CM",
        description: "Algorithmes de graphes : Dijkstra, BFS, DFS",
      },
      // VENDREDI
      {
        subject_id: getSub("MAT301")._id,
        teacher_id: teacher2._id,
        group_id: getGroup("L2 ARSB")._id,
        salle_id: getSalle("Salle 1")._id,
        day_of_week: 5,
        start_time: "10:00",
        end_time: "12:00",
        start_date: new Date("2025-09-01"),
        end_date: new Date("2025-12-20"),
        type: "CM",
        description: "Combinatoire et probabilités",
      },
      {
        subject_id: getSub("INF303")._id,
        teacher_id: teacher1._id,
        group_id: getGroup("L3 GL")._id,
        salle_id: getSalle("Salle Info B204")._id,
        day_of_week: 5,
        start_time: "14:00",
        end_time: "16:00",
        start_date: new Date("2025-09-01"),
        end_date: new Date("2025-12-20"),
        type: "TP",
        description: "Intégration Vue.js avec API REST",
      },
    ];

    const createdCours = await Cours.insertMany(coursData);
    console.log(`📅 Cours créés : ${createdCours.length}`);

    await Enrollment.insertMany([
      // Étudiant L2 GL
      {
        student_id: student1._id,
        subject_id: getSub("INF301")._id,
      },
      {
        student_id: student1._id,
        subject_id: getSub("INF302")._id,
      },
      {
        student_id: student1._id,
        subject_id: getSub("MAT301")._id,
      },
      {
        student_id: student1._id,
        subject_id: getSub("LAN301")._id,
      },
      // Étudiant L2 ARSB
      {
        student_id: student2._id,
        subject_id: getSub("INF304")._id,
      },
      {
        student_id: student2._id,
        subject_id: getSub("MAT301")._id,
      },
      // Étudiant L3 GL
      {
        student_id: student3._id,
        subject_id: getSub("INF302")._id,
      },
      {
        student_id: student3._id,
        subject_id: getSub("INF303")._id,
      },
      {
        student_id: student3._id,
        subject_id: getSub("INF304")._id,
      },
    ]);

    console.log("📝 Inscriptions créées : 9");

    await Alerte.insertMany([
      {
        type: "salle_occupee",
        message:
          "La salle Salle 1 est déjà occupée pour le créneau 08:00-10:00 le lundi.",
        cours_id: createdCours[0]._id,
        salle_id: getSalle("Salle 1")._id,
        is_read: false,
      },
      {
        type: "prof_indisponible",
        message:
          "L'enseignant Jean Rakoto est indisponible le mardi de 14h à 16h.",
        user_id: teacher1._id,
        is_read: false,
      },
    ]);

    console.log("🔔 Alertes créées : 2");
    console.log("");
    console.log("============================================");
    console.log("SEED TERMINÉ AVEC SUCCÈS !");
    console.log("============================================");
    console.log("  Comptes de test (mot de passe : 12345678)");
    console.log("  Admin      → admin@gmail.com");
    console.log("  Enseignant → enseignant1@gmail.com");
    console.log("  Étudiant 1 → etudiant1@gmail.com  (L2 GL - 4 matières)");
    console.log("  Étudiant 2 → etudiant2@gmail.com  (L2 ARSB - 2 matières)");
    console.log("  Étudiant 3 → etudiant3@gmail.com  (L3 GL - 3 matières)");
    console.log("============================================");

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error("");
    console.error("============================================");
    console.error("❌ ERREUR SEED");
    console.error("============================================");
    console.error(error);
    console.error("============================================");

    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
    }
    process.exit(1);
  }
};

seed();