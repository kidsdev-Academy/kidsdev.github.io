/**
 * KidsDev Academy - Professional Main Controller
 * --------------------------------------------------------------------------
 * Features:
 * 1. Data Loading & Live Search
 * 2. Mobile Menu & Navigation
 * 3. Scroll Animations & Sticky Header
 * 4. Interactive Form Handling (Newsletter)
 * 5. Dynamic Year & Counters
 */

document.addEventListener('DOMContentLoaded', () => {
    App.init();
});

const App = {
    // 1. STATE & CONFIG
    data: [],
    config: {
        scrollOffset: 100, // For sticky header
        animThreshold: 0.1 // For reveal animations
    },

    // 2. INITIALIZATION
    async init() {
        this.cacheDOM();
        
        // Initialize Icons immediately to prevent layout shifts
        if (window.lucide) lucide.createIcons();

        // Core Systems
        await this.loadData();
        this.setupMobileMenu();
        this.setupSearch();
        this.setupAnimations();
        this.setupStickyHeader();
        this.setupCookieBanner();
        
        // Professional Polish
        this.setupForms();
        this.setupDynamicYear();
    },

    // 3. DOM CACHING
    cacheDOM() {
        this.dom = {
            body: document.body,
            header: document.querySelector('.pro-header'),
            menuBtn: document.getElementById('menuBtn'),
            mobileMenu: document.getElementById('mobileMenu'),
            searchBtn: document.getElementById('searchBtn'),
            closeSearch: document.getElementById('closeSearch'),
            searchModal: document.getElementById('searchModal'),
            searchInput: document.getElementById('searchInput'),
            searchResults: document.getElementById('searchResults'),
            cookieBanner: document.getElementById('cookieBanner'),
            forms: document.querySelectorAll('form')
        };
    },

    // 4. DATA FETCHING (Robust with Fallback)
    async loadData() {
        try {
            const response = await fetch('/data/data.json');
            if (!response.ok) throw new Error("Data load failed");
            const json = await response.json();
            
            this.data = [
                ...(json.programs || []).map(i => ({...i, type: 'Program'})),
                ...(json.tips || []).map(i => ({...i, type: 'Tip'})),
                ...(json.courses || []).map(i => ({...i, type: 'Course'}))
            ];
        } catch (error) {
            console.log("ℹ️ Using offline fallback data.");
            this.useFallbackData();
        }
    },

    // 5. NAVIGATION LOGIC
    setupMobileMenu() {
        if (!this.dom.menuBtn || !this.dom.mobileMenu) return;

        const toggleMenu = () => {
            const isHidden = this.dom.mobileMenu.classList.contains('hidden');
            this.dom.mobileMenu.classList.toggle('hidden');
            
            // Lock body scroll when menu is open
            this.dom.body.style.overflow = isHidden ? 'hidden' : '';
            
            // Animate Icon
            this.dom.menuBtn.innerHTML = isHidden 
                ? '<i data-lucide="x"></i>' 
                : '<i data-lucide="menu"></i>';
            
            if (window.lucide) lucide.createIcons();
        };

        this.dom.menuBtn.addEventListener('click', toggleMenu);

        // Close menu when clicking any link
        this.dom.mobileMenu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                this.dom.mobileMenu.classList.add('hidden');
                this.dom.body.style.overflow = '';
                this.dom.menuBtn.innerHTML = '<i data-lucide="menu"></i>';
                if (window.lucide) lucide.createIcons();
            });
        });
    },

    // 6. SEARCH ENGINE (Live Filter)
    setupSearch() {
        if (!this.dom.searchBtn || !this.dom.searchModal) return;

        const toggleSearch = (show) => {
            if (show) {
                this.dom.searchModal.classList.remove('hidden');
                this.dom.body.style.overflow = 'hidden'; // Prevent background scrolling
                setTimeout(() => this.dom.searchInput.focus(), 100);
            } else {
                this.dom.searchModal.classList.add('hidden');
                this.dom.body.style.overflow = '';
            }
        };

        this.dom.searchBtn.addEventListener('click', () => toggleSearch(true));
        
        if (this.dom.closeSearch) {
            this.dom.closeSearch.addEventListener('click', () => toggleSearch(false));
        }
        
        // Close on backdrop click
        this.dom.searchModal.addEventListener('click', (e) => {
            if (e.target === this.dom.searchModal) toggleSearch(false);
        });

        // Close on Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && !this.dom.searchModal.classList.contains('hidden')) {
                toggleSearch(false);
            }
        });

        // Search Logic
        this.dom.searchInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase().trim();
            
            if (query.length < 2) {
                this.dom.searchResults.innerHTML = '<div class="text-center text-slate-400 py-10 opacity-60">Start typing to search courses...</div>';
                return;
            }

            const matches = this.data.filter(item => 
                item.title.toLowerCase().includes(query) || 
                (item.desc && item.desc.toLowerCase().includes(query))
            );

            if (matches.length > 0) {
                this.dom.searchResults.innerHTML = matches.map(item => `
                    <a href="${item.url}" class="flex items-center gap-4 p-4 hover:bg-slate-50 rounded-xl transition-all duration-200 group border border-transparent hover:border-slate-100">
                        <div class="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 shrink-0 group-hover:bg-[#0F172A] group-hover:text-white transition-colors duration-300">
                            <i data-lucide="arrow-right" class="w-5 h-5"></i>
                        </div>
                        <div>
                            <h4 class="font-bold text-sm text-[#0F172A] group-hover:text-[#F97316] transition-colors">${item.title}</h4>
                            <p class="text-xs text-slate-500 line-clamp-1 mt-0.5">${item.desc}</p>
                        </div>
                    </a>
                `).join('');
            } else {
                this.dom.searchResults.innerHTML = '<div class="text-center text-slate-400 py-10">No results found.</div>';
            }
            if (window.lucide) lucide.createIcons();
        });
    },

    // 7. SCROLL ANIMATIONS (IntersectionObserver)
    setupAnimations() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(e => {
                if (e.isIntersecting) {
                    e.target.classList.add('active');
                    observer.unobserve(e.target); // Only animate once for better performance
                }
            });
        }, { threshold: this.config.animThreshold });

        document.querySelectorAll('.reveal-up').forEach(el => observer.observe(el));
    },

    // 8. STICKY HEADER (Throttled Scroll)
    setupStickyHeader() {
        if (!this.dom.header) return;
        
        let lastScroll = 0;
        const throttle = (func, limit) => {
            let inThrottle;
            return function() {
                const args = arguments;
                const context = this;
                if (!inThrottle) {
                    func.apply(context, args);
                    inThrottle = true;
                    setTimeout(() => inThrottle = false, limit);
                }
            }
        };

        window.addEventListener('scroll', throttle(() => {
            const currentScroll = window.scrollY;
            
            // Add shadow and slight transparency on scroll
            if (currentScroll > 10) {
                this.dom.header.classList.add('shadow-md', 'bg-white/95');
                this.dom.header.classList.remove('bg-white/85'); // Remove initial transparency
            } else {
                this.dom.header.classList.remove('shadow-md', 'bg-white/95');
                this.dom.header.classList.add('bg-white/85');
            }
            lastScroll = currentScroll;
        }, 100));
    },

    // 9. PROFESSIONAL FORM HANDLING (UX)
    setupForms() {
        this.dom.forms.forEach(form => {
            form.addEventListener('submit', (e) => {
                // Determine if this is our newsletter form
                const emailInput = form.querySelector('input[type="email"]');
                const submitBtn = form.querySelector('button');
                
                if (emailInput && submitBtn) {
                    e.preventDefault(); // Stop actual submit
                    
                    // Simulate Loading State
                    const originalText = submitBtn.innerHTML;
                    submitBtn.innerHTML = '<div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>';
                    submitBtn.disabled = true;

                    // Simulate Success after 1.5s
                    setTimeout(() => {
                        submitBtn.classList.remove('bg-[#F97316]', 'hover:bg-orange-600');
                        submitBtn.classList.add('bg-green-500', 'hover:bg-green-600');
                        submitBtn.innerHTML = '<i data-lucide="check" class="w-4 h-4"></i>';
                        
                        emailInput.value = '';
                        emailInput.placeholder = "Thanks for subscribing!";
                        
                        // Reset after 3s
                        setTimeout(() => {
                            submitBtn.innerHTML = originalText;
                            submitBtn.disabled = false;
                            submitBtn.classList.add('bg-[#F97316]', 'hover:bg-orange-600');
                            submitBtn.classList.remove('bg-green-500', 'hover:bg-green-600');
                            if (window.lucide) lucide.createIcons();
                        }, 3000);
                        
                        if (window.lucide) lucide.createIcons();
                    }, 1500);
                }
            });
        });
    },

    // 10. UTILITIES (Year & Cookies)
    setupDynamicYear() {
        const yearSpan = document.querySelector('.current-year'); // Add this class to footer year if needed
        if (yearSpan) {
            yearSpan.textContent = new Date().getFullYear();
        }
    },

    setupCookieBanner() {
        if (!this.dom.cookieBanner) return;
        
        // Check if previously accepted (Local Storage)
        if (localStorage.getItem('cookiesAccepted')) return;

        setTimeout(() => {
            this.dom.cookieBanner.classList.remove('hidden');
        }, 2000);

        const btns = this.dom.cookieBanner.querySelectorAll('button');
        btns.forEach(btn => {
            btn.addEventListener('click', () => {
                this.dom.cookieBanner.style.display = 'none';
                localStorage.setItem('cookiesAccepted', 'true');
            });
        });
    },

    // 11. FALLBACK DATA
    useFallbackData() {
        this.data = [
            { title: "Python Programming", url: "/programs/python.html", desc: "Learn Python basics & Pygame.", type: "Program" },
            { title: "Web Development", url: "/programs/web-dev.html", desc: "HTML5, CSS3 & JavaScript.", type: "Program" },
            { title: "Scratch Games", url: "/programs/scratch.html", desc: "Visual coding for kids.", type: "Program" },
            { title: "Computer Basics", url: "/programs/basics.html", desc: "Hardware, Typing & Safety.", type: "Program" },
            { title: "Skill Assessment", url: "/assessment.html", desc: "Find your perfect level.", type: "Tool" }
        ];
    }
};