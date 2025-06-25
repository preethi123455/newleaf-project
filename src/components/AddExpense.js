import React, { useState, useEffect } from 'react';
import jsPDF from 'jspdf';
import 'jspdf-autotable'; // Required for table support

const Tracker = () => {
  const [form, setForm] = useState({ revenue: '', date: '' });
  const [expenses, setExpenses] = useState([{ type: '', amount: '' }]);
  const [history, setHistory] = useState([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem('companyExpenseHistory')) || [];
    setHistory(stored);
  }, []);

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleExpenseChange = (index, e) => {
    const { name, value } = e.target;
    const updated = [...expenses];
    updated[index][name] = value;
    setExpenses(updated);
  };

  const addExpense = () => {
    setExpenses([...expenses, { type: '', amount: '' }]);
  };

  const removeExpense = (index) => {
    const updated = [...expenses];
    updated.splice(index, 1);
    setExpenses(updated);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const totalExpenditure = expenses.reduce((sum, e) => sum + Number(e.amount || 0), 0);
    const profitLoss = Number(form.revenue || 0) - totalExpenditure;

    const entry = {
      ...form,
      revenue: Number(form.revenue),
      expenses,
      totalExpenditure,
      profitLoss,
    };

    const updatedHistory = [...history, entry];
    localStorage.setItem('companyExpenseHistory', JSON.stringify(updatedHistory));
    setHistory(updatedHistory);
    setForm({ revenue: '', date: '' });
    setExpenses([{ type: '', amount: '' }]);
    setMessage('✅ Entry saved successfully!');
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text('Company Expense Report', 14, 22);

    const tableRows = history.map((entry, index) => {
      const diff = index > 0 ? entry.profitLoss - history[index - 1].profitLoss : '-';
      return [
        entry.date,
        `₹${entry.revenue}`,
        `₹${entry.totalExpenditure}`,
        entry.profitLoss >= 0 ? `+₹${entry.profitLoss}` : `-₹${Math.abs(entry.profitLoss)}`,
        typeof diff === 'number' ? (diff >= 0 ? `+₹${diff}` : `-₹${Math.abs(diff)}`) : '-',
      ];
    });

    doc.autoTable({
      startY: 30,
      head: [['Date', 'Revenue', 'Expenses', 'Profit/Loss', 'Δ vs Prev']],
      body: tableRows,
    });

    history.forEach((entry, i) => {
      doc.addPage();
      doc.setFontSize(14);
      doc.text(`Entry ${i + 1} - ${entry.date}`, 14, 20);
      doc.text(`Revenue: ₹${entry.revenue}`, 14, 30);
      doc.text(`Total Expenses: ₹${entry.totalExpenditure}`, 14, 40);
      doc.text(`Profit/Loss: ₹${entry.profitLoss}`, 14, 50);

      const expenseTable = entry.expenses.map((e) => [e.type, `₹${e.amount}`]);
      doc.autoTable({
        startY: 60,
        head: [['Expense Type', 'Amount']],
        body: expenseTable,
      });
    });

    doc.save('Expense_Report.pdf');
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>📊 Company Expense Tracker</h2>
      <form onSubmit={handleSubmit} style={styles.form}>
        <input
          type="number"
          name="revenue"
          value={form.revenue}
          onChange={handleFormChange}
          placeholder="💰 Revenue (₹)"
          required
          style={styles.input}
        />
        <input
          type="date"
          name="date"
          value={form.date}
          onChange={handleFormChange}
          required
          style={styles.input}
        />
        <h4 style={{ color: '#1a73e8' }}>🧾 Expenses</h4>
        {expenses.map((exp, idx) => (
          <div key={idx} style={styles.expenseRow}>
            <input
              type="text"
              name="type"
              placeholder="Type (e.g., Marketing)"
              value={exp.type}
              onChange={(e) => handleExpenseChange(idx, e)}
              required
              style={{ ...styles.input, flex: 2 }}
            />
            <input
              type="number"
              name="amount"
              placeholder="Amount (₹)"
              value={exp.amount}
              onChange={(e) => handleExpenseChange(idx, e)}
              required
              style={{ ...styles.input, flex: 1, marginLeft: '10px' }}
            />
            {idx > 0 && (
              <button type="button" onClick={() => removeExpense(idx)} style={styles.removeBtn}>
                ❌
              </button>
            )}
          </div>
        ))}
        <button type="button" onClick={addExpense} style={styles.addBtn}>➕ Add Expense</button>
        <button type="submit" style={styles.button}>Submit</button>
      </form>
      {message && <p style={styles.message}>{message}</p>}
      {history.length > 0 && (
        <div style={{ textAlign: 'center', marginTop: '30px' }}>
          <button onClick={generatePDF} style={styles.exportBtn}>📥 Download PDF Report</button>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    maxWidth: '600px',
    margin: '50px auto',
    padding: '30px',
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    boxShadow: '0 6px 18px rgba(0, 0, 0, 0.1)',
    fontFamily: 'Segoe UI, sans-serif',
    border: '2px solid #1a73e8',
  },
  heading: {
    textAlign: 'center',
    color: '#1a73e8',
    fontSize: '26px',
    fontWeight: 'bold',
    marginBottom: '20px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
  },
  input: {
    padding: '10px',
    marginBottom: '14px',
    borderRadius: '6px',
    border: '1px solid #ccc',
    fontSize: '15px',
  },
  button: {
    padding: '10px',
    backgroundColor: '#1a73e8',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: 'bold',
  },
  addBtn: {
    padding: '10px',
    backgroundColor: '#e8f0fe',
    color: '#1a73e8',
    border: '1px dashed #1a73e8',
    borderRadius: '6px',
    fontWeight: 'bold',
    cursor: 'pointer',
    marginBottom: '14px',
  },
  removeBtn: {
    marginLeft: '10px',
    padding: '6px',
    backgroundColor: '#fce4ec',
    color: '#d32f2f',
    border: 'none',
    borderRadius: '6px',
    fontWeight: 'bold',
    cursor: 'pointer',
  },
  expenseRow: {
    display: 'flex',
    marginBottom: '10px',
    alignItems: 'center',
  },
  message: {
    fontSize: '14px',
    color: '#34a853',
    textAlign: 'center',
    marginTop: '10px',
  },
  exportBtn: {
    padding: '12px 20px',
    backgroundColor: '#34a853',
    color: '#fff',
    fontWeight: 'bold',
    borderRadius: '6px',
    border: 'none',
    cursor: 'pointer',
  },
};

export default Tracker;
