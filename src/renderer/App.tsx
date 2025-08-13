import React, { Suspense, useEffect, useState } from 'react';
import { ToastProvider } from '../components/common/Toast';
import Layout from '../components/layout/Layout';
import { ThemeProvider } from '../contexts/ThemeContext';

// 🚀 지연 로딩으로 초기 번들 크기 최적화
const Dashboard = React.lazy(() => import('../pages/Dashboard'));
const Members = React.lazy(() => import('../pages/Members'));
const Payment = React.lazy(() => import('../pages/Payment'));
const Staff = React.lazy(() => import('../pages/Staff'));
const ComponentDemo = process.env.NODE_ENV !== 'production'
  ? React.lazy(() => import('../pages/ComponentDemo'))
  : (null as unknown as React.FC);

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<string>('dashboard');
  // 초기 진입 성능 최적화: 최초 페인트 후에 비활성 페이지 프리로드
  useEffect(() => {
    // 비차단 프리로드: 낮은 우선순위로 다음 페이지들 로드
    const preload = () => {
      import('../pages/Members');
      import('../pages/Payment');
      import('../pages/Staff');
      // 개발 환경에서만 데모 프리로드
      if (process.env.NODE_ENV !== 'production') {
        import('../pages/ComponentDemo');
      }
    };
    if ('requestIdleCallback' in window) {
      (window as any).requestIdleCallback(preload, { timeout: 2000 });
    } else {
      setTimeout(preload, 1500);
    }
  }, []);

  const handlePageChange = (page: string) => {
    setCurrentPage(page);
  };

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'members':
        return <Members />;
      case 'payments':
        return <Payment />;
      case 'staff':
        return <Staff />;
      case 'statistics':
        return (
          <div className="bg-white dark:bg-dark-800 rounded-xl p-8 text-center">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-dark-100 mb-4">통계 분석</h2>
            <p className="text-gray-600 dark:text-dark-400">
              통계 분석 기능이 곧 추가될 예정입니다.
            </p>
          </div>
        );
      case 'schedule':
        return (
          <div className="bg-white dark:bg-dark-800 rounded-xl p-8 text-center">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-dark-100 mb-4">PT 스케줄</h2>
            <p className="text-gray-600 dark:text-dark-400">PT 스케줄 기능은 개발 중입니다.</p>
          </div>
        );
      case 'settings':
        return (
          <div className="bg-white dark:bg-dark-800 rounded-xl p-8 text-center">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-dark-100 mb-4">
              시스템 설정
            </h2>
            <p className="text-gray-600 dark:text-dark-400">시스템 설정 기능은 개발 중입니다.</p>
          </div>
        );
      case 'component-demo':
        return process.env.NODE_ENV !== 'production' ? <ComponentDemo /> : <Dashboard />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <ThemeProvider>
      <ToastProvider>
        <Layout currentPage={currentPage} onPageChange={handlePageChange}>
          <Suspense
            fallback={
              <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-2 text-gray-600 dark:text-gray-400">페이지 로딩 중...</span>
              </div>
            }
          >
            {renderCurrentPage()}
          </Suspense>
        </Layout>
      </ToastProvider>
    </ThemeProvider>
  );
};

export default App;
