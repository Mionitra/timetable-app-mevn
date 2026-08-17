const mongoose = require('mongoose');

const etudiantSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    groupeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Groupe',
      required: true,
    },
    numeroEtudiant: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    anneeInscription: {
      type: Number,
      default: () => new Date().getFullYear(),
    },
  },
  { timestamps: true }
);

// Index composé utile pour rechercher rapidement tous les étudiants d'un groupe
etudiantSchema.index({ groupeId: 1 });

module.exports = mongoose.model('Etudiant', etudiantSchema);
