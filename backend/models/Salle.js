const mongoose = require('mongoose');

const salleSchema = new mongoose.Schema(
  {
    nom: {
      type: String,
      required: true,
      trim: true, // ex: 'B204'
    },
    batiment: {
      type: String,
      trim: true,
    },
    capacite: {
      type: Number,
      required: true,
    },
    type: {
      type: String,
      enum: ['amphi', 'TD', 'TP', 'laboratoire', 'salle_reunion'],
      required: true,
    },
    equipements: [{ type: String }], // ex: ['videoprojecteur', 'tableau_interactif']
    disponible: {
      type: Boolean,
      default: true, // false si en maintenance / indisponible temporairement
    },
  },
  { timestamps: true }
);

salleSchema.index({ type: 1, capacite: 1 }); // accélère la recherche de salle compatible

module.exports = mongoose.model('Salle', salleSchema);
