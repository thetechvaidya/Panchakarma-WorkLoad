import React, { forwardRef } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: string;
  rightIcon?: string;
  onRightIconClick?: () => void;
  variant?: 'default' | 'filled' | 'outlined';
  inputSize?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  required?: boolean;
}

const Input = forwardRef<HTMLInputElement, InputProps>((
  {
    label,
    error,
    helperText,
    leftIcon,
    rightIcon,
    onRightIconClick,
    variant = 'default',
    inputSize = 'md',
    fullWidth = false,
    required = false,
    className = '',
    id,
    ...props
  },
  ref
) => {
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
  const hasError = !!error;

  const baseInputClasses = 'block transition-colors duration-200 focus:outline-none';
  
  const variantClasses = {
    default: `border rounded-lg bg-white ${hasError 
      ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-200' 
      : 'border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200'
    }`,
    filled: `border-0 rounded-lg ${hasError 
      ? 'bg-red-50 focus:bg-red-100' 
      : 'bg-gray-100 focus:bg-gray-200'
    }`,
    outlined: `border-2 rounded-lg bg-transparent ${hasError 
      ? 'border-red-500 focus:border-red-600' 
      : 'border-gray-300 focus:border-blue-500'
    }`
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-5 py-3 text-lg'
  };

  const iconSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  };

  const inputClasses = `
    ${baseInputClasses}
    ${variantClasses[variant]}
    ${sizeClasses[inputSize]}
    ${leftIcon ? 'pl-10' : ''}
    ${rightIcon ? 'pr-10' : ''}
    ${fullWidth ? 'w-full' : ''}
    ${props.disabled ? 'opacity-50 cursor-not-allowed' : ''}
    ${className}
  `.trim().replace(/\s+/g, ' ');

  return (
    <div className={`${fullWidth ? 'w-full' : ''}`}>
      {label && (
        <label 
          htmlFor={inputId}
          className={`block text-sm font-medium mb-2 ${
            hasError ? 'text-red-700' : 'text-gray-700'
          }`}
        >
          {label}
          {required && (
            <span className="text-red-500 ml-1" aria-label="required">
              *
            </span>
          )}
        </label>
      )}
      
      <div className="relative">
        {leftIcon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <i 
              className={`fas fa-${leftIcon} ${iconSizeClasses[inputSize]} ${
                hasError ? 'text-red-500' : 'text-gray-400'
              }`}
              aria-hidden="true"
            />
          </div>
        )}
        
        <input
          ref={ref}
          id={inputId}
          className={inputClasses}
          aria-invalid={hasError}
          aria-describedby={
            error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined
          }
          {...props}
        />
        
        {rightIcon && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            <i 
              className={`fas fa-${rightIcon} ${iconSizeClasses[inputSize]} ${
                hasError ? 'text-red-500' : 'text-gray-400'
              } ${
                onRightIconClick ? 'cursor-pointer hover:text-gray-600' : ''
              }`}
              onClick={onRightIconClick}
              aria-hidden="true"
            />
          </div>
        )}
      </div>
      
      {error && (
        <p 
          id={`${inputId}-error`}
          className="mt-1 text-sm text-red-600 flex items-center"
          role="alert"
        >
          <i className="fas fa-exclamation-circle mr-1" aria-hidden="true" />
          {error}
        </p>
      )}
      
      {helperText && !error && (
        <p 
          id={`${inputId}-helper`}
          className="mt-1 text-sm text-gray-500"
        >
          {helperText}
        </p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;