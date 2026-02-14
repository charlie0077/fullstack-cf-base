import build from "@hono/vite-build/cloudflare-pages";
import devServer from "@hono/vite-dev-server";
import { defineConfig, loadEnv } from "vite";

export default defineConfig(({ mode }) => {
  const isDev = mode === "development";
  const env = isDev ? loadEnv(mode, process.cwd(), "") : {};

  return {
    plugins: [
      build({ entry: "server/index.tsx", emptyOutDir: false }),
      devServer({
        // Node.js in dev; production build targets Cloudflare Pages
        entry: "server/index.tsx",
      }),
    ],
    define: isDev
      ? { "process.env.DATABASE_URL": JSON.stringify(env.DATABASE_URL) }
      : undefined,
    server: {
      port: 8787,
    },
  };
});
