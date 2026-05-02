# Team Task Manager

A full-stack, production-ready web application for team task management. Built with React, Tailwind CSS, Node.js, Express, and MongoDB.

## 🚀 Features

### 🔐 Authentication & Authorization
- **JWT-based Authentication**: Secure Signup and Login flow with hashed passwords (bcrypt).
- **Role-Based Access Control**:
  - **Admin**: Can create projects, manage project members, and assign tasks. Has full view of all projects and tasks.
  - **Member**: Can only view projects they are assigned to and update the status of tasks assigned to them.

### 🧩 Core Functionality
- **Project Management**: Create projects and assign team members.
- **Task Management**: Create tasks within projects, assign them to members, and set deadlines. Members can update task statuses (`Todo`, `In Progress`, `Done`).
- **Dashboard Analytics**: Overview of total projects, completed tasks, pending tasks, and overdue tasks.

### 🎨 Tech Stack
- **Frontend**: React (Vite), Tailwind CSS, React Router, Axios, Lucide React (Icons).
- **Backend**: Node.js, Express.js, MongoDB (Mongoose), JWT, Joi (Validation).

## 🛠️ Setup Instructions

### Prerequisites
- Node.js (v18+)
- MongoDB Atlas account (or local MongoDB instance)

### 1. Clone the repository
\`\`\`bash
git clone <your-repo-url>
cd ethara
\`\`\`

### 2. Environment Variables
Create a `.env` file in the `backend` directory based on the provided `.env.example`:

\`\`\`env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
NODE_ENV=development
\`\`\`

### 3. Install Dependencies
This project is structured as a monorepo. To run it locally in development mode, open two terminal windows.

**Backend Terminal:**
\`\`\`bash
cd backend
npm install
npm run dev
\`\`\`

**Frontend Terminal:**
\`\`\`bash
cd frontend
npm install
npm run dev
\`\`\`

The backend will start on `http://localhost:5000` and the frontend will typically start on `http://localhost:5173`.

## 🌐 Deployment (Railway)

This application is ready to be deployed on [Railway](https://railway.app/).

1. Connect your GitHub repository to Railway.
2. Railway will automatically detect the root `package.json` and run the `postinstall` script, which installs backend dependencies and builds the frontend.
3. Railway will run the `start` script to serve the backend, which also statically serves the frontend build in production.
4. Add the necessary Environment Variables (`MONGO_URI`, `JWT_SECRET`, `NODE_ENV=production`) in the Railway dashboard.

### Live URL
*(Add your live deployed URL here)*

## ⭐ Code Quality Highlights
- Strict MVC architecture on the backend.
- Robust error handling and input validation.
- Responsive, modern UI using Tailwind CSS and Lucide icons.
- Protected frontend routes and robust context-based state management.
# Task-Management
