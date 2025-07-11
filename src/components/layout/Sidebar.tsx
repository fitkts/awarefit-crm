import React from 'react';
import { Users, CreditCard, UserCog, BarChart3, Calendar, Settings, Home } from 'lucide-react';

interface SidebarProps {
  currentPage: string;
  onPageChange: (page: string) => void;
}

interface MenuItem {
  id: string;
  label: string;
  icon: React.ComponentType<any>;
  status: 'active' | 'coming-soon';
  badge?: string;
}

const menuItems: MenuItem[] = [
  {
    id: 'dashboard',
    label: '대시보드',
    icon: Home,
    status: 'active',
  },
  {
    id: 'members',
    label: '회원 관리',
    icon: Users,
    status: 'active',
    badge: 'New',
  },
  {
    id: 'payments',
    label: '결제 관리',
    icon: CreditCard,
    status: 'active',
  },
  {
    id: 'staff',
    label: '직원 관리',
    icon: UserCog,
    status: 'active',
  },
  {
    id: 'statistics',
    label: '통계 분석',
    icon: BarChart3,
    status: 'active',
  },
  {
    id: 'schedule',
    label: 'PT 스케줄',
    icon: Calendar,
    status: 'coming-soon',
  },
  {
    id: 'settings',
    label: '시스템 설정',
    icon: Settings,
    status: 'coming-soon',
  },
];

const Sidebar: React.FC<SidebarProps> = ({ currentPage, onPageChange }) => {
  return (
    <div
      className="
      fixed left-0 top-0 h-full z-40 
      w-12 hover:w-40 
      bg-white border-r border-gray-200 
      transition-all duration-300 ease-in-out 
      flex flex-col
      group
      shadow-lg
    "
    >
      {/* 메뉴 아이템들 */}
      <nav className="flex-1 p-1 space-y-1 pt-16">
        {menuItems.map(item => {
          const IconComponent = item.icon;
          const isActive = currentPage === item.id;
          const isDisabled = item.status === 'coming-soon';

          return (
            <button
              key={item.id}
              onClick={() => !isDisabled && onPageChange(item.id)}
              disabled={isDisabled}
              className={`
                w-full flex items-center space-x-2 px-2 py-2 rounded-md text-left transition-all duration-200
                ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                    : isDisabled
                      ? 'text-gray-400 cursor-not-allowed'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                }
                justify-start
              `}
              title={item.label}
            >
              <IconComponent
                className={`w-4 h-4 flex-shrink-0 ${
                  isActive ? 'text-blue-600' : isDisabled ? 'text-gray-400' : 'text-gray-500'
                }`}
              />

              <div className="flex-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300 overflow-hidden">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium whitespace-nowrap">{item.label}</span>

                  {/* 배지 */}
                  {item.badge && !isDisabled && (
                    <span className="px-1.5 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded-full ml-1">
                      {item.badge}
                    </span>
                  )}

                  {/* 개발중 표시 */}
                  {isDisabled && (
                    <span className="px-1.5 py-0.5 bg-yellow-100 text-yellow-700 text-xs font-medium rounded-full ml-1">
                      개발중
                    </span>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </nav>

      {/* 하단 정보 */}
      <div className="p-2 border-t border-gray-200 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div className="bg-gray-50 rounded-md p-2">
          <div className="text-xs text-gray-600 mb-1">현재 버전</div>
          <div className="text-sm font-semibold text-gray-900">v1.0.0</div>
          <div className="text-xs text-gray-500 mt-1">
            마지막 업데이트: {new Date().toLocaleDateString('ko-KR')}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
