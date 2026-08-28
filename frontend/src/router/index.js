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
    component: AdminDashboard,
    meta: {
      requiresAuth: true,
      role: "admin",
    },
    children: [
      {
        path: "",
        name: "AdminPlanning",
        component: () => import("../views/admin/PlanningEditorView.vue"),
      },
      {
        path: "referentiels",
        name: "AdminReferentiels",
        component: () => import("../views/admin/ReferentielsView.vue"),
      },
      {
        path: "utilisateurs",
        name: "AdminUsers",
        component: () => import("../views/admin/UsersView.vue"),
      },
    ],
  },

  {
    path: "/enseignant",
    component: EnseignantDashboard,
    meta: {
      requiresAuth: true,
      role: "enseignant",
    },
    children: [
      {
        path: "",
        name: "EnseignantOverview",
        component: () => import("../views/enseignant/DashboardOverview.vue"),
      },
      {
        path: "planning",
        name: "EnseignantPlanning",
        component: () => import("../views/enseignant/PlanningView.vue"),
      },
      {
        path: "indisponibilites",
        name: "EnseignantIndisponibilites",
        component: () => import("../views/enseignant/IndisponibilitesView.vue"),
      },
    ],
  },

  {
    path: "/etudiant",
    component: EtudiantDashboard,
    meta: {
      requiresAuth: true,
      role: "etudiant",
    },
    children: [
      {
        path: "",
        name: "EtudiantDashboardOverview",
        component: () => import("../views/etudiant/DashboardOverview.vue"),
      },
      {
        path: "schedule",
        name: "EtudiantSchedule",
        component: () => import("../views/etudiant/ScheduleView.vue"),
      },
      {
        path: "profile",
        name: "EtudiantProfile",
        component: () => import("../views/etudiant/ProfileView.vue"),
      },
      {
        path: "settings",
        name: "EtudiantSettings",
        component: () => import("../views/etudiant/SettingsView.vue"),
      }
    ]
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
 