/* ================= CONFIG ================= */
const CONFIG = {
  animationThreshold: 0.15,
  animationDelayBase: 150
};

/* ================= UTILS ================= */
// Helper to handle paths when inside sub-folders
const isSubPage = window.location.pathname.includes("/courses/") || window.location.pathname.includes("/posts/");

const getPath = (path) => {
  if (!path || path.startsWith("http") || path === "#") return path;
  return isSubPage ? `../${path}` : path;
};

const getDataPath = () => {
  return isSubPage ? "../data/posts.json" : "data/posts.json";
};

/* ================= STATE ================= */
let allData = [];

/* ================= UI CONTROLLER ================= */
const UI = {
  async init() {
    this.cacheElements();
    await this.loadData();
    
    // 1. RENDER LOGIC
    this.renderIcons();
    
    // Render Posts (for Home/Daily pages)
    const posts = allData.filter(item => item.type === "post");
    this.renderPosts(posts);

    // Render Courses (for Home/Courses pages)
    const courses = allData.filter(item => item.type === "course");
    this.renderCourses(courses);

    // Render Challenges (for Challenges page)
    const challenges = allData.filter(item => item.type === "challenge");
    this.renderChallenges(challenges);
    
    // 2. SETUP INTERACTIVE ELEMENTS
    this.setupMobileMenu();
    this.setupScrollReveal();
    this.setActiveLink();
    this.setupGlobalSearch(); // Init the Spotlight Search
    
    // 3. EXPOSE GLOBAL FUNCTIONS (For Contact/Submission Forms)
    window.handleFormSubmit = this.handleFormSubmit;
    window.resetForm = this.resetForm;
    window.copyEmail = this.copyEmail;
    window.UI = this; 
  },

  cacheElements() {
    this.postsContainer = document.getElementById("posts-container");
    this.coursesContainer = document.getElementById("courses-container");
    this.menuBtn = document.getElementById("menuBtn");
    this.mobileMenu = document.getElementById("mobileMenu");
    this.navLinks = document.querySelectorAll(".nav-link");
    this.searchBtn = document.getElementById('openSearchBtn'); 
    this.gridTitle = document.getElementById("grid-title");
  },

  async loadData() {
    try {
      const response = await fetch(getDataPath());
      if (!response.ok) throw new Error("Could not load data");
      allData = await response.json(); 
    } catch (error) {
      console.error("Error loading data:", error);
    }
  },

  /* --- RENDER FUNCTIONS --- */

  renderPosts(posts) {
    if (!this.postsContainer) return;
    const isHomePage = !window.location.pathname.includes("daily");
    const displayPosts = isHomePage ? posts.slice(0, 3) : posts;

    if (displayPosts.length === 0) {
      this.postsContainer.innerHTML = `<div class="col-span-full text-center text-gray-500">No posts found.</div>`;
      return;
    }

    this.postsContainer.innerHTML = displayPosts.map((post, index) => {
        const delay = index * 100;
        const safeUrl = getPath(post.url);
        return `
          <article class="card reveal-up" style="transition-delay:${delay}ms">
            <div class="h-48 overflow-hidden relative group">
              <img src="${post.image}" alt="${post.title}" class="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500">
              <div class="absolute top-4 left-4 bg-black/70 backdrop-blur-sm px-3 py-1 rounded text-xs font-bold uppercase tracking-wider ${post.colorClass}">${post.category}</div>
            </div>
            <div class="p-6 flex flex-col flex-1">
              <h3 class="text-xl font-bold mb-3 text-white">${post.title}</h3>
              <p class="text-gray-400 text-sm mb-4 flex-1">${post.desc}</p>
              <a href="${safeUrl}" class="inline-flex items-center text-sm font-semibold text-[#FFE66D] hover:text-white transition">Read More <i data-lucide="arrow-right" class="w-4 h-4 ml-2"></i></a>
            </div>
          </article>
        `;
      }).join("");
    
    this.renderIcons();
    setTimeout(() => { document.querySelectorAll(".reveal-up").forEach(el => el.classList.add('active')); }, 100);
  },

  renderCourses(courses) {
    if (!this.coursesContainer) return;
    const isHomePage = !window.location.pathname.includes("courses");
    const displayCourses = isHomePage ? courses.slice(0, 3) : courses;

    this.coursesContainer.innerHTML = displayCourses.map((course, index) => {
        const delay = index * 150;
        const safeUrl = getPath(course.url);
        let statusColor = course.status === "New" ? "text-[#4CC9F0] bg-[#4CC9F0]/10" : (course.status === "Coming Soon" ? "text-gray-300 bg-gray-700" : "text-[#FFE66D] bg-[#FFE66D]/10");
        let iconName = course.category.includes("Game") ? "gamepad-2" : (course.category.includes("Programming") ? "terminal" : "layout");

        return `
          <a href="${safeUrl}" class="card group relative block overflow-hidden reveal-up" style="transition-delay:${delay}ms">
            <div class="h-48 bg-gradient-to-br from-gray-800 to-slate-900 flex items-center justify-center">
              <i data-lucide="${iconName}" class="w-16 h-16 ${course.colorClass} group-hover:scale-110 transition-transform duration-300"></i>
            </div>
            <div class="p-8">
              <div class="flex justify-between items-start mb-4">
                <h3 class="text-xl font-bold text-white group-hover:text-[#FFE66D] transition-colors">${course.title}</h3>
                <span class="${statusColor} text-xs font-bold px-2 py-1 rounded">${course.status}</span>
              </div>
              <p class="text-gray-400 text-sm mb-6">${course.desc}</p>
              <div class="flex items-center text-sm text-gray-500 gap-4">
                <span class="flex items-center gap-1"><i data-lucide="clock" class="w-4 h-4"></i> ${course.duration}</span>
                <span class="flex items-center gap-1"><i data-lucide="bar-chart" class="w-4 h-4"></i> ${course.level}</span>
              </div>
            </div>
          </a>
        `;
    }).join("");
    this.renderIcons();
    setTimeout(() => { document.querySelectorAll(".reveal-up").forEach(el => el.classList.add('active')); }, 100);
  },

  renderChallenges(challenges) {
    // Only run this if we are on the challenges.html page
    const activeContainer = document.getElementById("active-challenge-container");
    const pastContainer = document.getElementById("past-challenges-grid");
    
    if (!activeContainer) return;

    // 1. Separate Active vs Past
    const activeChallenge = challenges.find(c => c.status === "active");
    const pastChallenges = challenges.filter(c => c.status !== "active");

    // 2. Render Active Challenge
    if (activeChallenge) {
      activeContainer.innerHTML = `
        <div class="grid md:grid-cols-2 h-full">
          <div class="p-8 md:p-12 flex flex-col justify-center">
            <h2 class="text-2xl font-bold text-white mb-2">🔥 This Week's Challenge:</h2>
            <h3 class="text-3xl font-extrabold text-[#A66CFF] mb-6">${activeChallenge.title}</h3>
            <p class="text-gray-400 mb-6">
              <strong class="text-white">Goal:</strong> ${activeChallenge.desc}<br><br>
              <strong class="text-white">Tech Stack:</strong> ${activeChallenge.tech}<br>
              <strong class="text-white">Difficulty:</strong> ${activeChallenge.difficulty}
            </p>
            <div class="flex flex-wrap gap-4 text-sm text-gray-500 mb-8">
              <span class="flex items-center gap-1"><i data-lucide="calendar" class="w-4 h-4"></i> Deadline: ${activeChallenge.deadline}</span>
            </div>
            <a href="#submit-form" class="btn btn-primary bg-[#A66CFF] hover:bg-[#9254ff] border-none shadow-none w-max">
              Submit Solution <i data-lucide="arrow-down" class="ml-2 w-4 h-4"></i>
            </a>
          </div>
          <div class="relative h-64 md:h-auto bg-[#0b1021] flex items-center justify-center border-t md:border-t-0 md:border-l border-gray-700">
             <i data-lucide="code-2" class="w-24 h-24 text-gray-700 opacity-50"></i>
             <div class="absolute inset-0 bg-gradient-to-t from-[#0b1021] to-transparent opacity-50"></div>
          </div>
        </div>
      `;
    } else {
      activeContainer.innerHTML = `<div class="p-12 text-center text-gray-500">No active challenge right now. Check back later!</div>`;
    }

    // 3. Render Past Challenges
    if (pastContainer) {
      pastContainer.innerHTML = pastChallenges.map(c => `
        <div class="bg-[#16213E] p-6 rounded-xl border border-gray-700 flex flex-col hover:border-[#A66CFF] transition duration-300">
           <div class="flex justify-between items-start mb-4">
              <h4 class="text-xl font-bold text-white">${c.title}</h4>
              <span class="text-xs font-bold px-2 py-1 rounded bg-gray-700 text-gray-300">Ended</span>
           </div>
           <p class="text-sm text-gray-400 mb-6 flex-1">${c.desc}</p>
           <div class="text-xs text-gray-500 pt-4 border-t border-gray-700 flex justify-between">
              <span>Tech: ${c.tech}</span>
              <span class="text-[#A66CFF]">${c.difficulty}</span>
           </div>
        </div>
      `).join("");
    }
    
    // Refresh icons because we injected new HTML
    if(window.lucide) lucide.createIcons();
  },

  /* --- NAVIGATION & INTERACTION --- */

  filterPosts(category, btnElement) {
    const buttons = document.querySelectorAll('.category-card');
    buttons.forEach(btn => btn.classList.remove('active'));
    if(btnElement) btnElement.classList.add('active');

    const postsOnly = allData.filter(item => item.type === "post");
    let filtered = category === 'All' ? postsOnly : postsOnly.filter(post => post.category && post.category.includes(category));
    
    const gridTitle = document.getElementById("grid-title");
    if(gridTitle) gridTitle.innerText = category === 'All' ? "All Posts" : category + " Posts";
    
    this.renderPosts(filtered);
  },

  renderIcons() { if (window.lucide) lucide.createIcons(); },
  
  setActiveLink() {
    const path = window.location.pathname;
    let section = "index";
    
    if (path.includes("daily") || path.includes("/posts/")) section = "daily";
    else if (path.includes("courses")) section = "courses";
    else if (path.includes("contact")) section = "contact";
    else if (path.includes("about")) section = "about";
    else if (path.includes("challenges")) section = "challenges"; // Handles the new page

    if (this.navLinks) {
        this.navLinks.forEach(link => {
            const href = link.getAttribute("href");
            if (href && href.includes(section + ".html")) link.classList.add("active");
        });
    }
  },
  
  setupMobileMenu() {
    if (!this.menuBtn || !this.mobileMenu) return;
    this.menuBtn.addEventListener("click", () => this.mobileMenu.classList.toggle("open"));
  },
  
  setupScrollReveal() {
    const elements = document.querySelectorAll(".reveal-up");
    if (!elements.length) return;
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) { entry.target.classList.add("active"); observer.unobserve(entry.target); }
      });
    }, { threshold: CONFIG.animationThreshold });
    elements.forEach(el => observer.observe(el));
  },

  /* ================= SPOTLIGHT SEARCH LOGIC ================= */
  setupGlobalSearch() {
    // 1. Inject HTML for Spotlight Modal
    const searchHTML = `
    <div id="searchOverlay" class="search-overlay">
      <div class="search-container">
         <div class="relative">
            <i data-lucide="search" class="absolute left-6 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5"></i>
            <input type="text" id="globalSearchInput" class="search-input-lg pl-14 pr-12" placeholder="Search courses, posts, or topics..." autocomplete="off">
            <div class="close-search" id="closeSearch">&times;</div>
         </div>
         <div id="searchResults" class="search-results"></div>
      </div>
    </div>`;

    if(!document.getElementById("searchOverlay")) document.body.insertAdjacentHTML('beforeend', searchHTML);
    
    const overlay = document.getElementById('searchOverlay');
    const closeBtn = document.getElementById('closeSearch');
    const input = document.getElementById('globalSearchInput');
    const resultsContainer = document.getElementById('searchResults');

    // 2. Open Search
    if (this.searchBtn) {
      this.searchBtn.addEventListener('click', () => { 
        overlay.classList.add('active'); 
        setTimeout(() => input.focus(), 100); 
      });
    }

    // 3. Close Functions
    const closeOverlay = () => { 
      overlay.classList.remove('active'); 
      input.value = ''; 
      resultsContainer.innerHTML = ''; 
    };

    closeBtn.addEventListener('click', closeOverlay);
    
    // Close when clicking background (but not the box)
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        closeOverlay();
      }
    });

    // Close on Escape Key
    document.addEventListener('keydown', (e) => { 
      if (e.key === 'Escape' && overlay.classList.contains('active')) closeOverlay(); 
    });

    // 4. Live Search Logic
    input.addEventListener('input', (e) => {
        const term = e.target.value.toLowerCase();
        resultsContainer.innerHTML = ''; 
        
        if (term.length < 1) return; 

        // Search logic includes Title, Description, and Category
        const matches = allData.filter(item => 
          item.title.toLowerCase().includes(term) || 
          (item.desc && item.desc.toLowerCase().includes(term)) ||
          (item.category && item.category.toLowerCase().includes(term)) ||
          (item.type && item.type.toLowerCase().includes(term))
        );

        if (matches.length === 0) {
          resultsContainer.innerHTML = '<div class="p-6 text-gray-500 text-center text-sm">No results found.</div>';
        } else {
          matches.forEach(item => {
              const safeUrl = getPath(item.url || 'challenges.html');
              
              // Determine Icon & Color based on Type
              let icon = 'file-text';
              let colorClass = 'text-gray-400';

              if (item.type === 'course') {
                icon = 'graduation-cap';
                colorClass = 'text-[#FFE66D]';
              } else if (item.type === 'challenge') {
                icon = 'trophy';
                colorClass = 'text-[#A66CFF]';
              } else if (item.type === 'post') {
                 icon = 'file-text';
                 colorClass = 'text-[#4CC9F0]';
              }
              
              const resultHTML = `
                <a href="${safeUrl}" class="search-result-item group">
                  <div class="w-8 h-8 rounded bg-gray-800 flex items-center justify-center ${colorClass} group-hover:bg-white group-hover:text-black transition">
                    <i data-lucide="${icon}" class="w-4 h-4"></i>
                  </div>
                  <div class="flex-1">
                    <h4 class="text-white text-sm font-bold group-hover:text-[#4CC9F0] transition">${item.title}</h4>
                    <span class="text-xs text-gray-500 uppercase tracking-wider">${item.category || item.type}</span>
                  </div>
                  <i data-lucide="chevron-right" class="w-4 h-4 text-gray-600 group-hover:text-white transition"></i>
                </a>`;
              
              resultsContainer.innerHTML += resultHTML;
          });
          lucide.createIcons(); // Refresh icons for new results
        }
    });
  },

  /* --- CONTACT FORM FUNCTIONS --- */
  handleFormSubmit(e) {
    e.preventDefault();
    const btn = e.target.querySelector('button[type="submit"]');
    const originalText = btn.innerHTML;
    btn.innerHTML = `<i data-lucide="loader-2" class="w-5 h-5 animate-spin"></i> Sending...`;
    lucide.createIcons();
    setTimeout(() => {
      document.getElementById('successMessage').classList.remove('hidden');
      document.getElementById('successMessage').classList.add('flex');
      btn.innerHTML = originalText;
    }, 1500);
  },
  resetForm() {
    document.getElementById('contactForm').reset();
    document.getElementById('successMessage').classList.add('hidden');
    document.getElementById('successMessage').classList.remove('flex');
  },
  copyEmail() {
    navigator.clipboard.writeText("kidsdevteam@gmail.com").then(() => {
      const btn = document.getElementById('copyBtn');
      const originalText = btn.innerText;
      btn.innerText = "Copied!";
      btn.classList.add("bg-green-500", "border-green-500");
      setTimeout(() => {
        btn.innerText = originalText;
        btn.classList.remove("bg-green-500", "border-green-500");
      }, 2000);
    });
  }
};

document.addEventListener("DOMContentLoaded", () => { UI.init(); });