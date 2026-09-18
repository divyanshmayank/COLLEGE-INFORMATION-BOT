import { initializeApp } from "firebase/app";
import {
  getAuth,
  connectAuthEmulator
} from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBsZRGPkW5Efotn8KN5x3Z4bwJViHT51Cg",
  authDomain: "college-information-bot.firebaseapp.com",
  projectId: "college-information-bot",
  storageBucket: "college-information-bot.firebasestorage.app",
  messagingSenderId: "241115150612",
  appId: "1:241115150612:web:f1e5aaa2c025a06f4c6a01"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);

if (window.location.hostname === "localhost") {
  connectAuthEmulator(auth, "http://127.0.0.1:9099", {
    disableWarnings: true
  });
}

export default app;