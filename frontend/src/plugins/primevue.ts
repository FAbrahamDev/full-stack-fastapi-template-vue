import type { App } from 'vue'

import PrimeVue from 'primevue/config'
import Aura from '@primevue/themes/aura';
import ToastService from 'primevue/toastservice';

export function setupPrimeVue(app: App) {
  app.use(PrimeVue, {
    theme: {
      preset: Aura,
    }
  });
  app.use(ToastService);
}
