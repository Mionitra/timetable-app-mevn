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

const typeEnseignant = ref("permanent");
const discipline = ref("informatique");

const profileImageFile = ref(null);
const profileImageData = ref(null);
const coverImageFile = ref(null);
const coverImageData = ref(null);

const errorMessage = ref("");
const successMessage = ref("");

const slideDirection = ref("next");

let redirectTimeout = null;

const niveaux = [
  { value: "L1", label: "Licence 1 (L1)", description: "Tronc commun" },
  { value: "L2", label: "Licence 2 (L2)", description: "Début de spécialisation" },
  { value: "L3", label: "Licence 3 (L3)", description: "Spécialisation avancée" },
];

const filieres = [
  { value: "IAD", label: "IAD", description: "Ingénierie et Analyse des Données" },
  { value: "ARSB", label: "ARSB", description: "Administration Réseaux, Sécurité, Blockchain" },
  { value: "GL", label: "GL", description: "Génie Logiciel" },
  { value: "SIG", label: "SIG", description: "Systèmes d'Information Géographique" },
  { value: "R&T", label: "R&T", description: "Réseaux et Télécommunications" },
];

const typesEnseignant = [
  { value: "permanent", label: "Permanent", description: "Enseignant titulaire" },
  { value: "vacataire", label: "Vacataire", description: "Intervenant extérieur" },
  { value: "contractuel", label: "Contractuel", description: "CDD / CDI" },
];

const disciplines = [
  { value: "informatique", label: "Informatique" },
  { value: "mathematiques", label: "Mathématiques" },
  { value: "physique", label: "Physique" },
  { value: "economie", label: "Sciences économiques" },
  { value: "droit", label: "Droit" },
  { value: "langues", label: "Langues" },
  { value: "gestion", label: "Gestion" },
];

watch(role, (newRole) => {
  errorMessage.value = "";
  successMessage.value = "";

  if (newRole === "etudiant") {
    niveau.value = "L1";
    filiere.value = "IAD";
  } else if (newRole === "enseignant") {
    typeEnseignant.value = "permanent";
    discipline.value = "informatique";
  }
});

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

// --- VALIDATION ÉTAPE 1 ---
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

  if (!["etudiant", "enseignant"].includes(role.value)) {
    errorMessage.value = "Veuillez sélectionner un type de compte.";
    return false;
  }

  return true;
};

