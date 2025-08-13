import {
    AlertCircle,
    Calendar,
    CreditCard,
    FileText,
    TrendingUp,
    Users,
} from '@/utils/lucide-shim';
import React from 'react';

interface PaymentStatsData {
  todayRevenue: {
    amount: number;
    count: number;
    change?: number; // 전일 대비 변화율
  };
  monthlyRevenue: {
    amount: number;
    count: number;
    change?: number; // 전월 대비 변화율
  };
  pendingRefunds: {
    amount: number;
    count: number;
  };
  expiringMemberships: {
    count: number;
    daysLeft: number;
  };
  paymentMethods: {
    cash: number;
    card: number;
    transfer: number;
    other: number;
  };
  topPaymentTypes: {
    membership: number;
    pt: number;
    other: number;
  };
}

interface PaymentStatsProps {
  data: PaymentStatsData;
  loading?: boolean;
  onRefresh?: () => void;
  compact?: boolean; // 컴팩트 모드: 카드/여백 최소화, 상세 섹션 숨김
}

// 금액 포맷팅
const formatCurrency = (amount: number): string => {
  if (amount >= 100000000) {
    return `${(amount / 100000000).toFixed(1)}억원`;
  } else if (amount >= 10000) {
    return `${(amount / 10000).toFixed(0)}만원`;
  } else {
    return `${amount.toLocaleString('ko-KR')}원`;
  }
};

// 변화율 표시
const ChangeIndicator: React.FC<{ change?: number }> = ({ change }) => {
  if (change === undefined) return null;

  const isPositive = change > 0;
  const isNegative = change < 0;

  return (
    <span
      className={`text-xs ${isPositive ? 'text-green-600' : isNegative ? 'text-red-600' : 'text-gray-500'}`}
    >
      {isPositive && '+'}
      {change.toFixed(1)}%{isPositive ? ' ↗' : isNegative ? ' ↘' : ' →'}
    </span>
  );
};

// 통계 카드 컴포넌트
const StatCard: React.FC<{
  title: string;
  value: string;
  subtitle?: string;
  icon: React.ReactNode;
  iconBgColor: string;
  change?: number;
  compact?: boolean;
}> = ({ title, value, subtitle, icon, iconBgColor, change, compact = false }) => (
  <div
    className={
      `bg-white dark:bg-dark-800 ${compact ? 'p-2' : 'p-6'} rounded-lg border border-gray-200 dark:border-dark-600`
    }
  >
    <div className="flex items-center">
      <div className={`${compact ? 'p-1' : 'p-3'} rounded-lg ${iconBgColor}`}>{icon}</div>
      <div className={`${compact ? 'ml-2' : 'ml-4'} flex-1`}>
        <p className={`${compact ? 'text-[11px]' : 'text-sm'} font-medium text-gray-600 dark:text-dark-300`}>{title}</p>
        <p className={`${compact ? 'text-lg' : 'text-2xl'} font-bold text-gray-900 dark:text-dark-100`}>{value}</p>
        {subtitle && (
          <div className={`${compact ? 'mt-0.5' : 'mt-1'} flex items-center`}>
            <p className={`${compact ? 'text-[11px]' : 'text-xs'} text-gray-500 dark:text-dark-400`}>{subtitle}</p>
            <ChangeIndicator change={change} />
          </div>
        )}
      </div>
    </div>
  </div>
);

