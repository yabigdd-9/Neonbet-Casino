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
    { name: "chromium", testIgnore: "**/shared-referrals.spec.js", use: { browserName: "chromium" } },
    { name: "webkit", testIgnore: "**/shared-referrals.spec.js", use: { browserName: "webkit" } },
    ...["chromium", "webkit"].map((browserName) => ({
      name: `referrals-${browserName}`,
      testMatch: "**/shared-referrals.spec.js",
      use: { browserName, baseURL: "http://127.0.0.1:4174/" },
    })),
  ],
  webServer: [
    {
      command: "npm run preview -- --host 127.0.0.1 --port 4173 --strictPort --base=/Neonbet-Casino/",
      url: "http://127.0.0.1:4173/Neonbet-Casino/",
      reuseExistingServer: !process.env.CI,
    },
    {
      command: "npm run dev -- --host 127.0.0.1 --port 4174 --strictPort",
      url: "http://127.0.0.1:4174/",
      reuseExistingServer: false,
      env: {
        VITE_APP_MODE: "supabase",
        VITE_ENABLE_SHARED_REFERRALS: "true",
        VITE_SUPABASE_URL: "http://127.0.0.1:54399",
        VITE_SUPABASE_ANON_KEY: "sb_publishable_isolated_browser_fixture",
      },
    },
  ],
});
