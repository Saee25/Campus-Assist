const http = require('http');
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const socket = require('./config/socket');
const productRoutes = require('./routes/productRoutes');
const authRoutes = require('./routes/authRoutes');
const requestRoutes = require('./routes/requestRoutes');
const errorHandler = require('./middleware/errorMiddleware');

// Load env vars
dotenv.config();

const app = express();
const server = http.createServer(app);

// Initialize Socket.io
const io = socket.init(server);

// Middleware
app.use(cors());
app.use(express.json()); // Body parser

// Mount Routes
app.use('/api/products', productRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/requests', requestRoutes);

// Base route
app.get('/', (req, res) => {
  res.send('API is running...');
});

// Error Middleware (must be after routes)
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🚀 Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
