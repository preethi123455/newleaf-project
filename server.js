// backend/server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// CORS setup – allow your frontend origin
app.use(cors({
  origin: 'https://newleaf-project.vercel.app',
  methods: ['GET', 'POST'],
  credentials: true
}));
app.use(express.json());

// Health check
app.get('/', (req, res) => res.send('✅ API is live'));

// MongoDB connection
mongoose.connect(process.env.MONGO_URI || 'mongodb+srv://preethi:1234567890@expensetracker.qxubd3s.mongodb.net/expensetracker?retryWrites=true&w=majority', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB error:', err));

// User schema and model
const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  company: { type: String, required: true }
});
const User = mongoose.model('User', UserSchema);

// Signup route
app.post('/signup', async (req, res) => {
  try {
    const { name, email, password, company } = req.body;
    if (!name || !email || !password || !company)
      return res.status(400).json({ message: 'All fields are required' });

    if (await User.findOne({ email }))
      return res.status(400).json({ message: 'Email already registered' });

    await new User({ name, email, password, company }).save();
    res.status(201).json({ message: 'Signup successful' });
  } catch (err) {
    console.error('❌ Signup error:', err);
    res.status(500).json({ message: 'Server error during signup' });
  }
});

// Login route
app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: 'Email and password are required' });

    const user = await User.findOne({ email });
    if (!user || user.password !== password)
      return res.status(401).json({ message: 'Invalid email or password' });

    res.status(200).json({ message: 'Login successful', name: user.name, company: user.company });
  } catch (err) {
    console.error('❌ Login error:', err);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// Fetch all users route
app.get('/users', async (req, res) => {
  try {
    const users = await User.find({}, 'name email company');
    res.status(200).json(users);
  } catch (err) {
    console.error('❌ Fetch users error:', err);
    res.status(500).json({ message: 'Failed to fetch users' });
  }
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 API listening on port ${PORT}`));
