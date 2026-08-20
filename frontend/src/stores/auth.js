import { defineStore } from "pinia";
import api from "../services/api";

export const useAuthStore = defineStore("auth", {
  state: () => ({
    token: localStorage.getItem("token") || null,
    user: JSON.parse(localStorage.getItem("user")) || null,
    loading: false,
    error: null,
  }),

  getters: {
    isAuthenticated: (state) => !!state.token,

    role: (state) => state.user?.role || null,
  },

  actions: {
    async login(email, password) {
      this.loading = true;
      this.error = null;

      try {
        const response = await api.post("/auth/login", {
          email,
          password,
        });

        this.token = response.data.token;
        this.user = response.data.user;

        localStorage.setItem("token", this.token);
        localStorage.setItem("user", JSON.stringify(this.user));

        return response.data;
      } catch (error) {
        this.error =
          error.response?.data?.message ||
          "Email ou mot de passe incorrect";

        throw error;
      } finally {
        this.loading = false;
      }
    },

    async register(userData) {
      this.loading = true;
      this.error = null;

      try {
        const response = await api.post("/auth/register", userData);

        return response.data;
      } catch (error) {
        this.error =
          error.response?.data?.message ||
          "Erreur lors de l'inscription";

        throw error;
      } finally {
        this.loading = false;
      }
    },

    logout() {
      this.token = null;
      this.user = null;

      localStorage.removeItem("token");
      localStorage.removeItem("user");
    },
  },
});