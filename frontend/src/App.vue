<script setup>
import { useAuthStore } from "./stores/auth";
import Header from "./components/Header.vue";

const authStore = useAuthStore();
</script>

<template>
  <div id="app" class="relative min-h-screen overflow-x-hidden font-sans text-secondary bg-background">

    <!-- Header (Hidden for student since they have a specific dashboard layout) -->
    <Header v-if="authStore.isAuthenticated && authStore.user?.role !== 'etudiant'" />

    <!-- Contenu -->
    <main :class="['min-h-screen p-4 sm:p-6 lg:p-8 flex items-center justify-center', {'pt-[90px]': authStore.user?.role !== 'etudiant'}]">
      <div class="w-full max-w-7xl">
        <RouterView v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </RouterView>
      </div>
    </main>
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition:
    opacity 0.3s ease,
    transform 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(10px);
}
</style>