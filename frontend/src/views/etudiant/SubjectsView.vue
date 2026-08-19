<script setup>
import { ref, computed } from 'vue';

const searchQuery = ref('');

const subjects = ref([
   { id: 1, name: 'Base de données', code: 'INF301', credits: 4, teacher: 'Dr. Dubois', color: 'blue' },
   { id: 2, name: 'Algorithmique & Str. de données', code: 'INF302', credits: 6, teacher: 'Prof. Lemoine', color: 'purple' },
   { id: 3, name: 'Développement Web Avancé', code: 'INF303', credits: 5, teacher: 'Dr. Martin', color: 'emerald' },
   { id: 4, name: 'Réseaux Informatiques', code: 'INF304', credits: 4, teacher: 'Prof. Bernard', color: 'amber' },
   { id: 5, name: 'Anglais Technique', code: 'LAN301', credits: 2, teacher: 'Mme. Smith', color: 'rose' },
   { id: 6, name: 'Mathématiques Appliquées', code: 'MAT301', credits: 5, teacher: 'Dr. Lefebvre', color: 'indigo' },
]);

const filteredSubjects = computed(() => {
   if (!searchQuery.value) return subjects.value;
   const q = searchQuery.value.toLowerCase();
   return subjects.value.filter(s =>
      s.name.toLowerCase().includes(q) ||
      s.code.toLowerCase().includes(q) ||
      s.teacher.toLowerCase().includes(q)
   );
});

const totalCredits = computed(() => subjects.value.reduce((acc, curr) => acc + curr.credits, 0));
</script>

<template>
   <div class="space-y-6">
      <div
         class="flex flex-col justify-between gap-4 p-6 border border-white/5 shadow-lg sm:flex-row sm:items-center bg-gt-card rounded-[2rem]">
         <div class="flex items-center gap-4">
            <div class="p-3 border bg-blue-500/10 rounded-xl border-blue-500/20">
               <svg class="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                     d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253">
                  </path>
               </svg>
            </div>
            <div>
               <h2 class="text-2xl font-bold text-white">Mes Matières</h2>
               <p class="text-sm text-gray-400 mt-0.5">Semestre en cours &bull; {{ subjects.length }} matières &bull; {{
                  totalCredits }} crédits</p>
            </div>
         </div>
         <div class="flex items-center gap-3">
            <div
               class="bg-gt-bg flex items-center px-4 py-2.5 rounded-full border border-white/5 w-full sm:w-auto shadow-inner focus-within:border-blue-500/50 focus-within:ring-1 focus-within:ring-blue-500/50 transition-all">
               <svg class="w-4 h-4 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                     d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
               </svg>
               <input v-model="searchQuery" type="text" placeholder="Rechercher une matière..."
                  class="w-full text-sm text-white placeholder-gray-500 bg-transparent border-none outline-none sm:w-56" />
            </div>
         </div>
      </div>

      <!-- Subjects Grid -->
      <div v-if="filteredSubjects.length > 0" class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      <RouterLink :to="`/etudiant/subjects/${subject.id}`" v-for="subject in filteredSubjects" :key="subject.id"
         class="group block relative overflow-hidden rounded-[2rem] border border-white/5 bg-gt-card hover:-translate-y-1 transition-transform duration-300">
         
         <div class="absolute bottom-0 left-1/2 -translate-x-1/2 w-[80%] h-24 bg-gt-blue/0 group-hover:bg-gt-blue/30 blur-[40px] pointer-events-none transition-colors duration-500"></div>

         <div class="relative h-full p-6 flex flex-col z-10">

               <div class="relative z-10 flex flex-col h-full">
                  <div class="flex items-start justify-between mb-5">
                     <span
                        :class="`text-${subject.color}-400 bg-${subject.color}-500/10 border-${subject.color}-500/20`"
                        class="px-3 py-1.5 rounded-lg text-xs font-bold tracking-wider border shadow-sm">
                        {{ subject.code }}
                     </span>
                     <span
                        class="text-xs font-medium text-gray-300 bg-white/5 px-2.5 py-1 rounded-md border border-white/10 flex items-center gap-1.5 shadow-sm">
                        <svg class="w-3.5 h-3.5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                           <path
                              d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z">
                           </path>
                        </svg>
                        {{ subject.credits }} Crédits
                     </span>
                  </div>

                  <h3
                     class="mb-3 text-xl font-bold leading-tight text-white transition-colors group-hover:text-blue-400">
                     {{ subject.name }}</h3>

                  <div class="flex items-center gap-4 pt-6 mt-auto border-t border-white/5">
                     <div
                        class="flex items-center justify-center w-10 h-10 border border-white/10 rounded-full shadow-inner bg-gt-bg shrink-0">
                        <span class="text-sm font-bold text-gray-300">{{ subject.teacher.charAt(0) }}{{
                           subject.teacher.split(' ')[1]?.charAt(0) || '' }}</span>
                     </div>
                     <div>
                        <p class="text-[10px] uppercase tracking-wider text-gray-500 font-semibold mb-0.5">Enseignant
                           responsable</p>
                        <p class="text-sm font-medium text-gray-200">{{ subject.teacher }}</p>
                     </div>
                  </div>
               </div>
            </div>
         </RouterLink>
      </div>

      <div v-else class="p-12 text-center border border-white/5 bg-gt-card rounded-[2rem]">
         <div class="inline-flex items-center justify-center w-16 h-16 mb-4 bg-white/5 rounded-full">
            <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
               <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
         </div>
         <h3 class="mb-2 text-xl font-medium text-white">Aucun résultat</h3>
         <p class="text-gray-400">Aucune matière ne correspond à votre recherche "{{ searchQuery }}".</p>
         <button @click="searchQuery = ''"
            class="px-4 py-2 mt-4 text-sm font-medium text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700">Réinitialiser
            la recherche</button>
      </div>
   </div>
</template>