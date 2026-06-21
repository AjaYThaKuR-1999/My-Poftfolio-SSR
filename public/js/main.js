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

// Visit & Session Tracking
(function() {
    const userLoggedIn = document.body.getAttribute('data-user-logged-in') === 'true';
    window.userLoggedIn = userLoggedIn;

    const trackGlobal = !sessionStorage.getItem('counted_global_visit');
    const trackUser = userLoggedIn && !sessionStorage.getItem('counted_user_visit');

    if (!userLoggedIn) {
        sessionStorage.removeItem('counted_user_visit');
    }

    if (trackGlobal || trackUser) {
        fetch('/api/v1/auth/analytics/visit', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ trackGlobal, trackUser })
        })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                if (trackGlobal) sessionStorage.setItem('counted_global_visit', 'true');
                if (trackUser) sessionStorage.setItem('counted_user_visit', 'true');
            }
        })
        .catch(err => console.error('[Tracking Error]:', err));
    }
})();
