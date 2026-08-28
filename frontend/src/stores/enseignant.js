import { defineStore } from "pinia";
import api from "../services/api";

// =========================================================
// Store enseignant : indisponibilités récurrentes par créneau
// (dayOfWeek + slotIndex, section 2.4) et planning personnel
// publié (RF-TEACH-02).
// =========================================================
export const useEnseignantStore = defineStore("enseignant", {
  state: () => ({
    indisponibilites: [],
    planning: [],
    loading: false,
    error: null,
  }),

  actions: {
    async fetchIndisponibilites() {
      this.loading = true;
      this.error = null;
      try {
        const response = await api.get("/indisponibilites/me");
        this.indisponibilites = response.data;
      } catch (error) {
        this.error =
          error.response?.data?.message ||
          "Erreur de chargement des indisponibilités";
      } finally {
        this.loading = false;
      }
    },

    async createIndisponibilite(data) {
      this.loading = true;
      this.error = null;
      try {
        const response = await api.post("/indisponibilites", data);
        this.indisponibilites.unshift(response.data.indisponibilite);
        return { success: true };
      } catch (error) {
        this.error =
          error.response?.data?.message ||
          "Erreur lors de l'ajout de l'indisponibilité";
        return { success: false, message: this.error };
      } finally {
        this.loading = false;
      }
    },

    async deleteIndisponibilite(id) {
      this.loading = true;
      this.error = null;
      try {
        await api.delete(`/indisponibilites/${id}`);
        this.indisponibilites = this.indisponibilites.filter(
          (i) => i.id !== id && i._id !== id
        );
        return { success: true };
      } catch (error) {
        this.error =
          error.response?.data?.message ||
          "Erreur lors de la suppression de l'indisponibilité";
        return { success: false, message: this.error };
      } finally {
        this.loading = false;
      }
    },

    async fetchPlanning(week = null) {
      this.loading = true;
      this.error = null;
      try {
        const params =
          week !== null
            ? { weekNumber: week.weekNumber, year: week.year }
            : {};
        const response = await api.get("/slots/me", { params });
        this.planning = response.data;
      } catch (error) {
        this.error =
          error.response?.data?.message ||
          "Erreur de chargement du planning";
      } finally {
        this.loading = false;
      }
    },
  },
});
