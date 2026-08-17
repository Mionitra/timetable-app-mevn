const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    nom: {
      type: String,
      required: true,
      trim: true,
    },
    prenom: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Email invalide'],
    },
    motDePasseHash: {
      type: String,
      required: true,
      select: false, // ne pas renvoyer le hash par défaut dans les requêtes
    },
    role: {
      type: String,
      enum: ['administrateur', 'enseignant', 'etudiant'],
      required: true,
    },
    actif: {
      type: Boolean,
      default: true,
    },
    derniereConnexion: {
      type: Date,
    },
  },
  { timestamps: true } // ajoute createdAt / updatedAt automatiquement
);

// Hash automatique du mot de passe avant sauvegarde
userSchema.pre('save', async function (next) {
  if (!this.isModified('motDePasseHash')) return next();
  this.motDePasseHash = await bcrypt.hash(this.motDePasseHash, 10);
  next();
});

// Méthode d'instance pour vérifier le mot de passe au login
userSchema.methods.verifierMotDePasse = async function (motDePasseClair) {
  return bcrypt.compare(motDePasseClair, this.motDePasseHash);
};

module.exports = mongoose.model('User', userSchema);
