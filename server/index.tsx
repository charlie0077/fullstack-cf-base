import { Hono } from "hono";
import { cors } from "hono/cors";
import { serveStatic } from "hono/cloudflare-workers";
import { trpcServer } from "@hono/trpc-server";
import { appRouter } from "./trpc";
import { dbMiddleware } from "./db";
import { ok } from "./util/response";
import { requestId } from "./middleware/requestId";
import { requestLogger } from "./middleware/requestLogger";
import { setupErrorHandler } from "./middleware/errorHandler";
import { authHandler } from "./middleware/authHandler";
import { jwtAuth } from "./middleware/jwtAuth";
import { isDev } from "./config";

const app = new Hono<{ Bindings: CloudflareBindings }>();

// Middleware stack (order matters)
setupErrorHandler(app);
app.use(requestId);
app.use(requestLogger);

if (isDev) {
  app.use(
    "/api/*",
    cors({
      origin: (origin) => (origin.startsWith("http://localhost:") ? origin : ""),
      exposeHeaders: ["set-auth-token"],
    }),
  );
}

app.use("/api/*", dbMiddleware);

// Auth routes (before JWT middleware — auth endpoints issue tokens)
app.route("/api/auth", authHandler);

// JWT middleware (non-blocking — sets user or null)
app.use("/api/*", jwtAuth);

app.use(
  "/api/trpc/*",
  trpcServer({
    router: appRouter,
    createContext: (_opts, c) => ({
      env: c.env,
      user: c.get("user"),
    }),
  }),
);

// Example: non-tRPC REST route with consistent response format
app.get("/api/health", (c) => {
  return ok(c, { status: "ok", timestamp: Date.now() });
});


app.get("/assets/*", serveStatic());

app.get("*", serveStatic({ path: "./index.html" }));

export default app;
