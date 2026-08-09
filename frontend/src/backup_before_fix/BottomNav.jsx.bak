import React from 'react';

const BottomNav = ({ activePage, setActivePage }) => {
  const navItems = [
    { id: 'dashboard', icon: '📊', label: 'Dashboard' },
    { id: 'markets', icon: '📈', label: 'Markets' },
    { id: 'trade', icon: '🔄', label: 'Trade' },
    { id: 'contracts', icon: '📋', label: 'Contracts' },
    { id: 'assets', icon: '💰', label: 'Assets' },
    { id: 'settings', icon: '⚙️', label: 'Settings' },
    { id: 'account', icon: '👤', label: 'Account' },
  ];

  return (
    <nav className="bottom-nav">
      {navItems.map((item) => (
        <button
          key={item.id}
          className={`bottom-nav-item ${activePage === item.id ? 'active' : ''}`}
          onClick={() => setActivePage(item.id)}
          aria-label={item.label}
        >
          <span className="bottom-nav-icon">{item.icon}</span>
          <span className="bottom-nav-label">{item.label}</span>
        </button>
      ))}
    </nav>
  );
};

export default BottomNav;