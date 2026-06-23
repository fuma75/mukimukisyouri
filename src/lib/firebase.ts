// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDZxyXt6MiGPCYK-A0u-S1IHaSKHkbMuzo",
  authDomain: "mukimukisyouri.firebaseapp.com",
  projectId: "mukimukisyouri",
  storageBucket: "mukimukisyouri.firebasestorage.app",
  messagingSenderId: "1017683652159",
  appId: "1:1017683652159:web:e6680d61b3214a201b528a",
  measurementId: "G-4HBRPZHYD4"
};

// Initialize Firebase (avoid duplicate initialization in Next.js)
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);

export { app, auth };
