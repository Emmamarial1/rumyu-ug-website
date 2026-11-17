document.addEventListener('DOMContentLoaded', function() {
  injectHeader();
  injectFooter();
});

function injectHeader() {
  var headerDiv = document.getElementById('site-header');
  if(!headerDiv) return;

  var path = window.location.pathname.split('/').pop() || 'index.html';

  function isActive(page) {
    return path === page ? 'class="active"' : '';
  }

  headerDiv.innerHTML = `
    <header class="site-header">
      <div class="container header-inner">
        <a href="index.html" class="logo" aria-label="RUMYU-UG Home">
          
          <img src="assets/images/logo.jpg" alt="RUMYU-UG Logo" style="height: 50px; width: auto; object-fit: contain;">
          
          <div class="logo-text">
            <span class="logo-title">RUMYU-UG</span>
            <span class="logo-subtitle">Rumbek Youths Union in Uganda</span>
          </div>
        </a>
        <button class="nav-toggle" id="navToggle" aria-label="Toggle navigation">
          <span class="hamburger"></span>
        </button>
        <nav class="main-nav" id="mainNav">
          <ul>
            <li><a href="index.html" ${isActive('index.html')}>Home</a></li>
            <li><a href="about.html" ${isActive('about.html')}>About Us</a></li>
            <li><a href="programs.html" ${isActive('programs.html')}>Programs</a></li>
            <li><a href="leadership.html" ${isActive('leadership.html')}>Leadership</a></li>
            <li><a href="news.html" ${isActive('news.html')}>News & Events</a></li>
            <li><a href="support.html" ${isActive('support.html')}>Support Us</a></li>
            <li><a href="contact.html" class="nav-cta ${isActive('contact.html')}">Contact Us</a></li>
          </ul>
        </nav>
      </div>
    </header>
  `;

  var style = document.createElement('style');
  style.innerHTML = `
    .site-header { position: sticky; top: 0; z-index: 1000; background: rgba(10, 25, 47, 0.95); backdrop-filter: blur(10px); border-bottom: 1px solid #112240; }
    .header-inner { display: flex; align-items: center; justify-content: space-between; min-height: 80px; }
    .logo { display: flex; align-items: center; gap: 0.75rem; text-decoration: none; }
    .logo-text { display: flex; flex-direction: column; }
    .logo-title { font-weight: 700; color: #fff; font-size: 1.2rem; line-height: 1.1; }
    .logo-subtitle { font-size: 0.7rem; color: var(--gold); }
    .main-nav ul { list-style: none; display: flex; align-items: center; gap: 1.5rem; margin: 0; padding: 0; }
    .main-nav a { text-decoration: none; color: #ccd6f6; font-size: 0.9rem; font-weight: 500; transition: color 0.2s; }
    .main-nav a:hover, .main-nav a.active { color: var(--gold); }
    .nav-cta { background: var(--gold); color: #0a192f !important; padding: 0.6rem 1.2rem !important; border-radius: 6px; font-weight: 700; }
    .nav-toggle { display: none; background: none; border: 0; cursor: pointer; }
    @media (max-width: 992px) {
      .nav-toggle { display: block; }
      .main-nav { display: none; position: absolute; top: 80px; left: 0; right: 0; background: #112240; padding: 1rem; box-shadow: 0 4px 10px rgba(0,0,0,0.5); border-bottom: 1px solid #233554; }
      .main-nav.open { display: block; }
      .main-nav ul { flex-direction: column; align-items: stretch; gap: 0.5rem; }
      .main-nav a { display: block; padding: 0.8rem; border-bottom: 1px solid #233554; }
    }
  `;
  document.head.appendChild(style);

  var toggleBtn = document.getElementById('navToggle');
  var navMenu = document.getElementById('mainNav');
  if(toggleBtn && navMenu) {
    toggleBtn.addEventListener('click', function() {
      navMenu.classList.toggle('open');
    });
  }
}

