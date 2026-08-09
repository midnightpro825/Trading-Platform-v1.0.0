import React, { useEffect, useRef, useState } from 'react';
import { createChart } from 'lightweight-charts';

const CandlestickChart = ({ 
  data = [], 
  price, 
  symbol, 
  timeframe, 
  onTimeframeChange,
  isConnected 
}) => {
  const chartContainerRef = useRef(null);
  const chartRef = useRef(null);
  const candlestickSeriesRef = useRef(null);
  const lineSeriesRef = useRef(null);
  const areaSeriesRef = useRef(null);
  const barSeriesRef = useRef(null);
  const [chartReady, setChartReady] = useState(false);
  const [chartType, setChartType] = useState('candlestick');
  const [activeIndicators, setActiveIndicators] = useState([]);
  const indicatorSeriesRef = useRef({});

  const timeframes = ['1m', '5m', '15m', '30m', '1h', '4h', '1d'];

  // Chart type options
  const chartTypes = [
    { id: 'candlestick', label: '📊 Candlestick', icon: '📊' },
    { id: 'line', label: '📈 Line', icon: '📈' },
    { id: 'area', label: '📉 Area', icon: '📉' },
    { id: 'bar', label: '📊 Bar', icon: '📊' },
  ];

  // Technical indicators
  const indicators = [
    { id: 'ma7', label: 'MA(7)', color: '#2962FF' },
    { id: 'ma25', label: 'MA(25)', color: '#FF6B6B' },
    { id: 'ma99', label: 'MA(99)', color: '#F5A623' },
    { id: 'ema12', label: 'EMA(12)', color: '#7B61FF' },
    { id: 'ema26', label: 'EMA(26)', color: '#FF6B9D' },
    { id: 'rsi', label: 'RSI', color: '#FF9800' },
    { id: 'macd', label: 'MACD', color: '#4CAF50' },
    { id: 'bb', label: 'Bollinger Bands', color: '#9C27B0' },
  ];

  // Initialize chart
  useEffect(() => {
    if (!chartContainerRef.current || chartReady) return;

    try {
      const container = chartContainerRef.current;
      const width = container.clientWidth || 800;
      const height = container.clientHeight || 400;

      const chart = createChart(container, {
        width: width,
        height: height,
        layout: {
          background: { color: '#131722' },
          textColor: '#d1d4dc',
        },
        grid: {
          vertLines: { color: '#2a2e39' },
          horzLines: { color: '#2a2e39' },
        },
        timeScale: {
          timeVisible: true,
          secondsVisible: false,
          borderColor: '#2a2e39',
          fixLeftEdge: true,
          fixRightEdge: true,
        },
        rightPriceScale: {
          borderColor: '#2a2e39',
          scaleMargins: {
            top: 0.1,
            bottom: 0.1,
          },
        },
        crosshair: {
          mode: 0,
          vertLine: {
            color: '#758696',
            labelBackgroundColor: '#2a2e39',
          },
          horzLine: {
            color: '#758696',
            labelBackgroundColor: '#2a2e39',
          },
        },
      });

      // Create candlestick series (default)
      const candlestickSeries = chart.addCandlestickSeries({
        upColor: '#0ecb81',
        downColor: '#f6465d',
        borderUpColor: '#0ecb81',
        borderDownColor: '#f6465d',
        wickUpColor: '#0ecb81',
        wickDownColor: '#f6465d',
        borderVisible: false,
        wickVisible: true,
      });

      chartRef.current = chart;
      candlestickSeriesRef.current = candlestickSeries;
      setChartReady(true);

      const handleResize = () => {
        if (chartRef.current && chartContainerRef.current) {
          chartRef.current.applyOptions({
            width: chartContainerRef.current.clientWidth,
          });
        }
      };

      window.addEventListener('resize', handleResize);

      return () => {
        window.removeEventListener('resize', handleResize);
        if (chartRef.current) {
          chartRef.current.remove();
        }
      };
    } catch (err) {
      console.error('Chart init error:', err);
    }
  }, []);

  // Switch chart type
  const switchChartType = (type) => {
    setChartType(type);
    
    if (!chartReady || !chartRef.current) return;

    try {
      // Remove all series
      if (candlestickSeriesRef.current) {
        chartRef.current.removeSeries(candlestickSeriesRef.current);
        candlestickSeriesRef.current = null;
      }
      if (lineSeriesRef.current) {
        chartRef.current.removeSeries(lineSeriesRef.current);
        lineSeriesRef.current = null;
      }
      if (areaSeriesRef.current) {
        chartRef.current.removeSeries(areaSeriesRef.current);
        areaSeriesRef.current = null;
      }
      if (barSeriesRef.current) {
        chartRef.current.removeSeries(barSeriesRef.current);
        barSeriesRef.current = null;
      }

      // Add new series based on type
      const sortedData = [...data].sort((a, b) => a.time - b.time);
      const chartData = sortedData.map(item => ({
        time: item.time,
        open: item.open,
        high: item.high,
        low: item.low,
        close: item.close,
      }));

      switch(type) {
        case 'candlestick':
          candlestickSeriesRef.current = chartRef.current.addCandlestickSeries({
            upColor: '#0ecb81',
            downColor: '#f6465d',
            borderUpColor: '#0ecb81',
            borderDownColor: '#f6465d',
            wickUpColor: '#0ecb81',
            wickDownColor: '#f6465d',
            borderVisible: false,
            wickVisible: true,
          });
          candlestickSeriesRef.current.setData(chartData);
          break;

        case 'line':
          lineSeriesRef.current = chartRef.current.addLineSeries({
            color: '#2962FF',
            lineWidth: 2,
            crosshairMarkerVisible: true,
            crosshairMarkerRadius: 4,
          });
          const lineData = chartData.map(item => ({
            time: item.time,
            value: item.close,
          }));
          lineSeriesRef.current.setData(lineData);
          break;

        case 'area':
          areaSeriesRef.current = chartRef.current.addAreaSeries({
            topColor: 'rgba(41, 98, 255, 0.4)',
            bottomColor: 'rgba(41, 98, 255, 0.0)',
            lineColor: '#2962FF',
            lineWidth: 2,
          });
          const areaData = chartData.map(item => ({
            time: item.time,
            value: item.close,
          }));
          areaSeriesRef.current.setData(areaData);
          break;

        case 'bar':
          barSeriesRef.current = chartRef.current.addBarSeries({
            upColor: '#0ecb81',
            downColor: '#f6465d',
          });
          barSeriesRef.current.setData(chartData);
          break;
      }

      chartRef.current?.timeScale().fitContent();

    } catch (err) {
      console.error('Chart type switch error:', err);
    }
  };

  // Set data on chart
  useEffect(() => {
    if (!chartReady || !chartRef.current) return;
    if (!data || data.length === 0) return;

    try {
      const sortedData = [...data].sort((a, b) => a.time - b.time);
      const chartData = sortedData.map(item => ({
        time: item.time,
        open: Number(item.open.toFixed(2)),
        high: Number(item.high.toFixed(2)),
        low: Number(item.low.toFixed(2)),
        close: Number(item.close.toFixed(2)),
      }));

      if (chartData.length === 0) return;

      // Update the current series based on chart type
      if (chartType === 'candlestick' && candlestickSeriesRef.current) {
        candlestickSeriesRef.current.setData(chartData);
      } else if (chartType === 'line' && lineSeriesRef.current) {
        const lineData = chartData.map(item => ({
          time: item.time,
          value: item.close,
        }));
        lineSeriesRef.current.setData(lineData);
      } else if (chartType === 'area' && areaSeriesRef.current) {
        const areaData = chartData.map(item => ({
          time: item.time,
          value: item.close,
        }));
        areaSeriesRef.current.setData(areaData);
      } else if (chartType === 'bar' && barSeriesRef.current) {
        barSeriesRef.current.setData(chartData);
      }

      chartRef.current?.timeScale().fitContent();
    } catch (err) {
      console.debug('Chart setData error:', err);
    }
  }, [data, chartReady, chartType]);

  // Update chart with new price
  useEffect(() => {
    if (!chartReady || !chartRef.current) return;
    if (!data || data.length === 0) return;
    if (!price) return;

    try {
      const lastCandle = data[data.length - 1];
      if (lastCandle && typeof price === 'number' && !isNaN(price) && price > 0) {
        const updateData = {
          time: lastCandle.time,
          open: lastCandle.open,
          high: Math.max(lastCandle.high, price),
          low: Math.min(lastCandle.low, price),
          close: price,
        };

        // Update current series
        if (chartType === 'candlestick' && candlestickSeriesRef.current) {
          candlestickSeriesRef.current.update(updateData);
        } else if (chartType === 'line' && lineSeriesRef.current) {
          lineSeriesRef.current.update({
            time: lastCandle.time,
            value: price,
          });
        } else if (chartType === 'area' && areaSeriesRef.current) {
          areaSeriesRef.current.update({
            time: lastCandle.time,
            value: price,
          });
        } else if (chartType === 'bar' && barSeriesRef.current) {
          barSeriesRef.current.update(updateData);
        }
      }
    } catch (err) {
      // Normal when new candle starts
    }
  }, [price, data, chartReady, chartType]);

  // Add indicator
  const addIndicator = (indicatorId) => {
    if (!chartReady || !chartRef.current || !data || data.length === 0) return;

    try {
      // Remove existing indicator if already added
      if (indicatorSeriesRef.current[indicatorId]) {
        chartRef.current.removeSeries(indicatorSeriesRef.current[indicatorId]);
        delete indicatorSeriesRef.current[indicatorId];
        setActiveIndicators(activeIndicators.filter(id => id !== indicatorId));
        return;
      }

      const indicator = indicators.find(i => i.id === indicatorId);
      if (!indicator) return;

      const sortedData = [...data].sort((a, b) => a.time - b.time);

      let indicatorData = [];
      let seriesColor = indicator.color;

      switch(indicatorId) {
        case 'ma7':
          indicatorData = calculateMA(sortedData, 7);
          break;
        case 'ma25':
          indicatorData = calculateMA(sortedData, 25);
          break;
        case 'ma99':
          indicatorData = calculateMA(sortedData, 99);
          break;
        case 'ema12':
          indicatorData = calculateEMA(sortedData, 12);
          break;
        case 'ema26':
          indicatorData = calculateEMA(sortedData, 26);
          break;
        case 'rsi':
          indicatorData = calculateRSI(sortedData, 14);
          seriesColor = '#FF9800';
          break;
        case 'macd':
          indicatorData = calculateMACD(sortedData);
          seriesColor = '#4CAF50';
          break;
        case 'bb':
          indicatorData = calculateBB(sortedData, 20, 2);
          seriesColor = '#9C27B0';
          break;
        default:
          return;
      }

      if (indicatorData.length === 0) return;

      const series = chartRef.current.addLineSeries({
        color: seriesColor,
        lineWidth: 2,
        title: indicator.label,
        crosshairMarkerVisible: true,
        crosshairMarkerRadius: 3,
      });

      series.setData(indicatorData);
      indicatorSeriesRef.current[indicatorId] = series;
      setActiveIndicators([...activeIndicators, indicatorId]);

    } catch (err) {
      console.error('Indicator error:', err);
    }
  };

  // Calculate Moving Average
  const calculateMA = (data, period) => {
    const result = [];
    for (let i = period - 1; i < data.length; i++) {
      let sum = 0;
      for (let j = i - period + 1; j <= i; j++) {
        sum += data[j].close;
      }
      result.push({
        time: data[i].time,
        value: parseFloat((sum / period).toFixed(2)),
      });
    }
    return result;
  };

  // Calculate EMA
  const calculateEMA = (data, period) => {
    const result = [];
    const multiplier = 2 / (period + 1);
    let ema = data[0].close;
    
    for (let i = 0; i < data.length; i++) {
      if (i === 0) {
        ema = data[i].close;
      } else {
        ema = (data[i].close - ema) * multiplier + ema;
      }
      result.push({
        time: data[i].time,
        value: parseFloat(ema.toFixed(2)),
      });
    }
    return result;
  };

  // Calculate RSI
  const calculateRSI = (data, period = 14) => {
    const result = [];
    let avgGain = 0;
    let avgLoss = 0;
    
    for (let i = 1; i <= period && i < data.length; i++) {
      const change = data[i].close - data[i-1].close;
      if (change >= 0) avgGain += change;
      else avgLoss += Math.abs(change);
    }
    
    avgGain /= period;
    avgLoss /= period;
    
    let rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
    let rsi = 100 - (100 / (1 + rs));
    
    result.push({
      time: data[period].time,
      value: parseFloat(rsi.toFixed(2)),
    });
    
    for (let i = period + 1; i < data.length; i++) {
      const change = data[i].close - data[i-1].close;
      if (change >= 0) {
        avgGain = (avgGain * (period - 1) + change) / period;
        avgLoss = (avgLoss * (period - 1)) / period;
      } else {
        avgGain = (avgGain * (period - 1)) / period;
        avgLoss = (avgLoss * (period - 1) + Math.abs(change)) / period;
      }
      rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
      rsi = 100 - (100 / (1 + rs));
      result.push({
        time: data[i].time,
        value: parseFloat(rsi.toFixed(2)),
      });
    }
    return result;
  };

  // Calculate MACD
  const calculateMACD = (data) => {
    const ema12 = calculateEMA(data, 12);
    const ema26 = calculateEMA(data, 26);
    const result = [];
    
    for (let i = 0; i < ema12.length && i < ema26.length; i++) {
      if (ema12[i] && ema26[i]) {
        result.push({
          time: ema12[i].time,
          value: parseFloat((ema12[i].value - ema26[i].value).toFixed(2)),
        });
      }
    }
    return result;
  };

  // Calculate Bollinger Bands
  const calculateBB = (data, period = 20, stdDev = 2) => {
    const result = [];
    for (let i = period - 1; i < data.length; i++) {
      let sum = 0;
      for (let j = i - period + 1; j <= i; j++) {
        sum += data[j].close;
      }
      const mean = sum / period;
      
      let variance = 0;
      for (let j = i - period + 1; j <= i; j++) {
        variance += Math.pow(data[j].close - mean, 2);
      }
      variance /= period;
      const std = Math.sqrt(variance);
      
      result.push({
        time: data[i].time,
        value: parseFloat((mean + stdDev * std).toFixed(2)),
      });
    }
    return result;
  };

  // Clear all indicators
  const clearIndicators = () => {
    Object.keys(indicatorSeriesRef.current).forEach(key => {
      if (indicatorSeriesRef.current[key]) {
        chartRef.current.removeSeries(indicatorSeriesRef.current[key]);
      }
    });
    indicatorSeriesRef.current = {};
    setActiveIndicators([]);
  };

  return (
    <div className="candlestick-chart-wrapper">
      <div className="chart-header">
        <div className="chart-info">
          <span className="chart-symbol">{symbol?.toUpperCase() || 'BTC/USDT'}</span>
          <span className="chart-price" style={{ 
            color: price && data.length > 0 && price >= data[data.length - 1]?.open ? '#0ecb81' : '#f6465d' 
          }}>
            ${price?.toFixed(2) || '0.00'}
          </span>
          <span className={`chart-status ${isConnected ? 'connected' : 'disconnected'}`}>
            {isConnected ? '● Live' : '● Offline'}
          </span>
        </div>
        <div className="chart-controls">
          <div className="chart-type-selector">
            {chartTypes.map(type => (
              <button
                key={type.id}
                className={`chart-type-btn ${chartType === type.id ? 'active' : ''}`}
                onClick={() => switchChartType(type.id)}
                title={type.label}
              >
                {type.icon}
              </button>
            ))}
          </div>
          <div className="chart-timeframes">
            {timeframes.map(tf => (
              <button
                key={tf}
                className={`tf-btn ${timeframe === tf ? 'active' : ''}`}
                onClick={() => onTimeframeChange && onTimeframeChange(tf)}
              >
                {tf}
              </button>
            ))}
          </div>
        </div>
      </div>
      
      <div ref={chartContainerRef} className="chart-container" />
      
      {/* Indicators Bar */}
      <div className="indicators-bar">
        <div className="indicators-list">
          {indicators.map(ind => (
            <button
              key={ind.id}
              className={`indicator-tag ${activeIndicators.includes(ind.id) ? 'active' : ''}`}
              onClick={() => addIndicator(ind.id)}
              style={{ borderColor: activeIndicators.includes(ind.id) ? ind.color : 'transparent' }}
            >
              <span className="indicator-dot" style={{ backgroundColor: ind.color }} />
              {ind.label}
            </button>
          ))}
        </div>
        {activeIndicators.length > 0 && (
          <button className="clear-indicators-btn" onClick={clearIndicators}>
            ✕ Clear All
          </button>
        )}
      </div>
    </div>
  );
};

export default CandlestickChart;