# API Endpoints and Payloads Reference

This project is a Backend Portfolio application built using Node.js, Express, and MongoDB. It supports both server-side rendered (SSR) views and REST API endpoints.

All API routes are prefixed with `/api/v1`.

- **Base URL:** `http://localhost:3000`

---

## 1. Authentication & User Module (`/api/v1/auth`)

### 1.1. Register User
* **Method:** `POST`
* **URL:** `http://localhost:3000/api/v1/auth/register`
* **Access:** Public
* **Headers:** 
  * `Content-Type: multipart/form-data` (or `application/json`)
  * `Accept: application/json`
* **Request Body (form-data / JSON):**
  ```json
  {
    "name": "John Doe",           // String (required, min: 3, max: 50)
    "email": "john@example.com",  // String (required, valid email)
    "password": "securepassword", // String (required, min: 6)
    "location": "San Francisco, CA", // String (optional)
    "bio": "Open Source Contributor | Fullstack Developer", // String (optional, max 250 chars)
    "userType": "developer",      // String enum (required, one of: 'developer', 'recruiter', 'project_provider', 'hobbyist', 'other')
    "seeking": "collaboration",   // String enum (required, one of: 'hiring_talent', 'freelance_work', 'collaboration', 'networking', 'exploration', 'other')
    "profilePicture": (File upload or optional image relative path/URL string),
    "github": "https://github.com/johndoe",    // String (optional, URL)
    "linkedin": "https://linkedin.com/in/johndoe", // String (optional, URL)
    "facebook": "https://facebook.com/johndoe", // String (optional, URL)
    "twitter": "https://twitter.com/johndoe", // String (optional, URL)
    "instagram": "https://instagram.com/johndoe", // String (optional, URL)
    "website": "https://example.com" // String (optional, URL)
  }
  ```

---

### 1.2. Login User
* **Method:** `POST`
* **URL:** `http://localhost:3000/api/v1/auth/login`
* **Access:** Public
* **Headers:** 
  * `Content-Type: application/json`
  * `Accept: application/json`
* **Request Body (JSON):**
  ```json
  {
    "email": "john@example.com",  // String (required, valid email)
    "password": "securepassword"  // String (required)
  }
  ```

---

### 1.3. Get Current User Profile
* **Method:** `GET`
* **URL:** `http://localhost:3000/api/v1/auth/me`
* **Access:** Private (Registered user / Admin)
* **Headers:** 
  * `Authorization: Bearer <your_jwt_token>`
  * `Accept: application/json`
* **Request Body:** None

---

### 1.4. Logout User
* **Method:** `POST`
* **URL:** `http://localhost:3000/api/v1/auth/logout`
* **Access:** Private (Registered user / Admin)
* **Headers:** 
  * `Authorization: Bearer <your_jwt_token>`
  * `Accept: application/json`
* **Request Body:** None

---

### 1.5. List Registered Users (Exclude Admins)
* **Method:** `GET`
* **URL:** `http://localhost:3000/api/v1/auth/users`
* **Access:** Private (Admin only)
* **Headers:** 
  * `Authorization: Bearer <your_jwt_token>`
  * `Accept: application/json`
* **Request Body:** None

---

### 1.6. Update Current User Profile
* **Method:** `PUT`
* **URL:** `http://localhost:3000/api/v1/auth/me`
* **Access:** Private (Registered user / Admin)
* **Headers:** 
  * `Authorization: Bearer <your_jwt_token>`
  * `Content-Type: multipart/form-data` (or `application/json`)
  * `Accept: application/json`
* **Request Body (form-data / JSON - all fields optional):**
  ```json
  {
    "name": "Jane Doe",
    "email": "jane@example.com",
    "password": "newsecurepassword",
    "location": "Oakland, CA",
    "bio": "Staff Tech Recruiter at Netflix",
    "userType": "recruiter",
    "seeking": "hiring_talent",
    "profilePicture": (File upload or optional image relative path/URL string),
    "github": "https://github.com/janedoe_new",
    "linkedin": "https://linkedin.com/in/janedoe_new",
    "facebook": "", // Passing empty string removes the link entry
    "twitter": "https://twitter.com/janedoe",
    "instagram": "https://instagram.com/janedoe",
    "website": "https://example.com"
  }
  ```

