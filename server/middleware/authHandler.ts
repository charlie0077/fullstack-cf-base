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

  // OAuth callback — inject JWT into redirect URL
  const isOAuthCallback = url.pathname.includes("/callback/");
  if (isOAuthCallback && response.status >= 300 && response.status < 400) {
    const location = response.headers.get("location");
    if (location) {
      const session = await auth.api.getSession({
        headers: c.req.raw.headers,
      });

      if (session?.user) {
        const jwtToken = await generateJWT(
          {
            userId: session.user.id,
            email: session.user.email,
            name: session.user.name,
          },
          secret,
        );

        const redirectUrl = new URL(location);
        redirectUrl.hash = `token=${jwtToken}`;

        const newResponse = new Response(null, {
          status: response.status,
          headers: new Headers(response.headers),
        });
        newResponse.headers.set("location", redirectUrl.toString());
        return newResponse;
      }
    }
  }

  // Email/password sign-in/sign-up — add JWT to response header
  const isAuthEndpoint =
    url.pathname.includes("/sign-in") || url.pathname.includes("/sign-up");
  if (isAuthEndpoint && response.ok) {
    const clonedResponse = response.clone();
    const data = await clonedResponse.json();

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
