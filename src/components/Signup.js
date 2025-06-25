// frontend/src/components/Signup.js
import React, { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';

const Signup = () => {
  const [form, setForm] = useState({ name: '', email: '', password: '', company: '' });
  const navigate = useNavigate();

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5000/signup', form);
      alert(res.data.message);
      navigate('/home');
    } catch (err) {
      alert(err.response?.data?.message || 'Signup failed');
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>Create Account</h2>
      <form onSubmit={handleSubmit}>
        <input style={styles.input} type="text" name="name" placeholder="Your Name" onChange={handleChange} required />
        <input style={styles.input} type="email" name="email" placeholder="Email" onChange={handleChange} required />
        <input style={styles.input} type="text" name="company" placeholder="Company Name" onChange={handleChange} required />
        <input style={styles.input} type="password" name="password" placeholder="Password" onChange={handleChange} required />
        <button style={styles.button} type="submit">Sign Up</button>
      </form>
      <p style={styles.switchText}>
        Already have an account? <Link to="/login" style={styles.link}>Go to Login</Link>
      </p>
    </div>
  );
};

const styles = {
  container: {
    backgroundColor: '#e8f0fe',
    maxWidth: '400px',
    margin: '80px auto',
    padding: '30px',
    borderRadius: '12px',
    boxShadow: '0 8px 20px rgba(0, 0, 0, 0.15)',
  },
  heading: {
    textAlign: 'center',
    marginBottom: '20px',
    color: '#1a73e8',
  },
  input: {
    width: '100%',
    padding: '12px',
    margin: '10px 0',
    borderRadius: '8px',
    border: '1px solid #ccc',
    fontSize: '14px',
  },
  button: {
    width: '100%',
    padding: '12px',
    backgroundColor: '#1a73e8',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    cursor: 'pointer',
    marginTop: '10px',
  },
  switchText: {
    marginTop: '15px',
    textAlign: 'center',
    fontSize: '14px',
  },
  link: {
    color: '#1a73e8',
    textDecoration: 'none',
    fontWeight: 'bold',
  },
};

export default Signup;
