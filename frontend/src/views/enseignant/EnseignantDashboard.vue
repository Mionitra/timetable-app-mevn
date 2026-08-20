<script setup>
import { useAuthStore } from "../../stores/auth";

const authStore = useAuthStore();

const logout = () => {
  authStore.logout();
  window.location.href = "/connexion";
};
</script>

<template>
  <div>
    <h1>Dashboard Enseignant</h1>

    <p>
      Bienvenue
      {{ authStore.user?.firstName }}
    </p>

    <p>
      Vous êtes connecté en tant qu'enseignant.
    </p>

    <button @click="logout">
      Déconnexion
    </button>
  </div>
</template>