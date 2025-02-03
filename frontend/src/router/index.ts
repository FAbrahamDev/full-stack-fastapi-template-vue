import { createRouter, createWebHistory } from "vue-router";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      component: () => import("../layouts/RootLayout.vue"),
      meta: { requiresAuth: true },
      children: [
        {
          path: "",
          name: "Dashboard",
          component: () => import("../views/DashboardView.vue"),
        },
        {
          path: "/admin",
          name: "admin",
          component: () => import("../views/AdminView.vue"),
        },
        {
          path: "/items",
          name: "items",
          component: () => import("../views/ItemView.vue"),
        },
        {
          path: "/settings/:tab?",
          name: "settings",
          component: () => import("../views/UserSettings.vue"),
        },
      ],
    },
    {
      path: "/",
      component: () => import("../layouts/AuthLayout.vue"),
      meta: { requiresAuth: false },
      children: [
        {
          path: "/login",
          name: "login",
          component: () => import("../views/preauth/LoginView.vue"),
        },
        {
          path: "/signup",
          name: "signup",
          component: () => import("../views/preauth/SignupView.vue"),
        },
        {
          path: "/reset-password",
          name: "reset-password",
          component: () => import("../views/preauth/ResetPassword.vue"),
        },
        {
          path: "/recover-password",
          name: "recover-password",
          component: () => import("../views/preauth/RecoverPassword.vue"),
        },
      ],
    },
  ],
});

router.beforeEach((to, from, next) => {
  const isAuthenticated = localStorage.getItem("access_token");
  if (
    to.matched.some((record) => record.meta.requiresAuth) &&
    !isAuthenticated
  ) {
    next({ name: "login" });
  } else {
    next();
  }
});

export default router;
