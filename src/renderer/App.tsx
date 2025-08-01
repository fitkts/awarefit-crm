import React, { useState } from 'react';
import { ToastProvider } from '../components/common/Toast';
import Layout from '../components/layout/Layout';
import ComponentDemo from '../pages/ComponentDemo';
import Dashboard from '../pages/Dashboard';
import Members from '../pages/Members';
import Payment from '../pages/Payment';
import Staff from '../pages/Staff';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<string>('dashboard');

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
          <div className="bg-white rounded-xl p-8 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">통계 분석</h2>
            <p className="text-gray-600">통계 분석 기능이 곧 추가될 예정입니다.</p>
          </div>
        );
      case 'schedule':
        return (
          <div className="bg-white rounded-xl p-8 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">PT 스케줄</h2>
            <p className="text-gray-600">PT 스케줄 기능은 개발 중입니다.</p>
          </div>
        );
      case 'settings':
        return (
          <div className="bg-white rounded-xl p-8 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">시스템 설정</h2>
            <p className="text-gray-600">시스템 설정 기능은 개발 중입니다.</p>
          </div>
        );
      case 'component-demo':
        return <ComponentDemo />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <ToastProvider>
      <Layout currentPage={currentPage} onPageChange={handlePageChange}>
        {renderCurrentPage()}
      </Layout>
    </ToastProvider>
  );
};

export default App;
