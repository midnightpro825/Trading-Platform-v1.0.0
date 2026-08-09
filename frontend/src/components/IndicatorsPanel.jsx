import React, { useState } from 'react';

const IndicatorsPanel = ({ onAddIndicator }) => {
  const [selectedIndicator, setSelectedIndicator] = useState('');

  const indicators = [
    { name: 'MA (Moving Average)', value: 'ma' },
    { name: 'EMA (Exponential MA)', value: 'ema' },
    { name: 'RSI (Relative Strength)', value: 'rsi' },
    { name: 'MACD', value: 'macd' },
    { name: 'Bollinger Bands', value: 'bb' },
    { name: 'Fibonacci', value: 'fib' },
    { name: 'Support/Resistance', value: 'sr' },
    { name: 'Trendline', value: 'trendline' },
  ];

  const addIndicator = () => {
    if (selectedIndicator) {
      onAddIndicator(selectedIndicator);
      alert(`✅ Added ${selectedIndicator} indicator`);
    }
  };

  return (
    <div className="indicators-panel">
      <h4>📈 Indicators</h4>
      <div className="indicator-grid">
        {indicators.map(ind => (
          <button 
            key={ind.value}
            className={`indicator-btn ${selectedIndicator === ind.value ? 'active' : ''}`}
            onClick={() => setSelectedIndicator(ind.value)}
          >
            {ind.name}
          </button>
        ))}
      </div>
      {selectedIndicator && (
        <button className="add-indicator-btn" onClick={addIndicator}>
          Add {selectedIndicator.toUpperCase()}
        </button>
      )}
    </div>
  );
};

export default IndicatorsPanel;