<script setup>
import { computed, onMounted } from "vue";
import { useEtudiantStore } from "../../stores/etudiant";

const etudiantStore = useEtudiantStore();

onMounted(async () => {
  await etudiantStore.fetchSchedule();
});

const schedule = computed(() => {
  return etudiantStore.schedule || [];
});

const selectedGroup = computed(() => {
  return etudiantStore.group;
});

const profile = computed(() => {
  return etudiantStore.profile;
});

const days = [
  "Lundi",
  "Mardi",
  "Mercredi",
  "Jeudi",
  "Vendredi",
];

const hours = [
  "07:00",
  "08:00",
  "09:00",
  "10:00",
  "11:00",
  "12:00",
  "13:00",
  "14:00",
  "15:00",
  "16:00",
  "17:00",
];


const HOUR_HEIGHT = 4; // rem

const GRID_START_HOUR = 7;

const GRID_END_HOUR = 17;

const GRID_HEIGHT = (GRID_END_HOUR - GRID_START_HOUR) * HOUR_HEIGHT;

const colorMap = {
  CM: "bg-blue-600/20 border-blue-500/30 text-blue-100 shadow-[0_0_15px_rgba(37,99,235,0.2)]",

  TD: "bg-purple-600/20 border-purple-500/30 text-purple-100",

  TP: "bg-emerald-600/20 border-emerald-500/30 text-emerald-100",

  EXAMEN: "bg-red-600/20 border-red-500/30 text-red-100",
};

const getColor = (course) => {
  return (
    colorMap[course?.type] ||
    "bg-white/5 border-white/10 text-gray-200"
  );
};

const timeToDecimal = (time) => {
  if (!time) {
    return null;
  }

  const parts = String(time).split(":");

  const hour = Number.parseInt(parts[0], 10);

  const minute = Number.parseInt(parts[1] || "0", 10);

  if (Number.isNaN(hour) || Number.isNaN(minute)) {
    return null;
  }

  return hour + minute / 60;
};

const getStyle = (course) => {
  if (!course?.startTime || !course?.endTime) {
    return {};
  }

  const startHour = timeToDecimal(course.startTime);
  const endHour = timeToDecimal(course.endTime);

  if (startHour === null || endHour === null) {
    return {};
  }


  const top = (startHour - GRID_START_HOUR) * HOUR_HEIGHT;

  const duration = Math.max(0.5, endHour - startHour);

  const height = duration * HOUR_HEIGHT;

  const safeTop = Math.max(0, top);

  return {
    top: `${safeTop}rem`,
    height: `${height}rem`,
  };
};

const getCoursesForDay = (dayIndex) => {
  return schedule.value.filter((course) => {
    return Number(course?.dayOfWeek) === dayIndex + 1;
  });
};
</script>

