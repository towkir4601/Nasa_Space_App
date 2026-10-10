import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCnv-hNTALMFDnefP2_irQ_0938ZWkHrBI",
  authDomain: "nasa-space-app-60e5d.firebaseapp.com",
  projectId: "nasa-space-app-60e5d",
  storageBucket: "nasa-space-app-60e5d.firebasestorage.app",
  messagingSenderId: "550315340168",
  appId: "1:550315340168:web:086b6aefaad18313c8ca3d",
  measurementId: "G-9D9EPGZM62"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);
