import React from 'react';

interface CardProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  icon?: string;
  variant?: 'default' | 'elevated' | 'outlined' | 'filled';
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  headerClassName?: string;
  bodyClassName?: string;
  onClick?: () => void;
  hoverable?: boolean;
  loading?: boolean;
}

const Card: React.FC<CardProps> = ({
  children,
  title,
  subtitle,
  icon,
  variant = 'default',
  padding = 'md',
  className = '',
  headerClassName = '',
  bodyClassName = '',
  onClick,
  hoverable = false,
  loading = false
}) => {
  const baseClasses = 'rounded-xl transition-all duration-200';
  
  const variantClasses = {
    default: 'bg-white border border-gray-200 shadow-sm',
    elevated: 'bg-white shadow-lg hover:shadow-xl',
    outlined: 'bg-white border-2 border-gray-300',
    filled: 'bg-gray-50 border border-gray-200'
  };

  const paddingClasses = {
    none: '',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
    xl: 'p-8'
  };

  const headerPaddingClasses = {
    none: '',
    sm: 'px-3 py-2',
    md: 'px-4 py-3',
    lg: 'px-6 py-4',
    xl: 'px-8 py-5'
  };

  const bodyPaddingClasses = {
    none: '',
    sm: 'px-3 pb-3',
    md: 'px-4 pb-4',
    lg: 'px-6 pb-6',
    xl: 'px-8 pb-8'
  };

  const cardClasses = `
    ${baseClasses}
    ${variantClasses[variant]}
    ${!title && !subtitle ? paddingClasses[padding] : ''}
    ${hoverable || onClick ? 'hover:shadow-md cursor-pointer' : ''}
    ${loading ? 'animate-pulse' : ''}
    ${className}
  `.trim().replace(/\s+/g, ' ');

  const hasHeader = title || subtitle || icon;

  const renderHeader = () => {
    if (!hasHeader) return null;

    return (
      <div className={`
        border-b border-gray-200 
        ${headerPaddingClasses[padding]}
        ${headerClassName}
      `.trim().replace(/\s+/g, ' ')}>
        <div className="flex items-center">
          {icon && (
            <div className="flex-shrink-0 mr-3">
              <i 
                className={`fas fa-${icon} text-lg text-gray-600`}
                aria-hidden="true"
              />
            </div>
          )}
          <div className="flex-1 min-w-0">
            {title && (
              <h3 className="text-lg font-semibold text-gray-900 truncate">
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="text-sm text-gray-500 mt-1">
                {subtitle}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderBody = () => {
    if (loading) {
      return (
        <div className={bodyPaddingClasses[padding]}>
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          </div>
        </div>
      );
    }

    return (
      <div className={`
        ${hasHeader ? bodyPaddingClasses[padding] : ''}
        ${bodyClassName}
      `.trim().replace(/\s+/g, ' ')}>
        {children}
      </div>
    );
  };

  return (
    <div 
      className={cardClasses}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      } : undefined}
    >
      {renderHeader()}
      {renderBody()}
    </div>
  );
};

export default Card;