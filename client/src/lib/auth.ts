import { createAuthClient } from "better-auth/react";

const TOKEN_KEY = "auth_token";
const API_URL = import.meta.env.VITE_API_URL || "";

// Token management
export const getToken = () => localStorage.getItem(TOKEN_KEY) || undefined;

export const setToken = (token: string) => {
  localStorage.setItem(TOKEN_KEY, token);
};

export const removeToken = () => {
  localStorage.removeItem(TOKEN_KEY);
};

// Check URL hash for JWT token (after OAuth redirect)
export const extractTokenFromUrl = (): string | null => {
  const hash = window.location.hash;
  if (hash.startsWith("#token=")) {
    const token = hash.slice(7);
    window.history.replaceState(
      null,
      "",
      window.location.pathname + window.location.search,
    );
    return token;
  }
  return null;
};

// Initialize auth — call on app startup
export const initializeAuth = (): boolean => {
  const urlToken = extractTokenFromUrl();
  if (urlToken) {
    setToken(urlToken);
    return true;
  }
  return !!getToken();
};

// Parse JWT to get user info (client-side only — server verifies)
export const parseToken = (
  token: string,
): { userId: string; email: string; name: string } | null => {
  try {
    const payload = token.split(".")[1];
    const decoded = JSON.parse(atob(payload));
    return {
      userId: decoded.userId,
      email: decoded.email,
      name: decoded.name,
    };
  } catch {
    return null;
  }
};

export const getCurrentUser = () => {
  const token = getToken();
  if (!token) return null;
  return parseToken(token);
};

// better-auth client (used for OAuth redirect initiation and email/password)
export const authClient = createAuthClient({
  baseURL: API_URL || window.location.origin,
  basePath: "/api/auth",
  fetchOptions: {
    auth: {
      type: "Bearer",
      token: getToken,
    },
  },
});

// Sign in
export const signIn = {
  email: async (credentials: { email: string; password: string }) => {
    const result = await authClient.signIn.email(credentials, {
      onSuccess: (ctx) => {
        const token = ctx.response.headers.get("set-auth-token");
        if (token) setToken(token);
      },
    });
    return result;
  },
  social: async (provider: "github" | "google") => {
    const callbackURL = window.location.origin;
    await authClient.signIn.social({ provider, callbackURL });
  },
};

// Sign up
export const signUp = {
  email: async (credentials: {
    name: string;
    email: string;
    password: string;
  }) => {
    const result = await authClient.signUp.email(credentials, {
      onSuccess: (ctx) => {
        const token = ctx.response.headers.get("set-auth-token");
        if (token) setToken(token);
      },
    });
    return result;
  },
};

// Sign out
export const signOut = async () => {
  removeToken();
  try {
    await authClient.signOut();
  } catch {
    // Token already cleared locally
  }
};
