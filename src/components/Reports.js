// Reports.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Reports = () => {
  const [files, setFiles] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:18000/list-reports')
      .then(res => setFiles(res.data))
      .catch(() => alert('Failed to fetch reports'));
  }, []);

  const handleDownload = (fileName) => {
    window.open(`http://localhost:18000/download-report/${fileName}`, '_blank');
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>Available Financial Reports</h2>
      {files.length === 0 ? (
        <p>No reports available</p>
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
  container: { textAlign: 'center', padding: '40px', backgroundColor: '#f0f8ff', borderRadius: '12px' },
  heading: { color: '#1a73e8', fontSize: '24px', marginBottom: '20px' },
  list: { listStyle: 'none', padding: 0 },
  listItem: { marginBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', background: '#fff', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' },
  button: { padding: '6px 12px', backgroundColor: '#1a73e8', color: 'white', border: 'none', borderRadius: '6px', fontSize: '14px', cursor: 'pointer' }
};

export default Reports;
