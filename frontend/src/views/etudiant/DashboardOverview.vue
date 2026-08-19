<script setup>
import { onMounted, computed } from 'vue';
import { useEtudiantStore } from '../../stores/etudiant';

const etudiantStore = useEtudiantStore();

onMounted(() => {
  etudiantStore.fetchDashboard();
});

const nextClass = computed(() => etudiantStore.dashboard.nextClass);
const todayClasses = computed(() => etudiantStore.dashboard.todayClasses);
const stats = computed(() => etudiantStore.dashboard.stats);
</script>

<template>
  <div class="space-y-8">
    
    <!-- Hero Section -->
    <div>
      <h1 class="text-4xl sm:text-5xl font-semibold text-white tracking-tight mb-3">Make Things Simple !</h1>
      <p class="text-gray-400 text-sm max-w-lg mb-6">Management and planning in a simple and attractive style will bring you success</p>
      
      <!-- Filters -->
      <div class="flex items-center gap-3">
        <button class="px-4 py-2 rounded-full bg-gt-card border border-white/5 text-sm font-medium text-gray-300 flex items-center gap-2 hover:bg-white/5 transition-colors">
          <span class="w-2 h-2 rounded-full bg-green-500"></span> To do <svg class="w-3 h-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
        </button>
        <button class="px-4 py-2 rounded-full bg-gt-card border border-white/5 text-sm font-medium text-gray-300 flex items-center gap-2 hover:bg-white/5 transition-colors">
          Work <svg class="w-3 h-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
        </button>
        <button class="px-4 py-2 rounded-full bg-gt-card border border-white/5 text-sm font-medium text-gray-300 flex items-center gap-2 hover:bg-white/5 transition-colors">
          High priority <svg class="w-3 h-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
        </button>
        <button class="p-2 rounded-full bg-gt-card border border-white/5 text-gray-400 hover:text-white transition-colors">
           <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"></path></svg>
        </button>
        
        <button class="ml-auto px-6 py-2.5 bg-transparent border border-white/10 rounded-full text-sm font-medium text-blue-400 shadow-[inset_0_0_20px_rgba(37,99,235,0.3)] hover:bg-blue-600/10 transition-colors">
          New task
        </button>
      </div>
    </div>

    <!-- Grid Layout -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      <!-- Left Column (Tasks/Meetings) -->
      <div class="lg:col-span-2 space-y-4">
         <!-- Regular Task Card 1 -->
         <div v-if="todayClasses.length > 0" class="bg-gt-card border border-white/5 rounded-3xl p-6">
            <div class="flex items-center gap-2 mb-2">
               <span class="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_#22c55e]"></span>
               <span class="text-xs font-semibold text-green-500 uppercase tracking-wider">Today</span>
            </div>
            
            <div class="flex justify-between items-start mb-2">
               <h3 class="text-lg font-bold text-white">{{ todayClasses[0].subject?.name || todayClasses[0].subject }}</h3>
               <div class="flex items-center gap-2">
                  <button class="p-1.5 rounded-full bg-white/5 text-gray-400 hover:text-white"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path></svg></button>
                  <button class="p-1.5 rounded-full bg-white/5 text-gray-400 hover:text-white"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z"></path></svg></button>
               </div>
            </div>
            <p class="text-sm text-gray-400 mb-6">Description : {{ todayClasses[0].description }}</p>
            
            <div class="flex justify-between items-end">
               <div class="flex items-center gap-2 text-sm text-gray-400 font-medium">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                  {{ todayClasses[0].startTime }} - {{ todayClasses[0].endTime }}
               </div>
               <div class="flex items-center gap-2">
                  <div class="flex -space-x-2">
                    <img class="w-7 h-7 rounded-full border-2 border-gt-card" src="https://i.pravatar.cc/100?img=4" alt="">
                    <img class="w-7 h-7 rounded-full border-2 border-gt-card" src="https://i.pravatar.cc/100?img=5" alt="">
                    <img class="w-7 h-7 rounded-full border-2 border-gt-card" src="https://i.pravatar.cc/100?img=6" alt="">
                  </div>
                  <span class="text-xs text-gray-500 font-medium">+4 People</span>
               </div>
            </div>
         </div>

         <!-- Highlighted Glowing Task Card -->
         <div v-if="nextClass" class="relative bg-gt-card border border-white/5 rounded-3xl p-6 overflow-hidden">
            <!-- Glow background -->
            <div class="absolute bottom-0 left-1/2 -translate-x-1/2 w-[80%] h-24 bg-gt-blue/40 blur-[40px] pointer-events-none"></div>
            
            <div class="relative z-10">
               <div class="flex items-center gap-2 mb-4">
                  <span class="w-2 h-2 rounded-full bg-blue-400 shadow-[0_0_8px_#60a5fa]"></span>
                  <span class="text-xs font-semibold text-blue-400 uppercase tracking-wider">Prochain cours</span>
               </div>
               
               <div class="flex items-start gap-4 mb-4">
                  <div class="w-14 h-14 rounded-2xl bg-gt-blue shadow-[0_0_20px_rgba(37,99,235,0.5)] flex items-center justify-center shrink-0">
                     <svg class="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z"></path></svg>
                  </div>
                  <div class="flex-1">
                     <div class="flex justify-between items-start mb-1">
                        <h3 class="text-xl font-bold text-white">{{ nextClass.subject?.name || nextClass.subject }}</h3>
                        <div class="flex items-center gap-2">
                           <span class="text-xs font-medium text-gray-400 flex items-center gap-1"><svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"></path></svg> {{ nextClass.type }}</span>
                           <button class="p-1.5 rounded-full bg-white/5 text-gray-400 hover:text-white"><svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z"></path></svg></button>
                           <button class="p-1.5 rounded-full bg-white/5 text-gray-400 hover:text-white"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z"></path></svg></button>
                        </div>
                     </div>
                     <p class="text-sm text-gray-400">Description : {{ nextClass.description || "Aucune description" }}</p>
                  </div>
               </div>
               
               <div class="flex justify-between items-center mb-6 pl-18">
                  <div class="flex items-center gap-2 text-sm text-gray-400 font-medium ml-18">
                     <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                     {{ nextClass.startTime }} - {{ nextClass.endTime }} (Salle: {{ nextClass.room }})
                  </div>
                  <div class="flex items-center gap-2">
                     <div class="flex -space-x-2">
                       <img class="w-7 h-7 rounded-full border-2 border-gt-card" src="https://i.pravatar.cc/100?img=7" alt="">
                       <img class="w-7 h-7 rounded-full border-2 border-gt-card" src="https://i.pravatar.cc/100?img=8" alt="">
                     </div>
                     <span class="text-xs text-gray-500 font-medium">+8 People</span>
                  </div>
               </div>
            </div>
         </div>

         <!-- Regular Task Card 2 -->
         <div v-if="todayClasses.length > 1" class="bg-gt-card border border-white/5 rounded-3xl p-6">
            <div class="flex items-center gap-2 mb-2">
               <span class="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_#22c55e]"></span>
               <span class="text-xs font-semibold text-green-500 uppercase tracking-wider">Today</span>
            </div>
            
            <div class="flex justify-between items-start mb-2">
               <h3 class="text-lg font-bold text-white">{{ todayClasses[1].subject?.name || todayClasses[1].subject }}</h3>
               <div class="flex items-center gap-2">
                  <button class="p-1.5 rounded-full bg-white/5 text-gray-400 hover:text-white"><svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z"></path></svg></button>
                  <button class="p-1.5 rounded-full bg-white/5 text-gray-400 hover:text-white"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"></path></svg></button>
                  <button class="p-1.5 rounded-full bg-white/5 text-gray-400 hover:text-white"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z"></path></svg></button>
               </div>
            </div>
            <p class="text-sm text-gray-400 mb-6">Description : {{ todayClasses[1].description }}</p>
            
            <div class="flex justify-between items-end">
               <div class="flex items-center gap-2 text-sm text-gray-400 font-medium">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                  {{ todayClasses[1].startTime }} - {{ todayClasses[1].endTime }}
               </div>
               <div class="flex items-center gap-2">
                  <div class="flex -space-x-2">
                    <img class="w-7 h-7 rounded-full border-2 border-gt-card" src="https://i.pravatar.cc/100?img=9" alt="">
                    <img class="w-7 h-7 rounded-full border-2 border-gt-card" src="https://i.pravatar.cc/100?img=10" alt="">
                  </div>
                  <span class="text-xs text-gray-500 font-medium">+2 People</span>
               </div>
            </div>
         </div>
      </div>

      <!-- Right Column (Widgets) -->
      <div class="space-y-6">
         <!-- Today note widget (Glowing background) -->
         <div class="relative bg-gradient-to-br from-[#1e3a8a] to-[#0f172a] rounded-3xl p-6 overflow-hidden border border-blue-500/30">
            <!-- Glow -->
            <div class="absolute -right-10 -top-10 w-40 h-40 bg-white/20 blur-3xl rounded-full"></div>
            
            <div class="relative z-10">
               <div class="flex justify-between items-center mb-4">
                  <h3 class="text-lg font-bold text-white">Today note</h3>
                  <button class="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white backdrop-blur-sm"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg></button>
               </div>
               <p class="text-sm text-blue-100/80 mb-6 leading-relaxed">Going to the company and <strong class="text-white">planning meetings</strong> for the week ahead 🎯</p>
               
               <div class="flex justify-between items-center">
                  <span class="text-xs font-medium text-blue-200 flex items-center gap-1.5"><svg class="w-4 h-4 text-blue-300" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M17.707 9.293a1 1 0 010 1.414l-7 7a1 1 0 01-1.414 0l-7-7A.997.997 0 012 10V5a3 3 0 013-3h5c.256 0 .512.098.707.293l7 7zM5 6a1 1 0 100-2 1 1 0 000 2z" clip-rule="evenodd"></path></svg> 20min ago</span>
                  <div class="px-4 py-1.5 rounded-full bg-black/20 border border-white/10 text-xs font-medium text-white flex items-center gap-2 backdrop-blur-sm">
                     <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg> I'm going
                     <svg class="w-3 h-3 ml-2 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                  </div>
               </div>
            </div>
         </div>

         <!-- My files widget -->
         <div class="bg-gt-card border border-white/5 rounded-3xl p-6">
            <div class="flex justify-between items-center mb-6">
               <h3 class="text-lg font-bold text-white">My files</h3>
               <button class="p-1.5 rounded-full bg-white/5 text-gray-400 hover:text-white"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z"></path></svg></button>
            </div>
            
            <div class="flex flex-col items-center justify-center py-6">
               <div class="w-24 h-16 bg-white/5 rounded-xl border border-white/10 flex items-center justify-center relative mb-4 shadow-[0_0_15px_rgba(255,255,255,0.05)]">
                  <div class="w-10 h-10 rounded-full bg-gt-bg absolute -left-4 flex items-center justify-center border-4 border-gt-card shadow-lg">
                     <svg class="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                  </div>
                  <div class="space-y-2">
                     <div class="w-8 h-2 bg-white/10 rounded-full"></div>
                     <div class="w-12 h-2 bg-white/5 rounded-full"></div>
                  </div>
               </div>
               <p class="text-sm font-medium text-gray-400">You have not added a file yet</p>
            </div>
            
            <div class="flex items-center justify-between mt-4">
               <span class="text-xs text-gray-500">More than 20 formats</span>
               <button class="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-white flex items-center gap-2 hover:bg-white/10 transition-colors">
                  <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
                  Add file
               </button>
            </div>
         </div>

         <!-- Activity Widget -->
         <div class="bg-gt-card border border-white/5 rounded-3xl p-6 relative overflow-hidden">
            <div class="absolute bottom-0 left-1/2 -translate-x-1/2 w-[60%] h-12 bg-gt-blue/30 blur-[30px]"></div>
            
            <div class="relative z-10 flex justify-between items-start mb-6">
               <div>
                  <h3 class="text-lg font-bold text-white mb-1">Activity</h3>
                  <p class="text-xs text-gray-400">{{ stats.totalSubjects }} Matières suivies</p>
               </div>
               <button class="px-4 py-2 rounded-full bg-transparent border border-white/10 text-xs font-medium text-white flex items-center gap-3 relative shadow-[inset_0_0_15px_rgba(255,255,255,0.05)]">
                  Get the report
                  <div class="w-6 h-6 rounded-full bg-gt-blue shadow-[0_0_10px_rgba(37,99,235,0.6)] flex items-center justify-center">
                     <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                  </div>
               </button>
            </div>
            
            <!-- Mock Chart -->
            <div class="h-24 flex items-end justify-between gap-1 mt-4 relative z-10">
               <div class="w-1 flex-1 bg-white/5 rounded-t-sm h-[30%]"></div>
               <div class="w-1 flex-1 bg-white/5 rounded-t-sm h-[40%]"></div>
               <div class="w-1 flex-1 bg-white/5 rounded-t-sm h-[20%]"></div>
               <div class="w-1 flex-1 bg-white/5 rounded-t-sm h-[50%]"></div>
               <div class="w-1 flex-1 bg-white/5 rounded-t-sm h-[35%]"></div>
               <div class="w-1 flex-1 bg-white/5 rounded-t-sm h-[60%] relative">
                  <!-- Highlighted bar -->
                  <div class="absolute inset-x-0 bottom-0 top-0 bg-blue-400 shadow-[0_0_10px_#60a5fa] rounded-t-sm"></div>
                  <div class="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-blue-500 rounded text-[10px] font-bold text-white whitespace-nowrap">80%</div>
                  <!-- Arrow pointing to bar -->
                  <div class="absolute -top-3 left-1/2 -translate-x-1/2 border-solid border-t-blue-500 border-t-4 border-x-transparent border-x-4 border-b-0"></div>
               </div>
               <div class="w-1 flex-1 bg-white/5 rounded-t-sm h-[70%]"></div>
               <div class="w-1 flex-1 bg-white/5 rounded-t-sm h-[45%]"></div>
               <div class="w-1 flex-1 bg-white/5 rounded-t-sm h-[30%]"></div>
               <div class="w-1 flex-1 bg-white/5 rounded-t-sm h-[25%]"></div>
            </div>
            <div class="flex justify-between mt-2 text-[10px] font-medium text-gray-500 relative z-10">
               <span>Feb</span>
               <span>Mar</span>
               <span class="text-white">Apr</span>
               <span>May</span>
               <span>Jun</span>
            </div>
         </div>
      </div>
    </div>
  </div>
</template>