import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import { connectDB } from './config/db';
import { env } from './config/env';
import { initSockets } from './sockets';
import { errorHandler } from './middleware/errorHandler';
import summaryRouter from './routes/summary';
import searchRouter from './routes/search';

const app = express();
const server = http.createServer(app);

// Configure Socket.io with CORS matching our client
const isWildcard = env.CLIENT_URL === '*';
const io = new Server(server, {
  cors: {
    origin: isWildcard ? '*' : env.CLIENT_URL,
    methods: ['GET', 'POST'],
    credentials: !isWildcard,
  },
});

// Middlewares
app.use(helmet());
app.use(
  cors({
    origin: isWildcard ? '*' : env.CLIENT_URL,
    credentials: !isWildcard,
  })
);
app.use(express.json());

// Database connection
connectDB();

// REST Routes for out-of-band AI operations
app.use('/api', summaryRouter);
app.use('/api', searchRouter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

// Initialize Socket.io Connection Handlers
initSockets(io);

// Global Error Handler
app.use(errorHandler);

// Start server
server.listen(env.PORT, () => {
  console.log(`Cove Server running on port ${env.PORT}`);
});
