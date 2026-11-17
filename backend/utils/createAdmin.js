// createAdmin.js - run with:  npm run create-admin
// Creates the administrator (or resets the password) using ADMIN_USERNAME and
// ADMIN_PASSWORD from your .env file.
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });
const adminService = require('../services/adminService');

try {
  const result = adminService.upsertAdmin(process.env.ADMIN_USERNAME, process.env.ADMIN_PASSWORD);
  console.log('Administrator ' + result + ': ' + process.env.ADMIN_USERNAME);
} catch (error) {
  console.error('Could not save administrator: ' + error.message);
  process.exit(1);
}
