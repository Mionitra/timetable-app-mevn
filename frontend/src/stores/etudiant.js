import { defineStore } from "pinia";
import api from "../services/api";

export const useEtudiantStore = defineStore(
  "etudiant",
  {
    state: () => ({
      dashboard: {
        todayClasses: [],

        nextClass: null,

        stats: {
          completedTasks: 0,

          totalSubjects: 0,
        },
      },

      schedule: [],

      subjects: [],

      profile: null,

      group: null,

      academicYear: null,

      loading: false,

      error: null,
    }),

    actions: {
      // =================================================
      // DASHBOARD
      // =================================================

      async fetchDashboard() {
        this.loading = true;

        this.error = null;

        try {
          const response =
            await api.get(
              "/student/dashboard"
            );

          this.dashboard =
            response.data;
        } catch (error) {
          this.error =
            error.response?.data?.message ||
            "Erreur de chargement du dashboard";
        } finally {
          this.loading = false;
        }
      },

      // =================================================
      // EMPLOI DU TEMPS
      // =================================================

      async fetchSchedule() {
        this.loading = true;

        this.error = null;

        try {
          /*
           * IMPORTANT :
           *
           * On n'envoie plus la filière.
           *
           * Le backend récupère :
           *
           * req.user.id
           *      ↓
           * User
           *      ↓
           * filiere
           * niveau
           * group_id
           *      ↓
           * Cours du groupe
           */

          const response =
            await api.get(
              "/student/schedule"
            );

          this.schedule =
            Array.isArray(
              response.data?.data
            )
              ? response.data.data
              : [];

          this.group =
            response.data?.group ||
            null;

          this.academicYear =
            response.data?.academicYear ||
            null;

          /*
           * On met également à jour
           * le profil avec la filière
           * et le niveau retournés
           * par le backend.
           */

          if (
            response.data?.student
          ) {
            this.profile = {
              ...(this.profile || {}),

              ...response.data.student,
            };
          }

          return response.data;
        } catch (error) {
          this.schedule = [];

          this.group = null;

          this.error =
            error.response?.data?.message ||
            "Erreur de chargement de l'emploi du temps";

          return null;
        } finally {
          this.loading = false;
        }
      },

      // =================================================
      // VIDER EMPLOI DU TEMPS
      // =================================================

      clearSchedule() {
        this.schedule = [];

        this.group = null;

        this.academicYear = null;

        this.error = null;
      },

      // =================================================
      // MATIERES
      // =================================================

      async fetchSubjects() {
        this.loading = true;

        this.error = null;

        try {
          const response =
            await api.get(
              "/student/subjects"
            );

          this.subjects =
            Array.isArray(
              response.data?.data
            )
              ? response.data.data
              : Array.isArray(
                  response.data
                )
              ? response.data
              : [];
        } catch (error) {
          this.error =
            error.response?.data?.message ||
            "Erreur de chargement des matières";
        } finally {
          this.loading = false;
        }
      },

      // =================================================
      // PROFIL
      // =================================================

      async fetchProfile() {
        this.loading = true;

        this.error = null;

        try {
          const response =
            await api.get(
              "/student/profile"
            );

          this.profile =
            response.data?.user ||
            response.data;
        } catch (error) {
          this.error =
            error.response?.data?.message ||
            "Erreur de chargement du profil";
        } finally {
          this.loading = false;
        }
      },

      // =================================================
      // MODIFIER PROFIL
      // =================================================

      async updateProfile(data) {
        this.loading = true;

        this.error = null;

        try {
          const response =
            await api.put(
              "/student/profile",
              data
            );

          this.profile =
            response.data?.user ||
            response.data;

          return {
            success: true,

            data: response.data,
          };
        } catch (error) {
          this.error =
            error.response?.data?.message ||
            "Erreur lors de la mise à jour du profil";

          return {
            success: false,

            message: this.error,
          };
        } finally {
          this.loading = false;
        }
      },
    },
  }
);