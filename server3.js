// backend/server3.js
const express = require('express');
const http = require('http');
const cors = require('cors');
const mongoose = require('mongoose');
const { Server } = require('socket.io');
require('dotenv').config(); // Optional .env support

const app = express();
app.use(cors());
app.use(express.json());

// ✅ Health check route
app.get('/', (req, res) => {
  res.send('✅ Socket.IO Server is live');
});

// ✅ MongoDB Connection
const mongoURI = process.env.MONGO_URI || 'mongodb+srv://preethi:1234567890@expensetracker.qxubd3s.mongodb.net/chatapp?retryWrites=true&w=majority&appName=expensetracker';

mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// ✅ Mongoose Schema & Model
const UserSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  company: String
});
const User = mongoose.model('User', UserSchema);

// ✅ Create HTTP + Socket.io Server
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// ✅ Socket.IO Events
io.on('connection', (socket) => {
  console.log('🟢 Client connected:', socket.id);

  // Join personal room using email
  socket.on('join', (email) => {
    socket.join(email);
    console.log(`📩 User joined room: ${email}`);
  });

  // Handle chat message
  socket.on('send-message', async (msg) => {
    try {
      const { senderEmail, text, fileName, fileUrl } = msg;

      const user = await User.findOne({ email: senderEmail });
      const senderName = user ? user.name : 'Unknown';

      const message = {
        senderName,
        text,
        fileName: fileName || null,
        fileUrl: fileUrl || null,
        timestamp: new Date().toISOString()
      };

      // Broadcast to all clients
      io.emit('receive-message', message);

      // Optional: For 1-on-1 messaging
      // io.to(msg.receiverEmail).emit('receive-message', message);

      console.log('📤 Message emitted:', message);
    } catch (err) {
      console.error('❌ Error sending message:', err);
    }
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    console.log('🔴 Client disconnected:', socket.id);
  });
});

// ✅ Start server
const PORT = process.env.PORT || 1000;
server.listen(PORT, () => {
  console.log(`🚀 Socket.IO server running at http://localhost:${PORT}`);
});
