import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const { register } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setLoading(true);

    if (!name || !email || !password) {
      setError('Please fill in all fields');
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    try {
      console.log('📝 Registering user:', name);
      
      const userData = {
        name: name,
        email: email,
        password: password,
        username: name.toLowerCase().replace(/\s/g, '')
      };

      const result = await register(userData);
      console.log('✅ Registration successful:', result);
      
      setSuccess(true);
      
      // Redirect to dashboard after 1.5 seconds
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 1500);
      
    } catch (err) {
      console.error('❌ Registration error:', err);
      
      // Handle specific error messages from backend
      if (err.field === 'username') {
        setError('Username already taken. Please choose another.');
      } else if (err.field === 'email') {
        setError('Email already registered. Please login instead.');
      } else if (err.field === 'all') {
        setError('All fields are required.');
      } else if (err.field === 'password') {
        setError('Password must be at least 6 characters.');
      } else {
        setError(err.message || 'Registration failed. Please try again.');
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
        <div style={{ fontSize: '40px' }}>🚀</div>
        <h2 style={{ margin: '8px 0 4px', color: '#eaecef', fontSize: '26px', fontWeight: '700' }}>
          Create Account
        </h2>
        <p style={{ color: '#848e9c', margin: 0, fontSize: '14px' }}>
          Start trading crypto in minutes
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
          <div style={{ fontWeight: '600', fontSize: '16px' }}>Registration Successful!</div>
          <div style={{ fontSize: '13px', marginTop: '4px', opacity: 0.7 }}>Redirecting to dashboard...</div>
        </div>
      )}

      {!success && (
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ color: '#848e9c', fontSize: '13px', display: 'block', marginBottom: '6px', fontWeight: '500' }}>
              Full Name <span style={{ color: '#f6465d' }}>*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="John Doe"
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

          <div style={{ marginBottom: '16px' }}>
            <label style={{ color: '#848e9c', fontSize: '13px', display: 'block', marginBottom: '6px', fontWeight: '500' }}>
              Password <span style={{ color: '#f6465d' }}>*</span>
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Min 6 characters"
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
              minLength="6"
            />
            <div style={{ fontSize: '12px', color: '#848e9c', marginTop: '4px' }}>
              Minimum 6 characters
            </div>
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ color: '#848e9c', fontSize: '13px', display: 'block', marginBottom: '6px', fontWeight: '500' }}>
              Confirm Password <span style={{ color: '#f6465d' }}>*</span>
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm your password"
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
            {loading ? '⏳ Creating Account...' : '🚀 Create Account'}
          </button>
        </form>
      )}

      <div style={{ marginTop: '20px', textAlign: 'center', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
        <span style={{ color: '#848e9c', fontSize: '14px' }}>
          Already have an account?{' '}
          <a href="/login" style={{ color: '#f0b90b', textDecoration: 'none', fontWeight: '600' }}>
            Sign In
          </a>
        </span>
      </div>
    </div>
  );
};

export default Register;