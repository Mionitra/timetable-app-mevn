<script setup>
import { ref, computed, onMounted } from "vue";
import { useEnseignantStore } from "../../stores/enseignant";
import IndisponibiliteItem from "../../components/IndisponibiliteItem.vue";
import { SLOTS, DAYS } from "../../config/slots";

const enseignantStore = useEnseignantStore();

const dayOfWeek = ref("");
const slotIndex = ref("");
const successMessage = ref("");
const submitting = ref(false);
const deletingId = ref(null);

onMounted(() => {
  enseignantStore.fetchIndisponibilites();
});

const indisponibilites = computed(() => enseignantStore.indisponibilites);

const resetForm = () => {
  dayOfWeek.value = "";
  slotIndex.value = "";
};

const handleSubmit = async () => {
  successMessage.value = "";
  submitting.value = true;

  const result = await enseignantStore.createIndisponibilite({
    dayOfWeek: Number(dayOfWeek.value),
    slotIndex: Number(slotIndex.value),
  });

  submitting.value = false;

  if (result.success) {
    successMessage.value = "Indisponibilité ajoutée avec succès";
    resetForm();
  }
};

const handleRemove = async (id) => {
  deletingId.value = id;
  await enseignantStore.deleteIndisponibilite(id);
  deletingId.value = null;
};
</script>

<template>
  <div class="bg-gt-card border border-white/5 rounded-[2rem] p-6 sm:p-8 min-h-full flex flex-col">
    <!-- Header -->
    <div class="mb-6">
      <h2 class="text-2xl font-bold text-white flex items-center gap-2">
        <svg class="w-6 h-6 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
        </svg>
        Mes indisponibilités
      </h2>

      <p class="mt-1 text-sm text-gray-500">
        Déclarez vos créneaux récurrents d'indisponibilité : l'administration
        ne pourra pas vous planifier sur ces créneaux.
      </p>
    </div>


    <!-- Formulaire d'ajout -->
    <form @submit.prevent="handleSubmit"
      class="p-5 mb-8 border rounded-2xl bg-white/5 border-white/5 space-y-5">

      <h3 class="font-semibold text-white">
        Ajouter une indisponibilité
      </h3>


      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">

        <!-- Jour -->
        <div>
          <label for="indispo-day" class="block mb-2 text-sm font-medium text-gray-300">
            Jour *
          </label>

          <select id="indispo-day" v-model="dayOfWeek" required
            class="w-full p-3 bg-gt-bg/60 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gt-blue focus:border-transparent transition-all">
            <option value="" disabled>
              Choisir un jour
            </option>

            <option v-for="day in DAYS" :key="day.value" :value="day.value">
              {{ day.label }}
            </option>
          </select>
        </div>


        <!-- Créneau -->
        <div>
          <label for="indispo-slot" class="block mb-2 text-sm font-medium text-gray-300">
            Créneau *
          </label>

          <select id="indispo-slot" v-model="slotIndex" required
            class="w-full p-3 bg-gt-bg/60 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gt-blue focus:border-transparent transition-all">
            <option value="" disabled>
              Choisir un créneau
            </option>

            <option v-for="slot in SLOTS" :key="slot.index" :value="slot.index">
              Créneau {{ slot.index }} · {{ slot.startTime }} – {{ slot.endTime }}
            </option>
          </select>
        </div>

      </div>


      <!-- Message de succès -->
      <p v-if="successMessage" class="text-sm font-medium text-green-400">
        ✓ {{ successMessage }}
      </p>


      <!-- Erreur -->
      <p v-if="enseignantStore.error && !submitting" class="text-sm font-medium text-red-400">
        ⚠️ {{ enseignantStore.error }}
      </p>


      <!-- Submit -->
      <button type="submit" :disabled="submitting || !dayOfWeek || !slotIndex"
        class="px-5 py-2.5 text-sm font-medium text-white transition rounded-xl bg-gt-blue hover:bg-blue-500 shadow-[0_0_15px_rgba(37,99,235,0.4)] disabled:opacity-50 disabled:cursor-not-allowed">
        <span v-if="submitting">
          Ajout en cours...
        </span>

        <span v-else>
          + Ajouter l'indisponibilité
        </span>
      </button>

    </form>


    <!-- Historique -->
    <div>
      <h3 class="mb-4 font-semibold text-white">
        Mes indisponibilités déclarées
        <span class="ml-1 text-sm font-normal text-gray-500">
          ({{ indisponibilites.length }})
        </span>
      </h3>


      <!-- Loading -->
      <div v-if="enseignantStore.loading && indisponibilites.length === 0"
        class="flex flex-col items-center justify-center p-12 border rounded-2xl bg-white/5 border-white/5">
        <div class="w-10 h-10 border-4 border-gray-700 rounded-full border-t-gt-blue animate-spin"></div>

        <p class="mt-4 text-sm text-gray-500">
          Chargement des indisponibilités...
        </p>
      </div>


      <!-- Liste vide -->
      <div v-else-if="indisponibilites.length === 0"
        class="p-12 text-center border rounded-2xl bg-white/5 border-white/5">
        <div class="mb-4 text-5xl">
          📅
        </div>

        <h4 class="text-lg font-semibold text-white">
          Aucune indisponibilité
        </h4>

        <p class="mt-2 text-sm text-gray-500">
          Vous n'avez déclaré aucune indisponibilité pour le moment.
        </p>
      </div>


      <!-- Liste -->
      <div v-else class="space-y-3">
        <IndisponibiliteItem v-for="indisponibilite in indisponibilites"
          :key="indisponibilite.id" :indisponibilite="indisponibilite"
          :loading="deletingId === indisponibilite.id" @remove="handleRemove" />
      </div>

    </div>
  </div>
</template>
