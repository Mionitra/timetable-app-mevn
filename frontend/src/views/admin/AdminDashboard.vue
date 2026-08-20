<script setup>
import { useAuthStore } from "../../stores/auth";

const authStore = useAuthStore();

const logout = () => {
  authStore.logout();
  window.location.href = "/connexion";
};
</script>

<template>
  <div class="flex min-h-screen bg-background">
    <!-- Sidebar -->
    <aside class="w-64 bg-secondary text-white flex flex-col">
      <div class="p-6">
        <h2 class="text-2xl font-bold text-white">Admin Panel</h2>
        <p class="text-sm text-gray-400 mt-1">Gestion Universitaire</p>
      </div>
      
      <nav class="flex-1 px-4 py-6 space-y-2">
        <a href="#" class="block px-4 py-3 bg-primary/20 text-white rounded-lg font-medium transition-colors">
          Tableau de bord
        </a>
        <a href="#" class="block px-4 py-3 text-gray-300 hover:bg-white/10 hover:text-white rounded-lg font-medium transition-colors">
          Gestion Utilisateurs
        </a>
      </nav>

      <div class="p-4 border-t border-white/10">
        <div class="flex items-center mb-4 px-2">
          <div class="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-bold">
            {{ authStore.user?.firstName?.charAt(0) }}{{ authStore.user?.lastName?.charAt(0) }}
          </div>
          <div class="ml-3">
            <p class="text-sm font-medium text-white">{{ authStore.user?.firstName }}</p>
            <p class="text-xs text-gray-400 capitalize">{{ authStore.user?.role }}</p>
          </div>
        </div>
        <button @click="logout" class="w-full py-2 px-4 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors text-sm font-medium flex items-center justify-center">
          Déconnexion
        </button>
      </div>
    </aside>

    <!-- Main Content -->
    <main class="flex-1 p-8">
      <header class="mb-8 flex justify-between items-center">
        <div>
          <h1 class="text-3xl font-bold text-secondary">Tableau de bord</h1>
          <p class="text-gray-500 mt-1">Bienvenue sur l'espace d'administration</p>
        </div>
        <button class="px-5 py-2.5 bg-primary hover:opacity-90 text-white font-medium rounded-lg shadow-md transition-all flex items-center">
          <span class="text-lg mr-2">+</span> Ajouter un Enseignant
        </button>
      </header>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div class="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h3 class="text-gray-500 text-sm font-medium">Total Étudiants</h3>
          <p class="text-3xl font-bold text-secondary mt-2">1,245</p>
        </div>
        <div class="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h3 class="text-gray-500 text-sm font-medium">Total Enseignants</h3>
          <p class="text-3xl font-bold text-secondary mt-2">84</p>
        </div>
        <div class="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h3 class="text-gray-500 text-sm font-medium">Nouveaux Inscrits</h3>
          <p class="text-3xl font-bold text-primary mt-2">12</p>
        </div>
      </div>

      <div class="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div class="px-6 py-4 border-b border-gray-200">
          <h3 class="font-bold text-secondary">Utilisateurs récents</h3>
        </div>
        <div class="p-6">
          <p class="text-gray-500 text-sm text-center py-8">Aucun utilisateur récent à afficher.</p>
        </div>
      </div>
    </main>
  </div>
</template>