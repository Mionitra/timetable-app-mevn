<script setup>
import { ref, onMounted, computed } from "vue";
import api from "../../services/api";

// ── State ──────────────────────────────────────────────────────────────────
const enseignants = ref([]);
const loading = ref(false);
const error = ref(null);
const search = ref("");

// Modal
const showModal = ref(false);
const editMode = ref(false);
const saving = ref(false);
const form = ref({
  first_name: "", last_name: "", email: "",
  password: "", teacher_type: "permanent", discipline: "",
});
const editId = ref(null);

// Delete confirm
const showDeleteConfirm = ref(false);
const deleteId = ref(null);

// ── Computed ───────────────────────────────────────────────────────────────
const filtered = computed(() =>
  enseignants.value.filter(e =>
    `${e.first_name} ${e.last_name} ${e.email} ${e.discipline || ""}`
      .toLowerCase().includes(search.value.toLowerCase())
  )
);

// ── API Calls ──────────────────────────────────────────────────────────────
const fetchEnseignants = async () => {
  loading.value = true;
  error.value = null;
  try {
    const res = await api.get("/admin/enseignants");
    enseignants.value = res.data.data || res.data;
  } catch (e) {
    error.value = e.response?.data?.message || "Erreur de chargement";
  } finally {
    loading.value = false;
  }
};

const openCreate = () => {
  editMode.value = false;
  editId.value = null;
  form.value = { first_name: "", last_name: "", email: "", password: "", teacher_type: "permanent", discipline: "" };
  showModal.value = true;
};

const openEdit = (e) => {
  editMode.value = true;
  editId.value = e._id;
  form.value = {
    first_name: e.first_name, last_name: e.last_name,
    email: e.email, password: "", teacher_type: e.teacher_type || "permanent",
    discipline: e.discipline || "",
  };
  showModal.value = true;
};

const save = async () => {
  saving.value = true;
  try {
    const payload = { ...form.value, role: "enseignant" };
    if (!payload.password) delete payload.password;
    if (editMode.value) {
      await api.put(`/admin/enseignants/${editId.value}`, payload);
    } else {
      await api.post("/admin/enseignants", payload);
    }
    showModal.value = false;
    await fetchEnseignants();
  } catch (e) {
    error.value = e.response?.data?.message || "Erreur lors de la sauvegarde";
  } finally {
    saving.value = false;
  }
};

const confirmDelete = (id) => {
  deleteId.value = id;
  showDeleteConfirm.value = true;
};

const deleteEnseignant = async () => {
  try {
    await api.delete(`/admin/enseignants/${deleteId.value}`);
    showDeleteConfirm.value = false;
    await fetchEnseignants();
  } catch (e) {
    error.value = e.response?.data?.message || "Erreur lors de la suppression";
  }
};

onMounted(fetchEnseignants);
</script>

