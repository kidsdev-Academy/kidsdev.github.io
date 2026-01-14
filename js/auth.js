/* =========================================
   GLOBAL AUTHENTICATION HANDLER
   Path: js/auth.js
   Description: Manages Header buttons (Login vs Dashboard) and Logout.
========================================== */

import { auth } from "./firebase.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

const authArea = document.getElementById("authArea");

// 1. Listen for Login State Changes
if (authArea) {
  onAuthStateChanged(auth, (user) => {
    if (user) {
      // User is LOGGED IN: Show Dashboard Button
      // We use the Orange (#F97316) color for the text/icon to match your theme
      authArea.innerHTML = `
        <a href="dashboard.html" class="flex items-center gap-2 text-sm font-bold text-[#F97316] hover:text-orange-700 transition">
           <i data-lucide="user" class="w-4 h-4"></i> Dashboard
        </a>
      `;
      
      // Re-render icons since we injected new HTML
      if (window.lucide) lucide.createIcons();
      
    } else {
      // User is LOGGED OUT: The default HTML (Login/Signup buttons) stays.
      // If you needed to force reset it, you would do it here, but usually unnecessary.
    }
  });
}

// 2. Global Logout Function
// You can call this function from anywhere using onclick="logout()"
window.logout = async () => {
  try {
    await signOut(auth);
    console.log("User signed out.");
    window.location.href = "index.html";
  } catch (error) {
    console.error("Logout Error:", error);
  }
};
// Example Simulation inside login.html script
function handleLogin() {
   // ... verify inputs ...
   localStorage.setItem("user", JSON.stringify({ name: "Student", loggedIn: true }));
   window.location.href = "index.html";
}