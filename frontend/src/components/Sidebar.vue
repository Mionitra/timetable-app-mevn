<script setup>
import { computed } from "vue";
import { useAuthStore } from "../stores/auth";

const authStore = useAuthStore();

const role = computed(() => authStore.user?.role || null);
const isAdmin = computed(() => role.value === "admin");
const isEtudiant = computed(() => role.value === "etudiant");
const isEnseignant = computed(() => role.value === "enseignant");

const logout = () => {
    authStore.logout();
    window.location.href = "/connexion";
};
</script>

<template>
    <aside
        class="relative z-20 flex flex-col w-20 h-full py-8 transition-all border-r md:w-64 bg-gt-bg/40 border-white/5">

        <!-- Logo -->
        <div class="flex items-center justify-center px-2 mb-12 md:justify-start md:px-8">
            <div
                class="flex items-center justify-center w-8 h-8 text-lg font-bold text-white rounded-full bg-gt-blue shadow-[0_0_15px_rgba(37,99,235,0.6)]">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
            </div>
            <span class="hidden ml-3 text-xl font-bold tracking-wide text-white md:block">
                G.take
            </span>
        </div>

        <!-- ==========================================
             NAVIGATION ÉTUDIANT
        =========================================== -->
        <nav v-if="isEtudiant" class="flex flex-col flex-1 gap-2 px-4">

            <!-- Dashboard -->
            <RouterLink to="/etudiant" class="relative nav-item group" exact-active-class="is-active">
                <div class="icon-wrapper">
                    <div class="glow-effect"></div>
                    <svg class="relative z-10 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                    </svg>
                </div>
                <span class="hidden text-sm font-medium md:block">Tableau de bord</span>
            </RouterLink>

            <!-- Calendrier -->
            <RouterLink to="/etudiant/schedule" class="relative nav-item group" active-class="is-active">
                <div class="icon-wrapper">
                    <div class="glow-effect"></div>
                    <svg class="relative z-10 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                </div>
                <span class="hidden text-sm font-medium md:block">Calendrier</span>
            </RouterLink>

            <!-- Matières -->
            <RouterLink to="/etudiant/subjects" class="relative nav-item group" active-class="is-active">
                <div class="icon-wrapper">
                    <div class="glow-effect"></div>
                    <svg class="relative z-10 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                </div>
                <span class="hidden text-sm font-medium md:block">Tâches &amp; Matières</span>
            </RouterLink>

        </nav>

        <!-- ==========================================
             NAVIGATION ADMIN
        =========================================== -->
        <nav v-else-if="isAdmin" class="flex flex-col flex-1 gap-1 px-4 overflow-y-auto custom-scrollbar">

            <!-- Dashboard Admin -->
            <RouterLink to="/admin" class="relative nav-item group" exact-active-class="is-active">
                <div class="icon-wrapper">
                    <div class="glow-effect"></div>
                    <svg class="relative z-10 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                </div>
                <span class="hidden text-sm font-medium md:block">Tableau de bord</span>
            </RouterLink>

            <!-- Section label -->
            <div class="hidden mt-4 mb-1 md:block">
                <span class="px-2 text-xs font-semibold tracking-widest uppercase text-white/30">Gestion</span>
            </div>

            <!-- Enseignants -->
            <RouterLink to="/admin/enseignants" class="relative nav-item group" active-class="is-active">
                <div class="icon-wrapper">
                    <div class="glow-effect"></div>
                    <svg class="relative z-10 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                </div>
                <span class="hidden text-sm font-medium md:block">Enseignants</span>
            </RouterLink>

            <!-- Salles -->
            <RouterLink to="/admin/salles" class="relative nav-item group" active-class="is-active">
                <div class="icon-wrapper">
                    <div class="glow-effect"></div>
                    <svg class="relative z-10 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                </div>
                <span class="hidden text-sm font-medium md:block">Salles</span>
            </RouterLink>

            <!-- Section label -->
            <div class="hidden mt-4 mb-1 md:block">
                <span class="px-2 text-xs font-semibold tracking-widest uppercase text-white/30">Académique</span>
            </div>

            <!-- Années académiques -->
            <RouterLink to="/admin/academic-years" class="relative nav-item group" active-class="is-active">
                <div class="icon-wrapper">
                    <div class="glow-effect"></div>
                    <svg class="relative z-10 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                </div>
                <span class="hidden text-sm font-medium md:block">Années acad.</span>
            </RouterLink>

            <!-- Semestres -->
            <RouterLink to="/admin/semestres" class="relative nav-item group" active-class="is-active">
                <div class="icon-wrapper">
                    <div class="glow-effect"></div>
                    <svg class="relative z-10 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                </div>
                <span class="hidden text-sm font-medium md:block">Semestres</span>
            </RouterLink>

            <!-- Matières -->
            <RouterLink to="/admin/matieres" class="relative nav-item group" active-class="is-active">
                <div class="icon-wrapper">
                    <div class="glow-effect"></div>
                    <svg class="relative z-10 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                </div>
                <span class="hidden text-sm font-medium md:block">Matières</span>
            </RouterLink>

            <!-- Cours -->
            <RouterLink to="/admin/cours" class="relative nav-item group" active-class="is-active">
                <div class="icon-wrapper">
                    <div class="glow-effect"></div>
                    <svg class="relative z-10 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                </div>
                <span class="hidden text-sm font-medium md:block">Cours (EDT)</span>
            </RouterLink>

        </nav>

        <!-- ==========================================
             NAVIGATION ENSEIGNANT (fallback simple)
        =========================================== -->
        <nav v-else class="flex flex-col flex-1 gap-2 px-4">
            <RouterLink to="/enseignant" class="relative nav-item group" exact-active-class="is-active">
                <div class="icon-wrapper">
                    <div class="glow-effect"></div>
                    <svg class="relative z-10 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                    </svg>
                </div>
                <span class="hidden text-sm font-medium md:block">Tableau de bord</span>
            </RouterLink>
        </nav>

        <!-- ==========================================
             BOTTOM — Paramètres + Déconnexion
        =========================================== -->
        <div class="flex flex-col gap-2 px-4 mt-auto">

            <!-- Paramètres étudiant uniquement -->
            <RouterLink v-if="isEtudiant" to="/etudiant/settings" class="relative nav-item group"
                active-class="is-active">
                <div class="icon-wrapper">
                    <div class="glow-effect"></div>
                    <svg class="relative z-10 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 001.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-1.756 2.37-2.37z" />
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                </div>
                <span class="hidden text-sm font-medium md:block">Paramètres</span>
            </RouterLink>

            <!-- Déconnexion -->
            <button @click="logout" class="relative text-left nav-item group">
                <div class="text-gray-400 icon-wrapper">
                    <svg class="relative z-10 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                </div>
                <span class="hidden text-sm font-medium text-gray-400 md:block">Déconnexion</span>
            </button>

        </div>
    </aside>
