import type { LucideIcon } from 'lucide-react';
import React from 'react';

export type InputSize = 'sm' | 'md' | 'lg';
export type InputVariant = 'default' | 'error' | 'success';

interface BaseInputProps {
  label?: string;
  error?: string;
  success?: string;
  hint?: string;
  required?: boolean;
  size?: InputSize;
  variant?: InputVariant;
  icon?: LucideIcon;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  className?: string;
}

interface InputProps
  extends BaseInputProps,
    Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {}

interface TextareaProps
  extends BaseInputProps,
    Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'size'> {
  rows?: number;
}

interface SelectProps
  extends BaseInputProps,
    Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  options: Array<{ value: string | number; label: string; disabled?: boolean }>;
  placeholder?: string;
}

const Input: React.FC<InputProps> = ({
  label,
  error,
  success,
  hint,
  required = false,
  size = 'md',
  variant = 'default',
  icon: Icon,
  iconPosition = 'left',
  fullWidth = true,
  className = '',
  ...props
}) => {
  const actualVariant = error ? 'error' : success ? 'success' : variant;

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-3 py-2 text-sm',
    lg: 'px-4 py-3 text-base',
  };

  const variantClasses = {
    default:
      'border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:border-dark-600 dark:bg-dark-700 dark:text-dark-100 dark:focus:ring-blue-400 dark:focus:border-blue-400',
    error:
      'border-red-500 focus:ring-red-500 focus:border-red-500 dark:border-red-400 dark:bg-dark-700 dark:text-dark-100 dark:focus:ring-red-400 dark:focus:border-red-400',
    success:
      'border-green-500 focus:ring-green-500 focus:border-green-500 dark:border-green-400 dark:bg-dark-700 dark:text-dark-100 dark:focus:ring-green-400 dark:focus:border-green-400',
  };

  const iconSizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  const inputClasses = [
    'block w-full border rounded-md shadow-sm transition-colors',
    'focus:outline-none focus:ring-1',
    'disabled:bg-gray-50 disabled:text-gray-500 dark:disabled:bg-dark-800 dark:disabled:text-dark-500',
    sizeClasses[size],
    variantClasses[actualVariant],
    Icon && iconPosition === 'left' ? 'pl-10' : '',
    Icon && iconPosition === 'right' ? 'pr-10' : '',
    !fullWidth ? 'w-auto' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={`${fullWidth ? 'w-full' : ''}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-dark-300 mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <div className="relative">
        {Icon && (
          <div
            className={`absolute inset-y-0 ${iconPosition === 'left' ? 'left-0 pl-3' : 'right-0 pr-3'} flex items-center pointer-events-none`}
          >
            <Icon className={`${iconSizeClasses[size]} text-gray-400 dark:text-dark-500`} />
          </div>
        )}
        <input
          className={inputClasses}
          aria-describedby={error ? `${props.id}-error` : hint ? `${props.id}-hint` : undefined}
          {...props}
        />
      </div>

      {hint && !error && !success && (
        <p id={`${props.id}-hint`} className="mt-1 text-xs text-gray-500 dark:text-dark-400">
          {hint}
        </p>
      )}

      {error && (
        <p id={`${props.id}-error`} className="mt-1 text-xs text-red-600">
          {error}
        </p>
      )}

      {success && <p className="mt-1 text-xs text-green-600">{success}</p>}
    </div>
  );
};

const Textarea: React.FC<TextareaProps> = ({
  label,
  error,
  success,
  hint,
  required = false,
  size = 'md',
  variant = 'default',
  fullWidth = true,
  className = '',
  rows = 3,
  ...props
}) => {
  const actualVariant = error ? 'error' : success ? 'success' : variant;

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-3 py-2 text-sm',
    lg: 'px-4 py-3 text-base',
  };

  const variantClasses = {
    default:
      'border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:border-dark-600 dark:bg-dark-700 dark:text-dark-100 dark:focus:ring-blue-400 dark:focus:border-blue-400',
    error:
      'border-red-500 focus:ring-red-500 focus:border-red-500 dark:border-red-400 dark:bg-dark-700 dark:text-dark-100 dark:focus:ring-red-400 dark:focus:border-red-400',
    success:
      'border-green-500 focus:ring-green-500 focus:border-green-500 dark:border-green-400 dark:bg-dark-700 dark:text-dark-100 dark:focus:ring-green-400 dark:focus:border-green-400',
  };

  const textareaClasses = [
    'block w-full border rounded-md shadow-sm transition-colors resize-none',
    'focus:outline-none focus:ring-1',
    'disabled:bg-gray-50 disabled:text-gray-500 dark:disabled:bg-dark-800 dark:disabled:text-dark-500',
    sizeClasses[size],
    variantClasses[actualVariant],
    !fullWidth ? 'w-auto' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={`${fullWidth ? 'w-full' : ''}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-dark-300 mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <textarea
        className={textareaClasses}
        rows={rows}
        aria-describedby={error ? `${props.id}-error` : hint ? `${props.id}-hint` : undefined}
        {...props}
      />

      {hint && !error && !success && (
        <p id={`${props.id}-hint`} className="mt-1 text-xs text-gray-500 dark:text-dark-400">
          {hint}
        </p>
      )}

      {error && (
        <p id={`${props.id}-error`} className="mt-1 text-xs text-red-600">
          {error}
        </p>
      )}

      {success && <p className="mt-1 text-xs text-green-600">{success}</p>}
    </div>
  );
};

const Select: React.FC<SelectProps> = ({
  label,
  error,
  success,
  hint,
  required = false,
  size = 'md',
  variant = 'default',
  fullWidth = true,
  className = '',
  options,
  placeholder,
  ...props
}) => {
  const actualVariant = error ? 'error' : success ? 'success' : variant;

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-3 py-2 text-sm',
    lg: 'px-4 py-3 text-base',
  };

  const variantClasses = {
    default:
      'border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:border-dark-600 dark:bg-dark-700 dark:text-dark-100 dark:focus:ring-blue-400 dark:focus:border-blue-400',
    error:
      'border-red-500 focus:ring-red-500 focus:border-red-500 dark:border-red-400 dark:bg-dark-700 dark:text-dark-100 dark:focus:ring-red-400 dark:focus:border-red-400',
    success:
      'border-green-500 focus:ring-green-500 focus:border-green-500 dark:border-green-400 dark:bg-dark-700 dark:text-dark-100 dark:focus:ring-green-400 dark:focus:border-green-400',
  };

  const selectClasses = [
    'block w-full border rounded-md shadow-sm transition-colors',
    'focus:outline-none focus:ring-1',
    'disabled:bg-gray-50 disabled:text-gray-500 dark:disabled:bg-dark-800 dark:disabled:text-dark-500',
    sizeClasses[size],
    variantClasses[actualVariant],
    !fullWidth ? 'w-auto' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={`${fullWidth ? 'w-full' : ''}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-dark-300 mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <select
        className={selectClasses}
        aria-describedby={error ? `${props.id}-error` : hint ? `${props.id}-hint` : undefined}
        {...props}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map(option => (
          <option key={option.value} value={option.value} disabled={option.disabled}>
            {option.label}
          </option>
        ))}
      </select>

      {hint && !error && !success && (
        <p id={`${props.id}-hint`} className="mt-1 text-xs text-gray-500 dark:text-dark-400">
          {hint}
        </p>
      )}

      {error && (
        <p id={`${props.id}-error`} className="mt-1 text-xs text-red-600">
          {error}
        </p>
      )}

      {success && <p className="mt-1 text-xs text-green-600">{success}</p>}
    </div>
  );
};

export { Input, Select, Textarea };
export default Input;
