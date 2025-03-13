import React, { ButtonHTMLAttributes } from 'react';

// Define button variants
export type ButtonVariant = 'primary' | 'secondary' | 'success' | 'danger' | 'outline';

// Define button sizes
export type ButtonSize = 'sm' | 'md' | 'lg';

// Define button props extending HTML button attributes
interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  fullWidth?: boolean;
  className?: string;
  children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  fullWidth = false,
  className = '',
  children,
  disabled,
  ...rest
}) => {
  // Base classes that all buttons share
  const baseClasses = 'font-medium rounded-md inline-flex items-center justify-center transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2';
  
  // Size-specific classes
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };
  
  // Variant-specific classes
  const variantClasses = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500 border border-transparent',
    secondary: 'bg-gray-100 hover:bg-gray-200 text-gray-800 focus:ring-gray-500 border border-gray-200',
    success: 'bg-green-600 hover:bg-green-700 text-white focus:ring-green-500 border border-transparent',
    danger: 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500 border border-transparent',
    outline: 'bg-white hover:bg-gray-50 text-gray-700 focus:ring-blue-500 border border-gray-300',
  };
  
  // Disabled state
  const disabledClasses = 'opacity-50 cursor-not-allowed pointer-events-none';
  
  // Loading state
  const loadingClasses = 'relative';
  
  // Full width
  const widthClasses = fullWidth ? 'w-full' : '';
  
  // Combine all the classes
  const buttonClasses = `
    ${baseClasses}
    ${sizeClasses[size]}
    ${variantClasses[variant]}
    ${disabled || isLoading ? disabledClasses : ''}
    ${isLoading ? loadingClasses : ''}
    ${widthClasses}
    ${className}
  `;
  
  return (
    <button
      className={buttonClasses}
      disabled={disabled || isLoading}
      {...rest}
    >
      {isLoading && (
        <span className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <svg className="animate-spin h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </span>
      )}
      <span className={isLoading ? 'invisible' : ''}>
        {children}
      </span>
    </button>
  );
};

export default Button;