document.addEventListener('DOMContentLoaded', () => {

    // --- 1. Initialize Icons ---
    if (window.lucide) {
        lucide.createIcons();
    }

    // --- 2. Mobile Menu Logic (Fixed) ---
    // Defined on window for inline HTML access
    window.toggleMobileMenu = function() {
        const menu = document.getElementById('mobileMenu');
        
        if (menu) {
            // Toggle Visibility
            if (menu.classList.contains('hidden')) {
                // OPEN MENU
                menu.classList.remove('hidden');
                
                // Add a small animation for smoothness
                menu.style.opacity = '0';
                menu.style.transform = 'translateY(-10px)';
                setTimeout(() => {
                    menu.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
                    menu.style.opacity = '1';
                    menu.style.transform = 'translateY(0)';
                }, 10);
                
            } else {
                // CLOSE MENU
                menu.classList.add('hidden');
            }
        }
    };

    // FIX 1: Auto-close mobile menu if window is resized to desktop width
    window.addEventListener('resize', () => {
        const menu = document.getElementById('mobileMenu');
        // 768px is the standard Tailwind 'md' breakpoint
        if (window.innerWidth >= 768 && menu && !menu.classList.contains('hidden')) {
            menu.classList.add('hidden');
        }
    });

    // FIX 2: Close mobile menu when clicking outside of it
    document.addEventListener('click', (event) => {
        const menu = document.getElementById('mobileMenu');
        const btn = document.getElementById('menuBtn');
        
        // If menu is open...
        if (menu && !menu.classList.contains('hidden')) {
            // ...and the click was NOT on the menu or the button
            if (!menu.contains(event.target) && !btn.contains(event.target)) {
                menu.classList.add('hidden');
            }
        }
    });

    // --- 3. FAQ Accordion Logic ---
    window.toggleFaq = function(element) {
        const content = element.querySelector('.faq-content');
        const icon = element.querySelector('.faq-icon');
        
        // Toggle the clicked item
        if (content) {
            const isHidden = content.classList.contains('hidden');
            
            if (isHidden) {
                content.classList.remove('hidden');
                if (icon) icon.style.transform = 'rotate(180deg)';
                element.classList.add('bg-slate-50/50'); // Optional active highlight
            } else {
                content.classList.add('hidden');
                if (icon) icon.style.transform = 'rotate(0deg)';
                element.classList.remove('bg-slate-50/50');
            }
        }

        // Accordion Behavior: Close all other open FAQs
        const allFaqs = document.querySelectorAll('.faq-item');
        allFaqs.forEach(item => {
            if (item !== element) {
                const itemContent = item.querySelector('.faq-content');
                const itemIcon = item.querySelector('.faq-icon');
                
                if (itemContent && !itemContent.classList.contains('hidden')) {
                    itemContent.classList.add('hidden');
                    item.classList.remove('bg-slate-50/50');
                    if (itemIcon) itemIcon.style.transform = 'rotate(0deg)';
                }
            }
        });
    };

    // --- 4. Scroll Animations (Reveal Up) ---
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1 // Trigger when 10% of element is visible
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                // Ensure opacity is reset to 1
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Initialize elements
    const animatedElements = document.querySelectorAll('.reveal-up');
    animatedElements.forEach(el => {
        // Set initial invisible state via JS to prevent layout shifts if JS fails
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.8s cubic-bezier(0.5, 0, 0, 1), transform 0.8s cubic-bezier(0.5, 0, 0, 1)';
        observer.observe(el);
    });

});