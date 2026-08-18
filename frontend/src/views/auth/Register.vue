<script setup>
import { ref, watch } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";

const router = useRouter();
const authStore = useAuthStore();

/* =========================================================
   ÉTAPE ACTUELLE
========================================================= */
const currentStep = ref(1);

/* =========================================================
   CHAMPS COMMUNS (avec trim automatique)
========================================================= */
const firstName = ref("");
const lastName = ref("");
const email = ref("");
const password = ref("");
const confirmPassword = ref("");

/* =========================================================
   RÔLE
========================================================= */
const role = ref("etudiant");

/* =========================================================
   CHAMPS ÉTUDIANT
========================================================= */
const niveau = ref("L1");
const filiere = ref("IAD");

/* =========================================================
   CHAMPS ENSEIGNANT
========================================================= */
const typeEnseignant = ref("permanent");
const discipline = ref("informatique");

/* =========================================================
   MESSAGES
========================================================= */
const errorMessage = ref("");
const successMessage = ref("");

/* =========================================================
   ANIMATION DES SLIDES
========================================================= */
const slideDirection = ref("next");

/* =========================================================
   RÉINITIALISATION DES SOUS-CHAMPS LORS DU CHANGEMENT DE RÔLE
========================================================= */
watch(role, (newRole) => {
  if (newRole === "etudiant") {
    niveau.value = "L1";
    filiere.value = "IAD";
  } else if (newRole === "enseignant") {
    typeEnseignant.value = "permanent";
    discipline.value = "informatique";
  }
  // Effacer les messages lors du changement de rôle
  errorMessage.value = "";
  successMessage.value = "";
});

/* =========================================================
   VALIDATION ÉTAPE 1 (infos personnelles + rôle)
========================================================= */
const validateStep1 = () => {
  errorMessage.value = "";

  // Nettoyer les champs
  const trimmedFirstName = firstName.value.trim();
  const trimmedLastName = lastName.value.trim();
  const trimmedEmail = email.value.trim();

  // Mettre à jour les refs avec les valeurs nettoyées
  firstName.value = trimmedFirstName;
  lastName.value = trimmedLastName;
  email.value = trimmedEmail;

  if (!trimmedFirstName) {
    errorMessage.value = "Veuillez entrer votre prénom.";
    return false;
  }
  if (!trimmedLastName) {
    errorMessage.value = "Veuillez entrer votre nom.";
    return false;
  }
  if (!trimmedEmail) {
    errorMessage.value = "Veuillez entrer votre adresse email.";
    return false;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(trimmedEmail)) {
    errorMessage.value = "Veuillez entrer une adresse email valide.";
    return false;
  }

  if (!["etudiant", "enseignant"].includes(role.value)) {
    errorMessage.value = "Veuillez sélectionner un type de compte.";
    return false;
  }

  return true;
};

/* =========================================================
   VALIDATION ÉTAPE 2 (infos spécifiques + mot de passe)
========================================================= */
const validateStep2 = () => {
  errorMessage.value = "";

  if (role.value === "etudiant") {
    if (!niveau.value) {
      errorMessage.value = "Veuillez sélectionner votre niveau.";
      return false;
    }
    if (!filiere.value) {
      errorMessage.value = "Veuillez sélectionner votre filière.";
      return false;
    }
  }

  if (role.value === "enseignant") {
    if (!typeEnseignant.value) {
      errorMessage.value = "Veuillez sélectionner votre statut.";
      return false;
    }
    if (!discipline.value) {
      errorMessage.value = "Veuillez sélectionner votre discipline.";
      return false;
    }
  }

  // Mot de passe
  if (!password.value) {
    errorMessage.value = "Veuillez entrer un mot de passe.";
    return false;
  }
  if (password.value.length < 6) {
    errorMessage.value = "Le mot de passe doit contenir au moins 6 caractères.";
    return false;
  }
  if (!confirmPassword.value) {
    errorMessage.value = "Veuillez confirmer votre mot de passe.";
    return false;
  }
  if (password.value !== confirmPassword.value) {
    errorMessage.value = "Les mots de passe ne correspondent pas.";
    return false;
  }

  return true;
};

