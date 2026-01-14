/* =========================================
   FIREBASE CONFIGURATION
   Project: KidsDev1
========================================== */

// Import from CDN for direct browser usage
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-analytics.js";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBLLonVra_uTjNycYeUahAMfJFcYKbBOKY",
  authDomain: "kidsdev1.firebaseapp.com",
  projectId: "kidsdev1",
  storageBucket: "kidsdev1.firebasestorage.app",
  messagingSenderId: "894180659757",
  appId: "1:894180659757:web:e87e27d144fb67aa529ea4",
  measurementId: "G-RS03NGLD1K"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Services
const auth = getAuth(app);       // Authentication
const db = getFirestore(app);    // Database
const analytics = getAnalytics(app); // Analytics

// Export for use in other files
export { auth, db, analytics };