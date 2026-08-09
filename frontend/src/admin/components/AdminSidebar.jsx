import React from 'react';

const AdminSidebar = ({ activePage, setActivePage, collapsed, setCollapsed }) => {
  const navSections = [
    {
      title: 'MAIN',
      items: [
        { id: 'admin-dashboard', icon: '📊', label: 'Dashboard' },
        { id: 'admin-users', icon: '👤', label: 'Users' },
        { id: 'admin-kyc', icon: '🪪', label: 'KYC' },
        { id: 'admin-transactions', icon: '💰', label: 'Transactions' },
      ]
    },
    {
      title: 'TRADING',
      items: [
        { id: 'admin-orders', icon: '📋', label: 'Orders' },
        { id: 'admin-markets', icon: '📊', label: 'Markets' },
      ]
    },
    {
      title: 'FINANCE',
      items: [
        { id: 'admin-deposits', icon: '📥', label: 'Deposits' },
        { id: 'admin-withdrawals', icon: '📤', label: 'Withdrawals' },
      ]
    },
    {
      title: 'SYSTEM',
      items: [
        { id: 'admin-settings', icon: '⚙️', label: 'Settings' },
      ]
    },
  ];

  const handleNavClick = (pageId) => {
    console.log('🔘 Admin nav clicked:', pageId);
    if (typeof setActivePage === 'function') {
      setActivePage(pageId);
    } else {
      console.error('❌ setActivePage is not a function!');
    }
  };

  return (
    <div className="admin-sidebar" style={{
      width: collapsed ? '72px' : '260px',
      background: 'rgba(255,255,255,0.02)',
      borderRight: '1px solid rgba(255,255,255,0.06)',
      height: '100vh',
      padding: '16px 12px',
      transition: 'width 0.3s ease',
      overflow: 'hidden',
      position: 'sticky',
      top: 0,
      flexShrink: 0,
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Logo */}
      <div className="sidebar-logo" style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '8px 0 16px 0',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        marginBottom: '16px'
      }}>
        <span style={{ fontSize: '28px', color: '#f0b90b' }}>👑</span>
        {!collapsed && <span style={{ fontSize: '18px', fontWeight: '700', color: '#f0b90b' }}>TradeFlow Admin</span>}
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden' }}>
        {navSections.map((section, idx) => (
          <div key={idx} style={{ marginBottom: '16px' }}>
            {!collapsed && (
              <div style={{
                fontSize: '10px',
                fontWeight: '600',
                color: '#848e9c',
                letterSpacing: '0.5px',
                padding: '4px 12px 8px 12px',
                textTransform: 'uppercase'
              }}>
                {section.title}
              </div>
            )}
            {section.items.map(item => (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  width: '100%',
                  padding: collapsed ? '10px 12px' : '10px 14px',
                  background: activePage === item.id ? 'rgba(240, 185, 11, 0.1)' : 'transparent',
                  border: 'none',
                  borderLeft: activePage === item.id ? '3px solid #f0b90b' : '3px solid transparent',
                  color: activePage === item.id ? '#f0b90b' : '#848e9c',
                  cursor: 'pointer',
                  borderRadius: '4px',
                  fontSize: '14px',
                  textAlign: 'left',
                  transition: 'all 0.2s',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  marginBottom: '2px'
                }}
              >
                <span style={{ fontSize: '18px', minWidth: '24px' }}>{item.icon}</span>
                {!collapsed && <span>{item.label}</span>}
              </button>
            ))}
          </div>
        ))}
      </nav>

      {/* Collapse Toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        style={{
          padding: '8px',
          background: 'transparent',
          border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: '4px',
          color: '#848e9c',
          cursor: 'pointer',
          fontSize: '16px',
          marginTop: '8px'
        }}
      >
        {collapsed ? '➡️' : '⬅️'}
      </button>
    </div>
  );
};

export default AdminSidebar;