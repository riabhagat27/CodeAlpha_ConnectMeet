const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
require('dotenv').config();

const { getDatabase } = require('./config/database');
const authRoutes = require('./routes/authRoutes');
const meetingRoutes = require('./routes/meetingRoutes');
const fileRoutes = require('./routes/fileRoutes');
const setupSocket = require('./socket/socketHandler');

const app = express();
const server = http.createServer(app);

const PORT = process.env.PORT || 5000;
const rawClientUrl = process.env.CLIENT_URL || '';
const cleanClientUrl = rawClientUrl.replace(/\/+$/, '');

// Dynamic allowed origins for development & production
const allowedOrigins = Array.from(new Set([
  'https://code-alpha-connect-meet.vercel.app',
  rawClientUrl,
  cleanClientUrl,
  'http://localhost:5173',
  'http://localhost:5174',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5174'
].filter(Boolean)));

const corsOptions = {
  origin: allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

// Middleware
app.use(helmet({
  contentSecurityPolicy: false, // Allow inline styles/scripts for WebRTC & canvas if needed
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// Apply CORS middleware to Express routes and preflight OPTIONS requests
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static uploads folder for file downloading
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/meetings', meetingRoutes);
app.use('/api/files', fileRoutes);

// Root health check endpoint
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'ConnectMeet Backend API Service Running',
    timestamp: new Date().toISOString()
  });
});

// Global 404 handler for unknown API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'API route not found.'
  });
});

// Setup Socket.io with matching CORS options
const io = new Server(server, {
  cors: corsOptions
});

setupSocket(io);

// Initialize DB and start HTTP server
async function startServer() {
  try {
    await getDatabase();

    server.listen(PORT, () => {
      console.log(`=================================================`);
      console.log(`🚀 ConnectMeet Backend Server running on port ${PORT}`);
      console.log(`🌐 Allowed Origins: ${allowedOrigins.join(', ')}`);
      console.log(`=================================================`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
