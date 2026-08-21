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
    meta: { requiresAuth: true, role: "admin" },
    children: [
      {
        path: "",
        name: "AdminOverview",
        component: () => import("../views/admin/AdminOverview.vue"),
      },
      {
        path: "enseignants",
        name: "AdminEnseignants",
        component: () => import("../views/admin/EnseignantsView.vue"),
      },
      {
        path: "salles",
        name: "AdminSalles",
        component: () => import("../views/admin/SallesView.vue"),
      },
      {
        path: "academic-years",
        name: "AdminAcademicYears",
        component: () => import("../views/admin/AcademicYearsView.vue"),
      },
      {
        path: "semestres",
        name: "AdminSemestres",
        component: () => import("../views/admin/SemestresView.vue"),
      },
      {
        path: "matieres",
        name: "AdminMatieres",
        component: () => import("../views/admin/MatieresView.vue"),
      },
      {
        path: "cours",
        name: "AdminCours",
        component: () => import("../views/admin/CoursView.vue"),
      },
    ],
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
        path: "subjects",
        name: "EtudiantSubjects",
        component: () => import("../views/etudiant/SubjectsView.vue"),
      },
      {
        path: "subjects/:id",
        name: "EtudiantSubjectDetails",
        component: () => import("../views/etudiant/SubjectDetailsView.vue"),
      },
      {
        path: "course/:id",
        name: "EtudiantCourseDetails",
        component: () => import("../views/etudiant/CourseDetailsView.vue"),
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
      },
      {
        path: "notifications",
        name: "EtudiantNotifications",
        component: () => import("../components/Notification.vue"),
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