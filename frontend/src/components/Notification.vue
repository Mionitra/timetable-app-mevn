<script setup>
import { ref, computed, onMounted } from 'vue';
import api from '../services/api';

const notifications = ref([]);
const loading = ref(false);
const error = ref(null);
const currentFilter = ref('all');
const markingAll = ref(false);
const processingId = ref(null);

const fetchNotifications = async () => {
    loading.value = true;
    error.value = null;
    try {
        const response = await api.get('/alertes');
        notifications.value = response.data;
    } catch (err) {
        error.value = err.response?.data?.message || 'Erreur lors du chargement des alertes';
    } finally {
        loading.value = false;
    }
};

onMounted(() => {
    fetchNotifications();
});

const unreadCount = computed(() => notifications.value.filter(n => !n.is_read).length);
const readCount = computed(() => notifications.value.filter(n => n.is_read).length);

const filteredNotifications = computed(() => {
    let result = notifications.value;
    if (currentFilter.value === 'unread') {
        result = result.filter(n => !n.is_read);
    } else if (currentFilter.value !== 'all') {
        result = result.filter(n => n.type === currentFilter.value);
    }
    return result;
});

const emptyMessage = computed(() => {
    if (currentFilter.value === 'unread') return 'Vous n\'avez aucune notification non lue.';
    if (currentFilter.value !== 'all') return 'Aucune notification de ce type.';
    return 'Vous n\'avez aucune notification pour le moment.';
});

const markAsRead = async (notification) => {
    if (notification.is_read) return;
    processingId.value = notification.id || notification._id;
    try {
        await api.patch(`/alertes/${notification.id || notification._id}/read`);
        notification.is_read = true;
    } catch (err) {
        console.error(err);
    } finally {
        processingId.value = null;
    }
};

const markAllAsRead = async () => {
    markingAll.value = true;
    try {
        await api.patch('/alertes/read-all');
        notifications.value.forEach(n => n.is_read = true);
    } catch (err) {
        console.error(err);
    } finally {
        markingAll.value = false;
    }
};

const deleteNotification = (id) => {
    notifications.value = notifications.value.filter(n => (n.id || n._id) !== id);
};

const getNotificationIcon = (type) => {
    switch (type) {
        case 'salle_occupee': return '🏫';
        case 'prof_indisponible': return '👨‍🏫';
        case 'conflit_horaire': return '⚠️';
        default: return '🔔';
    }
};

const getIconBackground = (type) => {
    switch (type) {
        case 'salle_occupee': return 'bg-orange-500/20 text-orange-500';
        case 'prof_indisponible': return 'bg-purple-500/20 text-purple-500';
        case 'conflit_horaire': return 'bg-red-500/20 text-red-500';
        default: return 'bg-blue-500/20 text-blue-500';
    }
};

const getNotificationTitle = (type) => {
    switch (type) {
        case 'salle_occupee': return 'Changement de salle';
        case 'prof_indisponible': return 'Absence enseignant';
        case 'conflit_horaire': return 'Conflit d\'horaire';
        default: return 'Nouvelle alerte';
    }
};

const formatDate = (dateString) => {
    if (!dateString) return '';
    const d = new Date(dateString);
    return d.toLocaleString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
};
</script>

