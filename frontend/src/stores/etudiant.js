import { defineStore } from "pinia";
import api from "../services/api";

export const useEtudiantStore = defineStore("etudiant", {
  state: () => ({
    dashboard: {
      todayClasses: [],
      nextClass: null,
      stats: { completedTasks: 0, totalSubjects: 0 },
    },
    schedule: [],
    subjects: [],
    profile: null,
    loading: false,
    error: null,
  }),

  actions: {
    async fetchDashboard() {
      this.loading = true;
      this.error = null;
      try {
        const response = await api.get("/student/dashboard");
        this.dashboard = response.data;
      } catch (error) {
        this.error =
          error.response?.data?.message || "Erreur de chargement du dashboard";
      } finally {
        this.loading = false;
      }
    },

    async fetchSchedule() {
      this.loading = true;
      this.error = null;
      try {
        const response = await api.get("/student/schedule");
        this.schedule = response.data;
      } catch (error) {
        this.error =
          error.response?.data?.message ||
          "Erreur de chargement de l'emploi du temps";
      } finally {
        this.loading = false;
      }
    },

    async fetchSubjects() {
      this.loading = true;
      this.error = null;
      try {
        const response = await api.get("/student/subjects");
        this.subjects = response.data;
      } catch (error) {
        this.error =
          error.response?.data?.message || "Erreur de chargement des matières";
      } finally {
        this.loading = false;
      }
    },

    async fetchProfile() {
      this.loading = true;
      this.error = null;
      try {
        const response = await api.get("/student/profile");
        this.profile = response.data;
      } catch (error) {
        this.error =
          error.response?.data?.message || "Erreur de chargement du profil";
      } finally {
        this.loading = false;
      }
    },

    async updateProfile(data) {
      this.loading = true;
      this.error = null;
      try {
        const response = await api.put("/student/profile", data);
        this.profile = response.data.user;
        return { success: true };
      } catch (error) {
        this.error =
          error.response?.data?.message || "Erreur lors de la mise à jour du profil";
        return { success: false, message: this.error };
      } finally {
        this.loading = false;
      }
    },
  },
});
