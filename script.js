/* ==========================================================================
   Roshan Kumar Shrestha — Portfolio scripts
   Vanilla JS. Requires bootstrap.bundle.min.js to be loaded first.
   ========================================================================== */

(() => {
    'use strict';

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const supportsObserver = 'IntersectionObserver' in window;

    const navbar = document.querySelector('.site-nav');
    const navCollapse = document.getElementById('navbarNav');
    const navToggle = document.querySelector('.nav-toggle');
    const navLinks = document.querySelectorAll('.site-nav .nav-link');
    const sections = document.querySelectorAll('main section[id]');


    /* ------------------------------------------------------------------
       Navbar background on scroll + active link for the current section
       ------------------------------------------------------------------ */

    const setActiveLink = (id) => {
        navLinks.forEach((link) => {
            const isActive = link.getAttribute('href') === `#${id}`;
            link.classList.toggle('active', isActive);

            if (isActive) {
                link.setAttribute('aria-current', 'true');
            } else {
                link.removeAttribute('aria-current');
            }
        });
    };

    const updateOnScroll = () => {
        navbar.classList.toggle('is-scrolled', window.scrollY > 24);

        // The current section is the last one whose top has passed ~35% of the viewport.
        const marker = window.innerHeight * 0.35;
        let currentId = sections.length ? sections[0].id : '';

        sections.forEach((section) => {
            if (section.getBoundingClientRect().top <= marker) {
                currentId = section.id;
            }
        });

        setActiveLink(currentId);
    };

    let scrollTicking = false;

    window.addEventListener('scroll', () => {
        if (scrollTicking) return;
        scrollTicking = true;

        window.requestAnimationFrame(() => {
            updateOnScroll();
            scrollTicking = false;
        });
    }, { passive: true });

    window.addEventListener('resize', updateOnScroll, { passive: true });
    updateOnScroll();


    /* ------------------------------------------------------------------
       Mobile menu: close after clicking a link, on Escape, or outside
       ------------------------------------------------------------------ */

    if (navCollapse && window.bootstrap) {
        const menu = bootstrap.Collapse.getOrCreateInstance(navCollapse, { toggle: false });
        const isOpen = () => navCollapse.classList.contains('show');

        navCollapse.querySelectorAll('a').forEach((link) => {
            link.addEventListener('click', () => {
                if (isOpen()) menu.hide();
            });
        });

        navCollapse.addEventListener('show.bs.collapse', () => navbar.classList.add('is-menu-open'));
        navCollapse.addEventListener('hidden.bs.collapse', () => navbar.classList.remove('is-menu-open'));

        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape' && isOpen()) {
                menu.hide();
                navToggle.focus();
            }
        });

        document.addEventListener('click', (event) => {
            if (isOpen() && !navbar.contains(event.target)) {
                menu.hide();
            }
        });
    }


    /* ------------------------------------------------------------------
       Reveal on scroll
       ------------------------------------------------------------------ */

    const revealItems = document.querySelectorAll('.reveal');

    if (!reduceMotion && supportsObserver && revealItems.length) {
        document.documentElement.classList.add('has-reveal');

        const revealObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target);
            });
        }, { rootMargin: '0px 0px -8% 0px' });

        revealItems.forEach((item) => revealObserver.observe(item));
    }


    /* ------------------------------------------------------------------
       Stat counters (final values stay in the HTML for no-JS and SEO)
       ------------------------------------------------------------------ */

    const counters = document.querySelectorAll('[data-count-to]');

    const animateCounter = (element) => {
        const target = Number(element.dataset.countTo);
        const duration = 1400;
        const start = performance.now();

        const tick = (now) => {
            const progress = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);

            element.textContent = Math.round(target * eased);

            if (progress < 1) window.requestAnimationFrame(tick);
        };

        window.requestAnimationFrame(tick);
    };

    if (!reduceMotion && supportsObserver && counters.length) {
        const counterObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;
                animateCounter(entry.target);
                observer.unobserve(entry.target);
            });
        }, { threshold: 0.6 });

        counters.forEach((counter) => {
            counter.textContent = '0';
            counterObserver.observe(counter);
        });
    }


    /* ------------------------------------------------------------------
       Card spotlight that follows the cursor (mouse/trackpad only)
       ------------------------------------------------------------------ */

    if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
        document.querySelectorAll('[data-spotlight]').forEach((card) => {
            card.addEventListener('pointermove', (event) => {
                const rect = card.getBoundingClientRect();
                card.style.setProperty('--spot-x', `${event.clientX - rect.left}px`);
                card.style.setProperty('--spot-y', `${event.clientY - rect.top}px`);
            });
        });
    }


    /* ------------------------------------------------------------------
       Copy email address to clipboard
       ------------------------------------------------------------------ */

    const copyButton = document.querySelector('[data-copy-email]');

    if (copyButton && navigator.clipboard) {
        const label = copyButton.querySelector('.copy-btn-label');
        let resetTimer;

        copyButton.hidden = false;

        copyButton.addEventListener('click', async () => {
            try {
                await navigator.clipboard.writeText(copyButton.dataset.copyEmail);
                copyButton.classList.add('is-copied');
                label.textContent = 'Copied!';
            } catch {
                label.textContent = 'Copy failed';
            }

            clearTimeout(resetTimer);
            resetTimer = setTimeout(() => {
                copyButton.classList.remove('is-copied');
                label.textContent = 'Copy';
            }, 2000);
        });
    }


    /* ------------------------------------------------------------------
       Footer year
       ------------------------------------------------------------------ */

    document.querySelectorAll('[data-current-year]').forEach((element) => {
        element.textContent = new Date().getFullYear();
    });
})();
