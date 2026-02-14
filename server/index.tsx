import { Hono } from "hono";
import { serveStatic } from "hono/cloudflare-pages";
import { trpcServer } from "@hono/trpc-server";
import { appRouter } from "./trpc";
import { ok } from "./util/response";
import { requestId } from "./middleware/requestId";
import { requestLogger } from "./middleware/requestLogger";
import { setupErrorHandler } from "./middleware/errorHandler";

const app = new Hono<{ Bindings: CloudflareBindings }>();

// Middleware stack (order matters)
setupErrorHandler(app);
app.use(requestId);
app.use(requestLogger);

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
