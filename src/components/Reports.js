// frontend/src/components/Reports.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Reports = () => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);

  const userEmail = localStorage.getItem('userEmail');

  useEffect(() => {
    if (!userEmail) {
      alert('⚠️ User not logged in. Please log in first.');
      return;
    }

    axios.get(`https://newleaf-project.onrender.com/list-reports/${encodeURIComponent(userEmail)}`)
      .then(res => {
        setFiles(res.data);
        setLoading(false);
      })
      .catch(err => {
        alert('❌ Failed to fetch reports');
        console.error(err);
        setLoading(false);
      });
  }, [userEmail]);

  const handleDownload = (fileName) => {
    window.open(`https://newleaf-project.onrender.com/download-report/${fileName}`, '_blank');
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>📁 Your Financial Reports</h2>

      {loading ? (
        <p>Loading...</p>
      ) : files.length === 0 ? (
        <p>No reports found for <strong>{userEmail}</strong>.</p>
      ) : (
        <ul style={styles.list}>
          {files.map((file, idx) => (
            <li key={idx} style={styles.listItem}>
              <span>{file}</span>
              <button onClick={() => handleDownload(file)} style={styles.button}>Download</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

const styles = {
  container: {
    textAlign: 'center',
    padding: '40px',
    backgroundColor: '#f0f8ff',
    borderRadius: '12px',
    maxWidth: '600px',
    margin: '50px auto'
  },
  heading: {
    color: '#1a73e8',
    fontSize: '24px',
    marginBottom: '20px'
  },
  list: {
    listStyle: 'none',
    padding: 0
  },
  listItem: {
    marginBottom: '10px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px 15px',
    background: '#fff',
    borderRadius: '8px',
    boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
    fontSize: '14px'
  },
  button: {
    padding: '6px 12px',
    backgroundColor: '#1a73e8',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    fontSize: '14px',
    cursor: 'pointer'
  }
};

export default Reports;
