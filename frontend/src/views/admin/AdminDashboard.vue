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
    <h1>Dashboard Administrateur</h1>

    <p>
      Bienvenue
      {{ authStore.user?.firstName }}
      {{ authStore.user?.lastName }}
    </p>

    <p>
      Rôle :
      {{ authStore.user?.role }}
    </p>

    <button @click="logout">
      Déconnexion
    </button>
  </div>
</template>