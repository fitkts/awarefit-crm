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
  const baseClasses = 'bg-white rounded-xl overflow-hidden';

  const variantClasses = {
    default: 'border border-gray-200',
    bordered: 'border-2 border-gray-300',
    elevated: 'shadow-lg border border-gray-100',
    gradient: 'bg-gradient-to-br from-white to-gray-50 border border-gray-200',
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
              <div className={`p-2 rounded-lg bg-gray-100`}>
                <Icon className={`w-5 h-5 ${iconColor}`} />
              </div>
            )}
            <div>
              {title && <h3 className="text-lg font-semibold text-gray-900">{title}</h3>}
              {subtitle && <p className="text-sm text-gray-600">{subtitle}</p>}
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
        <div className={`border-t border-gray-200 ${padding ? 'p-6 pt-4' : 'p-4'}`}>{footer}</div>
      )}
    </div>
  );
};

export default Card;
