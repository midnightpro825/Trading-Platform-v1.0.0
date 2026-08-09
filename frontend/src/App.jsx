import React, { useState, useEffect, useContext } from 'react';
import './App.css';
import './theme.css';
import Header from './components/Layout/Header';
import BottomNav from './components/Layout/BottomNav';
import Dashboard from './components/Dashboard';
import Markets from './components/Markets';
import Trade from './components/Trade';
import Contracts from './components/Contracts';
import Assets from './components/Assets';
import Settings from './components/Settings';
import Account from './components/Account';
import Register from './pages/Register';
import Login from './pages/Login';
import LandingPage from './pages/LandingPage';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, AuthContext } from './context/AuthContext';

const AppContent = () => {
  const [activePage, setActivePage] = useState('dashboard');
  const [isLoading, setIsLoading] = useState(true);
  const { setIsLoggedIn, setUser, setBalance } = useContext(AuthContext);
  
  const path = window.location.pathname;
  console.log('📍 Current path:', path);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    
    if (savedUser && token) {
      try {
        const parsedUser = JSON.parse(savedUser);
        console.log('✅ User found:', parsedUser.name);
        setUser(parsedUser);
        setIsLoggedIn(true);
      } catch (error) {
        console.error('Error parsing user:', error);
        localStorage.clear();
      }
    }
    setIsLoading(false);
  }, []);

  // Show login/register pages
  if (path === '/login' || path === '/login/') {
    return <Login />;
  }
  if (path === '/register' || path === '/register/') {
    return <Register />;
  }
  
  // Show landing page for root path
  if (path === '/' || path === '/index.html' || path === '') {
    return <LandingPage />;
  }

  if (isLoading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner">🚀</div>
        <p style={{ color: '#848e9c' }}>TradeFlow Loading...</p>
      </div>
    );
  }

  const renderPage = () => {
    switch(activePage) {
      case 'dashboard': return <Dashboard setActivePage={setActivePage} />;
      case 'markets': return <Markets setActivePage={setActivePage} />;
      case 'trade': return <Trade />;
      case 'contracts': return <Contracts />;
      case 'assets': return <Assets />;
      case 'settings': return <Settings />;
      case 'account': return <Account />;
      default: return <Dashboard setActivePage={setActivePage} />;
    }
  };

  return (
    <div className="app">
      <Header activePage={activePage} setActivePage={setActivePage} />
      <div className="app-body">
        <main className="main-content">{renderPage()}</main>
      </div>
      <BottomNav activePage={activePage} setActivePage={setActivePage} />
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <AppContent />
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;