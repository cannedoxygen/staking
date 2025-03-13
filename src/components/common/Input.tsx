import React, { InputHTMLAttributes } from 'react';

// Extend the HTML input attributes
interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  // Optional label text
  label?: string;
  // Optional error message
  error?: string;
  // Optional helper text
  helperText?: string;
  // Optional prefix inside the input (e.g., currency symbol)
  prefix?: React.ReactNode;
  // Optional suffix inside the input (e.g., unit)
  suffix?: React.ReactNode;
  // Optional full width setting
  fullWidth?: boolean;
  // Optional container className
  containerClassName?: string;
  // Optional size
  size?: 'sm' | 'md' | 'lg';
  // Optional state
  state?: 'default' | 'error' | 'success';
  // Optional icon
  icon?: React.ReactNode;
}

const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  prefix,
  suffix,
  fullWidth = false,
  containerClassName = '',
  className = '',
  size = 'md',
  state = 'default',
  icon,
  disabled,
  id,
  name,
  ...rest
}) => {
  // Generate a unique id if not provided
  const inputId = id || `input-${name || Math.random().toString(36).substr(2, 9)}`;
  
  // Size classes
  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-2 text-sm',
    lg: 'px-4 py-3 text-base'
  };
  
  // State classes
  const stateClasses = {
    default: 'border-gray-300 focus:border-blue-500 focus:ring-blue-500',
    error: 'border-red-500 focus:border-red-500 focus:ring-red-500',
    success: 'border-green-500 focus:border-green-500 focus:ring-green-500'
  };
  
  // Handle error state override
  const currentState = error ? 'error' : state;
  
  // Base input classes
  const inputClasses = `
    block w-full rounded-md 
    focus:outline-none focus:ring-2 focus:ring-opacity-50
    ${disabled ? 'bg-gray-100 cursor-not-allowed opacity-60' : 'bg-white'}
    ${sizeClasses[size]}
    ${stateClasses[currentState]}
    ${prefix ? 'pl-8' : ''}
    ${suffix ? 'pr-8' : ''}
    ${icon ? 'pl-10' : ''}
    ${className}
  `;
  
  return (
    <div className={`${fullWidth ? 'w-full' : ''} ${containerClassName}`}>
      {/* Label if provided */}
      {label && (
        <label 
          htmlFor={inputId} 
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          {label}
        </label>
      )}
      
      {/* Input container with relative positioning for prefix/suffix */}
      <div className="relative">
        {/* Prefix if provided */}
        {prefix && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="text-gray-500 sm:text-sm">{prefix}</span>
          </div>
        )}
        
        {/* Icon if provided */}
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            {icon}
          </div>
        )}
        
        {/* The actual input element */}
        <input 
          id={inputId}
          name={name}
          disabled={disabled}
          className={inputClasses}
          {...rest}
        />
        
        {/* Suffix if provided */}
        {suffix && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <span className="text-gray-500 sm:text-sm">{suffix}</span>
          </div>
        )}
      </div>
      
      {/* Error message or helper text */}
      {(error || helperText) && (
        <p className={`mt-1 text-xs ${error ? 'text-red-600' : 'text-gray-500'}`}>
          {error || helperText}
        </p>
      )}
    </div>
  );
};

export default Input;