<template>
  <div class="pt-8">

    <!-- Header -->
    <div class="flex items-center justify-between mb-8">
      <div>
        <h1 class="text-2xl font-bold text-white">Enseignants</h1>
        <p class="mt-1 text-sm text-gray-500">Gérer les comptes enseignants</p>
      </div>
      <button @click="openCreate" id="btn-add-enseignant"
        class="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white rounded-xl bg-primary hover:opacity-90 transition-colors shadow-lg shadow-blue-900/30">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        Ajouter
      </button>
    </div>

    <!-- Search -->
    <div class="relative mb-6">
      <svg class="absolute w-4 h-4 text-gray-500 -translate-y-1/2 left-3 top-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
      <input v-model="search" type="text" placeholder="Rechercher un enseignant…"
        class="w-full py-3 pl-10 pr-4 text-sm text-gray-200 placeholder-gray-600 transition-colors border rounded-xl bg-white/5 border-white/10 focus:outline-none focus:border-gt-blue/50 focus:bg-white/8" />
    </div>

    <!-- Error -->
    <div v-if="error" class="px-4 py-3 mb-4 text-sm text-red-300 border rounded-xl bg-red-500/10 border-red-500/20">{{ error }}</div>

    <!-- Loading -->
    <div v-if="loading" class="flex items-center justify-center py-20">
      <div class="w-8 h-8 border-2 rounded-full border-gt-blue border-t-transparent animate-spin"></div>
    </div>

    <!-- Table -->
    <div v-else class="overflow-hidden border rounded-2xl border-white/5 bg-white/3">
      <table class="w-full text-sm">
        <thead>
          <tr class="border-b border-white/5 bg-white/5">
            <th class="px-6 py-4 font-semibold text-left text-gray-400">Nom complet</th>
            <th class="px-6 py-4 font-semibold text-left text-gray-400">Email</th>
            <th class="hidden px-6 py-4 font-semibold text-left text-gray-400 md:table-cell">Discipline</th>
            <th class="hidden px-6 py-4 font-semibold text-left text-gray-400 sm:table-cell">Type</th>
            <th class="px-6 py-4 font-semibold text-right text-gray-400">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="filtered.length === 0">
            <td colspan="5" class="px-6 py-12 text-center text-gray-600">Aucun enseignant trouvé</td>
          </tr>
          <tr v-for="e in filtered" :key="e._id"
            class="transition-colors border-b border-white/5 hover:bg-white/3 last:border-0">
            <td class="px-6 py-4 font-medium text-white">{{ e.first_name }} {{ e.last_name }}</td>
            <td class="px-6 py-4 text-gray-400">{{ e.email }}</td>
            <td class="hidden px-6 py-4 text-gray-400 md:table-cell">{{ e.discipline || '—' }}</td>
            <td class="hidden px-6 py-4 sm:table-cell">
              <span class="px-2 py-0.5 text-xs rounded-full"
                :class="e.teacher_type === 'permanent' ? 'bg-green-500/10 text-green-400' : 'bg-amber-500/10 text-amber-400'">
                {{ e.teacher_type || 'permanent' }}
              </span>
            </td>
            <td class="px-6 py-4 text-right">
              <div class="flex items-center justify-end gap-2">
                <button @click="openEdit(e)"
                  class="p-2 text-gray-400 transition-colors rounded-lg hover:text-white hover:bg-white/10">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <button @click="confirmDelete(e._id)"
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

    <!-- Modal Formulaire -->
    <Teleport to="body">
      <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <div class="w-full max-w-lg border shadow-2xl rounded-2xl bg-white/5 border-white/10">
          <div class="flex items-center justify-between px-6 py-5 border-b border-white/5">
            <h2 class="text-lg font-bold text-white">{{ editMode ? 'Modifier enseignant' : 'Ajouter enseignant' }}</h2>
            <button @click="showModal = false" class="p-1 text-gray-400 transition-colors rounded-lg hover:text-white hover:bg-white/10">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div class="p-6 space-y-4">
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block mb-1.5 text-xs font-medium text-gray-400">Prénom *</label>
                <input v-model="form.first_name" type="text" required
                  class="w-full px-3 py-2.5 text-sm text-white border rounded-xl bg-white/5 border-white/10 focus:outline-none focus:border-gt-blue/50 transition-colors" />
              </div>
              <div>
                <label class="block mb-1.5 text-xs font-medium text-gray-400">Nom *</label>
                <input v-model="form.last_name" type="text" required
                  class="w-full px-3 py-2.5 text-sm text-white border rounded-xl bg-white/5 border-white/10 focus:outline-none focus:border-gt-blue/50 transition-colors" />
              </div>
            </div>
            <div>
              <label class="block mb-1.5 text-xs font-medium text-gray-400">Email *</label>
              <input v-model="form.email" type="email" required
                class="w-full px-3 py-2.5 text-sm text-white border rounded-xl bg-white/5 border-white/10 focus:outline-none focus:border-gt-blue/50 transition-colors" />
            </div>
            <div>
              <label class="block mb-1.5 text-xs font-medium text-gray-400">
                {{ editMode ? 'Nouveau mot de passe (laisser vide = inchangé)' : 'Mot de passe *' }}
              </label>
              <input v-model="form.password" type="password"
                class="w-full px-3 py-2.5 text-sm text-white border rounded-xl bg-white/5 border-white/10 focus:outline-none focus:border-gt-blue/50 transition-colors" />
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block mb-1.5 text-xs font-medium text-gray-400">Type</label>
                <select v-model="form.teacher_type"
                  class="w-full px-3 py-2.5 text-sm text-white border rounded-xl bg-white/5 border-white/10 focus:outline-none focus:border-gt-blue/50 transition-colors">
                  <option value="permanent">Permanent</option>
                  <option value="vacataire">Vacataire</option>
                </select>
              </div>
              <div>
                <label class="block mb-1.5 text-xs font-medium text-gray-400">Discipline</label>
                <input v-model="form.discipline" type="text"
                  class="w-full px-3 py-2.5 text-sm text-white border rounded-xl bg-white/5 border-white/10 focus:outline-none focus:border-gt-blue/50 transition-colors" />
              </div>
            </div>
          </div>
          <div class="flex justify-end gap-3 px-6 py-4 border-t border-white/5">
            <button @click="showModal = false"
              class="px-4 py-2 text-sm font-medium text-gray-400 transition-colors border rounded-xl border-white/10 hover:bg-white/5">
              Annuler
            </button>
            <button @click="save" :disabled="saving"
              class="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white transition-colors rounded-xl bg-primary hover:opacity-90 disabled:opacity-50">
              <div v-if="saving" class="w-4 h-4 border-2 border-white rounded-full border-t-transparent animate-spin"></div>
              {{ editMode ? 'Sauvegarder' : 'Créer' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Modal Confirmation Suppression -->
    <Teleport to="body">
      <div v-if="showDeleteConfirm" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <div class="w-full max-w-sm border shadow-2xl rounded-2xl bg-white/5 border-white/10">
          <div class="p-6 text-center">
            <div class="flex items-center justify-center w-12 h-12 mx-auto mb-4 rounded-full bg-red-500/10">
              <svg class="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 class="mb-2 text-lg font-bold text-white">Confirmer la suppression</h3>
            <p class="text-sm text-gray-400">Cette action est irréversible.</p>
          </div>
          <div class="flex gap-3 px-6 pb-6">
            <button @click="showDeleteConfirm = false"
              class="flex-1 px-4 py-2 text-sm font-medium text-gray-400 transition-colors border rounded-xl border-white/10 hover:bg-white/5">
              Annuler
            </button>
            <button @click="deleteEnseignant"
              class="flex-1 px-4 py-2 text-sm font-semibold text-white transition-colors bg-red-600 rounded-xl hover:bg-red-500">
              Supprimer
            </button>
          </div>
        </div>
      </div>
    </Teleport>

  </div>
</template>
