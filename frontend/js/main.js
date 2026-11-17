// main.js - settings and small helper functions shared by every page.
// Load order on every page: api.js, main.js, navigation.js, then page scripts.

// ---------------------------------------------------------------
// SITE SETTINGS - edit these when the organisation confirms its details.
// Leave a value empty ('') to show the "to be added" placeholder.
// ---------------------------------------------------------------
const SITE = {
  email: '',          // e.g. 'info@example.org'
  phone: '',          // e.g. '+256 700 000000'
  location: '',       // e.g. 'Kampala, Uganda - meeting venue'
  social: { facebook: '', x: '', instagram: '', youtube: '', whatsapp: '' }, // full https:// links
  logo: { mark: 'R', name: 'RUMYU-UG', subtitle: 'Rumbek Youth Union \u2013 Uganda Chapter', imageUrl: '' } // imageUrl: '/assets/images/logo.png' to use a real logo
};

const FALLBACK_IMAGE = '/assets/images/ph-community.svg';

// Escape text before putting it inside HTML. This is what stops someone from
// injecting <script> tags through a form or an admin entry. ALWAYS use it for data.
function escapeHtml(value) {
  return String(value === undefined || value === null ? '' : value)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

// Only allow images from our own site or from https:// links.
function safeImage(url, fallback) {
  const text = String(url || '');
  if ((text.charAt(0) === '/' && text.charAt(1) !== '/') || text.indexOf('https://') === 0) {
    return text;
  }
  return fallback || FALLBACK_IMAGE;
}

// "2027-01-16" -> "16 Jan 2027". Adding T00:00:00 keeps the date in the visitor's own time zone.
function formatDate(isoDate) {
  const date = new Date(String(isoDate) + 'T00:00:00');
  if (isNaN(date.getTime())) {
    return '';
  }
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

function todayIso() {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return now.getFullYear() + '-' + month + '-' + day;
}

// Turn plain text with blank lines into <p> paragraphs (safely escaped).
function textToParagraphs(text) {
  return String(text || '').split(/\n\s*\n/).map(function (paragraph) {
    return '<p>' + escapeHtml(paragraph.trim()).replace(/\n/g, '<br>') + '</p>';
  }).join('');
}

// ---------- Loading / empty / error states ----------
function showLoading(container) {
  container.innerHTML = '<div class="loading" role="status"><div class="spinner"></div>Loading...</div>';
}

function showEmpty(container, message) {
  container.innerHTML = '<div class="empty">' + escapeHtml(message) + '</div>';
}

// Shows an error message with a "Try again" button that runs retryFunction.
function showError(container, message, retryFunction) {
  container.innerHTML = '<div class="error-box" role="alert"><p>' + escapeHtml(message) + '</p>' +
    (retryFunction ? '<button type="button" class="btn btn-outline-dark">Try again</button>' : '') + '</div>';
  if (retryFunction) {
    container.querySelector('button').addEventListener('click', retryFunction);
  }
}

// ---------- Toast notifications ----------
function showToast(message, type) {
  let region = document.getElementById('toast-region');
  if (!region) {
    region = document.createElement('div');
    region.id = 'toast-region';
    region.setAttribute('role', 'status');
    region.setAttribute('aria-live', 'polite');
    document.body.appendChild(region);
  }
  const toast = document.createElement('div');
  toast.className = 'toast ' + (type || 'info');
  toast.textContent = message;
  region.appendChild(toast);
  setTimeout(function () { toast.remove(); }, 4500);
}

// ---------- Scroll animation ----------
// Elements with class "reveal" fade in once when they scroll into view.
let revealObserver = null;
function observeReveal(root) {
  const elements = (root || document).querySelectorAll('.reveal:not(.visible)');
  if (!('IntersectionObserver' in window)) {
    elements.forEach(function (element) { element.classList.add('visible'); });
    return;
  }
  if (!revealObserver) {
    revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
  }
  elements.forEach(function (element) { revealObserver.observe(element); });
}

// Fill [data-site="email"] style placeholders from the SITE settings above.
function fillSiteDetails(root) {
  (root || document).querySelectorAll('[data-site]').forEach(function (element) {
    const key = element.getAttribute('data-site');
    const value = SITE[key];
    if (value) {
      element.textContent = value;
      if (key === 'email') { element.setAttribute('href', 'mailto:' + value); }
      if (key === 'phone') { element.setAttribute('href', 'tel:' + value.replace(/\s+/g, '')); }
    }
  });
}

// --- HERO SLIDER LOGIC ---
function initHeroSlider() {
  var slides = document.querySelectorAll('.hero-slide');
  if (slides.length === 0) return;

  var currentSlide = 0;
  
  function nextSlide() {
    // Remove active class from current slide
    slides[currentSlide].classList.remove('active');
    
    // Calculate next slide index
    currentSlide = (currentSlide + 1) % slides.length;
    
    // Add active class to next slide
    slides[currentSlide].classList.add('active');
  }

  // Change image every 5 seconds (5000ms)
  setInterval(nextSlide, 5000);
}

document.addEventListener('DOMContentLoaded', function () {
  observeReveal(document);
  initHeroSlider(); // <-- Added this line to run the slider
});
