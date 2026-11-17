// adminService.js - administrator accounts. Passwords are hashed with bcrypt;
// the plain password is never written to disk.

const bcrypt = require('bcryptjs');
const store = require('./jsonStore');

const COLLECTION = 'admins';
const COST = 12;
// A real hash of a random string. Used so that a login for an unknown username
// takes as long as a real one (prevents guessing which usernames exist).
const DUMMY_HASH = bcrypt.hashSync('not-a-real-password', COST);

function validateCredentials(username, password) {
  if (!username || !/^[A-Za-z0-9_.-]{3,40}$/.test(username)) {
    throw Object.assign(new Error('ADMIN_USERNAME must be 3-40 letters, numbers, dots, dashes or underscores.'), { isUserError: true });
  }
  if (!password || password.length < 10) {
    throw Object.assign(new Error('ADMIN_PASSWORD must be at least 10 characters.'), { isUserError: true });
  }
}

// Create the administrator, or replace the password if the username already exists.
function upsertAdmin(username, password) {
  validateCredentials(username, password);
  const passwordHash = bcrypt.hashSync(password, COST);
  const admins = store.findAll(COLLECTION);
  const existing = admins.find(function (admin) { return admin.username === username; });
  if (existing) {
    store.update(COLLECTION, existing.id, { passwordHash: passwordHash });
    return 'updated';
  }
  store.create(COLLECTION, { username: username, passwordHash: passwordHash });
  return 'created';
}

function hasAnyAdmin() {
  return store.findAll(COLLECTION).length > 0;
}

// Returns the admin record if the credentials are right, otherwise null.
function verifyLogin(username, password) {
  const admin = store.findAll(COLLECTION).find(function (item) {
    return item.username === String(username || '');
  });
  const hash = admin ? admin.passwordHash : DUMMY_HASH;
  const matches = bcrypt.compareSync(String(password || ''), hash);
  return admin && matches ? admin : null;
}

module.exports = { upsertAdmin, hasAnyAdmin, verifyLogin };
