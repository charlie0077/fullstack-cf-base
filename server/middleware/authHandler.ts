import { Hono } from "hono";
import { getAuth, generateJWT, getJwtSecret } from "../lib/auth";

export const authHandler = new Hono<{ Bindings: CloudflareBindings }>();

// Get JWT from session (for token refresh / OAuth flows)
authHandler.get("/token", async (c) => {
  const auth = getAuth(c);
  const secret = getJwtSecret(c);
  const session = await auth.api.getSession({ headers: c.req.raw.headers });

  if (!session?.user) {
    return c.json({ error: "Not authenticated" }, 401);
  }

  const jwtToken = await generateJWT(
    {
      userId: session.user.id,
      email: session.user.email,
      name: session.user.name,
    },
    secret,
  );

  return c.json({ token: jwtToken });
});

// Catch-all: proxy to better-auth handler
authHandler.on(["GET", "POST"], "/*", async (c) => {
  const auth = getAuth(c);
  const secret = getJwtSecret(c);
  const response = await auth.handler(c.req.raw);
  const url = new URL(c.req.url);

  // OAuth callback: better-auth sets a session cookie on redirect.
  // The client exchanges that cookie for a JWT via GET /api/auth/token.

  // Email/password sign-in/sign-up — add JWT to response header
  const isAuthEndpoint =
    url.pathname.includes("/sign-in") || url.pathname.includes("/sign-up");
  if (isAuthEndpoint && response.ok) {
    const clonedResponse = response.clone();
    const data = (await clonedResponse.json()) as {
      user?: { id: string; email: string; name: string };
    };

    if (data.user) {
      const jwtToken = await generateJWT(
        {
          userId: data.user.id,
          email: data.user.email,
          name: data.user.name,
        },
        secret,
      );

      const newResponse = new Response(JSON.stringify(data), {
        status: response.status,
        statusText: response.statusText,
        headers: new Headers(response.headers),
      });

      newResponse.headers.set("set-auth-token", jwtToken);
      return newResponse;
    }
  }

  return response;
});
