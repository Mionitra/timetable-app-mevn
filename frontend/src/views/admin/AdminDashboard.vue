<script setup>
import { computed } from "vue";
import { useRoute } from "vue-router";
import { useAuthStore } from "../../stores/auth";
import Sidebar from "../../components/Sidebar.vue";

const route = useRoute();
const authStore = useAuthStore();

const user = computed(() => authStore.user);

const currentDate = new Date().toLocaleDateString("fr-FR", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

const breadcrumbs = computed(() => {
  const path = route.path;
  if (path === "/admin") return ["Admin", "Tableau de bord"];
  if (path.includes("/enseignants")) return ["Admin", "Enseignants"];
  if (path.includes("/salles")) return ["Admin", "Salles"];
  if (path.includes("/academic-years")) return ["Admin", "Années académiques"];
  if (path.includes("/semestres")) return ["Admin", "Semestres"];
  if (path.includes("/matieres")) return ["Admin", "Matières"];
  if (path.includes("/cours")) return ["Admin", "Cours (EDT)"];
  return ["Admin", "Tableau de bord"];
});
</script>

<template>
  <div
    class="flex h-[calc(100vh-2rem)] sm:h-[calc(100vh-4rem)] w-full rounded-[2rem] bg-white/5/70 backdrop-blur-3xl border border-white/5 shadow-2xl overflow-hidden relative"
  >
    <!-- SIDEBAR -->
    <Sidebar />

    <!-- MAIN CONTENT -->
    <main class="relative z-10 flex flex-col flex-1 h-full min-w-0">

      <!-- TOPBAR -->
      <header class="flex items-center justify-between h-20 px-8 border-b shrink-0 border-white/5">

        <!-- Breadcrumb -->
        <div class="flex items-center gap-6">
          <div class="flex items-center gap-2 text-sm">
            <svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <span v-for="(crumb, i) in breadcrumbs" :key="i" class="flex items-center">
              <span :class="i === breadcrumbs.length - 1 ? 'text-gray-200 font-medium' : 'text-gray-500'">
                {{ crumb }}
              </span>
              <span v-if="i < breadcrumbs.length - 1" class="mx-2 text-gray-600">/</span>
            </span>
          </div>

          <!-- Date badge -->
          <div class="items-center hidden gap-2 px-3 py-1.5 text-sm font-medium text-gray-300 border rounded-full sm:flex bg-white/5 border-white/5">
            <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {{ currentDate }}
          </div>
        </div>

        <!-- Right: Admin badge + avatar -->
        <div class="flex items-center gap-4">
          <span class="hidden px-3 py-1 text-xs font-semibold text-blue-300 border rounded-full sm:block bg-blue-500/10 border-blue-500/20">
            Administrateur
          </span>
          <div class="flex items-center gap-3 pl-4 border-l border-white/10">
            <div class="hidden text-right md:block">
              <p class="text-sm font-medium text-white">{{ user?.first_name }} {{ user?.last_name }}</p>
              <p class="text-xs text-gray-500">{{ user?.email }}</p>
            </div>
            <div class="flex items-center justify-center w-10 h-10 text-sm font-bold text-white rounded-full bg-gt-blue">
              {{ (user?.first_name?.[0] || 'A').toUpperCase() }}
            </div>
          </div>
        </div>
      </header>

      <!-- PAGE CONTENT -->
      <div class="relative z-10 flex-1 px-4 pb-8 overflow-y-auto sm:px-8 custom-scrollbar">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </div>

    </main>
  </div>
</template>

<style scoped>
@reference "tailwindcss";

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
  transform: translateY(8px);
}

.custom-scrollbar::-webkit-scrollbar { width: 6px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(255,255,255,0.1);
  border-radius: 10px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: rgba(255,255,255,0.2);
}
</style>