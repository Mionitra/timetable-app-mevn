<script setup>
import { useAuthStore } from "../../stores/auth";

const authStore = useAuthStore();
</script>

<template>
  <div class="bg-gt-card border border-white/5 rounded-[2rem] p-6 sm:p-8">
    <h2 class="text-2xl font-bold text-white flex items-center gap-2">
      <svg class="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
      Bienvenue
    </h2>

    <p class="mt-4 text-gray-400">
      Bonjour
      <span class="font-semibold text-white">
        {{ authStore.user?.firstName }}
      </span>
      , vous êtes connecté en tant qu'enseignant.
    </p>

    <p class="mt-2 text-sm text-gray-500">
      Utilisez le menu
      <span class="text-gray-300">
        Indisponibilité
      </span>
      pour déclarer vos créneaux d'indisponibilité et consulter votre historique.
    </p>
  </div>
</template>
