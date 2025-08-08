import { Zap } from '@/utils/lucide-shim';
import React, { useEffect, useState } from 'react';
import ThemeToggle from '../ui/ThemeToggle';

interface TitleBarProps {
  title: string;
  description: string;
}

const TitleBar: React.FC<TitleBarProps> = ({ title, description }) => {
  const [currentDateTime, setCurrentDateTime] = useState(new Date());

  useEffect(() => {
    const timerId = setInterval(() => setCurrentDateTime(new Date()), 1000);
    return () => clearInterval(timerId);
  }, []);

  const formattedDate = currentDateTime.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  });

  const formattedTime = currentDateTime.toLocaleTimeString('ko-KR', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });

  return (
    <header
      className="bg-white dark:bg-dark-800 border-b border-gray-200 dark:border-dark-700 px-4 py-2 flex-shrink-0"
      style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}
    >
      <div className="flex items-center justify-between">
        <div className="min-w-0 flex-1">
          <h2 className="text-base font-semibold text-gray-900 dark:text-dark-100 truncate">
            {title}
          </h2>
          <p className="text-xs text-gray-500 dark:text-dark-400 truncate">{description}</p>
        </div>

        <div className="flex items-center space-x-3">
          {/* 테마 토글 버튼 */}
          <div style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}>
            <ThemeToggle size="sm" />
          </div>

          <div
            className="flex flex-col items-end space-y-1 text-xs text-gray-600 dark:text-dark-400 whitespace-nowrap"
            style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
          >
            {/* 로고 */}
            <div className="flex items-center space-x-1.5 mb-1">
              <div className="w-5 h-5 bg-gradient-to-r from-blue-500 to-purple-600 rounded-md flex items-center justify-center">
                <Zap className="w-3 h-3 text-white" />
              </div>
              <div className="text-right">
                <div className="text-xs font-bold text-gray-900 dark:text-dark-100">Awarefit</div>
                <div className="text-xs text-gray-500 dark:text-dark-400 leading-tight">
                  CRM System
                </div>
              </div>
            </div>

            {/* 날짜/시간 */}
            <div className="text-right">
              <div className="text-xs text-gray-600 dark:text-dark-400">{formattedDate}</div>
              <div className="text-xs font-semibold text-gray-800 dark:text-dark-200 bg-gray-100 dark:bg-dark-700 px-1.5 py-0.5 rounded-sm mt-0.5">
                {formattedTime}
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default TitleBar;
