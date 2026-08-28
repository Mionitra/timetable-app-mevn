<script setup>
// =========================================================
// Utilisateurs (admin, RF-AUTH-02 / RF-AUTH-03 / RF-ADMIN-04) :
// activation des comptes étudiants en attente + gestion des
// enseignants (création avec mot de passe temporaire affiché
// une seule fois, désactivation).
// =========================================================
import { onMounted, ref } from "vue";
import { useReferentielsStore } from "../../stores/referentiels";

const referentielsStore = useReferentielsStore();

const activeTab = ref("etudiants");

const tabs = [
  { key: "etudiants", label: "Inscriptions en attente" },
  { key: "enseignants", label: "Enseignants" },
];

const feedback = ref(null); // { type, text }

// --- Création enseignant ---
const showTeacherModal = ref(false);
const teacherFirstName = ref("");
const teacherLastName = ref("");
const teacherEmail = ref("");
const teacherType = ref("vacataire");
const teacherDiscipline = ref("");
const submittingTeacher = ref(false);
const createdPassword = ref(null); // mot de passe temporaire à copier

const typesEnseignant = ["permanent", "vacataire"];

onMounted(() => {
  referentielsStore.fetchPendingStudents();
  referentielsStore.fetchEnseignants();
});

const showFeedback = (result) => {
  if (!result) return;
  feedback.value = {
    type: result.success ? "success" : "error",
    text:
      result.message ||
      (result.success ? "Opération réussie" : "Une erreur est survenue"),
  };

  setTimeout(() => {
    feedback.value = null;
  }, 4000);
};

// --- Étudiants ---
const activate = async (id) => {
  showFeedback(await referentielsStore.activateStudent(id));
};

// --- Enseignants ---
const openTeacherModal = () => {
  showTeacherModal.value = true;
  createdPassword.value = null;
  teacherFirstName.value = "";
  teacherLastName.value = "";
  teacherEmail.value = "";
  teacherType.value = "vacataire";
  teacherDiscipline.value = "";
};

const closeTeacherModal = () => {
  showTeacherModal.value = false;
  createdPassword.value = null;
};

const submitTeacher = async () => {
  submittingTeacher.value = true;

  const result = await referentielsStore.createEnseignant({
    firstName: teacherFirstName.value.trim(),
    lastName: teacherLastName.value.trim(),
    email: teacherEmail.value.trim().toLowerCase(),
    typeEnseignant: teacherType.value,
    discipline: teacherDiscipline.value.trim() || null,
  });

  submittingTeacher.value = false;

  if (result.success && result.temporaryPassword) {
    // Affichage UNE SEULE fois (RF-AUTH-03)
    createdPassword.value = result.temporaryPassword;
    showFeedback(result);
  } else {
    showFeedback(result);
  }
};

const copyPassword = async () => {
  if (!createdPassword.value) return;
  try {
    await navigator.clipboard.writeText(createdPassword.value);
  } catch {
    // Presse-papiers indisponible : sélection manuelle possible
  }
};

const deactivate = async (id) => {
  showFeedback(await referentielsStore.deactivateEnseignant(id));
};
</script>

