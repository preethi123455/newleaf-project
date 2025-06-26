// backend/server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// ✅ Proper CORS for production
app.use(cors({
  origin: 'https://newleaf-project.vercel.app',
  methods: ['GET', 'POST'],
  credentials: true
}));

app.use(express.json());

// ✅ Health check endpoint
app.get('/', (req, res) => res.send('✅ API is live'));

// ✅ MongoDB connection
mongoose.connect(process.env.MONGO_URI || 'mongodb+srv://preethi:1234567890@expensetracker.qxubd3s.mongodb.net/expensetracker?retryWrites=true&w=majority', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB error:', err));

// ✅ User schema/model
const User = mongoose.model('User', new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  company: { type: String, required: true }
}));

// ✅ Signup route
app.post('/signup', async (req, res) => {
  try {
    const { name, email, password, company } = req.body;
    if (!name || !email || !password || !company) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    if (await User.findOne({ email })) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    await new User({ name, email, password, company }).save();
    res.status(201).json({ message: 'Signup successful' });
  } catch (err) {
    console.error('❌ Signup error:', err);
    res.status(500).json({ message: 'Server error during signup' });
  }
});

// ✅ Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Listening on port ${PORT}`));
