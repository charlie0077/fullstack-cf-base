import { Hono } from "hono";
import { serveStatic } from "hono/cloudflare-pages";
import { trpcServer } from "@hono/trpc-server";
import { appRouter } from "./trpc";

const app = new Hono<{ Bindings: CloudflareBindings }>();

app.use(
  "/api/trpc/*",
  trpcServer({
    router: appRouter,
    createContext: (_opts, c) => ({ env: c.env }),
  }),
);

app.get("/assets/*", serveStatic());

app.get("*", serveStatic({ path: "./index.html" }));

export default app;
