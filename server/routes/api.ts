import { Hono } from "hono";

const api = new Hono<{ Bindings: CloudflareBindings }>()
  .get("/hello", (c) => {
    return c.json({ message: "Hello from Hono API!", timestamp: Date.now() });
  });

export type AppType = typeof api;

export default api;
