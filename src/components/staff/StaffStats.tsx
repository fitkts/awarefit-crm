import {
    Briefcase,
    Building,
    CreditCard,
    Shield,
    TrendingUp,
    UserCheck,
    UserPlus,
    Users,
} from 'lucide-react';
import React from 'react';
import { StaffStats } from '../../types/staff';

interface StaffStatsProps {
  stats: StaffStats;
  loading?: boolean;
}

const StaffStatsComponent: React.FC<StaffStatsProps> = ({ stats, loading = false }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        {[...Array(4)].map((_, index) => (
          <div
            key={index}
            className="bg-white dark:bg-dark-800 rounded-lg shadow-sm border border-gray-200 dark:border-dark-600 p-4 animate-pulse"
          >
            <div className="h-3 bg-gray-200 dark:bg-dark-600 rounded w-3/4 mb-2"></div>
            <div className="h-6 bg-gray-200 dark:bg-dark-600 rounded w-1/2 mb-2"></div>
            <div className="h-2 bg-gray-200 dark:bg-dark-600 rounded w-full"></div>
          </div>
        ))}
      </div>
    );
  }

  // 안전한 값 접근을 위한 헬퍼 함수들
  const safeValue = (value: number | undefined | null): number => value ?? 0;
  const safeObject = (obj: Record<string, number> | undefined | null): Record<string, number> =>
    obj ?? {};

  // 백분율 계산 헬퍼
  const getPercentage = (value: number, total: number) => {
    return total > 0 ? Math.round((value / total) * 100) : 0;
  };

  // 급여 포맷 헬퍼
  const formatSalary = (amount: number) => {
    if (amount >= 100000000) {
      return `${(amount / 100000000).toFixed(1)}억`;
    } else if (amount >= 10000) {
      return `${(amount / 10000).toFixed(0)}만`;
    }
    return amount.toLocaleString();
  };

  // 안전한 stats 값들
  const totalStaff = safeValue(stats.total);
  const activeStaff = safeValue(stats.active);
  const newThisMonth = safeValue(stats.new_this_month);
  const averageTenure = safeValue(stats.average_tenure_months);
  const totalSalaryCost = safeValue(stats.total_salary_cost);
  const averageSalary = safeValue(stats.average_salary);
  const byPosition = safeObject(stats.by_position);
  const byDepartment = safeObject(stats.by_department);
  const byRole = safeObject(stats.by_role);

  return (
    <div className="space-y-4 mb-4">
      {/* 상단 주요 지표 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 전체 직원 수 */}
        <div className="bg-white dark:bg-dark-800 rounded-lg shadow-sm border border-gray-200 dark:border-dark-600 p-4 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-600 dark:text-dark-400">전체 직원</p>
              <p className="text-xl font-bold text-gray-900 dark:text-dark-100">{totalStaff.toLocaleString()}</p>
              <p className="text-xs text-gray-500 dark:text-dark-400 mt-1">신규 직원 {newThisMonth}명 (이번 달)</p>
            </div>
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
          </div>
        </div>

        {/* 활성 직원 */}
        <div className="bg-white dark:bg-dark-800 rounded-lg shadow-sm border border-gray-200 dark:border-dark-600 p-4 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-600 dark:text-dark-400">활성 직원</p>
              <p className="text-xl font-bold text-green-600">{activeStaff.toLocaleString()}</p>
              <p className="text-xs text-gray-500 dark:text-dark-400 mt-1">
                {getPercentage(activeStaff, totalStaff)}% 활성률
              </p>
            </div>
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <UserCheck className="w-5 h-5 text-green-600" />
            </div>
          </div>
        </div>

        {/* 평균 근속 기간 */}
        <div className="bg-white dark:bg-dark-800 rounded-lg shadow-sm border border-gray-200 dark:border-dark-600 p-4 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-600 dark:text-dark-400">평균 근속</p>
              <p className="text-xl font-bold text-blue-600">{averageTenure}개월</p>
              <p className="text-xs text-gray-500 dark:text-dark-400 mt-1">
                약 {Math.round((averageTenure / 12) * 10) / 10}년
              </p>
            </div>
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-blue-600" />
            </div>
          </div>
        </div>

        {/* 총 급여 비용 */}
        <div className="bg-white dark:bg-dark-800 rounded-lg shadow-sm border border-gray-200 dark:border-dark-600 p-4 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-600 dark:text-dark-400">총 급여 비용</p>
              <p className="text-xl font-bold text-purple-600">{formatSalary(totalSalaryCost)}원</p>
              <p className="text-xs text-gray-500 dark:text-dark-400 mt-1">평균 {formatSalary(averageSalary)}원</p>
            </div>
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* 하단 상세 분석 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* 직책별 분포 */}
        <div className="bg-white dark:bg-dark-800 rounded-lg shadow-sm border border-gray-200 dark:border-dark-600 p-4">
          <div className="flex items-center mb-3">
            <Briefcase className="w-4 h-4 text-gray-600 dark:text-dark-400 mr-2" />
            <h3 className="text-sm font-medium text-gray-900 dark:text-dark-100">직책별 분포</h3>
          </div>
          <div className="space-y-2">
            {Object.entries(byPosition).map(([position, count]) => (
              <div key={position} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div
                    className={`w-2 h-2 rounded-full mr-2 ${
                      position === '매니저'
                        ? 'bg-purple-500'
                        : position === '트레이너'
                          ? 'bg-blue-500'
                          : position === '데스크'
                            ? 'bg-green-500'
                            : 'bg-gray-500'
                    }`}
                  ></div>
                  <span className="text-xs text-gray-600 dark:text-dark-400">{position}</span>
                </div>
                <div className="flex items-center">
                  <span className="text-sm font-medium text-gray-900 dark:text-dark-100 mr-2">{count}명</span>
                  <span className="text-xs text-gray-500">
                    ({getPercentage(count, totalStaff)}%)
                  </span>
                </div>
              </div>
            ))}
            {Object.keys(byPosition).length === 0 && (
              <p className="text-xs text-gray-500 dark:text-dark-400 text-center py-2">데이터가 없습니다</p>
            )}
          </div>
        </div>

        {/* 부서별 분포 */}
        <div className="bg-white dark:bg-dark-800 rounded-lg shadow-sm border border-gray-200 dark:border-dark-600 p-4">
          <div className="flex items-center mb-3">
            <Building className="w-4 h-4 text-gray-600 dark:text-dark-400 mr-2" />
            <h3 className="text-sm font-medium text-gray-900 dark:text-dark-100">부서별 분포</h3>
          </div>
          <div className="space-y-2">
            {Object.entries(byDepartment).map(([department, count]) => (
              <div key={department} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div
                    className={`w-2 h-2 rounded-full mr-2 ${
                      department === '운영팀'
                        ? 'bg-red-500'
                        : department === '트레이닝팀'
                          ? 'bg-blue-500'
                          : department === '고객서비스팀'
                            ? 'bg-green-500'
                            : department === '시설관리팀'
                              ? 'bg-yellow-500'
                              : 'bg-gray-500'
                    }`}
                  ></div>
                  <span className="text-xs text-gray-600 dark:text-dark-400">{department}</span>
                </div>
                <div className="flex items-center">
                  <span className="text-sm font-medium text-gray-900 dark:text-dark-100 mr-2">{count}명</span>
                  <span className="text-xs text-gray-500">
                    ({getPercentage(count, totalStaff)}%)
                  </span>
                </div>
              </div>
            ))}
            {Object.keys(byDepartment).length === 0 && (
              <p className="text-xs text-gray-500 dark:text-dark-400 text-center py-2">데이터가 없습니다</p>
            )}
          </div>
        </div>

        {/* 역할별 분포 */}
        <div className="bg-white dark:bg-dark-800 rounded-lg shadow-sm border border-gray-200 dark:border-dark-600 p-4">
          <div className="flex items-center mb-3">
            <Shield className="w-4 h-4 text-gray-600 dark:text-dark-400 mr-2" />
            <h3 className="text-sm font-medium text-gray-900 dark:text-dark-100">역할별 분포</h3>
          </div>
          <div className="space-y-2">
            {Object.entries(byRole).map(([role, count]) => (
              <div key={role} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div
                    className={`w-2 h-2 rounded-full mr-2 ${
                      role === '관리자'
                        ? 'bg-red-500'
                        : role === '트레이너'
                          ? 'bg-blue-500'
                          : role === '데스크'
                            ? 'bg-green-500'
                            : 'bg-gray-500'
                    }`}
                  ></div>
                  <span className="text-xs text-gray-600 dark:text-dark-400">{role}</span>
                </div>
                <div className="flex items-center">
                  <span className="text-sm font-medium text-gray-900 dark:text-dark-100 mr-2">{count}명</span>
                  <span className="text-xs text-gray-500">
                    ({getPercentage(count, totalStaff)}%)
                  </span>
                </div>
              </div>
            ))}
            {Object.keys(byRole).length === 0 && (
              <p className="text-xs text-gray-500 dark:text-dark-400 text-center py-2">데이터가 없습니다</p>
            )}
          </div>
        </div>
      </div>

      {/* 추가 인사이트 */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 border border-blue-200">
        <div className="flex items-start">
          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3 mt-0.5">
            <UserPlus className="w-4 h-4 text-blue-600" />
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-medium text-gray-900 mb-1">인사관리 인사이트</h4>
            <div className="text-xs text-gray-600 space-y-1">
              <p>
                • 이번 달 신규 입사자가 {newThisMonth}명으로
                {newThisMonth > 3 ? ' 많은' : ' 적은'} 편입니다.
              </p>
              <p>
                • 평균 근속 기간이 {averageTenure}개월로
                {averageTenure > 24 ? '안정적' : '개선이 필요'}합니다.
              </p>
              <p>
                • 활성 직원 비율이 {getPercentage(activeStaff, totalStaff)}%로
                {getPercentage(activeStaff, totalStaff) > 90 ? '우수' : '점검이 필요'}합니다.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaffStatsComponent;
