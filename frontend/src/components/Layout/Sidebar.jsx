import React from 'react';

const Sidebar = ({ activePage, setActivePage }) => {
  const items = [
    { id: 'dashboard', icon: '📊', label: 'Dashboard' },
    { id: 'markets', icon: '📈', label: 'Markets' },
    { id: 'trade', icon: '🔄', label: 'Trade' },
    { id: 'contracts', icon: '📋', label: 'Contracts' },
    { id: 'assets', icon: '💰', label: 'Assets' },
    { id: 'settings', icon: '⚙️', label: 'Settings' },
    { id: 'account', icon: '👤', label: 'Account' },
  ];

  return (
    <aside className="sidebar">
      {items.map(item => (
        <button
          key={item.id}
          className={`sidebar-item ${activePage === item.id ? 'active' : ''}`}
          onClick={() => setActivePage(item.id)}
        >
          <span className="sidebar-icon">{item.icon}</span>
          <span className="sidebar-label">{item.label}</span>
        </button>
      ))}
    </aside>
  );
};

export default Sidebar;