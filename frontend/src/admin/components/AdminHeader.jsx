import React from 'react';

const AdminHeader = ({ sidebarCollapsed, setSidebarCollapsed, onLogout, user }) => {
  return (
    <header className="admin-header" style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '12px 24px',
      background: 'rgba(255,255,255,0.02)',
      borderBottom: '1px solid rgba(255,255,255,0.06)',
      minHeight: '60px'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          style={{
            background: 'none',
            border: 'none',
            color: '#848e9c',
            fontSize: '20px',
            cursor: 'pointer'
          }}
        >
          ☰
        </button>
        <span style={{ color: '#848e9c', fontSize: '14px' }}>Admin Panel</span>
        <span style={{ 
          color: '#0ecb81', 
          fontSize: '12px',
          background: 'rgba(14, 203, 129, 0.1)',
          padding: '2px 10px',
          borderRadius: '12px'
        }}>
          ● Live
        </span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <span style={{ color: '#848e9c', fontSize: '13px' }}>
          👋 {user?.name || 'Admin'}
        </span>
        <button
          onClick={onLogout}
          style={{
            padding: '6px 16px',
            background: 'rgba(246, 70, 93, 0.1)',
            border: '1px solid rgba(246, 70, 93, 0.2)',
            borderRadius: '6px',
            color: '#f6465d',
            cursor: 'pointer',
            fontSize: '13px',
            fontWeight: '600',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => {
            e.target.style.background = 'rgba(246, 70, 93, 0.2)';
          }}
          onMouseLeave={(e) => {
            e.target.style.background = 'rgba(246, 70, 93, 0.1)';
          }}
        >
          🚪 Logout
        </button>
        <div style={{
          width: '32px',
          height: '32px',
          borderRadius: '50%',
          background: '#f0b90b',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: '700',
          color: '#0a0b0e',
          fontSize: '14px'
        }}>
          {(user?.name || 'A').charAt(0).toUpperCase()}
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;