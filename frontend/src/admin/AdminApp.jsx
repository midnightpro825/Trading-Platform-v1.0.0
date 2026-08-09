import React, { useState, useEffect } from 'react';
import AdminLayout from './layouts/AdminLayout';
import AdminDashboard from './pages/Dashboard';
import Users from './pages/Users';
import KYC from './pages/KYC';
import Deposits from './pages/Deposits';
import Withdrawals from './pages/Withdrawals';
import Orders from './pages/Orders';
import Transactions from './pages/Transactions';
import Markets from './pages/Markets';
import AdminSettings from './pages/Settings';

const AdminApp = () => {
  const [activePage, setActivePage] = useState('admin-dashboard');
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Check authentication
    const token = localStorage.getItem('token');
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    
    console.log('🔍 Admin App - Checking authentication...');
    console.log('Token:', token ? '✅ Present' : '❌ Missing');
    console.log('User:', userData);
    
    // Check if user is logged in and has admin role
    if (token && userData.role === 'admin') {
      setIsAuthenticated(true);
      setUser(userData);
      console.log('✅ Admin authenticated:', userData.name);
    } else {
      console.log('❌ Not authenticated as admin');
      // Redirect to admin login page
      window.location.href = '/admin-login.html';
      return;
    }
    
    setIsLoading(false);
  }, []);

  // Handle logout
  const handleLogout = () => {
    if (confirm('Are you sure you want to logout from admin panel?')) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/admin-login.html';
    }
  };

  if (isLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        background: '#0a0b0e',
        flexDirection: 'column',
        gap: '16px'
      }}>
        <div style={{ fontSize: '40px' }}>👑</div>
        <div style={{ color: '#848e9c' }}>Loading admin panel...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const renderPage = () => {
    switch(activePage) {
      case 'admin-dashboard': return <AdminDashboard />;
      case 'admin-users': return <Users />;
      case 'admin-kyc': return <KYC />;
      case 'admin-deposits': return <Deposits />;
      case 'admin-withdrawals': return <Withdrawals />;
      case 'admin-orders': return <Orders />;
      case 'admin-transactions': return <Transactions />;
      case 'admin-markets': return <Markets />;
      case 'admin-settings': return <AdminSettings />;
      default: return <AdminDashboard />;
    }
  };

  // Wrap children with logout handler passed down
  const childrenWithProps = React.Children.map(renderPage(), child => {
    if (React.isValidElement(child)) {
      return React.cloneElement(child, { onLogout: handleLogout });
    }
    return child;
  });

  return (
    <AdminLayout 
      activePage={activePage} 
      setActivePage={setActivePage}
      onLogout={handleLogout}
      user={user}
    >
      {childrenWithProps}
    </AdminLayout>
  );
};

export default AdminApp;
