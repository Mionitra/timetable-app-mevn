import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../Models/User.js";

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
      groupId,
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

    const user = await User.create({
      first_name:   firstName.trim(),
      last_name:    lastName.trim(),
      email:        email.toLowerCase().trim(),
      password_hash: passwordHash,
      role:         userRole,
      // Champs étudiant
      niveau:       userRole === "etudiant" ? (niveau || null) : null,
      filiere:      userRole === "etudiant" ? (filiere || null) : null,
      // Photos
      profileImage: profileImage || null,
      coverImage:   coverImage   || null,
      // Optionnels
      student_id:   studentId || undefined,
      group_id:     groupId   || null,
      join_date:    new Date(),
    });

    return res.status(201).json({
      message: "Inscription réussie",
      user: {
        id:        user._id,
        firstName: user.first_name,
        lastName:  user.last_name,
        email:     user.email,
        role:      user.role,
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

    email    = email.toLowerCase().trim();
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
        id:        user._id,
        firstName: user.first_name,
        lastName:  user.last_name,
        email:     user.email,
        role:      user.role,
      },
    });

  } catch (error) {
    console.error("Login Error:", error);
    return res.status(500).json({ message: "Erreur serveur" });
  }
};