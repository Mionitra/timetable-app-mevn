<script setup>
// Affiche TOUS les conflits retournés par l'API (section 2.6),
// pas seulement le premier.
const props = defineProps({
  conflicts: {
    type: Array,
    default: () => [],
  },
});

const typeLabels = {
  SALLE: "Salle",
  ENSEIGNANT: "Enseignant",
  TEACHER_UNAVAILABLE: "Indisponibilité enseignant",
  GROUPE: "Groupe",
};
</script>

<template>
  <div
    v-if="conflicts.length > 0"
    class="border rounded-xl p-4 bg-red-500/10 border-red-500/30"
    role="alert"
  >
    <h3 class="flex items-center gap-2 text-sm font-semibold text-red-400">
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
      {{ conflicts.length }} conflit{{ conflicts.length > 1 ? 's' : '' }} détecté{{ conflicts.length > 1 ? 's' : '' }}
    </h3>

    <ul class="mt-2 space-y-1.5">
      <li v-for="(conflict, index) in conflicts" :key="index"
        class="flex items-center gap-2 text-sm text-red-300">
        <span
          class="px-2 py-0.5 text-[10px] font-bold uppercase rounded bg-red-500/20 text-red-400 whitespace-nowrap">
          {{ typeLabels[conflict.type] || conflict.type }}
        </span>
        {{ conflict.message }}
      </li>
    </ul>
  </div>
</template>
