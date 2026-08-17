const mongoose = require('mongoose');

const emploiDuTempsSchema = new mongoose.Schema(
  {
    nom: {
      type: String,
      required: true,
      trim: true, // ex: 'EDT L3 Info - Semestre 1 2026'
    },
    semestre: {
      type: String,
      required: true, // ex: 'S1-2026'
    },
    seancesIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Seance',
      },
    ],
    statut: {
      type: String,
      enum: ['brouillon', 'genere', 'valide', 'publie', 'archive'],
      default: 'brouillon',
    },
    genereParAlgorithme: {
      type: Boolean,
      default: true,
    },
    nombreConflitsDetectes: {
      type: Number,
      default: 0,
    },
    valideParUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    dateValidation: {
      type: Date,
    },
    datePublication: {
      type: Date,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('EmploiDuTemps', emploiDuTempsSchema);
