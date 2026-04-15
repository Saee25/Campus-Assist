# Backend Setup Guide

## 1. Firebase Configuration
- Go to [Firebase Console](https://console.firebase.google.com/).
- Create a new project or select an existing one.
- In **Project Settings > Service Accounts**, click **Generate new private key**.
- Download the JSON file and copy the values into your `.env` file in this directory.

## 2. Environment Variables (.env)
Create a `.env` file in `apps/backend/` with:
```env
PORT=5000
FIREBASE_PROJECT_ID=...
FIREBASE_CLIENT_EMAIL=...
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n..."
NODE_ENV=development
```

## 3. Installation
Run the following in the project root:
```bash
npm install
```

## 4. Run the Server
```bash
cd apps/backend
npm run dev
```

## API Endpoints
- `POST /api/products`: Create a product (Requires `name` and `price`).
- `GET /api/products`: Get all products.
- `GET /api/products/:id`: Get a specific product.
- `PUT /api/products/:id`: Update a product.
- `DELETE /api/products/:id`: Delete a product.
