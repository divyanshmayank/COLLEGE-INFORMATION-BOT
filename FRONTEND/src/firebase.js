import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyA5IgayKeOP_e8BVXHKZcmw6tm3VDlBAoQ",
  authDomain: "college-information-bot-faa4f.firebaseapp.com",
  projectId: "college-information-bot-faa4f",
  storageBucket: "college-information-bot-faa4f.firebasestorage.app",
  messagingSenderId: "1092909777230",
  appId: "1:1092909777230:web:d67bf27d5419ffdd3e9e1f",
  measurementId: "G-6XF753DJYH"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);

export default app;