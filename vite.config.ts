import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  root: "client",
  build: {
    outDir: "../dist",
    emptyOutDir: true,
  },
  server: {
    proxy: {
      "/api": "http://localhost:8787",
    },
  },
  optimizeDeps: {
    include: [
      "@trpc/client",
      "@trpc/react-query",
      "@tanstack/react-query",
      "superjson",
    ],
  },
});
