import * as React from 'react';
import { cn } from '../../lib/utils';

interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'success' | 'error' | 'warning';
  onClose?: () => void;
}

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  ({ className, variant = 'default', onClose, children, ...props }, ref) => {
    const variantClasses = {
      default: 'bg-blue-50 border-blue-200 text-blue-800',
      success: 'bg-green-50 border-green-200 text-green-800',
      error: 'bg-red-50 border-red-200 text-red-800',
      warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    };

    return (
      <div
        ref={ref}
        className={cn(
          'relative rounded-md border p-3',
          variantClasses[variant],
          className
        )}
        {...props}
      >
        {children}
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-2 right-2 text-current hover:opacity-70"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
      </div>
    );
  }
);
Alert.displayName = 'Alert';

export default Alert;
