import React, { useState, useEffect } from 'react';

const Notification = ({ message, type, onClose }) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      if (onClose) onClose();
    }, 5000);
    return () => clearTimeout(timer);
  }, []);

  if (!visible) return null;

  const colors = {
    success: '#0ecb81',
    pending: '#f0b90b',
    error: '#f6465d',
    info: '#1e80ff'
  };

  return (
    <div className="notification" style={{ borderLeft: `4px solid ${colors[type] || '#848e9c'}` }}>
      <div className="notification-content">
        <span className="notification-icon">
          {type === 'success' && '✅'}
          {type === 'pending' && '⏳'}
          {type === 'error' && '❌'}
          {type === 'info' && 'ℹ️'}
        </span>
        <span className="notification-message">{message}</span>
      </div>
      <button className="notification-close" onClick={() => { setVisible(false); if (onClose) onClose(); }}>✕</button>
    </div>
  );
};

export default Notification;