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

    isActive: {
      type: Boolean,
      default: true,
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

userSchema.index({ email: 1 });
userSchema.index({ role: 1 });
userSchema.index({ studentId: 1 });
userSchema.index({ niveau: 1, filiere: 1 });
userSchema.index({
  typeEnseignant: 1,
  discipline: 1,
});

// =========================================================
// MODEL
// =========================================================

const User = mongoose.model("User", userSchema);

export default User;