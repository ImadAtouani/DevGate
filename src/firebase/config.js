import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD09TdnYsYxpl9L0b4JCZHOlPRsYoYTYWo",
  authDomain: "spd2-78862.firebaseapp.com",
  projectId: "spd2-78862",
  storageBucket: "spd2-78862.firebasestorage.app",
  messagingSenderId: "1099449615684",
  appId: "1:1099449615684:web:f5db36465d819ecbf68311"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { auth, db, storage };
