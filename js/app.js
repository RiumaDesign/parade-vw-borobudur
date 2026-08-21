/**
 * PARADE VW SAFARI BOROBUDUR 2026 - OFFICIAL EVENT HUB & PORTAL
 * Interactive Logic: Lightbox, Tabs, Posters & Smooth Mobile Navigation
 */

// Official WhatsApp Admin Contact
const ADMIN_PHONE = '6282138800401';

// DOM Elements Initialization
document.addEventListener('DOMContentLoaded', () => {
  initNavbarScroll();
  initMobileMenu();
  initDockNavigation();
});

// Mobile menu toggle
function initMobileMenu() {
  const mobileToggle = document.getElementById('mobileToggle');
  const navLinks = document.getElementById('navLinks');
  if (mobileToggle && navLinks) {
    mobileToggle.addEventListener('click', () => {
      navLinks.classList.toggle('active');
    });
    // Close on link click
    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => navLinks.classList.remove('active'));
    });
  }
}

// Switch Hero Poster Preview
function switchHeroPoster(src, btn) {
  const mainPoster = document.getElementById('heroMainPoster');
  if (mainPoster && src) {
    mainPoster.src = src;
  }
  const wrapper = document.querySelector('.main-poster-wrapper');
  if (wrapper) {
    wrapper.setAttribute('onclick', `openLightbox('${src}')`);
  }
  document.querySelectorAll('.poster-tab-btn').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
}

// Switch Merchandise Photoshoot Showcase
function switchMerchPhoto(src, btn) {
  const mainImg = document.getElementById('merchMainImg');
  if (mainImg && src) {
    mainImg.src = src;
  }
  document.querySelectorAll('#merchThumbsRow .thumb-btn').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
}

// Lightbox Fullscreen Preview Functions
function openLightbox(imgSrc) {
  const modal = document.getElementById('lightboxModal');
  const img = document.getElementById('lightboxImg');
  if (modal && img && imgSrc) {
    img.src = imgSrc;
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
}

function closeLightbox() {
  const modal = document.getElementById('lightboxModal');
  if (modal) {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }
}

// Navbar Scroll Effect
function initNavbarScroll() {
  const navbar = document.getElementById('navbar');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  });
}

// Mobile Bottom Dock Active Indicator
function initDockNavigation() {
  const sections = document.querySelectorAll('section[id], footer[id]');
  const dockItems = document.querySelectorAll('.dock-item');

  window.addEventListener('scroll', () => {
    let current = '';
    sections.forEach(section => {
      const sectionTop = section.offsetTop - 120;
      if (window.scrollY >= sectionTop) {
        current = section.getAttribute('id');
      }
    });

    dockItems.forEach(item => {
      item.classList.remove('active');
      const href = item.getAttribute('href');
      if (href && href === `#${current}`) {
        item.classList.add('active');
      }
    });
  });
}

// Toast Notification Display
function showToast(message) {
  const toast = document.getElementById('toastNotification');
  const msgEl = document.getElementById('toastMsg');
  if (!toast || !msgEl) return;

  msgEl.innerText = message;
  toast.classList.add('active');

  setTimeout(() => {
    toast.classList.remove('active');
  }, 3200);
}
