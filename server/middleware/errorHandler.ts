import type { Hono } from "hono";
import { fail } from "../util/response";
import logger from "../util/logger";

export const setupErrorHandler = (app: Hono) => {
  app.onError((err, c) => {
    const error = err as Error;
    logger.error("unhandled error", {
      requestId: c.get("requestId") || "unknown",
      error: error.message,
      stack: error.stack,
    });
    return fail(c, "INTERNAL_ERROR", "Internal Server Error", 500);
  });
};