// --- VALIDATION ÉTAPE 2 ---
const validateStep2 = () => {
  errorMessage.value = "";

  if (role.value === "etudiant") {
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
  }

  if (role.value === "enseignant") {
    const validTypes = ["permanent", "vacataire", "contractuel"];
    const validDisciplines = [
      "informatique",
      "mathematiques",
      "physique",
      "economie",
      "droit",
      "langues",
      "gestion",
    ];

    if (!typeEnseignant.value || !validTypes.includes(typeEnseignant.value)) {
      errorMessage.value = "Veuillez sélectionner un statut valide.";
      return false;
    }
    if (!discipline.value || !validDisciplines.includes(discipline.value)) {
      errorMessage.value = "Veuillez sélectionner une discipline valide.";
      return false;
    }
  }

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

const nextStep = () => {
  errorMessage.value = "";
  successMessage.value = "";

  if (currentStep.value !== 1) return;

  if (!validateStep1()) return;

  slideDirection.value = "next";
  currentStep.value = 2;
};

const previousStep = () => {
  errorMessage.value = "";
  successMessage.value = "";

  slideDirection.value = "previous";
  currentStep.value = 1;
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

  if (role.value === "etudiant") {
    userData.niveau = niveau.value;
    userData.filiere = filiere.value;
  } else if (role.value === "enseignant") {
    userData.typeEnseignant = typeEnseignant.value;
    userData.discipline = discipline.value;
  }

  return userData;
};

const handleRegister = async () => {
  errorMessage.value = "";
  successMessage.value = "";

  if (authStore.loading) return;

  if (!validateStep2()) return;

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
  <div class="flex items-center justify-center min-h-screen px-4 py-8 bg-gray-900">
    <div class="w-full max-w-lg overflow-hidden bg-gray-800 border border-gray-700 shadow-2xl rounded-xl">
      <!-- HEADER -->
      <div class="p-8 pb-4">
        <h1 class="mb-2 text-3xl font-bold text-center text-white">Inscription</h1>
        <p class="mb-6 text-center text-gray-400">Créez votre compte universitaire</p>

        <!-- INDICATEUR DES ÉTAPES -->
        <div class="flex items-center justify-center mb-6">
          <div class="flex items-center">
            <div :class="[
              'w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all duration-300',
              currentStep >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-400',
            ]">
              1
            </div>
            <span class="ml-2 text-sm font-medium text-gray-300">Informations</span>
          </div>

          <div class="w-12 h-1 mx-3 transition-all duration-300 rounded"
            :class="currentStep >= 2 ? 'bg-blue-600' : 'bg-gray-700'"></div>

          <div class="flex items-center">
            <div :class="[
              'w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all duration-300',
              currentStep >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-400',
            ]">
              2
            </div>
            <span class="ml-2 text-sm font-medium text-gray-300">Sécurité</span>
          </div>
        </div>
      </div>

      <!-- CONTENU -->
      <div class="px-8 pb-8">
        <Transition :name="slideDirection === 'next' ? 'slide-next' : 'slide-previous'" mode="out-in">
          <!-- ÉTAPE 1 -->
          <div v-if="currentStep === 1" key="step1">
            <div class="mb-6">
              <h2 class="mb-1 text-xl font-bold text-white">Informations personnelles</h2>
              <p class="text-sm text-gray-400">
                Renseignez vos informations et choisissez votre type de compte.
              </p>
            </div>

            <div class="space-y-5">
              <!-- Prénom -->
              <div>
                <label class="block mb-2 font-semibold text-gray-200">Prénom</label>
                <input v-model="firstName" type="text" autocomplete="given-name" placeholder="Votre prénom"
                  class="w-full p-3 text-white placeholder-gray-400 transition-all bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
              </div>

              <!-- Nom -->
              <div>
                <label class="block mb-2 font-semibold text-gray-200">Nom</label>
                <input v-model="lastName" type="text" autocomplete="family-name" placeholder="Votre nom"
                  class="w-full p-3 text-white placeholder-gray-400 transition-all bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
              </div>

              <!-- Email -->
              <div>
                <label class="block mb-2 font-semibold text-gray-200">Email</label>
                <input v-model="email" type="email" autocomplete="email" placeholder="exemple@gmail.com"
                  class="w-full p-3 text-white placeholder-gray-400 transition-all bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                <p class="mt-2 text-xs text-gray-500">
                  Votre adresse email sera utilisée pour vous connecter.
                </p>
              </div>

              <!-- TYPE DE COMPTE -->
              <div>
                <label class="block mb-3 font-semibold text-gray-200">Type de compte</label>
                <div class="grid grid-cols-2 gap-4">
                  <!-- Étudiant -->
                  <button type="button" @click="role = 'etudiant'" :class="[
                    'p-4 rounded-xl border-2 text-left transition-all duration-200',
                    role === 'etudiant'
                      ? 'border-blue-500 bg-blue-500/10 ring-2 ring-blue-500/30'
                      : 'border-gray-600 bg-gray-700 hover:border-gray-500',
                  ]">
                    <div class="mb-2 text-3xl">👨‍🎓</div>
                    <h3 class="font-bold text-white">Étudiant</h3>
                    <p class="mt-1 text-sm text-gray-400">L1, L2 ou L3</p>
                    <div v-if="role === 'etudiant'" class="mt-3 text-sm font-semibold text-blue-400">
                      ✓ Sélectionné
                    </div>
                  </button>

                  <!-- Enseignant -->
                  <button type="button" @click="role = 'enseignant'" :class="[
                    'p-4 rounded-xl border-2 text-left transition-all duration-200',
                    role === 'enseignant'
                      ? 'border-blue-500 bg-blue-500/10 ring-2 ring-blue-500/30'
                      : 'border-gray-600 bg-gray-700 hover:border-gray-500',
                  ]">
                    <div class="mb-2 text-3xl">👨‍🏫</div>
                    <h3 class="font-bold text-white">Enseignant</h3>
                    <p class="mt-1 text-sm text-gray-400">Permanent, vacataire ou contractuel</p>
                    <div v-if="role === 'enseignant'" class="mt-3 text-sm font-semibold text-blue-400">
                      ✓ Sélectionné
                    </div>
                  </button>
                </div>
              </div>
            </div>

            <div v-if="errorMessage" class="p-3 mt-5 border rounded-lg bg-red-500/10 border-red-500/30">
              <p class="text-sm font-medium text-red-400">⚠️ {{ errorMessage }}</p>
            </div>

            <button type="button" @click="nextStep"
              class="w-full py-3 mt-6 font-semibold text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700">
              Suivant <span class="ml-2">→</span>
            </button>
          </div>

          <div v-else key="step2">
            <div class="mb-6">
              <h2 class="mb-1 text-xl font-bold text-white">Informations du compte</h2>
              <p class="text-sm text-gray-400">
                Complétez les informations nécessaires pour terminer votre inscription.
              </p>
            </div>

            <div class="space-y-5">

              <div v-if="role === 'etudiant'" class="p-4 border border-gray-600 bg-gray-700/50 rounded-xl">
                <h3 class="mb-4 font-semibold text-white">🎓 Informations étudiant</h3>
                <div>
                  <label class="block mb-2 font-medium text-gray-300">Niveau d'étude</label>
                  <select v-model="niveau"
                    class="w-full p-3 text-white bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option v-for="item in niveaux" :key="item.value" :value="item.value">
                      {{ item.label }} – {{ item.description }}
                    </option>
                  </select>
                </div>
                <div class="mt-4">
                  <label class="block mb-2 font-medium text-gray-300">Filière / Spécialité</label>
                  <select v-model="filiere"
                    class="w-full p-3 text-white bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option v-for="item in filieres" :key="item.value" :value="item.value">
                      {{ item.value }} – {{ item.description }}
                    </option>
                  </select>
                </div>
              </div>

              <div v-if="role === 'enseignant'" class="p-4 border border-gray-600 bg-gray-700/50 rounded-xl">
                <h3 class="mb-4 font-semibold text-white">👨‍🏫 Informations enseignant</h3>
                <div>
                  <label class="block mb-2 font-medium text-gray-300">Statut</label>
                  <select v-model="typeEnseignant"
                    class="w-full p-3 text-white bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option v-for="item in typesEnseignant" :key="item.value" :value="item.value">
                      {{ item.label }} – {{ item.description }}
                    </option>
                  </select>
                </div>
                <div class="mt-4">
                  <label class="block mb-2 font-medium text-gray-300">Discipline enseignée</label>
                  <select v-model="discipline"
                    class="w-full p-3 text-white bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option v-for="item in disciplines" :key="item.value" :value="item.value">
                      {{ item.label }}
                    </option>
                  </select>
                </div>
              </div>

              <div class="p-4 border border-gray-600 bg-gray-700/50 rounded-xl">
                <h3 class="mb-4 font-semibold text-white">📷 Photos de profil et de couverture</h3>

                <div>
                  <label class="block mb-2 font-medium text-gray-300">Photo de profil</label>
                  <input type="file" accept="image/jpeg,image/png,image/webp,image/gif"
                    @change="handleProfileImageUpload"
                    class="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700" />
                  <div v-if="profileImageData" class="mt-3">
                    <img :src="profileImageData" alt="Aperçu photo de profil"
                      class="object-cover w-24 h-24 border-2 border-blue-500 rounded-full" />
                    <p class="mt-1 text-xs text-gray-400">Aperçu</p>
                  </div>
                  <p class="mt-2 text-xs text-gray-500">
                    Formats acceptés : JPG, PNG, WEBP, GIF. Taille max : 5 Mo.
                  </p>
                </div>

                <div class="mt-4">
                  <label class="block mb-2 font-medium text-gray-300">Photo de couverture</label>
                  <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" @change="handleCoverImageUpload"
                    class="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700" />
                  <div v-if="coverImageData" class="mt-3">
                    <img :src="coverImageData" alt="Aperçu photo de couverture"
                      class="object-cover w-full border-2 border-blue-500 rounded-lg max-h-32" />
                    <p class="mt-1 text-xs text-gray-400">Aperçu</p>
                  </div>
                  <p class="mt-2 text-xs text-gray-500">
                    Formats acceptés : JPG, PNG, WEBP, GIF. Taille max : 5 Mo.
                  </p>
                </div>
              </div>

              <div>
                <label class="block mb-2 font-semibold text-gray-200">Mot de passe</label>
                <input v-model="password" type="password" autocomplete="new-password" placeholder="••••••••"
                  minlength="6"
                  class="w-full p-3 text-white placeholder-gray-400 transition-all bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                <p class="mt-2 text-xs text-gray-400">Minimum 6 caractères.</p>
              </div>

              <div>
                <label class="block mb-2 font-semibold text-gray-200">Confirmer le mot de passe</label>
                <input v-model="confirmPassword" type="password" autocomplete="new-password" placeholder="••••••••"
                  minlength="6"
                  class="w-full p-3 text-white placeholder-gray-400 transition-all bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
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
                class="w-1/3 py-3 font-semibold text-gray-200 transition-colors bg-gray-700 border border-gray-600 rounded-lg hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed">
                ← Précédent
              </button>
              <button type="button" @click="handleRegister" :disabled="authStore.loading"
                class="flex-1 py-3 font-semibold text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed">
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

        <p class="mt-6 text-center text-gray-400">
          Vous avez déjà un compte ?
          <RouterLink to="/connexion" class="ml-1 font-medium text-blue-400 hover:text-blue-300">
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