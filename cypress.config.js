import { defineConfig } from 'cypress'

export default defineConfig({
    retries: {
        openMode: 2,
    },
    e2e: {
        baseUrl: 'http://localhost:3000',
        defaultCommandTimeout: 10000,
        setupNodeEvents(on, config) {
            // implement node event listeners here
        },
    },
})
