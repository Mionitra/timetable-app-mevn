<script setup>
// =========================================================
// Formulaire modal de création/édition d'un cours (section 2.7).
// Le composant est "bête" : il émet `check` (vérification à la
// volée), `submit` et `remove` ; la logique API reste dans le
// store slots. Le bouton de soumission est désactivé tant qu'un
// conflit bloquant est présent.
// =========================================================
import { ref, computed, watch } from "vue";
import ConflictBanner from "./ConflictBanner.vue";
import { SLOTS, DAYS } from "../config/slots";

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false,
  },
  mode: {
    type: String,
    default: "create", // "create" | "edit"
  },
  cell: {
    type: Object,
    default: null, // { dayOfWeek, slotIndex }
  },
  slotData: {
    type: Object,
    default: null,
  },
  matieres: {
    type: Array,
    default: () => [],
  },
  enseignants: {
    type: Array,
    default: () => [],
  },
  salles: {
    type: Array,
    default: () => [],
  },
  conflicts: {
    type: Array,
    default: () => [],
  },
  checking: {
    type: Boolean,
    default: false,
  },
  submitting: {
    type: Boolean,
    default: false,
  },
  // Nombre de créneaux occupés par le cours en mode édition
  // (bloc multi-créneaux). Non modifiable après création.
  sequenceSize: {
    type: Number,
    default: 1,
  },
});

const emit = defineEmits(["close", "check", "submit", "remove"]);

const subjectId = ref("");
const teacherId = ref("");
const salleId = ref("");
const type = ref("CM");
const isPublished = ref(false);
const duration = ref(1);
const showDeleteConfirm = ref(false);

const isEdit = computed(() => props.mode === "edit");

const dayLabel = computed(() =>
  props.cell
    ? DAYS.find((d) => d.value === props.cell.dayOfWeek)?.label || ""
    : ""
);

const slotLabel = computed(() => {
  if (!props.cell) return "";
  const s = SLOTS.find((sl) => sl.index === props.cell.slotIndex);
  return s ? `${s.index} (${s.startTime} – ${s.endTime})` : "";
});

// Options de durée en création : du créneau cliqué jusqu'à la fin
// de la journée (créneau 10 maximum), sans déborder.
const durationOptions = computed(() => {
  if (!props.cell) return [{ value: 1, label: "1 créneau" }];

  const maxDuration = 11 - props.cell.slotIndex;

  return Array.from({ length: maxDuration }, (_, i) => {
    const value = i + 1;
    const start = SLOTS.find((sl) => sl.index === props.cell.slotIndex);
    const end = SLOTS.find(
      (sl) => sl.index === props.cell.slotIndex + i
    );
    const range = start && end ? ` · ${start.startTime} – ${end.endTime}` : "";
    return {
      value,
      label: `${value} créneau${value > 1 ? "x successifs" : ""}${range}`,
    };
  });
});

// (Ré)initialisation à chaque ouverture / changement de cellule
watch(
  () => [props.isOpen, props.cell?.dayOfWeek, props.cell?.slotIndex],
  () => {
    if (!props.isOpen) return;

    showDeleteConfirm.value = false;

    if (props.mode === "edit" && props.slotData) {
      subjectId.value = props.slotData.subject?.id || "";
      teacherId.value = props.slotData.teacher?.id || "";
      salleId.value = props.slotData.salle?.id || "";
      type.value = props.slotData.type || "CM";
      isPublished.value = !!props.slotData.isPublished;
    } else {
      subjectId.value = "";
      teacherId.value = "";
      salleId.value = "";
      type.value = "CM";
      isPublished.value = false;
      duration.value = 1;
    }
  },
  { immediate: true }
);

// Re-vérification automatique à chaque changement de champ (section 2.7),
// durée incluse : la plage de créneaux successifs change le périmètre.
watch([subjectId, teacherId, salleId, duration], () => {
  if (!props.isOpen) return;
  emitCheck();
});

const buildPayload = () => ({
  weekNumber: props.slotData?.weekNumber ?? null,
  year: props.slotData?.year ?? null,
  dayOfWeek: props.cell?.dayOfWeek,
  slotIndex: props.cell?.slotIndex,
  type: type.value,
  groupId: props.slotData?.group?.id ?? null,
  subjectId: subjectId.value,
  teacherId: teacherId.value,
  salleId: salleId.value,
  isPublished: isPublished.value,
  // Créneaux successifs : envoyé uniquement en création
  duration: isEdit.value ? undefined : Number(duration.value),
  excludeId: props.slotData?.id ?? undefined,
});

