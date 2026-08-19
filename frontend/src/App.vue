<script setup>
import { useAuthStore } from "./stores/auth";
import Header from "./components/Header.vue";

const authStore = useAuthStore();
</script>

<template>
  <div id="app" class="relative min-h-screen overflow-x-hidden text-white font-sans bg-gt-bg">
    <!-- Fond image (Starry Night) -->
    <div class="fixed inset-0 -z-20 bg-[url('https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=2000&q=80')] bg-cover bg-center bg-no-repeat opacity-40"></div>
    <div class="fixed inset-0 -z-10 bg-gt-bg/60 backdrop-blur-[2px]"></div>

    <!-- Header (Hidden for student since they have a specific dashboard layout) -->
    <Header v-if="authStore.isAuthenticated && authStore.user?.role !== 'etudiant'" />

    <!-- Contenu -->
    <main :class="['min-h-screen p-4 sm:p-6 lg:p-8 flex items-center justify-center', {'pt-[90px]': authStore.user?.role !== 'etudiant'}]">
      <div class="w-full h-full max-w-[1400px]">
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