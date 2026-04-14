import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  timeout: 30_000,
  fullyParallel: true,
  retries: 0,
  reporter: [["list"], ["allure-playwright"]],
  use: {
    baseURL: "https://playwright.dev",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure"
  }
});
