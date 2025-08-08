import { Moon, Sun } from '@/utils/lucide-shim';
import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';

interface ThemeToggleProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({ className = '', size = 'md' }) => {
  const { theme, toggleTheme } = useTheme();

  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-10 h-10',
  };

  const iconSizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  return (
    <button
      onClick={toggleTheme}
      className={`
        ${sizeClasses[size]}
        flex items-center justify-center
        rounded-lg
        bg-gray-100 hover:bg-gray-200 
        dark:bg-dark-700 dark:hover:bg-dark-600
        text-gray-700 dark:text-dark-300
        transition-all duration-200
        border border-gray-200 dark:border-dark-600
        shadow-sm hover:shadow-md
        ${className}
      `}
      title={theme === 'light' ? '다크모드로 전환' : '라이트모드로 전환'}
      aria-label={theme === 'light' ? '다크모드로 전환' : '라이트모드로 전환'}
    >
      {theme === 'light' ? (
        <Moon className={`${iconSizeClasses[size]} transition-transform duration-200`} />
      ) : (
        <Sun className={`${iconSizeClasses[size]} transition-transform duration-200`} />
      )}
    </button>
  );
};

export default ThemeToggle;
