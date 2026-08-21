<script setup>
import { ref, watch, onUnmounted } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";

const router = useRouter();
const authStore = useAuthStore();

const currentStep = ref(1);

const firstName = ref("");
const lastName = ref("");
const email = ref("");
const password = ref("");
const confirmPassword = ref("");

const role = ref("etudiant");

const niveau = ref("L1");
const filiere = ref("IAD");

const profileImageFile = ref(null);
const profileImageData = ref(null);
const coverImageFile = ref(null);
const coverImageData = ref(null);

const errorMessage = ref("");
const successMessage = ref("");

const slideDirection = ref("next");

let redirectTimeout = null;

const niveaux = [
  { value: "L1", label: "Licence 1", description: "Tronc commun" },
  { value: "L2", label: "Licence 2", description: "Début de spécialisation" },
  { value: "L3", label: "Licence 3", description: "Spécialisation avancée" },
];

const filieres = [
  { value: "IAD", label: "IAD", description: "Ingénierie et Analyse des Données" },
  { value: "ARSB", label: "ARSB", description: "Administration Réseaux, Sécurité, Blockchain" },
  { value: "GL", label: "GL", description: "Génie Logiciel" },
  { value: "SIG", label: "SIG", description: "Systèmes d'Information Géographique" },
  { value: "R&T", label: "R&T", description: "Réseaux et Télécommunications" },
];

const normalizeFields = () => {
  firstName.value = firstName.value.trim();
  lastName.value = lastName.value.trim();
  email.value = email.value.trim().toLowerCase();
};

