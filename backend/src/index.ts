import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';

// Import our modules
import { sessionRouter, setSocketIO } from './routes/session';
import { setupSocketHandlers } from './sockets/sessionSocket';

// Load environment variables
dotenv.config();

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || ["http://localhost:3000", "http://localhost:3002", "http://localhost:3003"],
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || ["http://localhost:3000", "http://localhost:3002", "http://localhost:3003"]
}));
app.use(morgan('combined'));
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    service: 'letscatchup-backend'
  });
});

// API routes
app.use('/api/session', sessionRouter);

app.get('/api/status', (req, res) => {
  res.json({
    message: 'letscatchup.ai backend is running!',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  });
});

// Socket.io connection handling
setupSocketHandlers(io);

// Pass Socket.io instance to routes for real-time broadcasting
setSocketIO(io);

// Start server
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 Socket.io server ready for connections`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});
