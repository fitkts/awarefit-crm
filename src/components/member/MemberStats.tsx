import React from 'react';
import {
  Users,
  UserPlus,
  UserCheck,
  UserX,
  TrendingUp,
  TrendingDown,
  Calendar,
  Clock,
  PieChart,
  BarChart3,
  Activity,
  Award,
} from 'lucide-react';
import { MemberStats } from '../../types/member';

interface MemberStatsProps {
  stats: MemberStats;
  loading?: boolean;
}

const MemberStatsComponent: React.FC<MemberStatsProps> = ({ stats, loading = false }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[...Array(8)].map((_, index) => (
          <div
            key={index}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 animate-pulse"
          >
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-full"></div>
          </div>
        ))}
      </div>
    );
  }

  // 백분율 계산 헬퍼
  const getPercentage = (value: number, total: number) => {
    return total > 0 ? Math.round((value / total) * 100) : 0;
  };

  // 증감 표시
  const getTrendIcon = (current: number, comparison: number) => {
    if (current > comparison) return <TrendingUp className="w-4 h-4 text-green-500" />;
    if (current < comparison) return <TrendingDown className="w-4 h-4 text-red-500" />;
    return <Activity className="w-4 h-4 text-gray-400" />;
  };

  return (
    <div className="space-y-8 mb-8">
      {/* 주요 지표 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* 전체 회원 수 */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">전체 회원</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total.toLocaleString()}</p>
              <p className="text-xs text-gray-500 mt-1">
                신규 회원 {stats.new_this_week}명 (이번 주)
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        {/* 활성 회원 */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">활성 회원</p>
              <p className="text-2xl font-bold text-green-600">{stats.active.toLocaleString()}</p>
              <p className="text-xs text-gray-500 mt-1">
                {getPercentage(stats.active, stats.total)}% 활성률
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <UserCheck className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        {/* 이번 달 신규 회원 */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">이번 달 신규</p>
              <p className="text-2xl font-bold text-blue-600">
                {stats.new_this_month.toLocaleString()}
              </p>
              <div className="flex items-center mt-1">
                {getTrendIcon(stats.new_this_month, stats.new_this_week * 4)}
                <p className="text-xs text-gray-500 ml-1">전월 대비</p>
              </div>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <UserPlus className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        {/* 회원권 보유 */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">회원권 보유</p>
              <p className="text-2xl font-bold text-purple-600">
                {stats.with_membership.toLocaleString()}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {getPercentage(stats.with_membership, stats.total)}% 보유율
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Award className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* 상세 통계 패널 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 성별 분포 */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">성별 분포</h3>
            <PieChart className="w-5 h-5 text-gray-400" />
          </div>

          <div className="space-y-4">
            {/* 남성 */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-sm text-gray-600">남성</span>
              </div>
              <div className="text-right">
                <span className="text-sm font-medium text-gray-900">{stats.male}명</span>
                <div className="text-xs text-gray-500">
                  {getPercentage(stats.male, stats.total)}%
                </div>
              </div>
            </div>

            {/* 여성 */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-pink-500 rounded-full"></div>
                <span className="text-sm text-gray-600">여성</span>
              </div>
              <div className="text-right">
                <span className="text-sm font-medium text-gray-900">{stats.female}명</span>
                <div className="text-xs text-gray-500">
                  {getPercentage(stats.female, stats.total)}%
                </div>
              </div>
            </div>

            {/* 미설정 */}
            {stats.total - stats.male - stats.female > 0 && (
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                  <span className="text-sm text-gray-600">미설정</span>
                </div>
                <div className="text-right">
                  <span className="text-sm font-medium text-gray-900">
                    {stats.total - stats.male - stats.female}명
                  </span>
                  <div className="text-xs text-gray-500">
                    {getPercentage(stats.total - stats.male - stats.female, stats.total)}%
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 프로그레스 바 */}
          <div className="mt-4">
            <div className="flex rounded-full overflow-hidden h-2">
              <div
                className="bg-blue-500"
                style={{ width: `${getPercentage(stats.male, stats.total)}%` }}
              ></div>
              <div
                className="bg-pink-500"
                style={{ width: `${getPercentage(stats.female, stats.total)}%` }}
              ></div>
              {stats.total - stats.male - stats.female > 0 && (
                <div
                  className="bg-gray-400"
                  style={{
                    width: `${getPercentage(stats.total - stats.male - stats.female, stats.total)}%`,
                  }}
                ></div>
              )}
            </div>
          </div>
        </div>

        {/* 연령대 분포 */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">연령대 분포</h3>
            <BarChart3 className="w-5 h-5 text-gray-400" />
          </div>

          <div className="space-y-3">
            {Object.entries(stats.age_distribution).map(([age, count]) => {
              const percentage = getPercentage(count, stats.total);
              return (
                <div key={age} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">{age}세</span>
                    <span className="text-sm font-medium text-gray-900">{count}명</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                  <div className="text-xs text-gray-500">{percentage}%</div>
                </div>
              );
            })}
          </div>

          {/* 평균 나이 */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">평균 나이</span>
              <span className="text-lg font-bold text-blue-600">
                {stats.average_age.toFixed(1)}세
              </span>
            </div>
          </div>
        </div>

        {/* 회원권 현황 */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">회원권 현황</h3>
            <Activity className="w-5 h-5 text-gray-400" />
          </div>

          <div className="space-y-4">
            {/* 회원권 보유 */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">회원권 보유</span>
                <span className="text-sm font-medium text-green-600">
                  {stats.with_membership}명
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-500 h-2 rounded-full"
                  style={{ width: `${getPercentage(stats.with_membership, stats.total)}%` }}
                ></div>
              </div>
            </div>

            {/* 회원권 미보유 */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">회원권 미보유</span>
                <span className="text-sm font-medium text-gray-600">
                  {stats.without_membership}명
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-gray-400 h-2 rounded-full"
                  style={{ width: `${getPercentage(stats.without_membership, stats.total)}%` }}
                ></div>
              </div>
            </div>

            {/* 만료 예정 */}
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-orange-500" />
                  <span className="text-sm text-gray-600">만료 예정 (7일)</span>
                </div>
                <span className="text-sm font-medium text-orange-600">
                  {stats.upcoming_membership_expiry}명
                </span>
              </div>
            </div>

            {/* 비활성 회원 */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <UserX className="w-4 h-4 text-red-500" />
                <span className="text-sm text-gray-600">비활성 회원</span>
              </div>
              <span className="text-sm font-medium text-red-600">{stats.inactive}명</span>
            </div>
          </div>
        </div>
      </div>

      {/* 최근 등록 회원 */}
      {stats.recent_registrations && stats.recent_registrations.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">최근 등록 회원</h3>
            <Calendar className="w-5 h-5 text-gray-400" />
          </div>

          <div className="space-y-3">
            {stats.recent_registrations.slice(0, 5).map(member => (
              <div
                key={member.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                    {member.name.charAt(0)}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-900">{member.name}</div>
                    <div className="text-xs text-gray-500">{member.member_number}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-600">
                    {new Date(member.join_date).toLocaleDateString('ko-KR')}
                  </div>
                  <div className="text-xs text-gray-500">
                    {Math.floor(
                      (Date.now() - new Date(member.join_date).getTime()) / (1000 * 60 * 60 * 24)
                    )}
                    일 전
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MemberStatsComponent;
