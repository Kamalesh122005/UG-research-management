# Department Student Research & Academic Activity Management Portal

A full-stack web application designed for academic departments to manage student research, conferences, hackathons, publications, and achievements. Features role-based access control for Students, Staff/Faculty, and Admins.

## 🛠️ Tech Stack
- **Frontend**: React.js (Vite), Material UI (MUI), React Router
- **Backend**: Node.js, Express.js
- **Database**: MySQL (using `mysql2`)
- **Auth**: Session-based auth with `express-session` & `bcrypt`

## 📁 Folder Structure
```
academic-portal/
├── backend/            # Express.js Server
│   ├── middleware/     # Auth and role middlewares
│   ├── routes/         # API routes (auth, users, activities)
│   ├── db.js           # MySQL connection pool
│   ├── init-db.js      # Automatic schema initialization script
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

First, ensure you have **MySQL** installed and running on your system.

Navigate to the `backend` folder and create/update the `.env` file:
```env
PORT=5000
DB_USER=root
DB_PASSWORD=your_password_here
DB_HOST=localhost
DB_PORT=3306
DB_NAME=academic_portal
SESSION_SECRET=super_secret_academic_session_key
```
Update `DB_USER` and `DB_PASSWORD` to match your local MySQL credentials.

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
*This will automatically connect to your MySQL instance, create the `academic_portal` database, and execute `schema.sql` to set up tables and demo data.*

## ▶️ Running the Project Locally

**Start the Backend Server:**
```bash
cd backend
npm run dev      # if nodemon is available, or 'node server.js'
```
*The server will run on http://localhost:5000*

**Start the Frontend Dev Server:**
```bash
cd frontend
npm run dev
```
*The React app will usually run on http://localhost:5173. Open this in your browser.*

### 🔑 Demo Login Instructions
The initialization script seeds the following demo accounts:
- **Admin**: `admin@test.com` / `admin123`
- **Staff**: `staff@test.com` / `staff123`
- **Student**: `student@test.com` / `student123`

You can also use the registration feature in the UI to create new accounts.
