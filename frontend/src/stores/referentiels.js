import { defineStore } from "pinia";
import api from "../services/api";

// =========================================================
// Store des référentiels (admin) : salles, groupes, matières,
// enseignants + gestion des comptes étudiants en attente.
// =========================================================
export const useReferentielsStore = defineStore("referentiels", {
  state: () => ({
    salles: [],
    groupes: [],
    matieres: [],
    enseignants: [],
    pendingStudents: [],
    loading: false,
    error: null,
  }),

  actions: {
    // ---------- Salles ----------
    async fetchSalles() {
      this.error = null;
      try {
        const response = await api.get("/salles");
        this.salles = response.data;
      } catch (error) {
        this.error =
          error.response?.data?.message || "Erreur de chargement des salles";
      }
    },

    async createSalle(data) {
      this.error = null;
      try {
        const response = await api.post("/salles", data);
        await this.fetchSalles();
        return { success: true, message: response.data.message };
      } catch (error) {
        this.error =
          error.response?.data?.message || "Erreur lors de la création de la salle";
        return { success: false, message: this.error };
      }
    },

    async updateSalle(id, data) {
      this.error = null;
      try {
        const response = await api.put(`/salles/${id}`, data);
        await this.fetchSalles();
        return { success: true, message: response.data.message };
      } catch (error) {
        this.error =
          error.response?.data?.message || "Erreur lors de la mise à jour de la salle";
        return { success: false, message: this.error };
      }
    },

    async deleteSalle(id) {
      this.error = null;
      try {
        const response = await api.delete(`/salles/${id}`);
        this.salles = this.salles.filter((s) => s.id !== id && s._id !== id);
        return { success: true, message: response.data.message };
      } catch (error) {
        this.error =
          error.response?.data?.message || "Erreur lors de la suppression de la salle";
        return { success: false, message: this.error };
      }
    },

    // ---------- Groupes ----------
    async fetchGroupes() {
      this.error = null;
      try {
        const response = await api.get("/groupes");
        this.groupes = response.data;
      } catch (error) {
        this.error =
          error.response?.data?.message || "Erreur de chargement des groupes";
      }
    },

    async createGroupe(data) {
      this.error = null;
      try {
        const response = await api.post("/groupes", data);
        await this.fetchGroupes();
        return { success: true, message: response.data.message };
      } catch (error) {
        this.error =
          error.response?.data?.message || "Erreur lors de la création du groupe";
        return { success: false, message: this.error };
      }
    },

    async deleteGroupe(id) {
      this.error = null;
      try {
        const response = await api.delete(`/groupes/${id}`);
        this.groupes = this.groupes.filter((g) => g.id !== id);
        return { success: true, message: response.data.message };
      } catch (error) {
        this.error =
          error.response?.data?.message || "Erreur lors de la suppression du groupe";
        return { success: false, message: this.error };
      }
    },

    // ---------- Matières ----------
    async fetchMatieres() {
      this.error = null;
      try {
        const response = await api.get("/matieres");
        this.matieres = response.data;
      } catch (error) {
        this.error =
          error.response?.data?.message || "Erreur de chargement des matières";
      }
    },

    async createMatiere(data) {
      this.error = null;
      try {
        const response = await api.post("/matieres", data);
        await this.fetchMatieres();
        return { success: true, message: response.data.message };
      } catch (error) {
        this.error =
          error.response?.data?.message || "Erreur lors de la création de la matière";
        return { success: false, message: this.error };
      }
    },

    async deleteMatiere(id) {
      this.error = null;
      try {
        const response = await api.delete(`/matieres/${id}`);
        this.matieres = this.matieres.filter((m) => m.id !== id);
        return { success: true, message: response.data.message };
      } catch (error) {
        this.error =
          error.response?.data?.message || "Erreur lors de la suppression de la matière";
        return { success: false, message: this.error };
      }
    },

    // ---------- Enseignants ----------
    async fetchEnseignants() {
      this.error = null;
      try {
        const response = await api.get("/users/teachers");
        this.enseignants = response.data;
      } catch (error) {
        this.error =
          error.response?.data?.message ||
          "Erreur de chargement des enseignants";
      }
    },

    /**
     * Crée un enseignant. Retourne le mot de passe temporaire
     * (à afficher UNE SEULE fois à l'admin — RF-AUTH-03).
     */
    async createEnseignant(data) {
      this.error = null;
      try {
        const response = await api.post("/users/teacher", data);
        await this.fetchEnseignants();
        return {
          success: true,
          message: response.data.message,
          temporaryPassword: response.data.temporaryPassword,
        };
      } catch (error) {
        this.error =
          error.response?.data?.message ||
          "Erreur lors de la création de l'enseignant";
        return { success: false, message: this.error };
      }
    },

    async deactivateEnseignant(id) {
      this.error = null;
      try {
        const response = await api.patch(`/users/${id}/deactivate`);
        this.enseignants = this.enseignants.filter((e) => e.id !== id);
        return { success: true, message: response.data.message };
      } catch (error) {
        this.error =
          error.response?.data?.message ||
          "Erreur lors de la désactivation de l'enseignant";
        return { success: false, message: this.error };
      }
    },

    // ---------- Comptes étudiants en attente ----------
    async fetchPendingStudents() {
      this.error = null;
      try {
        const response = await api.get("/users/pending");
        this.pendingStudents = response.data;
      } catch (error) {
        this.error =
          error.response?.data?.message ||
          "Erreur de chargement des inscriptions en attente";
      }
    },

    async activateStudent(id) {
      this.error = null;
      try {
        const response = await api.patch(`/users/${id}/activate`);
        this.pendingStudents = this.pendingStudents.filter((s) => s.id !== id);
        return { success: true, message: response.data.message };
      } catch (error) {
        this.error =
          error.response?.data?.message ||
          "Erreur lors de l'activation du compte";
        return { success: false, message: this.error };
      }
    },
  },
});
