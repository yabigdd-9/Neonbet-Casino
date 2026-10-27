import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./e2e",
  timeout: 45000,
  workers: 2,
  reporter: [["list"], ["json", { outputFile: "test-results/results.json" }]],
  use: {
    baseURL: "http://127.0.0.1:4173/Neonbet-Casino/",
    screenshot: "only-on-failure",
    trace: "retain-on-failure",
  },
  projects: [
    { name: "chromium", use: { browserName: "chromium" } },
    { name: "webkit", use: { browserName: "webkit" } },
  ],
  webServer: {
    command: "npm run preview -- --host 127.0.0.1 --port 4173 --strictPort --base=/Neonbet-Casino/",
    url: "http://127.0.0.1:4173/Neonbet-Casino/",
    reuseExistingServer: !process.env.CI,
  },
});
