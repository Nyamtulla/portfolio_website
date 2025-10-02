// Portfolio Website JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // Navigation functionality
    const navLinks = document.querySelectorAll('.nav-link');
    const contentSections = document.querySelectorAll('.content-section');
    
    // Handle navigation clicks - scroll to sections
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Remove active class from all nav links
            navLinks.forEach(nav => nav.classList.remove('active'));
            
            // Add active class to clicked link
            this.classList.add('active');
            
            // Get target section
            const targetSection = this.getAttribute('data-section');
            const targetElement = document.getElementById(targetSection);
            
            if (targetElement) {
                // Smooth scroll to target section
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
    
    // Handle hero button clicks
    const heroButtons = document.querySelectorAll('.hero .btn');
    heroButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            if (this.getAttribute('href').startsWith('#')) {
                e.preventDefault();
                const targetSection = this.getAttribute('href').substring(1);
                
                // Update navigation
                navLinks.forEach(nav => nav.classList.remove('active'));
                const targetNav = document.querySelector(`[data-section="${targetSection}"]`);
                if (targetNav) {
                    targetNav.classList.add('active');
                }
                
                // Scroll to target section
                const targetElement = document.getElementById(targetSection);
                if (targetElement) {
                    targetElement.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            }
        });
    });
    
    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
    
    // Add scroll effect to navigation
    let lastScrollTop = 0;
    const leftPanel = document.querySelector('.left-panel');
    
    window.addEventListener('scroll', function() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        if (scrollTop > lastScrollTop && scrollTop > 100) {
            // Scrolling down
            leftPanel.style.transform = 'translateX(-10px)';
        } else {
            // Scrolling up
            leftPanel.style.transform = 'translateX(0)';
        }
        
        lastScrollTop = scrollTop;
    });
    
    // Add hover effects to cards
    const cards = document.querySelectorAll('.content-card, .research-item, .education-item, .publication-item');
    cards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-5px)';
            this.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.15)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
            this.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.1)';
        });
    });
    
    // Simple timeline - no animations needed
    
    // Add typing effect to hero title
    const heroTitle = document.querySelector('.hero h1');
    if (heroTitle) {
        const originalText = heroTitle.textContent;
        heroTitle.textContent = '';
        
        let i = 0;
        const typeWriter = () => {
            if (i < originalText.length) {
                heroTitle.textContent += originalText.charAt(i);
                i++;
                setTimeout(typeWriter, 100);
            }
        };
        
        setTimeout(typeWriter, 500);
    }
    
    // Add fade-in animation to elements on scroll
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    
    // Observe all content cards
    cards.forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(card);
    });
    
    // Add click effect to buttons
    const buttons = document.querySelectorAll('.btn');
    buttons.forEach(button => {
        button.addEventListener('click', function(e) {
            // Create ripple effect
            const ripple = document.createElement('span');
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;
            
            ripple.style.width = ripple.style.height = size + 'px';
            ripple.style.left = x + 'px';
            ripple.style.top = y + 'px';
            ripple.classList.add('ripple');
            
            this.appendChild(ripple);
            
            setTimeout(() => {
                ripple.remove();
            }, 600);
        });
    });
    
    // Add CSS for ripple effect
    const style = document.createElement('style');
    style.textContent = `
        .btn {
            position: relative;
            overflow: hidden;
        }
        
        .ripple {
            position: absolute;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.6);
            transform: scale(0);
            animation: ripple-animation 0.6s linear;
            pointer-events: none;
        }
        
        @keyframes ripple-animation {
            to {
                transform: scale(4);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);
    
    // Initialize with home section active in navigation
    const homeNavLink = document.querySelector('[data-section="home"]');
    if (homeNavLink) {
        homeNavLink.classList.add('active');
    }
    
    // Add keyboard navigation
    document.addEventListener('keydown', function(e) {
        if (e.altKey) {
            switch(e.key) {
                case '1':
                    e.preventDefault();
                    document.querySelector('[data-section="home"]').click();
                    break;
                case '2':
                    e.preventDefault();
                    document.querySelector('[data-section="about"]').click();
                    break;
                case '3':
                    e.preventDefault();
                    document.querySelector('[data-section="education"]').click();
                    break;
                case '4':
                    e.preventDefault();
                    document.querySelector('[data-section="publications"]').click();
                    break;
                case '5':
                    e.preventDefault();
                    document.querySelector('[data-section="research"]').click();
                    break;
                case '6':
                    e.preventDefault();
                    document.querySelector('[data-section="contact"]').click();
                    break;
            }
        }
    });
    
    // Gallery scroll functionality
    const galleryScroll = document.querySelector('.gallery-scroll');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    
    if (galleryScroll && prevBtn && nextBtn) {
        const scrollAmount = 320; // Width of one item + gap
        
        prevBtn.addEventListener('click', function() {
            galleryScroll.scrollBy({
                left: -scrollAmount,
                behavior: 'smooth'
            });
        });
        
        nextBtn.addEventListener('click', function() {
            galleryScroll.scrollBy({
                left: scrollAmount,
                behavior: 'smooth'
            });
        });
        
        // Update button visibility based on scroll position
        function updateButtonVisibility() {
            const scrollLeft = galleryScroll.scrollLeft;
            const maxScroll = galleryScroll.scrollWidth - galleryScroll.clientWidth;
            
            prevBtn.style.opacity = scrollLeft > 0 ? '1' : '0.5';
            nextBtn.style.opacity = scrollLeft < maxScroll - 10 ? '1' : '0.5';
            
            prevBtn.style.pointerEvents = scrollLeft > 0 ? 'all' : 'none';
            nextBtn.style.pointerEvents = scrollLeft < maxScroll - 10 ? 'all' : 'none';
        }
        
        // Initial button state
        updateButtonVisibility();
        
        // Update buttons on scroll
        galleryScroll.addEventListener('scroll', updateButtonVisibility);
        
        // Touch/swipe support for mobile
        let startX = 0;
        let scrollLeft = 0;
        
        galleryScroll.addEventListener('touchstart', function(e) {
            startX = e.touches[0].pageX - galleryScroll.offsetLeft;
            scrollLeft = galleryScroll.scrollLeft;
        });
        
        galleryScroll.addEventListener('touchmove', function(e) {
            e.preventDefault();
            const x = e.touches[0].pageX - galleryScroll.offsetLeft;
            const walk = (x - startX) * 2;
            galleryScroll.scrollLeft = scrollLeft - walk;
        });
    }
    
    console.log('Portfolio website loaded successfully!');
    console.log('Keyboard shortcuts: Alt + 1-6 to navigate sections');
});
