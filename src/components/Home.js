// frontend/src/components/Home.js
import React from 'react';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const navigate = useNavigate();

  return (
    <div style={styles.container}>
      <h1 style={styles.heading}>Welcome to Expense Tracker</h1>
      <p style={styles.tagline}>Track your company's expenses efficiently and securely.</p>

      <div style={styles.cardContainer}>
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>Add Expense</h3>
          <p style={styles.cardText}>Record and manage business expenditures with ease.</p>
          <button style={styles.button} onClick={() => navigate('/add-expense')}>Go</button>
        </div>

    

        <div style={styles.card}>
          <h3 style={styles.cardTitle}>Team Convo</h3>
          <p style={styles.cardText}>Collaborate and discuss with your team securely and effectively.</p>
          <button style={styles.button} onClick={() => navigate('/team-access')}>Go</button>
        </div>

    
      </div>
    </div>
  );
};

const styles = {
  container: {
    padding: '40px 20px',
    backgroundColor: '#f0f8ff',
    minHeight: '100vh',
    textAlign: 'center',
  },
  heading: {
    color: '#1a73e8',
    fontSize: '32px',
    fontWeight: 'bold',
    marginBottom: '10px',
  },
  tagline: {
    color: '#333',
    fontSize: '18px',
    marginBottom: '30px',
  },
  cardContainer: {
    display: 'flex',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: '20px',
  },
  card: {
    backgroundColor: '#ffffff',
    padding: '20px',
    width: '280px',
    borderRadius: '10px',
    boxShadow: '0 6px 18px rgba(0,0,0,0.1)',
    transition: 'transform 0.2s',
  },
  cardTitle: {
    color: '#1a73e8',
    fontSize: '20px',
    marginBottom: '10px',
  },
  cardText: {
    color: '#555',
    fontSize: '15px',
  },
  button: {
    marginTop: '15px',
    padding: '10px 20px',
    backgroundColor: '#1a73e8',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: 'bold',
  },
};

export default Home;
