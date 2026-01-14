/* =========================================
   MAIN JAVASCRIPT CONTROLLER
   - Handles Global Footer & Header Sync
   - Powers Search, Filtering & Animations
   - Auto-detects folder depth for broken links
========================================== */

const UI = {
  data: [],
  prefix: '', // Stores "../" or "../../" to fix links in subfolders

  async init() {
    this.detectPathDepth();
    this.cacheElements();
    this.setupMobileMenu(); 
    this.initTypewriter();
    
    // 1. SETUP SEARCH (Powers the magnifying glass)
    this.setupSearch();
    
    // 2. RENDER GLOBAL FOOTER (Syncs across all pages)
    this.renderFooter();

    // 3. FETCH DATA (Loads courses.json, posts.json etc.)
    await this.fetchData();
    
    // 4. ROUTER: Detect current page and render content

    // A. HOME PAGE (index.html)
    if (this.homeContainer) {
        this.renderHomeGrid('all');
    }

    // B. COURSES PAGE (courses.html)
    if (this.coursesContainer) {
        const urlParams = new URLSearchParams(window.location.search);
        const category = urlParams.get('category') || 'all';
        
        // Set active button visual state
        if(category !== 'all') {
            const btn = document.querySelector(`button[onclick*="${category}"]`);
            if(btn) this.filterPageButtons(btn);
        }
        this.filterPage(category);
    }

    // C. DAILY PAGE (daily.html)
    if (this.dailyContainer) {
        this.filterPage('all', document.querySelector('.category-pill.active'));
    }

    // D. CHALLENGES PAGE (challenges.html)
    if (this.challengesContainer) {
        this.renderPageGrid('challenge', this.challengesContainer);
    }

    // E. NETWORKING FEED (For internal pages)
    if (this.networkingContainer) {
        this.renderTopicHub('Networking', this.networkingContainer);
    }

    // Initialize Icons & Animations
    if (window.lucide) lucide.createIcons();
    this.setupScrollReveal();
    
    // 5. EXPOSE FUNCTIONS GLOBALLY (For HTML onClick attributes)
    window.filterHome = (type, btn) => this.filterHome(type, btn);
    window.filterPage = (category, btn) => {
        this.filterPageButtons(btn);
        this.filterPage(category);
    };
  },

  cacheElements() {
    // Navigation
    this.menuBtn = document.getElementById("menuBtn");
    this.mobileMenu = document.getElementById("mobileMenu");
    
    // Grids & Containers
    this.homeContainer = document.getElementById("home-content");
    this.coursesContainer = document.getElementById("courses-grid");
    this.dailyContainer = document.getElementById("daily-grid");
    this.challengesContainer = document.getElementById("challenges-grid");
    this.networkingContainer = document.getElementById("networking-feed");
    this.viewAllContainer = document.getElementById("view-all-container");
    
    // Search Elements
    this.searchBtn = document.getElementById("searchBtn");
    this.searchModal = document.getElementById("searchModal");
    this.closeSearch = document.getElementById("closeSearch");
    this.searchInput = document.getElementById("searchInput");
    this.searchResults = document.getElementById("searchResults");
  },

  detectPathDepth() {
      const path = window.location.pathname;
      // Heuristic: If we are deep in courses/python/, go back 2 levels
      if (path.includes('/courses/') || path.includes('/daily/') || path.includes('/posts/')) {
          this.prefix = (path.split('/').length > 3) ? '../../' : '../';
      } else {
          this.prefix = '';
      }
  },

  /* ------------------------------------------------
     GLOBAL FOOTER RENDERER (The Sync Magic)
  ------------------------------------------------ */
  renderFooter() {
      const footer = document.getElementById('main-footer');
      if (!footer) return;

      // Ensure footer styles match the theme
      footer.className = "bg-[#0b1021] text-white pt-16 pb-8 border-t border-slate-800 font-[Poppins] mt-auto";

      footer.innerHTML = `
        <div class="max-w-7xl mx-auto px-6">
          <div class="grid md:grid-cols-4 gap-12 mb-12">
            
            <div class="col-span-1 md:col-span-2 space-y-4">
              <a href="${this.prefix}index.html" class="flex items-center gap-2 group">
                 <img src="${this.prefix}image/logo.png" class="h-8 w-auto object-contain transition transform group-hover:scale-105" onerror="this.style.display='none'"> 
                 <span class="font-extrabold text-2xl tracking-tighter">Kids<span class="text-[#F97316]">Dev</span></span>
              </a>
              <p class="text-slate-400 text-sm leading-relaxed max-w-xs">
                Empowering the next generation of innovators with free coding education.
              </p>
            </div>

            <div>
              <h3 class="font-bold text-xs tracking-widest uppercase mb-6 text-slate-500">Support</h3>
              <ul class="space-y-4 text-sm text-slate-400">
                <li><a href="${this.prefix}contact.html" class="hover:text-white transition">Contact Us</a></li>
                <li><a href="${this.prefix}privacy.html" class="hover:text-white transition">Privacy Policy</a></li>
                <li><a href="${this.prefix}about.html" class="hover:text-white transition">About Us</a></li>
              </ul>
            </div>

            <div>
              <h3 class="font-bold text-xs tracking-widest uppercase mb-6 text-slate-500">Follow Us</h3>
              <div class="flex gap-5">
                <a href="#" class="text-slate-400 hover:text-white transition transform hover:scale-110"><i data-lucide="github" class="w-5 h-5"></i></a>
                <a href="#" class="text-slate-400 hover:text-pink-500 transition transform hover:scale-110"><i data-lucide="instagram" class="w-5 h-5"></i></a>
                <a href="#" class="text-slate-400 hover:text-blue-500 transition transform hover:scale-110"><i data-lucide="facebook" class="w-5 h-5"></i></a>
              </div>
            </div>
          </div>

          <div class="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-right">
            <div class="hidden md:block"></div>
            <p class="text-slate-500 text-sm">
              Made with <span class="text-red-500 animate-pulse">❤️</span> by <span class="text-white font-bold">Tola Agbeyangi</span>
            </p>
          </div>
        </div>
      `;
  },

  /* ------------------------------------------------
     SEARCH FUNCTIONALITY (Powers the Search Bar)
  ------------------------------------------------ */
  setupSearch() {
      if (!this.searchBtn || !this.searchModal) return;

      // Open Modal
      this.searchBtn.addEventListener('click', (e) => {
          e.preventDefault();
          this.searchModal.classList.remove('hidden');
          // Focus input after small delay to ensure modal is visible
          setTimeout(() => this.searchInput.focus(), 100);
      });

      // Close Modal (Button)
      if(this.closeSearch) {
          this.closeSearch.addEventListener('click', () => this.searchModal.classList.add('hidden'));
      }

      // Close Modal (Click Outside)
      this.searchModal.addEventListener('click', (e) => {
          if (e.target === this.searchModal) this.searchModal.classList.add('hidden');
      });

      // Type to Search Logic
      if(this.searchInput) {
          this.searchInput.addEventListener('input', (e) => {
              const query = e.target.value.toLowerCase();
              
              if (query.length < 2) {
                  this.searchResults.innerHTML = '<div class="text-center text-slate-400 py-10">Start typing to search...</div>';
                  return;
              }

              // Search through all loaded data
              const results = this.data.filter(item => 
                  (item.title && item.title.toLowerCase().includes(query)) ||
                  (item.desc && item.desc.toLowerCase().includes(query)) ||
                  (item.category && item.category.toLowerCase().includes(query))
              );

              this.renderSearchResults(results);
          });
      }
  },

  renderSearchResults(results) {
      if (results.length === 0) {
          this.searchResults.innerHTML = '<div class="text-center text-slate-400 py-10">No results found.</div>';
          return;
      }
      
      this.searchResults.innerHTML = results.map(item => {
          const url = item.url ? (this.prefix + item.url) : '#';
          return `
            <a href="${url}" class="flex items-center gap-4 p-3 hover:bg-slate-50 rounded-xl transition border border-transparent hover:border-slate-100 group">
                <div class="w-12 h-12 rounded-lg bg-slate-100 overflow-hidden shrink-0">
                    <img src="${item.image || 'https://placehold.co/100x100'}" class="w-full h-full object-cover">
                </div>
                <div>
                    <h4 class="font-bold text-sm text-[#0F172A] group-hover:text-[#F97316]">${item.title}</h4>
                    <span class="text-xs text-slate-500 uppercase font-bold bg-slate-100 px-2 py-0.5 rounded">${item.category || item.type}</span>
                </div>
                <i data-lucide="arrow-right" class="w-4 h-4 text-slate-300 ml-auto group-hover:text-[#F97316]"></i>
            </a>
          `;
      }).join('');
      
      if (window.lucide) lucide.createIcons();
  },

  /* ------------------------------------------------
     DATA FETCHING & NORMALIZATION
  ------------------------------------------------ */
  async fetchData() {
    try {
      // FETCH 5 FILES using the calculated prefix
      const paths = ['data/posts.json', 'data/courses.json', 'data/challenges.json', 'data/daily.json', 'data/networking.json'];
      
      const responses = await Promise.allSettled(paths.map(p => fetch(this.prefix + p)));

      const unpack = async (res) => (res.status === 'fulfilled' && res.value.ok) ? await res.value.json() : [];

      const posts = await unpack(responses[0]);
      const courses = await unpack(responses[1]);
      const challenges = await unpack(responses[2]);
      const daily = await unpack(responses[3]);
      let networking = await unpack(responses[4]);

      // NORMALIZE NETWORKING
      const netCourses = networking.map(item => ({ 
          ...item, 
          type: 'networking-course',
          category: 'Networking',
          // Fix path relative to root if needed
          url: item.url || 'courses/networking/module1.html' 
      }));

      // MERGE EVERYTHING
      this.data = [...(Array.isArray(posts)?posts:[posts]), ...courses, ...challenges, ...daily, ...netCourses];

    } catch (error) {
      console.error("Error loading data:", error);
    }
  },

  /* ------------------------------------------------
     HOME PAGE GRID
  ------------------------------------------------ */
  filterHome(filterType, btn) {
      if(btn) {
          document.querySelectorAll('.filter-btn').forEach(b => {
             b.classList.remove('active', 'bg-[#0F172A]', 'text-white');
             b.classList.add('bg-white', 'text-slate-600');
          });
          btn.classList.remove('bg-white', 'text-slate-600');
          btn.classList.add('active', 'bg-[#0F172A]', 'text-white');
      }
      this.renderHomeGrid(filterType);
  },

  renderHomeGrid(filterType) {
    if (!this.homeContainer) return;
    
    // Sort Newest
    let items = [...this.data].sort((a, b) => new Date(b.date) - new Date(a.date));

    // Filter
    if (filterType !== 'all') {
      if (filterType === 'course') {
         items = items.filter(item => item.type === 'course' || item.type === 'networking-course');
      } else {
         items = items.filter(item => item.type === filterType);
      }
    }

    const displayItems = items.slice(0, 6); 
    this.homeContainer.innerHTML = displayItems.map(item => this.createCard(item)).join('');
    this.updateViewAllButton(filterType);
    if (window.lucide) lucide.createIcons();
    this.refreshAnimations();
  },

  /* ------------------------------------------------
     COURSES / DAILY PAGE LOGIC (Smart Filtering)
  ------------------------------------------------ */
  filterPage(category) {
    // 1. COURSES PAGE
    if (this.coursesContainer) {
        let items = this.data.filter(item => 
            item.type === 'course' || 
            item.type === 'networking-course' || 
            item.type === 'post'
        );
        
        if (category !== 'all') {
            const target = category.toLowerCase();
            items = items.filter(item => {
                const itemCat = (item.category || "").toLowerCase();
                
                // Smart Matching: "Coding" button finds Python
                if (target === 'programming') {
                    return itemCat.includes('programming') || itemCat.includes('python') || itemCat.includes('logic') || itemCat.includes('code');
                }
                if (target === 'web dev') {
                    return itemCat.includes('web') || itemCat.includes('html');
                }
                if (target === 'networking') {
                     return itemCat.includes('network') || itemCat.includes('cyber') || item.type === 'networking-course';
                }
                return itemCat.includes(target);
            });
        }
        this.renderGridItems(items, this.coursesContainer);
    }

    // 2. DAILY PAGE
    if (this.dailyContainer) {
        let items = this.data.filter(item => item.type === 'daily');
        if (category !== 'all') {
            items = items.filter(item => item.category && item.category.toLowerCase().includes(category.toLowerCase()));
        }
        this.renderGridItems(items, this.dailyContainer);
    }
  },

  filterPageButtons(btn) {
    if(!btn) return;
    document.querySelectorAll('.category-pill, .filter-btn').forEach(b => {
        b.classList.remove('active', 'bg-[#0F172A]', 'text-white');
        b.classList.add('bg-white', 'text-slate-600');
    });
    btn.classList.remove('bg-white', 'text-slate-600');
    btn.classList.add('active', 'bg-[#0F172A]', 'text-white');
  },

  renderGridItems(items, container) {
    if (!container) return;
    if (items.length === 0) {
      container.innerHTML = `<div class="col-span-full text-center py-20 text-slate-400">Loading content...</div>`;
    } else {
      container.innerHTML = items.map(item => this.createCard(item)).join('');
    }
    if (window.lucide) lucide.createIcons();
    this.refreshAnimations();
  },
  
  renderPageGrid(filterType, container) {
    let items = this.data.filter(item => item.type === filterType);
    items.sort((a, b) => new Date(b.date) - new Date(a.date));
    this.renderGridItems(items, container);
  },

  renderTopicHub(topic, container) {
      let items = this.data.filter(item => 
          (item.category && item.category.toLowerCase().includes(topic.toLowerCase())) ||
          (topic === 'Networking' && item.type === 'networking-course')
      );
      items.sort((a, b) => new Date(b.date) - new Date(a.date));
      this.renderGridItems(items, container);
  },

  /* ------------------------------------------------
     CARD GENERATOR
  ------------------------------------------------ */
  createCard(item) {
    let badgeClass = "bg-slate-100 text-slate-600";
    let icon = "file-text";
    let btnText = "Read";
    // Important: Use prefix for links so they work from subfolders
    let linkUrl = item.url ? (this.prefix + item.url) : '#';
    
    let topicsHtml = ""; 

    if (item.type === 'course') {
        badgeClass = item.colorClass ? `bg-opacity-10 ${item.colorClass.replace('text-', 'bg-')} ${item.colorClass}` : "bg-blue-50 text-blue-600";
        if(item.category === 'Web Dev') icon="globe";
        if(item.category === 'Programming') icon="code";
        if(item.category === 'Logic') icon="cpu";
        if(item.category === 'Networking') icon="network";

        btnText = "View Course";
        
        // Render Topic Tags
        if (item.topics && Array.isArray(item.topics)) {
            topicsHtml = `<div class="flex flex-wrap gap-2 mb-4">
                ${item.topics.map(t => `<span class="text-[10px] uppercase font-bold px-2 py-1 rounded bg-slate-100 text-slate-500 border border-slate-200">${t}</span>`).join('')}
            </div>`;
        }
    }
    else if (item.type === 'networking-course') {
        badgeClass = "bg-purple-100 text-purple-600";
        icon = "shield";
        btnText = "Start Lesson";
         if (item.topics && Array.isArray(item.topics)) {
            topicsHtml = `<div class="flex flex-wrap gap-2 mb-4">
                ${item.topics.map(t => `<span class="text-[10px] uppercase font-bold px-2 py-1 rounded bg-slate-100 text-slate-500 border border-slate-200">${t}</span>`).join('')}
            </div>`;
        }
    }
    else if (item.type === 'post') {
        badgeClass = "bg-orange-50 text-orange-600 border-orange-100";
        icon = "zap";
        btnText = "Read Tutorial";
    }
    else if (item.type === 'daily') {
        badgeClass = "bg-green-50 text-green-600 border-green-100";
        icon = "coffee";
        btnText = "Read Tip";
    }
    else if (item.type === 'challenge') {
        badgeClass = "bg-purple-50 text-purple-600 border-purple-100";
        icon = "trophy";
        btnText = "Accept Challenge";
    }

    const dateStr = item.date ? new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : "";

    return `
      <a href="${linkUrl}" class="dynamic-card bg-white rounded-2xl overflow-hidden border border-slate-200 block h-full reveal-up group flex flex-col hover:border-slate-300 transition-all shadow-sm hover:shadow-lg">
        <div class="h-48 relative overflow-hidden bg-slate-50 shrink-0">
          <img src="${item.image || 'https://placehold.co/600x400'}" alt="${item.title}" class="w-full h-full object-cover transform group-hover:scale-110 transition duration-500">
          
          <div class="absolute top-3 left-3 px-3 py-1 rounded-lg text-xs font-bold uppercase border ${badgeClass} shadow-sm flex items-center gap-1 bg-white/95 backdrop-blur-sm">
            <i data-lucide="${icon}" class="w-3 h-3"></i> ${item.category || item.type}
          </div>
          
          ${item.level ? `<div class="absolute bottom-3 right-3 px-2 py-1 rounded bg-black/60 text-white text-[10px] font-bold backdrop-blur-md border border-white/20">${item.level}</div>` : ''}
        </div>
        
        <div class="p-6 flex flex-col flex-1">
          <h3 class="text-xl font-bold text-[#0F172A] mb-2 group-hover:text-[#F97316] transition line-clamp-1">${item.title}</h3>
          
          <p class="text-slate-500 text-sm line-clamp-2 leading-relaxed mb-4">${item.desc}</p>
          
          ${topicsHtml}

          <div class="flex items-center justify-between border-t border-slate-100 pt-4 mt-auto">
            <span class="text-xs font-bold text-slate-400 uppercase tracking-wide flex items-center gap-1">${dateStr ? `<i data-lucide="calendar" class="w-3 h-3"></i> ${dateStr}` : ''}</span>
            <span class="text-[#F97316] text-sm font-bold flex items-center gap-1 group-hover:translate-x-1 transition">${btnText} <i data-lucide="arrow-right" class="w-4 h-4"></i></span>
          </div>
        </div>
      </a>
    `;
  },
  
  /* ------------------------------------------------
     UI HELPERS
  ------------------------------------------------ */
  updateViewAllButton(type) {
    if(!this.viewAllContainer) return;
    let text = "View All Content", url = this.prefix + "courses.html";
    
    if (type === 'course') { text = "View All Courses"; url = this.prefix + "courses.html"; }
    else if (type === 'daily') { text = "View All Tips"; url = this.prefix + "daily.html"; }
    else if (type === 'challenge') { text = "View All Challenges"; url = this.prefix + "challenges.html"; }
    
    this.viewAllContainer.innerHTML = `<a href="${url}" class="inline-flex items-center gap-2 bg-white border border-slate-300 hover:border-[#F97316] hover:text-[#F97316] text-[#0F172A] px-8 py-3 rounded-full font-bold transition shadow-sm">${text} <i data-lucide="arrow-right" class="w-4 h-4"></i></a>`;
    if (window.lucide) lucide.createIcons();
  },

  setupMobileMenu() {
    if (!this.menuBtn || !this.mobileMenu) return;
    this.menuBtn.addEventListener("click", () => this.mobileMenu.classList.toggle("hidden"));
  },

  initTypewriter() {
    const el = document.getElementById('typewriter-text');
    if (!el) return;
    const words = ["Potential", "Creativity", "Future"];
    let i = 0, j = 0, isDeleting = false;
    const type = () => {
      const word = words[i];
      if (isDeleting) {
        el.innerText = word.substring(0, j - 1); j--;
        if (j === 0) { isDeleting = false; i = (i + 1) % words.length; }
      } else {
        el.innerText = word.substring(0, j + 1); j++;
        if (j === word.length) { isDeleting = true; setTimeout(type, 2000); return; }
      }
      setTimeout(type, isDeleting ? 50 : 100);
    };
    type();
  },

  setupScrollReveal() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => { if(entry.isIntersecting) { entry.target.classList.add('active'); observer.unobserve(entry.target); }});
    }, { threshold: 0.1 });
    document.querySelectorAll('.reveal-up').forEach(el => observer.observe(el));
  },

  refreshAnimations() {
    setTimeout(() => { document.querySelectorAll(".reveal-up:not(.active)").forEach(el => el.classList.add('active')); }, 50);
  }
};

document.addEventListener("DOMContentLoaded", () => { UI.init(); });