const isValidName = (name) => /^[a-zA-ZÀ-ÿ\-' ]{2,}$/.test(name);
const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

const handleProfileImageUpload = (event) => {
  const file = event.target.files[0];
  if (!file) {
    profileImageFile.value = null;
    profileImageData.value = null;
    return;
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    errorMessage.value =
      "Format de photo de profil non supporté. Utilisez JPG, PNG, WEBP ou GIF.";
    event.target.value = "";
    return;
  }

  if (file.size > MAX_FILE_SIZE) {
    errorMessage.value = "La photo de profil ne doit pas dépasser 5 Mo.";
    event.target.value = "";
    return;
  }

  profileImageFile.value = file;
  const reader = new FileReader();
  reader.onload = (e) => {
    profileImageData.value = e.target.result;
  };
  reader.readAsDataURL(file);
  errorMessage.value = "";
};

const handleCoverImageUpload = (event) => {
  const file = event.target.files[0];
  if (!file) {
    coverImageFile.value = null;
    coverImageData.value = null;
    return;
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    errorMessage.value =
      "Format de photo de couverture non supporté. Utilisez JPG, PNG, WEBP ou GIF.";
    event.target.value = "";
    return;
  }

  if (file.size > MAX_FILE_SIZE) {
    errorMessage.value = "La photo de couverture ne doit pas dépasser 5 Mo.";
    event.target.value = "";
    return;
  }

  coverImageFile.value = file;
  const reader = new FileReader();
  reader.onload = (e) => {
    coverImageData.value = e.target.result;
  };
  reader.readAsDataURL(file);
  errorMessage.value = "";
};

// --- VALIDATION ÉTAPE 1 : Informations personnelles ---
const validateStep1 = () => {
  errorMessage.value = "";
  normalizeFields();

  if (!firstName.value) {
    errorMessage.value = "Veuillez entrer votre prénom.";
    return false;
  }
  if (!isValidName(firstName.value)) {
    errorMessage.value = "Le prénom doit contenir au moins 2 lettres (caractères autorisés : lettres, apostrophe, tiret, espaces).";
    return false;
  }

  if (!lastName.value) {
    errorMessage.value = "Veuillez entrer votre nom.";
    return false;
  }
  if (!isValidName(lastName.value)) {
    errorMessage.value = "Le nom doit contenir au moins 2 lettres (caractères autorisés : lettres, apostrophe, tiret, espaces).";
    return false;
  }

  if (!email.value) {
    errorMessage.value = "Veuillez entrer votre adresse email.";
    return false;
  }
  if (!isValidEmail(email.value)) {
    errorMessage.value = "Veuillez entrer une adresse email valide.";
    return false;
  }

  return true;
};

// --- VALIDATION ÉTAPE 2 : Niveau, Filière et Photos (photos facultatives) ---
const validateStep2 = () => {
  errorMessage.value = "";

  const validNiveaux = ["L1", "L2", "L3"];
  const validFilieres = ["IAD", "ARSB", "GL", "SIG", "R&T"];

  if (!niveau.value || !validNiveaux.includes(niveau.value)) {
    errorMessage.value = "Veuillez sélectionner un niveau valide.";
    return false;
  }
  if (!filiere.value || !validFilieres.includes(filiere.value)) {
    errorMessage.value = "Veuillez sélectionner une filière valide.";
    return false;
  }

  return true;
};

// --- VALIDATION ÉTAPE 3 : Sécurité (Mots de passe) ---
const validateStep3 = () => {
  errorMessage.value = "";

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

// --- NAVIGATION ENTRE LES ÉTAPES ---
const nextStep = () => {
  errorMessage.value = "";
  successMessage.value = "";

  if (currentStep.value === 1 && validateStep1()) {
    slideDirection.value = "next";
    currentStep.value = 2;
  } else if (currentStep.value === 2 && validateStep2()) {
    slideDirection.value = "next";
    currentStep.value = 3;
  }
};

const previousStep = () => {
  errorMessage.value = "";
  successMessage.value = "";

  if (currentStep.value === 2) {
    slideDirection.value = "previous";
    currentStep.value = 1;
  } else if (currentStep.value === 3) {
    slideDirection.value = "previous";
    currentStep.value = 2;
  }
};

const buildUserData = () => {
  const userData = {
    firstName: firstName.value.trim(),
    lastName: lastName.value.trim(),
    email: email.value.trim().toLowerCase(),
    password: password.value,
    role: role.value,
    profileImage: profileImageData.value || null,
    coverImage: coverImageData.value || null,
  };

  userData.niveau = niveau.value;
  userData.filiere = filiere.value;

  return userData;
};

const handleRegister = async () => {
  errorMessage.value = "";
  successMessage.value = "";

  if (authStore.loading) return;

  // On valide l'étape 3 avant l'inscription finale
  if (!validateStep3()) return;

  try {
    const userData = buildUserData();

    if (import.meta.env.DEV) {
      console.log("Données envoyées pour l'inscription :", {
        ...userData,
        password: "********",
        profileImage: userData.profileImage ? "(présente)" : "non fournie",
        coverImage: userData.coverImage ? "(présente)" : "non fournie",
      });
    }

    await authStore.register(userData);

    successMessage.value = "Inscription réussie ! Vous pouvez maintenant vous connecter.";

    redirectTimeout = setTimeout(() => {
      router.push("/connexion");
    }, 1500);
  } catch (error) {
    console.error("Erreur inscription :", error);
    errorMessage.value =
      authStore.error ||
      error?.response?.data?.message ||
      error?.message ||
      "Une erreur est survenue lors de l'inscription. Veuillez réessayer.";
  }
};

onUnmounted(() => {
  if (redirectTimeout) {
    clearTimeout(redirectTimeout);
    redirectTimeout = null;
  }
});
</script>

<template>
  <div class="flex items-center justify-center min-h-screen px-4 py-8 bg-background">
    <div class="w-full max-w-2xl p-8 border border-gray-600 shadow-2xl rounded-2xl bg-white/10 backdrop-blur-lg">
      <!-- HEADER -->
      <div class="p-8 pb-4">
        <h1 class="mb-2 text-3xl font-bold text-center text-secondary">Inscription</h1>
        <p class="mb-6 text-center text-gray-500">Créez votre compte universitaire</p>

        <!-- INDICATEUR DES 3 ÉTAPES -->
        <div class="flex items-center justify-center mb-6">
          <!-- Étape 1 -->
          <div class="flex items-center">
            <div :class="[
              'w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all duration-300',
              currentStep >= 1 ? 'bg-primary text-white' : 'bg-gray-50/5/5 text-gray-500',
            ]">
              1
            </div>
            <span class="ml-2 text-sm font-medium text-secondary">Informations</span>
          </div>

          <!-- Trait 1 -->
          <div class="w-8 h-1 mx-2 transition-all duration-300 rounded"
            :class="currentStep >= 2 ? 'bg-primary' : 'bg-gray-50/5/5'"></div>

          <!-- Étape 2 -->
          <div class="flex items-center">
            <div :class="[
              'w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all duration-300',
              currentStep >= 2 ? 'bg-primary text-white' : 'bg-gray-50/5/5 text-gray-500',
            ]">
              2
            </div>
            <span class="ml-2 text-sm font-medium text-secondary">Académique</span>
          </div>

          <!-- Trait 2 -->
          <div class="w-8 h-1 mx-2 transition-all duration-300 rounded"
            :class="currentStep >= 3 ? 'bg-primary' : 'bg-gray-50/5/5'"></div>

          <!-- Étape 3 -->
          <div class="flex items-center">
            <div :class="[
              'w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all duration-300',
              currentStep >= 3 ? 'bg-primary text-white' : 'bg-gray-50/5/5 text-gray-500',
            ]">
              3
            </div>
            <span class="ml-2 text-sm font-medium text-secondary">Sécurité</span>
          </div>
        </div>
      </div>

      <!-- CONTENU -->
      <div class="px-8 pb-8">
        <Transition :name="slideDirection === 'next' ? 'slide-next' : 'slide-previous'" mode="out-in">

          <!-- ==================== ÉTAPE 1 ==================== -->
          <div v-if="currentStep === 1" key="step1">
            <div class="mb-6">
              <h2 class="mb-1 text-xl font-bold text-secondary">Informations personnelles</h2>
              <p class="text-sm text-gray-500">
                Renseignez vos informations d'identité.
              </p>
            </div>

            <div class="space-y-5">
              <!-- Prénom et Nom en ligne -->
              <div class="flex flex-wrap -mx-2">
                <div class="w-full px-2 sm:w-1/2">
                  <label class="block mb-2 font-semibold text-secondary">Prénom</label>
                  <input v-model="firstName" type="text" autocomplete="given-name" placeholder="Votre prénom"
                    class="w-full p-3 placeholder-gray-400 transition-all border border-gray-300 rounded-lg text-secondary bg-gray-50/5/5 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent" />
                </div>
                <div class="w-full px-2 sm:w-1/2">
                  <label class="block mb-2 font-semibold text-secondary">Nom</label>
                  <input v-model="lastName" type="text" autocomplete="family-name" placeholder="Votre nom"
                    class="w-full p-3 placeholder-gray-400 transition-all border border-gray-300 rounded-lg text-secondary bg-gray-50/5/5 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent" />
                </div>
              </div>

              <!-- Email -->
              <div>
                <label class="block mb-2 font-semibold text-secondary">Email</label>
                <input v-model="email" type="email" autocomplete="email" placeholder="exemple@gmail.com"
                  class="w-full p-3 placeholder-gray-400 transition-all border border-gray-300 rounded-lg text-secondary bg-gray-50/5/5 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent" />
                <p class="mt-2 text-xs text-gray-500">
                  Votre adresse email sera utilisée pour vous connecter.
                </p>
              </div>
            </div>

            <div v-if="errorMessage" class="p-3 mt-5 border rounded-lg bg-red-500/10 border-red-500/30">
              <p class="text-sm font-medium text-red-400">{{ errorMessage }}</p>
            </div>

            <button type="button" @click="nextStep"
              class="w-full py-3 mt-6 font-semibold text-white transition-colors rounded-lg text-secondary bg-primary hover:opacity-90">
              Suivant <span class="ml-2">→</span>
            </button>
          </div>

          <!-- ==================== ÉTAPE 2 ==================== -->
          <div v-else-if="currentStep === 2" key="step2">
            <div class="mb-6">
              <h2 class="mb-1 text-xl font-bold text-secondary">Profil académique</h2>
              <p class="text-sm text-gray-500">
                Renseignez votre parcours et ajoutez des photos.
              </p>
            </div>

            <div class="space-y-5">
              <!-- Niveau et Filière en ligne -->
              <div class="p-4 border border-gray-300 bg-gray-50/5/5/50 rounded-xl">
                <h3 class="mb-4 font-semibold text-secondary">🎓 Informations étudiant</h3>
                <div class="flex flex-wrap -mx-2">
                  <div class="w-full px-2 sm:w-1/2">
                    <label class="block mb-2 font-medium text-secondary">Niveau d'étude</label>
                    <select v-model="niveau"
                      class="w-full p-3 border border-gray-300 rounded-lg text-secondary bg-gray-50/5/5 focus:outline-none focus:ring-2 focus:ring-primary">
                      <option v-for="item in niveaux" :key="item.value" :value="item.value">
                        {{ item.label }} – {{ item.description }}
                      </option>
                    </select>
                  </div>
                  <div class="w-full px-2 sm:w-1/2">
                    <label class="block mb-2 font-medium text-secondary">Filière / Spécialité</label>
                    <select v-model="filiere"
                      class="w-full p-3 border border-gray-300 rounded-lg text-secondary bg-gray-50/5/5 focus:outline-none focus:ring-2 focus:ring-primary">
                      <option v-for="item in filieres" :key="item.value" :value="item.value">
                        {{ item.value }} – {{ item.description }}
                      </option>
                    </select>
                  </div>
                </div>
              </div>

              <!-- Photos en ligne -->
              <div class="p-4 border border-gray-300 bg-gray-50/5/5/50 rounded-xl">
                <h3 class="mb-4 font-semibold text-secondary">Photos de profil et de couverture</h3>
                <div class="flex flex-wrap -mx-2">
                  <div class="w-full px-2 sm:w-1/2">
                    <label class="block mb-2 font-medium text-secondary">Photo de profil</label>
                    <input type="file" accept="image/jpeg,image/png,image/webp,image/gif"
                      @change="handleProfileImageUpload"
                      class="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:opacity-90" />
                    <div v-if="profileImageData" class="mt-3">
                      <img :src="profileImageData" alt="Aperçu photo de profil"
                        class="object-cover w-24 h-24 border-2 rounded-full border-primary" />
                      <p class="mt-1 text-xs text-gray-500">Aperçu</p>
                    </div>
                    <p class="mt-2 text-xs text-gray-500">
                      Formats : JPG, PNG, WEBP, GIF. Max 5 Mo.
                    </p>
                  </div>
                  <div class="w-full px-2 sm:w-1/2">
                    <label class="block mb-2 font-medium text-secondary">Photo de couverture</label>
                    <input type="file" accept="image/jpeg,image/png,image/webp,image/gif"
                      @change="handleCoverImageUpload"
                      class="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:opacity-90" />
                    <div v-if="coverImageData" class="mt-3">
                      <img :src="coverImageData" alt="Aperçu photo de couverture"
                        class="object-cover w-full border-2 rounded-lg border-primary max-h-32" />
                      <p class="mt-1 text-xs text-gray-500">Aperçu</p>
                    </div>
                    <p class="mt-2 text-xs text-gray-500">
                      Formats : JPG, PNG, WEBP, GIF. Max 5 Mo.
                    </p>
                  </div>
                </div>
              </div>

              <div v-if="errorMessage" class="p-3 border rounded-lg bg-red-500/10 border-red-500/30">
                <p class="text-sm font-medium text-red-400">⚠️ {{ errorMessage }}</p>
              </div>
            </div>

            <div class="flex gap-4 mt-6">
              <button type="button" @click="previousStep"
                class="w-1/3 py-3 font-semibold transition-colors border border-gray-300 rounded-lg text-secondary bg-gray-50/5/5 hover:bg-gray-200">
                ← Précédent
              </button>
              <button type="button" @click="nextStep"
                class="flex-1 py-3 font-semibold text-white transition-colors rounded-lg bg-primary hover:opacity-90">
                Suivant <span class="ml-2">→</span>
              </button>
            </div>
          </div>

          <!-- ==================== ÉTAPE 3 ==================== -->
          <div v-else key="step3">
            <div class="mb-6">
              <h2 class="mb-1 text-xl font-bold text-secondary">Sécurité</h2>
              <p class="text-sm text-gray-500">
                Définissez un mot de passe sécurisé pour protéger votre compte.
              </p>
            </div>

            <div class="space-y-5">
              <!-- Mot de passe et confirmation en ligne -->
              <div class="flex flex-wrap -mx-2">
                <div class="w-full px-2 sm:w-1/2">
                  <label class="block mb-2 font-semibold text-secondary">Mot de passe</label>
                  <input v-model="password" type="password" autocomplete="new-password" placeholder="••••••••"
                    minlength="6"
                    class="w-full p-3 placeholder-gray-400 transition-all border border-gray-300 rounded-lg text-secondary bg-gray-50/5/5 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent" />
                  <p class="mt-2 text-xs text-gray-500">Minimum 6 caractères.</p>
                </div>
                <div class="w-full px-2 sm:w-1/2">
                  <label class="block mb-2 font-semibold text-secondary">Confirmer le mot de passe</label>
                  <input v-model="confirmPassword" type="password" autocomplete="new-password" placeholder="••••••••"
                    minlength="6"
                    class="w-full p-3 placeholder-gray-400 transition-all border border-gray-300 rounded-lg text-secondary bg-gray-50/5/5 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent" />
                </div>
              </div>

              <div v-if="errorMessage" class="p-3 border rounded-lg bg-red-500/10 border-red-500/30">
                <p class="text-sm font-medium text-red-400">⚠️ {{ errorMessage }}</p>
              </div>

              <div v-if="successMessage" class="p-3 border rounded-lg bg-green-500/10 border-green-500/30">
                <p class="text-sm font-medium text-green-400">✓ {{ successMessage }}</p>
              </div>
            </div>

            <div class="flex gap-4 mt-6">
              <button type="button" @click="previousStep" :disabled="authStore.loading"
                class="w-1/3 py-3 font-semibold transition-colors border border-gray-300 rounded-lg text-secondary bg-gray-50/5/5 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed">
                ← Précédent
              </button>
              <button type="button" @click="handleRegister" :disabled="authStore.loading"
                class="flex-1 py-3 font-semibold text-white transition-colors rounded-lg bg-primary hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed">
                <span v-if="authStore.loading">
                  <svg class="inline w-5 h-5 mr-2 -ml-1 text-white animate-spin" xmlns="http://www.w3.org/2000/svg"
                    fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
                    </path>
                  </svg>
                  Inscription...
                </span>
                <span v-else>S'inscrire</span>
              </button>
            </div>
          </div>
        </Transition>

        <p class="mt-6 text-center text-gray-500">
          Vous avez déjà un compte ?
          <RouterLink to="/connexion" class="ml-1 font-medium text-primary hover:text-blue-300">
            Se connecter
          </RouterLink>
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
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