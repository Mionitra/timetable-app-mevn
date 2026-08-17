const mongoose = require('mongoose');

const enseignantSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true, // un enseignant = un seul compte User
    },
    matieresIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Matiere',
      },
    ],
    volumeHoraireMax: {
      type: Number, // heures max par semaine
      default: 20,
    },
    grade: {
      type: String, // ex: 'Maître de conférences', 'Vacataire'
      trim: true,
    },
  },
  { timestamps: true }
);

// Sous-document embarqué : indisponibilités déclarées par l'enseignant
const indisponibiliteSchema = new mongoose.Schema(
  {
    jour: {
      type: String,
      enum: ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'],
      required: true,
    },
    heureDebut: { type: String, required: true }, // format 'HH:mm'
    heureFin: { type: String, required: true },
    motif: { type: String, trim: true },
    recurrente: { type: Boolean, default: true }, // se répète chaque semaine ?
  },
  { _id: true, timestamps: true }
);

enseignantSchema.add({ indisponibilites: [indisponibiliteSchema] });

module.exports = mongoose.model('Enseignant', enseignantSchema);