const emitCheck = () => {
  if (!subjectId.value || !teacherId.value || !salleId.value) return;
  emit("check", buildPayload());
};

const handleSubmit = () => {
  if (hasBlockingConflict.value) return;
  emit("submit", buildPayload());
};

const handleRemove = () => {
  showDeleteConfirm.value = false;
  emit("remove", props.slotData.id);
};

// Le formulaire est complet ?
const isFormComplete = computed(
  () => !!(subjectId.value && teacherId.value && salleId.value)
);

// Un conflit bloque la soumission tant qu'il est retourné par l'API
const hasBlockingConflict = computed(
  () => props.conflicts.length > 0
);
</script>

<template>
  <Teleport to="body">
    <div v-if="isOpen"
      class="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      @click.self="emit('close')">
      <div class="w-full max-w-lg bg-gt-card border border-white/10 rounded-2xl shadow-2xl">
        <!-- En-tête -->
        <div class="flex items-center justify-between p-5 border-b border-white/5">
          <h3 class="text-lg font-bold text-white">
            {{ isEdit ? "Modifier le cours" : "Nouveau cours" }}
          </h3>
          <button @click="emit('close')"
            class="p-1.5 text-gray-400 transition-colors rounded-full hover:bg-white/5 hover:text-white"
            aria-label="Fermer">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Corps -->
        <div class="p-5 space-y-4">
          <!-- Créneau cible (lecture seule, section 2.7) -->
          <div class="grid grid-cols-2 gap-3">
            <div class="p-3 rounded-xl bg-gt-bg/60 border border-white/10">
              <p class="text-xs text-gray-500 mb-1">Jour</p>
              <p class="text-sm font-semibold text-white">{{ dayLabel }}</p>
            </div>
            <div class="p-3 rounded-xl bg-gt-bg/60 border border-white/10">
              <p class="text-xs text-gray-500 mb-1">Créneau</p>
              <p class="text-sm font-semibold text-white">{{ slotLabel }}</p>
            </div>
          </div>

          <!-- Durée (créneaux successifs) -->
          <div v-if="!isEdit">
            <label for="slot-duration" class="block mb-1.5 text-sm font-medium text-gray-300">Durée *</label>
            <select id="slot-duration" v-model.number="duration"
              class="w-full p-3 bg-gt-bg/60 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-gt-blue transition-all">
              <option v-for="option in durationOptions" :key="option.value" :value="option.value">
                {{ option.label }}
              </option>
            </select>
            <p class="mt-1.5 text-xs text-gray-500">
              Le cours occupera des créneaux consécutifs et sera modifiable/supprimable comme un seul bloc.
            </p>
          </div>

          <div v-else-if="sequenceSize > 1"
            class="p-3 rounded-xl bg-gt-bg/60 border border-white/10">
            <p class="text-xs text-gray-500 mb-1">Durée</p>
            <p class="text-sm font-semibold text-white">
              {{ sequenceSize }} créneaux successifs
            </p>
            <p class="mt-1 text-xs text-gray-500">
              Les modifications s'appliquent à tout le bloc.
            </p>
          </div>

          <!-- Matière -->
          <div>
            <label for="slot-subject" class="block mb-1.5 text-sm font-medium text-gray-300">Matière *</label>
            <select id="slot-subject" v-model="subjectId"
              class="w-full p-3 bg-gt-bg/60 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-gt-blue transition-all">
              <option value="" disabled>Choisir une matière</option>
              <option v-for="matiere in matieres" :key="matiere.id" :value="matiere.id">
                {{ matiere.name }} ({{ matiere.semester }})
              </option>
            </select>
          </div>

          <!-- Enseignant -->
          <div>
            <label for="slot-teacher" class="block mb-1.5 text-sm font-medium text-gray-300">Enseignant *</label>
            <select id="slot-teacher" v-model="teacherId"
              class="w-full p-3 bg-gt-bg/60 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-gt-blue transition-all">
              <option value="" disabled>Choisir un enseignant</option>
              <option v-for="enseignant in enseignants" :key="enseignant.id" :value="enseignant.id">
                {{ enseignant.firstName }} {{ enseignant.lastName }}
                <template v-if="enseignant.discipline"> — {{ enseignant.discipline }}</template>
              </option>
            </select>
          </div>

          <!-- Salle -->
          <div>
            <label for="slot-salle" class="block mb-1.5 text-sm font-medium text-gray-300">Salle *</label>
            <select id="slot-salle" v-model="salleId"
              class="w-full p-3 bg-gt-bg/60 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-gt-blue transition-all">
              <option value="" disabled>Choisir une salle</option>
              <option v-for="salle in salles" :key="salle.id || salle._id" :value="salle.id || salle._id">
                {{ salle.name }} ({{ salle.capacite }} places)
              </option>
            </select>
          </div>

          <!-- Type + publication -->
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label for="slot-type" class="block mb-1.5 text-sm font-medium text-gray-300">Type *</label>
              <select id="slot-type" v-model="type"
                class="w-full p-3 bg-gt-bg/60 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-gt-blue transition-all">
                <option value="CM">CM</option>
                <option value="TD">TD</option>
                <option value="TP">TP</option>
              </select>
            </div>
            <div class="flex items-end pb-1">
              <label class="flex items-center gap-3 cursor-pointer select-none">
                <input v-model="isPublished" type="checkbox"
                  class="w-4 h-4 rounded bg-gt-bg border-white/20 text-gt-blue focus:ring-gt-blue" />
                <span class="text-sm text-gray-300">Publier ce cours</span>
              </label>
            </div>
          </div>

          <!-- Conflits retournés par l'API -->
          <ConflictBanner :conflicts="conflicts" />

          <p v-if="checking" class="text-xs text-gray-500 flex items-center gap-2">
            <span class="inline-block w-3 h-3 border-2 border-gray-600 rounded-full border-t-gt-blue animate-spin"></span>
            Vérification des conflits...
          </p>
        </div>

        <!-- Actions -->
        <div class="flex items-center gap-3 p-5 border-t border-white/5">
          <button v-if="isEdit" type="button" @click="showDeleteConfirm = true" :disabled="submitting"
            class="px-4 py-2.5 text-sm font-medium text-red-400 transition-colors rounded-xl hover:bg-red-500/10 disabled:opacity-50">
            Supprimer
          </button>

          <div class="flex-1"></div>

          <button type="button" @click="emit('close')" :disabled="submitting"
            class="px-4 py-2.5 text-sm font-medium text-gray-300 transition-colors rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 disabled:opacity-50">
            Annuler
          </button>

          <button type="button" @click="handleSubmit" :disabled="!isFormComplete || hasBlockingConflict || checking || submitting"
            class="px-5 py-2.5 text-sm font-medium text-white transition rounded-xl bg-gt-blue shadow-[0_0_15px_rgba(37,99,235,0.4)] hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none">
            <span v-if="submitting">Enregistrement...</span>
            <span v-else>{{ isEdit ? "Enregistrer les modifications" : "Créer le cours" }}</span>
          </button>
        </div>

        <!-- Confirmation de suppression -->
        <div v-if="showDeleteConfirm"
          class="absolute inset-0 z-10 flex items-center justify-center p-6 bg-gt-card/95 backdrop-blur-sm rounded-2xl">
          <div class="text-center">
            <h4 class="mb-2 text-lg font-bold text-white">Confirmer la suppression</h4>
            <p class="mb-6 text-sm text-gray-400">
              {{ sequenceSize > 1
                ? `Les ${sequenceSize} créneaux de ce cours seront définitivement supprimés de l'emploi du temps.`
                : "Ce cours sera définitivement supprimé de l'emploi du temps." }}
            </p>
            <div class="flex justify-center gap-3">
              <button type="button" @click="showDeleteConfirm = false"
                class="px-4 py-2.5 text-sm font-medium text-gray-300 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10">
                Annuler
              </button>
              <button type="button" @click="handleRemove" :disabled="submitting"
                class="px-4 py-2.5 text-sm font-medium text-white bg-red-600 rounded-xl hover:bg-red-500 disabled:opacity-50">
                {{ submitting ? "Suppression..." : "Supprimer" }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>
