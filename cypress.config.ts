// cypress.config.ts
import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000', // Update this URL if needed
    supportFile: 'cypress/support/index.ts', 
    screenshotOnRunFailure: true, 
    video: true, 


    setupNodeEvents(on, config) {
      // You can add event listeners here if needed
    },
  },
});
