const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const multer = require('multer');

const app = express();

// 1. Use the hosting platform's port, or 3000 locally
const PORT = process.env.PORT || 3000;

// 2. CORS configuration (Allows your Netlify frontend to talk to Render)
app.use(cors({ 
  origin: true, // In production, you can change this to your Netlify URL later
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 3. Use an Environment Variable for the token (with a fallback for local)
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || 'rumyu-secure-admin-token-2026';

// Upload Setup
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);
app.use('/uploads', express.static(uploadDir));

const storage = multer.diskStorage({
  destination: function (req, file, cb) { cb(null, uploadDir); },
  filename: function (req, file, cb) { cb(null, Date.now() + path.extname(file.originalname)); }
});
const upload = multer({ storage: storage });

// Data Helpers
function readData(filename) {
  const filePath = path.join(__dirname, 'data', filename);
  try {
    if (!fs.existsSync(filePath)) { fs.writeFileSync(filePath, '[]', 'utf8'); return []; }
    return JSON.parse(fs.readFileSync(filePath, 'utf8') || '[]');
  } catch (err) { return []; }
}

function writeData(filename, data) {
  fs.writeFileSync(path.join(__dirname, 'data', filename), JSON.stringify(data, null, 2), 'utf8');
}

// Auth Middleware
function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (authHeader === `Bearer ${ADMIN_TOKEN}`) {
    next();
  } else {
    res.status(401).json({ error: 'Unauthorized. Please log in.' });
  }
}

// --- ROUTES ---
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  if (username === 'admin' && password === 'rumyu2024') {
    res.json({ success: true, token: ADMIN_TOKEN });
  } else {
    res.status(401).json({ error: 'Invalid credentials' });
  }
});

app.get('/api/:type', (req, res) => res.json(readData(`${req.params.type}.json`)));

// Dynamic URL generator for images (Handles both localhost and live Render URL)
function getBaseUrl(req) {
  return process.env.NODE_ENV === 'production' 
    ? `${req.protocol}://${req.get('host')}` 
    : `http://localhost:${PORT}`;
}

app.post('/api/gallery', requireAuth, upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No image uploaded' });
  const data = readData('gallery.json');
  
  // Use dynamic URL
  const imageUrl = `${getBaseUrl(req)}/uploads/${req.file.filename}`;
  
  const newItem = { id: Date.now(), url: imageUrl, caption: req.body.caption || '' };
  data.push(newItem);
  writeData('gallery.json', data);
  res.status(201).json({ success: true, data: newItem });
});

app.post('/api/leadership', requireAuth, upload.single('image'), (req, res) => {
  const data = readData('leadership.json');
  
  // Use dynamic URL
  const imageUrl = req.file ? `${getBaseUrl(req)}/uploads/${req.file.filename}` : '';

  const newItem = { 
    id: Date.now(), 
    name: req.body.name,
    position: req.body.position,
    bio: req.body.bio,
    photo: imageUrl 
  };
  data.push(newItem);
  writeData('leadership.json', data);
  res.status(201).json({ success: true, data: newItem });
});

app.post('/api/:type', requireAuth, (req, res) => {
  const type = req.params.type;
  const data = readData(`${type}.json`);
  const newItem = { id: Date.now(), ...req.body };
  if (type === 'news') newItem.date = new Date().toISOString().split('T')[0];
  data.push(newItem);
  writeData(`${type}.json`, data);
  res.status(201).json({ success: true, data: newItem });
});

app.delete('/api/:type/:id', requireAuth, (req, res) => {
  const type = req.params.type;
  const idParam = String(req.params.id); 
  let data = readData(`${type}.json`);
  const filteredData = data.filter(item => String(item.id) !== idParam);
  
  if (data.length === filteredData.length) return res.status(404).json({ error: 'Item not found' });
  
  writeData(`${type}.json`, filteredData);
  res.json({ success: true, message: 'Deleted successfully' });
});

app.listen(PORT, () => {
  console.log(`Backend running securely on port ${PORT}`);
});