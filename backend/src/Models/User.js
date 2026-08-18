import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    role: {
      type: String,
      enum: ["admin", "enseignant", "etudiant"],
      default: "etudiant",
    },
    isActive: {
      type: Boolean,
      default: true,
    },


    niveau: {
      type: String,
      enum: ["L1", "L2", "L3"],

    },
    filiere: {
      type: String,
      enum: ["IAD", "ARSB", "GL", "SIG", "R&T"],
    },

    typeEnseignant: {
      type: String,
      enum: ["permanent", "vacataire", "contractuel"],
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
    },
  },
  {
    timestamps: true,
  }
);

userSchema.index({ email: 1 });
userSchema.index({ role: 1 });
userSchema.index({ niveau: 1, filiere: 1 })
userSchema.index({ typeEnseignant: 1, discipline: 1 });

const User = mongoose.model("User", userSchema);

export default User;