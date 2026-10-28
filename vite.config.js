import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "VITE_");
  return {
    plugins: [
      react(),
      {
        name: "brand-metadata",
        transformIndexHtml: {
          order: "pre",
          handler(html) {
            const name = (env.VITE_BRAND_NAME || "Lucky Orbit").replace(
              /[&<>"']/g,
              (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char],
            );
            return html.replaceAll("%VITE_BRAND_NAME%", name);
          },
        },
      },
    ],
    base: "./",
    build: { target: "es2022", manifest: true },
  };
});
