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
  step = 1,
  required = false,
  disabled = false,
}) => {
  const inputId = React.useId();

  return (
    <div className="space-y-2">
      <label
        htmlFor={inputId}
        className="block text-sm font-medium text-gray-700"
      >
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
        {min !== undefined && max !== undefined && (
          <span className="text-xs text-gray-500 ml-2">
            ({min}-{max})
          </span>
        )}
      </label>
      <div className="flex items-center space-x-2">
        <input
          id={inputId}
          type="number"
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          min={min}
          max={max}
          step={step}
          disabled={disabled}
          required={required}
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
        />
        {min !== undefined && max !== undefined && (
          <input
            type="range"
            value={value}
            onChange={(e) => onChange(Number(e.target.value))}
            min={min}
            max={max}
            step={step}
            disabled={disabled}
            className="flex-1 accent-blue-500"
          />
        )}
      </div>
    </div>
  );
};

export default NumberParameter;
