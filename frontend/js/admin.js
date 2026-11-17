const API_BASE = 'http://localhost:3000/api';

function getAuthToken() {
  return localStorage.getItem('rumyuAdminToken');
}

document.addEventListener('DOMContentLoaded', function() {
  
  // --- 1. LOGIN LOGIC ---
  var loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      var username = document.getElementById('username').value.trim();
      var password = document.getElementById('password').value;
      var msgBox = loginForm.querySelector('.form-message');
      
      // Clear any old broken tokens before logging in
      localStorage.removeItem('rumyuAdminToken');

      try {
        const res = await fetch(`${API_BASE}/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password })
        });

        const data = await res.json();

        if (res.ok && data.token) {
          localStorage.setItem('rumyuAdminToken', data.token);
          window.location.href = 'dashboard.html';
        } else {
          showMessage(msgBox, 'error', 'Invalid credentials');
        }
      } catch (err) {
        showMessage(msgBox, 'error', 'Could not connect to server.');
      }
    });
  }

  // --- 2. DASHBOARD LOGIC ---
  if (window.location.pathname.includes('dashboard.html') && !getAuthToken()) {
    window.location.href = 'login.html';
    return;
  }

  var sidebarBtns = document.querySelectorAll('.admin-nav-btn');
  var sections = document.querySelectorAll('.admin-section');
  var logoutBtn = document.getElementById('logoutBtn');

  if (sidebarBtns.length > 0) {
    sidebarBtns.forEach(function(btn) {
      btn.addEventListener('click', function() {
        sidebarBtns.forEach(function(b) { b.classList.remove('active'); });
        btn.classList.add('active');
        sections.forEach(function(s) { s.classList.remove('active'); });
        
        var targetId = btn.getAttribute('data-target');
        document.getElementById(targetId).classList.add('active');

        if (targetId === 'section-overview') loadStats();
        if (targetId === 'section-news') loadTableData('news');
        if (targetId === 'section-events') loadTableData('events');
        if (targetId === 'section-leadership') loadTableData('leadership');
        if (targetId === 'section-programs') loadTableData('programs');
        if (targetId === 'section-gallery') loadTableData('gallery');
        if (targetId === 'section-membership') loadListData('membership');
        if (targetId === 'section-contact') loadListData('contact');
        if (targetId === 'section-support') loadListData('support');
      });
    });
    loadStats();
  }

  if (logoutBtn) {
    logoutBtn.addEventListener('click', function() { 
      localStorage.removeItem('rumyuAdminToken');
      window.location.href = 'login.html'; 
    });
  }
});

// --- FETCH DATA (Requires no auth) ---
async function loadStats() {
  try {
    const news = await (await fetch(`${API_BASE}/news`)).json();
    const events = await (await fetch(`${API_BASE}/events`)).json();
    const mem = await (await fetch(`${API_BASE}/membership`)).json();
    const con = await (await fetch(`${API_BASE}/contact`)).json();
    
    if(document.getElementById('stat-news')) {
      document.getElementById('stat-news').textContent = news.length || 0;
      document.getElementById('stat-events').textContent = events.length || 0;
      document.getElementById('stat-membership').textContent = mem.length || 0;
      document.getElementById('stat-contact').textContent = con.length || 0;
    }
  } catch (err) { console.log('Backend not running'); }
}

async function loadTableData(type) {
  const tbody = document.getElementById(`table-${type}`);
  if (!tbody) return;
  tbody.innerHTML = `<tr><td colspan="4" class="text-center">Loading...</td></tr>`;
  
  try {
    const res = await fetch(`${API_BASE}/${type}`);
    const data = await res.json();
    
    if (!Array.isArray(data) || data.length === 0) {
      tbody.innerHTML = `<tr><td colspan="4" class="text-center">No records found.</td></tr>`;
      return;
    }

    tbody.innerHTML = data.reverse().map(item => {
      let cols = '';
      if (type === 'news') cols = `<td>${item.title || ''}</td><td>${item.date || 'N/A'}</td><td>${item.category || ''}</td>`;
      if (type === 'events') cols = `<td>${item.title || ''}</td><td>${item.date || ''}</td><td>${item.location || ''}</td>`;
      if (type === 'leadership') {
        const photo = item.photo ? `<img src="${item.photo}" style="height: 40px; width: 40px; border-radius: 50%; object-fit: cover;">` : 'No Photo';
        cols = `<td>${photo}</td><td>${item.name || ''}</td><td>${item.position || ''}</td>`;
      }
      if (type === 'programs') cols = `<td>${item.title || ''}</td><td>${String(item.description || '').substring(0, 50)}...</td>`;
      if (type === 'gallery') cols = `<td><img src="${item.url}" style="height: 40px; border-radius: 4px;"></td><td>${item.caption || ''}</td>`;
      
      return `<tr>${cols}<td><button type="button" class="btn-sm btn-delete" onclick="deleteItem('${type}', '${item.id}')">Delete</button></td></tr>`;
    }).join('');
  } catch (err) { 
    tbody.innerHTML = `<tr><td colspan="4" class="text-center" style="color:red">Error loading data</td></tr>`; 
  }
}

async function loadListData(type) {
  const list = document.getElementById(`list-${type}`);
  if (!list) return;
  list.innerHTML = '<p>Loading...</p>';
  
  try {
    const res = await fetch(`${API_BASE}/${type}`);
    const data = await res.json();
    
    if (!Array.isArray(data) || data.length === 0) { list.innerHTML = '<p>No records found.</p>'; return; }

    list.innerHTML = data.reverse().map(item => {
      if (type === 'membership') {
        return `<div class="admin-data-card"><h4>${item.fullName || 'Unknown'}</h4><p><strong>Email:</strong> ${item.email || 'N/A'} | <strong>Phone:</strong> ${item.telephone || 'N/A'}</p><p><strong>Location:</strong> ${item.country || 'N/A'} (${item.residence || 'N/A'})</p><p><strong>Message:</strong> ${item.message || 'None'}</p></div>`;
      } else if (type === 'support') {
        return `<div class="admin-data-card" style="border-left: 4px solid var(--admin-gold);"><h4>${item.name || 'Unknown'}</h4><p><strong>Support Type:</strong> <span style="color: var(--admin-gold); font-weight: bold;">${item.type || 'N/A'}</span></p><p><strong>Email:</strong> ${item.email || 'N/A'} | <strong>Phone:</strong> ${item.phone || 'N/A'}</p><p><strong>Message:</strong> ${item.message || 'None'}</p></div>`;
      } else {
        return `<div class="admin-data-card"><h4>${item.name || 'Unknown'}</h4><p><strong>Email:</strong> ${item.email || 'N/A'}</p><p><strong>Message:</strong> ${item.message || 'None'}</p></div>`;
      }
    }).join('');
  } catch (err) { list.innerHTML = '<p style="color:red">Error loading data</p>'; }
}

// --- AUTHENTICATED ACTIONS ---

async function deleteItem(type, id) {
  if(!confirm('Are you sure you want to delete this item? This cannot be undone.')) return;
  
  try {
    const res = await fetch(`${API_BASE}/${type}/${id}`, { 
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${getAuthToken()}` }
    });
    
    if (res.ok) {
      loadTableData(type); 
      loadStats(); 
    } else if (res.status === 401) {
      localStorage.removeItem('rumyuAdminToken'); // Clear broken token
      window.location.href = 'login.html';
    } else {
      alert('Error: The server could not delete the item.');
    }
  } catch (err) {
    alert('Error: Could not connect to the backend server.');
  }
}

