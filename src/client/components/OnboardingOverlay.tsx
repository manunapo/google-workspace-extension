import * as React from 'react';
import { X, Sparkles } from 'lucide-react';
import { OnboardingStep } from '../hooks/useOnboarding';

interface OnboardingOverlayProps {
  step: OnboardingStep;
  targetElement: HTMLElement | null;
  onSkip: () => void;
}

interface StepConfig {
  title: string;
  description: string;
  position: 'top' | 'bottom' | 'left' | 'right';
  offset: { x: number; y: number };
}

const STEP_CONFIG: Record<OnboardingStep, StepConfig | null> = {
  'select-tool': {
    title: 'Select AI Image Editor',
    description: 'Click here to start editing images with AI',
    position: 'right',
    offset: { x: 16, y: -108 },
  },
  'select-quickstart': {
    title: 'Try Add Text Badge',
    description: 'Click this preset to add a text badge to an image',
    position: 'right',
    offset: { x: 16, y: -90 },
  },
  'generate-image': {
    title: 'Edit Your Image',
    description: 'Click to edit your first image with AI',
    position: 'top',
    offset: { x: 0, y: -16 },
  },
  'insert-download': {
    title: 'Use Your Image',
    description: 'Insert to document or download',
    position: 'top',
    offset: { x: 0, y: -16 },
  },
  complete: null,
};

const OnboardingOverlay: React.FC<OnboardingOverlayProps> = ({
  step,
  targetElement,
  onSkip,
}) => {
  const [popoverStyle, setPopoverStyle] = React.useState<React.CSSProperties>(
    {}
  );
  const [highlightStyle, setHighlightStyle] =
    React.useState<React.CSSProperties>({});
  const popoverRef = React.useRef<HTMLDivElement>(null);

  const config = STEP_CONFIG[step];

  React.useEffect(() => {
    if (!targetElement || !config) {
      return undefined;
    }

    // Auto-scroll to center the target element in the viewport
    targetElement.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
      inline: 'center',
    });

    // Small delay to allow scroll to complete before positioning
    const scrollTimeout = setTimeout(() => {
      updatePosition();
    }, 300);

    const updatePosition = () => {
      const rect = targetElement.getBoundingClientRect();
      const popoverRect = popoverRef.current?.getBoundingClientRect();

      // Highlight positioning (around the target element)
      const highlightPadding = 8;
      setHighlightStyle({
        position: 'fixed',
        top: `${rect.top - highlightPadding}px`,
        left: `${rect.left - highlightPadding}px`,
        width: `${rect.width + highlightPadding * 2}px`,
        height: `${rect.height + highlightPadding * 2}px`,
        pointerEvents: 'none',
        zIndex: 60,
      });

      // Popover positioning
      let top = 0;
      let left = 0;

      if (popoverRect) {
        switch (config.position) {
          case 'right':
            left = rect.right + config.offset.x;
            top =
              rect.top +
              rect.height / 2 -
              popoverRect.height / 2 +
              config.offset.y;
            break;
          case 'left':
            left = rect.left - popoverRect.width + config.offset.x;
            top =
              rect.top +
              rect.height / 2 -
              popoverRect.height / 2 +
              config.offset.y;
            break;
          case 'top':
            left =
              rect.left +
              rect.width / 2 -
              popoverRect.width / 2 +
              config.offset.x;
            top = rect.top - popoverRect.height + config.offset.y;
            break;
          case 'bottom':
            left =
              rect.left +
              rect.width / 2 -
              popoverRect.width / 2 +
              config.offset.x;
            top = rect.bottom + config.offset.y;
            break;
          default:
            left = rect.left + config.offset.x;
            top = rect.top + config.offset.y;
            break;
        }

        // Keep popover within viewport
        const padding = 8;
        if (left < padding) left = padding;
        if (left + popoverRect.width > window.innerWidth - padding) {
          left = window.innerWidth - popoverRect.width - padding;
        }
        if (top < padding) top = padding;
        if (top + popoverRect.height > window.innerHeight - padding) {
          top = window.innerHeight - popoverRect.height - padding;
        }
      }

      setPopoverStyle({
        position: 'fixed',
        top: `${top}px`,
        left: `${left}px`,
        zIndex: 61,
      });
    };

    updatePosition();
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);

    return () => {
      clearTimeout(scrollTimeout);
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
    };
  }, [targetElement, config]);

  if (!config || !targetElement) return null;

  return (
    <>
      {/* Full-screen blocking overlay */}
      <div
        className="fixed inset-0 z-[100]"
        style={{ pointerEvents: 'auto' }}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
      />

      {/* Spotlight cutout - creates visual highlight */}
      <div
        style={{
          position: 'fixed',
          top: highlightStyle.top,
          left: highlightStyle.left,
          width: highlightStyle.width,
          height: highlightStyle.height,
          zIndex: 101,
          pointerEvents: 'none',
          boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.6)',
          borderRadius: '8px',
        }}
      />

      {/* Highlight ring around target */}
      <div
        style={{
          ...highlightStyle,
          zIndex: 102,
        }}
        className="border-2 border-blue-500 rounded-lg shadow-lg animate-pulse"
      />

      {/* Instruction popover */}
      <div
        ref={popoverRef}
        style={{
          ...popoverStyle,
          zIndex: 103,
        }}
        className="bg-white rounded-lg shadow-xl border border-gray-200 max-w-[200px] animate-in fade-in duration-200"
      >
        <div className="p-3">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
              <h3 className="text-xs font-semibold text-gray-900 leading-tight">
                {config.title}
              </h3>
            </div>
            <button
              onClick={onSkip}
              className="text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0"
              aria-label="Skip onboarding"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <p className="text-[11px] text-gray-600 leading-snug">
            {config.description}
          </p>
          <div className="border-t border-gray-100">
            <button
              onClick={onSkip}
              className="text-[10px] text-blue-600 hover:text-blue-700 font-medium"
            >
              Skip tutorial
            </button>
          </div>
        </div>
      </div>

      {/* Clickable area over target element */}
      <div
        style={{
          position: 'fixed',
          top: highlightStyle.top,
          left: highlightStyle.left,
          width: highlightStyle.width,
          height: highlightStyle.height,
          zIndex: 104,
          pointerEvents: 'auto',
          backgroundColor: 'transparent',
          cursor: 'pointer',
        }}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          targetElement.click();
        }}
      />
    </>
  );
};

export default OnboardingOverlay;
