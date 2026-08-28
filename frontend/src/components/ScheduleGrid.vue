<script setup>
// =========================================================
// Grille hebdomadaire réutilisable (5 jours × 10 créneaux).
// - mode lecture (étudiant / enseignant) : cellules non cliquables
// - mode édition (admin) : clic sur une cellule vide ou occupée
//   émet `cell-click` avec { dayOfWeek, slotIndex, slot|null }.
// Brouillon = gris/ambre, publié = vert (section 2.7).
// =========================================================
import { computed } from "vue";
import { SLOTS, DAYS } from "../config/slots";

const props = defineProps({
  slots: {
    type: Array,
    default: () => [],
  },
  editable: {
    type: Boolean,
    default: false,
  },
  selectedId: {
    type: String,
    default: null,
  },
});

const emit = defineEmits(["cell-click"]);

// Index (dayOfWeek*100 + slotIndex) → cours
const slotMap = computed(() => {
  const map = {};
  for (const slot of props.slots) {
    map[`${slot.dayOfWeek}-${slot.slotIndex}`] = slot;
  }
  return map;
});

const getSlotAt = (dayOfWeek, slotIndex) =>
  slotMap.value[`${dayOfWeek}-${slotIndex}`] || null;

const handleCellClick = (dayOfWeek, slotIndex) => {
  if (!props.editable) return;
  emit("cell-click", {
    dayOfWeek,
    slotIndex,
    slot: getSlotAt(dayOfWeek, slotIndex),
  });
};

const typeBadgeClass = {
  CM: "bg-blue-500/25 text-blue-200",
  TD: "bg-purple-500/25 text-purple-200",
  TP: "bg-emerald-500/25 text-emerald-200",
};
</script>

<template>
  <div class="overflow-x-auto rounded-2xl border border-white/5 bg-gt-bg/60">
    <div class="min-w-[880px]">
      <!-- En-tête : jours -->
      <div class="grid grid-cols-[90px_repeat(5,1fr)] border-b border-white/5 bg-gt-card">
        <div class="flex items-center justify-center p-3 border-r border-white/5">
          <svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div v-for="day in DAYS" :key="day.value"
          class="p-3 text-center text-sm font-bold text-white border-r border-white/5 last:border-r-0">
          {{ day.label }}
        </div>
      </div>

      <!-- Corps : une ligne par créneau -->
      <div v-for="slot in SLOTS" :key="slot.index"
        class="grid grid-cols-[90px_repeat(5,1fr)] border-b border-white/5 last:border-b-0">
        <!-- Colonne horaire -->
        <div class="flex flex-col items-center justify-center p-2 border-r border-white/5 bg-gt-card/50">
          <span class="text-[10px] font-bold text-gray-500">Créneau {{ slot.index }}</span>
          <span class="text-[10px] text-gray-400">{{ slot.startTime }}</span>
          <span class="text-[10px] text-gray-500">{{ slot.endTime }}</span>
        </div>

        <!-- Cellules jour -->
        <component
          v-for="day in DAYS"
          :key="`${slot.index}-${day.value}`"
          :is="editable ? 'button' : 'div'"
          type="button"
          class="relative min-h-[64px] p-1.5 m-1 rounded-lg border text-left transition-all duration-150"
          :class="
            getSlotAt(day.value, slot.index)
              ? getSlotAt(day.value, slot.index).isPublished
                ? 'bg-green-600/15 border-green-500/40 hover:border-green-400'
                : 'bg-gray-500/15 border-gray-400/30 hover:border-gray-300'
              : 'border-dashed border-white/10 bg-transparent ' +
                (editable ? 'hover:bg-blue-500/10 hover:border-blue-500/40 cursor-pointer' : '')
          "
          @click="handleCellClick(day.value, slot.index)"
        >
          <template v-if="getSlotAt(day.value, slot.index)">
            <div class="flex items-start justify-between gap-1 mb-1">
              <span class="px-1.5 py-0.5 text-[9px] font-bold uppercase rounded backdrop-blur-sm"
                :class="typeBadgeClass[getSlotAt(day.value, slot.index).type] || 'bg-white/10 text-gray-300'">
                {{ getSlotAt(day.value, slot.index).type }}
              </span>
              <span v-if="editable && !getSlotAt(day.value, slot.index).isPublished"
                class="px-1.5 py-0.5 text-[9px] font-semibold rounded bg-amber-500/20 text-amber-300 whitespace-nowrap">
                Brouillon
              </span>
            </div>
            <p class="text-xs font-bold leading-tight text-white mb-0.5 line-clamp-2">
              {{ getSlotAt(day.value, slot.index).subject?.name || "Cours" }}
            </p>
            <p class="text-[10px] text-gray-400 leading-tight truncate">
              {{ getSlotAt(day.value, slot.index).teacher
                ? getSlotAt(day.value, slot.index).teacher.firstName + " " + getSlotAt(day.value, slot.index).teacher.lastName
                : "—" }}
            </p>
            <p class="text-[10px] text-gray-500 leading-tight truncate">
              {{ getSlotAt(day.value, slot.index).salle?.name || "—" }}
            </p>
          </template>
        </component>
      </div>
    </div>
  </div>
</template>
