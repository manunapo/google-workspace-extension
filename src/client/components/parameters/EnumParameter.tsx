import * as React from 'react';
import { ChevronDown } from 'lucide-react';

interface EnumParameterProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[] | Record<string, string>;
  required?: boolean;
  disabled?: boolean;
  placeholder?: string;
}

const EnumParameter: React.FC<EnumParameterProps> = ({
  label,
  value,
  onChange,
  options,
  required = false,
  disabled = false,
  placeholder = 'Select an option',
}) => {
  const selectId = React.useId();

  // Convert options to array of {value, label} objects
  const optionsList = React.useMemo(() => {
    if (Array.isArray(options)) {
      return options.map((option) => ({ value: option, label: option }));
    }
    // eslint-disable-next-line no-shadow
    return Object.entries(options).map(([value, label]) => ({ value, label }));
  }, [options]);

  return (
    <div className="space-y-2">
      <label
        htmlFor={selectId}
        className="block text-sm font-medium text-gray-700"
      >
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <div className="relative">
        <select
          id={selectId}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          required={required}
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500 appearance-none bg-white pr-8"
        >
          {!required && <option value="">{placeholder}</option>}
          {optionsList.map(({ value: optionValue, label: optionLabel }) => (
            <option key={optionValue} value={optionValue}>
              {optionLabel}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-2 top-2.5 h-4 w-4 text-gray-400 pointer-events-none" />
      </div>
    </div>
  );
};

export default EnumParameter;
