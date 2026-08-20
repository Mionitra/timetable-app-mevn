<script setup>
import { ref } from 'vue';

const notifications = ref({
   courseChanges: true,
   newGrades: true,
   announcements: false,
   emailDailyDigest: false
});

const preferences = ref({
   theme: 'dark',
   language: 'fr',
   compactView: false
});

const isSaving = ref(false);

const saveSettings = () => {
   isSaving.value = true;
   // Simuler une requête de sauvegarde
   setTimeout(() => {
      isSaving.value = false;
      // On pourrait utiliser un toast ici au lieu de alert() dans une vraie app
      alert('Vos paramètres ont été enregistrés avec succès !');
   }, 800);
};
</script>

<template>
   <div class="max-w-4xl pb-12 mx-auto space-y-8">

      <div class="flex items-center justify-between pb-5 border-b border-gray-700">
         <h1 class="flex items-center gap-3 text-2xl font-bold text-white">
            <div class="p-2 bg-gray-800 rounded-lg">
               <svg class="w-6 h-6 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                     d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z">
                  </path>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                     d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
               </svg>
            </div>
            Paramètres
         </h1>
         <button @click="saveSettings" :disabled="isSaving"
            class="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:opacity-70 text-white font-medium rounded-xl transition-colors shadow-lg shadow-blue-900/20 flex items-center gap-2">
            <svg v-if="isSaving" class="w-4 h-4 mr-2 -ml-1 text-white animate-spin" xmlns="http://www.w3.org/2000/svg"
               fill="none" viewBox="0 0 24 24">
               <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
               <path class="opacity-75" fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
               </path>
            </svg>
            <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
               <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
            </svg>
            {{ isSaving ? 'Enregistrement...' : 'Enregistrer' }}
         </button>
      </div>

      <!-- Notifications Section -->
      <div class="overflow-hidden border border-gray-700 shadow-lg bg-gray-800/50 backdrop-blur-lg rounded-2xl">
         <div class="px-6 py-4 border-b border-gray-700 bg-gray-900/50">
            <h2 class="flex items-center gap-2 text-lg font-bold text-white">
               <svg class="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                     d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9">
                  </path>
               </svg>
               Notifications et Alertes
            </h2>
            <p class="mt-1 text-sm text-gray-400">Gérez comment et quand vous souhaitez être contacté.</p>
         </div>

         <div class="p-6 divide-y divide-gray-700/50">
            <!-- Toggle 1 -->
            <div class="flex items-center justify-between py-4 first:pt-0 last:pb-0">
               <div>
                  <h4 class="mb-1 font-medium text-white">Changements d'emploi du temps</h4>
                  <p class="text-sm text-gray-500">Soyez averti si une salle change ou si un cours est annulé/déplacé.
                  </p>
               </div>
               <label class="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" v-model="notifications.courseChanges" class="sr-only peer">
                  <div
                     class="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600">
                  </div>
               </label>
            </div>

            <!-- Toggle 2 -->
            <div class="flex items-center justify-between py-4 first:pt-0 last:pb-0">
               <div>
                  <h4 class="mb-1 font-medium text-white">Nouvelles notes publiées</h4>
                  <p class="text-sm text-gray-500">Recevez une notification immédiate dès qu'une note est disponible.
                  </p>
               </div>
               <label class="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" v-model="notifications.newGrades" class="sr-only peer">
                  <div
                     class="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600">
                  </div>
               </label>
            </div>

            <!-- Toggle 3 -->
            <div class="flex items-center justify-between py-4 first:pt-0 last:pb-0">
               <div>
                  <h4 class="mb-1 font-medium text-white">Annonces générales</h4>
                  <p class="text-sm text-gray-500">Messages importants de l'administration et de vos enseignants.</p>
               </div>
               <label class="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" v-model="notifications.announcements" class="sr-only peer">
                  <div
                     class="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600">
                  </div>
               </label>
            </div>

            <!-- Toggle 4 -->
            <div class="flex items-center justify-between py-4 first:pt-0 last:pb-0">
               <div>
                  <h4 class="mb-1 font-medium text-white">Récapitulatif quotidien par email</h4>
                  <p class="text-sm text-gray-500">Recevoir chaque matin le programme de votre journée par email.</p>
               </div>
               <label class="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" v-model="notifications.emailDailyDigest" class="sr-only peer">
                  <div
                     class="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600">
                  </div>
               </label>
            </div>
         </div>
      </div>
   </div>
</template>