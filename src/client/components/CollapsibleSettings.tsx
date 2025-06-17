import * as React from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from './ui/button';

interface CollapsibleSettingsProps {
  transparentBackground: boolean;
  temperature: number;
  onTransparentBackgroundChange: (transparent: boolean) => void;
  onTemperatureChange: (temperature: number) => void;
  disabled?: boolean;
  className?: string;
}

const CollapsibleSettings: React.FC<CollapsibleSettingsProps> = ({
  transparentBackground,
  temperature,
  onTransparentBackgroundChange,
  onTemperatureChange,
  disabled = false,
  className,
}) => {
  const [isExpanded, setIsExpanded] = React.useState(false);

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className={className}>
      <Button
        variant="outline"
        onClick={toggleExpanded}
        className="w-full justify-between text-sm"
        disabled={disabled}
      >
        <div className="flex items-center">Advanced Settings (Optional)</div>
        {isExpanded ? (
          <ChevronUp className="w-4 h-4" />
        ) : (
          <ChevronDown className="w-4 h-4" />
        )}
      </Button>

      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          isExpanded ? 'max-h-96 opacity-100 mt-3' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="transparent-bg"
                checked={transparentBackground}
                onChange={(e) =>
                  onTransparentBackgroundChange(e.target.checked)
                }
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                disabled={disabled}
              />
              <label
                htmlFor="transparent-bg"
                className="text-sm font-medium text-gray-700"
              >
                Transparent Background
              </label>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">
                Creativity ({temperature.toFixed(1)})
              </label>
              <input
                type="range"
                min="0.1"
                max="1.0"
                step="0.1"
                value={temperature}
                onChange={(e) =>
                  onTemperatureChange(parseFloat(e.target.value))
                }
                className="w-full"
                disabled={disabled}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CollapsibleSettings;
