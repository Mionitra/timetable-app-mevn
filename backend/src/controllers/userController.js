import bcrypt from "bcryptjs";
import User from "../Models/User.js";

// =====================================================
// HELPERS
// =====================================================

const formatUser = (u) => ({
  id: u._id,
  firstName: u.firstName,
  lastName: u.lastName,
  email: u.email,
  role: u.role,
  isActive: u.isActive,
  studentId: u.studentId,
  group: u.groupId || null,
  typeEnseignant: u.typeEnseignant,
  discipline: u.discipline,
  createdAt: u.createdAt,
});

// Génère un mot de passe temporaire lisible (affiché une seule fois)
const generateTemporaryPassword = () => {
  const chars = "ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
  let password = "";
  for (let i = 0; i < 10; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
};

// =====================================================
// GET /api/users/pending (admin, RF-AUTH-02)
// Liste des étudiants en attente d'activation
// =====================================================
export const getPendingStudents = async (req, res) => {
  try {
    const students = await User.find({
      role: "etudiant",
      isActive: false,
    })
      .populate("groupId", "name promotion")
      .sort({ createdAt: 1 });

    return res.status(200).json(students.map(formatUser));
  } catch (error) {
    console.error("GetPendingStudents Error:", error);
    return res.status(500).json({ message: "Erreur serveur" });
  }
};

// =====================================================
// PATCH /api/users/:id/activate (admin, RF-AUTH-02)
// Active un compte étudiant
// =====================================================
export const activateStudent = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "Utilisateur introuvable" });
    }

    if (user.role !== "etudiant") {
      return res.status(400).json({
        message: "Seuls les comptes étudiants nécessitent une activation",
      });
    }

    user.isActive = true;
    await user.save();

    return res.status(200).json({
      message: "Compte activé avec succès",
      user: formatUser(user),
    });
  } catch (error) {
    console.error("ActivateStudent Error:", error);
    return res.status(500).json({ message: "Erreur serveur" });
  }
};

// =====================================================
// GET /api/users/teachers (admin)
// Liste des enseignants actifs (référentiel + formulaire EDT)
// =====================================================
export const getTeachers = async (req, res) => {
  try {
    const teachers = await User.find({
      role: "enseignant",
      isActive: true,
    }).sort({ lastName: 1, firstName: 1 });

    return res.status(200).json(teachers.map(formatUser));
  } catch (error) {
    console.error("GetTeachers Error:", error);
    return res.status(500).json({ message: "Erreur serveur" });
  }
};

// =====================================================
// POST /api/users/teacher (admin, RF-AUTH-03)
// Crée un compte enseignant actif avec mot de passe temporaire
// affiché UNE SEULE fois à l'admin
// =====================================================
export const createTeacher = async (req, res) => {
  try {
    const { firstName, lastName, email, typeEnseignant, discipline } =
      req.body;

    if (!firstName || !lastName || !email || !typeEnseignant) {
      return res.status(400).json({
        message:
          "Prénom, nom, email et type d'enseignant sont obligatoires",
      });
    }

    const existingUser = await User.findOne({
      email: email.toLowerCase().trim(),
    });

    if (existingUser) {
      return res.status(409).json({
        message: "Cet email est déjà utilisé",
      });
    }

    const temporaryPassword = generateTemporaryPassword();
    const hashedPassword = await bcrypt.hash(temporaryPassword, 10);

    const teacher = await User.create({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      role: "enseignant",
      typeEnseignant,
      discipline: discipline || null,
      // Pas de workflow de validation pour les enseignants (RF-AUTH-03)
      isActive: true,
    });

    return res.status(201).json({
      message: "Enseignant créé avec succès",
      temporaryPassword,
      user: formatUser(teacher),
    });
  } catch (error) {
    console.error("CreateTeacher Error:", error);
    return res.status(500).json({ message: "Erreur serveur" });
  }
};

// =====================================================
// PATCH /api/users/:id/deactivate (admin, RF-ADMIN-04)
// Désactive un enseignant (soft delete : préserve l'historique
// des cours qui le référencent)
// =====================================================
export const deactivateTeacher = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "Utilisateur introuvable" });
    }

    if (user.role !== "enseignant") {
      return res.status(400).json({
        message: "Seuls les comptes enseignants peuvent être désactivés ici",
      });
    }

    user.isActive = false;
    await user.save();

    return res.status(200).json({
      message: "Compte enseignant désactivé",
      user: formatUser(user),
    });
  } catch (error) {
    console.error("DeactivateTeacher Error:", error);
    return res.status(500).json({ message: "Erreur serveur" });
  }
};
