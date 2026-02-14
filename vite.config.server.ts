import build from "@hono/vite-build/cloudflare-workers";
import devServer from "@hono/vite-dev-server";
import { defineConfig, loadEnv } from "vite";

/** Only these env vars are injected into the dev server bundle via `define`. */
const SERVER_ENV_KEYS = [
  "DATABASE_URL",
  "BETTER_AUTH_SECRET",
  "BETTER_AUTH_URL",
  "GITHUB_CLIENT_ID",
  "GITHUB_CLIENT_SECRET",
  "GOOGLE_CLIENT_ID",
  "GOOGLE_CLIENT_SECRET",
  "CLIENT_URL",
];

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
      ? Object.fromEntries(
          SERVER_ENV_KEYS.filter((k) => k in env).map((k) => [
            `process.env.${k}`,
            JSON.stringify(env[k]),
          ]),
        )
      : undefined,
    ssr: {
      resolve: {
        // Ensure pg-cloudflare resolves to the real CloudflareSocket implementation
        // (not the empty default export) when bundling for Cloudflare Workers
        conditions: ["workerd"],
      },
    },
    build: {
      rollupOptions: {
        // cloudflare:sockets is provided by the Workers runtime at deploy time
        external: ["cloudflare:sockets"],
      },
    },
    server: {
      port: 8787,
    },
  };
});
