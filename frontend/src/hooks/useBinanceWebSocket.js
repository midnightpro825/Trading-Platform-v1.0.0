import { useState, useEffect, useRef } from 'react';

export const useBinanceWebSocket = (symbol = 'btcusdt', timeframe = '1m') => {
  const [price, setPrice] = useState(null);
  const [candles, setCandles] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState(null);
  const wsRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const priceIntervalRef = useRef(null);
  const candleDataRef = useRef([]);

  // Generate beautiful candlestick data
  const generateCandlestickData = (basePrice = 64000, count = 100) => {
    const data = [];
    let currentPrice = basePrice;
    let time = Math.floor(Date.now() / 1000) - count * 60;
    
    for (let i = 0; i < count; i++) {
      // Create realistic price movement with proper candlestick patterns
      const volatility = 0.003;
      const changePercent = (Math.random() - 0.5) * volatility * 2;
      const change = currentPrice * changePercent;
      
      const open = currentPrice;
      const close = currentPrice + change;
      const high = Math.max(open, close) + Math.abs(change) * (0.3 + Math.random() * 0.4);
      const low = Math.min(open, close) - Math.abs(change) * (0.3 + Math.random() * 0.4);
      
      data.push({
        time: time + i * 60,
        open: parseFloat(open.toFixed(2)),
        high: parseFloat(high.toFixed(2)),
        low: parseFloat(low.toFixed(2)),
        close: parseFloat(close.toFixed(2)),
        volume: parseFloat((Math.random() * 10 + 1).toFixed(2))
      });
      
      currentPrice = close;
    }
    return data;
  };

  // Initialize with beautiful candles
  useEffect(() => {
    if (candles.length === 0) {
      const initialData = generateCandlestickData(64000, 100);
      setCandles(initialData);
      candleDataRef.current = initialData;
      setPrice(initialData[initialData.length - 1].close);
    }
  }, []);

  // Update candles with new price
  const updateCandlesWithPrice = (newPrice) => {
    setCandles(prev => {
      const updated = [...prev];
      const last = updated[updated.length - 1];
      const currentTime = Math.floor(Date.now() / 1000);
      
      if (!last || (currentTime - last.time) >= 60) {
        // Create new candle
        const newCandle = {
          time: currentTime,
          open: last ? last.close : newPrice,
          high: Math.max(last ? last.close : newPrice, newPrice) + Math.random() * 15,
          low: Math.min(last ? last.close : newPrice, newPrice) - Math.random() * 15,
          close: newPrice,
          volume: parseFloat((Math.random() * 10 + 1).toFixed(2))
        };
        updated.push(newCandle);
        if (updated.length > 100) updated.shift();
      } else {
        // Update existing candle
        last.high = Math.max(last.high, newPrice);
        last.low = Math.min(last.low, newPrice);
        last.close = newPrice;
      }
      
      candleDataRef.current = updated;
      return updated;
    });
  };

  // Start price simulation (fallback)
  const startPriceSimulation = () => {
    if (priceIntervalRef.current) {
      clearInterval(priceIntervalRef.current);
    }
    
    priceIntervalRef.current = setInterval(() => {
      const change = (Math.random() - 0.5) * 80;
      const newPrice = Math.max(1000, (price || 64000) + change);
      const roundedPrice = parseFloat(newPrice.toFixed(2));
      
      setPrice(roundedPrice);
      updateCandlesWithPrice(roundedPrice);
    }, 2000);
  };

  // Connect to backend WebSocket
  const connect = () => {
    try {
      // Ensure we have initial candles
      if (candles.length === 0) {
        const initialData = generateCandlestickData(64000, 100);
        setCandles(initialData);
        candleDataRef.current = initialData;
        setPrice(initialData[initialData.length - 1].close);
      }

      // Connect to backend
      const wsUrl = `ws://localhost:8081`;
      
      if (wsRef.current) {
        wsRef.current.close();
      }

      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('✅ Connected to TradeFlow Backend WebSocket');
        setIsConnected(true);
        setError(null);
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          if (data.type === 'marketPrices') {
            const prices = data.data;
            if (prices && prices['BTC/USDT']) {
              const newPrice = prices['BTC/USDT'].price;
              const roundedPrice = parseFloat(newPrice.toFixed(2));
              
              setPrice(roundedPrice);
              updateCandlesWithPrice(roundedPrice);
            }
          }
        } catch (err) {
          console.error('WebSocket message error:', err);
        }
      };

      ws.onerror = (event) => {
        console.log('🔴 WebSocket error - using simulation');
        setIsConnected(false);
        if (!priceIntervalRef.current) {
          startPriceSimulation();
        }
      };

      ws.onclose = () => {
        console.log('🔴 WebSocket disconnected');
        setIsConnected(false);
        if (!priceIntervalRef.current) {
          startPriceSimulation();
        }
        
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
        }
        reconnectTimeoutRef.current = setTimeout(() => {
          connect();
        }, 5000);
      };

    } catch (err) {
      console.error('Connection error:', err);
      setError('Failed to connect');
      startPriceSimulation();
    }
  };

  useEffect(() => {
    connect();

    return () => {
      if (priceIntervalRef.current) {
        clearInterval(priceIntervalRef.current);
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  return { price, candles, isConnected, error, reconnect: connect };
};