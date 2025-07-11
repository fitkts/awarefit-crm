import React from 'react';
import Sidebar from './Sidebar';
import TitleBar from './TitleBar';

interface LayoutProps {
  children: React.ReactNode;
  currentPage: string;
  onPageChange: (page: string) => void;
}

const pageDetails: Record<string, { title: string; description: string }> = {
  dashboard: { title: '대시보드', description: '피트니스 센터 운영 현황을 한눈에 확인하세요' },
  members: { title: '회원 관리', description: '회원 정보를 등록, 수정, 조회할 수 있습니다' },
  payments: { title: '결제 관리', description: '회원권 및 PT 결제 내역을 관리합니다' },
  staff: { title: '직원 관리', description: '직원 정보와 권한을 관리합니다' },
  statistics: { title: '통계 분석', description: '매출 및 회원 현황 통계를 확인합니다' },
  schedule: { title: 'PT 스케줄', description: 'PT 세션 예약 및 스케줄을 관리합니다' },
  settings: { title: '시스템 설정', description: '시스템 설정과 데이터 백업을 관리합니다' },
};

const Layout: React.FC<LayoutProps> = ({ children, currentPage, onPageChange }) => {
  const details = pageDetails[currentPage] || { title: 'Awarefit CRM', description: '' };

  return (
    <div className="flex h-screen bg-gray-100 font-sans relative">
      <Sidebar currentPage={currentPage} onPageChange={onPageChange} />
      <div className="flex-1 flex flex-col overflow-hidden ml-12">
        <TitleBar title={details.title} description={details.description} />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-3">
          <div className="h-full">{children}</div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
