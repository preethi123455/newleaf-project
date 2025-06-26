// frontend/src/components/Login.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';

const Login = () => {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: ''
  });

  const [userOptions, setUserOptions] = useState([]);
  const navigate = useNavigate();

  // ✅ Fetch all users for name dropdown
  useEffect(() => {
    axios.get('https://newleaf-project.onrender.com/users')
      .then((res) => setUserOptions(res.data))
      .catch(() => alert('⚠️ Failed to fetch user list'));
  }, []);

  // ✅ Update form on change
  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // ✅ Handle login
  const handleSubmit = async (e) => {
    e.preventDefault();

    const { name, email, password } = form;

    if (!name || !email || !password) {
      alert('Please fill all fields.');
      return;
    }

    const matchedUser = userOptions.find(u => u.email === email && u.name === name);
    if (!matchedUser) {
      alert('⛔ Name and Email do not match.');
      return;
    }

    try {
      const res = await axios.post('https://newleaf-project.onrender.com/login', {
        email,
        password
      });

      alert(res.data.message || 'Login successful');

      // ✅ Store user info for later use
      localStorage.setItem('userEmail', email);
      localStorage.setItem('userName', name);
      localStorage.setItem('userCompany', matchedUser.company);

      navigate('/home');
    } catch (err) {
      alert(err.response?.data?.message || '❌ Login failed');
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>Login</h2>
      <form onSubmit={handleSubmit}>
        <select
          style={styles.input}
          name="name"
          value={form.name}
          onChange={handleChange}
          required
        >
          <option value="">Select your name</option>
          {userOptions.map((user, idx) => (
            <option key={idx} value={user.name}>{user.name}</option>
          ))}
        </select>

        <input
          style={styles.input}
          type="email"
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          required
        />

        <input
          style={styles.input}
          type="password"
          name="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          required
        />

        <button style={styles.button} type="submit">Login</button>
      </form>

      <p style={styles.switchText}>
        Don’t have an account?{' '}
        <Link to="/signup" style={styles.link}>Go to Signup</Link>
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

export default Login;
