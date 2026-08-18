import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../Models/User.js";


// ===============================
// REGISTER
// ===============================

export const register = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      password,
      role,
      niveau,
      filiere,
      typeEnseignant,
      discipline,
    } = req.body;

    // Vérification des champs
    if (
      !firstName ||
      !lastName ||
      !email ||
      !password
    ) {
      return res.status(400).json({
        message: "Tous les champs sont obligatoires",
      });
    }

    // Vérifier si l'utilisateur existe
    const existingUser = await User.findOne({
      email,
    });

    if (existingUser) {
      return res.status(409).json({
        message: "Cet email est déjà utilisé",
      });
    }

    // Hash du mot de passe
    const hashedPassword = await bcrypt.hash(
      password,
      10
    );

    const userRole = role || "etudiant";

    // Préparation des données
    const userData = {
      firstName,
      lastName,
      email,
      password: hashedPassword,
      role: userRole,
      isActive: true,
    };

    if (userRole === "etudiant") {
      userData.niveau = niveau;
      userData.filiere = filiere;
    } else if (userRole === "enseignant") {
      userData.typeEnseignant = typeEnseignant;
      userData.discipline = discipline;
    } else if (userRole === "admin") {
      // Nothing special for admin in this phase
    }

    // Création utilisateur
    const user = await User.create(userData);

    return res.status(201).json({
      message: "Inscription réussie",
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
      },
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Erreur serveur",
    });
  }
};


// ===============================
// LOGIN
// ===============================

export const login = async (req, res) => {
  try {
    const {
      email,
      password,
    } = req.body;

    // Vérification
    if (!email || !password) {
      return res.status(400).json({
        message: "Email et mot de passe obligatoires",
      });
    }

    // Recherche utilisateur
    const user = await User.findOne({
      email,
    });

    if (!user) {
      return res.status(401).json({
        message: "Email ou mot de passe incorrect",
      });
    }

    // Vérifier compte actif
    if (!user.isActive) {
      return res.status(403).json({
        message: "Votre compte est désactivé",
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
    console.error(error);

    return res.status(500).json({
      message: "Erreur serveur",
    });
  }
};