<template>
  <div class="flex flex-col min-h-full p-4 border sm:p-6 lg:p-8 bg-white/5 border-white/5 rounded-[2rem]">

    <div class="flex flex-col justify-between gap-4 mb-6 sm:flex-row sm:items-center">
      <h2 class="flex items-center gap-2 text-2xl font-bold text-white">
        <svg class="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>

        Mon Emploi du temps
      </h2>

      <div class="flex items-center gap-2 p-1 border rounded-full bg-white/5 border-white/10">
        <button type="button"
          class="px-4 py-2 text-sm font-medium text-white rounded-full bg-blue-600 shadow-[0_0_15px_rgba(37,99,235,0.4)]">
          Semaine Actuelle
        </button>
      </div>
    </div>

    <div class="flex flex-col justify-between gap-5 mb-6 lg:flex-row lg:items-center">
      <div>
        <p class="mt-1 text-sm text-gray-400">
          Votre emploi du temps est automatiquement chargé
          selon votre filière et votre niveau.
        </p>
      </div>
    </div>

    <div v-if="
      !etudiantStore.loading &&
      (profile || selectedGroup)
    " class="flex flex-wrap items-center gap-3 mb-5">

      <!-- FILIÈRE -->

      <div v-if="profile?.filiere"
        class="flex items-center gap-2 px-4 py-2 text-sm text-blue-200 border rounded-full bg-blue-500/10 border-blue-500/20">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 14l9-5-9-5-9 5 9 5z" />

          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M12 14l6.16-3.42A12.08 12.08 0 0118 16.5c0 1.38-2.69 2.5-6 2.5s-6-1.12-6-2.5c0-2.06.67-3.98 1.84-5.92L12 14z" />
        </svg>

        <span>
          Filière :

          <strong class="text-white">
            {{ profile.filiere }}
          </strong>
        </span>
      </div>

      <div v-if="profile?.niveau"
        class="flex items-center gap-2 px-4 py-2 text-sm text-purple-200 border rounded-full bg-purple-500/10 border-purple-500/20">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 14l9-5-9-5-9 5 9 5z" />
        </svg>

        <span>
          Niveau :

          <strong class="text-white">
            {{ profile.niveau }}
          </strong>
        </span>
      </div>

      <!-- GROUPE -->

      <div v-if="selectedGroup"
        class="flex items-center gap-2 px-4 py-2 text-sm text-gray-300 border rounded-full bg-white/5 border-white/10">
        <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>

        <span>
          Groupe :

          <strong class="text-white">
            {{ selectedGroup.name }}
          </strong>
        </span>
      </div>

      <div v-if="!etudiantStore.loading"
        class="px-4 py-2 text-sm text-gray-400 border rounded-full bg-white/5 border-white/10">
        {{ schedule.length }} cours
      </div>
    </div>


    <div v-if="etudiantStore.error"
      class="flex items-start gap-3 p-4 mb-5 text-sm text-red-200 border rounded-xl bg-red-500/10 border-red-500/20">
      <svg class="flex-shrink-0 w-5 h-5 mt-0.5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
          d="M12 9v2m0 4h.01M12 3a9 9 0 100 18 9 9 0 000-18z" />
      </svg>

      <div>
        <p class="font-medium">
          Impossible de charger l'emploi du temps
        </p>

        <p class="mt-1 text-red-300/80">
          {{ etudiantStore.error }}
        </p>
      </div>
    </div>

    <div v-if="etudiantStore.loading" class="flex items-center justify-center flex-1 min-h-[400px]">
      <div class="text-center">

        <div class="w-12 h-12 mx-auto mb-4 border-4 rounded-full border-blue-500/20 border-t-blue-500 animate-spin">
        </div>

        <p class="text-sm text-gray-400">
          Chargement de votre emploi du temps...
        </p>

      </div>
    </div>

    <div v-else-if="
      !etudiantStore.error &&
      schedule.length === 0
    " class="flex items-center justify-center flex-1 min-h-[400px]">
      <div class="max-w-md text-center">

        <div class="flex items-center justify-center w-20 h-20 mx-auto mb-5 rounded-2xl bg-yellow-500/10">
          <svg class="w-10 h-10 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
              d="M12 9v2m0 4h.01M12 3a9 9 0 100 18 9 9 0 000-18z" />
          </svg>
        </div>

        <h3 class="mb-2 text-lg font-semibold text-white">
          Aucun cours trouvé
        </h3>

        <p class="text-sm leading-6 text-gray-400">
          Aucun cours n'est actuellement planifié
          pour votre groupe.
        </p>

      </div>
    </div>

    <div v-else-if="schedule.length > 0"
      class="flex-1 mt-2 overflow-x-auto border rounded-3xl border-white/5 bg-gray-950/50">
      <div class="min-w-[970px]">

        <div
          class="sticky top-0 z-20 grid grid-cols-[70px_repeat(5,minmax(180px,1fr))] bg-gray-900 border-b border-white/5">

          <!-- COLONNE HEURE -->

          <div class="flex items-center justify-center p-3 border-r border-white/5">
            <svg class="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div v-for="day in days" :key="day" class="p-3 text-center border-r border-white/5 last:border-r-0">
            <div class="text-sm font-bold text-white">
              {{ day }}
            </div>
          </div>

        </div>

        <div class="grid grid-cols-[70px_repeat(5,minmax(180px,1fr))] relative" :style="{
          height: `${GRID_HEIGHT}rem`
        }">

          <div class="border-r border-gray-700/50 bg-gray-800/20">

            <div v-for="hour in hours" :key="hour"
              class="relative h-16 p-2 text-xs font-medium text-right text-gray-500 border-b border-gray-700/30">

              <span class="relative -top-2 whitespace-nowrap">
                {{ hour }}
              </span>

            </div>

          </div>

          <div v-for="(day, dayIndex) in days" :key="day"
            class="relative border-r border-gray-700/30 last:border-r-0 group">
            <div
              class="absolute inset-0 transition-colors pointer-events-none bg-transparent group-hover:bg-white/[0.02]">
            </div>

            <div v-for="hour in hours" :key="`${day}-${hour}`" class="h-16 border-b border-white/5"></div>

            <RouterLink v-for="course in getCoursesForDay(dayIndex)" :key="course.id || course._id"
              :to="`/etudiant/course/${course.id || course._id}`"
              class="absolute left-[6px] w-[calc(100%-12px)] rounded-xl border p-3 flex flex-col overflow-hidden cursor-pointer shadow-sm transition-all duration-200 hover:scale-[1.02] hover:z-10 hover:shadow-lg"
              :class="getColor(course)" :style="getStyle(course)">


              <div class="flex items-start justify-between gap-1 mb-2">

                <span
                  class="text-[10px] font-bold uppercase tracking-wider bg-black/25 px-1.5 py-0.5 rounded backdrop-blur-sm">
                  {{ course.type || "COURS" }}
                </span>
                <span
                  class="text-[10px] font-semibold opacity-75 whitespace-nowrap bg-black/20 px-1.5 py-0.5 rounded-full">
                  {{ course.startTime }}
                  -
                  {{ course.endTime }}
                </span>

              </div>

              <!-- MATIÈRE -->

              <h4 class="mb-1 text-sm font-bold leading-tight">
                {{
                  course.subject?.name ||
                  course.subjectName ||
                  "Cours"
                }}
              </h4>

              <!-- PROFESSEUR -->

              <p v-if="course.teacher" class="flex items-center gap-1.5 mb-1 text-xs opacity-70">
                <svg class="flex-shrink-0 w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>

                <span class="truncate">
                  {{ course.teacher.firstName }}
                  {{ course.teacher.lastName }}
                </span>
              </p>

              <!-- SALLE -->

              <p class="flex items-center gap-1.5 mt-auto text-xs opacity-80">
                <svg class="flex-shrink-0 w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />

                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>

                <span class="truncate">
                  {{
                    course.room ||
                    "Salle non définie"
                  }}
                </span>
              </p>

            </RouterLink>

          </div>

        </div>

      </div>

    </div>

  </div>
</template>