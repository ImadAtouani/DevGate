import { createRouter, createWebHistory } from "vue-router";
import { useAuth } from "../composables/useAuth";

// Import your views
import Login from "../views/Login.vue";
import Dashboard from "../views/Dashboard.vue";
import SkillTracker from "../views/SkillTracker.vue";
import Projects from "../views/Projects.vue";
import Timeline from "../views/Timeline.vue";
import Objectives from "../views/Objectives.vue";
import NotFound from "../views/NotFound.vue";

const routes = [
  {
    path: "/",
    redirect: "/dashboard",
  },
  {
    path: "/login",
    name: "login",
    component: Login,
    meta: { requiresAuth: false },
  },
  {
    path: "/dashboard",
    name: "dashboard",
    component: Dashboard,
    meta: { requiresAuth: true },
  },
  {
    path: "/skills",
    name: "skills",
    component: SkillTracker,
    meta: { requiresAuth: true },
  },
  {
    path: "/projects",
    name: "projects",
    component: Projects,
    meta: { requiresAuth: true },
  },
  {
    path: "/timeline",
    name: "timeline",
    component: Timeline,
    meta: { requiresAuth: true },
  },
  {
    path: "/objectives",
    name: "objectives",
    component: Objectives,
    meta: { requiresAuth: true },
  },
  {
    path: "/:pathMatch(.*)*",
    name: "not-found",
    component: NotFound,
  },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
  linkActiveClass: "active",
});

// Navigation guard with improved authentication check
router.beforeEach(async (to, from, next) => {
  const { isAuthenticated, isInitialized, checkAuth } = useAuth();

  // Wait for authentication to initialize if it hasn't already
  if (!isInitialized.value) {
    await checkAuth();
  }

  const requiresAuth = to.matched.some(
    (record) => record.meta.requiresAuth !== false
  );

  if (requiresAuth && !isAuthenticated.value) {
    next("/login");
  } else {
    next();
  }
});

export default router;
