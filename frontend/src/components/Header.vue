<script setup>
import { computed } from "vue";
import { useRoute } from "vue-router";
import { useAuthStore } from "../stores/auth";

const route = useRoute();
const authStore = useAuthStore();

/* ============================
   UTILISATEUR
============================ */

const userInitials = computed(() => {
  const user = authStore.user;

  if (!user) return "U";

  const firstName = user.first_name || "";
  const lastName = user.last_name || "";

  return `${firstName.charAt(0)}${lastName.charAt(0)}`
    .toUpperCase()
    .trim() || "U";
});

/* ============================
   NOM UTILISATEUR
============================ */

const userName = computed(() => {
  const user = authStore.user;

  if (!user) return "Utilisateur";

  return (
    user.name ||
    `${user.first_name || ""} ${user.last_name || ""}`.trim() ||
    "Utilisateur"
  );
});

/* ============================
   BREADCRUMBS
============================ */

const breadcrumbs = computed(() => {
  const path = route.path;

  if (path === "/etudiant") {
    return ["Accueil", "Tableau de bord"];
  }

  if (path.includes("/schedule")) {
    return ["Accueil", "Calendrier"];
  }

  if (path.includes("/subjects")) {
    return ["Accueil", "Matières"];
  }

  if (path.includes("/profile")) {
    return ["Accueil", "Profil"];
  }

  if (path.includes("/settings")) {
    return ["Accueil", "Paramètres"];
  }

  if (path.includes("/notifications")) {
    return ["Accueil", "Notifications"];
  }

  return ["Accueil", "Tableau de bord"];
});

/* ============================
   DATE
============================ */

const currentDate = new Date().toLocaleDateString("fr-FR", {
  day: "numeric",
  month: "short",
});
</script>

<template>
  <header class="flex items-center justify-between h-20 px-4 sm:px-8 shrink-0">
    <!-- LEFT -->
    <div class="flex items-center min-w-0 gap-3 sm:gap-6">

      <!-- Breadcrumb -->
      <div class="flex items-center min-w-0 gap-2 text-sm">

        <!-- Home -->
        <svg class="flex-shrink-0 w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>

        <div class="flex items-center min-w-0">
          <template v-for="(crumb, index) in breadcrumbs" :key="index">
            <span class="truncate" :class="index === breadcrumbs.length - 1
                ? 'text-gray-200 font-medium'
                : 'text-gray-500'
              ">
              {{ crumb }}
            </span>

            <span v-if="index < breadcrumbs.length - 1" class="mx-2 text-gray-600">
              /
            </span>
          </template>
        </div>
      </div>

      <!-- DATE -->
      <div
        class="items-center hidden gap-2 px-3 py-1.5 text-sm font-medium text-gray-300 border rounded-full sm:flex bg-white/5 border-white/5">
        <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>

        <span>
          {{ currentDate }}
        </span>
      </div>
    </div>

    <!-- RIGHT -->
    <div class="flex items-center gap-2 sm:gap-4">

      <!-- Avatars -->
      <div class="items-center hidden -space-x-2 md:flex">

        <img class="object-cover w-8 h-8 border-2 rounded-full border-gt-card" src="https://i.pravatar.cc/100?img=1"
          alt="Utilisateur" />

        <img class="object-cover w-8 h-8 border-2 rounded-full border-gt-card" src="https://i.pravatar.cc/100?img=2"
          alt="Utilisateur" />

        <img class="object-cover w-8 h-8 border-2 rounded-full border-gt-card" src="https://i.pravatar.cc/100?img=3"
          alt="Utilisateur" />

        <button type="button" title="Ajouter"
          class="relative z-10 flex items-center justify-center w-8 h-8 text-white transition-colors border-2 rounded-full bg-gt-blue border-gt-card hover:bg-blue-500">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        </button>
      </div>

      <!-- Separator -->
      <div class="hidden w-px h-6 mx-1 md:block bg-white/10"></div>

      <!-- Search -->
      <button type="button" title="Rechercher"
        class="flex items-center justify-center w-10 h-10 text-gray-300 transition-colors border rounded-full bg-white/5 border-white/5 hover:text-white hover:bg-white/10">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </button>

      <!-- Notifications -->
      <RouterLink to="/etudiant/notifications" title="Notifications"
        class="relative flex items-center justify-center w-10 h-10 text-gray-300 transition-colors border rounded-full bg-white/5 border-white/5 hover:text-white hover:bg-white/10">
        <span class="absolute w-2 h-2 bg-red-500 border-2 rounded-full top-2 right-2 border-gt-card"></span>

        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
      </RouterLink>

      <!-- Profile -->
      <RouterLink to="/etudiant/profile" title="Mon profil"
        class="relative flex items-center justify-center w-10 h-10 overflow-hidden transition-colors border-2 rounded-full cursor-pointer border-white/10 hover:border-gt-blue">
        <img v-if="authStore.user?.profileImage" :src="authStore.user.profileImage" :alt="userName"
          class="object-cover w-full h-full" />

        <span v-else class="flex items-center justify-center w-full h-full text-sm font-semibold text-white bg-gt-blue">
          {{ userInitials }}
        </span>
      </RouterLink>

    </div>
  </header>
</template>