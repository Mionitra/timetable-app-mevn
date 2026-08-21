<script setup>
import { ref, onMounted, computed } from "vue";
import api from "../../services/api";

const semestres = ref([]);
const academicYears = ref([]);
const loading = ref(false);
const error = ref(null);

const showModal = ref(false);
const editMode = ref(false);
const saving = ref(false);
const form = ref({ name: "", academic_year_id: "", start_date: "", end_date: "" });
const editId = ref(null);

const showDeleteConfirm = ref(false);
const deleteId = ref(null);

const fetchAll = async () => {
  loading.value = true; error.value = null;
  try {
    const [semRes, yearRes] = await Promise.all([
      api.get("/admin/semestres"),
      api.get("/admin/academic-years"),
    ]);
    semestres.value = semRes.data.data || semRes.data;
    academicYears.value = yearRes.data.data || yearRes.data;
  } catch (e) {
    error.value = e.response?.data?.message || "Erreur de chargement";
  } finally { loading.value = false; }
};

const yearName = (id) => academicYears.value.find(y => y._id === id)?.name || "—";

const openCreate = () => {
  editMode.value = false; editId.value = null;
  form.value = { name: "", academic_year_id: "", start_date: "", end_date: "" };
  showModal.value = true;
};

const openEdit = (s) => {
  editMode.value = true; editId.value = s._id;
  form.value = {
    name: s.name,
    academic_year_id: s.academic_year_id?._id || s.academic_year_id,
    start_date: s.start_date?.substring(0, 10) || "",
    end_date: s.end_date?.substring(0, 10) || "",
  };
  showModal.value = true;
};

const save = async () => {
  saving.value = true;
  try {
    if (editMode.value) await api.put(`/admin/semestres/${editId.value}`, form.value);
    else await api.post("/admin/semestres", form.value);
    showModal.value = false;
    await fetchAll();
  } catch (e) {
    error.value = e.response?.data?.message || "Erreur lors de la sauvegarde";
  } finally { saving.value = false; }
};

const confirmDelete = (id) => { deleteId.value = id; showDeleteConfirm.value = true; };
const deleteSemestre = async () => {
  try {
    await api.delete(`/admin/semestres/${deleteId.value}`);
    showDeleteConfirm.value = false;
    await fetchAll();
  } catch (e) { error.value = e.response?.data?.message || "Erreur"; }
};

const formatDate = (d) => d ? new Date(d).toLocaleDateString("fr-FR") : "—";

onMounted(fetchAll);
</script>

<template>
  <div class="pt-8">

    <div class="flex items-center justify-between mb-8">
      <div>
        <h1 class="text-2xl font-bold text-white">Semestres</h1>
        <p class="mt-1 text-sm text-gray-500">Gérer les semestres par année académique</p>
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

    <div v-else class="overflow-hidden border rounded-2xl border-white/5 bg-white/3">
      <table class="w-full text-sm">
        <thead>
          <tr class="border-b border-white/5 bg-white/5">
            <th class="px-6 py-4 font-semibold text-left text-gray-400">Nom</th>
            <th class="hidden px-6 py-4 font-semibold text-left text-gray-400 sm:table-cell">Année académique</th>
            <th class="hidden px-6 py-4 font-semibold text-left text-gray-400 md:table-cell">Période</th>
            <th class="px-6 py-4 font-semibold text-right text-gray-400">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="semestres.length === 0">
            <td colspan="4" class="px-6 py-12 text-center text-gray-600">Aucun semestre</td>
          </tr>
          <tr v-for="s in semestres" :key="s._id" class="transition-colors border-b border-white/5 hover:bg-white/3 last:border-0">
            <td class="px-6 py-4 font-medium text-white">{{ s.name }}</td>
            <td class="hidden px-6 py-4 text-gray-400 sm:table-cell">
              <span class="px-2 py-0.5 text-xs rounded-full bg-blue-500/10 text-blue-300">
                {{ yearName(s.academic_year_id?._id || s.academic_year_id) }}
              </span>
            </td>
            <td class="hidden px-6 py-4 text-gray-400 md:table-cell">
              {{ formatDate(s.start_date) }} → {{ formatDate(s.end_date) }}
            </td>
            <td class="px-6 py-4 text-right">
              <div class="flex items-center justify-end gap-2">
                <button @click="openEdit(s)"
                  class="p-2 text-gray-400 transition-colors rounded-lg hover:text-white hover:bg-white/10">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <button @click="confirmDelete(s._id)"
                  class="p-2 text-gray-400 transition-colors rounded-lg hover:text-red-400 hover:bg-red-500/10">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal -->
    <Teleport to="body">
      <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <div class="w-full max-w-md border shadow-2xl rounded-2xl bg-white/5 border-white/10">
          <div class="flex items-center justify-between px-6 py-5 border-b border-white/5">
            <h2 class="text-lg font-bold text-white">{{ editMode ? 'Modifier semestre' : 'Ajouter semestre' }}</h2>
            <button @click="showModal = false" class="p-1 text-gray-400 transition-colors rounded-lg hover:text-white hover:bg-white/10">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div class="p-6 space-y-4">
            <div>
              <label class="block mb-1.5 text-xs font-medium text-gray-400">Nom du semestre *</label>
              <input v-model="form.name" type="text" placeholder="ex: Semestre 1"
                class="w-full px-3 py-2.5 text-sm text-white border rounded-xl bg-white/5 border-white/10 focus:outline-none focus:border-gt-blue/50 transition-colors" />
            </div>
            <div>
              <label class="block mb-1.5 text-xs font-medium text-gray-400">Année académique *</label>
              <select v-model="form.academic_year_id"
                class="w-full px-3 py-2.5 text-sm text-white border rounded-xl bg-white/5 border-white/10 focus:outline-none focus:border-gt-blue/50 transition-colors">
                <option value="">— Sélectionner —</option>
                <option v-for="y in academicYears" :key="y._id" :value="y._id">{{ y.name }}</option>
              </select>
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
          <h3 class="mb-2 text-lg font-bold text-white">Supprimer ce semestre ?</h3>
          <p class="mb-6 text-sm text-gray-400">Action irréversible.</p>
          <div class="flex gap-3">
            <button @click="showDeleteConfirm = false"
              class="flex-1 px-4 py-2 text-sm text-gray-400 transition-colors border rounded-xl border-white/10 hover:bg-white/5">Annuler</button>
            <button @click="deleteSemestre"
              class="flex-1 px-4 py-2 text-sm font-semibold text-white transition-colors bg-red-600 rounded-xl hover:bg-red-500">Supprimer</button>
          </div>
        </div>
      </div>
    </Teleport>

  </div>
</template>
