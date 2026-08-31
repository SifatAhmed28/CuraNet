import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  signOut,
} from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCxsHyw6YwNGZ0mi2HF8kX9KYxs08g-cH0",
  authDomain: "curanet-a36d6.firebaseapp.com",
  projectId: "curanet-a36d6",
  storageBucket: "curanet-a36d6.firebasestorage.app",
  messagingSenderId: "704696197812",
  appId: "1:704696197812:web:cb0161da4b39450ff5ede1",
  measurementId: "G-LJX0YGQK0S",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export {
  app,
  auth,
  googleProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  signOut,
};
