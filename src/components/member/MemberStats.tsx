import { Award, UserCheck, UserPlus, Users } from 'lucide-react';
import React from 'react';
import { MemberStats } from '../../types/member';

interface MemberStatsProps {
  stats: MemberStats;
  loading?: boolean;
}

const MemberStatsComponent: React.FC<MemberStatsProps> = ({ stats, loading = false }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 mb-2">
        {[...Array(4)].map((_, index) => (
          <div
            key={index}
            className="bg-white rounded-md shadow-sm border border-gray-200 p-2 animate-pulse"
          >
            <div className="h-2 bg-gray-200 rounded w-3/4 mb-1"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-1"></div>
            <div className="h-1.5 bg-gray-200 rounded w-full"></div>
          </div>
        ))}
      </div>
    );
  }

  // 백분율 계산 헬퍼
  const getPercentage = (value: number, total: number) => {
    return total > 0 ? Math.round((value / total) * 100) : 0;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 mb-2">
      {/* 전체 회원 수 */}
      <div className="bg-white rounded-md shadow-sm border border-gray-200 p-2 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-medium text-gray-600 leading-tight">전체 회원</p>
            <p className="text-sm font-bold text-gray-900 leading-tight">
              {stats.total.toLocaleString()}
            </p>
            <p className="text-[9px] text-gray-500 leading-tight">
              신규 {stats.new_this_week}명 (이번 주)
            </p>
          </div>
          <div className="w-5 h-5 bg-blue-100 rounded-md flex items-center justify-center flex-shrink-0 ml-1">
            <Users className="w-3 h-3 text-blue-600" />
          </div>
        </div>
      </div>

      {/* 활성 회원 */}
      <div className="bg-white rounded-md shadow-sm border border-gray-200 p-2 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-medium text-gray-600 leading-tight">활성 회원</p>
            <p className="text-sm font-bold text-green-600 leading-tight">
              {stats.active.toLocaleString()}
            </p>
            <p className="text-[9px] text-gray-500 leading-tight">
              {getPercentage(stats.active, stats.total)}% 활성률
            </p>
          </div>
          <div className="w-5 h-5 bg-green-100 rounded-md flex items-center justify-center flex-shrink-0 ml-1">
            <UserCheck className="w-3 h-3 text-green-600" />
          </div>
        </div>
      </div>

      {/* 이번 달 신규 회원 */}
      <div className="bg-white rounded-md shadow-sm border border-gray-200 p-2 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-medium text-gray-600 leading-tight">이번 달 신규</p>
            <p className="text-sm font-bold text-blue-600 leading-tight">
              {stats.new_this_month.toLocaleString()}
            </p>
            <p className="text-[9px] text-gray-500 leading-tight">-, 전월 대비</p>
          </div>
          <div className="w-5 h-5 bg-blue-100 rounded-md flex items-center justify-center flex-shrink-0 ml-1">
            <UserPlus className="w-3 h-3 text-blue-600" />
          </div>
        </div>
      </div>

      {/* 회원권 보유 */}
      <div className="bg-white rounded-md shadow-sm border border-gray-200 p-2 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-medium text-gray-600 leading-tight">회원권 보유</p>
            <p className="text-sm font-bold text-purple-600 leading-tight">
              {stats.with_membership.toLocaleString()}
            </p>
            <p className="text-[9px] text-gray-500 leading-tight">
              {getPercentage(stats.with_membership, stats.total)}% 보유율
            </p>
          </div>
          <div className="w-5 h-5 bg-purple-100 rounded-md flex items-center justify-center flex-shrink-0 ml-1">
            <Award className="w-3 h-3 text-purple-600" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MemberStatsComponent;
