import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setLoading(true);

    if (!email || !password) {
      setError('Please enter email and password');
      setLoading(false);
      return;
    }

    try {
      console.log('🔐 Logging in:', email);
      
      const result = await login(email, password);
      console.log('✅ Login successful:', result);
      
      setSuccess(true);
      
      // Redirect to dashboard after 1.5 seconds
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 1500);
      
    } catch (err) {
      console.error('❌ Login error:', err);
      
      // Handle specific error messages
      if (err.message === 'Invalid email or password') {
        setError('Invalid email or password. Please try again.');
      } else if (err.message === 'Account is deactivated') {
        setError('Your account has been deactivated. Please contact support.');
      } else {
        setError(err.message || 'Login failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      maxWidth: '420px',
      margin: '50px auto',
      padding: '32px',
      background: '#0a0b0e',
      borderRadius: '16px',
      border: '1px solid rgba(255,255,255,0.06)',
      boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center'
    }}>
      <div style={{ textAlign: 'center', marginBottom: '28px' }}>
        <div style={{ fontSize: '40px' }}>🔐</div>
        <h2 style={{ margin: '8px 0 4px', color: '#eaecef', fontSize: '26px', fontWeight: '700' }}>
          Welcome Back
        </h2>
        <p style={{ color: '#848e9c', margin: 0, fontSize: '14px' }}>
          Sign in to continue trading
        </p>
      </div>

      {error && (
        <div style={{
          padding: '12px 16px',
          background: 'rgba(246,70,93,0.1)',
          border: '1px solid rgba(246,70,93,0.2)',
          borderRadius: '8px',
          color: '#f6465d',
          marginBottom: '16px',
          fontSize: '14px'
        }}>
          {error}
        </div>
      )}

      {success && (
        <div style={{
          padding: '12px 16px',
          background: 'rgba(14,203,129,0.1)',
          border: '1px solid rgba(14,203,129,0.2)',
          borderRadius: '8px',
          color: '#0ecb81',
          marginBottom: '16px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '28px' }}>🎉</div>
          <div style={{ fontWeight: '600', fontSize: '16px' }}>Login Successful!</div>
          <div style={{ fontSize: '13px', marginTop: '4px', opacity: 0.7 }}>Redirecting to dashboard...</div>
        </div>
      )}

      {!success && (
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ color: '#848e9c', fontSize: '13px', display: 'block', marginBottom: '6px', fontWeight: '500' }}>
              Email Address <span style={{ color: '#f6465d' }}>*</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="john@example.com"
              style={{
                width: '100%',
                padding: '12px 16px',
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '8px',
                color: '#eaecef',
                fontSize: '15px',
                outline: 'none',
                boxSizing: 'border-box',
                transition: 'border-color 0.3s'
              }}
              onFocus={(e) => e.target.style.borderColor = '#f0b90b'}
              onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
              required
            />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ color: '#848e9c', fontSize: '13px', display: 'block', marginBottom: '6px', fontWeight: '500' }}>
              Password <span style={{ color: '#f6465d' }}>*</span>
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              style={{
                width: '100%',
                padding: '12px 16px',
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '8px',
                color: '#eaecef',
                fontSize: '15px',
                outline: 'none',
                boxSizing: 'border-box',
                transition: 'border-color 0.3s'
              }}
              onFocus={(e) => e.target.style.borderColor = '#f0b90b'}
              onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '14px',
              background: loading ? '#2a2e39' : '#f0b90b',
              border: 'none',
              borderRadius: '8px',
              color: loading ? '#848e9c' : '#0a0b0e',
              fontWeight: '700',
              fontSize: '16px',
              cursor: loading ? 'default' : 'pointer',
              opacity: loading ? 0.6 : 1,
              transition: 'all 0.3s ease'
            }}
          >
            {loading ? '⏳ Logging in...' : '🔓 Sign In'}
          </button>
        </form>
      )}

      <div style={{ marginTop: '20px', textAlign: 'center', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
        <span style={{ color: '#848e9c', fontSize: '14px' }}>
          Don't have an account?{' '}
          <a href="/register" style={{ color: '#f0b90b', textDecoration: 'none', fontWeight: '600' }}>
            Create one now
          </a>
        </span>
      </div>
    </div>
  );
};

export default Login;