import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { metaPlugin } from "./scripts/vite-meta-plugin.js";

export default defineConfig({
  plugins: [react(), metaPlugin()],
  base: "./",
});
