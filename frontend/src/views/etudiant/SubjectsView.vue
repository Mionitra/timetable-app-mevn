<script setup>
import { ref, computed, onMounted } from 'vue';
import { useEtudiantStore } from '../../stores/etudiant';

const etudiantStore = useEtudiantStore();
const searchQuery = ref('');

onMounted(() => {
  etudiantStore.fetchSubjects();
});

const subjects = computed(() => etudiantStore.subjects);

const filteredSubjects = computed(() => {
  if (!searchQuery.value) return subjects.value;
  const q = searchQuery.value.toLowerCase();
  return subjects.value.filter(s =>
    s.name?.toLowerCase().includes(q) ||
    s.code?.toLowerCase().includes(q) ||
    s.teacher?.firstName?.toLowerCase().includes(q) ||
    s.teacher?.lastName?.toLowerCase().includes(q)
  );
});

const totalCredits = computed(() =>
  subjects.value.reduce((acc, curr) => acc + (curr.credits || 0), 0)
);

const colorList = ['blue', 'purple', 'emerald', 'amber', 'rose', 'indigo'];
const getColor = (index) => colorList[index % colorList.length];

const getTeacherName = (teacher) => {
  if (!teacher) return 'Non assigné';
  return `${teacher.firstName || ''} ${teacher.lastName || ''}`.trim();
};

const getTeacherInitials = (teacher) => {
  if (!teacher) return '?';
  const first = teacher.firstName?.charAt(0) || '';
  const last = teacher.lastName?.charAt(0) || '';
  return `${first}${last}` || '?';
};
</script>

<template>
   <div class="space-y-6">
      <div class="flex flex-col justify-between gap-4 p-6 border border-white/5 shadow-lg sm:flex-row sm:items-center bg-white/5 rounded-[2rem]">
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
               <p class="text-sm text-gray-400 mt-0.5">
                 Semestre en cours &bull; {{ subjects.length }} matières &bull; {{ totalCredits }} crédits
               </p>
            </div>
         </div>
         <div class="flex items-center gap-3">
            <div class="bg-gt-bg flex items-center px-4 py-2.5 rounded-full border border-white/5 w-full sm:w-auto shadow-inner focus-within:border-blue-500/50 focus-within:ring-1 focus-within:ring-blue-500/50 transition-all">
               <svg class="w-4 h-4 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
               </svg>
               <input v-model="searchQuery" type="text" placeholder="Rechercher une matière..."
                  class="w-full text-sm text-white placeholder-gray-500 bg-transparent border-none outline-none sm:w-56" />
            </div>
         </div>
      </div>

      <!-- Loading State -->
      <div v-if="etudiantStore.loading" class="flex items-center justify-center py-20">
        <div class="text-center">
          <div class="w-10 h-10 mx-auto mb-3 border-4 rounded-full border-blue-500/30 border-t-blue-500 animate-spin"></div>
          <p class="text-sm text-gray-400">Chargement des matières...</p>
        </div>
      </div>

      <!-- Subjects Grid -->
      <div v-else-if="filteredSubjects.length > 0" class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        <RouterLink
          :to="`/etudiant/subjects/${subject._id}`"
          v-for="(subject, index) in filteredSubjects"
          :key="subject._id"
          class="group block relative overflow-hidden rounded-[2rem] border border-white/5 bg-white/5 hover:-translate-y-1 transition-transform duration-300"
        >
          <div class="absolute bottom-0 left-1/2 -translate-x-1/2 w-[80%] h-24 bg-gt-blue/0 group-hover:bg-gt-blue/30 blur-[40px] pointer-events-none transition-colors duration-500"></div>

          <div class="relative z-10 flex flex-col h-full p-6">
            <div class="relative z-10 flex flex-col h-full">
               <div class="flex items-start justify-between mb-5">
                  <span
                     :class="`text-${getColor(index)}-400 bg-${getColor(index)}-500/10 border-${getColor(index)}-500/20`"
                     class="px-3 py-1.5 rounded-lg text-xs font-bold tracking-wider border shadow-sm"
                  >
                     {{ subject.code }}
                  </span>
                  <span class="text-xs font-medium text-gray-300 bg-white/5 px-2.5 py-1 rounded-md border border-white/10 flex items-center gap-1.5 shadow-sm">
                     <svg class="w-3.5 h-3.5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                     </svg>
                     {{ subject.credits }} Crédits
                  </span>
               </div>

               <h3 class="mb-3 text-xl font-bold leading-tight text-white transition-colors group-hover:text-blue-400">
                  {{ subject.name }}
               </h3>

               <div class="flex items-center gap-4 pt-6 mt-auto border-t border-white/5">
                  <div class="flex items-center justify-center w-10 h-10 border rounded-full shadow-inner border-white/10 bg-gt-bg shrink-0">
                     <span class="text-sm font-bold text-gray-300">{{ getTeacherInitials(subject.teacher) }}</span>
                  </div>
                  <div>
                     <p class="text-[10px] uppercase tracking-wider text-gray-500 font-semibold mb-0.5">Enseignant responsable</p>
                     <p class="text-sm font-medium text-gray-200">{{ getTeacherName(subject.teacher) }}</p>
                  </div>
               </div>
            </div>
          </div>
        </RouterLink>
      </div>

      <!-- Empty State -->
      <div v-else-if="!etudiantStore.loading" class="p-12 text-center border border-white/5 bg-white/5 rounded-[2rem]">
         <div class="inline-flex items-center justify-center w-16 h-16 mb-4 rounded-full bg-white/5">
            <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
               <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
         </div>
         <h3 class="mb-2 text-xl font-medium text-white">
           {{ searchQuery ? 'Aucun résultat' : 'Aucune matière inscrite' }}
         </h3>
         <p class="text-gray-400">
           {{ searchQuery ? `Aucune matière ne correspond à "${searchQuery}".` : 'Vos matières apparaîtront ici une fois que vous serez inscrit(e).' }}
         </p>
         <button v-if="searchQuery" @click="searchQuery = ''" class="px-4 py-2 mt-4 text-sm font-medium text-white transition-colors bg-primary hover:opacity-90">
           Réinitialiser la recherche
         </button>
      </div>
   </div>
</template>