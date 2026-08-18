<script setup>
import { useAuthStore } from "./stores/auth";

const authStore = useAuthStore();

const logout = () => {
  authStore.logout();
  window.location.href = "/connexion";
};
</script>

<template>
  <div id="app" class="min-h-screen bg-gray-900 text-white">

    <!-- Navigation uniquement si l'utilisateur est connecté -->
    <header v-if="authStore.isAuthenticated" class="h-[65px] px-8 flex items-center justify-between bg-slate-800 shadow-md">

      <div class="text-xl font-bold tracking-wide">
        Gestion EDT
      </div>

      <nav class="flex items-center gap-6">
        <RouterLink
          v-if="authStore.role === 'admin'"
          to="/admin"
          class="text-white hover:text-blue-400 transition-colors"
        >
          Administration
        </RouterLink>

        <RouterLink
          v-if="authStore.role === 'enseignant'"
          to="/enseignant"
          class="text-white hover:text-blue-400 transition-colors"
        >
          Espace Enseignant
        </RouterLink>

        <RouterLink
          v-if="authStore.role === 'etudiant'"
          to="/etudiant"
          class="text-white hover:text-blue-400 transition-colors"
        >
          Espace Étudiant
        </RouterLink>

        <button @click="logout" class="py-2 px-4 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors font-medium">
          Déconnexion
        </button>
      </nav>

    </header>

    <!-- Les différentes pages apparaissent ici -->
    <main class="min-h-[calc(100vh-65px)] p-6">
      <RouterView />
    </main>

  </div>
</template>