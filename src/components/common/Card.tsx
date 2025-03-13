import React, { ReactNode } from 'react';

interface CardProps {
  // Title for the card (optional)
  title?: string;
  // Optional action component to display in the header (e.g., a button)
  action?: ReactNode;
  // Main content of the card
  children: ReactNode;
  // Optional footer content
  footer?: ReactNode;
  // Optional additional CSS classes
  className?: string;
  // Optional padding for the content area
  contentPadding?: 'none' | 'sm' | 'md' | 'lg';
  // Optional border width
  borderWidth?: 'none' | 'sm' | 'md' | 'lg';
  // Optional rounded corners
  rounded?: 'none' | 'sm' | 'md' | 'lg';
  // Optional shadowing
  shadow?: 'none' | 'sm' | 'md' | 'lg';
  // Optional ID for the card element
  id?: string;
}

const Card: React.FC<CardProps> = ({
  title,
  action,
  children,
  footer,
  className = '',
  contentPadding = 'md',
  borderWidth = 'sm',
  rounded = 'md',
  shadow = 'sm',
  id,
}) => {
  // Define the padding classes based on the prop
  const paddingClasses = {
    none: 'p-0',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
  };

  // Define the border width classes
  const borderClasses = {
    none: 'border-0',
    sm: 'border',
    md: 'border-2',
    lg: 'border-4',
  };

  // Define the rounded corners classes
  const roundedClasses = {
    none: 'rounded-none',
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
  };

  // Define the shadow classes
  const shadowClasses = {
    none: 'shadow-none',
    sm: 'shadow-sm',
    md: 'shadow',
    lg: 'shadow-lg',
  };

  return (
    <div 
      id={id}
      className={`
        bg-white 
        ${borderClasses[borderWidth]} border-gray-200 
        ${roundedClasses[rounded]} 
        ${shadowClasses[shadow]} 
        overflow-hidden
        ${className}
      `}
    >
      {/* Card Header (if title or action is provided) */}
      {(title || action) && (
        <div className="px-4 py-3 border-b border-gray-200 flex justify-between items-center">
          {title && <h2 className="text-lg font-medium text-gray-800">{title}</h2>}
          {action && <div>{action}</div>}
        </div>
      )}

      {/* Card Content */}
      <div className={paddingClasses[contentPadding]}>
        {children}
      </div>

      {/* Card Footer (if provided) */}
      {footer && (
        <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
          {footer}
        </div>
      )}
    </div>
  );
};

export default Card;