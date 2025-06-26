const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// ✅ Middleware
app.use(cors());
app.use(express.json());

// ✅ MongoDB Connection
mongoose.connect('mongodb+srv://preethi:1234567890@expensetracker.qxubd3s.mongodb.net/expensetracker?retryWrites=true&w=majority&appName=expensetracker', {
  useUnifiedTopology: true
})
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// ✅ User Schema
const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  company: { type: String, required: true }
});

// ✅ User Model
const User = mongoose.model('User', UserSchema);

// ✅ Signup Route
app.post('/signup', async (req, res) => {
  try {
    const { name, email, password, company } = req.body;
    console.log('📥 Signup request:', req.body);

    if (!name || !email || !password || !company) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const newUser = new User({ name, email, password, company });
    await newUser.save();

    console.log('✅ New user signed up:', newUser.email);
    res.status(201).json({ message: 'Signup successful' });
  } catch (err) {
    console.error('❌ Signup error:', err);
    if (err.code === 11000) {
      res.status(400).json({ message: 'Email already registered (duplicate key)' });
    } else {
      res.status(500).json({ message: 'Server error during signup' });
    }
  }
});

// ✅ Login Route
app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('🔐 Login attempt:', email);

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const existing = await User.findOne({ email });
    if (!existing || existing.password !== password) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    res.status(200).json({
      message: 'Login successful',
      name: existing.name,
      company: existing.company
    });
  } catch (err) {
    console.error('❌ Login error:', err);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// ✅ Get All Users
app.get('/users', async (req, res) => {
  try {
    const users = await User.find({}, 'name email company');
    res.status(200).json(users);
  } catch (err) {
    console.error('❌ Fetch users error:', err);
    res.status(500).json({ message: 'Failed to fetch users' });
  }
});

// ✅ Start Server
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
