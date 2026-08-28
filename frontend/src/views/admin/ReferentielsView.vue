<script setup>
// =========================================================
// Référentiels (admin, section 2.2) : gestion des salles,
// groupes et matières avec suppression douce (archivage).
// =========================================================
import { onMounted, ref } from "vue";
import { useReferentielsStore } from "../../stores/referentiels";

const referentielsStore = useReferentielsStore();

const activeTab = ref("salles");

const tabs = [
  { key: "salles", label: "Salles" },
  { key: "groupes", label: "Groupes" },
  { key: "matieres", label: "Matières" },
];

// --- Formulaires ---
const salleName = ref("");
const salleCapacite = ref("");
const salleBatiment = ref("");

const groupeName = ref("");
const groupePromotion = ref("");
const groupeEffectif = ref("");

const matiereName = ref("");
const matiereSemester = ref("S5");
const matiereVolume = ref("");

const feedback = ref(null); // { type: "success"|"error", text }

const semesters = ["S1", "S2", "S3", "S4", "S5", "S6"];

onMounted(() => {
  referentielsStore.fetchSalles();
  referentielsStore.fetchGroupes();
  referentielsStore.fetchMatieres();
});

const showFeedback = (result) => {
  if (!result) return;
  feedback.value = {
    type: result.success ? "success" : "error",
    text: result.message || (result.success ? "Opération réussie" : "Une erreur est survenue"),
  };

  setTimeout(() => {
    feedback.value = null;
  }, 4000);
};

// --- Salles ---
const submitSalle = async () => {
  const result = await referentielsStore.createSalle({
    name: salleName.value.trim(),
    capacite: Number(salleCapacite.value),
    batiment: salleBatiment.value.trim() || null,
  });

  showFeedback(result);

  if (result.success) {
    salleName.value = "";
    salleCapacite.value = "";
    salleBatiment.value = "";
  }
};

const removeSalle = async (id) => {
  showFeedback(await referentielsStore.deleteSalle(id));
};

// --- Groupes ---
const submitGroupe = async () => {
  const effectif = Number(groupeEffectif.value);

  const result = await referentielsStore.createGroupe({
    name: groupeName.value.trim(),
    promotion: groupePromotion.value.trim(),
    effectifIndicatif: effectif > 0 ? effectif : null,
  });

  showFeedback(result);

  if (result.success) {
    groupeName.value = "";
    groupePromotion.value = "";
    groupeEffectif.value = "";
  }
};

const removeGroupe = async (id) => {
  showFeedback(await referentielsStore.deleteGroupe(id));
};

// --- Matières ---
const submitMatiere = async () => {
  const volume = Number(matiereVolume.value);

  const result = await referentielsStore.createMatiere({
    name: matiereName.value.trim(),
    semester: matiereSemester.value,
    volumeHoraireCreneaux: volume > 0 ? volume : null,
  });

  showFeedback(result);

  if (result.success) {
    matiereName.value = "";
    matiereVolume.value = "";
  }
};

const removeMatiere = async (id) => {
  showFeedback(await referentielsStore.deleteMatiere(id));
};
</script>

