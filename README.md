# Hi, I'm Ajay! 👋

Welcome to my **Professional Backend Software Engineer Portfolio**. 

This application is designed as a high-performance, real-time backend showroom. It highlights my technical journey, showcases my featured projects, and features an interactive secure messaging console for collaborators, recruiters, and clients to connect with me in real time.

---

## 🚀 Key Features

* **Dual-Mode Architecture (SSR & REST API):** 
  * Serves premium, fully responsive Server-Side Rendered (SSR) views powered by **EJS** and **Tailwind CSS**.
  * Exposes a fully structured, secure REST API under the `/api/v1` prefix for cross-platform data access.
* **WebSocket-Powered Live Console:**
  * Authenticated users can start a direct chat session with me.
  * Real-time notifications, presence detection, and read-receipt ticks powered by **Socket.io**.
* **Comprehensive Admin Control Center:**
  * Complete dashboard to manage projects (create, read, update, delete, reorder).
  * System-wide Announcement engine categorized by updates, milestone events, and system statuses.
  * User Directory with dynamic chat feeds and aggregate unread message counters.
* **Telemetry & Tracking:**
  * Real-time telemetry log records resume download activity and visitor statistics.
  * Automated activity tracking logging active sessions, visit count, and page requests.

---

## 🛠️ Technology Stack

* **Server Core:** [Node.js](https://nodejs.org/), [Express.js](https://expressjs.com/)
* **Templating Engine:** [EJS (Embedded JavaScript)](https://ejs.co/) for dynamic Server-Side Rendering (SSR) combined with `express-ejs-layouts` for modular, reusable visual layouts
* **Database & Modeling:** [MongoDB](https://www.mongodb.com/), [Mongoose ORM](https://mongoosejs.com/)
* **Real-time Engine:** [Socket.io](https://socket.io/) (WebSockets)
* **Session & Auth:** HTTP-Only Cookie Session storage, JWT (JSON Web Tokens) & Bcrypt password hashing
* **Security & Validation:** [Joi](https://joi.dev/) validation schemas & [Helmet.js](https://helmetjs.github.io/) security headers
* **Styling & UI:** Custom Tailwind CSS styling configuration for premium aesthetics

---

## 📂 Project Structure

```bash
├── config/                  # Database connections and seeding scripts
├── public/                  # Static assets (compiled CSS, client JavaScript, uploads)
├── src/
│   ├── controllers/         # Controller layers separating SSR actions
│   │   ├── ssr/             # SSR logic (Dashboard, User, Project Controllers)
│   │   └── api/             # REST API payload logic
│   ├── middleware/          # JWT protection, analytics, and schema validation
│   ├── models/              # Mongoose DB Schemas (User, Project, Message, etc.)
│   ├── routes/              # Centralized route mounting
│   │   ├── ssr/             # Server-side views routes
│   │   └── api/             # REST endpoints (v1)
│   ├── utils/               # Mailer scripts, Socket handlers, Multer storage
│   └── views/               # EJS template engine pages and partials
├── app.js                   # Express application setup
└── server.js                # Server listener, DB init, and Graceful Shutdown configuration
```

---

## ⚡ Getting Started

### 1. Prerequisites
Ensure you have Node.js (version 18+) and MongoDB installed locally or access to a MongoDB Atlas cluster.

### 2. Environment Configuration
Create a `.env` file in the root directory and configure the following variables:
```env
PORT=3000
NODE_ENV=development
MONGO_URI=your_mongodb_connection_uri
JWT_SECRET=your_jwt_signing_secret
SESSION_SECRET=your_session_store_secret
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=your_secure_admin_password
```

### 3. Installation
Install dependencies:
```bash
npm install
```

### 4. Running the App
* **Development Mode (with auto-reload):**
  ```bash
  npm run dev
  ```
* **Production Mode:**
  ```bash
  npm start
  ```

---

## 📖 Routing Reference (SSR vs. API)

### Server-Side Rendered Views (SSR)

* `GET /` — Homepage showcasing featured projects and direct contact options.
* `GET /auth/login` — Sign in to the portfolio console.
* `GET /auth/register` — Create a recruiter/visitor profile.
* `GET /dashboard` — Interactive chat dashboard (includes profile updates, resumes, and announcements for admins).
* `GET /users` — Admin portal member directory.

### REST API endpoints (`/api/v1`)

All REST endpoints require an `Authorization: Bearer <JWT_TOKEN>` header for private routes.

* `POST /api/v1/auth/register` — Standard registration payload.
* `POST /api/v1/auth/login` — Retrieve JWT payload.
* `GET /api/v1/projects` — Fetch all projects.
* `POST /api/v1/projects` — Add a new project (Admin Only).
* `GET /api/v1/announcements` — List active notifications.

---

## 🔒 Security & Best Practices

1. **Input Sanitation & Strict Validation:** Dual-mode validation middleware parses API payloads as JSON and redirects standard EJS form submissions with descriptive error flash alerts.
2. **Session Integrity:** Uses HTTP-Only cookies with context-aware `sameSite` and `secure` configurations.
3. **Graceful Shutdowns:** Listens to termination signals (`SIGINT`, `SIGTERM`) to safely terminate MongoDB connections and active socket channels before exiting the process.
