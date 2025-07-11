import React, { useState, useEffect } from 'react';
import Layout from '../components/layout/Layout';
import Dashboard from '../pages/Dashboard';
import Members from '../pages/Members';

interface AppInfo {
  version: string;
  isElectron: boolean;
}

const App: React.FC = () => {
  const [appInfo, setAppInfo] = useState<AppInfo>({
    version: '1.0.0',
    isElectron: false,
  });

  const [currentPage, setCurrentPage] = useState<string>('dashboard');

  useEffect(() => {
    // Electron API 사용 가능한지 확인
    if (window.electronAPI) {
      setAppInfo(prev => ({ ...prev, isElectron: true }));

      // 앱 버전 가져오기
      window.electronAPI.getAppVersion().then(version => {
        setAppInfo(prev => ({ ...prev, version }));
      });
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
        return (
          <div className="bg-white rounded-xl p-8 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">결제 관리</h2>
            <p className="text-gray-600">결제 관리 기능이 곧 추가될 예정입니다.</p>
          </div>
        );
      case 'staff':
        return (
          <div className="bg-white rounded-xl p-8 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">직원 관리</h2>
            <p className="text-gray-600">직원 관리 기능이 곧 추가될 예정입니다.</p>
          </div>
        );
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
      default:
        return <Dashboard />;
    }
  };

  return (
    <Layout currentPage={currentPage} onPageChange={handlePageChange}>
      {renderCurrentPage()}

      {/* 개발 정보 표시 (디버그용) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed bottom-4 right-4 bg-black bg-opacity-80 text-white text-xs p-2 rounded">
          v{appInfo.version} | {appInfo.isElectron ? 'Electron' : 'Web'}
        </div>
      )}
    </Layout>
  );
};

export default App;
