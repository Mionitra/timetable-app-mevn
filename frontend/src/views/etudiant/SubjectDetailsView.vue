<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();

// Mock data (normally fetched from API using route.params.id)
const subject = ref({
  id: route.params.id,
  name: 'Algorithmique & Str. de données',
  code: 'INF302',
  credits: 6,
  teacher: 'Prof. Lemoine',
  teacherEmail: 'lemoine@universite.edu',
  color: 'purple',
  description: "Ce cours propose une étude approfondie des structures de données avancées (arbres, graphes, tables de hachage) et des algorithmes qui les manipulent. L'accent est mis sur l'analyse de complexité (temporelle et spatiale) pour concevoir des solutions logicielles optimales.",
  objectives: [
    'Comprendre et implémenter les structures de données non linéaires',
    'Maîtriser les algorithmes de parcours de graphes et de recherche',
    'Évaluer la complexité algorithmique (notation Grand O)',
    'Appliquer ces concepts à des problèmes concrets de développement'
  ],
  resources: [
    { id: 1, name: 'Support de cours Chapitre 1 & 2', type: 'pdf', size: '2.4 MB', date: '05 Oct' },
    { id: 2, name: 'Feuille de TD 1 - Complexité', type: 'doc', size: '150 KB', date: '08 Oct' },
    { id: 3, name: 'Sujet TP 1 - Arbres Binaires', type: 'code', size: '320 KB', date: '10 Oct' }
  ],
  nextClasses: [
    { id: 101, date: 'Demain', time: '10:15 - 12:15', type: 'TD', room: 'Salle TD1' },
    { id: 102, date: 'Vendredi', time: '08:00 - 10:00', type: 'TP', room: 'Salle Info 3' },
    { id: 103, date: 'Lundi prochain', time: '14:00 - 16:00', type: 'CM', room: 'Amphi A' }
  ]
});

const goBack = () => {
  router.push('/etudiant/subjects');
};
</script>

