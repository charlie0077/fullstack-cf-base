import { Hono } from "hono";
import { serveStatic } from "hono/cloudflare-pages";
import api from "./routes/api";

const app = new Hono<{ Bindings: CloudflareBindings }>();

app.route("/api", api);

app.get("/assets/*", serveStatic());

app.get("*", serveStatic({ path: "./index.html" }));

export default app;
