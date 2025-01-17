import type { App } from "vue";
import { setupPrimeVue } from "./primevue";
import { createPinia } from "pinia";
import router from "@/router";
import { VueQueryPlugin } from "@tanstack/vue-query";

export function registerPlugins(app: App) {
  // default plugins
  app.use(createPinia());
  app.use(router);
  app.use(VueQueryPlugin);

  // custom plugins
  setupPrimeVue(app);
}
