<script setup>
import { ref, onMounted, computed } from "vue";
import api from "../../services/api";

const years = ref([]);
const loading = ref(false);
const error = ref(null);

const showModal = ref(false);
const editMode = ref(false);
const saving = ref(false);
const form = ref({ name: "", start_date: "", end_date: "", is_current: false });
const editId = ref(null);

const showDeleteConfirm = ref(false);
const deleteId = ref(null);

const fetchYears = async () => {
  loading.value = true; error.value = null;
  try {
    const res = await api.get("/admin/academic-years");
    years.value = res.data.data || res.data;
  } catch (e) {
    error.value = e.response?.data?.message || "Erreur de chargement";
  } finally { loading.value = false; }
};

const openCreate = () => {
  editMode.value = false; editId.value = null;
  form.value = { name: "", start_date: "", end_date: "", is_current: false };
  showModal.value = true;
};

const openEdit = (y) => {
  editMode.value = true; editId.value = y._id;
  form.value = {
    name: y.name,
    start_date: y.start_date?.substring(0, 10) || "",
    end_date: y.end_date?.substring(0, 10) || "",
    is_current: y.is_current,
  };
  showModal.value = true;
};

const save = async () => {
  saving.value = true;
  try {
    if (editMode.value) {
      await api.put(`/admin/academic-years/${editId.value}`, form.value);
    } else {
      await api.post("/admin/academic-years", form.value);
    }
    showModal.value = false;
    await fetchYears();
  } catch (e) {
    error.value = e.response?.data?.message || "Erreur lors de la sauvegarde";
  } finally { saving.value = false; }
};

const confirmDelete = (id) => { deleteId.value = id; showDeleteConfirm.value = true; };
const deleteYear = async () => {
  try {
    await api.delete(`/admin/academic-years/${deleteId.value}`);
    showDeleteConfirm.value = false;
    await fetchYears();
  } catch (e) {
    error.value = e.response?.data?.message || "Erreur lors de la suppression";
  }
};

const formatDate = (d) => d ? new Date(d).toLocaleDateString("fr-FR") : "—";

onMounted(fetchYears);
</script>

