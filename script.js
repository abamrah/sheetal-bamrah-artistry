/* ===================================================
   SHEETAL BAMRAH BRIDAL ARTISTRY — JavaScript
   Clean, minimal — matches mandybamrah.com style
   =================================================== */

(function () {
  'use strict';

  /* --------------------------------------------------
     DOM REFERENCES
     -------------------------------------------------- */
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

  const preloader     = $('#preloader');
  const navbar        = $('#navbar');
  const hamburger     = $('#hamburger');
  const mobileNav     = $('#mobileNav');
  const portfolioGrid = $('#portfolioGrid');
  const filterBtns    = $$('.filter-btn');
  const lightbox      = $('#lightbox');
  const lightboxImg   = $('#lightboxImg');
  const lightboxClose = $('#lightboxClose');
  const lightboxPrev  = $('#lightboxPrev');
  const lightboxNext  = $('#lightboxNext');
  const contactForm   = $('#contactForm');
  const formSuccess   = $('#formSuccess');

  /* --------------------------------------------------
     PRELOADER
     -------------------------------------------------- */
  window.addEventListener('load', () => {
    setTimeout(() => {
      preloader.classList.add('hidden');
    }, 800);
  });

  /* --------------------------------------------------
     NAVBAR — scroll state
     -------------------------------------------------- */
  const navBrandScroll = $('#navBrandScroll');
  const heroTitle = $('#heroTitle');

  function handleNavbar() {
    if (window.scrollY > 40) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  }

  /* --------------------------------------------------
     HERO PARALLAX + TITLE FLOW ANIMATION
     The hero title shrinks and flows up into the navbar
     as the user scrolls. On scroll up, it flows back.
     -------------------------------------------------- */
  function handleHeroParallax() {
    const scrollY = window.scrollY;
    const heroH = window.innerHeight;
    const triggerStart = heroH * 0.1;   // when animation begins
    const triggerEnd = heroH * 0.55;    // when title is fully in navbar

    // Background parallax
    if (scrollY < heroH) {
      const heroImg = $('.hero-image img');
      if (heroImg) {
        heroImg.style.transform = `scale(1.05) translateY(${scrollY * 0.15}px)`;
      }
    }

    // Hero content fade (description + button)
    const heroContent = $('.hero-content');
    if (heroContent && scrollY < heroH) {
      const descFade = Math.max(0, 1 - scrollY / (heroH * 0.35));
      const desc = heroContent.querySelector('.hero-description');
      const btn = heroContent.querySelector('.btn');
      if (desc) { desc.style.opacity = descFade; }
      if (btn) { btn.style.opacity = descFade; }
    }

    // Title flow animation
    if (!heroTitle) return;

    if (scrollY <= triggerStart) {
      // Full hero state — title at original position
      heroTitle.style.position = '';
      heroTitle.style.top = '';
      heroTitle.style.left = '';
      heroTitle.style.transform = '';
      heroTitle.style.fontSize = '';
      heroTitle.style.letterSpacing = '';
      heroTitle.style.color = '';
      heroTitle.style.opacity = '';
      heroTitle.style.zIndex = '';
      navBrandScroll.classList.remove('visible');
    } else if (scrollY >= triggerEnd) {
      // Fully docked in navbar — hide hero title, show navbar brand
      heroTitle.style.opacity = '0';
      navBrandScroll.classList.add('visible');
    } else {
      // Animating — interpolate between hero and navbar
      const progress = (scrollY - triggerStart) / (triggerEnd - triggerStart);
      const eased = progress * progress * (3 - 2 * progress); // smoothstep

      // Scale font from hero size down
      const startSize = Math.min(window.innerWidth * 0.08, 96); // match clamp
      const endSize = 0;
      const size = startSize * (1 - eased);

      // Fade out title as it approaches navbar
      const fadeOut = 1 - eased;

      heroTitle.style.fontSize = size + 'px';
      heroTitle.style.letterSpacing = (0.18 * (1 - eased * 0.6)) + 'em';
      heroTitle.style.opacity = fadeOut;
      heroTitle.style.color = '#fff';

      navBrandScroll.classList.remove('visible');
    }
  }

  /* --------------------------------------------------
     SCROLL — combined handler
     -------------------------------------------------- */
  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        handleNavbar();
        handleHeroParallax();
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });

  /* --------------------------------------------------
     HAMBURGER MENU
     -------------------------------------------------- */
  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    mobileNav.classList.toggle('open');
    document.body.style.overflow = mobileNav.classList.contains('open') ? 'hidden' : '';
  });

  $$('a', mobileNav).forEach(link => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('active');
      mobileNav.classList.remove('open');
      document.body.style.overflow = '';
    });
  });

  /* --------------------------------------------------
     SCROLL REVEAL — Intersection Observer
     -------------------------------------------------- */
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -40px 0px'
  });

  $$('.reveal').forEach(el => revealObserver.observe(el));

  /* --------------------------------------------------
     PORTFOLIO FILTERING
     -------------------------------------------------- */
  function applyFilter(filter) {
    const items = $$('.portfolio-item', portfolioGrid);

    // First: hide everything instantly
    items.forEach(item => {
      item.classList.remove('show');
      item.style.display = 'none';
    });

    // Small delay to let the browser batch the hide, then reveal matched items
    requestAnimationFrame(() => {
      let staggerIndex = 0;
      items.forEach(item => {
        const cat = item.dataset.category;
        if (cat === filter) {
          item.style.display = '';
          // Stagger reveal for a cascading entrance
          const delay = staggerIndex * 80;
          setTimeout(() => item.classList.add('show'), delay + 30);
          staggerIndex++;
        }
      });
    });
  }

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      applyFilter(btn.dataset.filter);
    });
  });

  // Apply default filter (bridal) on load
  applyFilter('bridal');

  /* --------------------------------------------------
     LIGHTBOX
     -------------------------------------------------- */
  let currentLightboxImages = [];
  let currentLightboxIndex = 0;

  function openLightbox(imgSrc) {
    currentLightboxImages = $$('.portfolio-item', portfolioGrid)
      .filter(item => item.style.display !== 'none')
      .map(item => item.querySelector('img').src);

    currentLightboxIndex = currentLightboxImages.indexOf(imgSrc);
    if (currentLightboxIndex === -1) currentLightboxIndex = 0;

    lightboxImg.src = imgSrc;
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    lightbox.classList.remove('active');
    document.body.style.overflow = '';
    lightboxImg.src = '';
  }

  function navigateLightbox(direction) {
    if (currentLightboxImages.length === 0) return;
    currentLightboxIndex += direction;
    if (currentLightboxIndex < 0) currentLightboxIndex = currentLightboxImages.length - 1;
    if (currentLightboxIndex >= currentLightboxImages.length) currentLightboxIndex = 0;
    lightboxImg.src = currentLightboxImages[currentLightboxIndex];
  }

  $$('.portfolio-item', portfolioGrid).forEach(item => {
    item.addEventListener('click', () => {
      const imgSrc = item.querySelector('img').src;
      openLightbox(imgSrc);
    });
  });

  lightboxClose.addEventListener('click', closeLightbox);
  lightboxPrev.addEventListener('click', () => navigateLightbox(-1));
  lightboxNext.addEventListener('click', () => navigateLightbox(1));

  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) closeLightbox();
  });

  document.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('active')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') navigateLightbox(-1);
    if (e.key === 'ArrowRight') navigateLightbox(1);
  });

  /* --------------------------------------------------
     CONTACT FORM — FormSubmit.co (sends to email)
     -------------------------------------------------- */
  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const formData = new FormData(contactForm);
    const submitBtn = contactForm.querySelector('.btn-submit');
    submitBtn.textContent = 'SENDING...';
    submitBtn.disabled = true;

    fetch(contactForm.action, {
      method: 'POST',
      body: formData,
      headers: { 'Accept': 'application/json' }
    })
    .then(response => {
      if (response.ok) {
        contactForm.style.display = 'none';
        formSuccess.classList.add('show');
        contactForm.reset();
      } else {
        alert('Something went wrong. Please try again or email directly.');
      }
    })
    .catch(() => {
      alert('Something went wrong. Please try again or email directly.');
    })
    .finally(() => {
      submitBtn.textContent = 'SUBMIT';
      submitBtn.disabled = false;

      setTimeout(() => {
        contactForm.style.display = '';
        formSuccess.classList.remove('show');
      }, 6000);
    });
  });

  /* --------------------------------------------------
     SMOOTH SCROLL for nav links
     -------------------------------------------------- */
  $$('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        e.preventDefault();
        const navHeight = navbar.offsetHeight;
        const targetPos = target.getBoundingClientRect().top + window.scrollY - navHeight;
        window.scrollTo({ top: targetPos, behavior: 'smooth' });
      }
    });
  });

  /* --------------------------------------------------
     ACTIVE NAV LINK — highlight current section
     -------------------------------------------------- */
  const sections = $$('section[id]');
  const navLinksDesktop = $$('.nav-links a');

  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        navLinksDesktop.forEach(link => {
          link.style.opacity = link.getAttribute('href') === `#${id}` ? '0.5' : '';
        });
      }
    });
  }, { threshold: 0.3 });

  sections.forEach(sec => sectionObserver.observe(sec));

})();
