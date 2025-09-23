import * as React from 'react';

interface NumberParameterProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  required?: boolean;
  disabled?: boolean;
}

const NumberParameter: React.FC<NumberParameterProps> = ({
  label,
  value,
  onChange,
  min,
  max,
  step = 0.1,
  required = false,
  disabled = false,
}) => {
  return (
    <div className="bg-white">
      <label className="block text-xs font-medium text-gray-700 mb-1">
        {label}: {Math.round(value * 50)}%
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer slider-thin-thumb"
        disabled={disabled}
      />
      <div className="flex justify-between text-xs text-gray-400 mt-1">
        <span>Conservative</span>
        <span>Creative</span>
      </div>
    </div>
  );
};

export default NumberParameter;