<template>
  <div class="pt-8">

    <div class="flex items-center justify-between mb-8">
      <div>
        <h1 class="text-2xl font-bold text-white">Années académiques</h1>
        <p class="mt-1 text-sm text-gray-500">Gérer les années académiques</p>
      </div>
      <button @click="openCreate"
        class="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white rounded-xl bg-primary hover:opacity-90 transition-colors shadow-lg shadow-blue-900/30">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        Ajouter
      </button>
    </div>

    <div v-if="error" class="px-4 py-3 mb-4 text-sm text-red-300 border rounded-xl bg-red-500/10 border-red-500/20">{{ error }}</div>

    <div v-if="loading" class="flex items-center justify-center py-20">
      <div class="w-8 h-8 border-2 rounded-full border-gt-blue border-t-transparent animate-spin"></div>
    </div>

    <div v-else class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <div v-if="years.length === 0" class="py-12 text-center text-gray-600 col-span-full">Aucune année académique</div>
      <div v-for="y in years" :key="y._id"
        class="relative p-6 border rounded-2xl group"
        :class="y.is_current ? 'bg-gt-blue/10 border-gt-blue/30' : 'bg-white/3 border-white/5 hover:border-white/10'">
        <!-- Badge courante -->
        <div v-if="y.is_current" class="absolute top-4 right-4">
          <span class="px-2 py-0.5 text-xs font-semibold rounded-full bg-gt-blue/20 text-blue-300 border border-gt-blue/30">
            En cours
          </span>
        </div>
        <div class="flex items-center justify-center w-12 h-12 mb-4 rounded-xl"
          :class="y.is_current ? 'bg-gt-blue/20' : 'bg-white/5'">
          <svg class="w-6 h-6" :class="y.is_current ? 'text-gt-blue' : 'text-gray-400'" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <h3 class="mb-2 text-xl font-bold text-white">{{ y.name }}</h3>
        <p class="text-sm text-gray-500">Du {{ formatDate(y.start_date) }} au {{ formatDate(y.end_date) }}</p>
        <div class="flex gap-2 mt-5 transition-opacity opacity-0 group-hover:opacity-100">
          <button @click="openEdit(y)"
            class="flex-1 py-1.5 text-xs font-medium text-gray-300 border rounded-lg border-white/10 hover:bg-white/10 transition-colors">Modifier</button>
          <button @click="confirmDelete(y._id)"
            class="flex-1 py-1.5 text-xs font-medium text-red-400 border rounded-lg border-red-500/20 hover:bg-red-500/10 transition-colors">Supprimer</button>
        </div>
      </div>
    </div>

    <!-- Modal -->
    <Teleport to="body">
      <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <div class="w-full max-w-md border shadow-2xl rounded-2xl bg-white/5 border-white/10">
          <div class="flex items-center justify-between px-6 py-5 border-b border-white/5">
            <h2 class="text-lg font-bold text-white">{{ editMode ? 'Modifier année' : 'Ajouter année académique' }}</h2>
            <button @click="showModal = false" class="p-1 text-gray-400 transition-colors rounded-lg hover:text-white hover:bg-white/10">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div class="p-6 space-y-4">
            <div>
              <label class="block mb-1.5 text-xs font-medium text-gray-400">Nom (ex: 2024-2025) *</label>
              <input v-model="form.name" type="text"
                class="w-full px-3 py-2.5 text-sm text-white border rounded-xl bg-white/5 border-white/10 focus:outline-none focus:border-gt-blue/50 transition-colors" />
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block mb-1.5 text-xs font-medium text-gray-400">Date début *</label>
                <input v-model="form.start_date" type="date"
                  class="w-full px-3 py-2.5 text-sm text-white border rounded-xl bg-white/5 border-white/10 focus:outline-none focus:border-gt-blue/50 transition-colors" />
              </div>
              <div>
                <label class="block mb-1.5 text-xs font-medium text-gray-400">Date fin *</label>
                <input v-model="form.end_date" type="date"
                  class="w-full px-3 py-2.5 text-sm text-white border rounded-xl bg-white/5 border-white/10 focus:outline-none focus:border-gt-blue/50 transition-colors" />
              </div>
            </div>
            <label class="flex items-center gap-3 cursor-pointer">
              <div class="relative">
                <input v-model="form.is_current" type="checkbox" class="sr-only" />
                <div class="w-10 h-6 transition-colors rounded-full" :class="form.is_current ? 'bg-gt-blue' : 'bg-white/10'"></div>
                <div class="absolute w-4 h-4 transition-transform bg-white rounded-full top-1 left-1"
                  :class="form.is_current ? 'translate-x-4' : 'translate-x-0'"></div>
              </div>
              <span class="text-sm text-gray-400">Année en cours</span>
            </label>
          </div>
          <div class="flex justify-end gap-3 px-6 py-4 border-t border-white/5">
            <button @click="showModal = false"
              class="px-4 py-2 text-sm text-gray-400 transition-colors border rounded-xl border-white/10 hover:bg-white/5">Annuler</button>
            <button @click="save" :disabled="saving"
              class="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white transition-colors rounded-xl bg-primary hover:opacity-90 disabled:opacity-50">
              <div v-if="saving" class="w-4 h-4 border-2 border-white rounded-full border-t-transparent animate-spin"></div>
              {{ editMode ? 'Sauvegarder' : 'Créer' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <Teleport to="body">
      <div v-if="showDeleteConfirm" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <div class="w-full max-w-sm p-6 text-center border shadow-2xl rounded-2xl bg-white/5 border-white/10">
          <div class="flex items-center justify-center w-12 h-12 mx-auto mb-4 rounded-full bg-red-500/10">
            <svg class="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 class="mb-2 text-lg font-bold text-white">Supprimer cette année ?</h3>
          <p class="mb-6 text-sm text-gray-400">Action irréversible.</p>
          <div class="flex gap-3">
            <button @click="showDeleteConfirm = false"
              class="flex-1 px-4 py-2 text-sm text-gray-400 transition-colors border rounded-xl border-white/10 bg-primary hover:opacity-90">Annuler</button>
            <button @click="deleteYear"
              class="flex-1 px-4 py-2 text-sm font-semibold text-white transition-colors bg-red-600 rounded-xl hover:bg-red-500">Supprimer</button>
          </div>
        </div>
      </div>
    </Teleport>

  </div>
</template>
