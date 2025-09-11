import React from 'react';
import LoadingSpinner from './LoadingSpinner';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'ghost' | 'outline';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  loading?: boolean;
  loadingText?: string;
  icon?: string;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  loadingText,
  icon,
  iconPosition = 'left',
  fullWidth = false,
  disabled,
  className = '',
  children,
  ...props
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

  const variantClasses = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 shadow-md hover:shadow-lg',
    secondary: 'bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500 shadow-md hover:shadow-lg',
    success: 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500 shadow-md hover:shadow-lg',
    warning: 'bg-yellow-600 text-white hover:bg-yellow-700 focus:ring-yellow-500 shadow-md hover:shadow-lg',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 shadow-md hover:shadow-lg',
    ghost: 'bg-transparent text-gray-700 hover:bg-gray-100 focus:ring-gray-500',
    outline: 'bg-transparent border-2 border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-gray-500'
  };

  const sizeClasses = {
    xs: 'px-2 py-1 text-xs',
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
    xl: 'px-8 py-4 text-lg'
  };

  const iconSizeClasses = {
    xs: 'text-xs',
    sm: 'text-sm',
    md: 'text-sm',
    lg: 'text-base',
    xl: 'text-lg'
  };

  const classes = `
    ${baseClasses}
    ${variantClasses[variant]}
    ${sizeClasses[size]}
    ${fullWidth ? 'w-full' : ''}
    ${loading ? 'cursor-wait' : ''}
    ${className}
  `.trim().replace(/\s+/g, ' ');

  const renderIcon = (position: 'left' | 'right') => {
    if (!icon || iconPosition !== position) return null;
    
    return (
      <i 
        className={`fas fa-${icon} ${iconSizeClasses[size]} ${
          position === 'left' ? 'mr-2' : 'ml-2'
        }`}
        aria-hidden="true"
      />
    );
  };

  const renderContent = () => {
    if (loading) {
      return (
        <>
          <LoadingSpinner 
            size={size === 'xs' || size === 'sm' ? 'sm' : 'md'} 
            color="secondary"
            className="mr-2"
          />
          {loadingText || 'Loading...'}
        </>
      );
    }

    return (
      <>
        {renderIcon('left')}
        {children}
        {renderIcon('right')}
      </>
    );
  };

  return (
    <button
      className={classes}
      disabled={disabled || loading}
      aria-busy={loading}
      {...props}
    >
      {renderContent()}
    </button>
  );
};

export default Button;