import React, { useEffect, useState, useRef } from 'react';
import './LandingPage.css';

// Image imports
const heroBg = '/images/hero-bg.jpg.jpg';
const heroBg2 = '/images/hero-bg-2.jpg.jpeg';
const heroBg3 = '/images/hero-bg-3.jpg.webp';
const featureBitcoin = '/images/feature-bitcoin.svg.png';
const featureSecurity = '/images/feature-security.svg.png';
const featuresEthereum = '/images/features-ethereum.svg.png';
const solanaLogo = '/images/solana-sol-logo.png';

// Video imports - Updated to correct path where videos are located
const heroVideo1 = '/images/videos/hero-video-1.mp4';
const heroVideo2 = '/images/videos/hero-video-2.mp4';
const heroVideo3 = '/images/videos/hero-video-3.mp4';

const LandingPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
    interest: 'trading'
  });
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [activeSlide, setActiveSlide] = useState(0);
  const [useVideo, setUseVideo] = useState(true); // Set to true since videos exist
  const [videosLoaded, setVideosLoaded] = useState(false);
  const videoRefs = useRef([]);
  const [isPlaying, setIsPlaying] = useState(true);

  useEffect(() => {
    // Check if videos exist
    const checkVideos = async () => {
      try {
        const response = await fetch(heroVideo1, { method: 'HEAD' });
        if (response.ok) {
          setUseVideo(true);
          setVideosLoaded(true);
          // Auto-play first video
          setTimeout(() => {
            if (videoRefs.current[0]) {
              videoRefs.current[0].play().catch(() => {});
            }
          }, 500);
        } else {
          setUseVideo(false);
        }
      } catch {
        setUseVideo(false);
      }
    };
    checkVideos();

    // Navbar scroll effect
    const handleScroll = () => {
      const navbar = document.getElementById('navbar');
      if (navbar) {
        if (window.scrollY > 50) {
          navbar.classList.add('scrolled');
        } else {
          navbar.classList.remove('scrolled');
        }
      }
    };

    // Smooth scroll for anchor links
    const handleAnchorClick = (e) => {
      const target = e.target.closest('a[href^="#"]');
      if (target) {
        e.preventDefault();
        const element = document.querySelector(target.getAttribute('href'));
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    };

    // Intersection Observer for animations
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, { threshold: 0.1 });

    document.querySelectorAll('.animate-on-scroll').forEach(el => {
      observer.observe(el);
    });

    // Auto-rotate slides
    const interval = setInterval(() => {
      setActiveSlide((prev) => {
        const next = (prev + 1) % 3;
        // Pause all videos
        if (useVideo && videosLoaded) {
          videoRefs.current.forEach(video => {
            if (video) {
              video.pause();
              video.currentTime = 0;
            }
          });
        }
        // Play the new video after a small delay
        if (useVideo && videosLoaded) {
          setTimeout(() => {
            const nextVideo = videoRefs.current[next];
            if (nextVideo && isPlaying) {
              nextVideo.currentTime = 0;
              nextVideo.play().catch(() => {});
            }
          }, 150);
        }
        return next;
      });
    }, 8000);

    window.addEventListener('scroll', handleScroll);
    document.addEventListener('click', handleAnchorClick);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('click', handleAnchorClick);
      observer.disconnect();
      clearInterval(interval);
    };
  }, [useVideo, videosLoaded, isPlaying]);

  const handleFormChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    setFormSubmitted(true);
    setTimeout(() => setFormSubmitted(false), 5000);
  };

  const handleSlideChange = (index) => {
    setActiveSlide(index);
    // Pause all videos
    if (useVideo && videosLoaded) {
      videoRefs.current.forEach(video => {
        if (video) {
          video.pause();
          video.currentTime = 0;
        }
      });
      // Play the selected video
      setTimeout(() => {
        const selectedVideo = videoRefs.current[index];
        if (selectedVideo && isPlaying) {
          selectedVideo.currentTime = 0;
          selectedVideo.play().catch(() => {});
        }
      }, 150);
    }
  };

  const togglePlayPause = () => {
    if (!useVideo || !videosLoaded) return;
    setIsPlaying(!isPlaying);
    const currentVideo = videoRefs.current[activeSlide];
    if (currentVideo) {
      if (isPlaying) {
        currentVideo.pause();
      } else {
        currentVideo.play().catch(() => {});
      }
    }
  };

  const heroImages = [heroBg, heroBg2, heroBg3];
  const heroVideos = [heroVideo1, heroVideo2, heroVideo3];

  // Handle video errors - fallback to image
  const handleVideoError = (index) => {
    console.warn(`Video ${index + 1} failed to load, falling back to image`);
  };

  return (
    <div className="landing-page">
      {/* ============================================================
           NAVIGATION
           ============================================================ */}
      <nav className="navbar" id="navbar">
        <a href="/" className="logo">
          <span className="logo-icon">▲</span>
          Trade<span className="logo-highlight">Flow</span>
        </a>
        <div className="nav-links">
          <a href="#features">Features</a>
          <a href="#markets">Markets</a>
          <a href="#ai-trading">AI Trading</a>
          <a href="#security">Security</a>
          <a href="#pricing">Pricing</a>
          <a href="#contact">Contact</a>
        </div>
        <div className="nav-buttons">
          <a href="/login" className="btn-login">Log In</a>
          <a href="/register" className="btn-register">Get Started</a>
        </div>
      </nav>

      {/* ============================================================
           HERO SECTION WITH VIDEO BACKGROUND
           ============================================================ */}
      <section className="hero">
        {/* Background Video/Image Slider */}
        <div className="hero-slider">
          {useVideo && videosLoaded ? (
            // Video backgrounds
            heroVideos.map((video, index) => (
              <video
                key={index}
                ref={el => videoRefs.current[index] = el}
                className={`hero-slide ${index === activeSlide ? 'active' : ''}`}
                autoPlay={index === 0}
                muted
                loop={false}
                playsInline
                preload="auto"
                onError={() => handleVideoError(index)}
                poster={heroImages[index]}
              >
                <source src={video} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            ))
          ) : (
            // Fallback to images if videos don't exist
            heroImages.map((img, index) => (
              <div 
                key={index}
                className={`hero-slide ${index === activeSlide ? 'active' : ''}`}
                style={{ 
                  backgroundImage: `url(${img})`, 
                  backgroundSize: 'cover', 
                  backgroundPosition: 'center',
                  backgroundRepeat: 'no-repeat'
                }}
              />
            ))
          )}
          <div className="hero-overlay"></div>
        </div>

        {/* Play/Pause Button (only when videos are playing) */}
        {useVideo && videosLoaded && (
          <button 
            className="play-pause-btn" 
            onClick={togglePlayPause}
            aria-label={isPlaying ? 'Pause video' : 'Play video'}
          >
            {isPlaying ? '⏸' : '▶️'}
          </button>
        )}

        {/* Slide indicators */}
        <div className="slide-indicators">
          {[0, 1, 2].map((index) => (
            <button
              key={index}
              className={`slide-dot ${index === activeSlide ? 'active' : ''}`}
              onClick={() => handleSlideChange(index)}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>

        <div className="hero-content">
          <div className="hero-badge">
            <span className="dot"></span>
            <span>🚀 Powered by AI • 24/7 Trading • 150+ Assets</span>
          </div>
          <h1>
            The Future of<br />
            <span className="highlight">Crypto & AI Trading</span>
          </h1>
          <p>
            Trade, invest, and grow your wealth with the world's most advanced 
            AI-powered trading platform. Built for the next generation of investors.
          </p>
          <div className="hero-stats">
            <div className="hero-stat">
              <span className="stat-number">$2.4<span className="highlight">T+</span></span>
              <span className="stat-label">Total Volume</span>
            </div>
            <div className="hero-stat">
              <span className="stat-number">150<span className="highlight">+</span></span>
              <span className="stat-label">Assets</span>
            </div>
            <div className="hero-stat">
              <span className="stat-number">100<span className="highlight">k+</span></span>
              <span className="stat-label">Active Traders</span>
            </div>
            <div className="hero-stat">
              <span className="stat-number">99.99<span className="highlight">%</span></span>
              <span className="stat-label">Uptime</span>
            </div>
          </div>
          <div className="hero-buttons">
            <a href="/register" className="btn-primary">🚀 Start Trading Free</a>
            <a href="#features" className="btn-secondary">Explore Features ↓</a>
          </div>
        </div>
      </section>

      {/* ============================================================
           TRUST BAR
           ============================================================ */}
      <section className="trust-bar">
        <div className="trust-item">
          <span className="trust-number">100<span className="highlight">k+</span></span>
          <span className="trust-label">Active Traders</span>
        </div>
        <div className="trust-item">
          <span className="trust-number">$2.4<span className="highlight">T</span></span>
          <span className="trust-label">Volume Traded</span>
        </div>
        <div className="trust-item">
          <span className="trust-number">150<span className="highlight">+</span></span>
          <span className="trust-label">Assets Listed</span>
        </div>
        <div className="trust-item">
          <span className="trust-number">99.99<span className="highlight">%</span></span>
          <span className="trust-label">Uptime Guarantee</span>
        </div>
        <div className="trust-item">
          <span className="trust-number">50<span className="highlight">M+</span></span>
          <span className="trust-label">Trades Executed</span>
        </div>
        <div className="trust-item">
          <span className="trust-number">150<span className="highlight">+</span></span>
          <span className="trust-label">Countries</span>
        </div>
      </section>

      {/* ============================================================
           FEATURES SECTION
           ============================================================ */}
      <section className="features" id="features">
        <div className="section-header animate-on-scroll">
          <span className="section-tag">✨ Features</span>
          <h2 className="section-title">
            Everything You Need to <span className="highlight">Succeed</span>
          </h2>
          <p className="section-subtitle">
            From AI-powered trading to advanced security, we've got you covered.
          </p>
        </div>
        <div className="features-grid">
          <div className="feature-card animate-on-scroll">
            <div className="feature-image-wrapper">
              <img src={featureBitcoin} alt="Bitcoin" className="feature-img" />
            </div>
            <span className="feature-icon">⚡</span>
            <h3>Lightning Fast Trading</h3>
            <p>100,000 TPS matching engine for instant trade execution with zero latency.</p>
            <span className="feature-tag">Fast</span>
          </div>
          <div className="feature-card animate-on-scroll">
            <div className="feature-image-wrapper">
              <img src={featuresEthereum} alt="Ethereum" className="feature-img" />
            </div>
            <span className="feature-icon">🤖</span>
            <h3>AI Trading Assistant</h3>
            <p>Automated trading strategies powered by advanced AI algorithms for optimal returns.</p>
            <span className="feature-tag">New</span>
          </div>
          <div className="feature-card animate-on-scroll">
            <div className="feature-image-wrapper">
              <img src={featureSecurity} alt="Security" className="feature-img" />
            </div>
            <span className="feature-icon">🔒</span>
            <h3>Bank-Grade Security</h3>
            <p>256-bit encryption, cold storage, and 2FA protection for your peace of mind.</p>
            <span className="feature-tag">Secure</span>
          </div>
          <div className="feature-card animate-on-scroll">
            <span className="feature-icon">📊</span>
            <h3>Advanced Charts</h3>
            <p>50+ indicators, multiple timeframes, and professional drawing tools for analysis.</p>
            <span className="feature-tag">Pro</span>
          </div>
          <div className="feature-card animate-on-scroll">
            <span className="feature-icon">💰</span>
            <h3>Lowest Fees</h3>
            <p>Fees as low as 0.1% with volume-based discounts for active traders.</p>
            <span className="feature-tag">Save</span>
          </div>
          <div className="feature-card animate-on-scroll">
            <span className="feature-icon">📱</span>
            <h3>Trade Anywhere</h3>
            <p>Full-featured mobile app for iOS and Android with real-time notifications.</p>
            <span className="feature-tag">Mobile</span>
          </div>
        </div>
      </section>

      {/* ============================================================
           AI TRADING SECTION
           ============================================================ */}
      <section className="ai-trading" id="ai-trading">
        <div className="ai-content animate-on-scroll">
          <span className="section-tag">🤖 AI Powered</span>
          <h2 className="section-title">
            The Future of Trading is <span className="highlight">AI</span>
          </h2>
          <p className="section-subtitle">
            Let our advanced AI agents trade for you. Automate your strategies 
            and maximize your returns with machine learning precision.
          </p>
          <div className="ai-features">
            <div className="ai-feature">
              <span className="ai-icon">🧠</span>
              <div>
                <h4>Smart AI Agents</h4>
                <p>Autonomous AI agents that trade based on your preferences</p>
              </div>
            </div>
            <div className="ai-feature">
              <span className="ai-icon">📊</span>
              <div>
                <h4>Market Predictions</h4>
                <p>AI-powered predictions with 85%+ accuracy rate</p>
              </div>
            </div>
            <div className="ai-feature">
              <span className="ai-icon">🔄</span>
              <div>
                <h4>Portfolio Optimization</h4>
                <p>AI-driven portfolio rebalancing and risk management</p>
              </div>
            </div>
            <div className="ai-feature">
              <span className="ai-icon">📈</span>
              <div>
                <h4>Real-time Insights</h4>
                <p>Instant market analysis and personalized recommendations</p>
              </div>
            </div>
          </div>
          <div className="ai-stats">
            <div className="ai-stat">
              <span className="ai-stat-number">50k+</span>
              <span className="ai-stat-label">AI Trades</span>
            </div>
            <div className="ai-stat">
              <span className="ai-stat-number">85%</span>
              <span className="ai-stat-label">Accuracy Rate</span>
            </div>
            <div className="ai-stat">
              <span className="ai-stat-number">24/7</span>
              <span className="ai-stat-label">AI Availability</span>
            </div>
          </div>
          <a href="/register" className="btn-primary ai-cta">Try AI Assistant Now</a>
        </div>
        <div className="ai-visual animate-on-scroll">
          <div className="ai-card">
            <div className="ai-card-header">
              <span className="status-dot"></span>
              <span>AI Agent - Online</span>
            </div>
            <div className="ai-card-body">
              <div className="ai-trade">
                <span>BTC/USDT</span>
                <span className="ai-trade-buy">BUY</span>
                <span>$61,690</span>
              </div>
              <div className="ai-trade">
                <span>ETH/USDT</span>
                <span className="ai-trade-sell">SELL</span>
                <span>$1,748</span>
              </div>
              <div className="ai-trade">
                <span>SOL/USDT</span>
                <span className="ai-trade-buy">BUY</span>
                <span>$152.30</span>
              </div>
              <div className="ai-trade">
                <span>DOGE/USDT</span>
                <span className="ai-trade-sell">SELL</span>
                <span>$0.12</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
           MARKETS SECTION
           ============================================================ */}
      <section className="markets" id="markets">
        <div className="section-header animate-on-scroll">
          <span className="section-tag">📈 Markets</span>
          <h2 className="section-title">
            Most Traded <span className="highlight">Assets</span>
          </h2>
          <p className="section-subtitle">
            Trade the most liquid and popular crypto assets in the world.
          </p>
        </div>
        <div className="markets-grid">
          <div className="market-card animate-on-scroll">
            <div className="market-left">
              <span className="market-icon">₿</span>
              <div>
                <span className="market-symbol">BTC/USDT</span>
                <span className="market-name">Bitcoin</span>
              </div>
            </div>
            <div>
              <span className="market-price">$61,690.47</span>
              <span className="market-change negative">-1.50%</span>
            </div>
          </div>
          <div className="market-card animate-on-scroll">
            <div className="market-left">
              <span className="market-icon">⟠</span>
              <div>
                <span className="market-symbol">ETH/USDT</span>
                <span className="market-name">Ethereum</span>
              </div>
            </div>
            <div>
              <span className="market-price">$1,748.74</span>
              <span className="market-change negative">-0.97%</span>
            </div>
          </div>
          <div className="market-card animate-on-scroll">
            <div className="market-left">
              <img src={solanaLogo} alt="Solana" className="market-icon-img" />
              <div>
                <span className="market-symbol">SOL/USDT</span>
                <span className="market-name">Solana</span>
              </div>
            </div>
            <div>
              <span className="market-price">$152.30</span>
              <span className="market-change positive">+2.15%</span>
            </div>
          </div>
          <div className="market-card animate-on-scroll">
            <div className="market-left">
              <span className="market-icon">🪙</span>
              <div>
                <span className="market-symbol">BNB/USDT</span>
                <span className="market-name">BNB</span>
              </div>
            </div>
            <div>
              <span className="market-price">$598.20</span>
              <span className="market-change positive">+1.20%</span>
            </div>
          </div>
          <div className="market-card animate-on-scroll">
            <div className="market-left">
              <span className="market-icon">🐕</span>
              <div>
                <span className="market-symbol">DOGE/USDT</span>
                <span className="market-name">Dogecoin</span>
              </div>
            </div>
            <div>
              <span className="market-price">$0.12</span>
              <span className="market-change negative">-3.25%</span>
            </div>
          </div>
          <div className="market-card animate-on-scroll">
            <div className="market-left">
              <span className="market-icon">₳</span>
              <div>
                <span className="market-symbol">ADA/USDT</span>
                <span className="market-name">Cardano</span>
              </div>
            </div>
            <div>
              <span className="market-price">$0.45</span>
              <span className="market-change negative">-0.33%</span>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
           SECURITY SECTION
           ============================================================ */}
      <section className="security" id="security">
        <div className="security-content animate-on-scroll">
          <span className="section-tag">🔒 Security</span>
          <h2 className="section-title">
            Bank-Grade <span className="highlight">Security</span>
          </h2>
          <p className="section-subtitle">
            Your assets are protected with military-grade encryption and industry-leading security.
          </p>
          <div className="security-grid">
            <div className="security-item">
              <span className="security-icon">🛡️</span>
              <div>
                <h4>256-bit Encryption</h4>
                <p>Military-grade encryption for all data transmissions</p>
              </div>
            </div>
            <div className="security-item">
              <span className="security-icon">🔐</span>
              <div>
                <h4>Multi-Factor Auth</h4>
                <p>2FA and biometric authentication options</p>
              </div>
            </div>
            <div className="security-item">
              <span className="security-icon">❄️</span>
              <div>
                <h4>Cold Storage</h4>
                <p>95% of assets stored securely offline</p>
              </div>
            </div>
            <div className="security-item">
              <span className="security-icon">👁️</span>
              <div>
                <h4>Real-time Monitoring</h4>
                <p>24/7 threat detection and monitoring</p>
              </div>
            </div>
            <div className="security-item">
              <span className="security-icon">📋</span>
              <div>
                <h4>Regulated & Compliant</h4>
                <p>Fully licensed and regulated in multiple jurisdictions</p>
              </div>
            </div>
            <div className="security-item">
              <span className="security-icon">🎯</span>
              <div>
                <h4>Insurance Coverage</h4>
                <p>Up to $100M in insurance protection</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
           PRICING SECTION
           ============================================================ */}
      <section className="pricing" id="pricing">
        <div className="section-header animate-on-scroll">
          <span className="section-tag">💎 Pricing</span>
          <h2 className="section-title">
            Simple, <span className="highlight">Transparent</span> Pricing
          </h2>
          <p className="section-subtitle">
            No hidden fees. No surprises. Just fair, competitive pricing.
          </p>
        </div>
        <div className="pricing-grid">
          <div className="pricing-card animate-on-scroll">
            <div className="pricing-badge">Starter</div>
            <h3 className="pricing-price">$0</h3>
            <p className="pricing-period">Forever free</p>
            <ul className="pricing-features">
              <li>✓ 50+ Assets</li>
              <li>✓ Basic Charts</li>
              <li>✓ 24/7 Support</li>
              <li>✓ 0.5% Trading Fees</li>
            </ul>
            <a href="/register" className="btn-secondary pricing-btn">Get Started</a>
          </div>
          <div className="pricing-card featured animate-on-scroll">
            <div className="pricing-badge">Pro</div>
            <h3 className="pricing-price">$29</h3>
            <p className="pricing-period">Per month</p>
            <ul className="pricing-features">
              <li>✓ 150+ Assets</li>
              <li>✓ Advanced Charts</li>
              <li>✓ AI Trading Assistant</li>
              <li>✓ 0.1% Trading Fees</li>
              <li>✓ Priority Support</li>
            </ul>
            <a href="/register" className="btn-primary pricing-btn">Start Pro</a>
          </div>
          <div className="pricing-card animate-on-scroll">
            <div className="pricing-badge">Enterprise</div>
            <h3 className="pricing-price">Custom</h3>
            <p className="pricing-period">Tailored for you</p>
            <ul className="pricing-features">
              <li>✓ All Pro Features</li>
              <li>✓ Custom Solutions</li>
              <li>✓ Dedicated Account Manager</li>
              <li>✓ API Access</li>
              <li>✓ Volume Discounts</li>
            </ul>
            <a href="#contact" className="btn-secondary pricing-btn">Contact Sales</a>
          </div>
        </div>
      </section>

      {/* ============================================================
           CONTACT SECTION
           ============================================================ */}
      <section className="contact" id="contact">
        <div className="contact-content animate-on-scroll">
          <span className="section-tag">📩 Contact</span>
          <h2 className="section-title">
            Get in <span className="highlight">Touch</span>
          </h2>
          <p className="section-subtitle">
            Have questions? We'd love to hear from you. Send us a message.
          </p>
          <div className="contact-container">
            <div className="contact-info">
              <div className="contact-info-item">
                <span className="contact-icon">📍</span>
                <div>
                  <h4>Our Office</h4>
                  <p>123 Trading Street, New York, NY 10001</p>
                </div>
              </div>
              <div className="contact-info-item">
                <span className="contact-icon">📧</span>
                <div>
                  <h4>Email Us</h4>
                  <p>support@tradeflow.com</p>
                </div>
              </div>
              <div className="contact-info-item">
                <span className="contact-icon">📱</span>
                <div>
                  <h4>Call Us</h4>
                  <p>+1 (800) 123-4567</p>
                </div>
              </div>
              <div className="contact-info-item">
                <span className="contact-icon">⏰</span>
                <div>
                  <h4>Working Hours</h4>
                  <p>24/7 - We're always here</p>
                </div>
              </div>
            </div>
            <div className="contact-form">
              {formSubmitted ? (
                <div className="form-success">
                  <span className="success-icon">✅</span>
                  <h3>Thank You!</h3>
                  <p>Your message has been sent. We'll get back to you within 24 hours.</p>
                </div>
              ) : (
                <form onSubmit={handleFormSubmit}>
                  <div className="form-group">
                    <label htmlFor="name">Full Name</label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      placeholder="John Doe"
                      value={formData.name}
                      onChange={handleFormChange}
                      required
                    />
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="email">Email Address</label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        placeholder="john@example.com"
                        value={formData.email}
                        onChange={handleFormChange}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="phone">Phone Number</label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        placeholder="+1 (800) 123-4567"
                        value={formData.phone}
                        onChange={handleFormChange}
                      />
                    </div>
                  </div>
                  <div className="form-group">
                    <label htmlFor="interest">I'm interested in</label>
                    <select
                      id="interest"
                      name="interest"
                      value={formData.interest}
                      onChange={handleFormChange}
                    >
                      <option value="trading">Crypto Trading</option>
                      <option value="ai">AI Trading</option>
                      <option value="enterprise">Enterprise Solutions</option>
                      <option value="partnership">Partnership</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label htmlFor="message">Message</label>
                    <textarea
                      id="message"
                      name="message"
                      placeholder="Tell us how we can help you..."
                      rows="4"
                      value={formData.message}
                      onChange={handleFormChange}
                      required
                    ></textarea>
                  </div>
                  <button type="submit" className="btn-primary form-submit">
                    Send Message → 
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
           CTA SECTION
           ============================================================ */}
      <section className="cta">
        <div className="cta-content animate-on-scroll">
          <h2>
            Ready to Start <span className="highlight">Trading</span>?
          </h2>
          <p>
            Join 100,000+ traders and start your crypto journey today.
            <br />
            <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '14px' }}>
              No credit card required • Free to start
            </span>
          </p>
          <div className="cta-buttons">
            <a href="/register" className="btn-primary cta-button">Create Free Account</a>
            <a href="#contact" className="btn-secondary cta-button">Contact Sales</a>
          </div>
        </div>
      </section>

      {/* ============================================================
           FOOTER
           ============================================================ */}
      <footer className="footer">
        <div className="footer-grid">
          <div className="footer-brand">
            <a href="/" className="logo">
              <span className="logo-icon">▲</span>
              Trade<span className="logo-highlight">Flow</span>
            </a>
            <p>The future of crypto and AI trading.</p>
            <div className="social-links">
              <a href="#">📘</a>
              <a href="#">🐦</a>
              <a href="#">📺</a>
              <a href="#">💼</a>
            </div>
          </div>
          <div className="footer-links">
            <h4>Product</h4>
            <a href="#features">Features</a>
            <a href="#pricing">Pricing</a>
            <a href="#ai-trading">AI Trading</a>
            <a href="#markets">Markets</a>
          </div>
          <div className="footer-links">
            <h4>Company</h4>
            <a href="#">About Us</a>
            <a href="#">Careers</a>
            <a href="#">Blog</a>
            <a href="#contact">Contact</a>
          </div>
          <div className="footer-links">
            <h4>Support</h4>
            <a href="#">Help Center</a>
            <a href="#">Documentation</a>
            <a href="#">API</a>
            <a href="#">Status</a>
          </div>
          <div className="footer-links">
            <h4>Legal</h4>
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Service</a>
            <a href="#">Cookie Policy</a>
            <a href="#">Security</a>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© 2026 TradeFlow. All rights reserved. Built for the next generation of investors.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;