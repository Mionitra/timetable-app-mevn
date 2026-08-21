<script setup>
import { ref, computed, onMounted } from 'vue';
import { useEtudiantStore } from '../../stores/etudiant';

const etudiantStore = useEtudiantStore();

onMounted(() => {
  etudiantStore.fetchSchedule();
});

const schedule = computed(() => etudiantStore.schedule);

const days = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi'];
const hours = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'];

const colorMap = {
  CM: 'bg-blue-600/20 border-blue-500/30 text-blue-100 shadow-[0_0_15px_rgba(37,99,235,0.2)]',
  TD: 'bg-purple-600/20 border-purple-500/30 text-purple-100',
  TP: 'bg-white/5 border-white/10 text-gray-200',
  EXAMEN: 'bg-red-600/20 border-red-500/30 text-red-100',
};

// Map dayOfWeek (0=Dimanche in JS) to index in our grid (0=Lundi)
// We store dayOfWeek as 0=Lundi...4=Vendredi in controller
const getStyle = (cls) => {
  const startParts = cls.startTime.split(':');
  const startHour = parseInt(startParts[0]) + parseInt(startParts[1]) / 60;
  const endParts = cls.endTime.split(':');
  const endHour = parseInt(endParts[0]) + parseInt(endParts[1]) / 60;
  const duration = endHour - startHour;
  const top = (startHour - 8) * 4;
  const height = duration * 4;
  return `top: ${top}rem; height: ${height}rem;`;
};

const getColor = (cls) => colorMap[cls.type] || 'bg-white/5 border-white/10 text-gray-200';

const getCoursesForDay = (dayIndex) => {
  return schedule.value.filter(c => c.dayOfWeek === dayIndex + 1);
};
</script>

<template>
  <div class="bg-white/5 border border-white/5 rounded-[2rem] p-6 sm:p-8 min-h-full flex flex-col">
    <div class="flex flex-col justify-between gap-4 mb-6 sm:flex-row sm:items-center">
      <h2 class="flex items-center gap-2 text-2xl font-bold text-white">
         <svg class="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
         Mon Emploi du temps
      </h2>
      <div class="flex items-center gap-2 p-1 border rounded-full bg-white/5 border-white/10">
        <button class="px-4 py-2 bg-gt-blue text-sm font-medium text-white rounded-full shadow-[0_0_15px_rgba(37,99,235,0.4)]">Semaine Actuelle</button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="etudiantStore.loading" class="flex items-center justify-center flex-1">
      <div class="text-center">
        <div class="w-10 h-10 mx-auto mb-3 border-4 rounded-full border-blue-500/30 border-t-blue-500 animate-spin"></div>
        <p class="text-sm text-gray-400">Chargement de l'emploi du temps...</p>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else-if="schedule.length === 0" class="flex items-center justify-center flex-1">
      <div class="text-center">
        <svg class="w-16 h-16 mx-auto mb-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
        <h3 class="mb-1 text-lg font-semibold text-white">Aucun cours planifié</h3>
        <p class="text-sm text-gray-400">Votre emploi du temps sera affiché ici une fois vos cours ajoutés.</p>
      </div>
    </div>

    <!-- Calendar Grid -->
    <div v-else class="flex-1 mt-2 overflow-x-auto border rounded-3xl border-white/5 bg-gt-bg/50">
      <div class="min-w-[900px]">
        <!-- Header Row (Days) -->
        <div class="grid grid-cols-[60px_1fr_1fr_1fr_1fr_1fr] bg-white/5 border-b border-white/5 sticky top-0 z-20">
          <div class="flex items-center justify-center p-3 border-r border-white/5">
             <svg class="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          </div>
          <div v-for="(day, index) in days" :key="day" class="p-3 text-center border-r border-white/5 last:border-r-0">
             <div class="text-sm font-bold text-white">{{ day }}</div>
          </div>
        </div>

        <!-- Body -->
        <div class="grid grid-cols-[60px_1fr_1fr_1fr_1fr_1fr] relative h-[40rem]">
          <!-- Time Column -->
          <div class="border-r border-gray-700/50 bg-gray-800/20">
            <div v-for="hour in hours" :key="hour" class="relative h-16 p-2 text-xs font-medium text-right text-gray-500 border-b border-gray-700/30">
               <span class="relative -top-3">{{ hour }}</span>
            </div>
          </div>

          <!-- Day Columns -->
          <div v-for="(day, dayIndex) in days" :key="dayIndex" class="relative border-r border-gray-700/30 last:border-r-0 group">
            <div class="absolute inset-0 transition-colors bg-transparent pointer-events-none group-hover:bg-white/5"></div>
            <div v-for="hour in hours" :key="'grid-'+hour" class="h-16 border-b border-white/5"></div>
            
            <!-- Courses from API -->
            <RouterLink
              v-for="cls in getCoursesForDay(dayIndex)"
              :key="cls.id"
              :to="`/etudiant/course/${cls.id}`"
              class="absolute w-[calc(100%-12px)] left-[6px] rounded-xl border p-3 flex flex-col shadow-sm transition-all duration-200 hover:shadow-lg hover:scale-[1.02] hover:z-10 cursor-pointer overflow-hidden block"
              :class="getColor(cls)"
              :style="getStyle(cls)"
            >
              <div class="flex items-start justify-between gap-1 mb-2">
                <span class="text-[10px] font-bold uppercase tracking-wider bg-black/25 px-1.5 py-0.5 rounded backdrop-blur-sm">{{ cls.type }}</span>
                <span class="text-[10px] font-semibold opacity-75 whitespace-nowrap bg-black/20 px-1.5 py-0.5 rounded-full">{{ cls.startTime }} - {{ cls.endTime }}</span>
              </div>
              <h4 class="mb-1 text-sm font-bold leading-tight">{{ cls.subject?.name || 'Cours' }}</h4>
              <p class="text-xs flex items-center gap-1.5 opacity-80 mt-auto">
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                {{ cls.room || 'Salle non définie' }}
              </p>
            </RouterLink>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>