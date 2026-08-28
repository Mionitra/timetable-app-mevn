<script setup>
// =========================================================
// Éditeur d'emploi du temps (admin, section 2.6 / 2.7) :
// sélection groupe + semaine → grille éditable avec contrôle
// de conflits à la volée et publication de la semaine.
// =========================================================
import { computed, onMounted } from "vue";
import { useSlotsStore } from "../../stores/slots";
import { useReferentielsStore } from "../../stores/referentiels";
import ScheduleGrid from "../../components/ScheduleGrid.vue";
import SlotFormModal from "../../components/SlotFormModal.vue";
import { getWeekOptions, getCurrentWeek } from "../../utils/weeks";

const slotsStore = useSlotsStore();
const referentielsStore = useReferentielsStore();

const weekOptions = getWeekOptions(2, 6);

// Taille du bloc en cours d'édition : nombre de documents partageant
// le même sequenceId (cours sur créneaux successifs), sinon 1.
const currentSequenceSize = computed(() => {
  const slot = slotsStore.modal.slotData;
  if (!slot?.sequenceId) return 1;
  return (
    slotsStore.slots.filter((s) => s.sequenceId === slot.sequenceId).length || 1
  );
});

onMounted(() => {
  referentielsStore.fetchGroupes();
  referentielsStore.fetchMatieres();
  referentielsStore.fetchEnseignants();
  referentielsStore.fetchSalles();

  if (slotsStore.groupId) {
    slotsStore.fetchGrid(getCurrentWeek(), slotsStore.groupId);
  }
});

const onGroupChange = (event) => {
  const groupId = event.target.value || null;
  slotsStore.setContext(groupId, getCurrentWeek());

  if (groupId) {
    slotsStore.fetchGrid();
  }
};

const onWeekChange = (event) => {
  const value = event.target.value;

  if (!value) return;
  const [weekNumber, year] = value.split("-").map(Number);

  slotsStore.currentWeek = { weekNumber, year };

  if (slotsStore.groupId) {
    slotsStore.fetchGrid();
  }
};

const handleCellClick = ({ dayOfWeek, slotIndex, slot }) => {
  if (!slotsStore.groupId) {
    slotsStore.error = "Veuillez d'abord sélectionner un groupe";
    return;
  }

  if (slot) {
    slotsStore.openEditModal(slot);
  } else {
    slotsStore.openCreateModal({ dayOfWeek, slotIndex });
  }
};

const handleCheck = (payload) => {
  slotsStore.checkConflicts({
    ...payload,
    weekNumber: slotsStore.currentWeek.weekNumber,
    year: slotsStore.currentWeek.year,
    groupId: slotsStore.groupId,
  });
};

const handleSubmit = (payload) => {
  slotsStore.submitSlot({
    ...payload,
    weekNumber: slotsStore.currentWeek.weekNumber,
    year: slotsStore.currentWeek.year,
    groupId: slotsStore.groupId,
  });
};

const handleRemove = (id) => {
  slotsStore.deleteSlot(id);
};

const handlePublish = () => {
  slotsStore.publishWeek();
};
</script>

