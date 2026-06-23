// Vite ayarlari - React plugin'i ekliyoruz, gerisi varsayilan.
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5174,        // 5173'u baska proje kullaniyor, biz 5174'te calisiyoruz
    strictPort: true,  // 5174 doluysa baska porta kaymasin, hata versin (karisiklik olmasin)
  },
});
