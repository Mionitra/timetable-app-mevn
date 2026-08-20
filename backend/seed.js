import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

dotenv.config();

import AcademicYear from "./src/Models/AcademicYear.js";
import Semester from "./src/Models/Semester.js";
import Enrollment from "./src/Models/Enrollment.js";
import User from "./src/Models/User.js";
import Group from "./src/Models/Group.js";
import Salle from "./src/Models/Salle.js";
import Subject from "./src/Models/Subject.js";
import Indisponibilite from "./src/Models/Indisponibilite.js";
import Cours from "./src/Models/Cours.js";
import Alerte from "./src/Models/Alerte.js";

const seed = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI n'est pas défini dans .env");
    }
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connecté pour le seed");

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

    console.log(" Anciennes données supprimées");

    const year = await AcademicYear.create({
      name: "2025-2026",
      start_date: new Date("2025-09-01"),
      end_date: new Date("2026-06-30"),
      is_current: true
    });
    console.log("Année académique créée:", year.name);

    const [s1, s2] = await Semester.insertMany([
      { academic_year_id: year._id, name: "Semestre 1", start_date: new Date("2025-09-01"), end_date: new Date("2025-12-20") },
      { academic_year_id: year._id, name: "Semestre 2", start_date: new Date("2026-01-10"), end_date: new Date("2026-05-30") }
    ]);
    console.log("Semestres créés:", s1.name, s2.name);

    const groups = await Group.insertMany([
      { name: "L1", study_level: "L1", department: "Général", academic_year_id: year._id },
      { name: "L2 GL", study_level: "L2", department: "GL", academic_year_id: year._id },
      { name: "L2 ARSB", study_level: "L2", department: "ARSB", academic_year_id: year._id },
      { name: "L2 AID", study_level: "L2", department: "AID", academic_year_id: year._id },
      { name: "L3 GL", study_level: "L3", department: "GL", academic_year_id: year._id },
      { name: "L3 ARSB", study_level: "L3", department: "ARSB", academic_year_id: year._id },
      { name: "L3 AID", study_level: "L3", department: "AID", academic_year_id: year._id }
    ]);
    const getGroup = (name) => groups.find(g => g.name === name);
    console.log("🏫 Groupes créés :", groups.length);

    const hash = await bcrypt.hash("12345678", 10);

    const admin = await User.create({
      first_name: "Admin", last_name: "Principal", email: "admin@gmail.com",
      password_hash: hash, role: "admin", is_active: true
    });

    const [teacher1, teacher2] = await User.insertMany([
      { first_name: "Jean", last_name: "Rakoto", email: "enseignant1@gmail.com", password_hash: hash, role: "enseignant", teacher_type: "permanent", discipline: "informatique", is_active: true },
      { first_name: "Marie", last_name: "Andriamaro", email: "enseignant2@gmail.com", password_hash: hash, role: "enseignant", teacher_type: "vacataire", discipline: "mathematiques", is_active: true }
    ]);

    const [student1, student2, student3] = await User.insertMany([
      { first_name: "Fidy", last_name: "Razafy", email: "etudiant1@gmail.com", password_hash: hash, role: "etudiant", student_id: "STU001", group_id: getGroup("L2 GL")._id, join_date: new Date("2025-09-01"), is_active: true },
      { first_name: "Lala", last_name: "Ratsimbazafy", email: "etudiant2@gmail.com", password_hash: hash, role: "etudiant", student_id: "STU002", group_id: getGroup("L2 ARSB")._id, join_date: new Date("2025-09-01"), is_active: true },
      { first_name: "Tia", last_name: "Randria", email: "etudiant3@gmail.com", password_hash: hash, role: "etudiant", student_id: "STU003", group_id: getGroup("L3 GL")._id, join_date: new Date("2025-09-01"), is_active: true }
    ]);
    console.log("👤 Utilisateurs créés :", 6);

    const salles = await Salle.insertMany([
      { name: "Amphi A", capacite: 120, batiment: "Bâtiment A" },
      { name: "Amphi B", capacite: 100, batiment: "Bâtiment A" },
      { name: "Salle TD1", capacite: 40, batiment: "Bâtiment B" },
      { name: "Salle Info B204", capacite: 25, batiment: "Bâtiment B" },
      { name: "Salle TP", capacite: 30, batiment: "Bâtiment C" }
    ]);
    const getSalle = (name) => salles.find(s => s.name === name);
    console.log("🏢 Salles créées :", salles.length);

    const subjects = await Subject.insertMany([
      { name: "Base de données", code: "INF301", credits: 4, duree: 120, description: "Introduction aux SGBD relationnels et NoSQL.", color: "blue", semester_id: s1._id, user_id: teacher1._id },
      { name: "Algorithmique & Structures", code: "INF302", credits: 6, duree: 120, description: "Conception d'algorithmes, structures avancées.", color: "purple", semester_id: s1._id, user_id: teacher1._id },
      { name: "Développement Web Avancé", code: "INF303", credits: 5, duree: 120, description: "Frameworks modernes, API REST, Vue.js, Node.js.", color: "emerald", semester_id: s2._id, user_id: teacher1._id },
      { name: "Mathématiques Appliquées", code: "MAT301", credits: 5, duree: 120, description: "Statistiques, probabilités, mathématiques discrètes.", color: "amber", semester_id: s1._id, user_id: teacher2._id },
      { name: "Réseaux Informatiques", code: "INF304", credits: 4, duree: 120, description: "Protocoles, architecture TCP/IP, sécurité.", color: "rose", semester_id: s2._id, user_id: teacher1._id },
      { name: "Anglais Technique", code: "LAN301", credits: 2, duree: 90, description: "Communication technique en anglais pour l'informatique.", color: "indigo", semester_id: s1._id, user_id: teacher2._id }
    ]);
    const getSub = (code) => subjects.find(s => s.code === code);
    console.log("📚 Matières créées :", subjects.length);

    await Indisponibilite.insertMany([
      { user_id: teacher1._id, day_of_week: 2, start_time: "14:00", end_time: "16:00", start_date: new Date("2025-09-01"), end_date: new Date("2025-12-20") },
      { user_id: teacher1._id, day_of_week: 5, start_time: "08:00", end_time: "10:00", start_date: new Date("2025-09-01"), end_date: new Date("2025-12-20") },
      { user_id: teacher2._id, day_of_week: 3, start_time: "13:00", end_time: "15:00", start_date: new Date("2025-09-01"), end_date: new Date("2025-12-20") }
    ]);
    console.log("⛔ Indisponibilités créées");

    const coursData = [
      { subject_id: getSub("INF301")._id, teacher_id: teacher1._id, group_id: getGroup("L2 GL")._id, salle_id: getSalle("Amphi A")._id, day_of_week: 1, start_time: "08:00", end_time: "10:00", start_date: new Date("2025-09-01"), end_date: new Date("2025-12-20"), type: "CM", description: "Introduction aux bases de données" },
      { subject_id: getSub("INF302")._id, teacher_id: teacher1._id, group_id: getGroup("L2 GL")._id, salle_id: getSalle("Salle TD1")._id, day_of_week: 1, start_time: "10:30", end_time: "12:30", start_date: new Date("2025-09-01"), end_date: new Date("2025-12-20"), type: "TD", description: "Exercices tris et recherches" },
      { subject_id: getSub("INF304")._id, teacher_id: teacher1._id, group_id: getGroup("L2 ARSB")._id, salle_id: getSalle("Amphi B")._id, day_of_week: 2, start_time: "09:00", end_time: "11:00", start_date: new Date("2025-09-01"), end_date: new Date("2025-12-20"), type: "CM", description: "Protocoles TCP/IP, UDP" },
      { subject_id: getSub("INF301")._id, teacher_id: teacher1._id, group_id: getGroup("L2 GL")._id, salle_id: getSalle("Salle Info B204")._id, day_of_week: 3, start_time: "08:00", end_time: "12:00", start_date: new Date("2025-09-01"), end_date: new Date("2025-12-20"), type: "TP", description: "TP MongoDB et requêtes NoSQL" },
      { subject_id: getSub("LAN301")._id, teacher_id: teacher2._id, group_id: getGroup("L2 GL")._id, salle_id: getSalle("Salle TD1")._id, day_of_week: 4, start_time: "13:00", end_time: "15:00", start_date: new Date("2025-09-01"), end_date: new Date("2025-12-20"), type: "TD", description: "Technical English: API documentation" },
      { subject_id: getSub("INF302")._id, teacher_id: teacher1._id, group_id: getGroup("L3 GL")._id, salle_id: getSalle("Amphi A")._id, day_of_week: 4, start_time: "15:30", end_time: "17:30", start_date: new Date("2025-09-01"), end_date: new Date("2025-12-20"), type: "CM", description: "Algorithmes de graphes : Dijkstra, BFS, DFS" },
      { subject_id: getSub("MAT301")._id, teacher_id: teacher2._id, group_id: getGroup("L2 ARSB")._id, salle_id: getSalle("Amphi A")._id, day_of_week: 5, start_time: "10:00", end_time: "12:00", start_date: new Date("2025-09-01"), end_date: new Date("2025-12-20"), type: "CM", description: "Combinatoire et probabilités" },
      { subject_id: getSub("INF303")._id, teacher_id: teacher1._id, group_id: getGroup("L3 GL")._id, salle_id: getSalle("Salle Info B204")._id, day_of_week: 5, start_time: "14:00", end_time: "16:00", start_date: new Date("2025-09-01"), end_date: new Date("2025-12-20"), type: "TP", description: "Intégration Vue.js avec API REST" }
    ];
    const createdCours = await Cours.insertMany(coursData);
    console.log(`📅 ${createdCours.length} cours créés`);

    await Enrollment.insertMany([
      { student_id: student1._id, subject_id: getSub("INF301")._id },
      { student_id: student1._id, subject_id: getSub("INF302")._id },
      { student_id: student1._id, subject_id: getSub("MAT301")._id },
      { student_id: student1._id, subject_id: getSub("LAN301")._id },
      { student_id: student2._id, subject_id: getSub("INF304")._id },
      { student_id: student2._id, subject_id: getSub("MAT301")._id },
      { student_id: student3._id, subject_id: getSub("INF302")._id },
      { student_id: student3._id, subject_id: getSub("INF303")._id },
      { student_id: student3._id, subject_id: getSub("INF304")._id }
    ]);
    console.log("Inscriptions créées");

    await Alerte.insertMany([
      { type: "salle_occupee", message: "La salle Amphi A est déjà occupée pour le créneau 08:00-10:00 le lundi.", cours_id: createdCours[0]._id, salle_id: getSalle("Amphi A")._id, is_read: false },
      { type: "prof_indisponible", message: "L'enseignant Jean Rakoto est indisponible le mardi de 14h à 16h.", user_id: teacher1._id, is_read: false }
    ]);
    console.log("Alertes créées");

    await mongoose.connection.close();
    console.log("Seed terminé avec succès !");
    process.exit(0);

  } catch (error) {
    console.error("ERREUR SEED :", error.message);
    await mongoose.connection.close();
    process.exit(1);
  }
};

seed();