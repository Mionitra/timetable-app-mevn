import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    // =====================================================
    // INFORMATIONS PERSONNELLES
    // =====================================================

    firstName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },

    lastName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      maxlength: 255,
    },

    password: {
      type: String,
      required: true,
      minlength: 6,
      select: false,
    },

    // =====================================================
    // RÔLE
    // =====================================================

    role: {
      type: String,
      enum: ["admin", "enseignant", "etudiant"],
      default: "etudiant",
      required: true,
    },

    // Un compte étudiant est inactif jusqu'à validation par l'admin (RF-AUTH-01)
    isActive: {
      type: Boolean,
      default: false,
    },

    // =====================================================
    // PHOTO DE PROFIL
    // =====================================================

    profileImage: {
      type: String,
      default: null,
      trim: true,
    },

    // =====================================================
    // PHOTO DE COUVERTURE
    // =====================================================

    coverImage: {
      type: String,
      default: null,
      trim: true,
    },

    // =====================================================
    // ÉTUDIANT
    // =====================================================

    studentId: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
      maxlength: 50,
    },

    groupId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Group",
      default: null,
    },

    niveau: {
      type: String,
      enum: ["L1", "L2", "L3"],
      default: null,
    },

    filiere: {
      type: String,
      enum: ["IAD", "ARSB", "GL", "SIG", "R&T"],
      default: null,
    },

    // =====================================================
    // ENSEIGNANT
    // =====================================================

    typeEnseignant: {
      type: String,
      enum: [
        "permanent",
        "vacataire",
        "contractuel",
      ],
      default: null,
    },

    discipline: {
      type: String,
      enum: [
        "informatique",
        "mathematiques",
        "physique",
        "economie",
        "droit",
        "langues",
        "gestion",
      ],
      default: null,
    },

    // =====================================================
    // INFORMATIONS PROFIL
    // =====================================================

    phone: {
      type: String,
      default: null,
      trim: true,
    },

    bio: {
      type: String,
      default: "",
      trim: true,
      maxlength: 1000,
    },

    address: {
      type: String,
      default: null,
      trim: true,
    },

    // =====================================================
    // DATE D'INSCRIPTION
    // =====================================================

    joinDate: {
      type: Date,
      default: Date.now,
    },

    // =====================================================
    // DERNIÈRE CONNEXION
    // =====================================================

    lastLogin: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// =========================================================
// INDEX
// =========================================================

userSchema.index({ role: 1, isActive: 1 }); // liste "étudiants en attente d'activation"

// =========================================================
// MODEL
// =========================================================

const User = mongoose.model("User", userSchema);

export default User;