// gallery.js - photo grid, category filter and lightbox. Works on gallery.html and index.html.

let galleryItems = [];     // every image from the server
let visibleItems = [];     // images currently shown (after the category filter)
let lightboxIndex = 0;
let lightbox = null;       // the <dialog> element, created the first time it is needed

function galleryItemHtml(item, index) {
  return '<button type="button" class="gallery-item reveal" data-index="' + index + '" aria-label="Open image: ' + escapeHtml(item.title) + '">' +
    '<img src="' + escapeHtml(safeImage(item.image)) + '" alt="' + escapeHtml(item.title) + '" loading="lazy">' +
    '<span>' + escapeHtml(item.title) + '</span></button>';
}

function renderGalleryGrid(container, items) {
  visibleItems = items;
  if (items.length === 0) { showEmpty(container, 'No images in this category yet.'); return; }
  container.innerHTML = items.map(galleryItemHtml).join('');
  observeReveal(container);
}

// ---------- Lightbox ----------
function createLightbox() {
  lightbox = document.createElement('dialog');
  lightbox.id = 'lightbox';
  lightbox.setAttribute('aria-label', 'Image viewer');
  lightbox.innerHTML = '<div class="dialog-body"><button type="button" class="dialog-close" aria-label="Close">&times;</button>' +
    '<img id="lightbox-image" src="" alt=""><p id="lightbox-caption"></p>' +
    '<div class="lightbox-nav"><button type="button" class="btn btn-outline" id="lightbox-prev">Previous</button>' +
    '<button type="button" class="btn btn-outline" id="lightbox-next">Next</button></div></div>';
  document.body.appendChild(lightbox);
  lightbox.querySelector('.dialog-close').addEventListener('click', function () { lightbox.close(); });
  lightbox.addEventListener('click', function (event) { if (event.target === lightbox) { lightbox.close(); } });
  document.getElementById('lightbox-prev').addEventListener('click', function () { showLightboxImage(lightboxIndex - 1); });
  document.getElementById('lightbox-next').addEventListener('click', function () { showLightboxImage(lightboxIndex + 1); });
  lightbox.addEventListener('keydown', function (event) {
    if (event.key === 'ArrowLeft') { showLightboxImage(lightboxIndex - 1); }
    if (event.key === 'ArrowRight') { showLightboxImage(lightboxIndex + 1); }
  });
}

function showLightboxImage(index) {
  if (visibleItems.length === 0) { return; }
  // The % trick wraps around: after the last image comes the first one again.
  lightboxIndex = (index + visibleItems.length) % visibleItems.length;
  const item = visibleItems[lightboxIndex];
  const image = document.getElementById('lightbox-image');
  image.src = safeImage(item.image);
  image.alt = item.title;
  document.getElementById('lightbox-caption').textContent = item.title + (item.caption ? ' - ' + item.caption : '');
}

function openLightbox(index) {
  if (!lightbox) { createLightbox(); }
  showLightboxImage(index);
  lightbox.showModal();
}

function setupGalleryClicks(container) {
  container.addEventListener('click', function (event) {
    const button = event.target.closest('.gallery-item');
    if (button) { openLightbox(Number(button.dataset.index)); }
  });
}

function renderCategoryFilters(container, grid) {
  const categories = galleryItems.map(function (i) { return i.category; }).filter(function (c, i, list) { return list.indexOf(c) === i; });
  const names = ['All'].concat(categories);
  container.innerHTML = names.map(function (name, i) {
    return '<button type="button" class="chip" aria-pressed="' + (i === 0) + '" data-category="' + escapeHtml(name) + '">' + escapeHtml(name) + '</button>';
  }).join('');
  container.addEventListener('click', function (event) {
    const chip = event.target.closest('.chip');
    if (!chip) { return; }
    container.querySelectorAll('.chip').forEach(function (other) { other.setAttribute('aria-pressed', String(other === chip)); });
    const category = chip.dataset.category;
    renderGalleryGrid(grid, category === 'All' ? galleryItems : galleryItems.filter(function (i) { return i.category === category; }));
  });
}

function loadGallery() {
  const pageGrid = document.getElementById('gallery-grid');
  const homeGrid = document.getElementById('home-gallery');
  const container = pageGrid || homeGrid;
  if (!container) { return; }

  showLoading(container);
  apiGet('/gallery').then(function (items) {
    galleryItems = items;
    if (items.length === 0) { showEmpty(container, 'No photographs have been added yet.'); return; }
    if (pageGrid) {
      renderCategoryFilters(document.getElementById('gallery-filters'), pageGrid);
      renderGalleryGrid(pageGrid, items);
    } else {
      renderGalleryGrid(homeGrid, items.slice(0, 6));
    }
    setupGalleryClicks(container);
  }).catch(function (error) {
    showError(container, error.message, loadGallery);
  });
}

document.addEventListener('DOMContentLoaded', loadGallery);
