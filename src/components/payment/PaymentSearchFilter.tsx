import {
  Calendar,
  CreditCard,
  Filter,
  Package,
  RefreshCw,
  Search,
  User,
  X,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { PaymentSearchFilter as PaymentSearchFilterType } from '../../types/payment';

interface PaymentSearchFilterProps {
  filter: PaymentSearchFilterType;
  onFilterChange: (filter: PaymentSearchFilterType) => void;
  onReset: () => void;
  loading?: boolean;
}

interface StaffOption {
  id: number;
  name: string;
  position: string;
}

const PaymentSearchFilter: React.FC<PaymentSearchFilterProps> = ({
  filter,
  onFilterChange,
  onReset,
  loading = false,
}) => {
  const [staffList, setStaffList] = useState<StaffOption[]>([]);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // 직원 목록 로드
  useEffect(() => {
    const loadStaff = async () => {
      try {
        const result = await window.electronAPI.database.staff.getAll({
          is_active: true,
          can_manage_payments: true
        });
        const staffOptions = result.map((staff: any) => ({
          id: staff.id,
          name: staff.name,
          position: staff.position,
        }));
        setStaffList(staffOptions);
      } catch (error) {
        console.error('직원 목록 조회 실패:', error);
      }
    };

    loadStaff();
  }, []);

  // 필터 값 변경 핸들러
  const handleFilterChange = (field: keyof PaymentSearchFilterType, value: any) => {
    onFilterChange({
      ...filter,
      [field]: value,
    });
  };

  // 날짜 범위 프리셋
  const setDatePreset = (preset: string) => {
    const today = new Date();
    let startDate = '';
    const endDate = today.toISOString().split('T')[0];

    switch (preset) {
      case 'today':
        startDate = endDate;
        break;
      case 'week':
        const weekAgo = new Date(today);
        weekAgo.setDate(today.getDate() - 7);
        startDate = weekAgo.toISOString().split('T')[0];
        break;
      case 'month':
        const monthAgo = new Date(today);
        monthAgo.setMonth(today.getMonth() - 1);
        startDate = monthAgo.toISOString().split('T')[0];
        break;
      case 'year':
        const yearAgo = new Date(today);
        yearAgo.setFullYear(today.getFullYear() - 1);
        startDate = yearAgo.toISOString().split('T')[0];
        break;
      default:
        return;
    }

    onFilterChange({
      ...filter,
      payment_date_from: startDate,
      payment_date_to: endDate,
    });
  };

  // 필터 개수 계산
  const getActiveFilterCount = () => {
    let count = 0;
    if (filter.search) count++;
    if (filter.payment_type && filter.payment_type !== 'all') count++;
    if (filter.payment_method && filter.payment_method !== 'all') count++;
    if (filter.staff_id) count++;
    if (filter.status && filter.status !== 'all') count++;
    if (filter.payment_date_from) count++;
    if (filter.payment_date_to) count++;
    return count;
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 space-y-4">
      {/* 상단 검색 바 */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* 검색어 입력 */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="회원명, 전화번호, 결제번호로 검색..."
            value={filter.search || ''}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* 빠른 날짜 선택 */}
        <div className="flex gap-2">
          <button
            onClick={() => setDatePreset('today')}
            className="px-3 py-2 text-xs bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
          >
            오늘
          </button>
          <button
            onClick={() => setDatePreset('week')}
            className="px-3 py-2 text-xs bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
          >
            1주일
          </button>
          <button
            onClick={() => setDatePreset('month')}
            className="px-3 py-2 text-xs bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
          >
            1개월
          </button>
        </div>

        {/* 고급 필터 토글 */}
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center px-3 py-2 text-sm text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200"
        >
          <Filter className="w-4 h-4 mr-1" />
          고급 필터
          {getActiveFilterCount() > 0 && (
            <span className="ml-1 px-2 py-0.5 text-xs bg-blue-600 text-white rounded-full">
              {getActiveFilterCount()}
            </span>
          )}
        </button>

        {/* 초기화 버튼 */}
        {getActiveFilterCount() > 0 && (
          <button
            onClick={onReset}
            className="flex items-center px-3 py-2 text-sm text-red-600 bg-red-50 rounded-md hover:bg-red-100"
          >
            <X className="w-4 h-4 mr-1" />
            초기화
          </button>
        )}
      </div>

      {/* 고급 필터 섹션 */}
      {showAdvanced && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-gray-200">
          {/* 날짜 범위 */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              <Calendar className="w-4 h-4 inline mr-1" />
              시작일
            </label>
            <input
              type="date"
              value={filter.payment_date_from || ''}
              onChange={(e) => handleFilterChange('payment_date_from', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              <Calendar className="w-4 h-4 inline mr-1" />
              종료일
            </label>
            <input
              type="date"
              value={filter.payment_date_to || ''}
              onChange={(e) => handleFilterChange('payment_date_to', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* 결제 유형 */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              <Package className="w-4 h-4 inline mr-1" />
              결제 유형
            </label>
            <select
              value={filter.payment_type || 'all'}
              onChange={(e) => handleFilterChange('payment_type', e.target.value === 'all' ? undefined : e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">전체</option>
              <option value="membership">회원권</option>
              <option value="pt">PT</option>
              <option value="other">기타</option>
            </select>
          </div>

          {/* 결제 방식 */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              <CreditCard className="w-4 h-4 inline mr-1" />
              결제 방식
            </label>
            <select
              value={filter.payment_method || 'all'}
              onChange={(e) => handleFilterChange('payment_method', e.target.value === 'all' ? undefined : e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">전체</option>
              <option value="현금">현금</option>
              <option value="카드">카드</option>
              <option value="계좌이체">계좌이체</option>
              <option value="기타">기타</option>
            </select>
          </div>

          {/* 담당 직원 */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              <User className="w-4 h-4 inline mr-1" />
              담당 직원
            </label>
            <select
              value={filter.staff_id || ''}
              onChange={(e) => handleFilterChange('staff_id', e.target.value ? parseInt(e.target.value) : undefined)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">전체 직원</option>
              {staffList.map(staff => (
                <option key={staff.id} value={staff.id}>
                  {staff.name} ({staff.position})
                </option>
              ))}
            </select>
          </div>

          {/* 결제 상태 */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">상태</label>
            <select
              value={filter.status || 'all'}
              onChange={(e) => handleFilterChange('status', e.target.value === 'all' ? undefined : e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">전체</option>
              <option value="completed">완료</option>
              <option value="refunded">환불</option>
              <option value="cancelled">취소</option>
              <option value="pending">대기</option>
            </select>
          </div>

          {/* 금액 범위 */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">최소 금액</label>
            <input
              type="number"
              placeholder="0"
              value={filter.amount_min || ''}
              onChange={(e) => handleFilterChange('amount_min', e.target.value ? parseInt(e.target.value) : undefined)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">최대 금액</label>
            <input
              type="number"
              placeholder="∞"
              value={filter.amount_max || ''}
              onChange={(e) => handleFilterChange('amount_max', e.target.value ? parseInt(e.target.value) : undefined)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      )}

      {/* 로딩 인디케이터 */}
      {loading && (
        <div className="flex items-center justify-center py-2">
          <RefreshCw className="w-4 h-4 animate-spin text-blue-600 mr-2" />
          <span className="text-sm text-gray-600">검색 중...</span>
        </div>
      )}

      {/* 활성 필터 표시 */}
      {getActiveFilterCount() > 0 && !showAdvanced && (
        <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-200">
          <span className="text-xs text-gray-500">활성 필터:</span>
          {filter.search && (
            <span className="inline-flex items-center px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
              검색: {filter.search}
              <button
                onClick={() => handleFilterChange('search', '')}
                className="ml-1 text-blue-600 hover:text-blue-800"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {filter.payment_type && filter.payment_type !== 'all' && (
            <span className="inline-flex items-center px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
              유형: {filter.payment_type === 'membership' ? '회원권' : filter.payment_type === 'pt' ? 'PT' : '기타'}
              <button
                onClick={() => handleFilterChange('payment_type', undefined)}
                className="ml-1 text-green-600 hover:text-green-800"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {filter.status && filter.status !== 'all' && (
            <span className="inline-flex items-center px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded-full">
              상태: {filter.status === 'completed' ? '완료' :
                filter.status === 'refunded' ? '환불' :
                  filter.status === 'cancelled' ? '취소' : '대기'}
              <button
                onClick={() => handleFilterChange('status', undefined)}
                className="ml-1 text-purple-600 hover:text-purple-800"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default PaymentSearchFilter; 