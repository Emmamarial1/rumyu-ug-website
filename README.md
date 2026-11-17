# RUMYU-UG Website

Official website platform for **Rumbek Youth Union - Uganda Chapter (RUMYU-UG)**: a public website plus a password-protected admin dashboard.

*Tagline: "United in Purpose. Stronger Together."*

## 1. Overview

- **Public site:** Home, About, Branches, Leadership, Programs, Events, News, Gallery, Membership, Contact.
- **Admin dashboard:** log in, see statistics, add/edit/delete news, events, leadership, programs, gallery images and branches, upload images, read membership enquiries and contact messages.
- **Content is loaded from the backend with `fetch()`**, so changes made in the dashboard appear on the website immediately and survive server restarts (stored in JSON files).
- All sample content is labelled **demo** or **placeholder**. Nothing invented is presented as fact. See `RESEARCH-SOURCES.md` for what is known about RUMYU and what is still missing.

## 2. Technologies

Frontend: HTML5, CSS3, vanilla JavaScript (function declarations, no frameworks).
Backend: Node.js, Express.js, JSON files for storage.
Packages: `express`, `express-session` (login sessions), `bcryptjs` (password hashing), `helmet` (security headers), `express-rate-limit`, `multer` (image upload), `dotenv`.

## 3. Folder structure

```
RUMYU-UG-WEBSITE/
├── frontend/                  everything the browser downloads
│   ├── *.html                 the 10 public pages
│   ├── admin/login.html, dashboard.html
│   ├── css/  style.css (design) responsive.css (phones/tablets) admin.css
│   ├── js/
│   │   ├── api.js             the only place that calls fetch()
│   │   ├── main.js            SITE settings + helper functions
│   │   ├── navigation.js      header, footer, mobile menu
│   │   ├── news.js  events.js  gallery.js  content.js  forms.js
│   │   └── admin.js           login + dashboard
│   └── assets/images, icons   placeholder images, favicon
├── backend/
│   ├── server.js              starts Express, security, sessions
│   ├── routes/index.js        every API URL in one file
│   ├── controllers/           what each URL does
│   ├── middleware/            login check, error handling
│   ├── services/              jsonStore.js (data), adminService.js (passwords)
│   ├── utils/                 schemas.js, validators.js, createAdmin.js, selfCheck.js
│   ├── data/                  *.json = the "database"
│   └── uploads/               images uploaded from the dashboard
├── .env.example  .gitignore  package.json
├── README.md  RESEARCH-SOURCES.md
```

## 4. Install

Install Node.js 18 or newer from https://nodejs.org, then in this folder:

```bash
npm install
```

## 5. Configure environment variables

```bash
cp .env.example .env        # Windows: copy .env.example .env
```

Edit `.env`:

| Variable | Meaning |
|----------|---------|
| `PORT` | Port number (default 3000) |
| `NODE_ENV` | `development` or `production` |
| `SESSION_SECRET` | Long random string (32+ chars). Generate: `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"` |
| `ADMIN_USERNAME` | First administrator's username |
| `ADMIN_PASSWORD` | First administrator's password (10+ characters) |

The first time the server starts and no administrator exists, it creates one from these values and stores only a **bcrypt hash** in `backend/data/admins.json`. To change the password later: edit `ADMIN_PASSWORD` in `.env` and run `npm run create-admin`.

## 6. Start the server

```bash
npm start          # normal
npm run dev        # restarts automatically when you edit backend files
```

## 7. Open the website and the admin dashboard

- Website: http://localhost:3000
- Admin login: http://localhost:3000/admin/login.html (the "Admin" link in the footer goes there too)

Visitors cannot open `/admin/dashboard.html` (they are sent to the login page) and every write API returns `401` without a login.

## 8. Check the project

```bash
npm run check
```

Validates the JSON data against the schemas and confirms every link, image, CSS and script file exists.

## 9. Changing website content

| What | Where |
|------|-------|
| News, events, leadership, programs, gallery, branches | Admin dashboard (no code needed) |
| Official email, phone, location, social links, logo | `SITE` object at the top of `frontend/js/main.js` |
| Replace the text logo with a real one | Set `SITE.logo.imageUrl` in `main.js` (e.g. `/assets/images/logo.png`) |
| Mission, vision, history text | `frontend/about.html` (and `index.html`) |
| Colours | CSS variables at the top of `frontend/css/style.css` |
| Fields of each content type | `backend/utils/schemas.js` (dashboard forms update automatically) |
| Navigation menu | `NAV_LINKS` in `frontend/js/navigation.js` |

**Before going live, replace all demo/placeholder content:** demo news and events (tagged *Demo*), placeholder leadership profiles, placeholder gallery images, draft mission/vision/values, and confirm the status of each branch.

### Understanding the code (suggested learning order)
1. `frontend/js/api.js` - how the browser asks the server for data.
2. `frontend/js/news.js` - fetch, render cards, filter, dialog.
3. `backend/routes/index.js` -> `controllers/resourceController.js` -> `services/jsonStore.js` - request to data and back.
4. `backend/utils/validators.js` - why the server validates again.
5. `frontend/js/admin.js` - forms generated from a schema.

## 10. Deployment

1. Use a host that runs Node.js (Render, Railway, Fly.io, a VPS, cPanel Node.js apps...).
2. Set the environment variables there: `NODE_ENV=production`, a strong `SESSION_SECRET`, `ADMIN_USERNAME`, `ADMIN_PASSWORD`. In production the server **refuses to start** with a weak secret and uses HTTPS-only cookies, so the site must be served over HTTPS (hosts normally do this).
3. Build command `npm install`, start command `npm start`.
4. **Persistent storage:** content lives in `backend/data/` and `backend/uploads/`. Many hosts erase the disk on every deploy, so attach a persistent disk/volume to those two folders, or back them up regularly.
5. Sessions are kept in memory, so admins must log in again after a restart. For heavier use, add a session store (e.g. `connect-session-file` or a database).
6. Set a custom domain and make sure HTTPS is on.

## 11. Security summary

Passwords hashed with bcrypt; sessions in HttpOnly, SameSite cookies; login and form rate limits; Helmet security headers (including a Content-Security-Policy, so no inline scripts); server-side validation with whitelisting of fields; all displayed data is HTML-escaped; honeypot field against spam bots; write requests require an `X-Requested-With` header (CSRF defence); image uploads restricted to JPG/PNG/WEBP/GIF, 5 MB, random file names.

## 12. Known limitations (honest notes)

- JSON files are fine for a small community site; for many simultaneous editors or heavy traffic move to a real database (only `services/jsonStore.js` would change).
- Messages and membership enquiries are stored for administrators to read; **no email notifications are sent**.
- One administrator role only; no password-reset page (use `npm run create-admin`).
- Memory-based sessions (see Deployment).
- Photographs are generated placeholders; no real RUMYU imagery was available.
