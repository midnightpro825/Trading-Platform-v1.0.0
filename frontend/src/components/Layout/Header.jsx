import React, { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';

const Header = ({ activePage, setActivePage, isAdmin, navItems }) => {
  const { user, balance, isLoggedIn } = useContext(AuthContext);

  // Get user display name
  const displayName = user?.name || 'Guest';
  const displayAvatar = user?.name ? user.name.charAt(0).toUpperCase() : 'G';
  const displayBalance = balance?.toFixed(2) || '0.00';

  console.log('👤 Header rendering:', {
    userName: user?.name,
    isLoggedIn,
    balance: displayBalance,
    userRole: user?.role
  });

  return (
    <header className="header">
      <div className="header-left">
        <div className="logo">
          <span className="logo-icon">▲</span>
          <span className="logo-text">TradeFlow</span>
        </div>
        {user?.role === 'admin' && (
          <span style={{
            background: '#f0b90b',
            color: '#0a0b0e',
            fontSize: '10px',
            fontWeight: '700',
            padding: '2px 10px',
            borderRadius: '12px',
            marginLeft: '8px'
          }}>
            ADMIN
          </span>
        )}
      </div>
      <div className="header-right">
        <span className="header-balance">💰 ${displayBalance}</span>
        <div className="user-profile">
          <span className="user-name">{displayName}</span>
          <div className="user-avatar" style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            background: user?.name && user.name !== 'Guest' ? '#f0b90b' : '#2a2e39',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: '700',
            color: user?.name && user.name !== 'Guest' ? '#0a0b0e' : '#848e9c',
            fontSize: '14px'
          }}>
            {displayAvatar}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
