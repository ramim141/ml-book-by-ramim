import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

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

// Firebase Storage এই প্রজেক্টে প্রভিশন করা নেই — ছবি আপলোড ImgBB দিয়ে হয়
// (src/lib/imageUpload.js), তাই getStorage আর এক্সপোর্ট করা হয় না।
export { app, db, auth };