const PaymentStats: React.FC<PaymentStatsProps> = ({ data, loading = false, compact = false }) => {
  if (loading) {
    return (
      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 ${compact ? 'gap-2' : 'gap-6'}`}>
        {[...Array(4)].map((_, index) => (
          <div
            key={index}
            className={`bg-white dark:bg-dark-800 ${compact ? 'p-3' : 'p-6'} rounded-lg border border-gray-200 dark:border-dark-600 animate-pulse`}
          >
            <div className="flex items-center">
              <div className={`${compact ? 'p-1 w-8 h-8' : 'p-3 w-12 h-12'} rounded-lg bg-gray-200 dark:bg-dark-600`}></div>
              <div className={`${compact ? 'ml-2' : 'ml-4'} flex-1`}>
                <div className={`${compact ? 'h-3' : 'h-4'} bg-gray-200 dark:bg-dark-600 rounded mb-2 w-3/4`}></div>
                <div className={`${compact ? 'h-4' : 'h-6'} bg-gray-200 dark:bg-dark-600 rounded w-1/2`}></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={compact ? 'space-y-2' : 'space-y-6'}>

      {/* 주요 통계 카드들 */}
      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 ${compact ? 'gap-2' : 'gap-6'}`}>
        {/* 오늘 매출 */}
        <StatCard
          title="오늘 매출"
          value={formatCurrency(data.todayRevenue.amount)}
          subtitle={`${data.todayRevenue.count}건`}
          icon={<TrendingUp className={`${compact ? 'w-4 h-4' : 'w-6 h-6'} text-green-600`} />}
          iconBgColor="bg-green-100"
          change={data.todayRevenue.change}
          compact={compact}
        />

        {/* 이번 달 매출 */}
        <StatCard
          title="이번 달 매출"
          value={formatCurrency(data.monthlyRevenue.amount)}
          subtitle={`${data.monthlyRevenue.count}건`}
          icon={<CreditCard className={`${compact ? 'w-4 h-4' : 'w-6 h-6'} text-blue-600`} />}
          iconBgColor="bg-blue-100"
          change={data.monthlyRevenue.change}
          compact={compact}
        />

        {/* 대기 중인 환불 */}
        <StatCard
          title="대기 중인 환불"
          value={data.pendingRefunds.count.toString()}
          subtitle={`${formatCurrency(data.pendingRefunds.amount)}`}
          icon={<AlertCircle className={`${compact ? 'w-4 h-4' : 'w-6 h-6'} text-yellow-600`} />}
          iconBgColor="bg-yellow-100"
          compact={compact}
        />

        {/* 만료 예정 */}
        <StatCard
          title="만료 예정"
          value={data.expiringMemberships.count.toString()}
          subtitle={`${data.expiringMemberships.daysLeft}일 이내`}
          icon={<Calendar className={`${compact ? 'w-4 h-4' : 'w-6 h-6'} text-red-600`} />}
          iconBgColor="bg-red-100"
          compact={compact}
        />
      </div>

      {/* 상세 통계 & 추가 인사이트: compact 모드에서는 숨김 */}
      {!compact && (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 결제 방식별 통계 */}
            <div className="bg-white dark:bg-dark-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-dark-600">
              <h4 className="text-lg font-semibold text-gray-900 dark:text-dark-100 mb-4 flex items-center">
                <CreditCard className="w-5 h-5 mr-2" />
                결제 방식별 현황
              </h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-dark-300">현금</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-dark-100">
                    {formatCurrency(data.paymentMethods.cash)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-dark-300">카드</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-dark-100">
                    {formatCurrency(data.paymentMethods.card)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-dark-300">계좌이체</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-dark-100">
                    {formatCurrency(data.paymentMethods.transfer)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-dark-300">기타</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-dark-100">
                    {formatCurrency(data.paymentMethods.other)}
                  </span>
                </div>
              </div>
            </div>

            {/* 결제 유형별 통계 */}
            <div className="bg-white dark:bg-dark-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-dark-600">
              <h4 className="text-lg font-semibold text-gray-900 dark:text-dark-100 mb-4 flex items-center">
                <FileText className="w-5 h-5 mr-2" />
                결제 유형별 현황
              </h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-dark-300">회원권</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-dark-100">
                    {formatCurrency(data.topPaymentTypes.membership)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-dark-300">PT</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-dark-100">
                    {formatCurrency(data.topPaymentTypes.pt)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-dark-300">기타</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-dark-100">
                    {formatCurrency(data.topPaymentTypes.other)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border border-blue-200">
            <h4 className="text-lg font-semibold text-blue-900 mb-2 flex items-center">
              <Users className="w-5 h-5 mr-2" />
              인사이트
            </h4>
            <div className="text-sm text-blue-800 space-y-1">
              <p>
                • 오늘 결제 건수: <strong>{data.todayRevenue.count}건</strong>
              </p>
              <p>
                • 이번 달 누적 결제: <strong>{data.monthlyRevenue.count}건</strong>
              </p>
              {data.pendingRefunds.count > 0 && (
                <p className="text-yellow-700">
                  • 환불 처리가 필요한 건이 <strong>{data.pendingRefunds.count}건</strong> 있습니다.
                </p>
              )}
              {data.expiringMemberships.count > 0 && (
                <p className="text-red-700">
                  • {data.expiringMemberships.daysLeft}일 이내 만료 예정 회원권이{' '}
                  <strong>{data.expiringMemberships.count}건</strong> 있습니다.
                </p>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default PaymentStats;
