<script setup>
import { ref, onMounted, computed } from "vue";
import api from "../../services/api";

const cours = ref([]);
const matieres = ref([]);
const salles = ref([]);
const enseignants = ref([]);
const loading = ref(false);
const error = ref(null);
const search = ref("");

const showModal = ref(false);
const editMode = ref(false);
const saving = ref(false);
const form = ref({
  subject_id: "", salle_id: "", teacher_id: "",
  day_of_week: 1, start_time: "08:00", end_time: "10:00",
  start_date: "", end_date: "", type: "CM", description: "",
});
const editId = ref(null);
const showDeleteConfirm = ref(false);
const deleteId = ref(null);

const days = ["", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"];

const filtered = computed(() =>
  cours.value.filter(c => {
    const mat = matieres.value.find(m => m._id === (c.subject_id?._id || c.subject_id));
    return `${mat?.name || ""} ${mat?.code || ""}`.toLowerCase().includes(search.value.toLowerCase());
  })
);

const fetchAll = async () => {
  loading.value = true; error.value = null;
  try {
    const [cRes, mRes, sRes, eRes] = await Promise.all([
      api.get("/admin/cours"),
      api.get("/admin/matieres"),
      api.get("/admin/salles"),
      api.get("/admin/enseignants"),
    ]);
    cours.value = cRes.data.data || cRes.data;
    matieres.value = mRes.data.data || mRes.data;
    salles.value = sRes.data.data || sRes.data;
    enseignants.value = eRes.data.data || eRes.data;
  } catch (e) {
    error.value = e.response?.data?.message || "Erreur de chargement";
  } finally { loading.value = false; }
};

const matName = (id) => matieres.value.find(m => m._id === (id?._id || id))?.name || "—";
const salName = (id) => salles.value.find(s => s._id === (id?._id || id))?.name || "—";
const ensName = (id) => {
  const e = enseignants.value.find(e => e._id === (id?._id || id));
  return e ? `${e.first_name} ${e.last_name}` : "—";
};

const openCreate = () => {
  editMode.value = false; editId.value = null;
  form.value = {
    subject_id: "", salle_id: "", teacher_id: "",
    day_of_week: 1, start_time: "08:00", end_time: "10:00",
    start_date: "", end_date: "", type: "CM", description: "",
  };
  showModal.value = true;
};

const openEdit = (c) => {
  editMode.value = true; editId.value = c._id;
  form.value = {
    subject_id: c.subject_id?._id || c.subject_id,
    salle_id: c.salle_id?._id || c.salle_id,
    teacher_id: c.teacher_id?._id || c.teacher_id,
    day_of_week: c.day_of_week,
    start_time: c.start_time, end_time: c.end_time,
    start_date: c.start_date?.substring(0, 10) || "",
    end_date: c.end_date?.substring(0, 10) || "",
    type: c.type, description: c.description || "",
  };
  showModal.value = true;
};

const save = async () => {
  saving.value = true;
  try {
    if (editMode.value) await api.put(`/admin/cours/${editId.value}`, form.value);
    else await api.post("/admin/cours", form.value);
    showModal.value = false;
    await fetchAll();
  } catch (e) {
    error.value = e.response?.data?.message || "Erreur lors de la sauvegarde";
  } finally { saving.value = false; }
};

const confirmDelete = (id) => { deleteId.value = id; showDeleteConfirm.value = true; };
const deleteCours = async () => {
  try {
    await api.delete(`/admin/cours/${deleteId.value}`);
    showDeleteConfirm.value = false;
    await fetchAll();
  } catch (e) { error.value = e.response?.data?.message || "Erreur"; }
};

const typeColor = (t) => ({
  CM: "bg-blue-500/10 text-blue-300",
  TD: "bg-purple-500/10 text-purple-300",
  TP: "bg-green-500/10 text-green-300",
}[t] || "bg-white/10 text-gray-300");

onMounted(fetchAll);
</script>

<template>
  <div class="pt-8">

    <div class="flex items-center justify-between mb-8">
      <div>
        <h1 class="text-2xl font-bold text-white">Cours — Emploi du temps</h1>
        <p class="mt-1 text-sm text-gray-500">Gérer les séances de cours</p>
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
      <input v-model="search" type="text" placeholder="Rechercher par matière…"
        class="w-full py-3 pl-10 pr-4 text-sm text-gray-200 placeholder-gray-600 transition-colors border rounded-xl bg-white/5 border-white/10 focus:outline-none focus:border-gt-blue/50" />
    </div>

    <div v-if="error" class="px-4 py-3 mb-4 text-sm text-red-300 border rounded-xl bg-red-500/10 border-red-500/20">{{ error }}</div>

    <div v-if="loading" class="flex items-center justify-center py-20">
      <div class="w-8 h-8 border-2 rounded-full border-gt-blue border-t-transparent animate-spin"></div>
    </div>

    <div v-else class="overflow-hidden border rounded-2xl border-white/5 bg-white/3">
      <table class="w-full text-sm">
        <thead>
          <tr class="border-b border-white/5 bg-white/5">
            <th class="px-6 py-4 font-semibold text-left text-gray-400">Matière</th>
            <th class="hidden px-6 py-4 font-semibold text-left text-gray-400 sm:table-cell">Type</th>
            <th class="hidden px-6 py-4 font-semibold text-left text-gray-400 md:table-cell">Jour / Horaire</th>
            <th class="hidden px-6 py-4 font-semibold text-left text-gray-400 lg:table-cell">Salle</th>
            <th class="hidden px-6 py-4 font-semibold text-left text-gray-400 lg:table-cell">Enseignant</th>
            <th class="px-6 py-4 font-semibold text-right text-gray-400">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="filtered.length === 0">
            <td colspan="6" class="px-6 py-12 text-center text-gray-600">Aucun cours</td>
          </tr>
          <tr v-for="c in filtered" :key="c._id"
            class="transition-colors border-b border-white/5 hover:bg-white/3 last:border-0">
            <td class="px-6 py-4 font-medium text-white">{{ matName(c.subject_id) }}</td>
            <td class="hidden px-6 py-4 sm:table-cell">
              <span class="px-2 py-0.5 text-xs font-bold rounded-full" :class="typeColor(c.type)">{{ c.type }}</span>
            </td>
            <td class="hidden px-6 py-4 text-gray-400 md:table-cell">
              {{ days[c.day_of_week] }} · {{ c.start_time }}–{{ c.end_time }}
            </td>
            <td class="hidden px-6 py-4 text-gray-400 lg:table-cell">{{ salName(c.salle_id) }}</td>
            <td class="hidden px-6 py-4 text-gray-400 lg:table-cell">{{ ensName(c.teacher_id) }}</td>
            <td class="px-6 py-4 text-right">
              <div class="flex items-center justify-end gap-2">
                <button @click="openEdit(c)"
                  class="p-2 text-gray-400 transition-colors rounded-lg hover:text-white hover:bg-white/10">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <button @click="confirmDelete(c._id)"
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
        <div class="w-full max-w-lg border shadow-2xl rounded-2xl bg-white/5 border-white/10 max-h-[90vh] overflow-y-auto">
          <div class="flex items-center justify-between px-6 py-5 border-b border-white/5">
            <h2 class="text-lg font-bold text-white">{{ editMode ? 'Modifier cours' : 'Ajouter cours' }}</h2>
            <button @click="showModal = false" class="p-1 text-gray-400 transition-colors rounded-lg hover:text-white hover:bg-white/10">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div class="p-6 space-y-4">
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block mb-1.5 text-xs font-medium text-gray-400">Matière *</label>
                <select v-model="form.subject_id"
                  class="w-full px-3 py-2.5 text-sm text-white border rounded-xl bg-white/5 border-white/10 focus:outline-none focus:border-gt-blue/50 transition-colors">
                  <option value="">— Sélectionner —</option>
                  <option v-for="m in matieres" :key="m._id" :value="m._id">{{ m.name }}</option>
                </select>
              </div>
              <div>
                <label class="block mb-1.5 text-xs font-medium text-gray-400">Type *</label>
                <select v-model="form.type"
                  class="w-full px-3 py-2.5 text-sm text-white border rounded-xl bg-white/5 border-white/10 focus:outline-none focus:border-gt-blue/50 transition-colors">
                  <option value="CM">CM</option>
                  <option value="TD">TD</option>
                  <option value="TP">TP</option>
                </select>
              </div>
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block mb-1.5 text-xs font-medium text-gray-400">Salle *</label>
                <select v-model="form.salle_id"
                  class="w-full px-3 py-2.5 text-sm text-white border rounded-xl bg-white/5 border-white/10 focus:outline-none focus:border-gt-blue/50 transition-colors">
                  <option value="">— Sélectionner —</option>
                  <option v-for="s in salles" :key="s._id" :value="s._id">{{ s.name }}</option>
                </select>
              </div>
              <div>
                <label class="block mb-1.5 text-xs font-medium text-gray-400">Enseignant *</label>
                <select v-model="form.teacher_id"
                  class="w-full px-3 py-2.5 text-sm text-white border rounded-xl bg-white/5 border-white/10 focus:outline-none focus:border-gt-blue/50 transition-colors">
                  <option value="">— Sélectionner —</option>
                  <option v-for="e in enseignants" :key="e._id" :value="e._id">{{ e.first_name }} {{ e.last_name }}</option>
                </select>
              </div>
            </div>
            <div>
              <label class="block mb-1.5 text-xs font-medium text-gray-400">Jour *</label>
              <select v-model="form.day_of_week"
                class="w-full px-3 py-2.5 text-sm text-white border rounded-xl bg-white/5 border-white/10 focus:outline-none focus:border-gt-blue/50 transition-colors">
                <option v-for="(d, i) in days.slice(1)" :key="i+1" :value="i+1">{{ d }}</option>
              </select>
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block mb-1.5 text-xs font-medium text-gray-400">Heure début *</label>
                <input v-model="form.start_time" type="time"
                  class="w-full px-3 py-2.5 text-sm text-white border rounded-xl bg-white/5 border-white/10 focus:outline-none focus:border-gt-blue/50 transition-colors" />
              </div>
              <div>
                <label class="block mb-1.5 text-xs font-medium text-gray-400">Heure fin *</label>
                <input v-model="form.end_time" type="time"
                  class="w-full px-3 py-2.5 text-sm text-white border rounded-xl bg-white/5 border-white/10 focus:outline-none focus:border-gt-blue/50 transition-colors" />
              </div>
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
            <div>
              <label class="block mb-1.5 text-xs font-medium text-gray-400">Description</label>
              <textarea v-model="form.description" rows="2"
                class="w-full px-3 py-2.5 text-sm text-white border rounded-xl bg-white/5 border-white/10 focus:outline-none focus:border-gt-blue/50 transition-colors resize-none"></textarea>
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
          <h3 class="mb-2 text-lg font-bold text-white">Supprimer ce cours ?</h3>
          <p class="mb-6 text-sm text-gray-400">Action irréversible.</p>
          <div class="flex gap-3">
            <button @click="showDeleteConfirm = false"
              class="flex-1 px-4 py-2 text-sm text-gray-400 transition-colors border rounded-xl border-white/10 hover:bg-white/5">Annuler</button>
            <button @click="deleteCours"
              class="flex-1 px-4 py-2 text-sm font-semibold text-white transition-colors bg-red-600 rounded-xl hover:bg-red-500">Supprimer</button>
          </div>
        </div>
      </div>
    </Teleport>

  </div>
</template>
