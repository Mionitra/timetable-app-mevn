import mongoose from "mongoose";

const matiereSchema = new mongoose.Schema(
  {
    // =====================================================
    // INFORMATIONS
    // =====================================================

    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 255,
    },

    semester: {
      type: String,
      required: true,
      trim: true,
      maxlength: 20,
    },

    volumeHoraireCreneaux: {
      type: Number,
      default: null,
      min: 0,
    },

    // =====================================================
    // SOFT DELETE
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

const Matiere = mongoose.model("Matiere", matiereSchema);

export default Matiere;
