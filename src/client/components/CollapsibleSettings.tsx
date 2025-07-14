import * as React from 'react';

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
  return (
    <div className={className}>
      <div className="mb-3">
        <h3 className="text-sm font-medium text-gray-800 mb-3">
          Advanced Settings (Optional)
        </h3>
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
