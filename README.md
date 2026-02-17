# Nexora Gaming Partner Suite

A comprehensive MERN stack application for managing gaming agents and affiliates. Built with React 18, Node.js, Express, and MongoDB.

![Nexora Gaming Partner Suite](https://via.placeholder.com/800x400?text=Nexora+Gaming+Partner+Suite+Dashboard)

## Features

### 🏢 Agent Panel
- **Dashboard**: Real-time stats, revenue charts, and active user metrics
- **User Management**: Add, view, block/unblock players
- **Commission History**: Track earnings with date filters and CSV export
- **Withdrawals**: Request payouts and view transaction history
- **Role-Based Access**: Secure JWT authentication

### 🤝 Affiliate Panel
- **Affiliate Dashboard**: Conversion tracking, revenue share stats
- **Referral Links**: Generate and track custom campaign links
- **Marketing Assets**: Download banners and get embed codes
- **Earnings & Payouts**: Detailed revenue breakdown and payout requests

### 🛠 Tech Stack
- **Frontend**: React, Vite, Tailwind CSS, Recharts, React Router
- **Backend**: Node.js, Express, Mongoose, JWT
- **Database**: MongoDB
- **Docs**: Swagger UI

## Prerequisites
- Node.js 18+
- MongoDB (Local or Atlas)

## Quick Start

### 1. Clone & Install
```bash
git clone <repository-url>
cd nexora-gaming-suite

# Install Root Dependencies
npm install
```

### 2. Configure Environment
Copy `.env.example` to `.env` in the root directory and update if necessary.

```bash
cp .env.example .env
```
*Note: The project uses a root `.env` which is loaded by both server and client scripts for simplicity in this dev setup.*

### 3. Seed Database
Populate the database with initial users (admin, agents, affiliates) and dummy data.
```bash
npm run seed
```

### 4. Run Development Servers
Start both backend and frontend concurrently:
```bash
npm run dev
```
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000
- API Docs: http://localhost:5000/api/docs

## Default Credentials (from seed)

| Role | Email | Password |
|---|---|---|
| **Agent** | agent1@example.com | password123 |
| **Affiliate** | affiliate1@example.com | password123 |
| **Admin** | admin@example.com | password123 |

## Project Structure
```
├── client/                 # React Frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Route pages (Agent, Affiliate)
│   │   ├── context/        # Auth & Theme contexts
│   │   └── services/       # API integration
├── server/                 # Express Backend
│   ├── src/
│   │   ├── controllers/    # Route logic
│   │   ├── models/         # Mongoose schemas
│   │   ├── routes/         # API endpoints
│   │   └── seed/           # Data seeder
```

## API Documentation
Interactive API docs are available at `/api/docs` when the server is running.
