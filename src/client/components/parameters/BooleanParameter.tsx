import * as React from 'react';

interface BooleanParameterProps {
  label: string;
  value: boolean;
  onChange: (value: boolean) => void;
  disabled?: boolean;
  description?: string;
}

const BooleanParameter: React.FC<BooleanParameterProps> = ({
  label,
  value,
  onChange,
  disabled = false,
  description,
}) => {
  const inputId = React.useId();

  return (
    <div className="flex items-start space-x-3">
      <div className="flex items-center h-6">
        <input
          id={inputId}
          type="checkbox"
          checked={value}
          onChange={(e) => onChange(e.target.checked)}
          disabled={disabled}
          className="cursor-pointer h-3.5 w-3.5 text-blue-600 border-gray-300 rounded disabled:opacity-50"
        />
      </div>
      <div className="flex-1">
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-gray-700 cursor-pointer"
        >
          {label}
        </label>
        {description && (
          <p className="text-xs text-gray-500 mt-1">{description}</p>
        )}
      </div>
    </div>
  );
};

export default BooleanParameter;
