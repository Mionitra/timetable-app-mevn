<script setup>
import { ref, computed } from "vue";
import { useAuthStore } from "../stores/auth";

const authStore = useAuthStore();
const mobileMenuOpen = ref(false);

const userInitials = computed(() => {
    const name = authStore.user?.name || "Utilisateur";

    return name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
});

const logout = () => {
    mobileMenuOpen.value = false;
    authStore.logout();
    window.location.href = "/connexion";
};

const closeMobileMenu = () => {
    mobileMenuOpen.value = false;
};
</script>

<template>
    <!-- HEADER -->
    <header v-if="authStore.isAuthenticated" class="fixed top-0 left-0 z-50 flex items-center justify-between w-full px-4 transition-all duration-300 border-b shadow-2xl sm:px-8 bg-white/5 backdrop-blur-xl border-white/10 shadow-black/40">
        <!-- Logo -->
        <div class="flex items-center gap-3">
            <div
                class="flex items-center justify-center w-10 h-10 rounded-full shadow-lg bg-gradient-to-br from-blue-400 to-purple-500 shadow-blue-500/30">
                <span class="text-xl font-black text-white">📅</span>
            </div>

            <span
                class="text-2xl font-extrabold tracking-tight text-transparent bg-gradient-to-r from-blue-300 via-purple-300 to-pink-300 bg-clip-text">
                Gestion EDT
            </span>
        </div>

        <!-- Navigation Desktop -->
        <nav class="items-center hidden gap-8 md:flex">
            <!-- Admin -->
            <RouterLink v-if="authStore.role === 'admin'" to="/admin" class="relative text-sm font-medium text-gray-300
               hover:text-white transition-colors duration-300
               after:absolute after:-bottom-1 after:left-0 after:w-0 after:h-0.5
               after:bg-gradient-to-r after:from-blue-400 after:to-purple-400
               hover:after:w-full after:transition-all after:duration-300
               [&.router-link-active]:text-white
               [&.router-link-active]:after:w-full">
                Administration
            </RouterLink>

            <!-- Enseignant -->
            <RouterLink v-if="authStore.role === 'enseignant'" to="/enseignant" class="relative text-sm font-medium text-gray-300
               hover:text-white transition-colors duration-300
               after:absolute after:-bottom-1 after:left-0 after:w-0 after:h-0.5
               after:bg-gradient-to-r after:from-blue-400 after:to-purple-400
               hover:after:w-full after:transition-all after:duration-300
               [&.router-link-active]:text-white
               [&.router-link-active]:after:w-full">
                Espace Enseignant
            </RouterLink>

            <!-- Étudiant -->
            <RouterLink v-if="authStore.role === 'etudiant'" to="/etudiant" class="relative text-sm font-medium text-gray-300
               hover:text-white transition-colors duration-300
               after:absolute after:-bottom-1 after:left-0 after:w-0 after:h-0.5
               after:bg-gradient-to-r after:from-blue-400 after:to-purple-400
               hover:after:w-full after:transition-all after:duration-300
               [&.router-link-active]:text-white
               [&.router-link-active]:after:w-full">
                Espace Étudiant
            </RouterLink>
        </nav>

        <!-- Profil Desktop -->
        <div class="items-center hidden gap-4 md:flex">
            <div class="relative group">
                <button
                    class="flex items-center gap-3 px-3 py-2 transition-all duration-300 border rounded-full bg-white/5 hover:bg-white/10 border-white/10 hover:border-white/20">
                    <!-- Avatar -->
                    <div
                        class="flex items-center justify-center w-8 h-8 text-sm font-bold rounded-full shadow-md bg-gradient-to-br from-blue-500 to-purple-600">
                        {{ userInitials }}
                    </div>

                    <!-- Nom -->
                    <span class="text-sm font-medium text-gray-200">
                        {{ authStore.user?.name || "Utilisateur" }}
                    </span>

                    <!-- Arrow -->
                    <svg class="w-4 h-4 text-gray-400 transition-transform duration-300 group-hover:rotate-180"
                        fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                    </svg>
                </button>

                <!-- Dropdown -->
                <div
                    class="absolute right-0 invisible w-48 mt-2 overflow-hidden transition-all duration-300 origin-top-right scale-95 border shadow-2xl opacity-0 bg-slate-800/90 backdrop-blur-xl rounded-xl border-white/10 group-hover:opacity-100 group-hover:visible group-hover:scale-100">
                    <div class="py-1">
                        <button @click="logout" class="flex items-center w-full gap-3 px-4 py-2.5
                     text-sm text-left text-red-400
                     hover:bg-red-500/10 hover:text-red-300
                     transition-colors">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>

                            Déconnexion
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Bouton Mobile -->
        <button @click="mobileMenuOpen = !mobileMenuOpen"
            class="p-2 transition-colors rounded-lg md:hidden hover:bg-white/10" aria-label="Menu">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path v-if="!mobileMenuOpen" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M4 6h16M4 12h16M4 18h16" />

                <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
        </button>
    </header>

    <!-- Overlay Mobile -->
    <div v-if="mobileMenuOpen" class="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm md:hidden"
        @click="closeMobileMenu" />

    <!-- Menu Mobile -->
    <div :class="[
        'fixed top-[72px] left-0 w-full bg-slate-900/95 backdrop-blur-xl',
        'border-b border-white/10 z-40 md:hidden overflow-hidden',
        'transition-all duration-300 ease-in-out',
        mobileMenuOpen
            ? 'max-h-screen opacity-100'
            : 'max-h-0 opacity-0'
    ]">
        <div class="flex flex-col p-6 space-y-4">

            <!-- Admin -->
            <RouterLink v-if="authStore.role === 'admin'" to="/admin"
                class="text-lg font-medium text-gray-300 transition-colors hover:text-white" @click="closeMobileMenu">
                Administration
            </RouterLink>

            <!-- Enseignant -->
            <RouterLink v-if="authStore.role === 'enseignant'" to="/enseignant"
                class="text-lg font-medium text-gray-300 transition-colors hover:text-white" @click="closeMobileMenu">
                Espace Enseignant
            </RouterLink>

            <!-- Étudiant -->
            <RouterLink v-if="authStore.role === 'etudiant'" to="/etudiant"
                class="text-lg font-medium text-gray-300 transition-colors hover:text-white" @click="closeMobileMenu">
                Espace Étudiant
            </RouterLink>

            <hr class="border-white/10" />

            <!-- Logout -->
            <button @click="logout"
                class="flex items-center gap-3 text-lg font-medium text-red-400 transition-colors hover:text-red-300">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>

                Déconnexion
            </button>
        </div>
    </div>
</template>