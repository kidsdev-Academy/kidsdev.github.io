import { auth, db } from "./firebase.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const authArea = document.getElementById("authArea"); 
const mobileMenu = document.getElementById("mobileMenu");

// Listen for Auth Changes
onAuthStateChanged(auth, async (user) => {
  if (user) {
    // === USER IS LOGGED IN ===
    console.log("Logged in as:", user.email);

    // 1. Get User Name
    let username = "Cadet";
    try {
      const docSnap = await getDoc(doc(db, "users", user.uid));
      if (docSnap.exists()) {
        username = docSnap.data().name.split(" ")[0]; 
      }
    } catch(e) { console.error("Error fetching name:", e); }

    // 2. Avatar
    const avatar = `https://ui-avatars.com/api/?name=${username}&background=F97316&color=fff`;

    // 3. Update Desktop Header (Using Absolute Path /profile.html)
    if (authArea) {
      authArea.innerHTML = `
        <div class="relative group z-50">
           <button class="flex items-center gap-2 focus:outline-none py-2">
             <img src="${avatar}" class="w-9 h-9 rounded-full border border-slate-200">
             <span class="text-sm font-bold text-[#0F172A] hidden lg:block">${username}</span>
             <i data-lucide="chevron-down" class="w-4 h-4 text-slate-400 transition-transform group-hover:rotate-180"></i>
           </button>
           
           <div class="absolute right-0 top-full mt-1 w-48 bg-white border border-slate-100 rounded-xl shadow-xl hidden group-hover:block overflow-hidden animation-fade-in">
             <a href="/profile.html" class="block px-4 py-3 text-sm text-slate-600 hover:bg-slate-50 hover:text-[#F97316] font-bold border-b border-slate-50">
                <i data-lucide="user" class="w-4 h-4 inline mr-2"></i> My Profile
             </a>
             <button id="globalLogout" class="w-full text-left px-4 py-3 text-sm text-red-500 hover:bg-red-50 font-bold flex items-center">
                <i data-lucide="log-out" class="w-4 h-4 mr-2"></i> Log Out
             </button>
           </div>
        </div>
      `;
      
      if(window.lucide) lucide.createIcons();
      document.getElementById("globalLogout")?.addEventListener("click", handleLogout);
    }

    // 4. Update Mobile Menu (Using Absolute Path)
    if (mobileMenu) {
        const bottomSection = mobileMenu.lastElementChild; 
        if(bottomSection && bottomSection.classList.contains('grid')) {
            bottomSection.innerHTML = `
                <a href="/profile.html" class="col-span-2 text-center py-3 rounded-lg bg-[#0F172A] text-white font-bold flex items-center justify-center gap-2 shadow-lg">
                    <img src="${avatar}" class="w-5 h-5 rounded-full"> ${username}'s Profile
                </a>
            `;
        }
    }

  } else {
    // === USER IS LOGGED OUT ===
    // Ensure default buttons point to absolute paths too, just in case
    if (authArea && authArea.innerHTML.includes('login.html')) {
        authArea.innerHTML = `
           <a href="/login.html" class="text-sm font-bold hover:text-black">Log In</a>
           <a href="/register.html" class="bg-[#F97316] hover:bg-orange-600 text-white px-5 py-2 rounded-full text-sm font-bold shadow-md transition">Sign Up</a>
        `;
    }
  }
});

// 3. Logout Function (Redirects to Root /)
const handleLogout = async () => {
    try {
        await signOut(auth);
        window.location.href = "/"; // Redirects to Homepage
    } catch (error) {
        console.error("Logout failed", error);
    }
};