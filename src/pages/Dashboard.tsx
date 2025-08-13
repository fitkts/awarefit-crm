import React, { Suspense } from 'react';
// 대시보드 내부 섹션 지연 로딩
const StatsCards = React.lazy(
  () => import(/* webpackChunkName: "dashboard-stats-cards" */ '../components/dashboard/StatsCards')
);
const QuickActions = React.lazy(
  () => import(/* webpackChunkName: "dashboard-quick-actions" */ '../components/dashboard/QuickActions')
);
const RecentActivities = React.lazy(
  () => import(/* webpackChunkName: "dashboard-recent-activities" */ '../components/dashboard/RecentActivities')
);

const Dashboard: React.FC = () => {
  // 임시 통계 데이터 (나중에 실제 데이터베이스에서 가져올 예정)
  const stats = [
    {
      title: '총 회원 수',
      value: '247',
      change: '+12',
      changeType: 'increase',
      iconKey: 'users',
      color: 'blue',
    },
    {
      title: '이번 달 매출',
      value: '₩8,420,000',
      change: '+23%',
      changeType: 'increase',
      iconKey: 'dollar-sign',
      color: 'green',
    },
    {
      title: '활성 회원',
      value: '189',
      change: '-3',
      changeType: 'decrease',
      iconKey: 'trending-up',
      color: 'purple',
    },
    {
      title: '오늘 출석',
      value: '42',
      change: '+8',
      changeType: 'increase',
      iconKey: 'clock',
      color: 'orange',
    },
  ];

  const recentActivities = [
    { id: 1, action: '신규 회원 등록', member: '김민수', time: '10분 전' },
    { id: 2, action: '회원권 결제', member: '이영희', time: '25분 전' },
    { id: 3, action: 'PT 예약', member: '박지훈', time: '1시간 전' },
    { id: 4, action: '회원 정보 수정', member: '최수진', time: '2시간 전' },
    { id: 5, action: '결제 환불', member: '정태훈', time: '3시간 전' },
  ];

  const quickActions = [
    { id: 'add-member', label: '회원 등록', iconKey: 'users', color: 'blue' },
    { id: 'process-payment', label: '결제 처리', iconKey: 'credit-card', color: 'green' },
    { id: 'view-statistics', label: '통계 보기', iconKey: 'bar-chart-3', color: 'purple' },
    { id: 'manage-staff', label: '직원 관리', iconKey: 'user-cog', color: 'orange' },
  ];

  return (
    <div className="space-y-6">
      {/* 환영 메시지 */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">안녕하세요! 👋</h1>
        <p className="text-blue-100">
          오늘도 Awarefit CRM과 함께 효율적인 피트니스 센터 운영을 시작해보세요.
        </p>
      </div>

      {/* 주요 통계 카드들 */}
      <Suspense
        fallback={
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, idx) => (
              <div key={idx} className="h-24 rounded-xl border bg-white/50 dark:bg-gray-800/50 animate-pulse" />
            ))}
          </div>
        }
      >
        <StatsCards items={stats as any} />
      </Suspense>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 빠른 액션 */}
        <Suspense
          fallback={
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 animate-pulse h-48" />
          }
        >
          <QuickActions items={quickActions as any} />
        </Suspense>

        {/* 최근 활동 */}
        <Suspense
          fallback={<div className="lg:col-span-2 h-64 rounded-xl border bg-white/50 animate-pulse" />}
        >
          <RecentActivities items={recentActivities} />
        </Suspense>
      </div>

      {/* 시스템 상태 */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">시스템 상태</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-sm text-gray-700">데이터베이스: 정상</span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-sm text-gray-700">백업: 최신 상태</span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-sm text-gray-700">서버: 실행 중</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
