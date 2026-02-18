# Nexora Gaming Partner Suite

A comprehensive MERN stack application for managing gaming agents and affiliates. Built with React 18, Node.js, Express, and MongoDB.

![Nexora Gaming Partner Suite Dashboard](https://via.placeholder.com/800x400?text=Nexora+Gaming+Partner+Suite+Dashboard)

## 🚀 Deliverables

- **GitHub Repository**: [https://github.com/irshad800/Nexora-Gaming-Partner-Suite](https://github.com/irshad800/Nexora-Gaming-Partner-Suite)
- **API Documentation (Swagger)**: [https://nexora-gaming-partner-suite.onrender.com/api/docs](https://nexora-gaming-partner-suite.onrender.com/api/docs)
- **Postman Collection**: [Postman Collection Link](https://red-robot-986967.postman.co/workspace/4c12192f-41fb-4bc9-8ccf-3384dbf6294c/collection/34597114-74feb640-4d43-4017-bc68-fced36228d4a?action=share&source=copy-link&creator=34597114)
- **Demo Video**: [Loom Demo Video](https://www.loom.com/share/placeholder) (Placeholder - Replace with your recording)

## ✨ key Features

### 🏢 Agent Panel
- **Comprehensive Dashboard**: Real-time stats, revenue charts, and active user metrics.
- **User Management**: Add new players, view details, and toggle status (Block/Unblock).
- **Player Data Export**: Download your entire player list as a **CSV report**.
- **Commission History**: Track earnings with date filters and CSV export.
- **Withdrawals**: Request payouts and track transaction history.

### 🤝 Affiliate Panel
- **Affiliate Dashboard**: Track clicks, conversions, and revenue share performance.
- **Referral Links**: 
    - Fixed data mapping for real-time stats.
    - **Custom Slug Generation** for branded tracking links.
- **Marketing Assets**: Easy access to banners and promotional embed codes.
- **Click History**: Detailed logs of referral link activity.
- **Funnel Stats**: Visualize your conversion pipeline.
- **Earnings & Payouts**: Unified interface for revenue management.

## 🛠 Tech Stack
- **Frontend**: React 18, Vite, Tailwind CSS, Recharts, React Router 6.
- **Backend**: Node.js, Express.js, Mongoose.
- **Database**: MongoDB (NoSQL).
- **Authentication**: JWT (JSON Web Tokens) with Secure HTTP-Only Cookies/Local Storage.
- **Infrastructure**: Vercel (Frontend), Render (Backend).

## 📋 Prerequisites
- Node.js (v18 or higher)
- MongoDB (Running locally or a MongoDB Atlas Cloud connection string)
- Git

## 📥 Getting Started

### 1. Clone & Install
```bash
git clone https://github.com/irshad800/Nexora-Gaming-Partner-Suite.git
cd Nexora-Gaming-Partner-Suite

# Install dependencies for root, server, and client
npm install
cd client && npm install
cd ../server && npm install
cd ..
```

### 2. Environment Configuration
Create a `.env` file in the root directory:
```env
# Server Config
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_super_secret_key
NODE_ENV=development

# Client Config
VITE_API_BASE_URL=http://localhost:5000/api
```

### 3. Database Seeding
Populate the database with test data:
```bash
cd server
npm run seed
cd ..
```

### 4. Running Locally
Run both backend and frontend concurrently from the root:
```bash
npm run dev
```

## 🗄 Database Schema & Migrations
This project uses **MongoDB** with **Mongoose ODM**. Schemas are located in `/server/src/models/`.
- **User**: Core auth model for all roles.
- **Agent/Affiliate**: Profile-specific metadata.
- **Player**: Records of users registered under agents.
- **Commission/Withdrawal**: Financial tracking.

*Note: As this is NoSQL, traditional SQL migrations are not required. Use `npm run seed` to initialize the structure.*

## 🧪 Credentials (Testing)
| Role | Email | Password |
|---|---|---|
| **Agent** | agent1@example.com | password123 |
| **Affiliate** | affiliate1@example.com | password123 |
| **Admin** | admin@example.com | password123 |

---
*Built with ❤️ for Nexora Gaming.*
# Nexora Gaming Partner Suite

A comprehensive MERN stack application for managing gaming agents and affiliates. Built with React 18, Node.js, Express, and MongoDB.

![Nexora Gaming Partner Suite Dashboard](https://via.placeholder.com/800x400?text=Nexora+Gaming+Partner+Suite+Dashboard)

## 🚀 Deliverables

- **GitHub Repository**: [https://github.com/irshad800/Nexora-Gaming-Partner-Suite](https://github.com/irshad800/Nexora-Gaming-Partner-Suite)
- **API Documentation (Swagger)**: [https://nexora-gaming-partner-suite.onrender.com/api/docs](https://nexora-gaming-partner-suite.onrender.com/api/docs)
- **Postman Collection**: [Postman Collection Link](https://red-robot-986967.postman.co/workspace/4c12192f-41fb-4bc9-8ccf-3384dbf6294c/collection/34597114-74feb640-4d43-4017-bc68-fced36228d4a?action=share&source=copy-link&creator=34597114)
- **Demo Video**: [Loom Demo Video](https://www.loom.com/share/placeholder) (Placeholder - Replace with your recording)

## ✨ key Features

### 🏢 Agent Panel
- **Comprehensive Dashboard**: Real-time stats, revenue charts, and active user metrics.
- **User Management**: Add new players, view details, and toggle status (Block/Unblock).
- **Player Data Export**: Download your entire player list as a **CSV report**.
- **Commission History**: Track earnings with date filters and CSV export.
- **Withdrawals**: Request payouts and track transaction history.

### 🤝 Affiliate Panel
- **Affiliate Dashboard**: Track clicks, conversions, and revenue share performance.
- **Referral Links**: 
    - Fixed data mapping for real-time stats.
    - **Custom Slug Generation** for branded tracking links.
- **Marketing Assets**: Easy access to banners and promotional embed codes.
- **Click History**: Detailed logs of referral link activity.
- **Funnel Stats**: Visualize your conversion pipeline.
- **Earnings & Payouts**: Unified interface for revenue management.

## 🛠 Tech Stack
- **Frontend**: React 18, Vite, Tailwind CSS, Recharts, React Router 6.
- **Backend**: Node.js, Express.js, Mongoose.
- **Database**: MongoDB (NoSQL).
- **Authentication**: JWT (JSON Web Tokens) with Secure HTTP-Only Cookies/Local Storage.
- **Infrastructure**: Vercel (Frontend), Render (Backend).

## 📋 Prerequisites
- Node.js (v18 or higher)
- MongoDB (Running locally or a MongoDB Atlas Cloud connection string)
- Git

## 📥 Getting Started

### 1. Clone & Install
```bash
git clone https://github.com/irshad800/Nexora-Gaming-Partner-Suite.git
cd Nexora-Gaming-Partner-Suite

# Install dependencies for root, server, and client
npm install
cd client && npm install
cd ../server && npm install
cd ..
```

### 2. Environment Configuration
Create a `.env` file in the root directory:
```env
# Server Config
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_super_secret_key
NODE_ENV=development

# Client Config
VITE_API_BASE_URL=http://localhost:5000/api
```

### 3. Database Seeding
Populate the database with test data:
```bash
cd server
npm run seed
cd ..
```

### 4. Running Locally
Run both backend and frontend concurrently from the root:
```bash
npm run dev
```

## 🗄 Database Schema & Migrations
This project uses **MongoDB** with **Mongoose ODM**. Schemas are located in `/server/src/models/`.
- **User**: Core auth model for all roles.
- **Agent/Affiliate**: Profile-specific metadata.
- **Player**: Records of users registered under agents.
- **Commission/Withdrawal**: Financial tracking.

*Note: As this is NoSQL, traditional SQL migrations are not required. Use `npm run seed` to initialize the structure.*

## 🧪 Credentials (Testing)
| Role | Email | Password |
|---|---|---|
| **Agent** | agent1@example.com | password123 |
| **Affiliate** | affiliate1@example.com | password123 |
| **Admin** | admin@example.com | password123 |

---
*Built with ❤️ for Nexora Gaming.*
