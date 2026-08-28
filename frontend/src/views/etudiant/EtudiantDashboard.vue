<script setup>
import { useAuthStore } from "../../stores/auth";
import { useRoute } from "vue-router";
import { computed } from "vue";

const authStore = useAuthStore();
const route = useRoute();

const logout = () => {
  authStore.logout();
  window.location.href = "/connexion";
};

// Generate Breadcrumbs
const breadcrumbs = computed(() => {
  const path = route.path;

  if (path === "/etudiant") return ["Home", "Dashboard"];
  if (path.includes("/schedule")) return ["Home", "Schedule"];
  if (path.includes("/profile")) return ["Home", "Profile"];
  if (path.includes("/settings")) return ["Home", "Settings"];

  return ["Home", "Dashboard"];
});

const currentDate = new Date().toLocaleDateString("en-US", {
  day: "numeric",
  month: "short",
});
</script>

<template>
  <div
    class="flex h-[calc(100vh-2rem)] sm:h-[calc(100vh-4rem)] w-full rounded-[2rem] bg-gt-card/70 backdrop-blur-3xl border border-white/5 shadow-2xl overflow-hidden relative"
  >
    <!-- Sidebar -->
    <aside
      class="relative z-20 flex flex-col w-20 h-full py-8 transition-all border-r md:w-64 bg-gt-bg/40 border-white/5"
    >
      <!-- Logo -->
      <div
        class="flex items-center justify-center px-2 mb-12 md:justify-start md:px-8"
      >
        <div
          class="flex items-center justify-center w-8 h-8 text-lg font-bold text-white rounded-full bg-gt-blue shadow-[0_0_15px_rgba(37,99,235,0.6)]"
        >
          <svg
            class="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
            />
          </svg>
        </div>

        <span
          class="hidden ml-3 text-xl font-bold tracking-wide text-white md:block"
        >
          G.take
        </span>
      </div>

      <!-- Navigation -->
      <nav class="flex flex-col flex-1 gap-2 px-4">
        <!-- Dashboard -->
        <RouterLink
          to="/etudiant"
          class="relative nav-item group"
          exact-active-class="is-active"
        >
          <div class="icon-wrapper">
            <div class="glow-effect"></div>

            <svg
              class="relative z-10 w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
              />
            </svg>
          </div>

          <span class="hidden text-sm font-medium md:block">
            Dashboard
          </span>
        </RouterLink>

        <!-- Calendar -->
        <RouterLink
          to="/etudiant/schedule"
          class="relative nav-item group"
          active-class="is-active"
        >
          <div class="icon-wrapper">
            <div class="glow-effect"></div>

            <svg
              class="relative z-10 w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>

          <span class="hidden text-sm font-medium md:block">
            Calendar
          </span>
        </RouterLink>

        <!-- Messages -->
        <a href="#" class="relative nav-item group">
          <div class="icon-wrapper">
            <svg
              class="relative z-10 w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          </div>

          <span class="hidden text-sm font-medium md:block">
            Messages
          </span>
        </a>
      </nav>

      <!-- Bottom Nav -->
      <div class="flex flex-col gap-2 px-4 mt-auto">
        <!-- Settings -->
        <RouterLink
          to="/etudiant/settings"
          class="relative nav-item group"
          active-class="is-active"
        >
          <div class="icon-wrapper">
            <div class="glow-effect"></div>

            <svg
              class="relative z-10 w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 001.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              />

              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          </div>

          <span class="hidden text-sm font-medium md:block">
            Settings
          </span>
        </RouterLink>

        <!-- Logout -->
        <button
          @click="logout"
          class="relative text-left nav-item group"
        >
          <div class="text-gray-400 icon-wrapper">
            <svg
              class="relative z-10 w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
          </div>

          <span class="hidden text-sm font-medium text-gray-400 md:block">
            Log out
          </span>
        </button>
      </div>
    </aside>

    <!-- Main Content -->
    <main class="relative z-10 flex flex-col flex-1 h-full min-w-0">
      <!-- Topbar -->
      <header class="flex items-center justify-between h-20 px-8 shrink-0">
        <!-- Breadcrumbs -->
        <div class="flex items-center gap-6">
          <div class="flex items-center gap-2 text-sm">
            <svg
              class="w-4 h-4 text-gray-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
              />
            </svg>

            <span
              v-for="(crumb, i) in breadcrumbs"
              :key="i"
              class="flex items-center"
            >
              <span
                :class="
                  i === breadcrumbs.length - 1
                    ? 'text-gray-200 font-medium'
                    : 'text-gray-500'
                "
              >
                {{ crumb }}
              </span>

              <span
                v-if="i < breadcrumbs.length - 1"
                class="mx-2 text-gray-600"
              >
                /
              </span>
            </span>
          </div>

          <!-- Date -->
          <div
            class="items-center hidden gap-2 px-3 py-1.5 text-sm font-medium text-gray-300 border rounded-full sm:flex bg-white/5 border-white/5"
          >
            <svg
              class="w-4 h-4 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>

            {{ currentDate }}

            <svg
              class="w-3 h-3 ml-1 text-gray-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
        </div>

        <!-- Right Actions -->
        <div class="flex items-center gap-4">
          <!-- Avatars -->
          <div class="items-center hidden -space-x-2 md:flex">
            <img
              class="object-cover w-8 h-8 border-2 rounded-full border-gt-card"
              src="https://i.pravatar.cc/100?img=1"
              alt=""
            />

            <img
              class="object-cover w-8 h-8 border-2 rounded-full border-gt-card"
              src="https://i.pravatar.cc/100?img=2"
              alt=""
            />

            <img
              class="object-cover w-8 h-8 border-2 rounded-full border-gt-card"
              src="https://i.pravatar.cc/100?img=3"
              alt=""
            />

            <button
              class="relative z-10 flex items-center justify-center w-8 h-8 text-white transition-colors border-2 rounded-full bg-gt-blue border-gt-card hover:bg-blue-500"
            >
              <svg
                class="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
            </button>
          </div>

          <div class="hidden w-px h-6 mx-2 md:block bg-white/10"></div>

          <!-- Search -->
          <button
            class="flex items-center justify-center w-10 h-10 text-gray-300 transition-colors border rounded-full bg-white/5 border-white/5 hover:text-white hover:bg-white/10"
          >
            <svg
              class="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </button>

          <!-- Notifications -->
          <button
            class="relative flex items-center justify-center w-10 h-10 text-gray-300 transition-colors border rounded-full bg-white/5 border-white/5 hover:text-white hover:bg-white/10"
          >
            <div
              class="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-gt-card"
            ></div>

            <svg
              class="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
              />
            </svg>
          </button>

          <!-- Profile -->
          <RouterLink
            to="/etudiant/profile"
            class="w-10 h-10 overflow-hidden transition-colors border-2 rounded-full cursor-pointer border-white/10 hover:border-gt-blue"
          >
            <img
              src="https://i.pravatar.cc/150?u=a042581f4e29026704d"
              alt="Profile"
              class="object-cover w-full h-full"
            />
          </RouterLink>
        </div>
      </header>

      <!-- Scrollable Content -->
      <div
        class="relative z-10 flex-1 px-4 pb-8 overflow-y-auto sm:px-8 custom-scrollbar"
      >
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

