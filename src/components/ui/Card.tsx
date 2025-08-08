import { LucideIcon } from 'lucide-react';
import React from 'react';

export type CardVariant = 'default' | 'bordered' | 'elevated' | 'gradient';

interface CardProps {
  variant?: CardVariant;
  title?: string;
  subtitle?: string;
  icon?: LucideIcon;
  iconColor?: string;
  headerActions?: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
  children?: React.ReactNode;
  padding?: boolean;
  hoverable?: boolean;
  onClick?: () => void;
}

const Card: React.FC<CardProps> = ({
  variant = 'default',
  title,
  subtitle,
  icon: Icon,
  iconColor = 'text-blue-600',
  headerActions,
  footer,
  className = '',
  children,
  padding = true,
  hoverable = false,
  onClick,
}) => {
  const baseClasses = 'bg-white dark:bg-dark-800 rounded-xl overflow-hidden';

  const variantClasses = {
    default: 'border border-gray-200 dark:border-dark-600',
    bordered: 'border-2 border-gray-300 dark:border-dark-500',
    elevated: 'shadow-lg border border-gray-100 dark:border-dark-700 dark:shadow-dark-900/20',
    gradient:
      'bg-gradient-to-br from-white to-gray-50 dark:from-dark-800 dark:to-dark-700 border border-gray-200 dark:border-dark-600',
  };

  const combinedClasses = [
    baseClasses,
    variantClasses[variant],
    hoverable ? 'hover:shadow-md transition-shadow duration-200' : '',
    onClick ? 'cursor-pointer' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const hasHeader = title || subtitle || Icon || headerActions;

  return (
    <div className={combinedClasses} onClick={onClick}>
      {hasHeader && (
        <div className={`flex items-center justify-between ${padding ? 'p-6 pb-0' : 'p-4 pb-0'}`}>
          <div className="flex items-center space-x-3">
            {Icon && (
              <div className={`p-2 rounded-lg bg-gray-100 dark:bg-dark-700`}>
                <Icon className={`w-5 h-5 ${iconColor}`} />
              </div>
            )}
            <div>
              {title && (
                <h3 className="text-lg font-semibold text-gray-900 dark:text-dark-100">{title}</h3>
              )}
              {subtitle && <p className="text-sm text-gray-600 dark:text-dark-400">{subtitle}</p>}
            </div>
          </div>
          {headerActions && <div className="flex items-center space-x-2">{headerActions}</div>}
        </div>
      )}

      {children && (
        <div
          className={`${hasHeader ? 'mt-4' : ''} ${padding ? 'px-6' : 'px-4'} ${!footer && padding ? 'pb-6' : !footer ? 'pb-4' : ''}`}
        >
          {children}
        </div>
      )}

      {footer && (
        <div
          className={`border-t border-gray-200 dark:border-dark-600 ${padding ? 'p-6 pt-4' : 'p-4'}`}
        >
          {footer}
        </div>
      )}
    </div>
  );
};

export default Card;
