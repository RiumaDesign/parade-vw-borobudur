/**
 * PARADE VW SAFARI BOROBUDUR 2026 - OFFICIAL EVENT PORTAL
 * Interactive Logic: Lightbox, Tabs, Dynamic Sponsor Background Color, Mobile Dock
 */

// Official WhatsApp Admin Contact
const ADMIN_PHONE = '6282138800401';

// DOM Elements Initialization
document.addEventListener('DOMContentLoaded', () => {
  purgeLegacyTickerContact();
  initNavbarScroll();
  initMobileMenu();
  initDockNavigation();
  initSponsorBackgroundAdapter();
});

window.addEventListener('load', () => {
  purgeLegacyTickerContact();
  initSponsorBackgroundAdapter();
});

// Purge any cached contact box in ticker
function purgeLegacyTickerContact() {
  document.querySelectorAll('.ticker-box').forEach(box => {
    const text = (box.textContent || '').toUpperCase();
    if (text.includes('KONTAK PANITIA') || text.includes('PINKY') || text.includes('0401')) {
      const prev = box.previousElementSibling;
      if (prev && prev.classList.contains('ticker-divider')) prev.remove();
      box.remove();
    }
  });
}

// Dynamic Sponsor Slot Background Color Adapter
function initSponsorBackgroundAdapter() {
  const slots = document.querySelectorAll('.sponsor-brand-slot.has-logo');
  
  slots.forEach(slot => {
    const img = slot.querySelector('img');
    if (!img) return;

    function detectAndApplyColor() {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        const w = img.naturalWidth || img.width || 120;
        const h = img.naturalHeight || img.height || 80;
        if (w === 0 || h === 0) return;

        canvas.width = w;
        canvas.height = h;
        ctx.drawImage(img, 0, 0, w, h);

        // Sample 4 edge corners (top-left, top-right, bottom-left, bottom-right)
        const corners = [
          ctx.getImageData(2, 2, 1, 1).data,
          ctx.getImageData(Math.max(1, w - 3), 2, 1, 1).data,
          ctx.getImageData(2, Math.max(1, h - 3), 1, 1).data,
          ctx.getImageData(Math.max(1, w - 3), Math.max(1, h - 3), 1, 1).data
        ];

        let totalR = 0, totalG = 0, totalB = 0, validSamples = 0;
        corners.forEach(p => {
          if (p[3] > 20) { // non-transparent
            totalR += p[0];
            totalG += p[1];
            totalB += p[2];
            validSamples++;
          }
        });

        if (validSamples > 0) {
          const r = Math.round(totalR / validSamples);
          const g = Math.round(totalG / validSamples);
          const b = Math.round(totalB / validSamples);
          slot.style.backgroundColor = `rgb(${r}, ${g}, ${b})`;
          
          const luminance = (0.299 * r + 0.587 * g + 0.114 * b);
          if (luminance > 200) {
            slot.style.borderColor = 'rgba(212, 175, 55, 0.45)';
          } else {
            slot.style.borderColor = 'rgba(212, 175, 55, 0.3)';
          }
        }
      } catch (err) {
        // graceful fallback if canvas is restricted
      }
    }

    if (img.complete && img.naturalWidth > 0) {
      detectAndApplyColor();
    } else {
      img.addEventListener('load', detectAndApplyColor);
    }
  });
}

// Mobile menu toggle
function initMobileMenu() {
  const mobileToggle = document.getElementById('mobileToggle');
  const navLinks = document.getElementById('navLinks');
  if (mobileToggle && navLinks) {
    mobileToggle.addEventListener('click', () => {
      navLinks.classList.toggle('active');
    });
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
      const sectionTop = section.offsetTop - 140;
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
