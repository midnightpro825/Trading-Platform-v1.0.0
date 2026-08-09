// frontend/src/components/UI/Toggle.jsx
import React from 'react';

const Toggle = ({ value, onChange, options = ['Buy', 'Sell'] }) => {
  return (
    <div className="toggle-group">
      {options.map(option => (
        <button
          key={option}
          className={`toggle-btn ${value === option.toLowerCase() ? 'active' : ''}`}
          onClick={() => onChange(option.toLowerCase())}
        >
          {option}
        </button>
      ))}
    </div>
  );
};

export default Toggle;