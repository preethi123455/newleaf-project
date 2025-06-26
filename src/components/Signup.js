// frontend/src/components/Signup.js
import React, { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';

const Signup = () => {
  const [form, setForm] = useState({ name: '', email: '', password: '', company: '' });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = e => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password || !form.company) {
      return alert("All fields are required.");
    }

    try {
      setLoading(true);
      const res = await axios.post('https://newleaf-project.onrender.com/signup', form);
      alert(res.data.message);
      navigate('/home');
    } catch (err) {
      alert(err.response?.data?.message || 'Signup failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>Create Account</h2>
      <form onSubmit={handleSubmit}>
        <input name="name" placeholder="Name" onChange={handleChange} style={styles.input} required />
        <input name="email" type="email" placeholder="Email" onChange={handleChange} style={styles.input} required />
        <input name="company" placeholder="Company" onChange={handleChange} style={styles.input} required />
        <input name="password" type="password" placeholder="Password" onChange={handleChange} style={styles.input} required />
        <button type="submit" style={styles.button} disabled={loading}>
          {loading ? 'Signing up...' : 'Sign Up'}
        </button>
      </form>
      <p style={styles.switchText}>
        Already have an account? <Link to="/login" style={styles.link}>Go to Login</Link>
      </p>
    </div>
  );
};

// Styles omitted for brevity...

export default Signup;
