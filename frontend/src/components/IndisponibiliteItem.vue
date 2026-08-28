<script setup>
// Carte d'une indisponibilité récurrente (jour + créneau fixe).
import { computed } from "vue";
import { SLOTS, DAYS } from "../config/slots";

const props = defineProps({
  indisponibilite: {
    type: Object,
    required: true,
  },
  loading: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["remove"]);

const dayLabel = computed(
  () =>
    DAYS.find((d) => d.value === props.indisponibilite.dayOfWeek)?.label ||
    "Jour inconnu"
);

const slot = computed(() =>
  SLOTS.find((s) => s.index === props.indisponibilite.slotIndex)
);

const slotLabel = computed(() =>
  slot.value
    ? `Créneau ${slot.value.index} · ${slot.value.startTime} – ${slot.value.endTime}`
    : "Créneau inconnu"
);

const formatDate = (dateString) => {
  if (!dateString) return "";
  return new Date(dateString).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};
</script>

<template>
  <div class="relative p-5 border rounded-2xl transition-all duration-200 bg-white/5 border-white/5 hover:bg-white/10">
    <div class="flex gap-4">

      <!-- Icon -->
      <div class="flex items-center justify-center flex-shrink-0 w-12 h-12 text-xl rounded-full bg-purple-500/20">
        🚫
      </div>


      <!-- Content -->
      <div class="flex-1 min-w-0">

        <!-- Jour + créneau -->
        <div class="flex flex-wrap items-center justify-between gap-2">

          <h3 class="font-semibold text-white">
            {{ dayLabel }}
          </h3>

          <span
            class="px-2 py-0.5 text-[10px] font-semibold text-purple-400 bg-purple-500/10 rounded-full whitespace-nowrap">
            {{ slotLabel }}
          </span>

        </div>


        <!-- Date de création -->
        <span class="block mt-2 text-xs text-gray-600">
          Ajoutée le {{ formatDate(indisponibilite.createdAt) }}
        </span>

      </div>


      <!-- Suppression -->
      <button @click="emit('remove', indisponibilite.id)" :disabled="loading"
        class="self-center flex-shrink-0 p-2 text-gray-500 transition-colors rounded-full hover:text-red-400 hover:bg-red-500/10 disabled:opacity-50"
        aria-label="Supprimer l'indisponibilité">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      </button>

    </div>
  </div>
</template>
