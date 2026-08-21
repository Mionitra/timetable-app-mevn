<script setup>
import { ref, onMounted, computed } from "vue";
import api from "../../services/api";

const salles = ref([]);
const loading = ref(false);
const error = ref(null);
const search = ref("");

const showModal = ref(false);
const editMode = ref(false);
const saving = ref(false);
const form = ref({ name: "", capacite: "", batiment: "", is_occupied: false });
const editId = ref(null);

const showDeleteConfirm = ref(false);
const deleteId = ref(null);

const filtered = computed(() =>
  salles.value.filter(s =>
    `${s.name} ${s.batiment || ""}`.toLowerCase().includes(search.value.toLowerCase())
  )
);

const fetchSalles = async () => {
  loading.value = true;
  error.value = null;
  try {
    const res = await api.get("/admin/salles");
    salles.value = res.data.data || res.data;
  } catch (e) {
    error.value = e.response?.data?.message || "Erreur de chargement";
  } finally {
    loading.value = false;
  }
};

const openCreate = () => {
  editMode.value = false; editId.value = null;
  form.value = { name: "", capacite: "", batiment: "", is_occupied: false };
  showModal.value = true;
};

const openEdit = (s) => {
  editMode.value = true; editId.value = s._id;
  form.value = { name: s.name, capacite: s.capacite, batiment: s.batiment || "", is_occupied: s.is_occupied };
  showModal.value = true;
};

const save = async () => {
  saving.value = true;
  try {
    if (editMode.value) {
      await api.put(`/admin/salles/${editId.value}`, form.value);
    } else {
      await api.post("/admin/salles", form.value);
    }
    showModal.value = false;
    await fetchSalles();
  } catch (e) {
    error.value = e.response?.data?.message || "Erreur lors de la sauvegarde";
  } finally {
    saving.value = false;
  }
};

const confirmDelete = (id) => { deleteId.value = id; showDeleteConfirm.value = true; };

const deleteSalle = async () => {
  try {
    await api.delete(`/admin/salles/${deleteId.value}`);
    showDeleteConfirm.value = false;
    await fetchSalles();
  } catch (e) {
    error.value = e.response?.data?.message || "Erreur lors de la suppression";
  }
};

onMounted(fetchSalles);
</script>

