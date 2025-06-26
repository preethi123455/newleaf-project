// frontend/src/components/Chat.js
import React, { useEffect, useState, useRef } from 'react';
import io from 'socket.io-client';
import axios from 'axios';

const socket = io('https://newleaf-project.onrender.com'); // Replace with your server URL

const Chat = () => {
  const [userEmail] = useState(localStorage.getItem('userEmail'));
  const [userName, setUserName] = useState(localStorage.getItem('userName') || 'Unknown');
  const [message, setMessage] = useState('');
  const [chat, setChat] = useState([]);
  const [file, setFile] = useState(null);
  const fileInputRef = useRef();

  // ✅ Fetch user name from backend if not in localStorage
  useEffect(() => {
    if (!userEmail) {
      alert('❗ Please log in to access the chat.');
      return;
    }

    const fetchUserName = async () => {
      try {
        const res = await axios.get('https://newleaf-project.onrender.com/users');
        const user = res.data.find(u => u.email === userEmail);
        if (user) {
          setUserName(user.name);
          localStorage.setItem('userName', user.name);
        }
      } catch (err) {
        console.error('❌ Failed to fetch user name:', err);
      }
    };

    if (!userName || userName === 'Unknown') {
      fetchUserName();
    }

    socket.emit('join', userEmail);

    socket.off('receive-message'); // remove existing to prevent duplicates
    socket.on('receive-message', (msg) => {
      setChat(prev => [...prev, msg]);
    });

    return () => socket.off('receive-message');
  }, [userEmail, userName]);

  // ✅ Send message (text or with file)
  const sendMessage = () => {
    if (!message && !file) return;

    const baseMsg = {
      senderEmail: userEmail,
      text: message,
    };

    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const msg = {
          ...baseMsg,
          fileName: file.name,
          fileUrl: reader.result
        };

        socket.emit('send-message', msg);
        setChat(prev => [...prev, { ...msg, senderName: userName }]);
        setFile(null);
        fileInputRef.current.value = null;
      };
      reader.readAsDataURL(file);
    } else {
      socket.emit('send-message', baseMsg);
      setChat(prev => [...prev, { ...baseMsg, senderName: userName }]);
    }

    setMessage('');
  };

  return (
    <div style={styles.container}>
      <h3>💬 Company Chat - <span style={{ color: '#1a73e8' }}>{userName}</span></h3>

      <div style={styles.chatBox}>
        {chat.map((msg, i) => (
          <div key={i} style={msg.senderName === userName ? styles.outgoing : styles.incoming}>
            <div><strong>{msg.senderName}:</strong> {msg.text}</div>
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
        <input
          type="file"
          ref={fileInputRef}
          onChange={e => setFile(e.target.files[0])}
          style={styles.fileInput}
        />
        <button onClick={sendMessage} style={styles.button}>Send</button>
      </div>
    </div>
  );
};

const styles = {
  container: {
    padding: '20px',
    maxWidth: '700px',
    margin: '0 auto',
    background: '#f5faff',
    borderRadius: '10px',
    fontFamily: 'Arial, sans-serif'
  },
  chatBox: {
    height: '350px',
    overflowY: 'auto',
    border: '1px solid #ccc',
    padding: '10px',
    marginBottom: '10px',
    background: '#fff',
    borderRadius: '8px',
    scrollBehavior: 'smooth'
  },
  inputBox: {
    display: 'flex',
    gap: '10px',
    flexWrap: 'wrap',
    alignItems: 'center'
  },
  input: {
    flex: 2,
    padding: '10px',
    borderRadius: '5px',
    border: '1px solid #ccc'
  },
  fileInput: {
    flex: 1
  },
  button: {
    padding: '10px 16px',
    border: 'none',
    borderRadius: '5px',
    backgroundColor: '#1a73e8',
    color: '#fff',
    fontWeight: 'bold',
    cursor: 'pointer'
  },
  incoming: {
    textAlign: 'left',
    padding: '8px',
    backgroundColor: '#e8f0fe',
    margin: '6px 0',
    borderRadius: '8px'
  },
  outgoing: {
    textAlign: 'right',
    padding: '8px',
    backgroundColor: '#d0f0c0',
    margin: '6px 0',
    borderRadius: '8px'
  }
};

export default Chat;
