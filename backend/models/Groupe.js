const mongoose = require('mongoose');

const groupeSchema = new mongoose.Schema(
  {
    nom: {
      type: String,
      required: true,
      trim: true, // ex: 'L3 Info Groupe A'
    },
    niveau: {
      type: String,
      trim: true, // ex: 'L3', 'M1'
    },
    filiere: {
      type: String,
      trim: true,
    },
    effectif: {
      type: Number,
      required: true,
    },
    matieresIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Matiere',
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Groupe', groupeSchema);
