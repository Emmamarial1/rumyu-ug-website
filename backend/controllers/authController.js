// authController.js - administrator login, logout and "who am I".
const adminService = require('../services/adminService');

function login(req, res, next) {
  const username = req.body && req.body.username;
  const password = req.body && req.body.password;
  if (typeof username !== 'string' || typeof password !== 'string' || !username || !password) {
    return res.status(400).json({ error: 'Please enter your username and password.' });
  }
  const admin = adminService.verifyLogin(username, password);
  if (!admin) {
    return res.status(401).json({ error: 'Incorrect username or password.' });
  }
  // Create a brand-new session id after login (prevents "session fixation" attacks).
  req.session.regenerate(function (error) {
    if (error) {
      return next(error);
    }
    req.session.adminId = admin.id;
    req.session.username = admin.username;
    return res.json({ username: admin.username });
  });
}

function logout(req, res, next) {
  req.session.destroy(function (error) {
    if (error) {
      return next(error);
    }
    res.clearCookie('rumyu.sid');
    return res.json({ message: 'Logged out.' });
  });
}

function me(req, res) {
  res.json({ username: req.session.username });
}

module.exports = { login, logout, me };