/* ================================
   Navigation
================================ */

.nav-item {
  @apply flex items-center justify-center gap-4 p-2 text-gray-500 transition-all duration-300 rounded-2xl;
}

.nav-item:hover {
  @apply text-gray-200;
}

.nav-item.is-active {
  @apply text-white;
}

/*
  Responsive behavior.
  On screens >= 768px, equivalent to md:justify-start.
*/
@media (min-width: 768px) {
  .nav-item {
    justify-content: flex-start;
  }
}

/* ================================
   Icon
================================ */

.icon-wrapper {
  @apply relative flex items-center justify-center w-12 h-12 transition-all duration-300 rounded-full;
}

.nav-item:hover .icon-wrapper {
  @apply bg-white/5;
}

.nav-item.is-active .icon-wrapper {
  @apply text-white;
}

/* ================================
   Glow
================================ */

.glow-effect {
  @apply absolute inset-0 rounded-full opacity-0 transition-opacity duration-300 blur-[8px] scale-75;
  background-color: var(--gt-blue, #2563eb); /* fallback color */
}

.nav-item.is-active .glow-effect {
  @apply opacity-60 scale-100;
}

.nav-item.is-active .icon-wrapper::after {
  content: "";
  @apply absolute inset-0 z-0 rounded-full;
  background-color: var(--gt-blue, #2563eb);
}

/* ================================
   Page transition
================================ */

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

/* ================================
   Scrollbar
================================ */

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