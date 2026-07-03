import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB4bxjV_RAmx2KbpqhbtjcqUeL-tZEli3g",
  authDomain: "academic-hub-hero.firebaseapp.com",
  projectId: "academic-hub-hero",
  storageBucket: "academic-hub-hero.firebasestorage.app",
  messagingSenderId: "776870084510",
  appId: "1:776870084510:web:09d1b184206392f92fa08f",
  measurementId: "G-ERN94L9979"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

export { app, db, auth, storage };
