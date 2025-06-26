const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// ✅ MongoDB Connection
mongoose.connect('mongodb+srv://preethi:1234567890@expensetracker.qxubd3s.mongodb.net/?retryWrites=true&w=majority&appName=expensetracker', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.error("❌ MongoDB Connection Error:", err));

// ✅ Mongoose Schemas
const Expense = mongoose.model('Expense', new mongoose.Schema({
  userEmail: { type: String, required: true },
  salary: { type: Number, required: true },
  expenditure: { type: Number, required: true },
  investment: { type: Number, required: true },
  savings: { type: Number, required: true },
  date: { type: String, required: true },
  profitLoss: { type: Number }
}));

const Team = mongoose.model('Team', new mongoose.Schema({
  email: { type: String, required: true }
}));

// ✅ Create reports directory if not exists
const reportsDir = path.join(__dirname, 'reports');
if (!fs.existsSync(reportsDir)) fs.mkdirSync(reportsDir);

// ➕ Add Expense and Generate Report
app.post('/expenses', async (req, res) => {
  try {
    const { userEmail, salary, expenditure, investment, savings, date } = req.body;

    // Validate input
    if (
      typeof userEmail !== 'string' ||
      typeof salary !== 'number' ||
      typeof expenditure !== 'number' ||
      typeof investment !== 'number' ||
      typeof savings !== 'number' ||
      typeof date !== 'string'
    ) {
      return res.status(400).send({ message: 'Invalid or missing fields' });
    }

    const profitLoss = salary + investment + savings - expenditure;
    const expense = new Expense({ userEmail, salary, expenditure, investment, savings, date, profitLoss });
    await expense.save();

    // File names
    const timestamp = Date.now();
    const pdfFileName = `report_${userEmail.replace(/[^a-zA-Z0-9]/g, '_')}_${timestamp}.pdf`;
    const jsonFileName = `report_${userEmail.replace(/[^a-zA-Z0-9]/g, '_')}_${timestamp}.json`;
    const pdfPath = path.join(reportsDir, pdfFileName);
    const jsonPath = path.join(reportsDir, jsonFileName);

    // JSON Report
    const metadata = { userEmail, date, salary, expenditure, investment, savings, profitLoss };
    fs.writeFileSync(jsonPath, JSON.stringify(metadata, null, 2));

    // PDF Report
    const doc = new PDFDocument();
    doc.pipe(fs.createWriteStream(pdfPath));
    doc.fontSize(18).text('📊 Financial Report', { align: 'center' }).moveDown();
    doc.fontSize(12).text(`👤 User: ${userEmail}`);
    doc.text(`🗓️ Date: ${date}`);
    doc.text(`💼 Salary: ₹${salary}`);
    doc.text(`🧾 Expenditure: ₹${expenditure}`);
    doc.text(`📈 Investment: ₹${investment}`);
    doc.text(`💰 Savings: ₹${savings}`);
    doc.text(`\n${profitLoss >= 0 ? '✅ Profit' : '❌ Loss'}: ₹${profitLoss}`);
    doc.end();

    res.send({ message: '✅ Entry added & report generated', profitLoss });
  } catch (err) {
    console.error("❌ Error in /expenses:", err);
    res.status(500).send({ message: '❌ Failed to process request' });
  }
});

// 📜 List Reports for a User
app.get('/list-reports/:email', (req, res) => {
  const userEmail = req.params.email.replace(/[^a-zA-Z0-9]/g, '_');
  fs.readdir(reportsDir, (err, files) => {
    if (err) return res.status(500).send({ message: '❌ Failed to read directory' });
    const reports = files.filter(f => f.endsWith('.json') && f.includes(userEmail));
    res.send(reports);
  });
});

// 📊 Get Metadata from JSON file
app.get('/api/report-meta/:filename', (req, res) => {
  const file = req.params.filename;
  const filePath = path.join(reportsDir, file);
  if (!fs.existsSync(filePath)) {
    return res.status(404).send({ message: '❌ Metadata not found' });
  }

  const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  res.send(data);
});

// 📥 Download PDF
app.get('/download-report/:filename', (req, res) => {
  const filePath = path.join(reportsDir, req.params.filename);
  if (!fs.existsSync(filePath)) return res.status(404).send({ message: '❌ File not found' });
  res.download(filePath);
});

// 👥 View Team Members
app.get('/team', async (req, res) => {
  try {
    const members = await Team.find();
    res.send(members);
  } catch (err) {
    res.status(500).send({ message: '❌ Failed to fetch team' });
  }
});

// 👥 Add Team Member
app.post('/add-team', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).send({ message: 'Email is required' });

    const member = new Team({ email });
    await member.save();
    res.send({ message: '✅ Team member added' });
  } catch (err) {
    res.status(500).send({ message: '❌ Failed to add team member' });
  }
});

// ✅ Start Server
const PORT = 18000;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
