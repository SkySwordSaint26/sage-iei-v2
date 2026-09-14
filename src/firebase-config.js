import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCusasGtwT4wTWFPDTZGu_3lNLCCAyhKxQ",
  authDomain: "sage-iei.firebaseapp.com",
  projectId: "sage-iei",
  storageBucket: "sage-iei.firebasestorage.app",
  messagingSenderId: "17273896625",
  appId: "1:17273896625:web:e8c342b8daefded776ec90"
};
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db, firebaseConfig };

