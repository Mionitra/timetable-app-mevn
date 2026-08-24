import mongoose from "mongoose";

const salleSchema = new mongoose.Schema(
  {
    // =====================================================
    // INFORMATIONS
    // =====================================================

    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      maxlength: 255,
    },

    capacite: {
      type: Number,
      required: true,
      min: 1,
    },

    batiment: {
      type: String,
      default: null,
      trim: true,
      maxlength: 100,
    },

    // =====================================================
    // SOFT DELETE : l'occupation se calcule dynamiquement
    // depuis les Cours, jamais stockée ici (RF-ADMIN-01)
    // =====================================================

    isArchived: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// =========================================================
// MODEL
// =========================================================

const Salle = mongoose.model("Salle", salleSchema);

export default Salle;
