<script setup>
// =========================================================
// Emploi du temps hebdomadaire de l'étudiant : grille en
// lecture seule, sélecteur de semaine et export PDF
// (RF-STUD-01 / RF-STUD-02).
// =========================================================
import { onMounted, ref, watch, nextTick } from "vue";
import { useEtudiantStore } from "../../stores/etudiant";
import { useAuthStore } from "../../stores/auth";
import ScheduleGrid from "../../components/ScheduleGrid.vue";
import { getWeekOptions, getCurrentWeek } from "../../utils/weeks";

const etudiantStore = useEtudiantStore();
const authStore = useAuthStore();

const weekOptions = getWeekOptions(2, 6);
const selectedWeek = ref(getCurrentWeek());
const exporting = ref(false);

onMounted(() => {
  etudiantStore.fetchSchedule(selectedWeek.value);
});

watch(selectedWeek, (week) => {
  etudiantStore.fetchSchedule(week);
});

// Export PDF de la grille affichée (section 2.5)
const exportPdf = async () => {
  if (exporting.value) return;

  const element = document.getElementById("schedule-grid-export");
  if (!element) return;

  exporting.value = true;

  try {
    const html2pdf = (await import("html2pdf.js")).default;
    const week = selectedWeek.value;

    await html2pdf()
      .set({
        margin: [10, 10, 10, 10],
        filename: `emploi-du-temps-S${week.weekNumber}-${week.year}.pdf`,
        image: { type: "jpeg", quality: 0.95 },
        html2canvas: { scale: 2, backgroundColor: "#01173F", useCORS: true },
        jsPDF: { unit: "mm", format: "a4", orientation: "landscape" },
      })
      .from(element)
      .save();
  } finally {
    exporting.value = false;
    await nextTick();
  }
};
</script>

<template>
  <div class="bg-gt-card border border-white/5 rounded-[2rem] p-6 sm:p-8 min-h-full flex flex-col">
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
      <h2 class="text-2xl font-bold text-white flex items-center gap-2">
         <svg class="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
         Mon Emploi du temps
      </h2>

      <div class="flex items-center gap-3">
        <!-- Sélecteur de semaine -->
        <select v-model="selectedWeek"
          class="p-3 bg-gt-bg/60 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-gt-blue transition-all">
          <option v-for="week in weekOptions" :key="`${week.weekNumber}-${week.year}`"
            :value="{ weekNumber: week.weekNumber, year: week.year }">
            {{ week.label }}{{ week.isCurrent ? " (actuelle)" : "" }}
          </option>
        </select>

        <!-- Export PDF -->
        <button @click="exportPdf" :disabled="exporting"
          class="flex items-center gap-2 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm font-medium text-gray-300 hover:text-white hover:bg-white/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
          </svg>

          {{ exporting ? "Export..." : "Exporter PDF" }}
        </button>
      </div>
    </div>

    <!-- Erreur -->
    <p v-if="etudiantStore.error && !etudiantStore.loading"
      class="mb-4 text-sm font-medium text-red-400">
      ⚠️ {{ etudiantStore.error }}
    </p>

    <!-- Loading State -->
    <div v-if="etudiantStore.loading" class="flex-1 flex items-center justify-center">
      <div class="text-center">
        <div class="w-10 h-10 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto mb-3"></div>
        <p class="text-gray-400 text-sm">Chargement de l'emploi du temps...</p>
      </div>
    </div>

    <!-- Empty / Grid -->
    <template v-else>
      <div id="schedule-grid-export">
        <div v-if="etudiantStore.schedule.length === 0"
          class="flex-1 flex items-center justify-center py-16">
          <div class="text-center">
            <svg class="w-16 h-16 text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
            <h3 class="text-white font-semibold text-lg mb-1">Aucun cours planifié</h3>
            <p class="text-gray-400 text-sm">Votre emploi du temps sera affiché ici une fois publié par l'administration.</p>
          </div>
        </div>

        <ScheduleGrid v-else :slots="etudiantStore.schedule" />
      </div>
    </template>
  </div>
</template>
