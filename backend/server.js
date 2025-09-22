import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:8080", // Use env variable
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Basic routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Chat App Backend is running!' });
});

app.get('/api/users', (req, res) => {
  res.json([
    { id: 1, name: 'Alice', online: true },
    { id: 2, name: 'Bob', online: false },
    { id: 3, name: 'Charlie', online: true }
  ]);
});

app.get('/api/messages', (req, res) => {
  res.json([
    { id: 1, user: 'Alice', message: 'Hello everyone!', timestamp: new Date().toISOString() },
    { id: 2, user: 'Bob', message: 'How are you all?', timestamp: new Date().toISOString() },
    { id: 3, user: 'Charlie', message: 'Great to be here!', timestamp: new Date().toISOString() }
  ]);
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join_room', (room) => {
    socket.join(room);
    console.log(`User ${socket.id} joined room: ${room}`);
  });

  socket.on('send_message', (data) => {
    socket.to(data.room).emit('receive_message', data);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});