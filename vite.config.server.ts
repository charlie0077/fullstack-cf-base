import build from "@hono/vite-build/cloudflare-pages";
import devServer from "@hono/vite-dev-server";
import adapter from "@hono/vite-dev-server/cloudflare";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [
    // Client build populates dist/ first — don't clear it
    build({ entry: "server/index.tsx", emptyOutDir: false }),
    devServer({
      adapter,
      entry: "server/index.tsx",
    }),
  ],
  server: {
    port: 8787,
  },
});