<template>
  <div class="pt-8">

    <div class="flex items-center justify-between mb-8">
      <div>
        <h1 class="text-2xl font-bold text-white">Salles</h1>
        <p class="mt-1 text-sm text-gray-500">Gérer les salles de cours</p>
      </div>
      <button @click="openCreate" id="btn-add-salle"
        class="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white rounded-xl bg-primary hover:opacity-90 transition-colors shadow-lg shadow-blue-900/30">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        Ajouter
      </button>
    </div>

    <div class="relative mb-6">
      <svg class="absolute w-4 h-4 text-gray-500 -translate-y-1/2 left-3 top-1/2" fill="none" stroke="currentColor"
        viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
      <input v-model="search" type="text" placeholder="Rechercher une salle…"
        class="w-full py-3 pl-10 pr-4 text-sm text-gray-200 placeholder-gray-600 transition-colors border rounded-xl bg-white/5 border-white/10 focus:outline-none focus:border-gt-blue/50" />
    </div>

    <div v-if="error" class="px-4 py-3 mb-4 text-sm text-red-300 border rounded-xl bg-red-500/10 border-red-500/20">{{
      error }}</div>

    <div v-if="loading" class="flex items-center justify-center py-20">
      <div class="w-8 h-8 border-2 rounded-full border-gt-blue border-t-transparent animate-spin"></div>
    </div>

    <!-- Cards grid -->
    <div v-else class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      <div v-if="filtered.length === 0" class="py-12 text-center text-gray-600 col-span-full">
        Aucune salle trouvée
      </div>
      <div v-for="s in filtered" :key="s._id"
        class="relative p-5 transition-all border rounded-2xl bg-white/3 border-white/5 hover:border-white/10 group">
        <!-- Status -->
        <div class="absolute top-4 right-4">
          <span class="px-2 py-0.5 text-xs rounded-full"
            :class="s.is_occupied ? 'bg-red-500/10 text-red-400' : 'bg-green-500/10 text-green-400'">
            {{ s.is_occupied ? 'Occupée' : 'Libre' }}
          </span>
        </div>
        <!-- Icon -->
        <div class="flex items-center justify-center w-12 h-12 mb-4 rounded-xl bg-gt-blue/10">
          <svg class="w-6 h-6 text-gt-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        </div>
        <h3 class="mb-1 text-base font-bold text-white">{{ s.name }}</h3>
        <p class="mb-1 text-sm text-gray-500">{{ s.batiment || 'Bâtiment non défini' }}</p>
        <p class="text-xs text-gray-600">{{ s.capacite }} places</p>
        <!-- Actions -->
        <div class="flex gap-2 mt-4 transition-opacity opacity-0 group-hover:opacity-100">
          <button @click="openEdit(s)"
            class="flex-1 py-1.5 text-xs font-medium text-gray-300 border rounded-lg border-white/10 hover:bg-white/10 transition-colors">
            Modifier
          </button>
          <button @click="confirmDelete(s._id)"
            class="flex-1 py-1.5 text-xs font-medium text-red-400 border rounded-lg border-red-500/20 hover:bg-red-500/10 transition-colors">
            Supprimer
          </button>
        </div>
      </div>
    </div>

    <!-- Modal -->
    <Teleport to="body">
      <div v-if="showModal"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <div class="w-full max-w-md border shadow-2xl rounded-2xl bg-white/5 border-white/10">
          <div class="flex items-center justify-between px-6 py-5 border-b border-white/5">
            <h2 class="text-lg font-bold text-white">{{ editMode ? 'Modifier salle' : 'Ajouter salle' }}</h2>
            <button @click="showModal = false"
              class="p-1 text-gray-400 transition-colors rounded-lg hover:text-white hover:bg-white/10">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div class="p-6 space-y-4">
            <div>
              <label class="block mb-1.5 text-xs font-medium text-gray-400">Nom de la salle *</label>
              <input v-model="form.name" type="text"
                class="w-full px-3 py-2.5 text-sm text-white border rounded-xl bg-white/5 border-white/10 focus:outline-none focus:border-gt-blue/50 transition-colors" />
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block mb-1.5 text-xs font-medium text-gray-400">Capacité *</label>
                <input v-model="form.capacite" type="number" min="1"
                  class="w-full px-3 py-2.5 text-sm text-white border rounded-xl bg-white/5 border-white/10 focus:outline-none focus:border-gt-blue/50 transition-colors" />
              </div>
              <div>
                <label class="block mb-1.5 text-xs font-medium text-gray-400">Bâtiment</label>
                <input v-model="form.batiment" type="text"
                  class="w-full px-3 py-2.5 text-sm text-white border rounded-xl bg-white/5 border-white/10 focus:outline-none focus:border-gt-blue/50 transition-colors" />
              </div>
            </div>
            <label class="flex items-center gap-3 cursor-pointer">
              <div class="relative">
                <input v-model="form.is_occupied" type="checkbox" class="sr-only" />
                <div class="w-10 h-6 transition-colors rounded-full"
                  :class="form.is_occupied ? 'bg-gt-blue' : 'bg-white/10'"></div>
                <div class="absolute w-4 h-4 transition-transform bg-white rounded-full top-1 left-1"
                  :class="form.is_occupied ? 'translate-x-4' : 'translate-x-0'"></div>
              </div>
              <span class="text-sm text-gray-400">Salle occupée</span>
            </label>
          </div>
          <div class="flex justify-end gap-3 px-6 py-4 border-t border-white/5">
            <button @click="showModal = false"
              class="px-4 py-2 text-sm font-medium text-gray-400 transition-colors border rounded-xl border-white/10 hover:bg-white/5">Annuler</button>
            <button @click="save" :disabled="saving"
              class="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white transition-colors rounded-xl bg-primary hover:opacity-90 disabled:opacity-50">
              <div v-if="saving" class="w-4 h-4 border-2 border-white rounded-full border-t-transparent animate-spin">
              </div>
              {{ editMode ? 'Sauvegarder' : 'Créer' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Delete Confirm -->
    <Teleport to="body">
      <div v-if="showDeleteConfirm"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <div class="w-full max-w-sm border shadow-2xl rounded-2xl bg-white/5 border-white/10">
          <div class="p-6 text-center">
            <div class="flex items-center justify-center w-12 h-12 mx-auto mb-4 rounded-full bg-red-500/10">
              <svg class="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 class="mb-2 text-lg font-bold text-white">Supprimer cette salle ?</h3>
            <p class="text-sm text-gray-400">Action irréversible.</p>
          </div>
          <div class="flex gap-3 px-6 pb-6">
            <button @click="showDeleteConfirm = false"
              class="flex-1 px-4 py-2 text-sm text-gray-400 transition-colors border rounded-xl border-white/10 hover:bg-white/5">Annuler</button>
            <button @click="deleteSalle"
              class="flex-1 px-4 py-2 text-sm font-semibold text-white transition-colors bg-red-600 rounded-xl hover:bg-red-500">Supprimer</button>
          </div>
        </div>
      </div>
    </Teleport>

  </div>
</template>