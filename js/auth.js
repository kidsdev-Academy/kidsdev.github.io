import { auth, db } from "./firebase.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const authArea = document.getElementById("authArea"); // The div containing Login/Signup
const mobileMenu = document.getElementById("mobileMenu");

onAuthStateChanged(auth, async (user) => {
  if (user) {
    // 1. USER IS LOGGED IN
    
    // Get user name from Database
    let username = "Cadet";
    try {
      const docSnap = await getDoc(doc(db, "users", user.uid));
      if (docSnap.exists()) {
        username = docSnap.data().name.split(" ")[0]; // Get first name
      }
    } catch(e) { console.log(e); }

    // Generate Avatar URL
    const avatar = `https://ui-avatars.com/api/?name=${username}&background=F97316&color=fff`;

    // REPLACE "Login/Signup" with "Profile Dropdown" in Desktop Header
    if (authArea) {
      authArea.innerHTML = `
        <div class="relative group">
           <button class="flex items-center gap-2 focus:outline-none">
             <img src="${avatar}" class="w-8 h-8 rounded-full border border-slate-200">
             <span class="text-sm font-bold text-[#0F172A] hidden lg:block">${username}</span>
             <i data-lucide="chevron-down" class="w-4 h-4 text-slate-400"></i>
           </button>
           <div class="absolute right-0 top-full mt-2 w-48 bg-white border border-slate-100 rounded-xl shadow-xl hidden group-hover:block transition-all z-50 overflow-hidden">
             <a href="profile.html" class="block px-4 py-3 text-sm text-slate-600 hover:bg-slate-50 hover:text-[#F97316] font-bold">My Profile</a>
             <button id="globalLogout" class="w-full text-left px-4 py-3 text-sm text-red-500 hover:bg-red-50 font-bold border-t border-slate-100">Log Out</button>
           </div>
        </div>
      `;
      
      // Re-initialize icons for the new HTML
      if(window.lucide) lucide.createIcons();
      
      // Attach Logout Listener
      document.getElementById("globalLogout")?.addEventListener("click", () => {
          signOut(auth).then(() => window.location.href = "index.html");
      });
    }

    // UPDATE Mobile Menu
    if (mobileMenu) {
        const loginBtns = mobileMenu.querySelector('.grid'); // The login/signup buttons container
        if(loginBtns) {
            loginBtns.innerHTML = `
                <a href="profile.html" class="col-span-2 text-center py-3 rounded-lg bg-[#0F172A] text-white font-bold flex items-center justify-center gap-2">
                    <img src="${avatar}" class="w-5 h-5 rounded-full"> My Profile
                </a>
            `;
        }
    }

  } else {
    // 2. USER IS LOGGED OUT (Do nothing, default HTML is correct)
  }
});