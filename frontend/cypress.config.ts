import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    baseUrl: 'http://127.0.0.1:8080',
    //prévu pour gérer les événements si besoin,
    setupNodeEvents(on, config) {
      // ...
    },
  },
});