/* =========================================================
   PASSER À L'ÉTAPE 2
========================================================= */
const nextStep = () => {
  errorMessage.value = "";
  successMessage.value = "";
  if (currentStep.value === 1 && validateStep1()) {
    slideDirection.value = "next";
    currentStep.value = 2;
  }
};

/* =========================================================
   REVENIR À L'ÉTAPE 1
========================================================= */
const previousStep = () => {
  errorMessage.value = "";
  successMessage.value = "";
  slideDirection.value = "previous";
  currentStep.value = 1;
};

/* =========================================================
   SOUMISSION FINALE
========================================================= */
const handleRegister = async () => {
  errorMessage.value = "";
  successMessage.value = "";

  // Valider l'étape 2 avant de soumettre
  if (!validateStep2()) return;

  try {
    // Construction des données utilisateur
    const userData = {
      firstName: firstName.value.trim(),
      lastName: lastName.value.trim(),
      email: email.value.trim(),
      password: password.value,
      role: role.value,
    };

    // Ajout des champs spécifiques
    if (role.value === "etudiant") {
      userData.niveau = niveau.value;
      userData.filiere = filiere.value;
    } else if (role.value === "enseignant") {
      userData.typeEnseignant = typeEnseignant.value;
      userData.discipline = discipline.value;
    }

    // Appel au store
    await authStore.register(userData);

    // Succès
    successMessage.value = "Inscription réussie ! Vous pouvez maintenant vous connecter.";
    setTimeout(() => router.push("/connexion"), 1500);

  } catch (error) {
    console.error("Erreur inscription :", error);
    // Utiliser le message du store ou un message générique
    errorMessage.value = authStore.error || "Une erreur est survenue lors de l'inscription. Veuillez réessayer.";
  }
};
</script>

