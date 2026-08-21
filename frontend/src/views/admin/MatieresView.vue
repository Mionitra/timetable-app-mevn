<script setup>
import { ref, onMounted, computed } from "vue";
import api from "../../services/api";

const matieres = ref([]);
const semestres = ref([]);
const loading = ref(false);
const error = ref(null);
const search = ref("");

const showModal = ref(false);
const editMode = ref(false);
const saving = ref(false);
const form = ref({ name: "", code: "", credits: "", duree: "", description: "", color: "#2563eb", semester_id: "" });
const editId = ref(null);

const showDeleteConfirm = ref(false);
const deleteId = ref(null);

const colorOptions = [
  "#2563eb", "#7c3aed", "#db2777", "#dc2626",
  "#ea580c", "#16a34a", "#0891b2", "#d97706",
];

const filtered = computed(() =>
  matieres.value.filter(m =>
    `${m.name} ${m.code}`.toLowerCase().includes(search.value.toLowerCase())
  )
);

const fetchAll = async () => {
  loading.value = true; error.value = null;
  try {
    const [matRes, semRes] = await Promise.all([
      api.get("/admin/matieres"),
      api.get("/admin/semestres"),
    ]);
    matieres.value = matRes.data.data || matRes.data;
    semestres.value = semRes.data.data || semRes.data;
  } catch (e) {
    error.value = e.response?.data?.message || "Erreur de chargement";
  } finally { loading.value = false; }
};

const semNom = (id) => semestres.value.find(s => s._id === id)?.name || "—";

const openCreate = () => {
  editMode.value = false; editId.value = null;
  form.value = { name: "", code: "", credits: "", duree: "", description: "", color: "#2563eb", semester_id: "" };
  showModal.value = true;
};

const openEdit = (m) => {
  editMode.value = true; editId.value = m._id;
  form.value = {
    name: m.name, code: m.code, credits: m.credits, duree: m.duree,
    description: m.description || "", color: m.color || "#2563eb",
    semester_id: m.semester_id?._id || m.semester_id || "",
  };
  showModal.value = true;
};

const save = async () => {
  saving.value = true;
  try {
    if (editMode.value) await api.put(`/admin/matieres/${editId.value}`, form.value);
    else await api.post("/admin/matieres", form.value);
    showModal.value = false;
    await fetchAll();
  } catch (e) {
    error.value = e.response?.data?.message || "Erreur lors de la sauvegarde";
  } finally { saving.value = false; }
};

const confirmDelete = (id) => { deleteId.value = id; showDeleteConfirm.value = true; };
const deleteMatiere = async () => {
  try {
    await api.delete(`/admin/matieres/${deleteId.value}`);
    showDeleteConfirm.value = false;
    await fetchAll();
  } catch (e) { error.value = e.response?.data?.message || "Erreur"; }
};

onMounted(fetchAll);
</script>

