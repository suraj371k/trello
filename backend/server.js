import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import connectDB from './config/db.js';

//routes
import userRoutes from './routes/user.routes.js'
import taskRoutes from './routes/task.routes.js'

dotenv.config();

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "*",
    methods: ["GET", "POST"]
  }
});

const port = process.env.PORT || 4000

app.use(express.json());
app.use(cookieParser());
app.use(cors());

//routes
app.use('/api/users' , userRoutes)
app.use('/api/tasks' , taskRoutes)

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  // Join a room for real-time updates
  socket.on('join-board', () => {
    socket.join('board-room');
    console.log('User joined board room');
  });

  // Handle task updates
  socket.on('task-updated', (data) => {
    socket.to('board-room').emit('task-updated', data);
  });

  // Handle task creation
  socket.on('task-created', (data) => {
    socket.to('board-room').emit('task-created', data);
  });

  // Handle task deletion
  socket.on('task-deleted', (data) => {
    socket.to('board-room').emit('task-deleted', data);
  });

  // Handle task drag-drop
  socket.on('task-moved', (data) => {
    socket.to('board-room').emit('task-moved', data);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

//database connection
connectDB()

server.listen(port , () => {
    console.log(`App is running on localhost:${port}`)
})

// Export io for use in controllers
export { io };