<template>
  <div class="bg-gt-card border border-white/5 rounded-[2rem] p-6 sm:p-8 min-h-full flex flex-col">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
      <div>
        <h2 class="text-2xl font-bold text-white flex items-center gap-2">
          <svg class="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
          Utilisateurs
        </h2>

        <p class="mt-1 text-sm text-gray-500">
          Activez les comptes étudiants et gérez les comptes enseignants.
        </p>
      </div>

      <!-- Nouvel enseignant -->
      <button v-if="activeTab === 'enseignants'" @click="openTeacherModal"
        class="flex items-center gap-2 px-5 py-3 bg-gt-blue rounded-xl text-sm font-medium text-white shadow-[0_0_15px_rgba(37,99,235,0.4)] hover:bg-blue-500 transition-colors whitespace-nowrap">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        Nouvel enseignant
      </button>
    </div>

    <!-- Onglets -->
    <div class="flex items-center gap-2 mb-6 p-1 bg-white/5 border border-white/5 rounded-xl w-fit">
      <button v-for="tab in tabs" :key="tab.key" @click="activeTab = tab.key"
        class="px-4 py-2 text-sm font-medium rounded-lg transition-colors"
        :class="activeTab === tab.key
          ? 'bg-gt-blue text-white shadow-[0_0_15px_rgba(37,99,235,0.4)]'
          : 'text-gray-400 hover:text-white'">
        {{ tab.label }}
        <span v-if="tab.key === 'etudiants' && referentielsStore.pendingStudents.length > 0"
          class="ml-1.5 px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-amber-500 text-black">
          {{ referentielsStore.pendingStudents.length }}
        </span>
      </button>
    </div>

    <!-- Feedback global -->
    <p v-if="feedback" class="mb-4 text-sm font-medium"
      :class="feedback.type === 'success' ? 'text-green-400' : 'text-red-400'">
      {{ feedback.type === 'success' ? '✓' : '⚠️' }} {{ feedback.text }}
    </p>

    <p v-if="referentielsStore.error && !feedback"
      class="mb-4 text-sm font-medium text-red-400">
      ⚠️ {{ referentielsStore.error }}
    </p>

    <!-- ===================== ÉTUDIANTS EN ATTENTE ===================== -->
    <div v-if="activeTab === 'etudiants'"
      class="border border-white/5 rounded-2xl overflow-hidden divide-y divide-white/5 bg-white/[0.02]">
      <div v-for="student in referentielsStore.pendingStudents" :key="student.id"
        class="flex items-center justify-between gap-4 px-5 py-4 hover:bg-white/5 transition-colors">
        <div class="flex items-center gap-3 min-w-0">
          <span
            class="flex items-center justify-center w-9 h-9 text-xs font-bold text-white rounded-full bg-gt-blue/40 flex-shrink-0">
            {{ student.firstName?.charAt(0) }}{{ student.lastName?.charAt(0) }}
          </span>

          <div class="min-w-0">
            <p class="text-sm font-semibold text-white truncate">
              {{ student.firstName }} {{ student.lastName }}
            </p>
            <p class="text-xs text-gray-500 truncate">
              {{ student.email }}
              <template v-if="student.studentId"> · Matricule {{ student.studentId }}</template>
              <template v-if="student.group"> · {{ student.group.name }}</template>
            </p>
          </div>
        </div>

        <button @click="activate(student.id)"
          class="flex-shrink-0 flex items-center gap-2 px-4 py-2 text-xs font-medium rounded-lg bg-green-600/20 text-green-300 border border-green-500/40 hover:bg-green-600/30 transition-colors">
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
          Activer le compte
        </button>
      </div>

      <div v-if="referentielsStore.pendingStudents.length === 0" class="px-5 py-12 text-center">
        <div class="mb-3 text-4xl">🎉</div>
        <p class="text-sm font-semibold text-white">Aucune inscription en attente</p>
        <p class="mt-1 text-xs text-gray-500">
          Tous les comptes étudiants ont été traités.
        </p>
      </div>
    </div>

    <!-- ===================== ENSEIGNANTS ===================== -->
    <div v-if="activeTab === 'enseignants'"
      class="border border-white/5 rounded-2xl overflow-hidden divide-y divide-white/5 bg-white/[0.02]">
      <div v-for="enseignant in referentielsStore.enseignants" :key="enseignant.id"
        class="flex items-center justify-between gap-4 px-5 py-4 hover:bg-white/5 transition-colors">
        <div class="flex items-center gap-3 min-w-0">
          <span
            class="flex items-center justify-center w-9 h-9 text-xs font-bold text-white rounded-full bg-purple-500/30 flex-shrink-0">
            {{ enseignant.firstName?.charAt(0) }}{{ enseignant.lastName?.charAt(0) }}
          </span>

          <div class="min-w-0">
            <p class="text-sm font-semibold text-white truncate">
              {{ enseignant.lastName }} {{ enseignant.firstName }}
            </p>
            <p class="text-xs text-gray-500 truncate">
              {{ enseignant.email }}
              <template v-if="enseignant.typeEnseignant"> · {{ enseignant.typeEnseignant }}</template>
              <template v-if="enseignant.discipline"> · {{ enseignant.discipline }}</template>
            </p>
          </div>
        </div>

        <button @click="deactivate(enseignant.id)"
          class="flex-shrink-0 p-2 text-gray-500 transition-colors rounded-full hover:text-red-400 hover:bg-red-500/10"
          aria-label="Désactiver l'enseignant">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
          </svg>
        </button>
      </div>

      <p v-if="referentielsStore.enseignants.length === 0" class="px-5 py-8 text-center text-sm text-gray-500">
        Aucun enseignant actif.
      </p>
    </div>

    <!-- ===================== MODAL CRÉATION ENSEIGNANT ===================== -->
    <Teleport to="body">
      <div v-if="showTeacherModal"
        class="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
        @click.self="closeTeacherModal">
        <div class="relative w-full max-w-md bg-gt-card border border-white/10 rounded-2xl shadow-2xl">
          <!-- En-tête -->
          <div class="flex items-center justify-between p-5 border-b border-white/5">
            <h3 class="text-lg font-bold text-white">Nouvel enseignant</h3>

            <button v-if="!createdPassword" @click="closeTeacherModal"
              class="p-1.5 text-gray-400 transition-colors rounded-full hover:bg-white/5 hover:text-white"
              aria-label="Fermer">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <!-- Formulaire -->
          <form v-if="!createdPassword" @submit.prevent="submitTeacher" class="p-5 space-y-4">
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label for="teacher-firstname" class="block mb-1.5 text-sm font-medium text-gray-300">Prénom *</label>

                <input id="teacher-firstname" v-model="teacherFirstName" type="text" required
                  placeholder="Jean"
                  class="w-full p-3 bg-gt-bg/60 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gt-blue transition-all" />
              </div>

              <div>
                <label for="teacher-lastname" class="block mb-1.5 text-sm font-medium text-gray-300">Nom *</label>

                <input id="teacher-lastname" v-model="teacherLastName" type="text" required
                  placeholder="Dupont"
                  class="w-full p-3 bg-gt-bg/60 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gt-blue transition-all" />
              </div>
            </div>

            <div>
              <label for="teacher-email" class="block mb-1.5 text-sm font-medium text-gray-300">Email *</label>

              <input id="teacher-email" v-model="teacherEmail" type="email" required
                placeholder="jean.dupont@univ.edu"
                class="w-full p-3 bg-gt-bg/60 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gt-blue transition-all" />
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label for="teacher-type" class="block mb-1.5 text-sm font-medium text-gray-300">Type *</label>

                <select id="teacher-type" v-model="teacherType" required
                  class="w-full p-3 bg-gt-bg/60 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-gt-blue transition-all">
                  <option v-for="type in typesEnseignant" :key="type" :value="type">
                    {{ type.charAt(0).toUpperCase() + type.slice(1) }}
                  </option>
                </select>
              </div>

              <div>
                <label for="teacher-discipline" class="block mb-1.5 text-sm font-medium text-gray-300">Discipline</label>

                <input id="teacher-discipline" v-model="teacherDiscipline" type="text"
                  placeholder="Ex : Réseaux"
                  class="w-full p-3 bg-gt-bg/60 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gt-blue transition-all" />
              </div>
            </div>

            <p v-if="referentielsStore.error && !referentielsStore.loading"
              class="text-sm font-medium text-red-400">
              ⚠️ {{ referentielsStore.error }}
            </p>

            <button type="submit" :disabled="submittingTeacher || !teacherFirstName || !teacherLastName || !teacherEmail || !teacherType"
              class="w-full py-3 text-sm font-medium text-white transition rounded-xl bg-gt-blue hover:bg-blue-500 shadow-[0_0_15px_rgba(37,99,235,0.4)] disabled:opacity-50 disabled:cursor-not-allowed">
              {{ submittingTeacher ? "Création..." : "Créer le compte enseignant" }}
            </button>

            <p class="text-xs text-gray-500">
              Un mot de passe temporaire sera généré et affiché une seule fois :
              communiquez-le à l'enseignant.
            </p>
          </form>

          <!-- Mot de passe temporaire affiché UNE SEULE FOIS -->
          <div v-else class="p-5 space-y-5 text-center">
            <div class="mx-auto flex items-center justify-center w-14 h-14 rounded-full bg-green-500/20">
              <svg class="w-7 h-7 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>

            <div>
              <h4 class="font-bold text-white">Compte enseignant créé</h4>

              <p class="mt-2 text-sm text-gray-400">
                Communiquez ce mot de passe temporaire à
                <span class="text-white font-medium">
                  {{ teacherFirstName }} {{ teacherLastName }}
                </span>.
                Il ne sera plus jamais affiché.
              </p>
            </div>

            <div class="flex items-center gap-3 p-4 bg-gt-bg/60 border border-white/10 rounded-xl">
              <code class="flex-1 text-lg font-bold tracking-widest text-gt-blue select-all">
                {{ createdPassword }}
              </code>

              <button @click="copyPassword" type="button"
                class="p-2 text-gray-400 transition-colors rounded-lg hover:text-white hover:bg-white/5"
                aria-label="Copier le mot de passe">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </button>
            </div>

            <button @click="closeTeacherModal" type="button"
              class="w-full py-3 text-sm font-medium text-white transition rounded-xl bg-gt-blue hover:bg-blue-500 shadow-[0_0_15px_rgba(37,99,235,0.4)]">
              Terminer
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>
