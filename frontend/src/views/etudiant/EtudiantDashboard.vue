<script setup>
import Sidebar from "../../components/Sidebar.vue";
import Header from "../../components/Header.vue";
</script>

<template>
  <div
    class="flex h-[calc(100vh-2rem)] sm:h-[calc(100vh-4rem)] w-full rounded-[2rem] bg-white/5/70 backdrop-blur-3xl border border-white/5 shadow-2xl overflow-hidden relative"
  >

    <!-- =====================================
         SIDEBAR
    ====================================== -->

    <Sidebar />

    <!-- =====================================
         MAIN
    ====================================== -->

    <main
      class="relative z-10 flex flex-col flex-1 h-full min-w-0"
    >

      <!-- HEADER -->

      <Header />

      <!-- =================================
           CONTENT
      ================================== -->

      <div
        class="relative z-10 flex-1 px-4 pb-8 overflow-y-auto sm:px-8 custom-scrollbar"
      >
        <router-view v-slot="{ Component }">

          <transition
            name="fade"
            mode="out-in"
          >
            <component :is="Component" />
          </transition>

        </router-view>
      </div>

    </main>
  </div>
</template>

<style scoped>
@reference "tailwindcss";

/* ==========================================
   PAGE TRANSITION
========================================== */

.fade-enter-active,
.fade-leave-active {
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

/* ==========================================
   SCROLLBAR
========================================== */

.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.2);
}
</style>