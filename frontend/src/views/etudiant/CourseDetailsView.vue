<script setup>
import { ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();

const course = ref({
   id: route.params.id,
   subjectId: 2,
   subject: 'Algorithmique & Str. de données',
   type: 'TD',
   date: 'Mardi, 15 Octobre 2023',
   time: '10:15 - 12:15',
   room: 'Salle TD1',
   building: 'Bâtiment B - 1er Étage',
   teacher: 'Prof. Lemoine',
   color: 'purple',
   status: 'upcoming', // 'completed', 'ongoing', 'upcoming', 'cancelled'
   description: 'Séance de travaux dirigés portant sur les arbres binaires de recherche (ABR). Exercices pratiques d\'insertion, de suppression et de parcours (préfixe, infixe, suffixe).',
   materials: [
      { id: 1, name: 'Feuille TD 1.pdf', size: '150 KB' },
      { id: 2, name: 'Correction_Exo1.pdf', size: '80 KB' }
   ]
});

const goBack = () => {
   router.back();
};
</script>

<template>
   <div class="max-w-4xl pb-12 mx-auto space-y-6">
      <!-- Back Button -->
      <button @click="goBack"
         class="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-400 transition-colors border border-white/5 hover:text-white bg-white/5 hover:bg-white/10 rounded-xl backdrop-blur-sm">
         <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18">
            </path>
         </svg>
         Retour
      </button>

      <!-- Header Card -->
      <div :class="`bg-${course.color}-900/10 border border-${course.color}-500/20`"
         class="relative p-6 overflow-hidden shadow-xl rounded-3xl sm:p-8 backdrop-blur-md">
         <div :class="`bg-${course.color}-500/10`"
            class="absolute top-0 right-0 w-64 h-64 transform translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl">
         </div>

         <div class="relative z-10">
            <div class="flex flex-col justify-between gap-4 mb-6 sm:flex-row sm:items-start">
               <div>
                  <div class="flex items-center gap-3 mb-3">
                     <span :class="`bg-${course.color}-500/20 text-${course.color}-400 border-${course.color}-500/30`"
                        class="px-3 py-1 text-xs font-bold tracking-widest border rounded-lg">
                        {{ course.type }}
                     </span>
                     <span v-if="course.status === 'upcoming'"
                        class="px-3 py-1 rounded-lg text-xs font-bold tracking-widest border bg-blue-500/20 text-blue-400 border-blue-500/30 flex items-center gap-1.5">
                        <span class="w-2 h-2 bg-blue-500 rounded-full"></span> À venir
                     </span>
                     <span v-else-if="course.status === 'ongoing'"
                        class="px-3 py-1 rounded-lg text-xs font-bold tracking-widest border bg-green-500/20 text-green-400 border-green-500/30 flex items-center gap-1.5 animate-pulse">
                        <span class="w-2 h-2 bg-green-500 rounded-full"></span> En cours
                     </span>
                  </div>
                  <h1 class="mb-2 text-3xl font-bold text-white">{{ course.subject }}</h1>
                  <RouterLink :to="`/etudiant/subjects/${course.subjectId}`"
                     class="inline-flex items-center gap-1 text-sm text-blue-400 transition-colors hover:text-blue-300">
                     Voir la page de la matière
                     <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                           d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
                     </svg>
                  </RouterLink>
               </div>

               <!-- Time Display -->
               <div class="bg-gt-bg rounded-2xl p-4 border border-white/5 text-center min-w-[160px] shrink-0">
                  <p class="mb-1 text-xs font-semibold tracking-wider text-gray-500 uppercase">{{ course.date }}</p>
                  <p class="text-xl font-bold text-white">{{ course.time }}</p>
               </div>
            </div>
         </div>
      </div>

      <!-- Info Grid -->
      <div class="grid grid-cols-1 gap-6 md:grid-cols-2">
         <!-- Location & Details -->
         <div class="p-6 space-y-6 border border-white/5 shadow-lg bg-gt-card rounded-[2rem]">
            <div class="flex items-start gap-4">
               <div class="p-3 text-gray-400 bg-gt-bg border border-white/5 rounded-xl shrink-0">
                  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                     <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                  </svg>
               </div>
               <div>
                  <h3 class="text-lg font-medium text-white">{{ course.room }}</h3>
                  <p class="text-sm text-gray-400">{{ course.building }}</p>
                  <button class="mt-2 text-xs font-medium text-blue-400 hover:text-blue-300">Voir sur la carte</button>
               </div>
            </div>

            <div class="h-px bg-white/5"></div>

            <div class="flex items-start gap-4">
               <div class="p-3 text-gray-400 bg-gt-bg border border-white/5 rounded-xl shrink-0">
                  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                  </svg>
               </div>
               <div>
                  <p class="text-xs uppercase tracking-wider text-gray-500 font-semibold mb-0.5">Enseignant</p>
                  <h3 class="font-medium text-white">{{ course.teacher }}</h3>
               </div>
            </div>
         </div>

         <!-- Description & Materials -->
         <div class="space-y-6">
            <div class="p-6 border border-white/5 shadow-lg bg-gt-card rounded-[2rem]">
               <h3 class="mb-3 text-lg font-bold text-white">Programme de la séance</h3>
               <p class="text-sm leading-relaxed text-gray-300">{{ course.description }}</p>
            </div>

            <div v-if="course.materials && course.materials.length > 0"
               class="p-6 border border-white/5 shadow-lg bg-gt-card rounded-[2rem]">
               <h3 class="flex items-center gap-2 mb-4 text-lg font-bold text-white">
                  <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13">
                     </path>
                  </svg>
                  Documents liés
               </h3>
               <ul class="space-y-2">
                  <li v-for="doc in course.materials" :key="doc.id"
                     class="flex items-center justify-between p-3 transition-colors border rounded-xl cursor-pointer bg-white/5 hover:bg-white/10 border-white/5 group">
                     <div class="flex items-center gap-3">
                        <svg class="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                           <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                              d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z">
                           </path>
                        </svg>
                        <span class="text-sm font-medium text-gray-300 group-hover:text-white">{{ doc.name }}</span>
                     </div>
                     <span class="text-xs text-gray-500">{{ doc.size }}</span>
                  </li>
               </ul>
            </div>
         </div>
      </div>
   </div>
</template>