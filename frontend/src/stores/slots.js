import { defineStore } from "pinia";
import api from "../services/api";
import { getCurrentWeek } from "../utils/weeks";

// =========================================================
// Store de gestion des créneaux (admin) : grille hebdomadaire
// d'un groupe, vérification de conflits à la volée, CRUD et
// publication de semaine (sections 2.6 / 2.7).
// =========================================================
export const useSlotsStore = defineStore("slots", {
  state: () => ({
    // Semaine affichée : { weekNumber, year }
    currentWeek: getCurrentWeek(),
    groupId: null,
    slots: [],

    // État du modal d'édition
    modal: {
      isOpen: false,
      mode: "create", // "create" | "edit"
      cell: null, // { dayOfWeek, slotIndex }
      slotData: null, // objet cours formaté (mode édition)
    },
    conflicts: [],
    checking: false,

    loading: false,
    submitting: false,
    publishing: false,
    error: null,
    successMessage: null,
  }),

  actions: {
    async fetchGrid(week = this.currentWeek, groupId = this.groupId) {
      this.loading = true;
      this.error = null;
      try {
        const response = await api.get("/slots", {
          params: {
            groupId,
            weekNumber: week.weekNumber,
            year: week.year,
          },
        });
        this.slots = response.data;
      } catch (error) {
        this.error =
          error.response?.data?.message ||
          "Erreur de chargement de l'emploi du temps";
      } finally {
        this.loading = false;
      }
    },

    setContext(groupId, week) {
      this.groupId = groupId;
      if (week) this.currentWeek = week;
      // Un changement de contexte invalide les messages précédents
      this.error = null;
      this.successMessage = null;
    },

    openCreateModal(cell) {
      this.modal = {
        isOpen: true,
        mode: "create",
        cell: { dayOfWeek: cell.dayOfWeek, slotIndex: cell.slotIndex },
        slotData: null,
      };
      this.conflicts = [];
    },

    openEditModal(slot) {
      this.modal = {
        isOpen: true,
        mode: "edit",
        cell: {
          dayOfWeek: slot.dayOfWeek,
          slotIndex: slot.slotIndex,
        },
        slotData: slot,
      };
      this.conflicts = [];
    },

    closeModal() {
      this.modal.isOpen = false;
      this.modal.cell = null;
      this.modal.slotData = null;
      this.conflicts = [];
    },

    // Vérification à la volée (section 2.7)
    async checkConflicts(payload) {
      this.checking = true;
      try {
        const response = await api.post("/slots/check-conflict", payload);
        this.conflicts = response.data.conflicts;
      } catch (error) {
        this.conflicts = [
          {
            type: "ERREUR",
            message:
              error.response?.data?.message ||
              "Erreur lors de la vérification des conflits",
          },
        ];
      } finally {
        this.checking = false;
      }
    },

    async submitSlot(payload) {
      this.submitting = true;
      this.error = null;
      try {
        if (this.modal.mode === "edit" && this.modal.slotData) {
          await api.put(`/slots/${this.modal.slotData.id}`, payload);
          this.successMessage = "Cours mis à jour";
        } else {
          await api.post("/slots", payload);
          this.successMessage = "Cours créé avec succès";
        }

        this.closeModal();
        await this.fetchGrid();
        return { success: true };
      } catch (error) {
        // Conflits renvoyés par l'écriture (409) → affichage dans le modal
        if (error.response?.status === 409 && error.response?.data?.conflicts) {
          this.conflicts = error.response.data.conflicts;
          return { success: false };
        }

        this.error =
          error.response?.data?.message || "Erreur lors de l'enregistrement";
        return { success: false, message: this.error };
      } finally {
        this.submitting = false;
      }
    },

    async deleteSlot(id) {
      this.submitting = true;
      this.error = null;
      try {
        await api.delete(`/slots/${id}`);
        this.closeModal();
        this.successMessage = "Cours supprimé";
        await this.fetchGrid();
        return { success: true };
      } catch (error) {
        this.error =
          error.response?.data?.message || "Erreur lors de la suppression";
        return { success: false, message: this.error };
      } finally {
        this.submitting = false;
      }
    },

    // Publication atomique de la semaine pour un groupe (section 2.7)
    async publishWeek(groupId = this.groupId, week = this.currentWeek) {
      this.publishing = true;
      this.error = null;
      try {
        const response = await api.patch("/slots/publish-week", {
          groupId,
          weekNumber: week.weekNumber,
          year: week.year,
        });
        this.successMessage = response.data.message;
        await this.fetchGrid(week, groupId);
        return { success: true, message: response.data.message };
      } catch (error) {
        this.error =
          error.response?.data?.message || "Erreur lors de la publication";
        return { success: false, message: this.error };
      } finally {
        this.publishing = false;
      }
    },
  },
});
