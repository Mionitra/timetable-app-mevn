<script setup>
// =========================================================
// Planning hebdomadaire personnel de l'enseignant (lecture
// seule, cours publiés uniquement — RF-TEACH-02).
// =========================================================
import { onMounted, ref, watch } from "vue";
import { useEnseignantStore } from "../../stores/enseignant";
import ScheduleGrid from "../../components/ScheduleGrid.vue";
import { getWeekOptions, getCurrentWeek } from "../../utils/weeks";

const enseignantStore = useEnseignantStore();

const weekOptions = getWeekOptions(2, 6);
const selectedWeek = ref(getCurrentWeek());

onMounted(() => {
  enseignantStore.fetchPlanning(selectedWeek.value);
});

watch(selectedWeek, (week) => {
  enseignantStore.fetchPlanning(week);
});
</script>

<template>
  <div class="bg-gt-card border border-white/5 rounded-[2rem] p-6 sm:p-8 min-h-full flex flex-col">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
      <div>
        <h2 class="text-2xl font-bold text-white flex items-center gap-2">
          <svg class="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          Mon planning
        </h2>

        <p class="mt-1 text-sm text-gray-500">
          Vos cours publiés pour la semaine sélectionnée.
        </p>
      </div>

      <!-- Sélecteur de semaine -->
      <div class="flex items-center gap-2">
        <label for="planning-week" class="text-sm font-medium text-gray-400 whitespace-nowrap">
          Semaine
        </label>

        <select id="planning-week" v-model="selectedWeek"
          class="p-3 bg-gt-bg/60 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-gt-blue transition-all">
          <option v-for="week in weekOptions" :key="`${week.weekNumber}-${week.year}`"
            :value="{ weekNumber: week.weekNumber, year: week.year }">
            {{ week.label }}{{ week.isCurrent ? " (actuelle)" : "" }}
          </option>
        </select>
      </div>
    </div>

    <!-- Erreur -->
    <p v-if="enseignantStore.error && !enseignantStore.loading"
      class="mb-4 text-sm font-medium text-red-400">
      ⚠️ {{ enseignantStore.error }}
    </p>

    <!-- Loading -->
    <div v-if="enseignantStore.loading" class="flex-1 flex items-center justify-center py-16">
      <div class="text-center">
        <div class="w-10 h-10 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto mb-3"></div>
        <p class="text-gray-400 text-sm">Chargement du planning...</p>
      </div>
    </div>

    <!-- Grille vide -->
    <div v-else-if="enseignantStore.planning.length === 0"
      class="flex-1 flex items-center justify-center py-16">
      <div class="text-center">
        <svg class="w-16 h-16 text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <h3 class="text-white font-semibold text-lg mb-1">Aucun cours cette semaine</h3>
        <p class="text-gray-400 text-sm">
          Aucun cours publié ne vous concerne pour la semaine sélectionnée.
        </p>
      </div>
    </div>

    <!-- Grille -->
    <ScheduleGrid v-else :slots="enseignantStore.planning" />
  </div>
</template>
