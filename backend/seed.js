import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

import User from "./src/Models/User.js";
import Subject from "./src/Models/Subject.js";
import Course from "./src/Models/Course.js";
import Enrollment from "./src/Models/Enrollment.js";

dotenv.config();

const seed = async () => {
  try {
    // ============================================================
    // CONNEXION MONGODB
    // ============================================================

    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI n'est pas défini dans le fichier .env");
    }

    await mongoose.connect(process.env.MONGO_URI);

    console.log("✅ MongoDB connecté pour le seed");

    // ============================================================
    // NETTOYAGE DES DONNÉES
    // ============================================================

    await Enrollment.deleteMany({});
    await Course.deleteMany({});
    await Subject.deleteMany({});

    // On supprime uniquement les comptes de démonstration.
    // Les comptes créés avec Register sont conservés.
    const seedEmails = [
      "admin@gmail.com",
      "enseignant@gmail.com",
      "enseignant2@gmail.com",
      "etudiant@gmail.com",
    ];

    await User.deleteMany({
      email: { $in: seedEmails },
    });

    console.log("🧹 Anciennes données de démonstration supprimées");

    // ============================================================
    // MOTS DE PASSE
    // ============================================================

    const adminPassword = "12345678";
    const teacherPassword = "12345678";
    const studentPassword = "12345678";

    // Hash des mots de passe
    const [adminPw, teacherPw, studentPw] = await Promise.all([
      bcrypt.hash(adminPassword, 10),
      bcrypt.hash(teacherPassword, 10),
      bcrypt.hash(studentPassword, 10),
    ]);

    // ============================================================
    // ADMIN
    // ============================================================

    const admin = await User.create({
      firstName: "Admin",
      lastName: "Principal",
      email: "admin@gmail.com",
      password: adminPw,
      role: "admin",
      isActive: true,
    });

    console.log("👑 Admin créé :", admin.email);

    // ============================================================
    // ENSEIGNANT 1
    // ============================================================

    const teacher = await User.create({
      firstName: "Jean",
      lastName: "Rakoto",
      email: "enseignant@gmail.com",
      password: teacherPw,
      role: "enseignant",
      typeEnseignant: "permanent",
      discipline: "informatique",
      isActive: true,
    });

    console.log("👨‍🏫 Enseignant créé :", teacher.email);

    // ============================================================
    // ENSEIGNANT 2
    // ============================================================

    const teacher2 = await User.create({
      firstName: "Marie",
      lastName: "Andriamaro",
      email: "enseignant2@gmail.com",
      password: teacherPw,
      role: "enseignant",
      typeEnseignant: "vacataire",
      discipline: "mathematiques",
      isActive: true,
    });

    console.log("👩‍🏫 Enseignant 2 créé :", teacher2.email);

    // ============================================================
    // ETUDIANT
    // ============================================================

    const student = await User.create({
      firstName: "Fidy",
      lastName: "Razafy",
      email: "etudiant@gmail.com",
      password: studentPw,
      role: "etudiant",
      niveau: "L2",
      filiere: "GL",
      isActive: true,
    });

    console.log("🎓 Étudiant créé :", student.email);

    console.log("👤 Tous les utilisateurs de démonstration sont créés");

    // ============================================================
    // SUBJECTS
    // ============================================================

    const subjects = await Subject.insertMany([
      {
        name: "Base de données",
        code: "INF301",
        credits: 4,
        color: "blue",
        description:
          "Introduction aux systèmes de gestion de bases de données relationnelles et NoSQL.",
        teacher: teacher._id,
      },

      {
        name: "Algorithmique & Structures de données",
        code: "INF302",
        credits: 6,
        color: "purple",
        description:
          "Conception et analyse d'algorithmes, structures de données avancées.",
        teacher: teacher._id,
      },

      {
        name: "Développement Web Avancé",
        code: "INF303",
        credits: 5,
        color: "emerald",
        description:
          "Frameworks modernes, API REST, Vue.js, Node.js.",
        teacher: teacher._id,
      },

      {
        name: "Mathématiques Appliquées",
        code: "MAT301",
        credits: 5,
        color: "amber",
        description:
          "Statistiques, probabilités et mathématiques discrètes.",
        teacher: teacher2._id,
      },

      {
        name: "Réseaux Informatiques",
        code: "INF304",
        credits: 4,
        color: "rose",
        description:
          "Protocoles réseaux, architecture TCP/IP, sécurité.",
        teacher: teacher._id,
      },

      {
        name: "Anglais Technique",
        code: "LAN301",
        credits: 2,
        color: "indigo",
        description:
          "Communication technique en anglais pour l'informatique.",
        teacher: teacher2._id,
      },
    ]);

    console.log("📚 Matières créées :", subjects.length);

    // ============================================================
    // DATES DES COURS
    // ============================================================

    const today = new Date();

    today.setHours(0, 0, 0, 0);

    const makeDateForDay = (dayIndex) => {
      const d = new Date(today);


      const currentDay =
        d.getDay() === 0
          ? 7
          : d.getDay();


      const targetDay = dayIndex + 1;

      const diff = targetDay - currentDay;

      d.setDate(d.getDate() + diff);

      return d;
    };

    // ============================================================
    // COURSES
    // ============================================================

    await Course.insertMany([
      // ----------------------------------------------------------
      // LUNDI
      // ----------------------------------------------------------

      {
        subject: subjects[0]._id,
        teacher: teacher._id,
        type: "CM",
        courseDate: makeDateForDay(0),
        startTime: "08:00",
        endTime: "10:00",
        dayOfWeek: 0,
        room: "Amphi A",
        building: "Bâtiment A",
        status: "upcoming",
        description:
          "Introduction aux bases de données relationnelles",
      },

      {
        subject: subjects[1]._id,
        teacher: teacher._id,
        type: "TD",
        courseDate: makeDateForDay(0),
        startTime: "10:30",
        endTime: "12:30",
        dayOfWeek: 0,
        room: "Salle TD1",
        building: "Bâtiment B",
        status: "upcoming",
        description:
          "Exercices sur les tris et recherches",
      },

      {
        subject: subjects[2]._id,
        teacher: teacher._id,
        type: "TP",
        courseDate: makeDateForDay(0),
        startTime: "14:00",
        endTime: "16:00",
        dayOfWeek: 0,
        room: "Salle Info B204",
        building: "Bâtiment B",
        status: "upcoming",
        description:
          "Création d'une API REST avec Node.js",
      },

      // ----------------------------------------------------------
      // MARDI
      // ----------------------------------------------------------

      {
        subject: subjects[4]._id,
        teacher: teacher._id,
        type: "CM",
        courseDate: makeDateForDay(1),
        startTime: "09:00",
        endTime: "11:00",
        dayOfWeek: 1,
        room: "Amphi B",
        building: "Bâtiment A",
        status: "upcoming",
        description:
          "Protocoles réseau : TCP/IP, UDP",
      },

      {
        subject: subjects[3]._id,
        teacher: teacher2._id,
        type: "TD",
        courseDate: makeDateForDay(1),
        startTime: "14:00",
        endTime: "16:00",
        dayOfWeek: 1,
        room: "Salle TD3",
        building: "Bâtiment C",
        status: "upcoming",
        description:
          "Probabilités et statistiques descriptives",
      },

      // ----------------------------------------------------------
      // MERCREDI
      // ----------------------------------------------------------

      {
        subject: subjects[0]._id,
        teacher: teacher._id,
        type: "TP",
        courseDate: makeDateForDay(2),
        startTime: "08:00",
        endTime: "12:00",
        dayOfWeek: 2,
        room: "Salle Info A101",
        building: "Bâtiment A",
        status: "upcoming",
        description:
          "TP MongoDB et requêtes NoSQL",
      },

      // ----------------------------------------------------------
      // JEUDI
      // ----------------------------------------------------------

      {
        subject: subjects[5]._id,
        teacher: teacher2._id,
        type: "TD",
        courseDate: makeDateForDay(3),
        startTime: "13:00",
        endTime: "15:00",
        dayOfWeek: 3,
        room: "Salle Langue",
        building: "Bâtiment D",
        status: "upcoming",
        description:
          "Technical English: Writing API documentation",
      },

      {
        subject: subjects[1]._id,
        teacher: teacher._id,
        type: "CM",
        courseDate: makeDateForDay(3),
        startTime: "15:30",
        endTime: "17:30",
        dayOfWeek: 3,
        room: "Amphi A",
        building: "Bâtiment A",
        status: "upcoming",
        description:
          "Algorithmes de graphes : Dijkstra, BFS, DFS",
      },

      // ----------------------------------------------------------
      // VENDREDI
      // ----------------------------------------------------------

      {
        subject: subjects[3]._id,
        teacher: teacher2._id,
        type: "CM",
        courseDate: makeDateForDay(4),
        startTime: "10:00",
        endTime: "12:00",
        dayOfWeek: 4,
        room: "Amphi C",
        building: "Bâtiment A",
        status: "upcoming",
        description:
          "Mathématiques discrètes : combinatoire",
      },

      {
        subject: subjects[2]._id,
        teacher: teacher._id,
        type: "TP",
        courseDate: makeDateForDay(4),
        startTime: "14:00",
        endTime: "16:00",
        dayOfWeek: 4,
        room: "Salle Info B204",
        building: "Bâtiment B",
        status: "upcoming",
        description:
          "Intégration Vue.js avec une API REST",
      },
    ]);

    console.log("📅 Emploi du temps créé : 10 cours");

    // ============================================================
    // ENROLLMENTS
    // ============================================================

    const allStudents = await User.find({
      role: "etudiant",
    });

    const enrollmentsToInsert = [];

    for (const stu of allStudents) {
      for (const sub of subjects) {
        enrollmentsToInsert.push({
          student: stu._id,
          subject: sub._id,
        });
      }
    }

    if (enrollmentsToInsert.length > 0) {
      await Enrollment.insertMany(enrollmentsToInsert);
    }

    console.log(
      `📝 ${enrollmentsToInsert.length} inscriptions créées`
    );

    await mongoose.connection.close();

    process.exit(0);

  } catch (error) {
    console.error("");
    console.error("❌ ERREUR LORS DU SEED");
    console.error(error);

    await mongoose.connection.close();

    process.exit(1);
  }
};

seed();