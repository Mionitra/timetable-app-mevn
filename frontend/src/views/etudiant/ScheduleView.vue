<script setup>
import { ref } from 'vue';

const days = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi'];
const hours = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'];

const schedule = ref([
  { id: 1, day: 0, startHour: 8, duration: 2, subject: 'Base de données', room: 'Amphi A', type: 'CM', color: 'bg-blue-600/20 border-blue-500/30 text-blue-100' },
  { id: 2, day: 0, startHour: 10.25, duration: 2, subject: 'Algorithmique', room: 'Salle TD1', type: 'TD', color: 'bg-blue-600/20 border-blue-500/30 text-blue-100 shadow-[0_0_15px_rgba(37,99,235,0.2)]' },
  { id: 3, day: 0, startHour: 14, duration: 2, subject: 'Développement Web Avancé', room: 'Salle B204', type: 'TP', color: 'bg-white/5 border-white/10 text-gray-200' },
  { id: 4, day: 1, startHour: 9, duration: 3, subject: 'Réseaux', room: 'Amphi B', type: 'CM', color: 'bg-white/5 border-white/10 text-gray-200' },
  { id: 5, day: 2, startHour: 8, duration: 4, subject: 'Projet tuteuré', room: 'Salle Info', type: 'TP', color: 'bg-white/5 border-white/10 text-gray-200' },
  { id: 6, day: 3, startHour: 13, duration: 2, subject: 'Anglais', room: 'Salle Langue', type: 'TD', color: 'bg-white/5 border-white/10 text-gray-200' },
  { id: 7, day: 4, startHour: 10, duration: 2, subject: 'Mathématiques', room: 'Amphi C', type: 'CM', color: 'bg-blue-600/20 border-blue-500/30 text-blue-100' },
]);

const getStyle = (cls) => {
  const top = (cls.startHour - 8) * 4; // 4rem per hour (h-16)
  const height = cls.duration * 4;
  return `top: ${top}rem; height: ${height}rem;`;
};

const formatTime = (decimalTime) => {
  const hours = Math.floor(decimalTime);
  const minutes = Math.round((decimalTime - hours) * 60);
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
};
</script>

<template>
  <div class="bg-gt-card border border-white/5 rounded-[2rem] p-6 sm:p-8 min-h-full flex flex-col">
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
      <h2 class="text-2xl font-bold text-white flex items-center gap-2">
         <svg class="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
         Mon Emploi du temps
      </h2>
      <div class="flex items-center gap-2 bg-white/5 p-1 rounded-full border border-white/10">
        <button class="p-2 bg-transparent hover:bg-white/10 text-gray-300 rounded-full transition-colors">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path></svg>
        </button>
        <button class="px-4 py-2 bg-gt-blue text-sm font-medium text-white rounded-full transition-colors shadow-[0_0_15px_rgba(37,99,235,0.4)]">Semaine Actuelle</button>
        <button class="p-2 bg-transparent hover:bg-white/10 text-gray-300 rounded-full transition-colors">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>
        </button>
      </div>
    </div>

    <!-- Calendar Grid -->
    <div class="flex-1 overflow-x-auto rounded-3xl border border-white/5 bg-gt-bg/50 mt-2">
      <div class="min-w-[900px]">
        
        <!-- Header Row (Days) -->
        <div class="grid grid-cols-[60px_1fr_1fr_1fr_1fr_1fr] bg-gt-card border-b border-white/5 sticky top-0 z-20">
          <div class="p-3 flex items-center justify-center border-r border-white/5">
             <svg class="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          </div>
          <div v-for="(day, index) in days" :key="day" class="p-3 text-center border-r border-white/5 last:border-r-0">
             <div class="text-sm font-bold text-white">{{ day }}</div>
             <div class="text-xs text-gray-500 font-medium">{{ index + 14 }} Oct</div>
          </div>
        </div>

        <!-- Body -->
        <div class="grid grid-cols-[60px_1fr_1fr_1fr_1fr_1fr] relative h-[40rem]">
          <!-- Time Column -->
          <div class="border-r border-gray-700/50 bg-gray-800/20">
            <div v-for="hour in hours" :key="hour" class="h-16 border-b border-gray-700/30 text-xs text-gray-500 font-medium p-2 text-right relative">
               <span class="relative -top-3">{{ hour }}</span>
            </div>
          </div>

          <!-- Day Columns -->
          <div v-for="(day, dayIndex) in days" :key="dayIndex" class="border-r border-gray-700/30 last:border-r-0 relative group">
            <!-- Background Highlight on Hover -->
            <div class="absolute inset-0 bg-transparent group-hover:bg-white/5 transition-colors pointer-events-none"></div>

            <!-- Grid Lines -->
            <div v-for="hour in hours" :key="'grid-'+hour" class="h-16 border-b border-white/5"></div>
            
            <!-- Classes -->
            <RouterLink v-for="cls in schedule.filter(c => c.day === dayIndex)" :key="cls.id" :to="`/etudiant/course/${cls.id}`"
                 class="absolute w-[calc(100%-12px)] left-[6px] rounded-xl border p-3 flex flex-col shadow-sm transition-all duration-200 hover:shadow-lg hover:scale-[1.02] hover:z-10 cursor-pointer overflow-hidden group/card block"
                 :class="cls.color"
                 :style="getStyle(cls)">
              <div class="flex items-start justify-between gap-1 mb-2">
                <span class="text-[10px] font-bold uppercase tracking-wider bg-black/25 px-1.5 py-0.5 rounded backdrop-blur-sm">{{ cls.type }}</span>
                <span class="text-[10px] font-semibold opacity-75 whitespace-nowrap bg-black/20 px-1.5 py-0.5 rounded-full">{{ formatTime(cls.startHour) }} - {{ formatTime(cls.startHour + cls.duration) }}</span>
              </div>
              <h4 class="font-bold text-sm leading-tight mb-1 group-hover/card:text-white transition-colors">{{ cls.subject }}</h4>
              <p class="text-xs flex items-center gap-1.5 opacity-80 mt-auto">
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                {{ cls.room }}
              </p>
            </RouterLink>
          </div>
          
        </div>
      </div>
    </div>
  </div>
</template>