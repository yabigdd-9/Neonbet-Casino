import { defineConfig, devices } from "@playwright/test";

const chromiumLaunch = process.env.CHROMIUM_EXECUTABLE_PATH
  ? { executablePath: process.env.CHROMIUM_EXECUTABLE_PATH } : {};
export default defineConfig({
  testDir: "./tests/browser",
  fullyParallel: true,
  timeout: 60000,
  workers: process.env.CI ? 2 : 2,
  retries: process.env.CI ? 1 : 0,
  reporter: "list",
  use: { baseURL: "http://127.0.0.1:4173", trace: "off", screenshot: "off" },
  projects: [
    { name: "desktop-chromium", use: { ...devices["Desktop Chrome"], launchOptions: chromiumLaunch } },
    { name: "android-chromium", use: { ...devices["Pixel 7"], launchOptions: chromiumLaunch } },
    { name: "iphone-webkit", use: { ...devices["iPhone 13"], browserName: "webkit", launchOptions: process.env.WEBKIT_EXECUTABLE_PATH ? { executablePath: process.env.WEBKIT_EXECUTABLE_PATH } : {} } },
  ],
  webServer: {
    command: "npm run build && npm run preview -- --host 127.0.0.1 --port 4173 --strictPort",
    url: "http://127.0.0.1:4173",
    reuseExistingServer: false,
    env: { VITE_SUPABASE_URL: "https://auth.example.invalid", VITE_SUPABASE_ANON_KEY: "public-test-placeholder" },
  },
});
