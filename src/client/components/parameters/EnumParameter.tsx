import * as React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';

/**
 * Transforms kebab-case and snake_case values into display names
 * Example: "ai-manga-style" -> "AI Manga Style"
 * Example: "upper_body" -> "Upper Body"
 */
const createDisplayName = (value: string): string => {
  return value
    .split(/[-_]/) // Split by both hyphens and underscores
    .map((word) => {
      // Special case for 'ai' -> 'AI'
      if (word.toLowerCase() === 'ai') {
        return 'AI';
      }
      // Capitalize first letter of each word
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(' ');
};

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
      return options.map((option) => ({
        value: option,
        label: createDisplayName(option),
      }));
    }
    // eslint-disable-next-line no-shadow
    return Object.entries(options).map(([value, label]) => ({ value, label }));
  }, [options]);

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
        <label
          htmlFor={selectId}
          className="block text-sm font-medium text-gray-700"
        >
          {label}
          {required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      </div>
      <Select
        value={value}
        onValueChange={onChange}
        disabled={disabled}
        required={required}
      >
        <SelectTrigger id={selectId}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {optionsList.map(({ value: optionValue, label: optionLabel }) => (
            <SelectItem key={optionValue} value={optionValue}>
              {optionLabel}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default EnumParameter;
