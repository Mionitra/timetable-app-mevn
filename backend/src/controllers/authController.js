import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import {
  User,
  Group,
} from "../Models/index.js";

// ===============================
// REGISTER
// ===============================
// Données attendues depuis Register.vue :
// { firstName, lastName, email, password, role,
//   profileImage, coverImage, niveau, filiere }
export const register = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      password,
      role,
      profileImage,
      coverImage,
      niveau,
      filiere,
      studentId,
      teacherType,
      discipline,
    } = req.body;

    // Champs obligatoires
    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ message: "Tous les champs sont obligatoires" });
    }

    // Vérifier si l'email est déjà utilisé
    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      return res.status(409).json({ message: "Cet email est déjà utilisé" });
    }

    const userRole = role || "etudiant";
    const passwordHash = await bcrypt.hash(password, 10);

    // =====================================================
    // RECHERCHE AUTOMATIQUE DU GROUPE POUR LES ÉTUDIANTS
    // =====================================================

    let group = null;

    if (userRole === "etudiant") {
      if (!filiere || !niveau) {
        return res.status(400).json({
          message: "La filière et le niveau sont obligatoires pour un étudiant",
        });
      }

      // Chercher le groupe correspondant à filière + niveau
      group = await Group.findOne({
        department: filiere,
        study_level: niveau,
      });

      if (!group) {
        return res.status(400).json({
          message: `Aucun groupe trouvé pour la filière ${filiere} et le niveau ${niveau}`,
        });
      }

      console.log(`✅ Groupe trouvé pour ${filiere} ${niveau} : ${group.name} (${group._id})`);
    }

    const user = await User.create({
      first_name: firstName.trim(),
      last_name: lastName.trim(),
      email: email.toLowerCase().trim(),
      password_hash: passwordHash,
      role: userRole,
      // Champs étudiant
      niveau: userRole === "etudiant" ? (niveau || null) : null,
      filiere: userRole === "etudiant" ? (filiere || null) : null,
      // Groupe trouvé automatiquement
      group_id: group ? group._id : null,
      // Photos
      profileImage: profileImage || null,
      coverImage: coverImage || null,
      // Optionnels
      student_id: studentId || undefined,
      // Enseignant
      teacher_type: userRole === "enseignant" ? (teacherType || null) : null,
      discipline: userRole === "enseignant" ? (discipline || null) : null,
      join_date: new Date(),
    });

    return res.status(201).json({
      message: "Inscription réussie",
      user: {
        id: user._id,
        firstName: user.first_name,
        lastName: user.last_name,
        email: user.email,
        role: user.role,
        filiere: user.filiere,
        niveau: user.niveau,
        group_id: user.group_id,
      },
    });

  } catch (error) {
    console.error("Register Error:", error);
    return res.status(500).json({ message: "Erreur serveur" });
  }
};

// ===============================
// LOGIN
// ===============================
// Données attendues depuis Login.vue :
// { email, password }
export const login = async (req, res) => {
  try {
    let { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email et mot de passe obligatoires" });
    }

    email = email.toLowerCase().trim();
    password = password.trim();

    // Chercher l'utilisateur (password_hash est select:false, on le demande explicitement)
    const user = await User.findOne({ email }).select("+password_hash");

    if (!user) {
      return res.status(401).json({ message: "Email ou mot de passe incorrect" });
    }

    // Vérifier le mot de passe
    const passwordValid = await bcrypt.compare(password, user.password_hash);
    if (!passwordValid) {
      return res.status(401).json({ message: "Email ou mot de passe incorrect" });
    }

    // Générer le JWT
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
    );

    return res.status(200).json({
      message: "Connexion réussie",
      token,
      user: {
        id: user._id,
        firstName: user.first_name,
        lastName: user.last_name,
        email: user.email,
        role: user.role,
      },
    });

  } catch (error) {
    console.error("Login Error:", error);
    return res.status(500).json({ message: "Erreur serveur" });
  }
};