import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';
import axios from 'axios';

const socket = io('https://newleaf-project.onrender.com'); // socket server

const Chat = () => {
  const userEmail = localStorage.getItem('userEmail'); // store during login
  const [userName, setUserName] = useState(localStorage.getItem('userName') || 'Unknown');
  const [message, setMessage] = useState('');
  const [chat, setChat] = useState([]);
  const [file, setFile] = useState(null);

  // ✅ Fetch name from backend if not in localStorage
  useEffect(() => {
    const fetchUserName = async () => {
      try {
        const res = await axios.get('https://newleaf-project.onrender.com/users');
        const user = res.data.find(u => u.email === userEmail);
        if (user) {
          setUserName(user.name);
          localStorage.setItem('userName', user.name);
        }
      } catch (err) {
        console.error('Failed to fetch user name:', err);
      }
    };

    if (!userName || userName === 'Unknown') {
      fetchUserName();
    }

    socket.emit('join', userEmail);

    socket.on('receive-message', (msg) => {
      setChat(prev => [...prev, msg]);
    });

    return () => {
      socket.off('receive-message');
    };
  }, [userEmail, userName]);

  // ✅ Send message (text or file)
  const sendMessage = () => {
    if (!message && !file) return;

    const msg = { sender: userName, text: message };

    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        msg.fileName = file.name;
        msg.fileUrl = reader.result;

        socket.emit('send-message', msg);
        setChat(prev => [...prev, msg]);
      };
      reader.readAsDataURL(file);
    } else {
      socket.emit('send-message', msg);
      setChat(prev => [...prev, msg]);
    }

    setMessage('');
    setFile(null);
  };

  return (
    <div style={styles.container}>
      <h3>💬 Company Chat - {userName}</h3>

      <div style={styles.chatBox}>
        {chat.map((msg, i) => (
          <div key={i} style={msg.sender === userName ? styles.outgoing : styles.incoming}>
            <strong>{msg.sender}:</strong> {msg.text}
            {msg.fileUrl && (
              <div>
                <a href={msg.fileUrl} download={msg.fileName} style={{ color: '#1a73e8' }}>
                  📎 {msg.fileName}
                </a>
              </div>
            )}
          </div>
        ))}
      </div>

      <div style={styles.inputBox}>
        <input
          type="text"
          value={message}
          onChange={e => setMessage(e.target.value)}
          placeholder="Type your message"
          style={styles.input}
        />
        <input type="file" onChange={e => setFile(e.target.files[0])} />
        <button onClick={sendMessage} style={styles.button}>Send</button>
      </div>
    </div>
  );
};

const styles = {
  container: {
    padding: '20px',
    maxWidth: '600px',
    margin: '0 auto',
    background: '#f9f9f9',
    borderRadius: '10px'
  },
  chatBox: {
    height: '300px',
    overflowY: 'scroll',
    border: '1px solid #ccc',
    padding: '10px',
    marginBottom: '10px',
    background: '#fff'
  },
  inputBox: {
    display: 'flex',
    gap: '10px',
    flexWrap: 'wrap'
  },
  input: {
    flex: 2,
    padding: '10px',
    borderRadius: '5px',
    border: '1px solid #ccc'
  },
  button: {
    padding: '10px 20px',
    border: 'none',
    borderRadius: '5px',
    backgroundColor: '#1a73e8',
    color: '#fff'
  },
  incoming: {
    textAlign: 'left',
    padding: '5px',
    backgroundColor: '#e8f0fe',
    margin: '4px',
    borderRadius: '5px'
  },
  outgoing: {
    textAlign: 'right',
    padding: '5px',
    backgroundColor: '#c2e7ff',
    margin: '4px',
    borderRadius: '5px'
  }
};

export default Chat;
