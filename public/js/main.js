// Header Scroll Effect
const header = document.getElementById('main-header');
const headerContainer = document.getElementById('header-container');

window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        header.classList.add('bg-slate-950/90', 'border-slate-800');
        header.classList.remove('bg-slate-950/20');
        headerContainer.classList.add('h-16');
        headerContainer.classList.remove('h-24');
    } else {
        header.classList.remove('bg-slate-950/90', 'border-slate-800');
        header.classList.add('bg-slate-950/20');
        headerContainer.classList.add('h-24');
        headerContainer.classList.remove('h-16');
    }
});

// Mobile Menu Toggle
const mobileMenuButton = document.getElementById('mobile-menu-button');
const mobileMenu = document.getElementById('mobile-menu');

if (mobileMenuButton && mobileMenu) {
    mobileMenuButton.addEventListener('click', () => {
        mobileMenu.classList.toggle('hidden');
    });
}

// Simple Intersection Observer for scroll animations
const observerOptions = {
    threshold: 0.1
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('animate-in');
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

document.querySelectorAll('.glass-card').forEach(card => {
    // observer.observe(card);
});