</template>

<style scoped>
@reference "tailwindcss";

.nav-item {
    @apply flex items-center justify-center gap-4 p-2 text-gray-500 transition-all duration-300 rounded-2xl;
}

.nav-item:hover {
    @apply text-gray-200;
}

.nav-item.is-active {
    @apply text-white;
}

@media (min-width: 768px) {
    .nav-item {
        justify-content: flex-start;
    }
}

.icon-wrapper {
    @apply relative flex items-center justify-center w-12 h-12 transition-all duration-300 rounded-full;
}

.nav-item:hover .icon-wrapper {
    @apply bg-white/5;
}

.nav-item.is-active .icon-wrapper {
    @apply text-white;
}

.glow-effect {
    @apply absolute inset-0 rounded-full opacity-0 transition-opacity duration-300 blur-[8px] scale-75;
    background-color: var(--gt-blue, #2563eb);
}

.nav-item.is-active .glow-effect {
    @apply opacity-60 scale-100;
}

.nav-item.is-active .icon-wrapper::after {
    content: "";
    @apply absolute inset-0 z-0 rounded-full;
    background-color: var(--gt-blue, #2563eb);
}

.custom-scrollbar::-webkit-scrollbar {
    width: 4px;
}

.custom-scrollbar::-webkit-scrollbar-track {
    background: transparent;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 10px;
}
</style>