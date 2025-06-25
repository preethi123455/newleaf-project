// frontend/src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Signup from './components/Signup';
import Login from './components/Login';
import Home from './components/Home';
import AddExpense from './components/AddExpense';
import TeamAccess from './components/TeamAccess';



function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/home" element={<Home />} />
        <Route path="/add-expense" element={<AddExpense />} />
        <Route path="/team-access" element={<TeamAccess />} />

      </Routes>
    </Router>
  );
}

export default App;
