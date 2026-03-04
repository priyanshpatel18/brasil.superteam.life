"use client";

import { useEffect } from "react";

export function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;

    if (process.env.NODE_ENV !== "production") {
      void navigator.serviceWorker.getRegistrations().then((registrations) => {
        void Promise.all(registrations.map((registration) => registration.unregister()));
      });
      if ("caches" in window) {
        void window.caches.keys().then((keys) => {
          void Promise.all(keys.map((key) => window.caches.delete(key)));
        });
      }
      return;
    }

    const register = async () => {
      try {
        await navigator.serviceWorker.register("/sw.js", { scope: "/" });
      } catch (err) {
        console.error("service worker registration failed", err);
      }
    };

    void register();
  }, []);

  return null;
}
