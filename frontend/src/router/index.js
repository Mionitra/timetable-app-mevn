import { createRouter, createWebHistory } from "vue-router";

import Login from "../views/auth/Login.vue";
import Register from "../views/auth/Register.vue";

import AdminDashboard from "../views/admin/AdminDashboard.vue";
import EnseignantDashboard from "../views/enseignant/EnseignantDashboard.vue";
import EtudiantDashboard from "../views/etudiant/EtudiantDashboard.vue";

const routes = [
  {
    path: "/",
    redirect: "/connexion",
  },

  {
    path: "/connexion",
    name: "Login",
    component: Login,

    meta: {
      guest: true,
    },
  },

  {
    path: "/inscription",
    name: "Register",
    component: Register,

    meta: {
      guest: true,
    },
  },

  {
    path: "/admin",
    name: "AdminDashboard",
    component: AdminDashboard,

    meta: {
      requiresAuth: true,
      role: "admin",
    },
  },

  {
    path: "/enseignant",
    name: "EnseignantDashboard",
    component: EnseignantDashboard,

    meta: {
      requiresAuth: true,
      role: "enseignant",
    },
  },

  {
    path: "/etudiant",
    name: "EtudiantDashboard",
    component: EtudiantDashboard,

    meta: {
      requiresAuth: true,
      role: "etudiant",
    },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to) => {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));

  // Route protégée
  if (to.meta.requiresAuth) {
    if (!token || !user) {
      return "/connexion";
    }

    // Vérification du rôle
    if (to.meta.role && to.meta.role !== user.role) {
      return redirectByRole(user.role);
    }
  }

  // Si déjà connecté
  if (to.meta.guest && token && user) {
    return redirectByRole(user.role);
  }

  return true;
});

function redirectByRole(role) {
  switch (role) {
    case "admin":
      return "/admin";

    case "enseignant":
      return "/enseignant";

    case "etudiant":
      return "/etudiant";

    default:
      return "/connexion";
  }
}

export default router;