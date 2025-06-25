// backend/server3.js
const express = require('express');
const http = require('http');
const cors = require('cors');
const mongoose = require('mongoose');
const { Server } = require('socket.io');

// Setup app
const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

// MongoDB Setup
mongoose.connect('mongodb://localhost:27017/expense-tracker', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB error:', err));

// Schema
const User = mongoose.model('User', new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  company: String,
}));

// Socket Logic
io.on('connection', socket => {
  console.log('✅ New client connected');

  socket.on('join', email => {
    socket.join(email);
  });

  socket.on('send-message', async msg => {
    try {
      const user = await User.findOne({ email: msg.senderEmail });
      const senderName = user ? user.name : 'Unknown User';

      io.emit('receive-message', {
        senderName,
        text: msg.text,
        fileName: msg.fileName,
        fileUrl: msg.fileUrl
      });
    } catch (err) {
      console.error('❌ Error finding user for chat:', err);
    }
  });

  socket.on('disconnect', () => {
    console.log('❌ Client disconnected');
  });
});

// Run server
const PORT = 1000;
server.listen(PORT, () => {
  console.log(`✅ Socket.IO Server running at http://localhost:${PORT}`);
});
