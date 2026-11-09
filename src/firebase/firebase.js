import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAK7qy4Go3s1UmU3rJhizXcAQbIDGxZ9bA",
  authDomain: "pulsegrid-e39a6.firebaseapp.com",
  projectId: "pulsegrid-e39a6",
  storageBucket: "pulsegrid-e39a6.firebasestorage.app",
  messagingSenderId: "857170738801",
  appId: "1:857170738801:web:67184ea6ea2f893a6165d0",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);