<template>
  <div class="bg-gt-card border border-white/5 rounded-[2rem] p-6 sm:p-8 min-h-full flex flex-col">
    <!-- Header -->
    <div class="mb-6">
      <h2 class="text-2xl font-bold text-white flex items-center gap-2">
        <svg class="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
        Référentiels
      </h2>

      <p class="mt-1 text-sm text-gray-500">
        Gérez les salles, groupes et matières utilisés dans la planification.
        Les suppressions sont des archivages : l'historique des cours est préservé.
      </p>
    </div>

    <!-- Onglets -->
    <div class="flex items-center gap-2 mb-6 p-1 bg-white/5 border border-white/5 rounded-xl w-fit">
      <button v-for="tab in tabs" :key="tab.key" @click="activeTab = tab.key"
        class="px-4 py-2 text-sm font-medium rounded-lg transition-colors"
        :class="activeTab === tab.key
          ? 'bg-gt-blue text-white shadow-[0_0_15px_rgba(37,99,235,0.4)]'
          : 'text-gray-400 hover:text-white'">
        {{ tab.label }}
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

    <!-- ===================== SALLES ===================== -->
    <div v-if="activeTab === 'salles'" class="space-y-6">
      <form @submit.prevent="submitSalle"
        class="grid grid-cols-1 sm:grid-cols-4 gap-4 items-end p-5 border rounded-2xl bg-white/5 border-white/5">
        <div>
          <label for="salle-name" class="block mb-2 text-sm font-medium text-gray-300">Nom *</label>

          <input id="salle-name" v-model="salleName" type="text" required placeholder="Ex : B12"
            class="w-full p-3 bg-gt-bg/60 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gt-blue transition-all" />
        </div>

        <div>
          <label for="salle-capacite" class="block mb-2 text-sm font-medium text-gray-300">Capacité *</label>

          <input id="salle-capacite" v-model="salleCapacite" type="number" min="1" step="1" required placeholder="40"
            class="w-full p-3 bg-gt-bg/60 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gt-blue transition-all" />
        </div>

        <div>
          <label for="salle-batiment" class="block mb-2 text-sm font-medium text-gray-300">Bâtiment</label>

          <input id="salle-batiment" v-model="salleBatiment" type="text" placeholder="Ex : Bloc B"
            class="w-full p-3 bg-gt-bg/60 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gt-blue transition-all" />
        </div>

        <button type="submit"
          :disabled="!salleName || !salleCapacite"
          class="w-full py-3 px-4 text-sm font-medium text-white transition rounded-xl bg-gt-blue hover:bg-blue-500 shadow-[0_0_15px_rgba(37,99,235,0.4)] disabled:opacity-50 disabled:cursor-not-allowed">
          + Ajouter
        </button>
      </form>

      <!-- Liste salles -->
      <div class="border border-white/5 rounded-2xl overflow-hidden divide-y divide-white/5 bg-white/[0.02]">
        <div v-for="salle in referentielsStore.salles" :key="salle.id || salle._id"
          class="flex items-center justify-between gap-4 px-5 py-4 hover:bg-white/5 transition-colors">
          <div class="flex items-center gap-3 min-w-0">
            <span
              class="flex items-center justify-center flex-shrink-0 w-9 h-9 text-xs font-bold rounded-lg bg-blue-500/20 text-blue-300">
              🏫
            </span>

            <div class="min-w-0">
              <p class="text-sm font-semibold text-white truncate">{{ salle.name }}</p>
              <p class="text-xs text-gray-500">
                Capacité : {{ salle.capacite }}
                <template v-if="salle.batiment"> · {{ salle.batiment }}</template>
              </p>
            </div>
          </div>

          <button @click="removeSalle(salle.id || salle._id)"
            class="flex-shrink-0 p-2 text-gray-500 transition-colors rounded-full hover:text-red-400 hover:bg-red-500/10"
            aria-label="Archiver la salle">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>

        <p v-if="referentielsStore.salles.length === 0" class="px-5 py-8 text-center text-sm text-gray-500">
          Aucune salle enregistrée.
        </p>
      </div>
    </div>

    <!-- ===================== GROUPES ===================== -->
    <div v-if="activeTab === 'groupes'" class="space-y-6">
      <form @submit.prevent="submitGroupe"
        class="grid grid-cols-1 sm:grid-cols-4 gap-4 items-end p-5 border rounded-2xl bg-white/5 border-white/5">
        <div>
          <label for="groupe-name" class="block mb-2 text-sm font-medium text-gray-300">Nom *</label>

          <input id="groupe-name" v-model="groupeName" type="text" required placeholder="Ex : L3-GL-A"
            class="w-full p-3 bg-gt-bg/60 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gt-blue transition-all" />
        </div>

        <div>
          <label for="groupe-promotion" class="block mb-2 text-sm font-medium text-gray-300">Promotion *</label>

          <input id="groupe-promotion" v-model="groupePromotion" type="text" required placeholder="Ex : L3 2025-2026"
            class="w-full p-3 bg-gt-bg/60 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gt-blue transition-all" />
        </div>

        <div>
          <label for="groupe-effectif" class="block mb-2 text-sm font-medium text-gray-300">Effectif indicatif</label>

          <input id="groupe-effectif" v-model="groupeEffectif" type="number" min="1" step="1" placeholder="35"
            class="w-full p-3 bg-gt-bg/60 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gt-blue transition-all" />
        </div>

        <button type="submit"
          :disabled="!groupeName || !groupePromotion"
          class="w-full py-3 px-4 text-sm font-medium text-white transition rounded-xl bg-gt-blue hover:bg-blue-500 shadow-[0_0_15px_rgba(37,99,235,0.4)] disabled:opacity-50 disabled:cursor-not-allowed">
          + Ajouter
        </button>
      </form>

      <!-- Liste groupes -->
      <div class="border border-white/5 rounded-2xl overflow-hidden divide-y divide-white/5 bg-white/[0.02]">
        <div v-for="groupe in referentielsStore.groupes" :key="groupe.id"
          class="flex items-center justify-between gap-4 px-5 py-4 hover:bg-white/5 transition-colors">
          <div class="flex items-center gap-3 min-w-0">
            <span
              class="flex items-center justify-center flex-shrink-0 w-9 h-9 text-xs font-bold rounded-lg bg-purple-500/20 text-purple-300">
              👥
            </span>

            <div class="min-w-0">
              <p class="text-sm font-semibold text-white truncate">{{ groupe.name }}</p>
              <p class="text-xs text-gray-500">
                {{ groupe.promotion }}
                <template v-if="groupe.effectifIndicatif"> · ~{{ groupe.effectifIndicatif }} étudiants</template>
              </p>
            </div>
          </div>

          <button @click="removeGroupe(groupe.id)"
            class="flex-shrink-0 p-2 text-gray-500 transition-colors rounded-full hover:text-red-400 hover:bg-red-500/10"
            aria-label="Archiver le groupe">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>

        <p v-if="referentielsStore.groupes.length === 0" class="px-5 py-8 text-center text-sm text-gray-500">
          Aucun groupe enregistré.
        </p>
      </div>
    </div>

    <!-- ===================== MATIÈRES ===================== -->
    <div v-if="activeTab === 'matieres'" class="space-y-6">
      <form @submit.prevent="submitMatiere"
        class="grid grid-cols-1 sm:grid-cols-4 gap-4 items-end p-5 border rounded-2xl bg-white/5 border-white/5">
        <div>
          <label for="matiere-name" class="block mb-2 text-sm font-medium text-gray-300">Nom *</label>

          <input id="matiere-name" v-model="matiereName" type="text" required placeholder="Ex : Algorithmique avancée"
            class="w-full p-3 bg-gt-bg/60 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gt-blue transition-all" />
        </div>

        <div>
          <label for="matiere-semestre" class="block mb-2 text-sm font-medium text-gray-300">Semestre *</label>

          <select id="matiere-semestre" v-model="matiereSemester" required
            class="w-full p-3 bg-gt-bg/60 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-gt-blue transition-all">
            <option v-for="semester in semesters" :key="semester" :value="semester">
              {{ semester }}
            </option>
          </select>
        </div>

        <div>
          <label for="matiere-volume" class="block mb-2 text-sm font-medium text-gray-300">
            Volume horaire (créneaux)
          </label>

          <input id="matiere-volume" v-model="matiereVolume" type="number" min="1" step="1" placeholder="Ex : 10"
            class="w-full p-3 bg-gt-bg/60 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gt-blue transition-all" />
        </div>

        <button type="submit"
          :disabled="!matiereName"
          class="w-full py-3 px-4 text-sm font-medium text-white transition rounded-xl bg-gt-blue hover:bg-blue-500 shadow-[0_0_15px_rgba(37,99,235,0.4)] disabled:opacity-50 disabled:cursor-not-allowed">
          + Ajouter
        </button>
      </form>

      <!-- Liste matières -->
      <div class="border border-white/5 rounded-2xl overflow-hidden divide-y divide-white/5 bg-white/[0.02]">
        <div v-for="matiere in referentielsStore.matieres" :key="matiere.id"
          class="flex items-center justify-between gap-4 px-5 py-4 hover:bg-white/5 transition-colors">
          <div class="flex items-center gap-3 min-w-0">
            <span
              class="flex items-center justify-center flex-shrink-0 w-9 h-9 text-xs font-bold rounded-lg bg-emerald-500/20 text-emerald-300">
              📚
            </span>

            <div class="min-w-0">
              <p class="text-sm font-semibold text-white truncate">{{ matiere.name }}</p>
              <p class="text-xs text-gray-500">
                {{ matiere.semester }}
                <template v-if="matiere.volumeHoraireCreneaux">
                  · {{ matiere.volumeHoraireCreneaux }} créneaux
                </template>
              </p>
            </div>
          </div>

          <button @click="removeMatiere(matiere.id)"
            class="flex-shrink-0 p-2 text-gray-500 transition-colors rounded-full hover:text-red-400 hover:bg-red-500/10"
            aria-label="Archiver la matière">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>

        <p v-if="referentielsStore.matieres.length === 0" class="px-5 py-8 text-center text-sm text-gray-500">
          Aucune matière enregistrée.
        </p>
      </div>
    </div>
  </div>
</template>
