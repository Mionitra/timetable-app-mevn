import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../Models/User.js";
import Group from "../Models/Group.js";


// ===============================
// REGISTER (inscription étudiante, RF-AUTH-01)
// ===============================
// Données attendues depuis Register.vue :
// { firstName, lastName, email, password,
//   studentId, groupId }
// Le compte est créé inactif : il doit être validé
// par un admin avant toute connexion.

export const register = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      password,
      studentId,
      groupId,
      niveau,
      filiere,
      profileImage,
      coverImage,
    } = req.body;

    // Vérification des champs obligatoires
    if (
      !firstName ||
      !lastName ||
      !email ||
      !password ||
      !studentId ||
      !groupId
    ) {
      return res.status(400).json({
        message: "Tous les champs sont obligatoires",
      });
    }

    // Vérifier si l'email est déjà utilisé
    const existingEmail = await User.findOne({
      email: email.toLowerCase().trim(),
    });

    if (existingEmail) {
      return res.status(409).json({
        message: "Cet email est déjà utilisé",
      });
    }

    // Vérifier si le matricule est déjà utilisé
    const existingStudentId = await User.findOne({
      studentId: studentId.trim(),
    });

    if (existingStudentId) {
      return res.status(409).json({
        message: "Ce matricule étudiant est déjà utilisé",
      });
    }

    // Vérifier que le groupe cible existe et est actif
    const group = await Group.findOne({
      _id: groupId,
      isArchived: false,
    });

    if (!group) {
      return res.status(400).json({
        message: "Le groupe sélectionné est invalide",
      });
    }

    // Hash du mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);

    // Création du compte étudiant INACTIF
    const user = await User.create({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      role: "etudiant",
      isActive: false,
      studentId: studentId.trim(),
      groupId: group._id,
      niveau: niveau || null,
      filiere: filiere || null,
      profileImage: profileImage || null,
      coverImage: coverImage || null,
    });

    return res.status(201).json({
      message:
        "Inscription réussie. Votre compte est en attente d'activation par l'administration.",
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
      },
    });

  } catch (error) {
    console.error("Register Error:", error);

    return res.status(500).json({
      message: "Erreur serveur",
    });
  }
};


// ===============================
// LOGIN (RF-AUTH-04)
// ===============================
// Données attendues depuis Login.vue :
// { email, password }

export const login = async (req, res) => {
  try {
    let {
      email,
      password,
    } = req.body;

    // Vérification
    if (!email || !password) {
      return res.status(400).json({
        message: "Email et mot de passe obligatoires",
      });
    }

    email = email.toLowerCase().trim();
    password = password.trim();

    // Recherche utilisateur (en incluant le mot de passe qui est caché par défaut)
    const user = await User.findOne({
      email,
    }).select("+password");

    if (!user) {
      return res.status(401).json({
        message: "Email ou mot de passe incorrect",
      });
    }

    // Compte en attente d'activation : erreur explicite distincte
    // du mauvais mot de passe (RF-AUTH-01)
    if (!user.isActive) {
      return res.status(403).json({
        error: "ACCOUNT_PENDING_ACTIVATION",
        message:
          "Votre compte est en attente d'activation par l'administration",
      });
    }

    // Vérifier mot de passe
    const passwordValid = await bcrypt.compare(
      password,
      user.password
    );

    if (!passwordValid) {
      return res.status(401).json({
        message: "Email ou mot de passe incorrect",
      });
    }

    // Création JWT
    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
      },

      process.env.JWT_SECRET,

      {
        expiresIn: process.env.JWT_EXPIRES_IN || "7d",
      }
    );

    return res.status(200).json({
      message: "Connexion réussie",

      token,

      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
      },
    });

  } catch (error) {
    console.error("Login Error:", error);

    return res.status(500).json({
      message: "Erreur serveur",
    });
  }
};
