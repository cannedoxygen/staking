import React from 'react';

interface LoaderProps {
  // Size of the loader
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  // Color of the loader
  color?: 'primary' | 'secondary' | 'white' | 'gray';
  // Optional additional CSS classes
  className?: string;
  // Optional text to display beneath the loader
  text?: string;
}

const Loader: React.FC<LoaderProps> = ({
  size = 'md',
  color = 'primary',
  className = '',
  text,
}) => {
  // Define size classes for the spinner
  const sizeClasses = {
    xs: 'h-3 w-3',
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
    xl: 'h-12 w-12',
  };
  
  // Define color classes for the spinner
  const colorClasses = {
    primary: 'text-blue-600',
    secondary: 'text-gray-600',
    white: 'text-white',
    gray: 'text-gray-400',
  };
  
  // Define size classes for the container
  const containerSizeClasses = {
    xs: 'h-3',
    sm: 'h-4',
    md: 'h-6',
    lg: 'h-8',
    xl: 'h-12',
  };
  
  // Define text size classes based on the loader size
  const textSizeClasses = {
    xs: 'text-xs',
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-sm',
    xl: 'text-base',
  };

  return (
    <div className={`inline-flex flex-col items-center justify-center ${className}`}>
      <div className={`${containerSizeClasses[size]} flex items-center justify-center`}>
        <svg 
          className={`animate-spin ${sizeClasses[size]} ${colorClasses[color]}`} 
          xmlns="http://www.w3.org/2000/svg" 
          fill="none" 
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <circle 
            className="opacity-25" 
            cx="12" 
            cy="12" 
            r="10" 
            stroke="currentColor" 
            strokeWidth="4"
          ></circle>
          <path 
            className="opacity-75" 
            fill="currentColor" 
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
      </div>
      
      {text && (
        <span className={`mt-2 ${textSizeClasses[size]} ${colorClasses[color]}`}>
          {text}
        </span>
      )}
    </div>
  );
};

export default Loader;