<script setup>
import { computed } from "vue";
import { useAuthStore } from "./stores/auth";
import Header from "./components/Header.vue";

const authStore = useAuthStore();

// Rôles avec layout propre (plein écran, pas de wrapper)
const hasDashboardLayout = computed(() =>
  ["admin", "etudiant"].includes(authStore.user?.role)
);
</script>

<template>
  <div id="app" class="w-full font-sans text-secondary bg-background"
    :class="hasDashboardLayout ? 'h-screen overflow-hidden' : 'min-h-screen'">

    <!-- Header global uniquement pour enseignant -->
    <Header v-if="authStore.isAuthenticated && authStore.user?.role === 'enseignant'" />

    <!-- Layout PLEIN ÉCRAN pour admin et étudiant -->
    <template v-if="hasDashboardLayout">
      <div class="flex items-center justify-center w-full h-full p-4 sm:p-8">
        <RouterView v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" class="w-full h-full" />
          </transition>
        </RouterView>
      </div>
    </template>

    <!-- Layout normal pour enseignant et pages publiques -->
    <template v-else>
      <main class="flex items-center justify-center min-h-screen p-4 sm:p-6 lg:p-8"
        :class="{ 'pt-[90px]': authStore.user?.role === 'enseignant' }">
        <div class="w-full max-w-7xl">
          <RouterView v-slot="{ Component }">
            <transition name="fade" mode="out-in">
              <component :is="Component" />
            </transition>
          </RouterView>
        </div>
      </main>
    </template>

  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(8px);
}
</style>