const PUBLIC_API = 'http://localhost:3000/api';

document.addEventListener('DOMContentLoaded', function() {
  // Check which page we are on and load the right data
  if (document.getElementById('public-programs')) loadPrograms();
  if (document.getElementById('public-leadership')) loadLeadership();
  if (document.getElementById('public-news')) loadNewsAndEvents();
  if (document.getElementById('public-gallery')) loadGallery();
});

// --- 1. PROGRAMS ---
async function loadPrograms() {
  const container = document.getElementById('public-programs');
  try {
    const res = await fetch(`${PUBLIC_API}/programs`);
    const data = await res.json();
    
    if (data.length === 0) {
      container.innerHTML = '<p>No programs published yet. Please check back later.</p>';
      return;
    }

    container.innerHTML = data.map(item => `
      <div class="program-card reveal">
        <div class="program-image-placeholder">
          <span>Program Photo</span>
        </div>
        <div class="program-content">
          <h3>${item.title}</h3>
          <p>${item.description}</p>
        </div>
      </div>
    `).join('');
  } catch (err) {
    container.innerHTML = '<p>Failed to load programs. Please try again later.</p>';
  }
}

// --- 2. LEADERSHIP ---
async function loadLeadership() {
  const container = document.getElementById('public-leadership');
  if (!container) return; // Stop if we aren't on the leadership page

  try {
    const res = await fetch(`${PUBLIC_API}/leadership`);
    const data = await res.json();
    
    if (!Array.isArray(data) || data.length === 0) {
      container.innerHTML = '<p>Leadership profiles are being updated.</p>';
      return;
    }

    container.innerHTML = data.map(item => {
      // Check if a real photo exists, otherwise show placeholder
      let photoHTML = '';
      if (item.photo && item.photo !== '') {
        photoHTML = `<img src="${item.photo}" alt="${item.name}" style="width: 100%; height: 100%; object-fit: cover;">`;
      } else {
        photoHTML = `<span style="color: #8892b0;">Photo Pending</span>`;
      }

      return `
        <div class="leader-card reveal">
          <div class="leader-photo-placeholder" style="background: #060f1e; display: flex; align-items: center; justify-content: center; height: 280px; overflow: hidden;">
            ${photoHTML}
          </div>
          <div class="leader-info" style="padding: 1.5rem; text-align: center;">
            <h3 style="color: #e6f1ff; font-size: 1.3rem; margin-bottom: 0.25rem;">${item.name}</h3>
            <p class="leader-role" style="color: var(--gold); font-size: 0.85rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 1rem;">${item.position}</p>
            <p class="leader-bio" style="color: #a8b2d1; font-size: 0.95rem; line-height: 1.6;">${item.bio || 'Biography will be updated soon.'}</p>
          </div>
        </div>
      `;
    }).join('');
  } catch (err) {
    console.error(err);
    container.innerHTML = '<p>Failed to load leadership profiles. Make sure the backend is running.</p>';
  }
}

// --- 3. NEWS & EVENTS ---
async function loadNewsAndEvents() {
  const newsContainer = document.getElementById('public-news');
  const eventsContainer = document.getElementById('public-events');

  // Load News
  try {
    const res = await fetch(`${PUBLIC_API}/news`);
    const news = await res.json();
    allNewsData = news; // Save to global variable
    
    if (news.length === 0) {
      newsContainer.innerHTML = '<p>No news articles published yet.</p>';
    } else {
      newsContainer.innerHTML = news.map(item => `
        <article class="news-card reveal">
          <div class="news-image-placeholder">
            <span>News Image</span>
          </div>
          <div class="news-content">
            <div class="news-meta">
              <span class="news-date">${item.date || 'Recent'}</span> &bull; <span class="news-category">${item.category}</span>
            </div>
            <h3>${item.title}</h3>
            <p>${item.content.substring(0, 100)}...</p>
            <!-- Changed href to a button that triggers the modal -->
            <button onclick="openNewsModal('${item.id}')" class="read-more-btn">Read More &rarr;</button>
          </div>
        </article>
      `).join('');
    }
  } catch (err) { newsContainer.innerHTML = '<p>Failed to load news.</p>'; }

  // Load Events (Keep this exactly as it was)
  try {
    const res = await fetch(`${PUBLIC_API}/events`);
    const events = await res.json();
    
    if (events.length === 0) {
      eventsContainer.innerHTML = '<p>No upcoming events scheduled at this time.</p>';
    } else {
      eventsContainer.innerHTML = events.map(item => {
        let month = 'TBC';
        let day = '--';
        if (item.date) {
          const d = new Date(item.date);
          if (!isNaN(d)) {
            month = d.toLocaleString('default', { month: 'short' }).toUpperCase();
            day = d.getDate();
          }
        }
        
        return `
          <div class="event-card reveal">
            <div class="event-date-box">
              <span class="event-month">${month}</span>
              <span class="event-day">${day}</span>
            </div>
            <div class="event-details">
              <h3>${item.title}</h3>
              <p class="event-meta">&#128205; ${item.location} &bull; &#128336; Time TBC</p>
              <p>${item.description || 'More details coming soon.'}</p>
            </div>
          </div>
        `;
      }).join('');
    }
  } catch (err) { eventsContainer.innerHTML = '<p>Failed to load events.</p>'; }
}

// --- NEW: MODAL LOGIC FOR NEWS ---
function openNewsModal(id) {
  // Find the article with the matching ID
  const article = allNewsData.find(item => String(item.id) === String(id));
  if (!article) return;

  // Populate the modal
  document.getElementById('modalNewsCategory').textContent = article.category || 'News';
  document.getElementById('modalNewsTitle').textContent = article.title;
  document.getElementById('modalNewsDate').textContent = 'Published on ' + (article.date || 'Recent');
  
  // Convert line breaks in the content to HTML paragraphs for better reading
  const formattedContent = (article.content || '').split('\n\n').map(para => `<p>${para}</p>`).join('');
  document.getElementById('modalNewsContent').innerHTML = formattedContent;

  // Show the modal
  document.getElementById('newsModal').classList.add('active');
  document.body.style.overflow = 'hidden'; // Prevent background scrolling
}

function closeNewsModal() {
  document.getElementById('newsModal').classList.remove('active');
  document.body.style.overflow = 'auto'; // Restore scrolling
}

// Close modal if clicking outside the content box
document.getElementById('newsModal').addEventListener('click', function(e) {
  if (e.target === this) closeNewsModal();
});
// --- 4. GALLERY ---
async function loadGallery() {
  const container = document.getElementById('public-gallery');
  try {
    const res = await fetch(`${PUBLIC_API}/gallery`);
    const data = await res.json();
    
    if (data.length === 0) {
      container.innerHTML = '<p>No images in the gallery yet.</p>';
      return;
    }

    // We use item.url which points to the backend /uploads folder
    container.innerHTML = data.map(item => `
      <div class="gallery-item reveal">
        <img src="${item.url}" alt="${item.caption || 'RUMYU-UG Photo'}" style="width: 100%; height: 250px; object-fit: cover;">
        <p class="gallery-caption">${item.caption || ''}</p>
      </div>
    `).join('');
  } catch (err) {
    container.innerHTML = '<p>Failed to load gallery.</p>';
  }
}