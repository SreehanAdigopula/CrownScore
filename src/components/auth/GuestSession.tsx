"use client";

import { useEffect } from "react";
import { GUEST_ID_KEY } from "@/lib/crownscore-client";
import { firebaseClientConfigured } from "@/lib/firebase/client";

export function GuestSession() {
  useEffect(() => {
    if (!firebaseClientConfigured) {
      if (!localStorage.getItem(GUEST_ID_KEY)) localStorage.setItem(GUEST_ID_KEY, crypto.randomUUID());
      return;
    }

    let unsubscribe: (() => void) | undefined;
    let cancelled = false;

    void (async () => {
      try {
        const { getFirebaseAuth } = await import("@/lib/firebase/client");
        const { onAuthStateChanged, signInAnonymously } = await import("firebase/auth");
        if (cancelled) return;
        const auth = getFirebaseAuth();
        if (!auth) {
          if (!localStorage.getItem(GUEST_ID_KEY)) localStorage.setItem(GUEST_ID_KEY, crypto.randomUUID());
          return;
        }
        unsubscribe = onAuthStateChanged(auth, (user) => {
          if (!user) {
            void signInAnonymously(auth).catch(() => {
              if (!localStorage.getItem(GUEST_ID_KEY)) localStorage.setItem(GUEST_ID_KEY, crypto.randomUUID());
            });
          }
        });
      } catch {
        if (!localStorage.getItem(GUEST_ID_KEY)) localStorage.setItem(GUEST_ID_KEY, crypto.randomUUID());
      }
    })();

    return () => {
      cancelled = true;
      unsubscribe?.();
    };
  }, []);

  return null;
}
