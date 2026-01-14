// 1. Import the functions you need from the SDKs (CDN for Browser)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// 2. Your Web App's Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyBLLonVra_uTjNycYeUahAMfJFcYKbBOKY",
  authDomain: "kidsdev1.firebaseapp.com",
  projectId: "kidsdev1",
  storageBucket: "kidsdev1.firebasestorage.app",
  messagingSenderId: "894180659757",
  appId: "1:894180659757:web:e87e27d144fb67aa529ea4",
  measurementId: "G-RS03NGLD1K"
};

// 3. Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// 4. Export for use in other files
export { auth, db, app };