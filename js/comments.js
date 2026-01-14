/* =========================================
   FIREBASE COMMENTS SYSTEM
   - Connects to your "kidsdev1" project
   - Handles Realtime Database interactions
========================================== */

// 1. Import Firebase from Google CDN (Browser compatible)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, push, onChildAdded } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-analytics.js";

// 2. YOUR SPECIFIC CONFIGURATION
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
const analytics = getAnalytics(app); // Analytics initialized
const db = getDatabase(app); // Realtime Database initialized

// 4. Determine Challenge ID (from URL)
const path = window.location.pathname;
// Gets filename like "emoji-picker" or defaults to "general"
const pageId = path.split("/").pop().replace(".html", "") || "general-discussion";
const commentsRef = ref(db, 'comments/' + pageId);

// 5. DOM Elements
const list = document.getElementById('comments-list');
const form = document.getElementById('comment-form');
const nameInput = document.getElementById('comment-name');
const msgInput = document.getElementById('comment-msg');

// 6. LISTEN FOR NEW COMMENTS (Real-time)
// This runs whenever a new comment is added to the database
onChildAdded(commentsRef, (data) => {
  addCommentToDOM(data.val());
  // Remove "Be the first to comment" text if it exists
  const emptyText = document.getElementById('empty-msg');
  if(emptyText) emptyText.remove();
});

// 7. SEND COMMENT
if(form) {
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const name = nameInput.value.trim();
        const msg = msgInput.value.trim();

        if(!name || !msg) return;

        // Push to Firebase Database
        push(commentsRef, {
            name: name,
            message: msg,
            date: Date.now()
        });

        // Clear input fields
        msgInput.value = "";
    });
}

// 8. RENDER COMMENT (UI)
function addCommentToDOM(data) {
    if(!list) return;

    const div = document.createElement('div');
    div.className = "flex gap-4 p-4 bg-slate-50 border border-slate-100 rounded-2xl animate-fade-in mb-3";
    
    // Generate simple avatar color based on name length
    const colors = ['bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-orange-500'];
    const color = colors[data.name.length % colors.length];
    const initial = data.name.charAt(0).toUpperCase();

    // Time Formatting
    const date = new Date(data.date).toLocaleDateString();

    div.innerHTML = `
        <div class="w-10 h-10 ${color} rounded-full flex items-center justify-center text-white font-bold shrink-0 shadow-sm">
            ${initial}
        </div>
        <div class="flex-1">
            <div class="flex justify-between items-center mb-1">
                <h4 class="font-bold text-[#0F172A] text-sm">${data.name}</h4>
                <span class="text-xs text-slate-400">${date}</span>
            </div>
            <p class="text-slate-600 text-sm leading-relaxed">${data.message}</p>
        </div>
    `;

    // Add new comment to the TOP of the list
    list.insertBefore(div, list.firstChild);
}