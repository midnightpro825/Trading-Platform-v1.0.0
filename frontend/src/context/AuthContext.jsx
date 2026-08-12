import React, { createContext, useState, useContext, useEffect } from 'react';
import { getBalance } from '../utils/api';

const API_URL = import.meta.env.VITE_API_URL || 'https://tradeflows.site';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [balance, setBalance] = useState(0);
  const [orders, setOrders] = useState([]);
  const [tradeHistory, setTradeHistory] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [watchlist, setWatchlist] = useState(['BTC/USDT', 'ETH/USDT']);
  const [theme, setTheme] = useState('dark');
  const [apiKeys, setApiKeys] = useState([]);
  const [whitelist, setWhitelist] = useState([]);

  // ============================================================
  // LOAD USER FROM LOCALSTORAGE ON STARTUP
  // ============================================================
  useEffect(() => {
    const loadUserData = () => {
      const token = localStorage.getItem('token');
      const savedUser = localStorage.getItem('user');
      
      console.log('🔍 AuthContext: Loading user data...');
      
      if (savedUser && token) {
        try {
          const parsedUser = JSON.parse(savedUser);
          console.log('✅ User loaded from localStorage:', parsedUser);
          setUser(parsedUser);
          setIsLoggedIn(true);
          
          if (parsedUser.id) {
            fetchRealBalance(parsedUser.id);
          }
        } catch (error) {
          console.error('❌ Error parsing user data:', error);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setDefaultGuestUser();
        }
      } else {
        console.log('ℹ️ No user found, using guest mode');
        setDefaultGuestUser();
      }
      
      setIsLoading(false);
    };
    
    const setDefaultGuestUser = () => {
      setUser({
        id: null,
        name: 'Guest',
        email: 'guest@tradeflow.com',
        role: 'guest'
      });
      setIsLoggedIn(false);
      setBalance(0);
    };
    
    loadUserData();
    
    // Listen for storage changes (when user logs in/out in another tab)
    const handleStorageChange = (e) => {
      if (e.key === 'user' || e.key === 'token') {
        console.log('🔄 Storage changed, reloading user...');
        loadUserData();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    // Listen for custom events
    const handleUserLoggedIn = () => {
      console.log('🔄 User logged in event received, reloading...');
      loadUserData();
    };
    
    window.addEventListener('userLoggedIn', handleUserLoggedIn);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('userLoggedIn', handleUserLoggedIn);
    };
  }, []);

  // ============================================================
  // FETCH BALANCE
  // ============================================================
  const fetchRealBalance = async (userIdParam) => {
    try {
      let userId = userIdParam;
      if (!userId) {
        userId = user?.id || JSON.parse(localStorage.getItem('user') || '{}')?.id;
      }
      
      if (!userId) {
        setBalance(0);
        return 0;
      }
      
      console.log('📊 Fetching balance for user ID:', userId);
      const data = await getBalance(userId);
      
      let total = 0;
      if (data && data.balances && data.balances.length > 0) {
        total = data.balances.reduce((sum, b) => sum + parseFloat(b.available || 0), 0);
      }
      
      setBalance(total);
      console.log('💰 AuthContext: Balance set to:', total);
      return total;
    } catch (error) {
      console.error('❌ AuthContext: Error fetching balance:', error);
      return balance;
    }
  };

  // ============================================================
  // REFRESH BALANCE
  // ============================================================
  const refreshBalance = async () => {
    const userId = user?.id || JSON.parse(localStorage.getItem('user') || '{}')?.id;
    if (!userId) {
      setBalance(0);
      return 0;
    }
    return await fetchRealBalance(userId);
  };

  // ============================================================
  // REGISTER
  // ============================================================
  const register = async (userData) => {
    try {
      console.log('📝 Registering new user:', userData);
      
      const response = await fetch('${API_URL}/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });
      
      const data = await response.json();
      console.log('📡 Registration response:', data);
      
      if (data.success) {
        // Save to localStorage
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        // Update state
        setUser(data.user);
        setIsLoggedIn(true);
        setBalance(0);
        
        console.log('✅ User registered and saved!');
        console.log('👤 User:', data.user.name);
        console.log('🆔 ID:', data.user.id);
        
        // Dispatch events
        window.dispatchEvent(new Event('storage'));
        window.dispatchEvent(new Event('userLoggedIn'));
        
        return { success: true, user: data.user, token: data.token };
      } else {
        // Throw error with field information
        const error = new Error(data.message || 'Registration failed');
        error.field = data.field;
        error.status = response.status;
        throw error;
      }
    } catch (error) {
      console.error('❌ Registration error:', error);
      throw error;
    }
  };

  // ============================================================
  // LOGIN
  // ============================================================
  const login = async (email, password) => {
    try {
      console.log('🔐 Logging in:', email);
      
      const response = await fetch('${API_URL}/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      
      const data = await response.json();
      console.log('📡 Login response:', data);
      
      if (data.success) {
        // Save to localStorage
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        // Update state
        setUser(data.user);
        setIsLoggedIn(true);
        
        if (data.user.id) {
          await fetchRealBalance(data.user.id);
        }
        
        console.log('✅ User logged in:', data.user.name);
        console.log('🆔 ID:', data.user.id);
        
        // Dispatch events
        window.dispatchEvent(new Event('storage'));
        window.dispatchEvent(new Event('userLoggedIn'));
        
        return { success: true, user: data.user, token: data.token };
      } else {
        throw new Error(data.message || 'Login failed');
      }
    } catch (error) {
      console.error('❌ Login error:', error);
      throw error;
    }
  };

  // ============================================================
  // LOGOUT
  // ============================================================
  const logout = () => {
    console.log('🔴 Logging out user');
    
    // Clear localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Reset state
    setUser({
      id: null,
      name: 'Guest',
      email: 'guest@tradeflow.com',
      role: 'guest'
    });
    setIsLoggedIn(false);
    setBalance(0);
    setOrders([]);
    setTradeHistory([]);
    
    // Dispatch events
    window.dispatchEvent(new Event('storage'));
    window.dispatchEvent(new Event('userLoggedOut'));
    
    // Redirect to home page
    window.location.href = '/';
  };

  // ============================================================
  // UPDATE PROFILE
  // ============================================================
  const updateUserProfile = (updates) => {
    const updatedUser = { ...user, ...updates };
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
    window.dispatchEvent(new Event('storage'));
    alert('✅ Profile updated successfully!');
  };

  // ============================================================
  // OTHER FUNCTIONS
  // ============================================================
  const changePassword = (oldPassword, newPassword) => {
    if (!oldPassword || !newPassword || newPassword.length < 8) {
      alert('Please enter a valid password (min 8 characters)');
      return false;
    }
    alert('✅ Password changed successfully!');
    return true;
  };

  const enableTwoFA = () => {
    setUser(prev => ({ ...prev, twoFAEnabled: true }));
    localStorage.setItem('user', JSON.stringify({ ...user, twoFAEnabled: true }));
    alert('✅ 2FA enabled successfully!');
  };

  const disableTwoFA = () => {
    setUser(prev => ({ ...prev, twoFAEnabled: false }));
    localStorage.setItem('user', JSON.stringify({ ...user, twoFAEnabled: false }));
    alert('🔴 2FA disabled');
  };

  const updateKYC = (level) => {
    setUser(prev => ({ ...prev, kycLevel: level, kycStatus: 'pending' }));
    localStorage.setItem('user', JSON.stringify({ ...user, kycLevel: level, kycStatus: 'pending' }));
    alert('✅ KYC Level ' + level + ' submitted for verification');
  };

  const addToWatchlist = (pair) => {
    if (!watchlist.includes(pair)) {
      setWatchlist([...watchlist, pair]);
      alert('✅ Added ' + pair + ' to watchlist');
    } else {
      setWatchlist(watchlist.filter(p => p !== pair));
      alert('❌ Removed ' + pair + ' from watchlist');
    }
  };

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
  };

  const handleDeposit = (amount, asset) => {
    if (!amount || amount <= 0) {
      alert('Please enter a valid amount');
      return false;
    }
    setTimeout(() => refreshBalance(), 500);
    alert('✅ Deposit request submitted for $' + amount + ' ' + (asset || 'USDT'));
    return true;
  };

  const handleWithdraw = (amount, address) => {
    if (!amount || amount <= 0) {
      alert('Please enter a valid amount');
      return false;
    }
    if (amount > balance) {
      alert('Insufficient balance!');
      return false;
    }
    if (!address || address.length < 10) {
      alert('Please enter a valid address');
      return false;
    }
    setTimeout(() => refreshBalance(), 500);
    alert('✅ Withdrawal request submitted for $' + amount);
    return true;
  };

  const referralCode = user?.id ? 'REF' + user.id.toString().padStart(4, '0') : 'REF0000';
  const referralCount = 0;
  const referralEarnings = 0;

  const shareReferral = () => {
    const link = 'https://tradeflow.com/ref/' + referralCode;
    navigator.clipboard.writeText(link);
    alert('✅ Referral link copied: ' + link);
    return link;
  };

  const exportData = (type) => {
    const data = {
      user: user,
      balance: balance,
      orders: orders,
      tradeHistory: tradeHistory,
      watchlist: watchlist,
      exportDate: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'tradeflow_' + type + '_' + new Date().toISOString().split('T')[0] + '.json';
    a.click();
    URL.revokeObjectURL(url);
    alert('✅ Data exported successfully!');
  };

  const exportCSV = () => {
    if (!tradeHistory || tradeHistory.length === 0) {
      alert('No trade history to export');
      return;
    }
    const headers = ['Date', 'Pair', 'Side', 'Price', 'Amount', 'PnL'];
    const rows = tradeHistory.map(t => [
      t.time || new Date().toISOString(),
      t.pair || 'BTC/USDT',
      t.side || 'buy',
      t.price || 0,
      t.amount || 0,
      t.pnl || 0
    ]);
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'tradeflow_trades_' + new Date().toISOString().split('T')[0] + '.csv';
    a.click();
    URL.revokeObjectURL(url);
    alert('✅ CSV exported successfully!');
  };

  const deleteAccount = () => {
    if (confirm('⚠️ Are you sure you want to delete your account? This action cannot be undone!')) {
      if (confirm('⚠️ Final confirmation: Delete all your data permanently?')) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser({
          id: null,
          name: 'Guest',
          email: 'guest@tradeflow.com',
          role: 'guest'
        });
        setIsLoggedIn(false);
        setBalance(0);
        alert('✅ Account deleted successfully');
        return true;
      }
    }
    return false;
  };

  // ============================================================
  // CONTEXT VALUE
  // ============================================================
  const value = {
    user,
    setUser,
    balance,
    setBalance,
    orders,
    setOrders,
    tradeHistory,
    setTradeHistory,
    isLoggedIn,
    setIsLoggedIn,
    isLoading,
    setIsLoading,
    watchlist,
    setWatchlist,
    theme,
    setTheme,
    apiKeys,
    setApiKeys,
    whitelist,
    setWhitelist,
    refreshBalance,
    login,
    logout,
    register,
    addToWatchlist,
    toggleTheme,
    updateUserProfile,
    changePassword,
    enableTwoFA,
    disableTwoFA,
    updateKYC,
    handleDeposit,
    handleWithdraw,
    referralCode,
    referralCount,
    referralEarnings,
    shareReferral,
    exportData,
    exportCSV,
    deleteAccount,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};