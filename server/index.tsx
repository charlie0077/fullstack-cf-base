import { Hono } from "hono";
import { cors } from "hono/cors";
import { serveStatic } from "hono/cloudflare-pages";
import { trpcServer } from "@hono/trpc-server";
import { appRouter } from "./trpc";
import { dbMiddleware } from "./db";
import { ok } from "./util/response";
import { requestId } from "./middleware/requestId";
import { requestLogger } from "./middleware/requestLogger";
import { setupErrorHandler } from "./middleware/errorHandler";
import { isDev } from "./config";

const app = new Hono<{ Bindings: CloudflareBindings }>();

// Middleware stack (order matters)
setupErrorHandler(app);
app.use(requestId);
app.use(requestLogger);

if (isDev) {
  app.use("/api/*", cors({ origin: "http://localhost:5173" }));
}

app.use("/api/*", dbMiddleware);

app.use(
  "/api/trpc/*",
  trpcServer({
    router: appRouter,
    createContext: (_opts, c) => ({ env: c.env }),
  }),
);

// Example: non-tRPC REST route with consistent response format
app.get("/api/health", (c) => {
  return ok(c, { status: "ok", timestamp: Date.now() });
});

app.get("/assets/*", serveStatic());

app.get("*", serveStatic({ path: "./index.html" }));

export default app;
