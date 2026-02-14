import { useState, useSyncExternalStore } from "react";
import {
  getToken,
  getCurrentUser,
  initializeAuth,
  removeToken,
} from "@/lib/auth";

// Simple store for auth state changes
let listeners: Array<() => void> = [];
const subscribe = (listener: () => void) => {
  listeners.push(listener);
  return () => {
    listeners = listeners.filter((l) => l !== listener);
  };
};
const notifyListeners = () => listeners.forEach((l) => l());

// Hook localStorage to notify on token changes
const originalSetItem = localStorage.setItem.bind(localStorage);
const originalRemoveItem = localStorage.removeItem.bind(localStorage);
localStorage.setItem = (key: string, value: string) => {
  originalSetItem(key, value);
  if (key === "auth_token") notifyListeners();
};
localStorage.removeItem = (key: string) => {
  originalRemoveItem(key);
  if (key === "auth_token") notifyListeners();
};

export function useAuth() {
  // initializeAuth is synchronous (checks localStorage + URL hash)
  const [isInitialized] = useState(() => {
    initializeAuth();
    return true;
  });

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
    isPending: !isInitialized,
    isAuthenticated: !!token,
    logout: () => {
      removeToken();
    },
  };
}
