import { useEffect, useState, useSyncExternalStore } from "react";
import {
  AUTH_TOKEN_CHANGE_EVENT,
  getToken,
  getCurrentUser,
  initializeAuth,
  exchangeSessionForToken,
  removeToken,
} from "@/lib/auth";

const OAUTH_PENDING_KEY = "oauth_pending";

// Subscribe to auth token changes via custom event (fired by setToken/removeToken)
const subscribe = (listener: () => void) => {
  window.addEventListener(AUTH_TOKEN_CHANGE_EVENT, listener);
  return () => window.removeEventListener(AUTH_TOKEN_CHANGE_EVENT, listener);
};

export function useAuth() {
  const [isExchanging, setIsExchanging] = useState(false);

  // initializeAuth is synchronous (checks localStorage + URL hash)
  const [hasToken] = useState(() => initializeAuth());

  // After OAuth redirect, exchange session cookie for JWT
  useEffect(() => {
    if (hasToken) return;
    if (!sessionStorage.getItem(OAUTH_PENDING_KEY)) return;
    sessionStorage.removeItem(OAUTH_PENDING_KEY);
    setIsExchanging(true);
    exchangeSessionForToken().finally(() => setIsExchanging(false));
  }, [hasToken]);

  const token = useSyncExternalStore(
    subscribe,
    () => getToken() ?? null,
    () => null,
  );

  const user = token ? getCurrentUser() : null;

  const session = user
    ? {
        user: {
          id: user.userId,
          email: user.email,
          name: user.name,
        },
      }
    : null;

  return {
    session,
    user,
    isPending: isExchanging,
    isAuthenticated: !!token,
    logout: () => {
      removeToken();
    },
  };
}
