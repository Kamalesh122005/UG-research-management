# Department Student Research & Academic Activity Management Portal

A full-stack web application designed for academic departments to manage student research, conferences, hackathons, publications, and achievements. Features role-based access control for Students, Staff/Faculty, and Admins.

## 🛠️ Tech Stack
- **Frontend**: React.js (Vite), Material UI (MUI), React Router
- **Backend**: Node.js, Express.js
- **Database**: PostgreSQL
- **Auth**: Session-based auth with `express-session` & `bcrypt`

## 📁 Folder Structure
```
academic-portal/
├── backend/            # Express.js Server
│   ├── middleware/     # Auth and role middlewares
│   ├── routes/         # API routes (auth, users, activities)
│   ├── db.js           # PostgreSQL connection pool
│   ├── init-db.js      # Automatic schema initializion script
│   ├── schema.sql      # Database schema
│   ├── server.js       # Express entrypoint
│   └── .env            # Environment Variables
└── frontend/           # React.js Vite App
    ├── src/
    │   ├── context/    # React Context (AuthContext)
    │   ├── pages/      # UI Views (Dashboards, Login, Profile...)
    │   ├── App.jsx     # React Router routing
    │   └── main.jsx    # Application entrypoint & MUI Theme
    └── index.html
```

## ⚙️ Environment Configuration

First, ensure you have **PostgreSQL** installed and running on your system.

Navigate to the `backend` folder and check the `.env` file:
```env
PORT=5000
DB_USER=kamalesh
DB_PASSWORD=
DB_HOST=localhost
DB_PORT=5432
DB_NAME=academic_portal
SESSION_SECRET=super_secret_academic_session_key
```
Update `DB_USER` and `DB_PASSWORD` to match your local PostgreSQL credentials if needed.

## 🚀 Steps to Install Dependencies

1. **Backend Initialization**
   Open a terminal, navigate to the `backend` folder, and install packages:
   ```bash
   cd backend
   npm install
   ```

2. **Frontend Initialization**
   Open a new terminal tab, navigate to the `frontend` folder, and install packages:
   ```bash
   cd frontend
   npm install
   ```

## 🗄️ Database Initialization

Instead of manually running SQL queries, you can run the built-in initialization script. From the `backend` folder, run:
```bash
node init-db.js
```
*This will automatically connect to your PostgreSQL instance, create the `academic_portal` database, and execute `schema.sql`.*

## ▶️ Running the Project Locally

**Start the Backend Server:**
```bash
cd backend
npm start       # or 'node server.js'
```
*The server will run on http://localhost:5000*

**Start the Frontend Dev Server:**
```bash
cd frontend
npm run dev
```
*The React app will usually run on http://localhost:5173. Open this in your browser.*

### 🔑 Demo Login Instructions
Because this is a fresh setup, you'll need to use the register endpoint (e.g. via Postman) or directly insert a user into your database to log in. 
*(For demo purposes, a user route `POST /api/auth/register` is available in `routes/auth.js` that you can call to create the first Student/Admin).*
