import { getApp, getApps, initializeApp } from "firebase/app";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

export function getFirebaseApp() {
  if (
    !firebaseConfig.apiKey ||
    !firebaseConfig.projectId ||
    !firebaseConfig.appId
  ) {
    throw new Error(
      "Firebase public configuration is incomplete. Copy .env.example to .env.local.",
    );
  }
  return getApps().length ? getApp() : initializeApp(firebaseConfig);
}

export async function getFirebaseAuth() {
  const { getAuth } = await import("firebase/auth");
  return getAuth(getFirebaseApp());
}

export async function getFirebaseDb() {
  const { getFirestore } = await import("firebase/firestore");
  return getFirestore(getFirebaseApp());
}

// Must match the region in functions/src/index.ts.
const FUNCTIONS_REGION = "us-central1";

export async function getFirebaseFunctions() {
  const { getFunctions } = await import("firebase/functions");
  return getFunctions(getFirebaseApp(), FUNCTIONS_REGION);
}

export async function getFirebaseAnalytics() {
  if (typeof window === "undefined" || !firebaseConfig.measurementId)
    return null;
  const { getAnalytics, isSupported } = await import("firebase/analytics");
  return (await isSupported()) ? getAnalytics(getFirebaseApp()) : null;
}
