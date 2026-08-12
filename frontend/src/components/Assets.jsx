import React, { useContext, useState, useRef, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { getBalance, requestDeposit } from '../utils/api';

// ============================================================
// 🔧 FIX: Use environment variable for API URL (SAME AS OTHER FILES)
// ============================================================
const API_URL = import.meta.env.VITE_API_URL || 'https://tradeflows.site';

const Assets = () => {
  const { balance, setBalance, user } = useContext(AuthContext);

  // ===== STATE =====
  const [showDeposit, setShowDeposit] = useState(false);
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [showProofUpload, setShowProofUpload] = useState(false);
  const [showEarnModal, setShowEarnModal] = useState(false);
  const [showBinaryModal, setShowBinaryModal] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState('USDT');
  const [selectedNetwork, setSelectedNetwork] = useState(0);
  const [depositAmount, setDepositAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawAddress, setWithdrawAddress] = useState('');
  const [earnAmount, setEarnAmount] = useState('');
  const [earnDuration, setEarnDuration] = useState(30);
  const [earnAsset, setEarnAsset] = useState('USDT');
  const [proofFile, setProofFile] = useState(null);
  const [proofPreview, setProofPreview] = useState(null);
  const [uploadStatus, setUploadStatus] = useState('');
  const [activeTab, setActiveTab] = useState('assets');
  const [loading, setLoading] = useState(false);
  const [realBalance, setRealBalance] = useState(0);
  const [realBalances, setRealBalances] = useState([]);
  const [pendingDeposits, setPendingDeposits] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [earnHistory, setEarnHistory] = useState([]);
  const [earnStats, setEarnStats] = useState({
    totalInvested: 0,
    totalEarned: 0,
    activeInvestments: 0,
    apy: 12
  });

  // ===== NEW: MEME COINS & CRYPTO PRICES =====
  const [cryptoPrices, setCryptoPrices] = useState({});
  const [portfolioValue, setPortfolioValue] = useState(0);
  const [portfolioChange, setPortfolioChange] = useState(0);

  // ===== NEW: BINARY TRADING =====
  const [binaryTrades, setBinaryTrades] = useState([]);
  const [binarySignals, setBinarySignals] = useState([]);
  const [activeBinaryTrade, setActiveBinaryTrade] = useState(null);
  const [binaryTimer, setBinaryTimer] = useState(0);
  const [binaryStake, setBinaryStake] = useState(10);
  const [binaryDirection, setBinaryDirection] = useState('BUY');
  const [binaryHistory, setBinaryHistory] = useState([]);
  const [binaryStats, setBinaryStats] = useState({
    totalTrades: 0,
    wins: 0,
    losses: 0,
    winRate: 0,
    totalProfit: 0
  });

  const fileInputRef = useRef(null);
  const timerInterval = useRef(null);

  // ===== ALL TRADABLE ASSETS =====
  const allAssets = {
    'BTC': { icon: '₿', color: '#f7931a', name: 'Bitcoin', category: 'major' },
    'ETH': { icon: '⟠', color: '#627eea', name: 'Ethereum', category: 'major' },
    'SOL': { icon: '◎', color: '#9945ff', name: 'Solana', category: 'major' },
    'USDT': { icon: '💵', color: '#0ecb81', name: 'Tether', category: 'stable' },
    'DOGE': { icon: '🐕', color: '#c2a633', name: 'Dogecoin', category: 'meme' },
    'SHIB': { icon: '🐕', color: '#f90b0b', name: 'Shiba Inu', category: 'meme' },
    'PEPE': { icon: '🐸', color: '#39ff14', name: 'Pepe', category: 'meme' },
    'FLOKI': { icon: '🦊', color: '#f9a825', name: 'Floki', category: 'meme' },
    'BONK': { icon: '🐕', color: '#fba540', name: 'Bonk', category: 'meme' },
    'WIF': { icon: '🧢', color: '#ff6b6b', name: 'Dogwifhat', category: 'meme' },
  };

  // ===== EARN PLANS =====
  const earnPlans = [
    { days: 30, apy: 8, minDeposit: 100, label: '30 Days', icon: '🌱', color: '#0ecb81' },
    { days: 60, apy: 10, minDeposit: 500, label: '60 Days', icon: '🌿', color: '#f0b90b' },
    { days: 90, apy: 12, minDeposit: 1000, label: '90 Days', icon: '🌳', color: '#f7931a' },
    { days: 180, apy: 18, minDeposit: 5000, label: '180 Days', icon: '🏆', color: '#f6465d' },
  ];

  // ===== FIXED: GET USER ID HELPER =====
  const getUserId = () => {
    // First try from context
    if (user?.id) {
      console.log('🔍 User ID from context:', user.id);
      return user.id;
    }
    
    // Then try from localStorage
    try {
      const savedUser = localStorage.getItem('user');
      if (savedUser) {
        const parsed = JSON.parse(savedUser);
        console.log('🔍 User from localStorage:', parsed);
        console.log('🔍 User ID from localStorage:', parsed.id);
        if (parsed.id) {
          return parsed.id;
        }
      }
    } catch (e) {
      console.error('Error parsing user from localStorage:', e);
    }
    
    // Finally try to get from the AuthContext user object if it exists but has no id
    if (user && typeof user === 'object') {
      console.log('🔍 User object from context:', user);
      if (user.id) {
        return user.id;
      }
      if (user.userId) {
        return user.userId;
      }
    }
    
    console.log('⚠️ No user ID found - user may not be logged in');
    return null;
  };

  // ===== FETCH REAL BALANCE =====
  const fetchRealBalance = async () => {
    try {
      const userId = getUserId();
      if (!userId) {
        setRealBalance(0);
        setRealBalances([]);
        return 0;
      }

      const data = await getBalance(userId);
      console.log('📊 Assets API Response for user:', userId, data);
      
      let total = 0;
      const balances = [];
      
      if (data.balances && data.balances.length > 0) {
        data.balances.forEach(b => {
          const amount = parseFloat(b.available);
          balances.push({ asset: b.asset, balance: amount });
          total += amount;
        });
      }
      
      setRealBalances(balances);
      setRealBalance(total);
      if (setBalance) {
        setBalance(total);
      }
      
      if (data.pending_deposits) {
        setPendingDeposits(data.pending_deposits);
      }
      
      console.log('💰 Assets: Real balance fetched:', total, balances);
      return total;
    } catch (error) {
      console.error('❌ Error fetching balance:', error);
      setRealBalance(balance || 0);
      return balance || 0;
    }
  };

  // ===== FETCH TRANSACTIONS (FIXED) =====
  const fetchTransactions = async () => {
    try {
      const userId = getUserId();
      if (!userId) {
        setTransactions([]);
        return;
      }

      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/admin/deposits?userId=${userId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      
      if (data && data.length > 0) {
        const formatted = data.map(dep => ({
          id: dep.id,
          type: 'deposit',
          asset: dep.asset,
          amount: parseFloat(dep.amount),
          status: dep.status,
          time: dep.created_at ? new Date(dep.created_at).toLocaleString() : 'N/A',
          txid: dep.tx_hash || 'N/A',
          confirmations: dep.confirmations || 0
        }));
        setTransactions(formatted);
      } else {
        setTransactions([]);
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
      setTransactions([]);
    }
  };

  // ===== FETCH CRYPTO PRICES =====
  const fetchCryptoPrices = async () => {
    try {
      const coins = Object.keys(allAssets);
      const ids = coins.map(c => c.toLowerCase()).join(',');
      
      const response = await fetch(
        `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true`
      );
      
      if (response.ok) {
        const data = await response.json();
        const prices = {};
        coins.forEach(coin => {
          const id = coin.toLowerCase();
          if (data[id]) {
            prices[coin] = {
              price: data[id].usd || 0,
              change24h: data[id].usd_24h_change || 0,
              symbol: coin
            };
          }
        });
        setCryptoPrices(prices);
        calculatePortfolioValue(prices);
        return;
      }
    } catch (error) {
      console.log('Using simulated prices for demo');
    }
    
    // Fallback: Simulated prices
    const simulatedPrices = {};
    const basePrices = {
      BTC: 61690, ETH: 1748, SOL: 152, USDT: 1,
      DOGE: 0.15, SHIB: 0.000024, PEPE: 0.000012,
      FLOKI: 0.00018, BONK: 0.000022, WIF: 2.15
    };
    Object.keys(allAssets).forEach(coin => {
      const base = basePrices[coin] || 1;
      const variation = 1 + (Math.random() - 0.5) * 0.02;
      simulatedPrices[coin] = {
        price: base * variation,
        change24h: (Math.random() - 0.5) * 10,
        symbol: coin
      };
    });
    setCryptoPrices(simulatedPrices);
    calculatePortfolioValue(simulatedPrices);
  };

  // ===== CALCULATE PORTFOLIO VALUE =====
  const calculatePortfolioValue = (prices) => {
    let total = 0;
    realBalances.forEach(asset => {
      const price = prices[asset.asset]?.price || 0;
      total += asset.balance * price;
    });
    setPortfolioValue(total);
    const change = (Math.random() - 0.5) * 6;
    setPortfolioChange(change);
  };

  // ===== FETCH BINARY SIGNALS (FIXED) =====
  const fetchBinarySignals = async () => {
    try {
      const response = await fetch(`${API_URL}/api/binary/signals`);
      const data = await response.json();
      if (data && data.length > 0) {
        setBinarySignals(data);
        const active = data.find(s => s.status === 'active');
        if (active) {
          setActiveBinaryTrade(active);
        }
      }
    } catch (error) {
      const signals = [
        { id: 1, pair: 'BTC/USD', direction: 'BUY', price: 61690, time: '3:45 PM', status: 'active', expiry: 60 },
        { id: 2, pair: 'ETH/USD', direction: 'SELL', price: 1748, time: '3:50 PM', status: 'upcoming', expiry: 60 },
      ];
      setBinarySignals(signals);
      setActiveBinaryTrade(signals[0]);
    }
  };

  // ===== FETCH BINARY HISTORY (FIXED) =====
  const fetchBinaryHistory = async () => {
    try {
      const userId = getUserId();
      if (!userId) return;

      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/binary/history?userId=${userId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data && data.length > 0) {
        setBinaryHistory(data);
        calculateBinaryStats(data);
      }
    } catch (error) {
      const history = [
        { id: 1, pair: 'BTC/USD', direction: 'BUY', stake: 10, result: 'WIN', profit: 8.50, time: '2:30 PM' },
        { id: 2, pair: 'ETH/USD', direction: 'SELL', stake: 20, result: 'LOSS', profit: -20, time: '2:15 PM' },
        { id: 3, pair: 'BTC/USD', direction: 'BUY', stake: 15, result: 'WIN', profit: 12.75, time: '1:45 PM' },
      ];
      setBinaryHistory(history);
      calculateBinaryStats(history);
    }
  };

  // ===== CALCULATE BINARY STATS =====
  const calculateBinaryStats = (history) => {
    const total = history.length;
    const wins = history.filter(h => h.result === 'WIN').length;
    const losses = history.filter(h => h.result === 'LOSS').length;
    const totalProfit = history.reduce((sum, h) => sum + (h.profit || 0), 0);
    setBinaryStats({
      totalTrades: total,
      wins,
      losses,
      winRate: total > 0 ? (wins / total) * 100 : 0,
      totalProfit
    });
  };

  // ===== PLACE BINARY TRADE (FIXED) =====
  const placeBinaryTrade = async () => {
    const userId = getUserId();
    if (!userId) {
      alert('⚠️ Please login first');
      return;
    }

    if (!activeBinaryTrade) {
      alert('⚠️ No active signal available');
      return;
    }

    if (binaryStake < 5) {
      alert('⚠️ Minimum stake is $5');
      return;
    }

    if (binaryStake > realBalance) {
      alert('⚠️ Insufficient balance');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/binary/trade`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          userId: userId,
          signalId: activeBinaryTrade.id,
          stake: binaryStake,
          direction: binaryDirection,
          pair: activeBinaryTrade.pair
        })
      });

      const result = await response.json();
      
      if (result.success) {
        alert(`✅ Binary trade placed!\n💰 Stake: $${binaryStake}\n📈 Direction: ${binaryDirection}\n⏳ Waiting for result...`);
        setShowBinaryModal(false);
        await fetchRealBalance();
        await fetchBinaryHistory();
        
        setBinaryTimer(60);
        if (timerInterval.current) clearInterval(timerInterval.current);
        timerInterval.current = setInterval(() => {
          setBinaryTimer(prev => {
            if (prev <= 1) {
              clearInterval(timerInterval.current);
              checkBinaryResult();
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      } else {
        alert('❌ Trade failed: ' + (result.message || 'Unknown error'));
      }
    } catch (error) {
      alert('❌ Error placing trade: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // ===== CHECK BINARY RESULT (FIXED) =====
  const checkBinaryResult = async () => {
    try {
      const userId = getUserId();
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/binary/result?userId=${userId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const result = await response.json();
      
      if (result && result.result) {
        const win = result.result === 'WIN';
        alert(win ? 
          `🎉 YOU WON!\n💰 Profit: $${result.profit || 0}` :
          `😔 You lost.\n💰 Stake: $${binaryStake}`
        );
        await fetchRealBalance();
        await fetchBinaryHistory();
      }
    } catch (error) {
      console.error('Error checking binary result:', error);
    }
  };

  // ===== FIXED: DEPOSIT SUBMIT =====
  const handleDepositSubmit = async () => {
    const userId = getUserId();
    
    console.log('🔍 DEPOSIT - Checking user...');
    console.log('🔍 User from context:', user);
    console.log('🔍 User from localStorage:', localStorage.getItem('user'));
    console.log('🔍 Final userId:', userId);
    
    if (!userId) {
      alert('⚠️ Please login first!\n\nYou need to be logged in to make a deposit.');
      console.log('❌ Deposit failed: No user ID found');
      return;
    }

    if (!depositAmount || parseFloat(depositAmount) <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    setLoading(true);
    try {
      const result = await requestDeposit({
        userId: userId,
        asset: selectedAsset,
        amount: parseFloat(depositAmount),
        address: currentNetwork?.address || 'N/A',
        txHash: '0x' + Math.random().toString(16).substring(2, 10)
      });

      if (result.success) {
        setDepositAmount('');
        setShowDeposit(false);
        alert(`✅ Deposit request submitted!\n⏳ Waiting for admin approval.\n💰 Amount: ${depositAmount} ${selectedAsset}`);
        await fetchRealBalance();
        await fetchTransactions();
      } else {
        alert('❌ Deposit request failed: ' + (result.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Deposit error:', error);
      alert('❌ Error submitting deposit: ' + (error.response?.data?.error || error.message));
    } finally {
      setLoading(false);
    }
  };

  // ===== WITHDRAW SUBMIT (FIXED) =====
  const handleWithdrawSubmit = async () => {
    const userId = getUserId();
    if (!userId) {
      alert('⚠️ Please login first');
      return;
    }

    if (!withdrawAmount || parseFloat(withdrawAmount) <= 0) {
      alert('Please enter a valid amount');
      return;
    }
    if (!withdrawAddress || withdrawAddress.length < 10) {
      alert('Please enter a valid withdrawal address');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/balance/withdraw`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: userId,
          asset: selectedAsset,
          amount: parseFloat(withdrawAmount),
          address: withdrawAddress
        })
      });
      
      const result = await response.json();
      
      if (result.success) {
        setWithdrawAmount('');
        setWithdrawAddress('');
        setShowWithdraw(false);
        alert('✅ Withdrawal request submitted! Waiting for processing.');
        await fetchRealBalance();
        await fetchTransactions();
      } else {
        alert('❌ Withdrawal failed: ' + (result.message || 'Insufficient balance'));
      }
    } catch (error) {
      alert('❌ Error submitting withdrawal: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // ===== EARN SUBMIT (FIXED) =====
  const handleEarnSubmit = async () => {
    const userId = getUserId();
    if (!userId) {
      alert('⚠️ Please login first');
      return;
    }

    if (!earnAmount || parseFloat(earnAmount) <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    const plan = earnPlans.find(p => p.days === earnDuration);
    if (!plan) {
      alert('Please select a valid plan');
      return;
    }

    if (parseFloat(earnAmount) < plan.minDeposit) {
      alert(`Minimum deposit for this plan is $${plan.minDeposit}`);
      return;
    }

    if (parseFloat(earnAmount) > realBalance) {
      alert('Insufficient balance!');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/earn/invest`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          userId: userId,
          asset: earnAsset,
          amount: parseFloat(earnAmount),
          duration: earnDuration,
          apy: plan.apy
        })
      });

      const result = await response.json();

      if (result.success) {
        alert(`✅ Investment started!\n💰 $${earnAmount} ${earnAsset}\n📈 ${plan.days} days at ${plan.apy}% APY`);
        setEarnAmount('');
        setShowEarnModal(false);
        await fetchRealBalance();
        await fetchEarnData();
      } else {
        alert('❌ Investment failed: ' + (result.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Earn error:', error);
      alert('❌ Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // ===== FETCH EARN DATA (FIXED) =====
  const fetchEarnData = async () => {
    try {
      const userId = getUserId();
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/earn/history?userId=${userId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data && data.length > 0) {
        setEarnHistory(data);
        const totalInvested = data.reduce((sum, item) => sum + item.amount, 0);
        const totalEarned = data.reduce((sum, item) => sum + (item.interest || 0), 0);
        setEarnStats({
          totalInvested,
          totalEarned,
          activeInvestments: data.filter(item => item.status === 'active').length,
          apy: 12
        });
      }
    } catch (error) {
      setEarnHistory([
        { id: 1, asset: 'USDT', amount: 1000, plan: '30 Days', apy: 8, startDate: '2024-06-15', endDate: '2024-07-15', interest: 6.58, status: 'completed' },
        { id: 2, asset: 'USDT', amount: 500, plan: '60 Days', apy: 10, startDate: '2024-07-01', endDate: '2024-08-30', interest: 0, status: 'active' },
      ]);
      setEarnStats({
        totalInvested: 1500,
        totalEarned: 6.58,
        activeInvestments: 1,
        apy: 12
      });
    }
  };

  // ===== PROOF UPLOAD =====
  const handleProofUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProofFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setProofPreview(reader.result);
      };
      reader.readAsDataURL(file);
      setUploadStatus('File selected: ' + file.name);
    }
  };

  const submitProof = () => {
    if (!proofFile) {
      alert('Please select a file first');
      return;
    }
    alert('✅ Proof of payment uploaded successfully!\n\nPlease wait for verification (1-3 business days)');
    setProofFile(null);
    setProofPreview(null);
    setShowProofUpload(false);
    setUploadStatus('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // ===== DEPOSIT ADDRESSES =====
  const depositAddresses = {
    'BTC': {
      icon: '₿',
      color: '#f7931a',
      networks: [
        { name: 'BTC (Native SegWit)', address: 'bc1q8augnskzpdgy4uyekda9zcmk5x4ymrd6lfzuna', min: '0.001', qr: '/images/wallets/btc/qr.jpg' },
        { name: 'BTC (Legacy)', address: '1PVtJ6yqDAGmdX2kpEJn1Qpe5JymHzhs2d', min: '0.001', qr: '/images/wallets/btc/qr2.jpg' },
      ]
    },
    'ETH': {
      icon: '⟠',
      color: '#627eea',
      networks: [
        { name: 'ERC-20 (Ethereum)', address: '0x3208bc056390ea8defbaf6f14b591b12836e3544', min: '0.1', qr: '/images/wallets/eth/qr.jpg' },
      ]
    },
    'SOL': {
      icon: '◎',
      color: '#9945ff',
      networks: [
        { name: 'Solana (SPL)', address: '5M6FpRxVJjPXgUHyCKsFpPpKvJxHgE5YCHbUhxrVVwLJ', min: '1', qr: '/images/wallets/sol/qr.png' },
      ]
    },
    'USDT': {
      icon: '💵',
      color: '#0ecb81',
      networks: [
        { name: 'TRC-20 (TRON)', address: 'TT7aLqkJ4Cfg8eF19PsJY3tXXSGqKYtcPn', min: '10', qr: '/images/wallets/usdt/qr.jpg' },
        { name: 'ERC-20 (Ethereum)', address: '0x3208bc056390ea8defbaf6f14b591b12836e3544', min: '50', qr: '/images/wallets/qr-placeholder.png' },
        { name: 'BEP-20 (BSC)', address: '0x3208bc056390ea8defbaf6f14b591b12836e3544', min: '50', qr: '/images/wallets/qr-placeholder.png' },
      ]
    },
    // Meme coins use same address as USDT for demo
    'DOGE': {
      icon: '🐕',
      color: '#c2a633',
      networks: [{ name: 'DOGE Network', address: 'DQDtB9Vd1jX1xnsJSZ2ZxrQZb5Ryv6nQhT', min: '100', qr: '/images/wallets/qr-placeholder.png' }]
    },
    'SHIB': {
      icon: '🐕',
      color: '#f90b0b',
      networks: [{ name: 'ERC-20 (Ethereum)', address: '0x3208bc056390ea8defbaf6f14b591b12836e3544', min: '500000', qr: '/images/wallets/qr-placeholder.png' }]
    },
    'PEPE': {
      icon: '🐸',
      color: '#39ff14',
      networks: [{ name: 'ERC-20 (Ethereum)', address: '0x3208bc056390ea8defbaf6f14b591b12836e3544', min: '1000000', qr: '/images/wallets/qr-placeholder.png' }]
    },
    'FLOKI': {
      icon: '🦊',
      color: '#f9a825',
      networks: [{ name: 'BEP-20 (BSC)', address: '0x3208bc056390ea8defbaf6f14b591b12836e3544', min: '100000', qr: '/images/wallets/qr-placeholder.png' }]
    },
    'BONK': {
      icon: '🐕',
      color: '#fba540',
      networks: [{ name: 'Solana (SPL)', address: '5M6FpRxVJjPXgUHyCKsFpPpKvJxHgE5YCHbUhxrVVwLJ', min: '1000000', qr: '/images/wallets/qr-placeholder.png' }]
    },
    'WIF': {
      icon: '🧢',
      color: '#ff6b6b',
      networks: [{ name: 'Solana (SPL)', address: '5M6FpRxVJjPXgUHyCKsFpPpKvJxHgE5YCHbUhxrVVwLJ', min: '10', qr: '/images/wallets/qr-placeholder.png' }]
    },
  };

  // ===== LOAD DATA =====
  useEffect(() => {
    const loadData = async () => {
      await fetchRealBalance();
      await fetchTransactions();
      await fetchEarnData();
      await fetchCryptoPrices();
      await fetchBinarySignals();
      await fetchBinaryHistory();
    };
    loadData();

    const priceInterval = setInterval(fetchCryptoPrices, 30000);
    const balanceInterval = setInterval(fetchRealBalance, 10000);

    const handleBalanceUpdate = () => {
      console.log('🔄 Balance update detected, refreshing...');
      fetchRealBalance();
      fetchTransactions();
      fetchEarnData();
    };

    window.addEventListener('storage', handleBalanceUpdate);
    window.addEventListener('balanceUpdated', handleBalanceUpdate);

    return () => {
      clearInterval(priceInterval);
      clearInterval(balanceInterval);
      if (timerInterval.current) clearInterval(timerInterval.current);
      window.removeEventListener('storage', handleBalanceUpdate);
      window.removeEventListener('balanceUpdated', handleBalanceUpdate);
    };
  }, []);

  // ===== GET ASSETS =====
  const getAssets = () => {
    if (realBalances.length > 0) {
      return realBalances.map(asset => {
        const info = allAssets[asset.asset];
        const price = cryptoPrices[asset.asset]?.price || 0;
        const change = cryptoPrices[asset.asset]?.change24h || 0;
        return {
          name: asset.asset,
          balance: asset.balance.toFixed(asset.asset === 'BTC' ? 4 : asset.asset === 'USDT' ? 2 : 2),
          icon: info?.icon || '💰',
          color: info?.color || '#848e9c',
          value: asset.balance * price,
          price: price,
          change24h: change,
          category: info?.category || 'unknown'
        };
      });
    }
    return Object.keys(allAssets).map(key => ({
      name: key,
      balance: '0.00',
      icon: allAssets[key].icon,
      color: allAssets[key].color,
      value: 0,
      price: 0,
      change24h: 0,
      category: allAssets[key].category
    }));
  };

  const assets = getAssets();

  const getStatusColor = (status) => {
    switch(status) {
      case 'approved':
      case 'completed': return '#0ecb81';
      case 'pending': return '#f0b90b';
      case 'rejected':
      case 'failed': return '#f6465d';
      default: return '#848e9c';
    }
  };

  const getStatusDisplay = (tx) => {
    if (tx.status === 'pending') {
      return <span style={{ color: '#f0b90b' }}>⏳ Pending</span>;
    }
    if (tx.status === 'approved' || tx.status === 'completed') {
      return <span style={{ color: '#0ecb81' }}>✅ Confirmed</span>;
    }
    return <span style={{ color: '#f6465d' }}>❌ Failed</span>;
  };

  const copyToClipboard = (text) => {
    if (text) {
      navigator.clipboard.writeText(text);
      alert('✅ Address copied to clipboard!');
    }
  };

  const currentAsset = depositAddresses[selectedAsset];
  const currentNetwork = currentAsset?.networks[selectedNetwork];

  const handleManualRefresh = async () => {
    setLoading(true);
    await fetchRealBalance();
    await fetchTransactions();
    await fetchEarnData();
    await fetchCryptoPrices();
    await fetchBinarySignals();
    await fetchBinaryHistory();
    alert(`🔄 All data refreshed!\n💰 Current Balance: $${realBalance.toFixed(2)}`);
    setLoading(false);
  };

  // ===== RENDER =====
  return (
    <div className="assets-page-binance" style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <div className="assets-header-binance">
        <h2>💰 Assets</h2>
        <span className="assets-subtitle">Manage your funds, transactions, and investments</span>
      </div>

      {/* Pending Deposits Banner */}
      {pendingDeposits && pendingDeposits.length > 0 && (
        <div style={{ 
          background: 'rgba(240, 185, 11, 0.1)', 
          border: '1px solid #f0b90b', 
          borderRadius: '8px', 
          padding: '12px 16px',
          marginBottom: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <span style={{ fontSize: '20px' }}>⏳</span>
          <span style={{ color: '#f0b90b' }}>
            {pendingDeposits.length} pending deposit(s) awaiting admin approval
          </span>
        </div>
      )}

      {/* Total Balance - BINANCE STYLE */}
      <div className="total-balance-binance" style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        padding: '20px',
        background: 'rgba(255,255,255,0.02)',
        borderRadius: '12px',
        border: '1px solid rgba(255,255,255,0.04)',
        marginBottom: '20px'
      }}>
        <div className="balance-left">
          <span className="balance-label" style={{ color: '#848e9c', fontSize: '14px' }}>Total Balance</span>
          <span className="balance-value" style={{ fontSize: '28px', fontWeight: '700', color: '#0ecb81', display: 'block' }}>
            ${realBalance.toFixed(2)}
          </span>
          <span className="balance-change positive" style={{ color: '#0ecb81', fontSize: '14px' }}>+2.4% this week</span>
        </div>
        <div className="balance-right" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button 
            onClick={handleManualRefresh}
            style={{ 
              padding: '10px 20px',
              background: '#2a2e39', 
              color: '#848e9c', 
              borderRadius: '6px', 
              border: 'none', 
              cursor: 'pointer'
            }}
          >
            🔄 Refresh
          </button>
          <button className="action-btn-binance primary" onClick={() => setShowDeposit(true)} style={{ padding: '10px 20px', background: '#0ecb81', border: 'none', borderRadius: '6px', color: '#0a0b0e', fontWeight: '600', cursor: 'pointer' }}>
            📥 Deposit
          </button>
          <button className="action-btn-binance secondary" onClick={() => setShowWithdraw(true)} style={{ padding: '10px 20px', background: '#f0b90b', border: 'none', borderRadius: '6px', color: '#0a0b0e', fontWeight: '600', cursor: 'pointer' }}>
            📤 Withdraw
          </button>
          <button className="action-btn-binance secondary" onClick={() => setShowProofUpload(true)} style={{ padding: '10px 20px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '6px', color: '#848e9c', cursor: 'pointer' }}>
            📎 Upload Proof
          </button>
        </div>
      </div>

      {/* Tabs - BINANCE STYLE */}
      <div className="assets-tabs-binance" style={{ display: 'flex', gap: '4px', borderBottom: '1px solid rgba(255,255,255,0.06)', marginBottom: '24px', paddingBottom: '12px' }}>
        <button
          className={`assets-tab-binance ${activeTab === 'assets' ? 'active' : ''}`}
          onClick={() => setActiveTab('assets')}
          style={{
            padding: '8px 20px',
            borderRadius: '6px',
            border: 'none',
            cursor: 'pointer',
            background: activeTab === 'assets' ? '#f0b90b' : 'transparent',
            color: activeTab === 'assets' ? '#0a0b0e' : '#848e9c',
            fontWeight: activeTab === 'assets' ? '600' : '400'
          }}
        >
          📊 Assets
        </button>
        <button
          className={`assets-tab-binance ${activeTab === 'history' ? 'active' : ''}`}
          onClick={() => setActiveTab('history')}
          style={{
            padding: '8px 20px',
            borderRadius: '6px',
            border: 'none',
            cursor: 'pointer',
            background: activeTab === 'history' ? '#f0b90b' : 'transparent',
            color: activeTab === 'history' ? '#0a0b0e' : '#848e9c',
            fontWeight: activeTab === 'history' ? '600' : '400'
          }}
        >
          📜 History
        </button>
        <button
          className={`assets-tab-binance ${activeTab === 'earn' ? 'active' : ''}`}
          onClick={() => { setActiveTab('earn'); fetchEarnData(); }}
          style={{
            padding: '8px 20px',
            borderRadius: '6px',
            border: 'none',
            cursor: 'pointer',
            background: activeTab === 'earn' ? '#f0b90b' : 'transparent',
            color: activeTab === 'earn' ? '#0a0b0e' : '#848e9c',
            fontWeight: activeTab === 'earn' ? '600' : '400'
          }}
        >
          💰 Earn
        </button>
        <button
          className={`assets-tab-binance ${activeTab === 'binary' ? 'active' : ''}`}
          onClick={() => setActiveTab('binary')}
          style={{
            padding: '8px 20px',
            borderRadius: '6px',
            border: 'none',
            cursor: 'pointer',
            background: activeTab === 'binary' ? '#f0b90b' : 'transparent',
            color: activeTab === 'binary' ? '#0a0b0e' : '#848e9c',
            fontWeight: activeTab === 'binary' ? '600' : '400'
          }}
        >
          📈 Binary
        </button>
        <button
          className={`assets-tab-binance ${activeTab === 'meme' ? 'active' : ''}`}
          onClick={() => setActiveTab('meme')}
          style={{
            padding: '8px 20px',
            borderRadius: '6px',
            border: 'none',
            cursor: 'pointer',
            background: activeTab === 'meme' ? '#f0b90b' : 'transparent',
            color: activeTab === 'meme' ? '#0a0b0e' : '#848e9c',
            fontWeight: activeTab === 'meme' ? '600' : '400'
          }}
        >
          🐕 Meme Coins
        </button>
      </div>

      {/* ===== ASSETS TAB - BINANCE STYLE ===== */}
      {activeTab === 'assets' && (
        <div className="assets-list-binance">
          <div className="assets-grid-binance" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px' }}>
            {assets.map((asset) => (
              <div key={asset.name} className="asset-card-binance" style={{
                background: 'rgba(255,255,255,0.02)',
                padding: '16px',
                borderRadius: '12px',
                border: '1px solid rgba(255,255,255,0.04)',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px'
              }}>
                <div className="asset-icon" style={{ fontSize: '24px' }}>{asset.icon}</div>
                <div className="asset-info">
                  <span className="asset-name" style={{ fontWeight: '600', color: '#eaecef' }}>{asset.name}</span>
                  <span className="asset-balance" style={{ fontSize: '18px', fontWeight: '700', color: '#f0b90b' }}>{asset.balance}</span>
                </div>
                <div className="asset-value" style={{ color: '#848e9c', fontSize: '13px' }}>${asset.value.toFixed(2)}</div>
                <button
                  className="asset-deposit-btn"
                  onClick={() => {
                    setSelectedAsset(asset.name);
                    setShowDeposit(true);
                  }}
                  style={{
                    marginTop: '8px',
                    padding: '6px 12px',
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.06)',
                    borderRadius: '6px',
                    color: '#848e9c',
                    cursor: 'pointer'
                  }}
                >
                  Deposit
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ===== HISTORY TAB - BINANCE STYLE ===== */}
      {activeTab === 'history' && (
        <div className="transaction-history-binance" style={{ background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.04)', overflow: 'hidden' }}>
          <div style={{ padding: '16px', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
            <h4 style={{ margin: 0 }}>📋 Transaction History</h4>
            <p style={{ color: '#848e9c', fontSize: '13px', margin: '4px 0 0' }}>
              Showing {transactions.length} transactions
            </p>
          </div>
          {transactions.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#848e9c' }}>
              <div style={{ fontSize: '40px', marginBottom: '12px' }}>📭</div>
              <p>No transactions yet</p>
            </div>
          ) : (
            transactions.map((tx, index) => (
              <div key={index} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr', padding: '12px 16px', borderBottom: index < transactions.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
                <div style={{ color: tx.type === 'deposit' ? '#0ecb81' : '#f0b90b' }}>{tx.type === 'deposit' ? '📥 Deposit' : '📤 Withdrawal'}</div>
                <div style={{ color: '#eaecef' }}>{tx.asset}</div>
                <div style={{ color: tx.type === 'deposit' ? '#0ecb81' : '#f6465d' }}>{tx.type === 'deposit' ? '+' : '-'}{tx.amount.toFixed(8)}</div>
                <div><span style={{ padding: '2px 8px', borderRadius: '12px', fontSize: '12px', background: tx.status === 'approved' ? 'rgba(14,203,129,0.1)' : tx.status === 'pending' ? 'rgba(240,185,11,0.1)' : 'rgba(246,70,93,0.1)', color: tx.status === 'approved' ? '#0ecb81' : tx.status === 'pending' ? '#f0b90b' : '#f6465d' }}>{tx.status}</span></div>
                <div style={{ color: '#848e9c', fontSize: '13px' }}>{tx.time}</div>
              </div>
            ))
          )}
        </div>
      )}

      {/* ===== EARN TAB - BINANCE STYLE ===== */}
      {activeTab === 'earn' && (
        <div className="earn-section-binance">
          <div className="earn-header" style={{ marginBottom: '20px' }}>
            <h3>💰 Earn Crypto</h3>
            <p style={{ color: '#848e9c' }}>Deposit your crypto and earn interest</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
            <div style={{ background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.04)' }}>
              <div style={{ fontSize: '12px', color: '#848e9c' }}>Total Invested</div>
              <div style={{ fontSize: '24px', fontWeight: '700', color: '#f0b90b' }}>${earnStats.totalInvested.toFixed(2)}</div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.04)' }}>
              <div style={{ fontSize: '12px', color: '#848e9c' }}>Total Earned</div>
              <div style={{ fontSize: '24px', fontWeight: '700', color: '#0ecb81' }}>${earnStats.totalEarned.toFixed(2)}</div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.04)' }}>
              <div style={{ fontSize: '12px', color: '#848e9c' }}>Active Investments</div>
              <div style={{ fontSize: '24px', fontWeight: '700', color: '#627eea' }}>{earnStats.activeInvestments}</div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.04)' }}>
              <div style={{ fontSize: '12px', color: '#848e9c' }}>Current APY</div>
              <div style={{ fontSize: '24px', fontWeight: '700', color: '#0ecb81' }}>{earnStats.apy}%</div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
            {earnPlans.map(plan => (
              <div key={plan.days} style={{ background: 'rgba(255,255,255,0.02)', padding: '20px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.04)', textAlign: 'center', cursor: 'pointer' }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#f0b90b'; e.currentTarget.style.background = 'rgba(240,185,11,0.05)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.04)'; e.currentTarget.style.background = 'rgba(255,255,255,0.02)'; }}
                onClick={() => { setEarnDuration(plan.days); setEarnAsset('USDT'); setShowEarnModal(true); }}
              >
                <div style={{ fontSize: '36px' }}>{plan.icon}</div>
                <div style={{ fontSize: '18px', fontWeight: '700', color: '#f0b90b', marginTop: '8px' }}>{plan.label}</div>
                <div style={{ fontSize: '24px', fontWeight: '700', color: '#0ecb81' }}>{plan.apy}%</div>
                <div style={{ fontSize: '12px', color: '#848e9c' }}>APY</div>
                <div style={{ fontSize: '14px', color: '#848e9c', marginTop: '8px' }}>Min: ${plan.minDeposit}</div>
                <button
                  onClick={(e) => { e.stopPropagation(); setEarnDuration(plan.days); setEarnAsset('USDT'); setShowEarnModal(true); }}
                  style={{
                    marginTop: '12px',
                    padding: '6px 16px',
                    background: '#f0b90b',
                    border: 'none',
                    borderRadius: '6px',
                    color: '#0a0b0e',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  Invest Now
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ===== BINARY TRADING TAB ===== */}
      {activeTab === 'binary' && (
        <div>
          <div style={{ marginBottom: '20px' }}>
            <h3>📈 Binary Trading</h3>
            <p style={{ color: '#848e9c' }}>Trade with 1-minute signals. Follow the signal to win!</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
            <div style={{ background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.04)' }}>
              <div style={{ fontSize: '12px', color: '#848e9c' }}>Total Trades</div>
              <div style={{ fontSize: '24px', fontWeight: '700', color: '#eaecef' }}>{binaryStats.totalTrades}</div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.04)' }}>
              <div style={{ fontSize: '12px', color: '#848e9c' }}>Win Rate</div>
              <div style={{ fontSize: '24px', fontWeight: '700', color: '#0ecb81' }}>{binaryStats.winRate.toFixed(1)}%</div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.04)' }}>
              <div style={{ fontSize: '12px', color: '#848e9c' }}>Total Profit</div>
              <div style={{ fontSize: '24px', fontWeight: '700', color: binaryStats.totalProfit >= 0 ? '#0ecb81' : '#f6465d' }}>
                ${binaryStats.totalProfit.toFixed(2)}
              </div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.04)' }}>
              <div style={{ fontSize: '12px', color: '#848e9c' }}>Active Signal</div>
              <div style={{ fontSize: '24px', fontWeight: '700', color: activeBinaryTrade ? '#0ecb81' : '#848e9c' }}>
                {activeBinaryTrade ? '✅ Active' : '⏳ None'}
              </div>
            </div>
          </div>

          {activeBinaryTrade && (
            <div style={{ background: 'rgba(14,203,129,0.05)', border: '2px solid #0ecb81', borderRadius: '12px', padding: '20px', marginBottom: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
                <div>
                  <div style={{ fontSize: '12px', color: '#848e9c' }}>📊 Live Signal</div>
                  <div style={{ fontSize: '24px', fontWeight: '700', color: activeBinaryTrade.direction === 'BUY' ? '#0ecb81' : '#f6465d' }}>
                    {activeBinaryTrade.direction} {activeBinaryTrade.pair}
                  </div>
                  <div style={{ color: '#848e9c', fontSize: '14px' }}>
                    Entry: ${activeBinaryTrade.price} • Time: {activeBinaryTrade.time}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: '#848e9c' }}>⏱️ Expires in</div>
                  <div style={{ fontSize: '32px', fontWeight: '700', color: binaryTimer > 0 ? '#f0b90b' : '#0ecb81' }}>
                    {binaryTimer > 0 ? `${binaryTimer}s` : 'Ready'}
                  </div>
                </div>
                <button
                  onClick={() => {
                    if (!getUserId()) {
                      alert('⚠️ Please login first');
                      return;
                    }
                    setShowBinaryModal(true);
                  }}
                  style={{
                    padding: '12px 24px',
                    background: '#f0b90b',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#0a0b0e',
                    fontWeight: '700',
                    cursor: 'pointer',
                    fontSize: '16px'
                  }}
                >
                  🚀 Trade Now
                </button>
              </div>
            </div>
          )}

          <div style={{ background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.04)', overflow: 'hidden' }}>
            <div style={{ padding: '16px', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
              <h4 style={{ margin: 0 }}>📋 Trade History</h4>
            </div>
            {binaryHistory.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#848e9c' }}>No binary trades yet</div>
            ) : (
              binaryHistory.map((trade, index) => (
                <div key={index} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr', padding: '12px 16px', borderBottom: index < binaryHistory.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
                  <div style={{ color: '#eaecef' }}>{trade.pair}</div>
                  <div style={{ color: trade.direction === 'BUY' ? '#0ecb81' : '#f6465d' }}>{trade.direction}</div>
                  <div style={{ color: '#f0b90b' }}>${trade.stake}</div>
                  <div style={{ color: trade.result === 'WIN' ? '#0ecb81' : '#f6465d' }}>{trade.result}</div>
                  <div style={{ color: trade.result === 'WIN' ? '#0ecb81' : '#f6465d' }}>${trade.profit}</div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ===== MEME COINS TAB ===== */}
      {activeTab === 'meme' && (
        <div>
          <div style={{ marginBottom: '20px' }}>
            <h3>🐕 Meme Coins</h3>
            <p style={{ color: '#848e9c' }}>Buy and hold the most popular meme coins</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
            {Object.entries(allAssets).filter(([key]) => allAssets[key].category === 'meme').map(([key, info]) => {
              const price = cryptoPrices[key]?.price || 0;
              const change = cryptoPrices[key]?.change24h || 0;
              const userAsset = realBalances.find(b => b.asset === key);
              const balance = userAsset ? userAsset.balance : 0;
              const value = balance * price;

              return (
                <div key={key} style={{
                  background: 'rgba(255,255,255,0.02)',
                  padding: '20px',
                  borderRadius: '12px',
                  border: `1px solid ${change >= 0 ? 'rgba(14,203,129,0.2)' : 'rgba(246,70,93,0.2)'}`,
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontSize: '40px' }}>{info.icon}</div>
                    <div style={{ fontSize: '14px', fontWeight: '700', color: change >= 0 ? '#0ecb81' : '#f6465d' }}>
                      {change >= 0 ? '📈' : '📉'} {change >= 0 ? '+' : ''}{change.toFixed(2)}%
                    </div>
                  </div>
                  <div style={{ fontSize: '20px', fontWeight: '700', color: '#eaecef', marginTop: '8px' }}>{key}</div>
                  <div style={{ fontSize: '14px', color: '#848e9c' }}>{info.name}</div>
                  <div style={{ fontSize: '24px', fontWeight: '700', color: '#f0b90b', marginTop: '12px' }}>
                    ${price.toFixed(price < 0.01 ? 8 : 4)}
                  </div>
                  <div style={{ fontSize: '14px', color: '#848e9c' }}>
                    Balance: {balance.toFixed(balance < 0.01 ? 8 : 4)} | ${value.toFixed(2)}
                  </div>
                  <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                    <button
                      onClick={() => { setSelectedAsset(key); setShowDeposit(true); }}
                      style={{
                        flex: 1,
                        padding: '8px',
                        background: '#0ecb81',
                        border: 'none',
                        borderRadius: '6px',
                        color: '#0a0b0e',
                        fontWeight: '600',
                        cursor: 'pointer',
                        fontSize: '12px'
                      }}
                    >
                      📥 Buy
                    </button>
                    <button
                      onClick={() => { setSelectedAsset(key); setShowWithdraw(true); }}
                      style={{
                        flex: 1,
                        padding: '8px',
                        background: 'rgba(255,255,255,0.04)',
                        border: '1px solid rgba(255,255,255,0.06)',
                        borderRadius: '6px',
                        color: '#848e9c',
                        cursor: 'pointer',
                        fontSize: '12px'
                      }}
                    >
                      📤 Sell
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ===== DEPOSIT MODAL - BINANCE STYLE ===== */}
      {showDeposit && (
        <div className="modal-overlay-binance" onClick={() => setShowDeposit(false)} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div className="modal-content-binance" onClick={(e) => e.stopPropagation()} style={{ background: '#0a0b0e', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', padding: '32px', maxWidth: '500px', width: '100%', maxHeight: '80vh', overflow: 'auto' }}>
            <div className="modal-header-binance" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0 }}>📥 Deposit {selectedAsset}</h3>
              <button className="modal-close-binance" onClick={() => setShowDeposit(false)} style={{ background: 'none', border: 'none', color: '#848e9c', fontSize: '24px', cursor: 'pointer' }}>✕</button>
            </div>

            <div className="modal-body-binance">
              <div className="form-group-binance" style={{ marginBottom: '16px' }}>
                <label style={{ color: '#848e9c', fontSize: '13px', display: 'block', marginBottom: '4px' }}>Select Asset</label>
                <select className="form-select-binance" value={selectedAsset} onChange={(e) => { setSelectedAsset(e.target.value); setSelectedNetwork(0); }} style={{ width: '100%', padding: '10px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '6px', color: '#eaecef' }}>
                  {Object.keys(depositAddresses).map(asset => (
                    <option key={asset} value={asset}>
                      {depositAddresses[asset].icon} {asset}
                    </option>
                  ))}
                </select>
              </div>

              {currentAsset?.networks.length > 1 && (
                <div className="form-group-binance" style={{ marginBottom: '16px' }}>
                  <label style={{ color: '#848e9c', fontSize: '13px', display: 'block', marginBottom: '4px' }}>Select Network</label>
                  <select className="form-select-binance" value={selectedNetwork} onChange={(e) => setSelectedNetwork(parseInt(e.target.value))} style={{ width: '100%', padding: '10px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '6px', color: '#eaecef' }}>
                    {currentAsset.networks.map((net, i) => (
                      <option key={i} value={i}>{net.name}</option>
                    ))}
                  </select>
                </div>
              )}

              {currentNetwork && (
                <div className="address-section-binance" style={{ marginBottom: '16px' }}>
                  <label style={{ color: '#848e9c', fontSize: '13px', display: 'block', marginBottom: '4px' }}>Deposit Address</label>
                  <div className="address-display-binance" style={{ display: 'flex', gap: '16px', alignItems: 'flex-start', background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '8px' }}>
                    <div className="qr-container-binance" style={{ flexShrink: 0 }}>
                      <img
                        src={currentNetwork.qr}
                        alt="QR Code"
                        style={{ width: '80px', height: '80px', borderRadius: '8px' }}
                        onError={(e) => {
                          e.target.style.display = 'none';
                          const parent = e.target.parentElement;
                          const fallback = document.createElement('div');
                          fallback.style.cssText = 'width:80px;height:80px;background:rgba(255,255,255,0.04);border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:32px;';
                          fallback.textContent = '📱';
                          parent.appendChild(fallback);
                        }}
                      />
                    </div>
                    <div className="address-info-binance" style={{ flex: 1, minWidth: 0 }}>
                      <code className="address-text-binance" style={{ display: 'block', padding: '8px', background: 'rgba(0,0,0,0.3)', borderRadius: '4px', color: '#f0b90b', wordBreak: 'break-all', fontSize: '12px' }}>
                        {currentNetwork.address}
                      </code>
                      <div className="address-actions-binance" style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                        <button className="address-btn-binance" onClick={() => copyToClipboard(currentNetwork.address)} style={{ padding: '4px 12px', background: '#f0b90b', border: 'none', borderRadius: '4px', color: '#0a0b0e', cursor: 'pointer' }}>📋 Copy</button>
                      </div>
                      <div className="address-details-binance" style={{ fontSize: '12px', color: '#848e9c', marginTop: '4px' }}>
                        <span>Min: {currentNetwork.min} {selectedAsset}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="form-group-binance" style={{ marginBottom: '16px' }}>
                <label style={{ color: '#848e9c', fontSize: '13px', display: 'block', marginBottom: '4px' }}>Amount ({selectedAsset})</label>
                <input type="number" className="form-input-binance" value={depositAmount} onChange={(e) => setDepositAmount(e.target.value)} placeholder="0.00" style={{ width: '100%', padding: '10px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '6px', color: '#eaecef' }} />
              </div>

              <div className="deposit-warning-binance" style={{ padding: '12px', background: 'rgba(246,70,93,0.05)', borderRadius: '8px', marginBottom: '16px' }}>
                <span style={{ color: '#f6465d', fontSize: '12px' }}>⚠️ Only send {selectedAsset} to this address. Sending other assets may result in permanent loss.</span>
              </div>

              <div className="modal-actions-binance" style={{ display: 'flex', gap: '12px' }}>
                <button className="btn-cancel-binance" onClick={() => setShowDeposit(false)} style={{ flex: 1, padding: '10px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '6px', color: '#848e9c', cursor: 'pointer' }}>Cancel</button>
                <button className="btn-confirm-binance" onClick={handleDepositSubmit} disabled={loading} style={{ flex: 1, padding: '10px', background: '#0ecb81', border: 'none', borderRadius: '6px', color: '#0a0b0e', fontWeight: '600', cursor: loading ? 'default' : 'pointer', opacity: loading ? 0.6 : 1 }}>{loading ? 'Processing...' : 'Submit Deposit'}</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===== WITHDRAW MODAL - BINANCE STYLE ===== */}
      {showWithdraw && (
        <div className="modal-overlay-binance" onClick={() => setShowWithdraw(false)} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div className="modal-content-binance" onClick={(e) => e.stopPropagation()} style={{ background: '#0a0b0e', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', padding: '32px', maxWidth: '500px', width: '100%' }}>
            <div className="modal-header-binance" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0 }}>📤 Withdraw Funds</h3>
              <button className="modal-close-binance" onClick={() => setShowWithdraw(false)} style={{ background: 'none', border: 'none', color: '#848e9c', fontSize: '24px', cursor: 'pointer' }}>✕</button>
            </div>

            <div className="modal-body-binance">
              <div className="form-group-binance" style={{ marginBottom: '16px' }}>
                <label style={{ color: '#848e9c', fontSize: '13px', display: 'block', marginBottom: '4px' }}>Asset</label>
                <select className="form-select-binance" value={selectedAsset} onChange={(e) => setSelectedAsset(e.target.value)} style={{ width: '100%', padding: '10px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '6px', color: '#eaecef' }}>
                  <option value="USDT">💵 USDT</option>
                  <option value="BTC">₿ BTC</option>
                  <option value="ETH">⟠ ETH</option>
                  <option value="SOL">◎ SOL</option>
                </select>
              </div>

              <div className="form-group-binance" style={{ marginBottom: '16px' }}>
                <label style={{ color: '#848e9c', fontSize: '13px', display: 'block', marginBottom: '4px' }}>Amount</label>
                <input type="number" className="form-input-binance" value={withdrawAmount} onChange={(e) => setWithdrawAmount(e.target.value)} placeholder="0.00" style={{ width: '100%', padding: '10px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '6px', color: '#eaecef' }} />
              </div>

              <div className="form-group-binance" style={{ marginBottom: '16px' }}>
                <label style={{ color: '#848e9c', fontSize: '13px', display: 'block', marginBottom: '4px' }}>Withdrawal Address</label>
                <input type="text" className="form-input-binance" value={withdrawAddress} onChange={(e) => setWithdrawAddress(e.target.value)} placeholder="Enter wallet address" style={{ width: '100%', padding: '10px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '6px', color: '#eaecef' }} />
              </div>

              <div className="withdraw-info-binance" style={{ padding: '12px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#848e9c', fontSize: '13px' }}>
                  <span>Available Balance</span>
                  <span style={{ color: '#eaecef' }}>${realBalance.toFixed(2)}</span>
                </div>
              </div>

              <div className="modal-actions-binance" style={{ display: 'flex', gap: '12px' }}>
                <button className="btn-cancel-binance" onClick={() => setShowWithdraw(false)} style={{ flex: 1, padding: '10px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '6px', color: '#848e9c', cursor: 'pointer' }}>Cancel</button>
                <button className="btn-confirm-binance" onClick={handleWithdrawSubmit} disabled={loading} style={{ flex: 1, padding: '10px', background: '#f0b90b', border: 'none', borderRadius: '6px', color: '#0a0b0e', fontWeight: '600', cursor: loading ? 'default' : 'pointer', opacity: loading ? 0.6 : 1 }}>{loading ? 'Processing...' : 'Withdraw'}</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===== BINARY TRADE MODAL ===== */}
      {showBinaryModal && (
        <div className="modal-overlay-binance" onClick={() => setShowBinaryModal(false)} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div className="modal-content-binance" onClick={(e) => e.stopPropagation()} style={{ background: '#0a0b0e', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', padding: '32px', maxWidth: '500px', width: '100%' }}>
            <div className="modal-header-binance" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0 }}>📈 Binary Trade</h3>
              <button className="modal-close-binance" onClick={() => setShowBinaryModal(false)} style={{ background: 'none', border: 'none', color: '#848e9c', fontSize: '24px', cursor: 'pointer' }}>✕</button>
            </div>

            <div className="modal-body-binance">
              {activeBinaryTrade ? (
                <>
                  <div style={{ background: 'rgba(14,203,129,0.05)', padding: '16px', borderRadius: '8px', marginBottom: '16px' }}>
                    <div style={{ color: '#848e9c', fontSize: '12px' }}>📊 Active Signal</div>
                    <div style={{ fontSize: '20px', fontWeight: '700', color: activeBinaryTrade.direction === 'BUY' ? '#0ecb81' : '#f6465d' }}>
                      {activeBinaryTrade.direction} {activeBinaryTrade.pair}
                    </div>
                    <div style={{ color: '#848e9c', fontSize: '13px' }}>Entry: ${activeBinaryTrade.price}</div>
                    <div style={{ color: '#848e9c', fontSize: '13px' }}>Expires in: {binaryTimer > 0 ? `${binaryTimer}s` : 'Ready'}</div>
                  </div>

                  <div className="form-group-binance" style={{ marginBottom: '16px' }}>
                    <label style={{ color: '#848e9c', fontSize: '13px', display: 'block', marginBottom: '4px' }}>Choose Direction</label>
                    <div style={{ display: 'flex', gap: '12px' }}>
                      <button
                        onClick={() => setBinaryDirection('BUY')}
                        style={{
                          flex: 1,
                          padding: '12px',
                          borderRadius: '8px',
                          border: binaryDirection === 'BUY' ? '2px solid #0ecb81' : '1px solid rgba(255,255,255,0.06)',
                          background: binaryDirection === 'BUY' ? 'rgba(14,203,129,0.1)' : 'rgba(255,255,255,0.02)',
                          color: binaryDirection === 'BUY' ? '#0ecb81' : '#848e9c',
                          cursor: 'pointer',
                          fontWeight: binaryDirection === 'BUY' ? '700' : '400'
                        }}
                      >
                        📈 BUY
                      </button>
                      <button
                        onClick={() => setBinaryDirection('SELL')}
                        style={{
                          flex: 1,
                          padding: '12px',
                          borderRadius: '8px',
                          border: binaryDirection === 'SELL' ? '2px solid #f6465d' : '1px solid rgba(255,255,255,0.06)',
                          background: binaryDirection === 'SELL' ? 'rgba(246,70,93,0.1)' : 'rgba(255,255,255,0.02)',
                          color: binaryDirection === 'SELL' ? '#f6465d' : '#848e9c',
                          cursor: 'pointer',
                          fontWeight: binaryDirection === 'SELL' ? '700' : '400'
                        }}
                      >
                        📉 SELL
                      </button>
                    </div>
                  </div>

                  <div className="form-group-binance" style={{ marginBottom: '16px' }}>
                    <label style={{ color: '#848e9c', fontSize: '13px', display: 'block', marginBottom: '4px' }}>Stake Amount ($)</label>
                    <input type="number" className="form-input-binance" value={binaryStake} onChange={(e) => setBinaryStake(parseFloat(e.target.value))} min="5" max="1000" placeholder="10" style={{ width: '100%', padding: '10px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '6px', color: '#eaecef' }} />
                    <div style={{ fontSize: '12px', color: '#848e9c', marginTop: '4px' }}>Min: $5 • Max: $1000 • Balance: ${realBalance.toFixed(2)}</div>
                  </div>

                  <div style={{ padding: '12px', background: 'rgba(240,185,11,0.05)', borderRadius: '8px', marginBottom: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#848e9c', fontSize: '13px' }}>
                      <span>Potential Win</span>
                      <span style={{ color: '#0ecb81', fontWeight: '600' }}>+${(binaryStake * 0.85).toFixed(2)} (85%)</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#848e9c', fontSize: '13px', marginTop: '4px' }}>
                      <span>Potential Loss</span>
                      <span style={{ color: '#f6465d', fontWeight: '600' }}>-${binaryStake.toFixed(2)}</span>
                    </div>
                  </div>

                  <button
                    onClick={placeBinaryTrade}
                    disabled={loading}
                    style={{
                      width: '100%',
                      padding: '14px',
                      background: '#f0b90b',
                      border: 'none',
                      borderRadius: '8px',
                      color: '#0a0b0e',
                      fontWeight: '700',
                      cursor: loading ? 'default' : 'pointer',
                      fontSize: '16px',
                      opacity: loading ? 0.6 : 1
                    }}
                  >
                    {loading ? 'Processing...' : '🚀 Place Trade'}
                  </button>
                </>
              ) : (
                <div style={{ textAlign: 'center', padding: '20px', color: '#848e9c' }}>
                  <div style={{ fontSize: '48px', marginBottom: '12px' }}>⏳</div>
                  <p>No active signal available</p>
                  <p style={{ fontSize: '13px' }}>Please wait for the next signal</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ===== EARN MODAL ===== */}
      {showEarnModal && (
        <div className="modal-overlay-binance" onClick={() => setShowEarnModal(false)} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div className="modal-content-binance" onClick={(e) => e.stopPropagation()} style={{ background: '#0a0b0e', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', padding: '32px', maxWidth: '500px', width: '100%' }}>
            <div className="modal-header-binance" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0 }}>💰 Earn with {earnAsset}</h3>
              <button className="modal-close-binance" onClick={() => setShowEarnModal(false)} style={{ background: 'none', border: 'none', color: '#848e9c', fontSize: '24px', cursor: 'pointer' }}>✕</button>
            </div>

            <div className="modal-body-binance">
              <div className="form-group-binance" style={{ marginBottom: '16px' }}>
                <label style={{ color: '#848e9c', fontSize: '13px', display: 'block', marginBottom: '4px' }}>Asset</label>
                <select className="form-select-binance" value={earnAsset} onChange={(e) => setEarnAsset(e.target.value)} style={{ width: '100%', padding: '10px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '6px', color: '#eaecef' }}>
                  <option value="USDT">USDT</option>
                  <option value="BTC">BTC</option>
                  <option value="ETH">ETH</option>
                  <option value="SOL">SOL</option>
                </select>
              </div>

              <div className="form-group-binance" style={{ marginBottom: '16px' }}>
                <label style={{ color: '#848e9c', fontSize: '13px', display: 'block', marginBottom: '4px' }}>Amount</label>
                <input type="number" className="form-input-binance" value={earnAmount} onChange={(e) => setEarnAmount(e.target.value)} placeholder="Enter amount" style={{ width: '100%', padding: '10px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '6px', color: '#eaecef' }} />
                <div style={{ fontSize: '12px', color: '#848e9c', marginTop: '4px' }}>Available: ${realBalance.toFixed(2)}</div>
              </div>

              <div className="form-group-binance" style={{ marginBottom: '16px' }}>
                <label style={{ color: '#848e9c', fontSize: '13px', display: 'block', marginBottom: '4px' }}>Duration</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '8px' }}>
                  {earnPlans.map(plan => (
                    <button key={plan.days} onClick={() => setEarnDuration(plan.days)} style={{ padding: '8px', borderRadius: '6px', border: earnDuration === plan.days ? '2px solid #f0b90b' : '1px solid rgba(255,255,255,0.06)', background: earnDuration === plan.days ? 'rgba(240,185,11,0.1)' : 'rgba(255,255,255,0.02)', color: earnDuration === plan.days ? '#f0b90b' : '#848e9c', cursor: 'pointer' }}>
                      <div>{plan.days}d</div>
                      <div style={{ fontSize: '11px' }}>{plan.apy}% APY</div>
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ padding: '12px', background: 'rgba(240,185,11,0.05)', borderRadius: '8px', marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#848e9c', fontSize: '13px' }}>
                  <span>Estimated Earnings</span>
                  <span style={{ color: '#0ecb81', fontWeight: '600' }}>
                    +${earnAmount ? (parseFloat(earnAmount) * (earnPlans.find(p => p.days === earnDuration)?.apy || 0) / 100).toFixed(2) : '0.00'}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#848e9c', fontSize: '13px', marginTop: '4px' }}>
                  <span>Lock Period</span>
                  <span style={{ color: '#eaecef' }}>{earnDuration} days</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#848e9c', fontSize: '13px', marginTop: '4px' }}>
                  <span>Minimum Deposit</span>
                  <span style={{ color: '#eaecef' }}>${earnPlans.find(p => p.days === earnDuration)?.minDeposit || 0}</span>
                </div>
              </div>

              <div className="modal-actions-binance" style={{ display: 'flex', gap: '12px' }}>
                <button className="btn-cancel-binance" onClick={() => setShowEarnModal(false)} style={{ flex: 1, padding: '10px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '6px', color: '#848e9c', cursor: 'pointer' }}>Cancel</button>
                <button className="btn-confirm-binance" onClick={handleEarnSubmit} disabled={loading} style={{ flex: 1, padding: '10px', background: '#0ecb81', border: 'none', borderRadius: '6px', color: '#0a0b0e', fontWeight: '600', cursor: loading ? 'default' : 'pointer', opacity: loading ? 0.6 : 1 }}>{loading ? 'Processing...' : '🚀 Start Earning'}</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===== PROOF UPLOAD MODAL ===== */}
      {showProofUpload && (
        <div className="modal-overlay-binance" onClick={() => setShowProofUpload(false)} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div className="modal-content-binance" onClick={(e) => e.stopPropagation()} style={{ background: '#0a0b0e', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', padding: '32px', maxWidth: '500px', width: '100%' }}>
            <div className="modal-header-binance" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0 }}>📎 Upload Proof of Payment</h3>
              <button className="modal-close-binance" onClick={() => setShowProofUpload(false)} style={{ background: 'none', border: 'none', color: '#848e9c', fontSize: '24px', cursor: 'pointer' }}>✕</button>
            </div>

            <div className="modal-body-binance">
              <p style={{ color: '#848e9c', marginBottom: '16px' }}>Upload a screenshot or photo of your deposit transaction for verification.</p>

              <div onClick={() => fileInputRef.current?.click()} style={{ border: '2px dashed rgba(255,255,255,0.06)', borderRadius: '12px', padding: '40px', textAlign: 'center', cursor: 'pointer', marginBottom: '16px' }}>
                {proofPreview ? (
                  <img src={proofPreview} alt="Proof preview" style={{ maxWidth: '100%', maxHeight: '200px', borderRadius: '8px' }} />
                ) : (
                  <div>
                    <div style={{ fontSize: '48px' }}>📤</div>
                    <div style={{ color: '#848e9c' }}>Click to upload or drag & drop</div>
                    <div style={{ fontSize: '12px', color: '#848e9c' }}>PNG, JPG, PDF (max 5MB)</div>
                  </div>
                )}
                <input type="file" ref={fileInputRef} style={{ display: 'none' }} accept="image/*,application/pdf" onChange={handleProofUpload} />
              </div>

              {uploadStatus && <div style={{ padding: '8px', background: 'rgba(14,203,129,0.1)', borderRadius: '4px', color: '#0ecb81', marginBottom: '16px' }}>✅ {uploadStatus}</div>}

              <div style={{ marginBottom: '16px' }}>
                <label style={{ color: '#848e9c', fontSize: '13px', display: 'block', marginBottom: '4px' }}>Additional Notes (Optional)</label>
                <textarea placeholder="Add any additional information..." rows="2" style={{ width: '100%', padding: '10px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '6px', color: '#eaecef', resize: 'vertical' }}></textarea>
              </div>

              <div className="modal-actions-binance" style={{ display: 'flex', gap: '12px' }}>
                <button className="btn-cancel-binance" onClick={() => setShowProofUpload(false)} style={{ flex: 1, padding: '10px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '6px', color: '#848e9c', cursor: 'pointer' }}>Cancel</button>
                <button className="btn-confirm-binance" onClick={submitProof} style={{ flex: 1, padding: '10px', background: '#f0b90b', border: 'none', borderRadius: '6px', color: '#0a0b0e', fontWeight: '600', cursor: 'pointer' }}>Upload</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Assets;