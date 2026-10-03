import React from 'react';

export interface QuantityStepperProps {
  value: number;
  min?: number;
  max?: number;
  onChange: (value: number) => void;
  className?: string;
  ariaLabel?: string;
}

export const QuantityStepper: React.FC<QuantityStepperProps> = ({
  value,
  min = 1,
  max = 10,
  onChange,
  className = '',
  ariaLabel = 'Quantity',
}) => {
  const handleMinus = () => {
    if (value > min) {
      onChange(value - 1);
    }
  };

  const handlePlus = () => {
    if (value < max) {
      onChange(value + 1);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let parsed = parseInt(e.target.value, 10);
    if (isNaN(parsed) || parsed < min) parsed = min;
    if (parsed > max) parsed = max;
    onChange(parsed);
  };

  return (
    <div className={`qty-controls ${className}`.trim()}>
      <button
        type="button"
        className="qty-btn qty-minus"
        onClick={handleMinus}
        aria-label="Decrease quantity"
        disabled={value <= min}
      >
        −
      </button>
      <input
        type="number"
        className="qty-input"
        value={value}
        min={min}
        max={max}
        onChange={handleInputChange}
        aria-label={ariaLabel}
      />
      <button
        type="button"
        className="qty-btn qty-plus"
        onClick={handlePlus}
        aria-label="Increase quantity"
        disabled={value >= max}
      >
        +
      </button>
    </div>
  );
};
