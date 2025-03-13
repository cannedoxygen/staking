import React from 'react';
import { STAKING_DURATION, DURATION_LABELS, STAKING_APY } from '../../utils/constants';

interface DurationSelectorProps {
  selectedDuration: number;
  onChange: (duration: number) => void;
  className?: string;
}

const DurationSelector: React.FC<DurationSelectorProps> = ({
  selectedDuration,
  onChange,
  className = '',
}) => {
  // Available durations from our constants
  const durations = [
    STAKING_DURATION.ONE_MONTH,
    STAKING_DURATION.THREE_MONTHS,
    STAKING_DURATION.SIX_MONTHS,
    STAKING_DURATION.ONE_YEAR,
  ];

  return (
    <div className={`space-y-2 ${className}`}>
      <label className="block text-sm font-medium text-gray-700">
        Lock Duration
      </label>
      
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {durations.map((duration) => (
          <button
            key={duration}
            type="button"
            onClick={() => onChange(duration)}
            className={`
              py-3 px-2 rounded-lg border text-center transition-colors
              ${
                selectedDuration === duration
                  ? 'bg-blue-600 border-blue-600 text-white'
                  : 'bg-white border-gray-200 text-gray-700 hover:border-blue-400'
              }
            `}
          >
            <div className="text-sm font-medium">
              {DURATION_LABELS[duration]}
            </div>
            <div className={`text-xs mt-1 ${
              selectedDuration === duration
                ? 'text-blue-100'
                : 'text-green-600'
            }`}>
              {STAKING_APY[duration]}% APY
            </div>
          </button>
        ))}
      </div>
      
      <p className="text-xs text-gray-500 mt-1">
        Longer staking periods earn higher APY rewards. Once locked, tokens cannot be withdrawn until the lock period ends.
      </p>
    </div>
  );
};

export default DurationSelector;