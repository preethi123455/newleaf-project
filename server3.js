// backend/server3.js
const express = require('express');
const http = require('http');
const cors = require('cors');
const mongoose = require('mongoose');
const { Server } = require('socket.io');
require('dotenv').config(); // optional, in case you use .env

const app = express();
app.use(cors());
app.use(express.json());

// ✅ Health check route
app.get('/', (req, res) => {
  res.send('✅ Socket.IO Server is live');
});

// ✅ MongoDB Connection
const mongoURI = 'mongodb+srv://preethi:1234567890@expensetracker.qxubd3s.mongodb.net/chatapp?retryWrites=true&w=majority&appName=expensetracker';

mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// ✅ Mongoose Schema
const User = mongoose.model('User', new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  company: String
}));

// ✅ Setup HTTP + Socket.io Server
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// ✅ Socket.IO Logic
io.on('connection', (socket) => {
  console.log('🟢 New client connected:', socket.id);

  // Join a room using email (optional grouping)
  socket.on('join', (email) => {
    socket.join(email);
    console.log(`🔗 Client joined room: ${email}`);
  });

  // Handle incoming message
  socket.on('send-message', async (msg) => {
    try {
      const user = await User.findOne({ email: msg.senderEmail });
      const senderName = user ? user.name : 'Unknown';

      const message = {
        senderName,
        text: msg.text,
        fileName: msg.fileName || null,
        fileUrl: msg.fileUrl || null,
        timestamp: new Date()
      };

      // Emit to all clients or specific room
      io.emit('receive-message', message);
      // io.to(msg.receiverEmail).emit('receive-message', message); // if 1-1 chat

      console.log('📤 Message sent:', message);
    } catch (err) {
      console.error('❌ send-message error:', err);
    }
  });

  // Client disconnected
  socket.on('disconnect', () => {
    console.log('🔴 Client disconnected:', socket.id);
  });
});

// ✅ Start server
const PORT = process.env.PORT || 1000;
server.listen(PORT, () => {
  console.log(`✅ Socket.IO Server running at http://localhost:${PORT}`);
});