<template>
  <div class="max-w-5xl mx-auto space-y-6 pb-12">
    <!-- Back Button -->
    <button @click="goBack" class="inline-flex items-center text-sm font-medium text-gray-400 hover:text-white transition-colors bg-white/5 hover:bg-white/10 px-4 py-2 rounded-xl border border-white/5">
      <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
      Retour aux matières
    </button>

    <!-- Header Banner -->
    <div :class="`bg-${subject.color}-900/20 border border-${subject.color}-500/30`" class="rounded-3xl p-8 relative overflow-hidden shadow-2xl backdrop-blur-xl">
       <div :class="`bg-${subject.color}-500/20`" class="absolute -right-20 -top-20 w-64 h-64 rounded-full blur-3xl"></div>
       <div :class="`bg-${subject.color}-400/10`" class="absolute -left-10 -bottom-10 w-40 h-40 rounded-full blur-2xl"></div>
       
       <div class="relative z-10">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
             <div class="flex items-center gap-3">
                <span :class="`bg-${subject.color}-500 text-white`" class="px-3 py-1 rounded-lg text-sm font-bold tracking-widest shadow-lg">
                   {{ subject.code }}
                </span>
                <span class="text-sm font-medium text-gray-300 bg-white/5 px-3 py-1 rounded-lg border border-white/10">
                   {{ subject.credits }} Crédits ECTS
                </span>
             </div>
          </div>
          
          <h1 class="text-4xl font-extrabold text-white mb-6 leading-tight">{{ subject.name }}</h1>
          
          <div class="flex flex-col sm:flex-row sm:items-center gap-6 border-t border-white/5 pt-6">
             <div class="flex items-center gap-3">
                <div class="w-12 h-12 rounded-full bg-gt-bg border-2 border-white/10 flex items-center justify-center shrink-0">
                   <span class="text-lg font-bold text-gray-300">{{ subject.teacher.charAt(0) }}{{ subject.teacher.split(' ')[1]?.charAt(0) || '' }}</span>
                </div>
                <div>
                   <p class="text-xs uppercase tracking-wider text-gray-400 font-semibold mb-0.5">Enseignant</p>
                   <p class="text-base text-white font-medium">{{ subject.teacher }}</p>
                </div>
             </div>
             
             <div class="hidden sm:block w-px h-10 bg-white/10"></div>
             
             <div>
                 <p class="text-xs uppercase tracking-wider text-gray-400 font-semibold mb-0.5">Contact</p>
                 <a :href="`mailto:${subject.teacherEmail}`" class="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1.5 transition-colors">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                    {{ subject.teacherEmail }}
                 </a>
             </div>
          </div>
       </div>
    </div>

    <!-- Content Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
       <!-- Main Details -->
       <div class="lg:col-span-2 space-y-8">
          
          <!-- Description -->
          <div class="bg-gt-card border border-white/5 rounded-3xl p-6 shadow-lg">
             <h2 class="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                Description du cours
             </h2>
             <p class="text-gray-300 leading-relaxed">{{ subject.description }}</p>
          </div>
          
          <!-- Objectives -->
          <div class="bg-gt-card border border-white/5 rounded-3xl p-6 shadow-lg">
             <h2 class="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"></path></svg>
                Objectifs pédagogiques
             </h2>
             <ul class="space-y-3">
                <li v-for="(obj, i) in subject.objectives" :key="i" class="flex items-start gap-3">
                   <div class="mt-1 w-5 h-5 rounded-full bg-blue-500/20 flex items-center justify-center shrink-0 border border-blue-500/30">
                      <div class="w-2 h-2 rounded-full bg-blue-400"></div>
                   </div>
                   <span class="text-gray-300">{{ obj }}</span>
                </li>
             </ul>
          </div>
          
          <!-- Resources -->
          <div class="bg-gt-card border border-white/5 rounded-3xl p-6 shadow-lg">
             <div class="flex items-center justify-between mb-6">
                <h2 class="text-xl font-bold text-white flex items-center gap-2">
                   <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
                   Ressources du cours
                </h2>
                <span class="text-sm text-gray-500">{{ subject.resources.length }} fichiers</span>
             </div>
             
             <div class="space-y-3">
                <div v-for="res in subject.resources" :key="res.id" class="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors group cursor-pointer">
                   <div class="flex items-center gap-4">
                      <div class="p-2 rounded-lg bg-gt-bg border border-white/5">
                         <svg v-if="res.type === 'pdf'" class="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path></svg>
                         <svg v-else-if="res.type === 'doc'" class="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                         <svg v-else class="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"></path></svg>
                      </div>
                      <div>
                         <h4 class="text-gray-200 font-medium group-hover:text-white transition-colors">{{ res.name }}</h4>
                         <p class="text-xs text-gray-500 mt-0.5">Ajouté le {{ res.date }} &bull; {{ res.size }}</p>
                      </div>
                   </div>
                   <button class="p-2 text-gray-400 hover:text-white bg-white/5 hover:bg-blue-600 rounded-lg transition-colors border border-transparent hover:border-blue-500">
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                   </button>
                </div>
             </div>
          </div>
       </div>
       
       <!-- Sidebar Widgets -->
       <div class="space-y-8">
          <!-- Next Classes Widget -->
          <div class="bg-gt-card border border-white/5 rounded-3xl p-6 shadow-lg">
             <h2 class="text-lg font-bold text-white mb-5 flex items-center gap-2">
                <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                Prochaines séances
             </h2>
             
             <div class="space-y-4">
                <RouterLink :to="`/etudiant/course/${cls.id}`" v-for="cls in subject.nextClasses" :key="cls.id" class="block p-4 rounded-xl bg-white/5 border border-white/10 hover:border-blue-500/50 transition-colors group">
                   <div class="flex justify-between items-start mb-2">
                      <span class="text-sm font-semibold text-white group-hover:text-blue-400 transition-colors">{{ cls.date }}</span>
                      <span :class="{'bg-blue-500/20 text-blue-400': cls.type === 'CM', 'bg-purple-500/20 text-purple-400': cls.type === 'TD', 'bg-green-500/20 text-green-400': cls.type === 'TP'}" class="px-2 py-0.5 text-xs font-bold rounded border border-transparent">
                         {{ cls.type }}
                      </span>
                   </div>
                   <div class="flex items-center gap-3 text-sm text-gray-400">
                      <span class="flex items-center gap-1">
                         <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                         {{ cls.time }}
                      </span>
                      <span class="flex items-center gap-1">
                         <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                         {{ cls.room }}
                      </span>
                   </div>
                </RouterLink>
             </div>
             
             <RouterLink to="/etudiant/schedule" class="block w-full text-center mt-4 text-sm font-medium text-blue-400 hover:text-blue-300 transition-colors">
                Voir l'emploi du temps complet &rarr;
             </RouterLink>
          </div>
       </div>
    </div>
  </div>
</template>
