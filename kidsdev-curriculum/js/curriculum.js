/**
 * KidsDev Academy - Curriculum Page Logic
 * Handles animations, FAQ toggles, and interactive elements on the roadmap.
 */

document.addEventListener('DOMContentLoaded', () => {
    
    // --- 1. Roadmap Scroll Animations ---
    // This adds a 'visible' class to timeline items as they scroll into view
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.15 // Trigger when 15% of the element is visible
    };

    const roadmapObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active'); // CSS should handle .roadmap-level.active
                // Optional: Stop observing once animated to prevent re-triggering
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Select all roadmap levels and other scroll-animated elements
    const animatedElements = document.querySelectorAll('.roadmap-level, .animate-on-scroll, .reveal');
    animatedElements.forEach(el => {
        // Ensure initial state is hidden (if not set in CSS)
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'all 0.8s cubic-bezier(0.5, 0, 0, 1)';
        
        // Start observing
        roadmapObserver.observe(el);
    });

    // Add specific class for 'active' state to override inline styles
    const styleSheet = document.createElement("style");
    styleSheet.innerText = `
        .roadmap-level.active, .animate-on-scroll.active, .reveal.active {
            opacity: 1 !important;
            transform: translateY(0) !important;
        }
    `;
    document.head.appendChild(styleSheet);


    // --- 2. FAQ Accordion Logic ---
    // Handles opening and closing of FAQ items
    const faqItems = document.querySelectorAll('.faq-item');
    
    faqItems.forEach(item => {
        item.addEventListener('click', (e) => {
            // Prevent triggering when clicking unrelated children if needed, 
            // but usually clicking anywhere on the header is fine.
            
            // Close other items (Accordion style - optional, remove to allow multiple open)
            faqItems.forEach(otherItem => {
                if (otherItem !== item && otherItem.classList.contains('active')) {
                    otherItem.classList.remove('active');
                    const content = otherItem.querySelector('.faq-content');
                    if(content) content.style.maxHeight = null;
                    const icon = otherItem.querySelector('.faq-icon');
                    if(icon) icon.style.transform = 'rotate(0deg)';
                }
            });

            // Toggle current item
            item.classList.toggle('active');
            
            const content = item.querySelector('.faq-content');
            const icon = item.querySelector('.faq-icon');
            
            if (item.classList.contains('active')) {
                // Open
                if(content) content.style.maxHeight = content.scrollHeight + "px";
                if(icon) icon.style.transform = 'rotate(180deg)';
            } else {
                // Close
                if(content) content.style.maxHeight = null;
                if(icon) icon.style.transform = 'rotate(0deg)';
            }
        });
    });


    // --- 3. Dynamic Copyright Year ---
    const yearSpan = document.querySelector('.current-year');
    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    }
    
    // --- 4. Mobile Menu Toggle (Shared Logic) ---
    // Duplicate this here or ensure main.js is loaded
    window.toggleMobileMenu = function() {
        const menu = document.getElementById('mobile-menu');
        if(menu) {
            menu.classList.toggle('open');
            // Optional: Animate hamburger icon
        }
    };
});