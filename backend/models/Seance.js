const mongoose = require('mongoose');

const seanceSchema = new mongoose.Schema(
  {
    matiereId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Matiere',
      required: true,
    },
    enseignantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Enseignant',
      required: true,
    },
    salleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Salle',
      required: true,
    },
    groupeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Groupe',
      required: true,
    },
    jour: {
      type: String,
      enum: ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'],
      required: true,
    },
    heureDebut: {
      type: String, // format 'HH:mm', ex: '08:30'
      required: true,
    },
    heureFin: {
      type: String,
      required: true,
    },
    conflit: {
      type: Boolean, // marqué true par le module de détection de conflits
      default: false,
    },
    detailsConflit: {
      type: String, // description lisible du conflit détecté, si applicable
    },
  },
  { timestamps: true }
);

// Index composés critiques pour la détection rapide de chevauchements
seanceSchema.index({ enseignantId: 1, jour: 1, heureDebut: 1 });
seanceSchema.index({ salleId: 1, jour: 1, heureDebut: 1 });
seanceSchema.index({ groupeId: 1, jour: 1, heureDebut: 1 });

module.exports = mongoose.model('Seance', seanceSchema);
