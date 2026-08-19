<script setup>
import { useAuthStore } from "../../stores/auth";

const authStore = useAuthStore();
// Use real user from store if available, otherwise fallback to mock data
const user = authStore.user || {
  firstName: 'Jean',
  lastName: 'Dupont',
  email: 'jean.dupont@universite.edu',
  role: 'etudiant',
  studentId: 'ETU-2023-4589',
  department: 'Informatique',
  level: 'Licence 3',
  joinDate: 'Septembre 2023'
};
</script>

<template>
  <div class="max-w-4xl mx-auto space-y-8">
    
    <!-- Profile Header Banner -->
    <div class="bg-gt-card border border-white/5 rounded-[2rem] overflow-hidden shadow-xl">
       <div class="h-32 bg-gradient-to-r from-blue-600 to-indigo-800 relative">
          <!-- decorative pattern -->
          <div class="absolute inset-0 opacity-20" style="background-image: radial-gradient(circle at 2px 2px, white 1px, transparent 0); background-size: 20px 20px;"></div>
       </div>
       <div class="px-8 pb-8 relative">
          <div class="flex flex-col sm:flex-row gap-6 items-start sm:items-end -mt-16 mb-6">
             <div class="w-32 h-32 rounded-[2rem] bg-gt-bg border-4 border-gt-card shadow-2xl flex items-center justify-center text-4xl font-bold text-white shrink-0 overflow-hidden relative group">
                <span class="absolute inset-0 bg-gt-bg"></span>
                <span class="relative z-10">{{ user.firstName?.charAt(0) || 'E' }}{{ user.lastName?.charAt(0) || 'D' }}</span>
                <div class="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer z-20">
                   <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 16a1 1 0 011-1h16a1 1 0 011 1v3a1 1 0 01-1 1H4a1 1 0 01-1-1v-3z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 10l-4-4m0 0l-4 4m4-4v10"></path></svg>
                </div>
             </div>
             
             <div class="flex-1 pb-2">
                <div class="flex items-center gap-3 mb-1">
                   <h1 class="text-3xl font-bold text-white">{{ user.firstName }} {{ user.lastName }}</h1>
                   <span class="px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-500/20 text-blue-400 border border-blue-500/30">Étudiant</span>
                </div>
                <p class="text-gray-400 flex items-center gap-2">
                   <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2"></path></svg>
                   Matricule: <span class="text-gray-300 font-medium">{{ user.studentId || 'N/A' }}</span>
                </p>
             </div>
             
             <div class="pb-2">
                <button class="px-5 py-2.5 bg-gray-700 hover:bg-gray-600 text-white text-sm font-medium rounded-xl transition-colors shadow-sm flex items-center gap-2">
                   <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                   Modifier le profil
                </button>
             </div>
          </div>
       </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
       <!-- Personal Info -->
       <div class="md:col-span-2 space-y-6">
          <div class="bg-gt-card border border-white/5 rounded-[2rem] p-6 shadow-lg">
             <h3 class="text-lg font-bold text-white mb-6 border-b border-white/5 pb-3 flex items-center gap-2">
                <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                Informations Personnelles
             </h3>
             
             <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div class="space-y-1">
                   <label class="text-xs font-medium text-gray-500 uppercase tracking-wider">Prénom</label>
                   <p class="text-white font-medium bg-gray-900/50 px-4 py-2.5 rounded-xl border border-gray-700">{{ user.firstName }}</p>
                </div>
                <div class="space-y-1">
                   <label class="text-xs font-medium text-gray-500 uppercase tracking-wider">Nom de famille</label>
                   <p class="text-white font-medium bg-gray-900/50 px-4 py-2.5 rounded-xl border border-gray-700">{{ user.lastName }}</p>
                </div>
                <div class="space-y-1 sm:col-span-2">
                   <label class="text-xs font-medium text-gray-500 uppercase tracking-wider">Adresse e-mail institutionnelle</label>
                   <p class="text-white font-medium bg-gray-900/50 px-4 py-2.5 rounded-xl border border-gray-700 flex items-center gap-2">
                      <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                      {{ user.email }}
                   </p>
                </div>
             </div>
          </div>
          
          <div class="bg-gt-card border border-white/5 rounded-[2rem] p-6 shadow-lg">
             <h3 class="text-lg font-bold text-white mb-6 border-b border-white/5 pb-3 flex items-center gap-2">
                <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 14l9-5-9-5-9 5 9 5z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 14l9-5-9-5-9 5 9 5z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 14v7"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2 12v6l10 5 10-5v-6"></path></svg>
                Cursus Universitaire
             </h3>
             
             <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div class="space-y-1">
                   <label class="text-xs font-medium text-gray-500 uppercase tracking-wider">Département / Filière</label>
                   <p class="text-white font-medium bg-gray-900/50 px-4 py-2.5 rounded-xl border border-gray-700">{{ user.department || 'Non défini' }}</p>
                </div>
                <div class="space-y-1">
                   <label class="text-xs font-medium text-gray-500 uppercase tracking-wider">Niveau d'études</label>
                   <p class="text-white font-medium bg-gray-900/50 px-4 py-2.5 rounded-xl border border-gray-700">{{ user.level || 'Non défini' }}</p>
                </div>
                <div class="space-y-1">
                   <label class="text-xs font-medium text-gray-500 uppercase tracking-wider">Date d'inscription</label>
                   <p class="text-white font-medium bg-gray-900/50 px-4 py-2.5 rounded-xl border border-gray-700">{{ user.joinDate || 'Non défini' }}</p>
                </div>
             </div>
          </div>
       </div>
       
       <!-- Side Widgets -->
       <div class="space-y-6">
          <div class="bg-gradient-to-br from-indigo-600 to-purple-800 rounded-2xl p-6 shadow-lg text-center relative overflow-hidden group">
             <div class="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
             <svg class="w-12 h-12 text-white/50 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"></path></svg>
             <h4 class="text-indigo-100 font-medium text-sm mb-1 uppercase tracking-wider">Statut</h4>
             <div class="text-2xl font-bold text-white">Actif</div>
             <p class="text-indigo-200 text-xs mt-2">Inscrit pour l'année universitaire 2023-2024</p>
          </div>
          
          <div class="bg-gray-800/50 backdrop-blur-lg border border-gray-700 rounded-2xl p-6 shadow-lg">
             <h3 class="text-sm font-bold text-white mb-4 uppercase tracking-wider text-center">Sécurité du compte</h3>
             <button class="w-full py-2.5 bg-gray-700 hover:bg-gray-600 text-white text-sm font-medium rounded-xl transition-colors shadow-sm mb-3">
                Changer de mot de passe
             </button>
             <button class="w-full py-2.5 bg-gray-700 hover:bg-gray-600 text-white text-sm font-medium rounded-xl transition-colors shadow-sm">
                Gérer les sessions actives
             </button>
          </div>
       </div>
    </div>
  </div>
</template>