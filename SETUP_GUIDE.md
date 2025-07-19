# 🛡️ CampusShield Setup Guide for Beginners

## 📋 Table of Contents
1. [What is CampusShield?](#what-is-campusshield)
2. [Cloning from GitHub](#cloning-from-github)
3. [Prerequisites](#prerequisites)
4. [Installation Steps](#installation-steps)
5. [Running the Application](#running-the-application)
6. [Understanding the Project Structure](#understanding-the-project-structure)
7. [Common Issues & Solutions](#common-issues--solutions)
8. [Development Workflow](#development-workflow)
9. [Testing the Features](#testing-the-features)
10. [Contributing](#contributing)

---

## 🎯 What is CampusShield?

CampusShield is a **privacy-first campus safety platform** that allows students to:
- **Report incidents anonymously** with location tracking
- **Chat securely** with campus authorities
- **Track report status** and updates
- **View safety analytics** and heatmaps

---

## 🚀 Cloning from GitHub

If you are starting from the GitHub repository:
```bash
git clone https://github.com/YOUR_USERNAME/YOUR_REPO.git
cd CampusShield
```

---

## 📋 Prerequisites

Before you start, make sure you have these installed:

### **Required Software:**
- ✅ **Node.js** (v16 or higher) - [Download here](https://nodejs.org/)
- ✅ **MongoDB** (v5 or higher) - [Download here](https://www.mongodb.com/try/download/community)
- ✅ **Git** (optional) - [Download here](https://git-scm.com/)

### **How to Check if Installed:**
Open Command Prompt and type:
```bash
node --version
npm --version
mongod --version
```

---

## 🚀 Installation Steps

### **Step 1: Download the Project**
1. **Download** the CampusShield project files (or clone from GitHub)
2. **Extract** to a folder (e.g., `C:\CampusShield`)
3. **Open Command Prompt** in that folder

### **Step 2: Install Dependencies**
```bash
# Install backend dependencies
cd server
npm install

# Install frontend dependencies
cd ../client
npm install
```

### **Step 3: Set Up MongoDB**
1. **Download MongoDB** from [mongodb.com](https://www.mongodb.com/try/download/community)
2. **Install with default settings** (Complete installation)
3. **MongoDB will run as a Windows Service** (starts automatically)

### **Step 4: Create Environment File**
1. **Navigate to server folder**: `cd server`
2. **Copy `.env.example` to `.env`**:
   ```bash
   copy .env.example .env
   # Or manually create .env and copy the contents from .env.example
   ```
3. **Edit `.env` as needed** (set your MongoDB URI, JWT secret, etc.)

### **Step 5: (Optional) Seed Admin/Moderator Accounts**
If you want demo admin/moderator accounts, run:
```bash
cd server
node seedAdmins.js
```

---

## 🏃‍♂️ Running the Application

### **You Need 2 Command Prompt Windows:**

#### **Window 1: Backend Server**
```bash
cd server
npm run dev
```
**Expected Output:**
```
📦 MongoDB Connected: localhost
🚀 CampusShield server running on port 5000
📊 Health check: http://localhost:5000/health
🔒 Environment: development
```

#### **Window 2: Frontend Server**
```bash
cd client
npm start
```
**Expected Output:**
```
Compiled successfully!

You can now view campus-shield in the browser.

  Local:            http://localhost:3000
  On Your Network:  http://192.168.x.x:3000
```

### **Access the Application:**
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **Health Check**: http://localhost:5000/health

---

## 📱 Mobile Responsiveness
CampusShield is fully mobile responsive and works best on modern browsers. For the best experience, use Chrome, Firefox, or Edge on desktop or mobile.

---

## 📁 Understanding the Project Structure

```
CampusShield/
├── 📁 server/                 # Backend (Node.js + Express)
│   ├── 📁 config/            # Database configuration
│   ├── 📁 models/            # Database models (User, Report)
│   ├── 📁 routes/            # API endpoints
│   ├── 📁 middleware/        # Authentication & validation
│   ├── 📁 services/          # Business logic
│   └── 📄 index.js           # Main server file
│
├── 📁 client/                # Frontend (React + TypeScript)
│   ├── 📁 src/
│   │   ├── 📁 components/    # Reusable UI components
│   │   ├── 📁 pages/         # Main application pages
│   │   ├── 📁 contexts/      # State management
│   │   └── 📄 App.tsx        # Main React component
│   └── 📄 package.json       # Frontend dependencies
│
└── 📄 README.md              # Project documentation
```

---

## 🔧 Common Issues & Solutions

### **Issue 1: "MongoDB connection failed"**
**Solution:**
1. Check if MongoDB service is running:
   ```bash
   net start MongoDB
   ```
2. If not found, check Services app for exact service name
3. Make sure MongoDB is installed properly

### **Issue 2: "Port 3000 is already in use"**
**Solution:**
1. Find what's using port 3000:
   ```bash
   netstat -ano | findstr :3000
   ```
2. Kill the process or use a different port

### **Issue 3: "Module not found" errors**
**Solution:**
1. Make sure you're in the correct folder
2. Reinstall dependencies:
   ```bash
   npm install
   ```

### **Issue 4: "Cannot find module"**
**Solution:**
1. Check if you're in the right directory
2. Make sure all dependencies are installed
3. Try deleting `node_modules` and running `npm install` again

---

## 🔄 Development Workflow

### **Daily Development Process:**

1. **Start MongoDB** (runs automatically as Windows service)
2. **Open 2 Command Prompt windows**
3. **Start Backend** (Window 1):
   ```bash
   cd server
   npm run dev
   ```
4. **Start Frontend** (Window 2):
   ```bash
   cd client
   npm start
   ```
5. **Make changes** to your code
6. **Save files** - changes auto-reload
7. **Test in browser** at http://localhost:3000

### **When You're Done:**
- **Close both Command Prompt windows**
- **MongoDB keeps running** (it's a Windows service)
- **No need to restart anything** next time

---

## 🧪 Testing the Features

### **Test User Registration:**
1. Go to http://localhost:3000
2. Click "Register" or "Get Started"
3. Fill out the form
4. Should see success message

### **Test Incident Reporting:**
1. Login to the application
2. Click "Report Incident"
3. Fill out the multi-step form
4. Upload files (optional)
5. Submit the report

### **Test My Reports:**
1. Click "My Reports" in navigation
2. View your submitted reports
3. Click on a report for details
4. Test filtering and search

### **Test Chat System:**
1. Click "Chat" in navigation
2. Select a conversation (if available)
3. Send messages
4. Test real-time communication

---

## 📚 Key Commands Reference

### **Backend Commands:**
```bash
cd server
npm run dev          # Start development server
npm run build        # Build for production
npm test             # Run tests
```

### **Frontend Commands:**
```bash
cd client
npm start            # Start development server
npm run build        # Build for production
npm test             # Run tests
```

### **MongoDB Commands:**
```bash
net start MongoDB    # Start MongoDB service
net stop MongoDB     # Stop MongoDB service
mongosh              # Connect to MongoDB shell
```

---

## 🆘 Getting Help

### **If Something Doesn't Work:**

1. **Check the console** for error messages
2. **Verify all services are running**:
   - MongoDB service (check Services app)
   - Backend server (Command Prompt 1)
   - Frontend server (Command Prompt 2)
3. **Check the browser console** (F12) for errors
4. **Restart the servers** if needed

### **Common Error Messages:**
- **"Cannot connect to database"** → MongoDB not running
- **"Port already in use"** → Another app using the port
- **"Module not found"** → Dependencies not installed
- **"Invalid token"** → Login required

---

## 🎉 You're Ready!

**Congratulations!** You now have a working CampusShield application. 

**Remember:**
- ✅ MongoDB runs automatically (no Command Prompt needed)
- ✅ Keep 2 Command Prompt windows open for development
- ✅ Access your app at http://localhost:3000
- ✅ Data is saved permanently in MongoDB

**Happy coding!** 🚀

---

*Last updated: [20-07-2025]*
*For more help, check the project documentation or ask for assistance.* 