function injectFooter() {
  var footerDiv = document.getElementById('site-footer');
  if(!footerDiv) return;
  
  footerDiv.innerHTML = `
    <footer class="site-footer">
      <div class="container footer-grid">
        <div class="footer-brand">
          <div class="logo" style="margin-bottom: 1rem; align-items: center;">
            <img src="assets/images/logo.jpg" alt="RUMYU-UG Logo" style="height: 50px; width: auto; object-fit: contain; background: #fff; padding: 5px; border-radius: 6px;">
            <div class="logo-text" style="margin-left: 0.5rem;">
              <span class="logo-title" style="color: #fff;">RUMYU-UG</span>
            </div>
          </div>
          <p class="footer-desc" style="color: rgba(255,255,255,0.6); font-size: 0.9rem; margin-top: 1rem;">
            Rumbek Youth Union – Uganda Chapter.<br>
            United in Purpose. Stronger Together.
          </p>
        </div>
        
        <div class="footer-links">
          <h4 style="color: #fff; margin-bottom: 1rem; font-size: 1rem;">Quick Links</h4>
          <ul style="list-style: none; padding: 0;">
            <li style="margin-bottom: 0.5rem;"><a href="about.html" style="color: rgba(255,255,255,0.7); text-decoration: none; font-size: 0.9rem;">About Us</a></li>
            <li style="margin-bottom: 0.5rem;"><a href="leadership.html" style="color: rgba(255,255,255,0.7); text-decoration: none; font-size: 0.9rem;">Leadership</a></li>
            <li style="margin-bottom: 0.5rem;"><a href="programs.html" style="color: rgba(255,255,255,0.7); text-decoration: none; font-size: 0.9rem;">Programs</a></li>
            <li style="margin-bottom: 0.5rem;"><a href="support.html" style="color: rgba(255,255,255,0.7); text-decoration: none; font-size: 0.9rem;">Support Us</a></li>
          </ul>
        </div>
        
        <div class="footer-links">
          <h4 style="color: #fff; margin-bottom: 1rem; font-size: 1rem;">Resources</h4>
          <ul style="list-style: none; padding: 0;">
            <li style="margin-bottom: 0.5rem;"><a href="news.html" style="color: rgba(255,255,255,0.7); text-decoration: none; font-size: 0.9rem;">News & Events</a></li>
            <li style="margin-bottom: 0.5rem;"><a href="gallery.html" style="color: rgba(255,255,255,0.7); text-decoration: none; font-size: 0.9rem;">Gallery</a></li>
            <li style="margin-bottom: 0.5rem;"><a href="contact.html" style="color: rgba(255,255,255,0.7); text-decoration: none; font-size: 0.9rem;">Contact</a></li>
            <li style="margin-bottom: 0.5rem;"><a href="admin/login.html" style="color: #D6AD55; text-decoration: none; font-size: 0.9rem;">Admin Login</a></li>
          </ul>
        </div>
        
        <div class="footer-contact">
          <h4 style="color: #fff; margin-bottom: 1rem; font-size: 1rem;">Contact & Follow Us</h4>
          <p style="color: rgba(255,255,255,0.7); font-size: 0.9rem; margin-bottom: 0.5rem;">Email: <a href="mailto:rumyu06@gmail.com" style="color: var(--gold); text-decoration: none;">rumyu06@gmail.com</a></p>
          <p style="color: rgba(255,255,255,0.7); font-size: 0.9rem; margin-bottom: 0.5rem;">Phone: <a href="tel:+25672713764" style="color: var(--gold); text-decoration: none;">+256 727 137 64</a></p>
          <p style="color: rgba(255,255,255,0.7); font-size: 0.9rem; margin-bottom: 1rem;">Location: Kampala, Uganda</p>
          
          <!-- SOCIAL MEDIA LINKS -->
          <div style="display: flex; gap: 1rem; margin-top: 1rem;">
            <a href="https://www.youtube.com/@rumbekyouthunioninugandaru5294" target="_blank" style="background: #112240; border: 1px solid #233554; padding: 0.5rem 1rem; border-radius: 6px; color: #fff; text-decoration: none; font-size: 0.85rem; display: flex; align-items: center; gap: 0.5rem; transition: border-color 0.2s;">
              ▶️ YouTube
            </a>
            <a href="https://www.facebook.com/" target="_blank" style="background: #112240; border: 1px solid #233554; padding: 0.5rem 1rem; border-radius: 6px; color: #fff; text-decoration: none; font-size: 0.85rem; display: flex; align-items: center; gap: 0.5rem; transition: border-color 0.2s;">
              f Facebook
            </a>
          </div>
        </div>
      </div>
      
      <div class="footer-bottom" style="border-top: 1px solid rgba(255,255,255,0.1); padding: 1.5rem 0; margin-top: 2rem;">
        <div class="container" style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;">
          <p style="color: rgba(255,255,255,0.6); font-size: 0.85rem; margin: 0;">&copy; ${new Date().getFullYear()} Rumbek Youth Union – Uganda Chapter. All rights reserved.</p>
        </div>
      </div>
    </footer>
  `;
}