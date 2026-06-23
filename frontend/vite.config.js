// Vite ayarlari - React plugin'i ekliyoruz, gerisi varsayilan.
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        entryFileNames: `assets/[name]-[hash]-v2.js`,
      }
    }
  },
  server: {
    port: 5174,
    strictPort: true,
  },
});