import mongoose from "mongoose";

const indisponibiliteSchema = new mongoose.Schema(
  {
    // =====================================================
    // RÉFÉRENCE ENSEIGNANT
    // =====================================================

    teacherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // =====================================================
    // CRÉNEAU RÉCURRENT (toutes semaines, hors MVP ponctuel)
    // =====================================================

    dayOfWeek: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },

    slotIndex: {
      type: Number,
      required: true,
      min: 1,
      max: 10,
    },
  },
  {
    timestamps: true,
  }
);

// =========================================================
// INDEX : évite les doublons pour un même enseignant
// =========================================================

indisponibiliteSchema.index(
  { teacherId: 1, dayOfWeek: 1, slotIndex: 1 },
  { unique: true }
);

// =========================================================
// MODEL
// =========================================================

const Indisponibilite = mongoose.model(
  "Indisponibilite",
  indisponibiliteSchema
);

export default Indisponibilite;