let currentFormType = '';

function openModal(type) {
  currentFormType = type;
  document.getElementById('modal-overlay').style.display = 'flex';
  document.getElementById('modal-title').textContent = `Add ${type.charAt(0).toUpperCase() + type.slice(1)}`;
  
  document.querySelectorAll('.form-section').forEach(el => el.style.display = 'none');
  document.getElementById(`form-${type}`).style.display = 'block';
}

function closeModal() {
  document.getElementById('modal-overlay').style.display = 'none';
  document.getElementById('modal-form').reset();
}

var modalForm = document.getElementById('modal-form');
if (modalForm) {
  modalForm.addEventListener('submit', async function(e) {
    e.preventDefault(); 
    
    let fetchOptions = { 
      method: 'POST', 
      headers: { 'Authorization': `Bearer ${getAuthToken()}` }
    };

    if (currentFormType === 'gallery' || currentFormType === 'leadership') {
      const formData = new FormData();
      
      if (currentFormType === 'gallery') {
        const fileInput = document.getElementById('gallery-image');
        if (!fileInput || !fileInput.files[0]) return alert('Please select an image file.');
        formData.append('image', fileInput.files[0]);
        formData.append('caption', document.getElementById('gallery-caption').value);
      } else if (currentFormType === 'leadership') {
        formData.append('name', document.getElementById('leader-name').value);
        formData.append('position', document.getElementById('leader-position').value);
        formData.append('bio', document.getElementById('leader-bio').value);
        const fileInput = document.getElementById('leader-image');
        if (fileInput && fileInput.files[0]) formData.append('image', fileInput.files[0]);
      }
      fetchOptions.body = formData;

    } else {
      let payload = {};
      if (currentFormType === 'news') {
        payload = { title: document.getElementById('news-title').value, category: document.getElementById('news-category').value, content: document.getElementById('news-content').value };
      } else if (currentFormType === 'events') {
        payload = { title: document.getElementById('event-title').value, date: document.getElementById('event-date').value, location: document.getElementById('event-location').value, description: document.getElementById('event-desc').value };
      } else if (currentFormType === 'programs') {
        payload = { title: document.getElementById('program-title').value, description: document.getElementById('program-desc').value };
      }
      fetchOptions.headers['Content-Type'] = 'application/json';
      fetchOptions.body = JSON.stringify(payload);
    }

    try {
      const res = await fetch(`${API_BASE}/${currentFormType}`, fetchOptions);
      
      if (res.ok) {
        closeModal();
        loadTableData(currentFormType);
        loadStats();
      } else if (res.status === 401) {
        localStorage.removeItem('rumyuAdminToken'); // Clear broken token
        alert('Your session expired. Please log in again.');
        window.location.href = 'login.html';
      } else {
        alert('Error saving data.');
      }
    } catch (err) { 
      alert('Could not connect to backend server.'); 
    }
  });
}

function showMessage(el, type, text) {
  if(!el) return;
  el.className = 'form-message ' + type;
  el.textContent = text;
  el.style.display = 'block';
}