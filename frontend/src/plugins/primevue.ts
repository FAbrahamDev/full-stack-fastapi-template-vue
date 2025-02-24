import type { App } from "vue";

import PrimeVue from "primevue/config";
import Aura from "@primeuix/themes/aura";
import ToastService from "primevue/toastservice";
import ConfirmationService from "primevue/confirmationservice";

export function setupPrimeVue(app: App) {
  app.use(PrimeVue, {
    theme: {
      preset: Aura,
      options: {
        darkModeSelector: ".dark-mode",
      },
    },
  });
  app.use(ToastService);
  app.use(ConfirmationService);
}
