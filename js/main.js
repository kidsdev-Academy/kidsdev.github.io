/* ================= CONFIG ================= */
const CONFIG = {
  animationThreshold: 0.15,
  animationDelayBase: 150
};

/* ================= UTILS ================= */
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
    
    // RENDER LOGIC
    this.renderIcons();
    
    // 1. Render Posts (if container exists)
    const posts = allData.filter(item => item.type === "post");
    this.renderPosts(posts);

    // 2. Render Courses (if container exists)
    const courses = allData.filter(item => item.type === "course");
    this.renderCourses(courses);
    
    // 3. Setup Interactive Elements
    this.setupMobileMenu();
    this.setupScrollReveal();
    this.setActiveLink();
    this.setupGlobalSearch(); 
    
    // 4. Attach Global Functions (For Contact Form)
    window.handleFormSubmit = this.handleFormSubmit;
    window.resetForm = this.resetForm;
    window.copyEmail = this.copyEmail;
    window.UI = this; // Expose UI for category filters
  },

  cacheElements() {
    this.postsContainer = document.getElementById("posts-container");
    this.coursesContainer = document.getElementById("courses-container");
    this.menuBtn = document.getElementById("menuBtn");
    this.mobileMenu = document.getElementById("mobileMenu");
    this.navLinks = document.querySelectorAll(".nav-link");
    this.searchBtn = document.querySelector('button[title="Search"]');
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
    
    // UPDATED LOGIC TO INCLUDE ABOUT PAGE
    if (path.includes("daily") || path.includes("/posts/")) section = "daily";
    else if (path.includes("courses")) section = "courses";
    else if (path.includes("contact")) section = "contact";
    else if (path.includes("about")) section = "about"; // <--- Added this!

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

  setupGlobalSearch() {
    const searchHTML = `<div id="searchOverlay" class="search-overlay"><div class="close-search" id="closeSearch">&times;</div><div class="search-container"><input type="text" id="globalSearchInput" class="search-input-lg" placeholder="Type to search..." autocomplete="off"><div id="searchResults" class="search-results"></div></div></div>`;
    if(!document.getElementById("searchOverlay")) document.body.insertAdjacentHTML('beforeend', searchHTML);
    const overlay = document.getElementById('searchOverlay');
    const closeBtn = document.getElementById('closeSearch');
    const input = document.getElementById('globalSearchInput');
    const resultsContainer = document.getElementById('searchResults');
    if (this.searchBtn) this.searchBtn.addEventListener('click', () => { overlay.classList.add('active'); setTimeout(() => input.focus(), 100); });
    const closeOverlay = () => { overlay.classList.remove('active'); input.value = ''; resultsContainer.innerHTML = ''; };
    closeBtn.addEventListener('click', closeOverlay);
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && overlay.classList.contains('active')) closeOverlay(); });
    input.addEventListener('input', (e) => {
        const term = e.target.value.toLowerCase();
        resultsContainer.innerHTML = ''; 
        if (term.length < 2) return; 
        const matches = allData.filter(item => item.title.toLowerCase().includes(term) || (item.desc && item.desc.toLowerCase().includes(term)));
        if (matches.length === 0) resultsContainer.innerHTML = '<div class="text-gray-500 text-center">No results found.</div>';
        else matches.forEach(item => {
            const safeUrl = getPath(item.url);
            resultsContainer.innerHTML += `<a href="${safeUrl}" class="search-result-item"><div class="w-12 h-12 rounded overflow-hidden flex-shrink-0"><img src="${item.image}" class="w-full h-full object-cover"></div><div><h4 class="text-white font-bold">${item.title}</h4><p class="text-gray-400 text-xs">${item.type === 'course' ? 'COURSE' : item.category}</p></div></a>`;
        });
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
    navigator.clipboard.writeText("hello@kidsdev.com").then(() => {
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