<template>
  <div class="pt-8">

    <div class="flex items-center justify-between mb-8">
      <div>
        <h1 class="text-2xl font-bold text-white">Matières</h1>
        <p class="mt-1 text-sm text-gray-500">Gérer les matières enseignées</p>
      </div>
      <button @click="openCreate"
        class="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white rounded-xl bg-primary hover:opacity-90 transition-colors shadow-lg shadow-blue-900/30">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        Ajouter
      </button>
    </div>

    <div class="relative mb-6">
      <svg class="absolute w-4 h-4 text-gray-500 -translate-y-1/2 left-3 top-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
      <input v-model="search" type="text" placeholder="Rechercher une matière…"
        class="w-full py-3 pl-10 pr-4 text-sm text-gray-200 placeholder-gray-600 transition-colors border rounded-xl bg-white/5 border-white/10 focus:outline-none focus:border-gt-blue/50" />
    </div>

    <div v-if="error" class="px-4 py-3 mb-4 text-sm text-red-300 border rounded-xl bg-red-500/10 border-red-500/20">{{ error }}</div>

    <div v-if="loading" class="flex items-center justify-center py-20">
      <div class="w-8 h-8 border-2 rounded-full border-gt-blue border-t-transparent animate-spin"></div>
    </div>

    <div v-else class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <div v-if="filtered.length === 0" class="py-12 text-center text-gray-600 col-span-full">Aucune matière</div>
      <div v-for="m in filtered" :key="m._id"
        class="relative p-5 overflow-hidden transition-all border rounded-2xl bg-white/3 border-white/5 hover:border-white/10 group">
        <!-- Color bar -->
        <div class="absolute top-0 left-0 right-0 h-1 rounded-t-2xl" :style="{ background: m.color || '#2563eb' }"></div>
        <div class="flex items-start justify-between mt-2 mb-4">
          <div class="flex items-center justify-center w-10 h-10 text-sm font-bold text-white rounded-xl"
            :style="{ background: (m.color || '#2563eb') + '25', border: `1px solid ${m.color || '#2563eb'}40` }">
            {{ m.code?.substring(0, 3) || '?' }}
          </div>
          <div class="flex items-center gap-1">
            <span class="px-2 py-0.5 text-xs rounded-full bg-white/5 text-gray-400">{{ m.credits }} crédits</span>
          </div>
        </div>
        <h3 class="mb-1 text-base font-bold leading-tight text-white">{{ m.name }}</h3>
        <p class="mb-2 font-mono text-xs text-gray-500">{{ m.code }}</p>
        <p class="text-xs text-gray-600">{{ m.duree }}h · {{ semNom(m.semester_id?._id || m.semester_id) }}</p>
        <p v-if="m.description" class="mt-2 text-xs text-gray-500 line-clamp-2">{{ m.description }}</p>
        <div class="flex gap-2 mt-4 transition-opacity opacity-0 group-hover:opacity-100">
          <button @click="openEdit(m)"
            class="flex-1 py-1.5 text-xs font-medium text-gray-300 border rounded-lg border-white/10 hover:bg-white/10 transition-colors">Modifier</button>
          <button @click="confirmDelete(m._id)"
            class="flex-1 py-1.5 text-xs font-medium text-red-400 border rounded-lg border-red-500/20 hover:bg-red-500/10 transition-colors">Supprimer</button>
        </div>
      </div>
    </div>

    <!-- Modal -->
    <Teleport to="body">
      <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <div class="w-full max-w-lg border shadow-2xl rounded-2xl bg-white/5 border-white/10 max-h-[90vh] overflow-y-auto">
          <div class="flex items-center justify-between px-6 py-5 border-b border-white/5">
            <h2 class="text-lg font-bold text-white">{{ editMode ? 'Modifier matière' : 'Ajouter matière' }}</h2>
            <button @click="showModal = false" class="p-1 text-gray-400 transition-colors rounded-lg hover:text-white hover:bg-white/10">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div class="p-6 space-y-4">
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block mb-1.5 text-xs font-medium text-gray-400">Nom *</label>
                <input v-model="form.name" type="text"
                  class="w-full px-3 py-2.5 text-sm text-white border rounded-xl bg-white/5 border-white/10 focus:outline-none focus:border-gt-blue/50 transition-colors" />
              </div>
              <div>
                <label class="block mb-1.5 text-xs font-medium text-gray-400">Code *</label>
                <input v-model="form.code" type="text"
                  class="w-full px-3 py-2.5 text-sm text-white border rounded-xl bg-white/5 border-white/10 focus:outline-none focus:border-gt-blue/50 transition-colors" />
              </div>
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block mb-1.5 text-xs font-medium text-gray-400">Crédits *</label>
                <input v-model="form.credits" type="number" min="1"
                  class="w-full px-3 py-2.5 text-sm text-white border rounded-xl bg-white/5 border-white/10 focus:outline-none focus:border-gt-blue/50 transition-colors" />
              </div>
              <div>
                <label class="block mb-1.5 text-xs font-medium text-gray-400">Durée (h) *</label>
                <input v-model="form.duree" type="number" min="1"
                  class="w-full px-3 py-2.5 text-sm text-white border rounded-xl bg-white/5 border-white/10 focus:outline-none focus:border-gt-blue/50 transition-colors" />
              </div>
            </div>
            <div>
              <label class="block mb-1.5 text-xs font-medium text-gray-400">Semestre</label>
              <select v-model="form.semester_id"
                class="w-full px-3 py-2.5 text-sm text-white border rounded-xl bg-white/5 border-white/10 focus:outline-none focus:border-gt-blue/50 transition-colors">
                <option value="">— Aucun —</option>
                <option v-for="s in semestres" :key="s._id" :value="s._id">{{ s.name }}</option>
              </select>
            </div>
            <div>
              <label class="block mb-1.5 text-xs font-medium text-gray-400">Description</label>
              <textarea v-model="form.description" rows="2"
                class="w-full px-3 py-2.5 text-sm text-white border rounded-xl bg-white/5 border-white/10 focus:outline-none focus:border-gt-blue/50 transition-colors resize-none"></textarea>
            </div>
            <div>
              <label class="block mb-2 text-xs font-medium text-gray-400">Couleur</label>
              <div class="flex flex-wrap gap-2">
                <button v-for="c in colorOptions" :key="c" @click="form.color = c"
                  class="transition-all border-2 rounded-full w-7 h-7"
                  :style="{ background: c }"
                  :class="form.color === c ? 'border-white scale-110' : 'border-transparent'">
                </button>
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
          <h3 class="mb-2 text-lg font-bold text-white">Supprimer cette matière ?</h3>
          <p class="mb-6 text-sm text-gray-400">Action irréversible.</p>
          <div class="flex gap-3">
            <button @click="showDeleteConfirm = false"
              class="flex-1 px-4 py-2 text-sm text-gray-400 transition-colors border rounded-xl border-white/10 hover:bg-white/5">Annuler</button>
            <button @click="deleteMatiere"
              class="flex-1 px-4 py-2 text-sm font-semibold text-white transition-colors bg-red-600 rounded-xl hover:bg-red-500">Supprimer</button>
          </div>
        </div>
      </div>
    </Teleport>

  </div>
</template>
