const mongoose = require('mongoose');

const matiereSchema = new mongoose.Schema(
  {
    nom: {
      type: String,
      required: true,
      trim: true,
    },
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true, // ex: 'INFO301'
    },
    dureeSeance: {
      type: Number, // durée d'une séance en minutes, ex: 90
      default: 90,
    },
    enseignantsIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Enseignant',
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Matiere', matiereSchema);