<template>
    <div class="w-full">
        <!-- Header -->
        <div class="flex items-center justify-between mb-6">
            <div>
                <h1 class="text-2xl font-bold text-white">
                    Notifications
                </h1>

                <p class="mt-1 text-sm text-gray-500">
                    Consultez vos alertes et les événements liés à votre emploi du temps.
                </p>
            </div>

            <!-- Tout marquer comme lu -->
            <button v-if="unreadCount > 0" @click="markAllAsRead" :disabled="markingAll"
                class="px-4 py-2 text-sm font-medium text-white transition rounded-xl bg-gt-blue hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed">
                <span v-if="markingAll">
                    Traitement...
                </span>

                <span v-else>
                    ✓ Tout marquer comme lu
                </span>
            </button>
        </div>


        <!-- Statistiques -->
        <div class="grid grid-cols-1 gap-4 mb-6 sm:grid-cols-3">

            <!-- Total -->
            <div class="p-5 border rounded-2xl bg-white/5 border-white/5">
                <div class="flex items-center justify-between">
                    <div>
                        <p class="text-sm text-gray-500">
                            Total
                        </p>

                        <p class="mt-1 text-2xl font-bold text-white">
                            {{ notifications.length }}
                        </p>
                    </div>

                    <div class="flex items-center justify-center text-xl rounded-full w-11 h-11 bg-blue-500/10">
                        🔔
                    </div>
                </div>
            </div>


            <!-- Non lues -->
            <div class="p-5 border rounded-2xl bg-white/5 border-white/5">
                <div class="flex items-center justify-between">
                    <div>
                        <p class="text-sm text-gray-500">
                            Non lues
                        </p>

                        <p class="mt-1 text-2xl font-bold text-white">
                            {{ unreadCount }}
                        </p>
                    </div>

                    <div class="flex items-center justify-center text-xl rounded-full w-11 h-11 bg-red-500/10">
                        🔴
                    </div>
                </div>
            </div>


            <!-- Lues -->
            <div class="p-5 border rounded-2xl bg-white/5 border-white/5">
                <div class="flex items-center justify-between">
                    <div>
                        <p class="text-sm text-gray-500">
                            Lues
                        </p>

                        <p class="mt-1 text-2xl font-bold text-white">
                            {{ readCount }}
                        </p>
                    </div>

                    <div class="flex items-center justify-center text-xl rounded-full w-11 h-11 bg-green-500/10">
                        ✓
                    </div>
                </div>
            </div>

        </div>


        <!-- Filtres -->
        <div class="flex flex-wrap items-center gap-2 p-3 mb-5 border rounded-2xl bg-white/5 border-white/5">

            <button @click="currentFilter = 'all'" :class="[
                'px-4 py-2 text-sm rounded-xl transition',
                currentFilter === 'all'
                    ? 'bg-gt-blue text-white'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
            ]">
                Toutes
            </button>

            <button @click="currentFilter = 'unread'" :class="[
                'px-4 py-2 text-sm rounded-xl transition',
                currentFilter === 'unread'
                    ? 'bg-gt-blue text-white'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
            ]">
                Non lues
            </button>

            <button @click="currentFilter = 'salle_occupee'" :class="[
                'px-4 py-2 text-sm rounded-xl transition',
                currentFilter === 'salle_occupee'
                    ? 'bg-orange-500 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
            ]">
                🏫 Salles
            </button>

            <button @click="currentFilter = 'prof_indisponible'" :class="[
                'px-4 py-2 text-sm rounded-xl transition',
                currentFilter === 'prof_indisponible'
                    ? 'bg-purple-500 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
            ]">
                👨‍🏫 Professeurs
            </button>

            <button @click="currentFilter = 'conflit_horaire'" :class="[
                'px-4 py-2 text-sm rounded-xl transition',
                currentFilter === 'conflit_horaire'
                    ? 'bg-red-500 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
            ]">
                ⚠️ Conflits
            </button>

        </div>


        <!-- Loading -->
        <div v-if="loading"
            class="flex flex-col items-center justify-center p-12 border rounded-2xl bg-white/5 border-white/5">
            <div class="w-10 h-10 border-4 border-gray-700 rounded-full border-t-gt-blue animate-spin"></div>

            <p class="mt-4 text-sm text-gray-500">
                Chargement des notifications...
            </p>
        </div>


        <!-- Erreur -->
        <div v-else-if="error" class="p-5 border rounded-2xl bg-red-500/10 border-red-500/20">
            <div class="flex items-start gap-3">
                <div class="text-xl">
                    ⚠️
                </div>

                <div>
                    <h3 class="font-medium text-red-400">
                        Impossible de charger les notifications
                    </h3>

                    <p class="mt-1 text-sm text-gray-400">
                        {{ error }}
                    </p>

                    <button @click="fetchNotifications"
                        class="px-4 py-2 mt-3 text-xs font-medium text-white transition rounded-lg bg-red-500/20 hover:bg-red-500/30">
                        Réessayer
                    </button>
                </div>
            </div>
        </div>


        <!-- Liste vide -->
        <div v-else-if="filteredNotifications.length === 0"
            class="p-12 text-center border rounded-2xl bg-white/5 border-white/5">
            <div class="mb-4 text-5xl">
                🔔
            </div>

            <h2 class="text-lg font-semibold text-white">
                Aucune notification
            </h2>

            <p class="mt-2 text-sm text-gray-500">
                {{ emptyMessage }}
            </p>
        </div>


        <!-- Notifications -->
        <div v-else class="space-y-3">

            <div v-for="notification in filteredNotifications" :key="notification.id" :class="[
                'relative p-5 border rounded-2xl transition-all duration-200',
                notification.is_read
                    ? 'bg-white/5 border-white/5 hover:bg-white/10'
                    : 'bg-blue-500/5 border-blue-500/20 hover:bg-blue-500/10'
            ]">

                <!-- Indicateur non lu -->
                <div v-if="!notification.is_read" class="absolute left-0 w-1 h-12 rounded-r-full top-5 bg-gt-blue">
                </div>


                <div class="flex gap-4">

                    <!-- Icon -->
                    <div :class="[
                        'flex items-center justify-center flex-shrink-0 w-12 h-12 text-xl rounded-full',
                        getIconBackground(notification.type)
                    ]">
                        {{ getNotificationIcon(notification.type) }}
                    </div>


                    <!-- Content -->
                    <div class="flex-1 min-w-0">

                        <!-- Title + badge -->
                        <div class="flex flex-wrap items-center justify-between gap-2">

                            <div class="flex items-center gap-2">

                                <h3 class="font-semibold text-white">
                                    {{ getNotificationTitle(notification.type) }}
                                </h3>

                                <span v-if="!notification.is_read"
                                    class="px-2 py-0.5 text-[10px] font-semibold text-blue-400 bg-blue-500/10 rounded-full">
                                    NOUVEAU
                                </span>

                            </div>

                            <span class="text-xs text-gray-600">
                                {{ formatDate(notification.created_at) }}
                            </span>

                        </div>


                        <!-- Message -->
                        <p class="mt-2 text-sm leading-6 text-gray-400">
                            {{ notification.message }}
                        </p>


                        <!-- Informations -->
                        <div v-if="notification.cours_id || notification.salle_id" class="flex flex-wrap gap-2 mt-3">

                            <span v-if="notification.cours_id"
                                class="px-2 py-1 text-xs text-gray-400 rounded-lg bg-white/5">
                                📚 Cours #{{ notification.cours_id }}
                            </span>

                            <span v-if="notification.salle_id"
                                class="px-2 py-1 text-xs text-gray-400 rounded-lg bg-white/5">
                                🏫 Salle #{{ notification.salle_id }}
                            </span>

                        </div>


                        <!-- Actions -->
                        <div class="flex flex-wrap gap-2 mt-4">

                            <!-- Lire -->
                            <button v-if="!notification.is_read" @click="markAsRead(notification)"
                                :disabled="processingId === notification.id"
                                class="px-3 py-1.5 text-xs font-medium text-blue-400 transition rounded-lg bg-blue-500/10 hover:bg-blue-500/20 disabled:opacity-50">
                                <span v-if="processingId === notification.id">
                                    ...
                                </span>

                                <span v-else>
                                    ✓ Marquer comme lu
                                </span>
                            </button>


                            <!-- Supprimer -->
                            <button @click="deleteNotification(notification.id)"
                                :disabled="processingId === notification.id"
                                class="px-3 py-1.5 text-xs font-medium text-red-400 transition rounded-lg bg-red-500/10 hover:bg-red-500/20 disabled:opacity-50">
                                Supprimer
                            </button>

                        </div>

                    </div>

                </div>

            </div>

        </div>


        <!-- Footer -->
        <div v-if="filteredNotifications.length > 0" class="mt-5 text-center">
            <p class="text-xs text-gray-600">
                {{ filteredNotifications.length }}
                notification(s) affichée(s)
            </p>
        </div>

    </div>
</template>

<style scoped>
::-webkit-scrollbar {
    width: 6px;
}

::-webkit-scrollbar-track {
    background: transparent;
}

::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 10px;
}

::-webkit-scrollbar-thumb:hover {
    background: rgba(255, 255, 255, 0.2);
}

.notification-card {
    transition:
        transform 0.2s ease,
        background-color 0.2s ease;
}

@media (max-width: 640px) {
    .notification-actions {
        flex-direction: column;
    }
}
</style>