<template>
  <div class="bg-gt-card border border-white/5 rounded-[2rem] p-6 sm:p-8 min-h-full flex flex-col">
    <!-- Header -->
    <div class="flex flex-col lg:flex-row lg:items-end justify-between gap-4 mb-6">
      <div>
        <h2 class="text-2xl font-bold text-white flex items-center gap-2">
          <svg class="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          Éditeur d'emplois du temps
        </h2>

        <p class="mt-1 text-sm text-gray-500">
          Sélectionnez un groupe et une semaine, puis cliquez sur les créneaux
          pour planifier les cours.
        </p>
      </div>

      <!-- Publication de semaine -->
      <button @click="handlePublish"
        :disabled="!slotsStore.groupId || slotsStore.publishing || slotsStore.loading"
        class="flex items-center gap-2 px-5 py-3 bg-green-600/20 border border-green-500/40 rounded-xl text-sm font-medium text-green-300 hover:bg-green-600/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap">
        <svg v-if="slotsStore.publishing" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
          </path>
        </svg>

        <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
        </svg>

        {{ slotsStore.publishing ? "Publication..." : "Publier toute la semaine" }}
      </button>
    </div>

    <!-- Sélecteurs contexte -->
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
      <div>
        <label for="editor-group" class="block mb-2 text-sm font-medium text-gray-300">
          Groupe *
        </label>

        <select id="editor-group" :value="slotsStore.groupId || ''" @change="onGroupChange"
          class="w-full p-3 bg-gt-bg/60 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-gt-blue transition-all">
          <option value="" disabled>Choisir un groupe</option>

          <option v-for="groupe in referentielsStore.groupes" :key="groupe.id" :value="groupe.id">
            {{ groupe.name }} — {{ groupe.promotion }}
          </option>
        </select>
      </div>

      <div>
        <label for="editor-week" class="block mb-2 text-sm font-medium text-gray-300">
          Semaine *
        </label>

        <select id="editor-week"
          :value="`${slotsStore.currentWeek.weekNumber}-${slotsStore.currentWeek.year}`"
          @change="onWeekChange"
          class="w-full p-3 bg-gt-bg/60 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-gt-blue transition-all">
          <option v-for="week in weekOptions" :key="`${week.weekNumber}-${week.year}`"
            :value="`${week.weekNumber}-${week.year}`">
            {{ week.label }}{{ week.isCurrent ? " (actuelle)" : "" }}
          </option>
        </select>
      </div>
    </div>

    <!-- Messages -->
    <p v-if="slotsStore.error && !slotsStore.modal.isOpen"
      class="mb-4 text-sm font-medium text-red-400">
      ⚠️ {{ slotsStore.error }}
    </p>

    <p v-if="slotsStore.successMessage && !slotsStore.modal.isOpen"
      class="mb-4 text-sm font-medium text-green-400">
      ✓ {{ slotsStore.successMessage }}
    </p>

    <!-- Grille -->
    <div v-if="!slotsStore.groupId"
      class="flex-1 flex items-center justify-center py-16 border border-dashed border-white/10 rounded-2xl">
      <div class="text-center">
        <svg class="w-16 h-16 text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>

        <h3 class="text-white font-semibold text-lg mb-1">Aucun groupe sélectionné</h3>
        <p class="text-gray-400 text-sm">Choisissez un groupe et une semaine pour commencer.</p>
      </div>
    </div>

    <template v-else>
      <div v-if="slotsStore.loading" class="flex-1 flex items-center justify-center py-16">
        <div class="text-center">
          <div class="w-10 h-10 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto mb-3"></div>
          <p class="text-gray-400 text-sm">Chargement de la grille...</p>
        </div>
      </div>

      <ScheduleGrid v-else :slots="slotsStore.slots" editable
        :selected-id="slotsStore.modal.slotData?.id" @cell-click="handleCellClick" />

      <!-- Légende brouillon / publié -->
      <div class="mt-4 flex items-center gap-6 text-xs text-gray-500">
        <span class="flex items-center gap-2">
          <span class="inline-block w-3 h-3 rounded bg-gray-500/40 border border-gray-400/50"></span>
          Brouillon (visible par l'admin uniquement)
        </span>

        <span class="flex items-center gap-2">
          <span class="inline-block w-3 h-3 rounded bg-green-600/40 border border-green-500/60"></span>
          Publié (visible par les étudiants)
        </span>
      </div>
    </template>

    <!-- Modal création / édition -->
    <SlotFormModal :is-open="slotsStore.modal.isOpen" :mode="slotsStore.modal.mode"
      :cell="slotsStore.modal.cell" :slot-data="slotsStore.modal.slotData"
      :sequence-size="currentSequenceSize"
      :matieres="referentielsStore.matieres" :enseignants="referentielsStore.enseignants"
      :salles="referentielsStore.salles" :conflicts="slotsStore.conflicts"
      :checking="slotsStore.checking" :submitting="slotsStore.submitting"
      @close="slotsStore.closeModal()" @check="handleCheck" @submit="handleSubmit"
      @remove="handleRemove" />
  </div>
</template>
