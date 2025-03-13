import React from 'react';

interface AutoCompoundToggleProps {
  enabled: boolean;
  onChange: (enabled: boolean) => void;
  disabled?: boolean;
  className?: string;
}

const AutoCompoundToggle: React.FC<AutoCompoundToggleProps> = ({
  enabled,
  onChange,
  disabled = false,
  className = '',
}) => {
  const handleToggleChange = () => {
    if (!disabled) {
      onChange(!enabled);
    }
  };

  return (
    <div className={`${className}`}>
      <div className="flex items-center justify-between">
        <div>
          <label htmlFor="auto-compound-toggle" className="text-sm font-medium text-gray-700">
            Auto-Compound Rewards
          </label>
          <p className="text-xs text-gray-500 mt-1">
            Automatically reinvest rewards to maximize your earnings over time
          </p>
        </div>
        
        <button
          type="button"
          id="auto-compound-toggle"
          role="switch"
          aria-checked={enabled}
          onClick={handleToggleChange}
          disabled={disabled}
          className={`
            relative inline-flex h-6 w-11 items-center rounded-full
            transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
            ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            ${enabled ? 'bg-blue-600' : 'bg-gray-200'}
          `}
        >
          <span
            className={`
              inline-block h-4 w-4 transform rounded-full bg-white transition-transform
              ${enabled ? 'translate-x-6' : 'translate-x-1'}
            `}
          />
        </button>
      </div>
      
      {enabled && (
        <div className="mt-3 p-3 bg-blue-50 rounded-md text-xs text-blue-700">
          <p className="font-medium">💰 Auto-compound is enabled!</p>
          <p className="mt-1">
            Your rewards will be automatically reinvested, increasing your stake and earning
            compound interest - similar to how tardigrades continuously grow and adapt.
          </p>
        </div>
      )}
      
      {!enabled && !disabled && (
        <div className="mt-3 p-3 bg-gray-50 rounded-md text-xs text-gray-600">
          <p>
            Auto-compound increases your earnings through the power of compound interest.
            When enabled, your rewards will be automatically added to your stake.
          </p>
        </div>
      )}
    </div>
  );
};

export default AutoCompoundToggle;