// routes/index.js - every API URL lives here, so it is the "map" of the backend.
const path = require('path');
const crypto = require('crypto');
const express = require('express');
const multer = require('multer');
const rateLimit = require('express-rate-limit');

const store = require('../services/jsonStore');
const { resources, submissions } = require('../utils/schemas');
const { requireAdmin, requireFetchHeader } = require('../middleware/auth');
const { createResourceController } = require('../controllers/resourceController');
const { createSubmissionController } = require('../controllers/submissionController');
const auth = require('../controllers/authController');

const router = express.Router();
router.use(requireFetchHeader);

// ---------- Rate limits (slow down guessing and spam) ----------
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, limit: 10, standardHeaders: true, legacyHeaders: false,
  message: { error: 'Too many login attempts. Please wait 15 minutes and try again.' }
});
const formLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, limit: 10, standardHeaders: true, legacyHeaders: false,
  message: { error: 'Too many submissions from this connection. Please try again later.' }
});

// ---------- Authentication ----------
router.post('/auth/login', loginLimiter, auth.login);
router.post('/auth/logout', auth.logout);
router.get('/auth/me', requireAdmin, auth.me);

// ---------- Content: news, events, leadership, programs, gallery, branches ----------
// GET is public. POST / PUT / DELETE need an administrator.
Object.keys(resources).forEach(function (name) {
  const controller = createResourceController(resources[name]);
  router.get('/' + name, controller.list);
  router.get('/' + name + '/:id', controller.getOne);
  router.post('/' + name, requireAdmin, controller.create);
  router.put('/' + name + '/:id', requireAdmin, controller.update);
  router.delete('/' + name + '/:id', requireAdmin, controller.remove);
});

// ---------- Visitor forms ----------
Object.keys(submissions).forEach(function (name) {
  const controller = createSubmissionController(submissions[name]);
  router.post('/' + name, formLimiter, controller.create);                       // public
  router.get('/admin/' + name, requireAdmin, controller.list);                   // admin only
  router.patch('/admin/' + name + '/:id', requireAdmin, controller.setStatus);
  router.delete('/admin/' + name + '/:id', requireAdmin, controller.remove);
});

// ---------- Admin helpers ----------
router.get('/admin/schema', requireAdmin, function (req, res) {
  res.json({ resources: resources, submissions: submissions });
});

router.get('/admin/stats', requireAdmin, function (req, res) {
  const stats = {};
  Object.keys(resources).forEach(function (name) {
    stats[name] = store.findAll(resources[name].collection).length;
  });
  Object.keys(submissions).forEach(function (name) {
    const items = store.findAll(submissions[name].collection);
    stats[name] = items.length;
    stats[name + 'New'] = items.filter(function (item) { return item.status === 'new'; }).length;
  });
  res.json(stats);
});

// ---------- Image upload (administrators only) ----------
const allowedTypes = { 'image/jpeg': '.jpg', 'image/png': '.png', 'image/webp': '.webp', 'image/gif': '.gif' };
const upload = multer({
  storage: multer.diskStorage({
    destination: path.join(__dirname, '..', 'uploads'),
    // Random file name + extension chosen by us (never trust the visitor's file name).
    filename: function (req, file, done) {
      done(null, crypto.randomUUID() + allowedTypes[file.mimetype]);
    }
  }),
  limits: { fileSize: 5 * 1024 * 1024, files: 1 },
  fileFilter: function (req, file, done) {
    if (allowedTypes[file.mimetype]) {
      return done(null, true);
    }
    return done(Object.assign(new Error('Only JPG, PNG, WEBP or GIF images are allowed.'), { isUserError: true }));
  }
});

router.post('/admin/upload', requireAdmin, upload.single('image'), function (req, res) {
  if (!req.file) {
    return res.status(400).json({ error: 'Please choose an image file.' });
  }
  return res.status(201).json({ path: '/uploads/' + req.file.filename });
});

module.exports = router;
