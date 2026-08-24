<script setup>
import { ref, onMounted, computed } from "vue";
import api from "../../services/api";

const cours = ref([]);
const matieres = ref([]);
const groupes = ref([]);
const salles = ref([]);
const enseignants = ref([]);

const loading = ref(false);
const error = ref(null);
const search = ref("");

const showModal = ref(false);
const editMode = ref(false);
const saving = ref(false);
const editId = ref(null);

const showDeleteConfirm = ref(false);
const deleteId = ref(null);

const emptyForm = () => ({
  subject_id: "",
  group_id: "",
  salle_id: "",
  teacher_id: "",
  day_of_week: 1,
  start_time: "07:00",
  end_time: "09:00",
  start_date: "",
  end_date: "",
  type: "CM",
  description: "",
});

const form = ref(emptyForm());

const days = ["", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"];

const filtered = computed(() => {
  const value = search.value.toLowerCase().trim();
  if (!value) return cours.value;

  return cours.value.filter((c) => {
    const mat = matieres.value.find((m) => m._id === (c.subject_id?._id || c.subject_id));
    const group = groupes.value.find((g) => g._id === (c.group_id?._id || c.group_id));
    const text = `${mat?.name || ""} ${mat?.code || ""} ${group?.name || ""}`.toLowerCase();
    return text.includes(value);
  });
});

const fetchAll = async () => {
  loading.value = true;
  error.value = null;

  try {
    const [cRes, mRes, gRes, sRes, eRes] = await Promise.allSettled([
      api.get("/admin/cours"),
      api.get("/admin/matieres"),
      api.get("/admin/groupes"),
      api.get("/admin/salles"),
      api.get("/admin/enseignants"),
    ]);

    // COURS
    if (cRes.status === "fulfilled") {
      cours.value = cRes.value.data.data || cRes.value.data || [];
    } else {
      console.error("Erreur cours :", cRes.reason.response?.data || cRes.reason);
      throw cRes.reason;
    }

    // MATIERES
    if (mRes.status === "fulfilled") {
      matieres.value = mRes.value.data.data || mRes.value.data || [];
    } else {
      console.error("Erreur matières :", mRes.reason.response?.data || mRes.reason);
      matieres.value = [];
    }

    // GROUPES
    if (gRes.status === "fulfilled") {
      groupes.value = gRes.value.data.data || gRes.value.data || [];
    } else {
      console.error("Erreur groupes :", gRes.reason.response?.data || gRes.reason);
      groupes.value = [];
    }

    // SALLES
    if (sRes.status === "fulfilled") {
      salles.value = sRes.value.data.data || sRes.value.data || [];
    } else {
      console.error("Erreur salles :", sRes.reason.response?.data || sRes.reason);
      salles.value = [];
    }

    // ENSEIGNANTS
    if (eRes.status === "fulfilled") {
      enseignants.value = eRes.value.data.data || eRes.value.data || [];
    } else {
      console.error("Erreur enseignants :", eRes.reason.response?.data || eRes.reason);
      enseignants.value = [];
    }
  } catch (e) {
    console.error("Erreur chargement cours :", e);
    error.value = e.response?.data?.message || "Erreur de chargement des cours";
  } finally {
    loading.value = false;
  }
};

const findById = (list, id) => {
  const realId = id?._id || id;
  return list.value.find((item) => item._id === realId);
};

const matName = (id) => findById(matieres, id)?.name || "—";
const groupName = (id) => findById(groupes, id)?.name || "—";
const salName = (id) => findById(salles, id)?.name || "—";
const ensName = (id) => {
  const teacher = findById(enseignants, id);
  if (!teacher) return "—";
  return `${teacher.first_name || ""} ${teacher.last_name || ""}`.trim() || "—";
};


const openCreate = () => {
  editMode.value = false;
  editId.value = null;
  form.value = emptyForm();
  error.value = null;
  showModal.value = true;
};

const openEdit = (c) => {
  editMode.value = true;
  editId.value = c._id;

  form.value = {
    subject_id: c.subject_id?._id || c.subject_id || "",
    group_id: c.group_id?._id || c.group_id || "",
    salle_id: c.salle_id?._id || c.salle_id || "",
    teacher_id: c.teacher_id?._id || c.teacher_id || "",
    day_of_week: Number(c.day_of_week) || 1,
    start_time: c.start_time || "08:00",
    end_time: c.end_time || "10:00",
    start_date: c.start_date ? new Date(c.start_date).toISOString().split("T")[0] : "",
    end_date: c.end_date ? new Date(c.end_date).toISOString().split("T")[0] : "",
    type: c.type || "CM",
    description: c.description || "",
  };

  error.value = null;
  showModal.value = true;
};

const validateForm = () => {
  const f = form.value;

  if (!f.subject_id) { error.value = "Veuillez sélectionner une matière."; return false; }
  if (!f.group_id) { error.value = "Veuillez sélectionner un groupe."; return false; }
  if (!f.salle_id) { error.value = "Veuillez sélectionner une salle."; return false; }
  if (!f.teacher_id) { error.value = "Veuillez sélectionner un enseignant."; return false; }
  if (!f.start_date) { error.value = "Veuillez sélectionner une date de début."; return false; }
  if (!f.end_date) { error.value = "Veuillez sélectionner une date de fin."; return false; }

  if (f.start_date > f.end_date) {
    error.value = "La date de début doit être antérieure à la date de fin.";
    return false;
  }

  if (f.start_time >= f.end_time) {
    error.value = "L'heure de début doit être antérieure à l'heure de fin.";
    return false;
  }

  return true;
};

const save = async () => {
  error.value = null;
  if (!validateForm()) return;

  saving.value = true;

  try {
    const data = {
      subject_id: form.value.subject_id,
      group_id: form.value.group_id,
      salle_id: form.value.salle_id,
      teacher_id: form.value.teacher_id,
      day_of_week: Number(form.value.day_of_week),
      start_time: form.value.start_time,
      end_time: form.value.end_time,
      start_date: form.value.start_date,
      end_date: form.value.end_date,
      type: form.value.type,
      description: form.value.description?.trim() || null,
    };

    if (editMode.value) {
      await api.put(`/admin/cours/${editId.value}`, data);
    } else {
      await api.post("/admin/cours", data);
    }

    showModal.value = false;
    await fetchAll();
  } catch (e) {
    console.error("Erreur sauvegarde cours :", e);
    error.value = e.response?.data?.message || "Erreur lors de la sauvegarde";
  } finally {
    saving.value = false;
  }
};

const confirmDelete = (id) => {
  deleteId.value = id;
  showDeleteConfirm.value = true;
};

const deleteCours = async () => {
  try {
    await api.delete(`/admin/cours/${deleteId.value}`);
    showDeleteConfirm.value = false;
    deleteId.value = null;
    await fetchAll();
  } catch (e) {
    error.value = e.response?.data?.message || "Erreur lors de la suppression";
  }
};

const typeColor = (t) => {
  const map = {
    CM: "bg-blue-500/10 text-blue-300",
    TD: "bg-purple-500/10 text-purple-300",
    TP: "bg-green-500/10 text-green-300",
  };
  return map[t] || "bg-white/10 text-gray-300";
};

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
      <svg class="absolute w-4 h-4 text-gray-500 -translate-y-1/2 left-3 top-1/2" fill="none" stroke="currentColor"
        viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
      <input v-model="search" type="text" placeholder="Rechercher par matière ou groupe…"
        class="w-full py-3 pl-10 pr-4 text-sm text-gray-200 placeholder-gray-600 transition-colors border rounded-xl bg-white/5 border-white/10 focus:outline-none focus:border-gt-blue/50" />
    </div>

    <div v-if="error" class="px-4 py-3 mb-4 text-sm text-red-300 border rounded-xl bg-red-500/10 border-red-500/20">
      {{ error }}
    </div>

    <div v-if="loading" class="flex items-center justify-center py-20">
      <div class="w-8 h-8 border-2 rounded-full border-gt-blue border-t-transparent animate-spin"></div>
    </div>

    <div v-else class="overflow-hidden border rounded-2xl border-white/5 bg-white/3">
      <table class="w-full text-sm">
        <thead>
          <tr class="border-b border-white/5 bg-white/5">
            <th class="px-6 py-4 font-semibold text-left text-gray-400">Matière</th>
            <th class="hidden px-6 py-4 font-semibold text-left text-gray-400 md:table-cell">Groupe</th>
            <th class="hidden px-6 py-4 font-semibold text-left text-gray-400 sm:table-cell">Type</th>
            <th class="hidden px-6 py-4 font-semibold text-left text-gray-400 md:table-cell">Jour / Horaire</th>
            <th class="hidden px-6 py-4 font-semibold text-left text-gray-400 lg:table-cell">Salle</th>
            <th class="hidden px-6 py-4 font-semibold text-left text-gray-400 lg:table-cell">Enseignant</th>
            <th class="px-6 py-4 font-semibold text-right text-gray-400">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="filtered.length === 0">
            <td colspan="7" class="px-6 py-12 text-center text-gray-600">Aucun cours</td>
          </tr>
          <tr v-for="c in filtered" :key="c._id"
            class="transition-colors border-b border-white/5 hover:bg-white/3 last:border-0">
            <td class="px-6 py-4 font-medium text-white">{{ matName(c.subject_id) }}</td>
            <td class="hidden px-6 py-4 text-gray-400 md:table-cell">{{ groupName(c.group_id) }}</td>
            <td class="hidden px-6 py-4 sm:table-cell">
              <span class="px-2 py-0.5 text-xs font-bold rounded-full" :class="typeColor(c.type)">{{ c.type }}</span>
            </td>
            <td class="hidden px-6 py-4 text-gray-400 md:table-cell">
              {{ days[c.day_of_week] }} · {{ c.start_time }} – {{ c.end_time }}
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


    <Teleport to="body">
      <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-white/5 backdrop-blur-sm">
        <div
          class="w-full max-w-lg border shadow-2xl rounded-2xl bg-white/5 border-white/10 max-h-[90vh] overflow-y-auto">
          <!-- HEADER -->
          <div class="flex items-center justify-between px-6 py-5 border-b border-white/5">
            <h2 class="text-lg font-bold text-white">
              {{ editMode ? "Modifier cours" : "Ajouter cours" }}
            </h2>
            <button @click="showModal = false"
              class="p-1 text-gray-400 transition-colors rounded-lg hover:text-white hover:bg-white/10">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <!-- FORMULAIRE -->
          <div class="p-6 space-y-4">
            <!-- Matière + Groupe -->
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block mb-1.5 text-xs font-medium text-gray-400">Matière *</label>
                <select v-model="form.subject_id"
                  class="w-full px-3 py-2.5 text-sm text-white border rounded-xl bg-white/5 border-white/10 focus:outline-none focus:border-gt-blue/50">
                  <option value="">— Sélectionner —</option>
                  <option v-for="m in matieres" :key="m._id" :value="m._id">{{ m.name }}</option>
                </select>
              </div>
              <div>
                <label class="block mb-1.5 text-xs font-medium text-gray-400">Groupe *</label>
                <select v-model="form.group_id"
                  class="w-full px-3 py-2.5 text-sm text-white border rounded-xl bg-white/5 border-white/10 focus:outline-none focus:border-gt-blue/50">
                  <option value="">— Sélectionner —</option>
                  <option v-for="g in groupes" :key="g._id" :value="g._id">{{ g.name }}</option>
                </select>
              </div>
            </div>

            <!-- Type + Salle -->
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block mb-1.5 text-xs font-medium text-gray-400">Type *</label>
                <select v-model="form.type"
                  class="w-full px-3 py-2.5 text-sm text-white border rounded-xl bg-white/5 border-white/10 focus:outline-none focus:border-gt-blue/50">
                  <option value="CM">CM</option>
                  <option value="TD">TD</option>
                  <option value="TP">TP</option>
                </select>
              </div>
              <div>
                <label class="block mb-1.5 text-xs font-medium text-gray-400">Salle *</label>
                <select v-model="form.salle_id"
                  class="w-full px-3 py-2.5 text-sm text-white border rounded-xl bg-white/5 border-white/10 focus:outline-none focus:border-gt-blue/50">
                  <option value="">— Sélectionner —</option>
                  <option v-for="s in salles" :key="s._id" :value="s._id">{{ s.name }}</option>
                </select>
              </div>
            </div>

            <!-- Enseignant + Jour (côte à côte) -->
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block mb-1.5 text-xs font-medium text-gray-400">Enseignant *</label>
                <select v-model="form.teacher_id"
                  class="w-full px-3 py-2.5 text-sm text-white border rounded-xl bg-white/5 border-white/10 focus:outline-none focus:border-gt-blue/50">
                  <option value="">— Sélectionner —</option>
                  <option v-for="e in enseignants" :key="e._id" :value="e._id">
                    {{ e.first_name }} {{ e.last_name }}
                  </option>
                </select>
              </div>
              <div>
                <label class="block mb-1.5 text-xs font-medium text-gray-400">Jour *</label>
                <select v-model="form.day_of_week"
                  class="w-full px-3 py-2.5 text-sm text-white border rounded-xl bg-white/5 border-white/10 focus:outline-none focus:border-gt-blue/50">
                  <option v-for="(d, i) in days.slice(1)" :key="i + 1" :value="i + 1">{{ d }}</option>
                </select>
              </div>
            </div>

            <!-- Heures -->
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block mb-1.5 text-xs font-medium text-gray-400">Heure début *</label>
                <input v-model="form.start_time" type="time"
                  class="w-full px-3 py-2.5 text-sm text-white border rounded-xl bg-white/5 border-white/10 focus:outline-none focus:border-gt-blue/50" />
              </div>
              <div>
                <label class="block mb-1.5 text-xs font-medium text-gray-400">Heure fin *</label>
                <input v-model="form.end_time" type="time"
                  class="w-full px-3 py-2.5 text-sm text-white border rounded-xl bg-white/5 border-white/10 focus:outline-none focus:border-gt-blue/50" />
              </div>
            </div>

            <!-- Dates -->
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block mb-1.5 text-xs font-medium text-gray-400">Date début *</label>
                <input v-model="form.start_date" type="date"
                  class="w-full px-3 py-2.5 text-sm text-white border rounded-xl bg-white/5 border-white/10 focus:outline-none focus:border-gt-blue/50" />
              </div>
              <div>
                <label class="block mb-1.5 text-xs font-medium text-gray-400">Date fin *</label>
                <input v-model="form.end_date" type="date"
                  class="w-full px-3 py-2.5 text-sm text-white border rounded-xl bg-white/5 border-white/10 focus:outline-none focus:border-gt-blue/50" />
              </div>
            </div>

            <!-- Description -->
            <div>
              <label class="block mb-1.5 text-xs font-medium text-gray-400">Description</label>
              <textarea v-model="form.description" rows="2"
                class="w-full px-3 py-2.5 text-sm text-white border rounded-xl bg-white/5 border-white/10 focus:outline-none focus:border-gt-blue/50 resize-none"></textarea>
            </div>
          </div>

          <!-- FOOTER -->
          <div class="flex justify-end gap-3 px-6 py-4 border-t border-white/5">
            <button @click="showModal = false"
              class="px-4 py-2 text-sm text-gray-400 transition-colors border rounded-xl border-white/10 hover:bg-white/5">
              Annuler
            </button>
            <button @click="save" :disabled="saving"
              class="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white transition-colors rounded-xl bg-primary hover:opacity-90 disabled:opacity-50">
              <div v-if="saving" class="w-4 h-4 border-2 border-white rounded-full border-t-transparent animate-spin">
              </div>
              {{ editMode ? "Sauvegarder" : "Créer" }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <Teleport to="body">
      <div v-if="showDeleteConfirm"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <div class="w-full max-w-sm p-6 text-center border shadow-2xl bg-white/5 rounded-2xl border-white/10">
          <h3 class="mb-2 text-lg font-bold text-white">Supprimer ce cours ?</h3>
          <p class="mb-6 text-sm text-gray-400">Action irréversible.</p>
          <div class="flex gap-3">
            <button @click="showDeleteConfirm = false"
              class="flex-1 px-4 py-2 text-sm text-gray-400 transition-colors border rounded-xl border-white/10 hover:bg-white/5">
              Annuler
            </button>
            <button @click="deleteCours"
              class="flex-1 px-4 py-2 text-sm font-semibold text-white transition-colors bg-red-600 rounded-xl hover:bg-red-500">
              Supprimer
            </button>
          </div>
        </div>
      </div>
    </Teleport>

  </div>
</template>