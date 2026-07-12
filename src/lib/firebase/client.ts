import { getApp, getApps, initializeApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";

export const firebaseClientConfigured = Boolean(
  process.env.NEXT_PUBLIC_FIREBASE_API_KEY && process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
);

function getOrInitApp(): FirebaseApp | null {
  if (!firebaseClientConfigured) return null;
  return getApps().length
    ? getApp()
    : initializeApp({
        apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
        authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
        messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
        appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
      });
}

/** Auth-only accessor used by GuestSession — keeps Firestore/Storage out of the root layout path. */
export function getFirebaseAuth(): Auth | null {
  const app = getOrInitApp();
  return app ? getAuth(app) : null;
}

/** Full client for future Firestore/Storage persistence. Prefer getFirebaseAuth when only auth is needed. */
export async function getFirebaseClient() {
  const app = getOrInitApp();
  if (!app) return null;
  const [{ getFirestore }, { getStorage }] = await Promise.all([import("firebase/firestore"), import("firebase/storage")]);
  return { app, auth: getAuth(app), db: getFirestore(app), storage: getStorage(app) };
}
