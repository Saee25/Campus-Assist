# 📦 MADLab-MPR: Smart Campus Logistics Platform

A real-time, multi-modal logistics management system designed for campus environments. This platform streamlines resource requests, tracking, and fulfillment using a modern technology stack.

---

## 🚀 Key Features

-   **Real-time Updates**: Instant request state changes and notifications powered by Socket.io.
-   **Interactive Maps**: Campus-wide visualization using Leaflet for resource tracking.
-   **Secure Authentication**: Role-based access control integrated with Firebase.
-   **Resource Management**: Full CRUD operations for products and logistics requests.
-   **Responsive Design**: Built with Next.js and Tailwind CSS 4 for a premium mobile-first experience.

---

## 🛠️ Technology Stack

### Frontend
-   **Framework**: [Next.js](https://nextjs.org/) (React 19)
-   **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
-   **Icons**: [Lucide React](https://lucide.dev/)
-   **Maps**: [React Leaflet](https://react-leaflet.js.org/)
-   **State/Data**: Firebase SDK & Socket.io-client

### Backend
-   **Runtime**: [Node.js](https://nodejs.org/)
-   **Framework**: [Express.js](https://expressjs.com/)
-   **Database**: [Firebase Firestore](https://firebase.google.com/docs/firestore)
-   **Real-time**: [Socket.io](https://socket.io/)
-   **Security**: Firebase Admin SDK

---

## 📁 Project Structure

```text
MADLab-MPR/
├── apps/
│   ├── frontend/       # Next.js Application
│   └── backend/        # Express.js Server
├── .gitignore          # Root ignore rules
└── README.md           # Project Documentation
```

---

## ⚙️ Getting Started

### Prerequisites
-   Node.js (v18+)
-   npm or yarn
-   Firebase Project Credentials

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd MADLab-MPR
   ```

2. **Setup Backend**
   ```bash
   cd apps/backend
   npm install
   # Create a .env file based on .env.example
   npm start
   ```

3. **Setup Frontend**
   ```bash
   cd ../frontend
   npm install
   npm run dev
   ```

---

## 🔐 Environment Variables

Ensure you have the following keys in your `apps/backend/.env`:
- `PORT`
- `FIREBASE_PROJECT_ID`
- `FIREBASE_CLIENT_EMAIL`
- `FIREBASE_PRIVATE_KEY`
- `SOCKET_PORT` (if different)

---

## 📄 License
This project is for internal campus use within the MADLab ecosystem.
