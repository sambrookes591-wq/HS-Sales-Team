// Correct Firebase 10.x imports
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// Your Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyDOMfHc7LAXfddxDB6k8rOFMRO5ViMjuq0",
  authDomain: "home-sales-board.firebaseapp.com",
  projectId: "home-sales-board",
  storageBucket: "home-sales-board.appspot.com",
  messagingSenderId: "743161573262",
  appId: "1:743161573262:web:f46f78a533e9c0047e7edf"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

console.log("🔥 Firebase + Firestore Loaded Successfully");