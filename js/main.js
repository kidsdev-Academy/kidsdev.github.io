/* ==========================================================================
   KIDSDEV ACADEMY - MAIN CONTROLLER
   --------------------------------------------------------------------------
   - Handles Data Fetching (Daily, Courses, Challenges)
   - Manages UI Rendering & Routing
   - Controls Search & Mobile Menu
========================================================================== */

const UI = {
  data: [],
  rootPath: '', 

  async init() {
    this.calculateRootPath();
    this.cacheElements();
    this.setupMobileMenu(); 
    this.setupSearch();

    // 1. FETCH DATA
    await this.fetchData();
    
    // 2. ROUTING & RENDERING
    // Detect which page we are on and render accordingly
    
    // -> Home Page
    if (this.homeDailyContainer || this.homeResourcesContainer) { 
        this.renderHomeFeeds('all'); 
    }

    // -> Courses Page
    if (this.coursesGrid) {
        const urlParams = new URLSearchParams(window.location.search);
        const category = urlParams.get('category') || 'all';
        this.updateFilterButtons(category); 
        this.renderGrid(this.coursesGrid, 'course', category);
    }

    // -> Daily Tips Page
    if (this.dailyGrid) {
        this.renderGrid(this.dailyGrid, 'daily', 'all');
    }

    // -> Challenges Page
    if (this.challengesGrid) {
        this.renderGrid(this.challengesGrid, 'challenge', 'all');
    }

    // 3. UI EFFECTS
    if (window.lucide) lucide.createIcons();
    this.setupScrollReveal();
    
    // 4. GLOBAL EXPORTS (For HTML onclick events)
    window.filterHome = (type, btn) => this.filterHome(type, btn);
    window.filterPage = (category, btn) => this.handlePageFilter(category, btn);
  },

  // --- PATH & DATA LOGIC ---
  calculateRootPath() {
      // Handles subfolder navigation if necessary
      const path = window.location.pathname;
      if (path.includes('/courses/') || path.includes('/posts/') || path.includes('/daily/') || path.includes('/challenges/')) {
          const depth = path.split('/').filter(p => p.length > 0).length - 1; 
          this.rootPath = '../'.repeat(depth) || './';
      } else {
          this.rootPath = ''; 
      }
  },

  async fetchData() {
    try {
      const prefix = this.rootPath;
      const files = ['data/daily.json', 'data/courses.json', 'data/challenges.json'];
      
      const responses = await Promise.allSettled(files.map(f => fetch(prefix + f)));
      const unpack = async (res) => (res.status === 'fulfilled' && res.value.ok) ? await res.value.json() : [];

      const dailyTips = await unpack(responses[0]);
      const courses = await unpack(responses[1]);
      const challenges = await unpack(responses[2]);

      // Merge all data into one searchable array
      this.data = [
          ...(Array.isArray(dailyTips) ? dailyTips.map(p => ({...p, type: 'daily'})) : []), 
          ...(Array.isArray(courses) ? courses.map(c => ({...c, type: 'course'})) : []), 
          ...(Array.isArray(challenges) ? challenges.map(c => ({...c, type: 'challenge'})) : [])
      ];

      // Sort by ID (Newest First)
      this.data.sort((a, b) => (b.id || 0) - (a.id || 0));

    } catch (error) {
      console.error("Error loading data:", error);
      this.data = []; 
    }
  },

  // --- HOME PAGE LOGIC ---
  filterHome(filterType, btn) {
      this.updateFilterButtons(null, btn);
      this.renderHomeFeeds(filterType);
  },

  renderHomeFeeds(filterType) {
    // 1. Daily Tech Feed (Google News Style)
    if (this.homeDailyContainer) {
        let items = this.data.filter(i => i.type === 'daily');
        
        if (filterType !== 'all') {
           items = items.filter(item => 
               (item.category && item.category.includes(filterType)) || 
               item.type === filterType.toLowerCase()
           );
        }
        
        const displayItems = items.slice(0, 4); // Show max 4
        
        if (displayItems.length === 0) {
            this.homeDailyContainer.innerHTML = this.getEmptyState("No updates found.");
        } else {
            // Render using the News Card style
            this.homeDailyContainer.innerHTML = displayItems.map(item => this.createNewsCard(item)).join('');
        }
    }

    // 2. Fresh Resources (Compact Style)
    if (this.homeResourcesContainer) {
        const resources = this.data.filter(i => i.type === 'course' || i.type === 'challenge');
        const freshResources = resources.slice(0, 3); // Show max 3
        
        if (freshResources.length === 0) {
            this.homeResourcesContainer.innerHTML = this.getEmptyState("Loading resources...");
        } else {
            this.homeResourcesContainer.innerHTML = freshResources.map(item => this.createProfessionalCard(item)).join('');
        }
    }
    
    this.refreshUI();
  },

  // --- INNER PAGES LOGIC ---
  handlePageFilter(category, btn) {
      this.updateFilterButtons(category, btn);
      
      if (this.coursesGrid) this.renderGrid(this.coursesGrid, 'course', category);
      else if (this.dailyGrid) this.renderGrid(this.dailyGrid, 'daily', category);
      else if (this.challengesGrid) this.renderGrid(this.challengesGrid, 'challenge', category);
  },

  renderGrid(container, type, category) {
      if (!container) return;
      
      let items = this.data.filter(i => i.type === type);
      
      if (category && category !== 'all') {
          items = items.filter(i => 
              i.category && i.category.toLowerCase().includes(category.toLowerCase())
          );
      }

      if (items.length === 0) {
          container.innerHTML = this.getEmptyState("No content found.");
      } else {
          // Use appropriate card style based on page type
          if(type === 'daily') {
              container.innerHTML = items.map(item => this.createNewsCard(item)).join('');
          } else {
              container.innerHTML = items.map(item => this.createProfessionalCard(item)).join('');
          }
      }
      this.refreshUI();
  },

  // --- CARD GENERATORS ---

  // 1. News Style Card (For Daily Feed)
  createNewsCard(item) {
    const linkUrl = this.fixLink(item.url);
    const imgUrl = this.fixLink(item.image) || 'https://placehold.co/600x400/f8fafc/94a3b8?text=KidsDev';
    
    // Logic for "Try It" vs "Read More"
    const isChallenge = (item.category && item.category.includes("Challenge"));
    const btnText = isChallenge ? "Try It" : "Read More";
    const btnColor = isChallenge ? "text-purple-600 hover:text-purple-700" : "text-blue-600 hover:text-blue-700";

    return `
    <article class="feed-card group reveal-up">
        <a href="${linkUrl}" class="feed-image-container">
            <img src="${imgUrl}" alt="${item.title}" class="feed-image">
            <span class="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-[#0F172A] text-[10px] font-bold px-2 py-1 rounded shadow-sm uppercase tracking-wide">
                ${item.category || 'News'}
            </span>
        </a>
        <div class="p-5 flex-1 flex flex-col">
            <div class="flex items-center gap-2 mb-3">
                <div class="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-[10px]">🚀</div>
                <span class="text-[10px] font-bold text-slate-400 uppercase">KidsDev • ${item.date || 'Today'}</span>
            </div>
            <a href="${linkUrl}" class="text-lg font-bold text-[#0F172A] leading-tight mb-2 group-hover:text-[#F97316] transition cursor-pointer">
                ${item.title}
            </a>
            <p class="text-slate-500 text-sm line-clamp-2 mb-4 flex-1">
                ${item.desc}
            </p>
            <div class="mt-auto border-t border-slate-100 pt-4 flex items-center justify-between">
                <div class="flex gap-3">
                    <button class="text-slate-400 hover:text-red-500 transition flex items-center gap-1 text-xs font-bold"><i data-lucide="heart" class="w-4 h-4"></i></button>
                    <button class="text-slate-400 hover:text-blue-500 transition flex items-center gap-1 text-xs font-bold"><i data-lucide="share-2" class="w-4 h-4"></i></button>
                </div>
                <a href="${linkUrl}" class="text-xs font-bold ${btnColor} flex items-center gap-1">
                    ${btnText} <i data-lucide="arrow-right" class="w-3 h-3"></i>
                </a>
            </div>
        </div>
    </article>
    `;
  },

  // 2. Professional Style Card (For Courses & Resources)
  createProfessionalCard(item) {
    const linkUrl = this.fixLink(item.url);
    const imgUrl = this.fixLink(item.image) || 'https://placehold.co/600x400/0F172A/FFF?text=Course';

    let badgeClass = "bg-slate-100 text-slate-600";
    let btnText = "Start Now";
    let btnColor = "text-[#F97316]";

    if (item.level === 'Beginner') badgeClass = "bg-green-50 text-green-700";
    if (item.level === 'Advanced') badgeClass = "bg-red-50 text-red-700";

    return `
      <article class="course-card group flex flex-col h-full reveal-up">
        <div class="relative h-48 bg-slate-100 overflow-hidden">
            <img src="${imgUrl}" loading="lazy" class="w-full h-full object-cover group-hover:scale-105 transition duration-500" alt="${item.title}">
            <div class="absolute top-4 right-4 bg-white/90 backdrop-blur text-xs font-bold px-3 py-1 rounded-full shadow-sm ${badgeClass}">
                ${item.level || 'Course'}
            </div>
        </div>
        <div class="p-6 flex-1 flex flex-col">
            <div class="flex justify-between items-center mb-4 text-xs text-slate-400 font-bold uppercase tracking-wider">
                <span>${item.category}</span>
                <span>Module</span>
            </div>
            <h3 class="text-xl font-bold text-[#0F172A] mb-2 group-hover:text-[#F97316] transition">
                ${item.title}
            </h3>
            <p class="text-slate-500 text-sm leading-relaxed line-clamp-2 flex-1 mb-4">${item.desc}</p>
            <div class="mt-auto flex items-center justify-between border-t border-slate-100 pt-4">
                <span class="text-xs font-bold text-slate-400">Join Class</span>
                <a href="${linkUrl}" class="text-sm font-bold ${btnColor} flex items-center gap-1">
                    ${btnText} <i data-lucide="chevron-right" class="w-4 h-4"></i>
                </a>
            </div>
        </div>
      </article>
    `;
  },

  // --- HELPERS ---
  fixLink(url) {
      if (!url) return '#';
      if (!url.startsWith('http') && !url.startsWith('/')) return this.rootPath + url;
      return url;
  },

  getEmptyState(msg) {
      return `<div class="col-span-full text-center py-20 text-slate-400"><p>${msg}</p></div>`;
  },

  updateFilterButtons(category, btn) {
    // Updates styling for filter pills
    if (btn) {
        const container = btn.parentElement;
        container.querySelectorAll('.filter-btn').forEach(b => {
            b.classList.remove('active', 'bg-[#0F172A]', 'text-white');
            b.classList.add('bg-white', 'text-slate-600');
        });
        btn.classList.remove('bg-white', 'text-slate-600');
        btn.classList.add('active', 'bg-[#0F172A]', 'text-white');
    }
  },

  cacheElements() {
    this.menuBtn = document.getElementById("menuBtn");
    this.mobileMenu = document.getElementById("mobileMenu");
    
    this.homeDailyContainer = document.getElementById("home-daily-feed");
    this.homeResourcesContainer = document.getElementById("home-resources-feed");
    
    this.coursesGrid = document.getElementById("courses-grid");
    this.dailyGrid = document.getElementById("daily-grid");
    this.challengesGrid = document.getElementById("challenges-grid");
    
    this.searchBtn = document.getElementById("searchBtn");
    this.searchModal = document.getElementById("searchModal");
    this.closeSearch = document.getElementById("closeSearch");
    this.searchInput = document.getElementById("searchInput");
    this.searchResults = document.getElementById("searchResults");
  },

  setupSearch() {
      if (!this.searchBtn || !this.searchModal) return;
      const toggle = (show) => {
          this.searchModal.classList.toggle('hidden', !show);
          if(show) setTimeout(() => this.searchInput.focus(), 100);
      };
      this.searchBtn.addEventListener('click', (e) => { e.preventDefault(); toggle(true); });
      if(this.closeSearch) this.closeSearch.addEventListener('click', () => toggle(false));
      this.searchModal.addEventListener('click', (e) => { if (e.target === this.searchModal) toggle(false); });

      if(this.searchInput) {
          this.searchInput.addEventListener('input', (e) => {
              const q = e.target.value.toLowerCase();
              if (q.length < 2) return (this.searchResults.innerHTML = '<div class="text-center text-slate-400 py-10">Start typing...</div>');
              const res = this.data.filter(i => (i.title+i.desc+i.category).toLowerCase().includes(q));
              this.searchResults.innerHTML = res.length ? res.map(i => `
                <a href="${this.fixLink(i.url)}" class="flex items-center gap-4 p-3 hover:bg-slate-50 rounded-xl transition group">
                    <div class="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 shrink-0 group-hover:bg-[#0F172A] group-hover:text-white transition"><i data-lucide="arrow-right" class="w-4 h-4"></i></div>
                    <div><h4 class="font-bold text-sm text-[#0F172A] group-hover:text-blue-600 line-clamp-1">${i.title}</h4><span class="text-xs text-slate-500 uppercase font-bold">${i.category || i.type}</span></div>
                </a>`).join('') : '<div class="text-center text-slate-400 py-10">No results found.</div>';
              if (window.lucide) lucide.createIcons();
          });
      }
  },

  setupMobileMenu() {
    if (this.menuBtn) this.menuBtn.addEventListener("click", () => this.mobileMenu.classList.toggle("hidden"));
  },

  setupScrollReveal() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(e => { if(e.isIntersecting) { e.target.classList.add('active'); observer.unobserve(e.target); }});
    }, { threshold: 0.1 });
    document.querySelectorAll('.reveal-up').forEach(el => observer.observe(el));
  },

  refreshUI() {
    if (window.lucide) lucide.createIcons();
    setTimeout(() => document.querySelectorAll(".reveal-up:not(.active)").forEach(el => el.classList.add('active')), 50);
  }
};

// Start App
document.addEventListener("DOMContentLoaded", () => { UI.init(); });