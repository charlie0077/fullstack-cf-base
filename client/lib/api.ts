import { hc } from "hono/client";
import type { AppType } from "../../server/routes/api";

export const api = hc<AppType>("/api");
