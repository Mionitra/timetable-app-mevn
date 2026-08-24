<script setup>
import { ref, onMounted } from "vue";
import api from "../../services/api";
import { useAuthStore } from "../../stores/auth";
import { RouterLink } from "vue-router";

const authStore = useAuthStore();
const user = authStore.user;

const stats = ref({ enseignants: 0, salles: 0, matieres: 0, cours: 0 });
const loading = ref(true);

const fetchStats = async () => {
  try {
    const [eRes, sRes, mRes, cRes] = await Promise.all([
      api.get("/admin/enseignants"),
      api.get("/admin/salles"),
      api.get("/admin/matieres"),
      api.get("/admin/cours"),
    ]);
    stats.value = {
      enseignants: (eRes.data.data || eRes.data).length,
      salles: (sRes.data.data || sRes.data).length,
      matieres: (mRes.data.data || mRes.data).length,
      cours: (cRes.data.data || cRes.data).length,
    };
  } catch (e) {
    console.error("Stats error", e);
  } finally { loading.value = false; }
};

const cards = [
  { title: "Enseignants", icon: "users", to: "/admin/enseignants", color: "blue", key: "enseignants", desc: "Gérer les comptes enseignants" },
  { title: "Salles", icon: "building", to: "/admin/salles", color: "purple", key: "salles", desc: "Gérer les salles de cours" },
  { title: "Matières", icon: "book", to: "/admin/matieres", color: "green", key: "matieres", desc: "Gérer les matières" },
  { title: "Cours (EDT)", icon: "calendar", to: "/admin/cours", color: "orange", key: "cours", desc: "Gérer l'emploi du temps" },
];

const colorMap = {
  blue: { bg: "bg-blue-500/10", text: "text-blue-400", border: "border-blue-500/20", stat: "text-blue-300" },
  purple: { bg: "bg-purple-500/10", text: "text-purple-400", border: "border-purple-500/20", stat: "text-purple-300" },
  green: { bg: "bg-green-500/10", text: "text-green-400", border: "border-green-500/20", stat: "text-green-300" },
  orange: { bg: "bg-orange-500/10", text: "text-orange-400", border: "border-orange-500/20", stat: "text-orange-300" },
};

onMounted(fetchStats);
</script>

<template>
  <div class="pt-8">

    <!-- Welcome -->
    <div class="mb-10">
      <h1 class="text-3xl font-bold text-white">
        Bonjour, {{ user?.first_name }} 👋
      </h1>
      <p class="mt-2 text-gray-500">Tableau de bord administrateur · Gérez votre établissement</p>
    </div>

    <!-- Stats Grid -->
    <div class="grid grid-cols-2 gap-4 mb-10 lg:grid-cols-4">
      <RouterLink v-for="c in cards" :key="c.key" :to="c.to"
        class="relative p-6 overflow-hidden transition-all border cursor-pointer rounded-2xl group"
        :class="`${colorMap[c.color].bg} ${colorMap[c.color].border} hover:scale-[1.02]`">
        <div class="flex items-center justify-between mb-4">
          <!-- Icon -->
          <div class="flex items-center justify-center border w-11 h-11 rounded-xl"
            :class="`${colorMap[c.color].bg} ${colorMap[c.color].border}`">
            <!-- Users -->
            <svg v-if="c.icon === 'users'" class="w-5 h-5" :class="colorMap[c.color].text" fill="none"
              stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <!-- Building -->
            <svg v-if="c.icon === 'building'" class="w-5 h-5" :class="colorMap[c.color].text" fill="none"
              stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            <!-- Book -->
            <svg v-if="c.icon === 'book'" class="w-5 h-5" :class="colorMap[c.color].text" fill="none"
              stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <!-- Calendar -->
            <svg v-if="c.icon === 'calendar'" class="w-5 h-5" :class="colorMap[c.color].text" fill="none"
              stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <svg class="w-4 h-4 text-gray-600 transition-colors group-hover:text-gray-400" fill="none"
            stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </div>
        <div>
          <div v-if="loading" class="w-8 h-6 mb-1 rounded bg-white/10 animate-pulse"></div>
          <p v-else class="mb-1 text-3xl font-bold text-white">{{ stats[c.key] }}</p>
          <p class="text-sm font-medium text-gray-300">{{ c.title }}</p>
          <p class="mt-0.5 text-xs text-gray-600">{{ c.desc }}</p>
        </div>
      </RouterLink>
    </div>

    <!-- Quick Links -->
    <div class="mb-8">
      <h2 class="mb-4 text-lg font-bold text-white">Gestion académique</h2>
      <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">

        <RouterLink to="/admin/academic-years"
          class="flex items-center gap-4 p-4 transition-all border rounded-2xl bg-white/3 border-white/5 hover:border-white/10 hover:bg-white/5 group">
          <div class="flex items-center justify-center w-10 h-10 rounded-xl bg-blue-500/10">
            <svg class="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <p class="font-medium text-white">Années académiques</p>
            <p class="text-xs text-gray-500">Définir les périodes scolaires</p>
          </div>
          <svg class="w-4 h-4 ml-auto text-gray-600 transition-colors group-hover:text-gray-400" fill="none"
            stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </RouterLink>

        <RouterLink to="/admin/semestres"
          class="flex items-center gap-4 p-4 transition-all border rounded-2xl bg-white/3 border-white/5 hover:border-white/10 hover:bg-white/5 group">
          <div class="flex items-center justify-center w-10 h-10 rounded-xl bg-purple-500/10">
            <svg class="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <div>
            <p class="font-medium text-white">Semestres</p>
            <p class="text-xs text-gray-500">Organiser par semestres</p>
          </div>
          <svg class="w-4 h-4 ml-auto text-gray-600 transition-colors group-hover:text-gray-400" fill="none"
            stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </RouterLink>

      </div>
    </div>

  </div>
</template>
