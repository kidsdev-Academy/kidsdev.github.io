/* =========================================
   DASHBOARD SECURITY GUARD
   Path: js/guard.js
   Description: Redirects unauthenticated users to Login.
========================================== */

import { auth } from "./firebase.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

onAuthStateChanged(auth, (user) => {
  if (!user) {
    // 1. NO User found -> Kick to Login Page
    console.log("Access Denied: No user logged in.");
    // Save the current URL so we can redirect back after login (optional future enhancement)
    sessionStorage.setItem("redirectAfterLogin", window.location.href);
    window.location.href = "login.html";
  } else {
    // 2. User FOUND -> Reveal the Dashboard
    // This removes the 'opacity-0' class from the body to show the page smoothly
    console.log("Access Granted for:", user.email);
    document.body.classList.remove("opacity-0");
  }
});