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
    volumeHoraire: {
      type: Number, // total d'heures sur le semestre
      required: true,
    },
    dureeSeance: {
      type: Number, // durée d'une séance en minutes, ex: 90
      default: 90,
    },
    typeSalleRequis: {
      type: String,
      enum: ['amphi', 'TD', 'TP', 'laboratoire', 'indifferent'],
      default: 'indifferent',
    },
    equipementsRequis: [{ type: String }], // ex: ['videoprojecteur', 'ordinateurs']
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
