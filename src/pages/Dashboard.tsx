import React from 'react';
import {
  Users,
  CreditCard,
  UserCog,
  BarChart3,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Clock,
} from 'lucide-react';

const Dashboard: React.FC = () => {
  // 임시 통계 데이터 (나중에 실제 데이터베이스에서 가져올 예정)
  const stats = [
    {
      title: '총 회원 수',
      value: '247',
      change: '+12',
      changeType: 'increase',
      icon: Users,
      color: 'blue',
    },
    {
      title: '이번 달 매출',
      value: '₩8,420,000',
      change: '+23%',
      changeType: 'increase',
      icon: DollarSign,
      color: 'green',
    },
    {
      title: '활성 회원',
      value: '189',
      change: '-3',
      changeType: 'decrease',
      icon: TrendingUp,
      color: 'purple',
    },
    {
      title: '오늘 출석',
      value: '42',
      change: '+8',
      changeType: 'increase',
      icon: Clock,
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
    { id: 'add-member', label: '회원 등록', icon: Users, color: 'blue' },
    { id: 'process-payment', label: '결제 처리', icon: CreditCard, color: 'green' },
    { id: 'view-statistics', label: '통계 보기', icon: BarChart3, color: 'purple' },
    { id: 'manage-staff', label: '직원 관리', icon: UserCog, color: 'orange' },
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map(stat => {
          const IconComponent = stat.icon;
          return (
            <div
              key={stat.title}
              className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
            >
              <div className="flex items-center justify-between mb-4">
                <div
                  className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                    stat.color === 'blue'
                      ? 'bg-blue-100'
                      : stat.color === 'green'
                        ? 'bg-green-100'
                        : stat.color === 'purple'
                          ? 'bg-purple-100'
                          : 'bg-orange-100'
                  }`}
                >
                  <IconComponent
                    className={`w-6 h-6 ${
                      stat.color === 'blue'
                        ? 'text-blue-600'
                        : stat.color === 'green'
                          ? 'text-green-600'
                          : stat.color === 'purple'
                            ? 'text-purple-600'
                            : 'text-orange-600'
                    }`}
                  />
                </div>

                <div
                  className={`flex items-center space-x-1 text-sm ${
                    stat.changeType === 'increase' ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {stat.changeType === 'increase' ? (
                    <TrendingUp className="w-4 h-4" />
                  ) : (
                    <TrendingDown className="w-4 h-4" />
                  )}
                  <span>{stat.change}</span>
                </div>
              </div>

              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</h3>
                <p className="text-sm text-gray-600">{stat.title}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 빠른 액션 */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">빠른 액션</h3>
          <div className="space-y-3">
            {quickActions.map(action => {
              const IconComponent = action.icon;
              return (
                <button
                  key={action.id}
                  className="w-full flex items-center space-x-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors text-left"
                >
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      action.color === 'blue'
                        ? 'bg-blue-100'
                        : action.color === 'green'
                          ? 'bg-green-100'
                          : action.color === 'purple'
                            ? 'bg-purple-100'
                            : 'bg-orange-100'
                    }`}
                  >
                    <IconComponent
                      className={`w-5 h-5 ${
                        action.color === 'blue'
                          ? 'text-blue-600'
                          : action.color === 'green'
                            ? 'text-green-600'
                            : action.color === 'purple'
                              ? 'text-purple-600'
                              : 'text-orange-600'
                      }`}
                    />
                  </div>
                  <span className="font-medium text-gray-900">{action.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 최근 활동 */}
        <div className="lg:col-span-2 bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">최근 활동</h3>
          <div className="space-y-4">
            {recentActivities.map(activity => (
              <div key={activity.id} className="flex items-center justify-between py-2">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                  <p className="text-sm text-gray-600">{activity.member}</p>
                </div>
                <div className="text-sm text-gray-500">{activity.time}</div>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-4 border-t border-gray-200">
            <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
              모든 활동 보기 →
            </button>
          </div>
        </div>
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
