/* eslint-disable no-case-declarations */
/* eslint-disable @typescript-eslint/no-explicit-any */
import * as React from 'react';
import StringParameter from './parameters/StringParameter';
import NumberParameter from './parameters/NumberParameter';
import EnumParameter from './parameters/EnumParameter';
import BooleanParameter from './parameters/BooleanParameter';
import FileParameter from './parameters/FileParameter';
import { AI_IMAGE_TOOLS } from '../../server/lib/magic-hour';

interface ParameterConfig {
  type: string;
  required?: boolean;
  min?: number;
  max?: number;
  default?: any;
  values?: string[];
  label?: string;
  placeholder?: string;
  description?: string;
  display?: boolean;
}

interface ParameterRendererProps {
  parameterKey: string;
  config: ParameterConfig;
  value: any;
  onChange: (value: any) => void;
  disabled?: boolean;
  toolId?: string;
  generatedImage?: string | null;
  lastGeneratedImage?: string | null;
}

const ParameterRenderer: React.FC<ParameterRendererProps> = ({
  parameterKey,
  config,
  value,
  onChange,
  disabled = false,
  toolId,
  generatedImage,
  lastGeneratedImage,
}) => {
  // Hide parameters that have display: false
  if (config.display === false) {
    return null;
  }
  // Use configured label or generate fallback from parameter key
  const generateLabel = (key: string) => {
    return key
      .split(/[_-]/)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const label = config.label || generateLabel(parameterKey);
  const placeholder = config.placeholder || `Enter ${label.toLowerCase()}...`;

  switch (config.type) {
    case 'image_url':
    case 'image_b64':
      // Explicit file parameter type
      return (
        <FileParameter
          label={label}
          value={value || ''}
          onChange={onChange}
          required={config.required}
          disabled={disabled}
          accept="image/*"
          placeholder={placeholder}
          generatedImage={generatedImage}
          lastGeneratedImage={lastGeneratedImage}
        />
      );

    case 'string':
      // Check if it should be multiline (prompts, topics, etc.)
      const isMultiline =
        parameterKey.includes('prompt') || parameterKey.includes('topic');

      return (
        <StringParameter
          label={label}
          value={value || ''}
          onChange={onChange}
          required={config.required}
          disabled={disabled}
          multiline={isMultiline}
          placeholder={placeholder}
          toolId={toolId}
        />
      );

    case 'number':
      return (
        <NumberParameter
          label={label}
          value={value ?? config.default ?? 0}
          onChange={onChange}
          min={config.min}
          max={config.max}
          required={config.required}
          disabled={disabled}
        />
      );

    case 'enum':
      // Special handling for AI image tools
      if (parameterKey === 'tool' && config.values?.includes('general')) {
        return (
          <EnumParameter
            label={label}
            value={value || config.default || ''}
            onChange={onChange}
            options={AI_IMAGE_TOOLS}
            required={config.required}
            disabled={disabled}
            placeholder={placeholder}
          />
        );
      }

      return (
        <EnumParameter
          label={label}
          value={value || config.default || ''}
          onChange={onChange}
          options={config.values || []}
          required={config.required}
          disabled={disabled}
          placeholder={placeholder}
        />
      );

    case 'boolean':
      return (
        <BooleanParameter
          label={label}
          value={value ?? config.default ?? false}
          onChange={onChange}
          disabled={disabled}
          description={config.description}
        />
      );

    case 'array':
      // For now, render as a text area with JSON-like input
      // This could be extended to a more sophisticated array editor
      return (
        <StringParameter
          label={`${label} (JSON Array)`}
          value={Array.isArray(value) ? JSON.stringify(value) : value || ''}
          onChange={(val) => {
            try {
              const parsed = JSON.parse(val);
              if (Array.isArray(parsed)) {
                onChange(parsed);
              } else {
                onChange(val);
              }
            } catch {
              onChange(val);
            }
          }}
          required={config.required}
          disabled={disabled}
          multiline={true}
          placeholder={placeholder}
        />
      );

    default:
      // Fallback to string input
      return (
        <StringParameter
          label={label}
          value={value || ''}
          onChange={onChange}
          required={config.required}
          disabled={disabled}
          placeholder={placeholder}
        />
      );
  }
};

export default ParameterRenderer;
