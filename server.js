// backend/server.js

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config(); // Optional for secure credentials

const app = express();
app.use(cors());
app.use(express.json());

// ✅ Health Check
app.get('/', (req, res) => {
  res.send('✅ API is running');
});

// ✅ MongoDB Connection
mongoose.connect(
  'mongodb+srv://preethi:1234567890@expensetracker.qxubd3s.mongodb.net/expensetracker?retryWrites=true&w=majority&appName=expensetracker',
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
).then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// ✅ Schema
const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  company: { type: String, required: true }
});

const User = mongoose.model('User', UserSchema);

// ✅ Signup Route
app.post('/signup', async (req, res) => {
  try {
    const { name, email, password, company } = req.body;
    if (!name || !email || !password || !company) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const newUser = new User({ name, email, password, company });
    await newUser.save();
    res.status(201).json({ message: 'Signup successful' });
  } catch (err) {
    console.error('❌ Signup error:', err);
    res.status(500).json({ message: 'Server error during signup' });
  }
});

// ✅ Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
