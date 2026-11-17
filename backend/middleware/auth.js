// auth.js - protects administrator-only routes.

// For API routes: answer with a JSON 401 error.
function requireAdmin(req, res, next) {
  if (req.session && req.session.adminId) {
    return next();
  }
  return res.status(401).json({ error: 'Please log in as an administrator.' });
}

// For the dashboard HTML page: send visitors to the login page instead.
function requireAdminPage(req, res, next) {
  if (req.session && req.session.adminId) {
    return next();
  }
  return res.redirect('/admin/login.html');
}

// Basic CSRF defence for write requests. Browsers will not let another website add a
// custom header to a request without our permission, so requiring this header blocks
// forged cross-site POST/PUT/DELETE requests. Our api.js adds it automatically.
function requireFetchHeader(req, res, next) {
  const safeMethods = ['GET', 'HEAD', 'OPTIONS'];
  if (safeMethods.indexOf(req.method) !== -1) {
    return next();
  }
  if (req.get('X-Requested-With') !== 'fetch') {
    return res.status(403).json({ error: 'Request rejected (missing security header).' });
  }
  return next();
}

module.exports = { requireAdmin, requireAdminPage, requireFetchHeader };