---

## 2. Projects Module (`/api/v1/projects`)

### 2.1. Get All Projects
* **Method:** `GET`
* **URL:** `http://localhost:3000/api/v1/projects`
* **Access:** Public
* **Headers:** 
  * `Accept: application/json`
* **Request Body:** None

---

### 2.2. Get Single Project
* **Method:** `GET`
* **URL:** `http://localhost:3000/api/v1/projects/:id`
* **Access:** Public
* **Headers:** 
  * `Accept: application/json`
* **Request Body:** None

---

### 2.3. Create Project
* **Method:** `POST`
* **URL:** `http://localhost:3000/api/v1/projects`
* **Access:** Private (Admin only)
* **Headers:** 
  * `Authorization: Bearer <your_jwt_token>`
  * `Accept: application/json`
  * `Content-Type: multipart/form-data`
* **Request Body (form-data):**
  * `title`: "E-Commerce Backend" (String, required, min: 3, max: 100)
  * `description`: "Robust REST API using Express and Mongoose..." (String, required, min: 10)
  * `technologies`: "Node.js, Express, MongoDB" (String, required, comma-separated list)
  * `category`: "Web Development" (String, required, must be one of: `'Web Development'`, `'Mobile App'`, `'Web & Mobile App'`, `'Backend Service & Algorithms'`)
  * `githubUrl`: "https://github.com/johndoe/ecommerce" (String, optional, URL)
  * `liveUrl`: "https://ecommerce.example.com" (String, optional, URL)
  * `featured`: "true" or "on" (Boolean/String, optional)
  * `images`: (File, optional, array of up to 5 image files)

---

### 2.4. Update Project
* **Method:** `PUT`
* **URL:** `http://localhost:3000/api/v1/projects/:id`
* **Access:** Private (Admin only)
* **Headers:** 
  * `Authorization: Bearer <your_jwt_token>`
  * `Accept: application/json`
  * `Content-Type: multipart/form-data`
* **Request Body (form-data / JSON):**
  * Same fields as **Create Project**. Only pass fields that require updates.

---

## 3. Announcements Module (`/api/v1/announcements`)

### 3.1. Get All Active Announcements
* **Method:** `GET`
* **URL:** `http://localhost:3000/api/v1/announcements`
* **Access:** Public
* **Headers:** 
  * `Accept: application/json`
* **Request Body:** None

---

### 3.2. Get User-Specific Announcements
* **Method:** `GET`
* **URL:** `http://localhost:3000/api/v1/announcements/user`
* **Access:** Private (Registered user / Admin)
* **Headers:** 
  * `Authorization: Bearer <your_jwt_token>`
  * `Accept: application/json`
* **Request Body:** None

---

### 3.3. Create Announcement
* **Method:** `POST`
* **URL:** `http://localhost:3000/api/v1/announcements`
* **Access:** Private (Admin only)
* **Headers:** 
  * `Authorization: Bearer <your_jwt_token>`
  * `Accept: application/json`
  * `Content-Type: application/json`
* **Request Body (JSON):**
  ```json
  {
    "announcement": "Maintenance window scheduled for tomorrow.", // String (required)
    "isActive": true, // Boolean (optional, default: true)
    "endDate": "2026-06-10T12:00:00.000Z" // Date string (optional, default: 1 week from now)
  }
  ```

---

### 3.4. Update Announcement
* **Method:** `PUT`
* **URL:** `http://localhost:3000/api/v1/announcements/:id`
* **Access:** Private (Admin only)
* **Headers:** 
  * `Authorization: Bearer <your_jwt_token>`
  * `Accept: application/json`
  * `Content-Type: application/json`
* **Request Body (JSON):**
  ```json
  {
    "announcement": "Updated announcement message", // String (optional)
    "isActive": false, // Boolean (optional)
    "endDate": "2026-06-12T12:00:00.000Z" // Date string (optional)
  }
  ```

---

### 3.5. Delete Announcement
* **Method:** `DELETE`
* **URL:** `http://localhost:3000/api/v1/announcements/:id`
* **Access:** Private (Admin only)
* **Headers:** 
  * `Authorization: Bearer <your_jwt_token>`
  * `Accept: application/json`
* **Request Body:** None