<template>
  <div class="min-h-screen flex justify-center items-center bg-gray-900 px-4 py-8">
    <div class="w-full max-w-lg bg-gray-800 rounded-xl shadow-2xl border border-gray-700 overflow-hidden">

      <!-- ==================================================
           HEADER
      =================================================== -->
      <div class="p-8 pb-4">
        <h1 class="text-3xl font-bold text-center text-white mb-2">Inscription</h1>
        <p class="text-center text-gray-400 mb-6">Créez votre compte</p>

        <!-- Indicateur d'étapes -->
        <div class="flex items-center justify-center mb-6">
          <!-- Étape 1 -->
          <div class="flex items-center">
            <div :class="[
              'w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all duration-300',
              currentStep >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-400'
            ]">1</div>
            <span class="ml-2 text-sm font-medium text-gray-300">Informations</span>
          </div>
          <!-- Ligne -->
          <div class="w-12 h-1 mx-3 rounded transition-all duration-300"
            :class="currentStep >= 2 ? 'bg-blue-600' : 'bg-gray-700'"></div>
          <!-- Étape 2 -->
          <div class="flex items-center">
            <div :class="[
              'w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all duration-300',
              currentStep >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-400'
            ]">2</div>
            <span class="ml-2 text-sm font-medium text-gray-300">Sécurité</span>
          </div>
        </div>
      </div>

      <!-- ==================================================
           CONTENU DES SLIDES
      =================================================== -->
      <div class="px-8 pb-8">
        <Transition :name="slideDirection === 'next' ? 'slide-next' : 'slide-previous'" mode="out-in">
          <!-- SLIDE 1 -->
          <div v-if="currentStep === 1" key="step1">
            <div class="mb-6">
              <h2 class="text-xl font-bold text-white mb-1">Informations personnelles</h2>
              <p class="text-sm text-gray-400">Renseignez vos informations et choisissez votre type de compte.</p>
            </div>

            <div class="space-y-5">
              <!-- Prénom -->
              <div>
                <label class="block mb-2 font-semibold text-gray-200">Prénom</label>
                <input v-model="firstName" type="text" placeholder="Votre prénom"
                  class="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  required />
              </div>

              <!-- Nom -->
              <div>
                <label class="block mb-2 font-semibold text-gray-200">Nom</label>
                <input v-model="lastName" type="text" placeholder="Votre nom"
                  class="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  required />
              </div>

              <!-- Email -->
              <div>
                <label class="block mb-2 font-semibold text-gray-200">Email</label>
                <input v-model="email" type="email" placeholder="exemple@gmail.com"
                  class="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  required />
              </div>

              <!-- Type de compte -->
              <div>
                <label class="block mb-3 font-semibold text-gray-200">Type de compte</label>
                <div class="grid grid-cols-2 gap-4">
                  <!-- Étudiant -->
                  <button type="button" @click="role = 'etudiant'" :class="[
                    'p-4 rounded-xl border-2 text-left transition-all duration-200',
                    role === 'etudiant' ? 'border-blue-500 bg-blue-500/10 ring-2 ring-blue-500/30' : 'border-gray-600 bg-gray-700 hover:border-gray-500'
                  ]">
                    <div class="text-3xl mb-2">👨‍🎓</div>
                    <h3 class="font-bold text-white">Étudiant</h3>
                    <p class="text-sm text-gray-400 mt-1">L1, L2 ou L3</p>
                    <div v-if="role === 'etudiant'" class="mt-3 text-blue-400 text-sm font-semibold">✓ Sélectionné</div>
                  </button>

                  <!-- Enseignant -->
                  <button type="button" @click="role = 'enseignant'" :class="[
                    'p-4 rounded-xl border-2 text-left transition-all duration-200',
                    role === 'enseignant' ? 'border-blue-500 bg-blue-500/10 ring-2 ring-blue-500/30' : 'border-gray-600 bg-gray-700 hover:border-gray-500'
                  ]">
                    <div class="text-3xl mb-2">👨‍🏫</div>
                    <h3 class="font-bold text-white">Enseignant</h3>
                    <p class="text-sm text-gray-400 mt-1">Permanent, vacataire ou contractuel</p>
                    <div v-if="role === 'enseignant'" class="mt-3 text-blue-400 text-sm font-semibold">✓ Sélectionné
                    </div>
                  </button>
                </div>
              </div>
            </div>

            <!-- Message d'erreur -->
            <p v-if="errorMessage" class="mt-5 text-red-400 text-sm font-medium">{{ errorMessage }}</p>

            <!-- Bouton Suivant -->
            <button type="button" @click="nextStep"
              class="w-full mt-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors">
              Suivant <span class="ml-2">→</span>
            </button>
          </div>

          <!-- SLIDE 2 -->
          <div v-else key="step2">
            <div class="mb-6">
              <h2 class="text-xl font-bold text-white mb-1">Informations du compte</h2>
              <p class="text-sm text-gray-400">Complétez les informations nécessaires pour terminer votre inscription.
              </p>
            </div>

            <div class="space-y-5">
              <!-- ==================== ÉTUDIANT ==================== -->
              <div v-if="role === 'etudiant'" class="p-4 bg-gray-700/50 border border-gray-600 rounded-xl">
                <h3 class="text-white font-semibold mb-4">🎓 Informations étudiant</h3>
                <!-- Niveau -->
                <div>
                  <label class="block mb-2 text-gray-300 font-medium">Niveau d'étude</label>
                  <select v-model="niveau"
                    class="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required>
                    <option value="L1">Licence 1 (L1) – Tronc commun</option>
                    <option value="L2">Licence 2 (L2) – Début de spécialisation</option>
                    <option value="L3">Licence 3 (L3) – Spécialisation avancée</option>
                  </select>
                </div>
                <!-- Filière -->
                <div class="mt-4">
                  <label class="block mb-2 text-gray-300 font-medium">Filière / Spécialité</label>
                  <select v-model="filiere"
                    class="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required>
                    <option value="IAD">Ingénierie et Analyse des Données (IAD)</option>
                    <option value="ARSB">Administration Réseaux, Sécurité, Blockchain (ARSB)</option>
                    <option value="GL">Génie Logiciel (GL)</option>
                    <option value="SIG">Systèmes d'Information Géographique (SIG)</option>
                    <option value="R&T">Réseaux et Télécommunications (R&T)</option>
                  </select>
                </div>
              </div>

              <!-- ==================== ENSEIGNANT ==================== -->
              <div v-if="role === 'enseignant'" class="p-4 bg-gray-700/50 border border-gray-600 rounded-xl">
                <h3 class="text-white font-semibold mb-4">👨‍🏫 Informations enseignant</h3>
                <!-- Statut -->
                <div>
                  <label class="block mb-2 text-gray-300 font-medium">Statut</label>
                  <select v-model="typeEnseignant"
                    class="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required>
                    <option value="permanent">Enseignant permanent (titulaire)</option>
                    <option value="vacataire">Enseignant vacataire (intervenant extérieur)</option>
                    <option value="contractuel">Enseignant contractuel (CDD/CDI)</option>
                  </select>
                </div>
                <!-- Discipline -->
                <div class="mt-4">
                  <label class="block mb-2 text-gray-300 font-medium">Discipline enseignée</label>
                  <select v-model="discipline"
                    class="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required>
                    <option value="informatique">Informatique</option>
                    <option value="mathematiques">Mathématiques</option>
                    <option value="physique">Physique</option>
                    <option value="economie">Sciences économiques</option>
                    <option value="droit">Droit</option>
                    <option value="langues">Langues</option>
                    <option value="gestion">Gestion</option>
                  </select>
                </div>
              </div>

              <!-- Mot de passe -->
              <div>
                <label class="block mb-2 font-semibold text-gray-200">Mot de passe</label>
                <input v-model="password" type="password" placeholder="********" minlength="6"
                  class="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  required />
                <p class="text-xs text-gray-400 mt-2">Minimum 6 caractères.</p>
              </div>

              <!-- Confirmation -->
              <div>
                <label class="block mb-2 font-semibold text-gray-200">Confirmer le mot de passe</label>
                <input v-model="confirmPassword" type="password" placeholder="********" minlength="6"
                  class="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  required />
              </div>

              <!-- Messages -->
              <p v-if="errorMessage" class="text-red-400 text-sm font-medium">{{ errorMessage }}</p>
              <p v-if="successMessage" class="text-green-400 text-sm font-medium">{{ successMessage }}</p>
            </div>

            <!-- Boutons -->
            <div class="flex gap-4 mt-6">
              <button type="button" @click="previousStep"
                class="w-1/3 py-3 bg-gray-700 hover:bg-gray-600 border border-gray-600 text-gray-200 font-semibold rounded-lg transition-colors">
                ← Précédent
              </button>
              <button type="button" @click="handleRegister" :disabled="authStore.loading"
                class="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-60 disabled:cursor-not-allowed">
                {{ authStore.loading ? "Inscription..." : "S'inscrire" }}
              </button>
            </div>
          </div>
        </Transition>

        <!-- Lien connexion -->
        <p class="mt-6 text-center text-gray-400">
          Vous avez déjà un compte ?
          <RouterLink to="/connexion" class="text-blue-400 hover:text-blue-300 font-medium ml-1">
            Se connecter
          </RouterLink>
        </p>
      </div>

    </div>
  </div>
</template>

<style scoped>
/* =========================================================
   ANIMATION SLIDE
========================================================= */
.slide-next-enter-active,
.slide-next-leave-active,
.slide-previous-enter-active,
.slide-previous-leave-active {
  transition: transform 0.3s ease, opacity 0.3s ease;
}

.slide-next-enter-from {
  opacity: 0;
  transform: translateX(50px);
}

.slide-next-leave-to {
  opacity: 0;
  transform: translateX(-50px);
}

.slide-previous-enter-from {
  opacity: 0;
  transform: translateX(-50px);
}

.slide-previous-leave-to {
  opacity: 0;
  transform: translateX(50px);
}
</style>