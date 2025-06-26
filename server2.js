// backend/server.js
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
mongoose.connect(
  process.env.MONGO_URI || 'mongodb+srv://preethi:1234567890@expensetracker.qxubd3s.mongodb.net/expensetracker?retryWrites=true&w=majority&appName=expensetracker',
  { useNewUrlParser: true, useUnifiedTopology: true }
)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.error("❌ MongoDB Connection Error:", err));

// ✅ MongoDB Schemas
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

// ✅ Directory for reports
const reportsDir = path.join(__dirname, 'reports');
if (!fs.existsSync(reportsDir)) fs.mkdirSync(reportsDir);

// ✅ Health check route
app.get('/', (req, res) => {
  res.send('✅ Expense Tracker API is running');
});

// ➕ Add Expense & Generate Report
app.post('/expenses', async (req, res) => {
  try {
    const { userEmail, salary, expenditure, investment, savings, date } = req.body;

    if (
      !userEmail || isNaN(salary) || isNaN(expenditure) || isNaN(investment) || isNaN(savings) || !date
    ) {
      return res.status(400).send({ message: 'All fields are required and must be valid' });
    }

    const profitLoss = salary + investment + savings - expenditure;
    const expense = new Expense({ userEmail, salary, expenditure, investment, savings, date, profitLoss });
    await expense.save();

    // Sanitize email for filenames
    const safeEmail = userEmail.replace(/[^a-zA-Z0-9]/g, '_');
    const timestamp = Date.now();
    const pdfFileName = `report_${safeEmail}_${timestamp}.pdf`;
    const jsonFileName = `report_${safeEmail}_${timestamp}.json`;
    const pdfPath = path.join(reportsDir, pdfFileName);
    const jsonPath = path.join(reportsDir, jsonFileName);

    // JSON metadata
    const metadata = { userEmail, date, salary, expenditure, investment, savings, profitLoss };
    fs.writeFileSync(jsonPath, JSON.stringify(metadata, null, 2));

    // PDF generation
    const doc = new PDFDocument();
    doc.pipe(fs.createWriteStream(pdfPath));
    doc.fontSize(18).text('📊 Financial Report', { align: 'center' }).moveDown();
    doc.fontSize(12).text(`👤 User: ${userEmail}`);
    doc.text(`🗓️ Date: ${date}`);
    doc.text(`💼 Salary: ₹${salary}`);
    doc.text(`🧾 Expenditure: ₹${expenditure}`);
    doc.text(`📈 Investment: ₹${investment}`);
    doc.text(`💰 Savings: ₹${savings}`);
    doc.moveDown();
    doc.fontSize(13).fillColor(profitLoss >= 0 ? 'green' : 'red')
       .text(`${profitLoss >= 0 ? '✅ Profit' : '❌ Loss'}: ₹${profitLoss}`);
    doc.end();

    res.send({ message: '✅ Entry added & report generated', profitLoss });
  } catch (err) {
    console.error("❌ Error in /expenses:", err);
    res.status(500).send({ message: '❌ Failed to process request' });
  }
});

// 📜 List Reports
app.get('/list-reports/:email', (req, res) => {
  const safeEmail = req.params.email.replace(/[^a-zA-Z0-9]/g, '_');
  fs.readdir(reportsDir, (err, files) => {
    if (err) return res.status(500).send({ message: '❌ Failed to read directory' });
    const reports = files.filter(f => f.endsWith('.json') && f.includes(safeEmail));
    res.send(reports);
  });
});

// 📊 Fetch JSON Metadata
app.get('/api/report-meta/:filename', (req, res) => {
  const file = path.basename(req.params.filename); // avoid path traversal
  const filePath = path.join(reportsDir, file);

  if (!fs.existsSync(filePath)) {
    return res.status(404).send({ message: '❌ Metadata not found' });
  }

  const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  res.send(data);
});

// 📥 Download PDF
app.get('/download-report/:filename', (req, res) => {
  const file = path.basename(req.params.filename);
  const filePath = path.join(reportsDir, file);
  if (!fs.existsSync(filePath)) return res.status(404).send({ message: '❌ File not found' });
  res.download(filePath);
});

// 👥 View Team
app.get('/team', async (req, res) => {
  try {
    const members = await Team.find();
    res.send(members);
  } catch (err) {
    console.error("❌ Team fetch error:", err);
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
    console.error("❌ Add team error:", err);
    res.status(500).send({ message: '❌ Failed to add team member' });
  }
});

// ✅ Start Server
const PORT = process.env.PORT || 18000;
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
