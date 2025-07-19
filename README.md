# CampusShield

CampusShield is a privacy-first campus safety platform for anonymous incident reporting, real-time chat, and admin management. Built for hackathons and real-world impact.

---

## 🚀 Features

- **Anonymous Incident Reporting**: Students can report safety incidents without revealing their identity.
- **Real-time Chat**: Secure, role-based chat between users and campus security/admins.
- **Role-based Access**: User, Admin, and Moderator roles with custom dashboards and permissions.
- **Admin Dashboard**: Manage reports, view analytics, assign/resolve cases, and monitor campus safety.
- **Incident Heatmap**: Visualize incident locations and patterns with Leaflet.js.
- **AI-Powered Categorization**: Automatic classification and prioritization of reports.
- **Notifications**: (Pluggable) Real-time in-app notifications for new messages, assignments, and status changes.
- **Mobile Responsive**: Usable on desktop and mobile devices.
- **Security & Privacy**: JWT authentication, minimal data collection, and strong privacy defaults.

---

## 🛠️ Tech Stack

- **Frontend**: React, TypeScript, Tailwind CSS
- **Backend**: Node.js, Express.js
- **Database**: MongoDB, Mongoose
- **Real-time**: Socket.IO
- **Maps**: Leaflet.js
- **Authentication**: JWT (JSON Web Tokens)

---

## 🧑‍💻 Demo/Test Accounts

- **Admin**  
  Email: `admin1@example.com`  
  Password: `adminpassword1`

- **Moderator**  
  Email: `moderator1@example.com`  
  Password: `moderatorpassword1`

- **User**  
  Register a new account or use anonymous login.
  Email: `user@example.com`
  Password: `userpassword`

---

## ⚡ Quick Start

1. **Clone the repo:**
   ```bash
   git clone https://github.com/yourusername/campus-shield.git
   cd campus-shield
   ```
2. **Install dependencies:**
   ```bash
   cd server && npm install
   cd ../client && npm install
   ```
3. **Set up environment variables:**
   - Copy `.env.example` to `.env` in both `server/` and `client/` if needed.
4. **Start MongoDB locally (or use Atlas).**
5. **Start the backend:**
   ```bash
   cd server && npm start
   ```
6. **Start the frontend:**
   ```bash
   cd ../client && npm start
   ```
7. **Open [http://localhost:3000](http://localhost:3000) to view the app.**

---

## 📱 Mobile & Responsiveness
- The UI is responsive and works on mobile and desktop.
- For best results, test in Chrome DevTools mobile view.

---

## 💡 Why We Built This (Impact)

- **Problem:** Students often hesitate to report safety incidents due to privacy concerns and lack of trust.
- **Solution:** CampusShield enables anonymous, secure reporting and real-time support, empowering students and improving campus safety.
- **Impact:** More reports, faster admin response, and a safer, more connected campus community.

---

## 📣 Notifications (Pluggable)
- In-app notification bar for new chat messages, assignments, and status changes (see below for integration instructions).
- (Optional) Email notifications can be added with Nodemailer.

---

## 📂 Project Structure

```
├── client/          # React frontend
├── server/          # Node.js backend
├── docs/            # Documentation
└── scripts/         # Utility scripts
```

---

---

## Setup

For detailed setup instructions, see [SETUP_GUIDE.md](./SETUP_GUIDE.md).

---



