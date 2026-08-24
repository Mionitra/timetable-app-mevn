import mongoose from "mongoose";

// =========================================================
// CŒUR DU SYSTÈME : un cours = un triplet
// (weekNumber, year, dayOfWeek, slotIndex) + références.
// Aucune donnée Date/Time libre n'est stockée (section 3.7).
// =========================================================

const coursSchema = new mongoose.Schema(
  {
    weekNumber: {
      type: Number,
      required: true,
      min: 1,
      max: 53,
    },

    year: {
      type: Number,
      required: true,
    },

    groupId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Group",
      required: true,
    },

    subjectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Matiere",
      required: true,
    },

    teacherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    salleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Salle",
      required: true,
    },

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

    type: {
      type: String,
      enum: ["CM", "TD", "TP"],
      required: true,
    },

    isPublished: {
      type: Boolean,
      default: false,
    },

    // Identifiant de séquence partagé par les N documents d'un même
    // cours s'étalant sur des créneaux successifs (ex: CM de 2h = 2
    // créneaux). Null pour un cours simple (1 créneau).
    sequenceId: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// =========================================================
// INDEX : critique pour conflictChecker (recherche par créneau)
// =========================================================

coursSchema.index({ year: 1, weekNumber: 1, dayOfWeek: 1, slotIndex: 1 });

// Vue "planning enseignant"
coursSchema.index({ teacherId: 1, isPublished: 1 });

// Vue "planning étudiant / grille admin par groupe"
coursSchema.index({ groupId: 1, year: 1, weekNumber: 1 });

// Manipulation des blocs multi-créneaux (édition / suppression
// de toute la séquence en une opération)
coursSchema.index({ sequenceId: 1 }, { sparse: true });

// Filet de sécurité base : une même salle ne peut jamais avoir
// deux cours sur le même créneau (conflits enseignant/groupe
// vérifiés applicativement dans conflictChecker)
coursSchema.index(
  { year: 1, weekNumber: 1, dayOfWeek: 1, slotIndex: 1, salleId: 1 },
  { unique: true }
);

// =========================================================
// MODEL
// =========================================================

const Cours = mongoose.model("Cours", coursSchema);

export default Cours;
