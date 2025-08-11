import {
  Bookmark,
  Calendar,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  Filter,
  Package,
  Plus,
  RefreshCw,
  RotateCcw,
  Search,
  User,
  X,
} from '@/utils/lucide-shim';
import React, { useEffect, useState } from 'react';
import { PaymentSearchFilter as PaymentSearchFilterType } from '../../types/payment';

interface PaymentSearchFilterProps {
  filter: PaymentSearchFilterType;
  onFilterChange: (filter: PaymentSearchFilterType) => void;
  onReset: () => void;
  loading?: boolean;
  resultCount: number;
  onRefresh: () => void;
  onAddPayment: () => void;
}

interface StaffOption {
  id: number;
  name: string;
  position: string;
}

// 필터 프리셋 타입
interface PaymentFilterPreset {
  id: string;
  name: string;
  filter: PaymentSearchFilterType;
}

const PaymentSearchFilter: React.FC<PaymentSearchFilterProps> = ({
  filter,
  onFilterChange,
  onReset,
  loading = false,
  resultCount,
  onRefresh,
  onAddPayment,
}) => {
  const [staffList, setStaffList] = useState<StaffOption[]>([]);
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const [dayOffset, setDayOffset] = useState<number>(0);
  const [weekOffset, setWeekOffset] = useState<number>(0);
  const [monthOffset, setMonthOffset] = useState<number>(0);
  const MIN_SEARCH_LENGTH = 1;
  const [searchInput, setSearchInput] = useState<string>(filter.search || '');

  // 외부에서 필터가 초기화/변경되면 입력 상자 값을 동기화
  useEffect(() => {
    setSearchInput(filter.search || '');
  }, [filter.search]);

  // 직원 목록 로드
  useEffect(() => {
    const loadStaff = async () => {
      try {
        const result = await window.electronAPI.database.staff.getAll({
          is_active: true,
          can_manage_payments: true,
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

  // 검색어 디바운스 처리
  const handleSearchChange = (value: string) => {
    setSearchInput(value);
  };

  // Enter 키로 즉시 검색
  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const value = e.currentTarget.value.trim();
      if (value.length === 0) {
        onFilterChange({ ...filter, search: undefined });
        return;
      }
      if (value.length < MIN_SEARCH_LENGTH) {
        onFilterChange({ ...filter, search: undefined });
        return;
      }
      onFilterChange({ ...filter, search: value });
    }
    if (e.key === 'Escape') {
      setSearchInput('');
      onFilterChange({ ...filter, search: undefined });
    }
  };

  // 날짜 프리셋은 스태프 필터 UX와 동일하게 헤더에 배치하지 않음 (고급 필터에서 직접 선택)

  // 프리셋 구성 (결제 도메인용)
  const filterPresets: PaymentFilterPreset[] = [
    { id: 'all', name: '전체 결제', filter: {} },
    {
      id: 'today',
      name: '오늘',
      filter: (() => {
        const d = new Date();
        const s = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        return { payment_date_from: s, payment_date_to: s } as PaymentSearchFilterType;
      })(),
    },
    {
      id: 'this_week',
      name: '이번 주',
      filter: (() => {
        const today = new Date();
        const day = today.getDay();
        const diffToMonday = (day + 6) % 7; // 월=0, 일=6
        const start = new Date(today);
        start.setDate(today.getDate() - diffToMonday);
        const end = new Date(start);
        end.setDate(start.getDate() + 6);
        const s = `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, '0')}-${String(start.getDate()).padStart(2, '0')}`;
        const e = `${end.getFullYear()}-${String(end.getMonth() + 1).padStart(2, '0')}-${String(end.getDate()).padStart(2, '0')}`;
        return { payment_date_from: s, payment_date_to: e } as PaymentSearchFilterType;
      })(),
    },
    {
      id: 'this_month',
      name: '이번 달',
      filter: (() => {
        const now = new Date();
        const start = new Date(now.getFullYear(), now.getMonth(), 1);
        const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        const s = `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, '0')}-${String(start.getDate()).padStart(2, '0')}`;
        const e = `${end.getFullYear()}-${String(end.getMonth() + 1).padStart(2, '0')}-${String(end.getDate()).padStart(2, '0')}`;
        return { payment_date_from: s, payment_date_to: e } as PaymentSearchFilterType;
      })(),
    },
    {
      id: 'week',
      name: '최근 7일',
      filter: (() => {
        const end = new Date();
        const start = new Date();
        start.setDate(end.getDate() - 7);
        const s = `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, '0')}-${String(start.getDate()).padStart(2, '0')}`;
        const e = `${end.getFullYear()}-${String(end.getMonth() + 1).padStart(2, '0')}-${String(end.getDate()).padStart(2, '0')}`;
        return { payment_date_from: s, payment_date_to: e } as PaymentSearchFilterType;
      })(),
    },
    { id: 'refunded', name: '환불', filter: { status: 'refunded' } },
    { id: 'card', name: '카드 결제', filter: { payment_method: '카드' } },
    { id: 'membership', name: '회원권', filter: { payment_type: 'membership' } },
    { id: 'pt', name: 'PT', filter: { payment_type: 'pt' } },
  ];

  const applyPreset = (preset: PaymentFilterPreset) => {
    // 프리셋 적용 시 기간 이동 오프셋 초기화
    setDayOffset(0);
    setWeekOffset(0);
    setMonthOffset(0);
    onFilterChange(preset.filter);
  };

  // 필터 개수 계산
  const getActiveFilterCount = () => {
    let count = 0;
    if (filter.search) count++;
    if (filter.payment_type) count++;
    if (filter.payment_method) count++;
    if (filter.staff_id) count++;
    if (filter.status) count++;
    if (filter.payment_date_from) count++;
    if (filter.payment_date_to) count++;
    if (filter.amount_min) count++;
    if (filter.amount_max) count++;
    if (filter.has_refund !== undefined) count++;
    if (filter.expiry_date_from) count++;
    if (filter.expiry_date_to) count++;
    return count;
  };

  // 기간 계산 유틸
  const toDateStr = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  const setDayRange = (nextOffset: number) => {
    const base = new Date();
    const target = new Date(base);
    target.setDate(base.getDate() + nextOffset);
    setDayOffset(nextOffset);
    onFilterChange({
      ...filter,
      payment_date_from: toDateStr(target),
      payment_date_to: toDateStr(target),
    });
  };
  const setWeekRange = (nextOffset: number) => {
    const today = new Date();
    const day = today.getDay();
    const diffToMonday = (day + 6) % 7; // 월=0
    const start = new Date(today);
    start.setDate(today.getDate() - diffToMonday + nextOffset * 7);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    setWeekOffset(nextOffset);
    onFilterChange({
      ...filter,
      payment_date_from: toDateStr(start),
      payment_date_to: toDateStr(end),
    });
  };
  const setMonthRange = (nextOffset: number) => {
    const now = new Date();
    // 같은 달의 1일 ~ 말일 범위 유지
    const first = new Date(now.getFullYear(), now.getMonth() + nextOffset, 1);
    const last = new Date(now.getFullYear(), now.getMonth() + nextOffset + 1, 0);
    setMonthOffset(nextOffset);
    onFilterChange({
      ...filter,
      payment_date_from: toDateStr(first),
      payment_date_to: toDateStr(last),
    });
  };

  // 

  return (
    <div
      className="bg-white dark:bg-dark-800 rounded-lg shadow-sm border border-gray-200 dark:border-dark-600 sticky top-0 z-30"
      data-testid="payment-filter"
    >
      {/* 메인 필터 헤더 */}
      <div className="px-4 py-3 border-b border-gray-200 dark:border-dark-600">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {/* 검색 입력 */}
            <div className="relative flex-1 min-w-0 w-64">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
          <input
            type="text"
                placeholder="회원명, 전화번호, 결제번호 검색..."
                value={searchInput}
                onChange={e => handleSearchChange(e.target.value)}
                onKeyDown={handleSearchKeyDown}
                className="block w-full pl-10 pr-3 py-2 text-sm border border-gray-300 dark:border-dark-600 bg-white dark:bg-dark-700 dark:text-dark-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={loading}
          />
        </div>

        {/* 고급 필터 토글 */}
        <button
              onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
              className={`flex items-center gap-2 px-3 py-2 text-sm border rounded-lg transition-colors ${
                isAdvancedOpen || getActiveFilterCount() > 0
                  ? 'bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-700'
                  : 'bg-white dark:bg-dark-800 text-gray-700 dark:text-dark-300 border-gray-300 dark:border-dark-600 hover:bg-gray-50 dark:hover:bg-dark-700'
              }`}
              disabled={loading}
            >
              <Filter className="w-4 h-4" />
              <span>고급 필터</span>
          {getActiveFilterCount() > 0 && (
                <span className="bg-blue-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {getActiveFilterCount()}
            </span>
          )}
              <ChevronDown className={`w-4 h-4 transition-transform ${isAdvancedOpen ? 'rotate-180' : ''}`} />
        </button>

        {/* 초기화 버튼 */}
        {getActiveFilterCount() > 0 && (
          <button
            onClick={onReset}
                className="flex items-center gap-1 px-2 py-2 text-sm text-gray-600 dark:text-dark-400 hover:text-gray-900 dark:hover:text-dark-100 transition-colors"
                disabled={loading}
                title="필터 초기화"
          >
                <RotateCcw className="w-4 h-4" />
          </button>
        )}
          </div>

          <div className="flex items-center space-x-3">
            {/* 새로고침 */}
            <button
              onClick={onRefresh}
              className="p-2 text-gray-500 dark:text-dark-400 hover:text-gray-700 dark:hover:text-dark-200 transition-colors"
              disabled={loading}
              title="새로고침"
              data-testid="payment-refresh-button"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>

            {/* 결제 추가 */}
            <button
              onClick={onAddPayment}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
              disabled={loading}
              data-testid="payment-add-button"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">새 결제</span>
            </button>
          </div>
        </div>

        {/* 결과 카운트 및 프리셋 */}
        <div className="flex items-center justify-between mt-3">
          <div className="text-sm text-gray-600 dark:text-dark-400">
            {loading ? (
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
                로딩 중...
              </span>
            ) : (
              <span>
                총 <span className="font-semibold text-gray-900 dark:text-dark-100">{resultCount.toLocaleString()}건</span>의 결제
              </span>
            )}
          </div>

          {/* 빠른 필터 프리셋 + 기간 이동 (예시3 형태 적용) */}
          <div className="hidden lg:flex items-center gap-3">
            {/* 오늘 (버튼 그룹) */}
            <div className="inline-flex items-stretch overflow-hidden rounded-full bg-gray-50 dark:bg-dark-700 shadow-sm">
              <button
                className="p-1 bg-gray-100 dark:bg-dark-600 hover:bg-gray-200 dark:hover:bg-dark-500 text-gray-700 dark:text-dark-200 disabled:opacity-60 disabled:cursor-not-allowed"
                title="이전 날"
                onClick={() => setDayRange(dayOffset - 1)}
                disabled={loading}
              >
                <ChevronLeft className="w-3 h-3" />
              </button>
              <button
                onClick={() => applyPreset(filterPresets.find(p => p.id === 'today')!)}
                className={'px-2 py-0.5 text-[11px] bg-gray-100 dark:bg-dark-600 text-gray-700 dark:text-dark-200 hover:bg-gray-200 dark:hover:bg-dark-500 transition-colors'}
                disabled={loading}
              >
                오늘
              </button>
              <button
                className="p-1 bg-gray-100 dark:bg-dark-600 hover:bg-gray-200 dark:hover:bg-dark-500 text-gray-700 dark:text-dark-200 disabled:opacity-60 disabled:cursor-not-allowed"
                title="다음 날"
                onClick={() => setDayRange(dayOffset + 1)}
                disabled={loading}
              >
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>

            {/* 이번 주 (버튼 그룹) */}
            <div className="inline-flex items-stretch overflow-hidden rounded-full bg-gray-50 dark:bg-dark-700 shadow-sm">
              <button
                className="p-1 bg-gray-100 dark:bg-dark-600 hover:bg-gray-200 dark:hover:bg-dark-500 text-gray-700 dark:text-dark-200 disabled:opacity-60 disabled:cursor-not-allowed"
                title="이전 주"
                onClick={() => setWeekRange(weekOffset - 1)}
                disabled={loading}
              >
                <ChevronLeft className="w-3 h-3" />
              </button>
              <button
                onClick={() => applyPreset(filterPresets.find(p => p.id === 'this_week')!)}
                className={'px-2 py-0.5 text-[11px] bg-gray-100 dark:bg-dark-600 text-gray-700 dark:text-dark-200 hover:bg-gray-200 dark:hover:bg-dark-500 transition-colors'}
                disabled={loading}
              >
                이번 주
              </button>
              <button
                className="p-1 bg-gray-100 dark:bg-dark-600 hover:bg-gray-200 dark:hover:bg-dark-500 text-gray-700 dark:text-dark-200 disabled:opacity-60 disabled:cursor-not-allowed"
                title="다음 주"
                onClick={() => setWeekRange(weekOffset + 1)}
                disabled={loading}
              >
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>

            {/* 이번 달 (버튼 그룹) */}
            <div className="inline-flex items-stretch overflow-hidden rounded-full bg-gray-50 dark:bg-dark-700 shadow-sm">
              <button
                className="p-1 bg-gray-100 dark:bg-dark-600 hover:bg-gray-200 dark:hover:bg-dark-500 text-gray-700 dark:text-dark-200 disabled:opacity-60 disabled:cursor-not-allowed"
                title="이전 달"
                onClick={() => setMonthRange(monthOffset - 1)}
                disabled={loading}
              >
                <ChevronLeft className="w-3 h-3" />
              </button>
              <button
                onClick={() => applyPreset(filterPresets.find(p => p.id === 'this_month')!)}
                className={'px-2 py-0.5 text-[11px] bg-gray-100 dark:bg-dark-600 text-gray-700 dark:text-dark-200 hover:bg-gray-200 dark:hover:bg-dark-500 transition-colors'}
                disabled={loading}
              >
                이번 달
              </button>
              <button
                className="p-1 bg-gray-100 dark:bg-dark-600 hover:bg-gray-200 dark:hover:bg-dark-500 text-gray-700 dark:text-dark-200 disabled:opacity-60 disabled:cursor-not-allowed"
                title="다음 달"
                onClick={() => setMonthRange(monthOffset + 1)}
                disabled={loading}
              >
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>

            {/* 기타 프리셋: 최근 7일/환불/카드/유형 */}
            <div className="flex items-center gap-2">
              {filterPresets
                .filter(p => ['week', 'refunded', 'card', 'membership', 'pt'].includes(p.id))
                .map(preset => (
                  <button
                    key={preset.id}
                    onClick={() => applyPreset(preset)}
                    className={"flex items-center gap-1 px-2 py-0.5 text-[11px] rounded-full bg-gray-100 dark:bg-dark-600 text-gray-700 dark:text-dark-200 hover:bg-gray-200 dark:hover:bg-dark-500 transition-colors"}
                    disabled={loading}
                  >
                    <Bookmark className="w-3 h-3" />
                    <span>{preset.name}</span>
                  </button>
                ))}
            </div>
          </div>
        </div>
      </div>

      {/* 고급 필터 섹션 */}
      {isAdvancedOpen && (
        <div className="p-4 border-b border-gray-200 dark:border-dark-600 bg-gray-50 dark:bg-dark-700">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* 날짜 범위 */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-dark-300">
              <Calendar className="w-4 h-4 inline mr-1" />
              시작일
            </label>
            <input
              type="date"
              value={filter.payment_date_from || ''}
              onChange={e => handleFilterChange('payment_date_from', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 bg-white dark:bg-dark-700 text-gray-900 dark:text-dark-100 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-dark-300">
              <Calendar className="w-4 h-4 inline mr-1" />
              종료일
            </label>
            <input
              type="date"
              value={filter.payment_date_to || ''}
              onChange={e => handleFilterChange('payment_date_to', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 bg-white dark:bg-dark-700 text-gray-900 dark:text-dark-100 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* 결제 유형 */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-dark-300">
              <Package className="w-4 h-4 inline mr-1" />
              결제 유형
            </label>
            <select
              value={filter.payment_type ?? ''}
              onChange={e =>
                handleFilterChange('payment_type', e.target.value ? e.target.value : undefined)
              }
              className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 bg-white dark:bg-dark-700 text-gray-900 dark:text-dark-100 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">전체</option>
              <option value="membership">회원권</option>
              <option value="pt">PT</option>
              <option value="other">기타</option>
            </select>
          </div>

          {/* 결제 방식 */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-dark-300">
              <CreditCard className="w-4 h-4 inline mr-1" />
              결제 방식
            </label>
            <select
              value={filter.payment_method ?? ''}
              onChange={e =>
                handleFilterChange('payment_method', e.target.value ? e.target.value : undefined)
              }
              className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 bg-white dark:bg-dark-700 text-gray-900 dark:text-dark-100 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">전체</option>
              <option value="현금">현금</option>
              <option value="카드">카드</option>
              <option value="계좌이체">계좌이체</option>
              <option value="기타">기타</option>
            </select>
          </div>

          {/* 담당 직원 */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-dark-300">
              <User className="w-4 h-4 inline mr-1" />
              담당 직원
            </label>
            <select
              value={filter.staff_id || ''}
              onChange={e =>
                handleFilterChange(
                  'staff_id',
                  e.target.value ? parseInt(e.target.value) : undefined
                )
              }
              className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 bg-white dark:bg-dark-700 text-gray-900 dark:text-dark-100 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            <label className="block text-sm font-medium text-gray-700 dark:text-dark-300">
              상태
            </label>
            <select
              value={filter.status ?? ''}
              onChange={e => handleFilterChange('status', e.target.value ? e.target.value : undefined)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 bg-white dark:bg-dark-700 text-gray-900 dark:text-dark-100 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">전체</option>
              <option value="completed">완료</option>
              <option value="refunded">환불</option>
              <option value="cancelled">취소</option>
              <option value="pending">대기</option>
            </select>
          </div>

          {/* 금액 범위 */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-dark-300">
              최소 금액
            </label>
            <input
              type="number"
              placeholder="0"
              value={filter.amount_min || ''}
              onChange={e =>
                handleFilterChange(
                  'amount_min',
                  e.target.value ? parseInt(e.target.value) : undefined
                )
              }
              className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 bg-white dark:bg-dark-700 text-gray-900 dark:text-dark-100 placeholder-gray-400 dark:placeholder-dark-400 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-dark-300">
              최대 금액
            </label>
            <input
              type="number"
              placeholder="∞"
              value={filter.amount_max || ''}
              onChange={e =>
                handleFilterChange(
                  'amount_max',
                  e.target.value ? parseInt(e.target.value) : undefined
                )
              }
              className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 bg-white dark:bg-dark-700 text-gray-900 dark:text-dark-100 placeholder-gray-400 dark:placeholder-dark-400 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          {/* grid wrapper end */}
          </div>
        </div>
      )}

      {/* 예시 렌더링 제거됨 */}

      {/* 로딩 인디케이터 */}
      {loading && (
        <div className="flex items-center justify-center py-2">
          <RefreshCw className="w-4 h-4 animate-spin text-blue-600 mr-2" />
          <span className="text-sm text-gray-600 dark:text-dark-400">검색 중...</span>
        </div>
      )}

      {/* 활성 필터 표시 */}
      {getActiveFilterCount() > 0 && !isAdvancedOpen && (
        <div className="flex flex-wrap gap-2 p-4 border-t border-gray-200 dark:border-dark-600">
          <span className="text-xs text-gray-500 dark:text-dark-400">활성 필터:</span>
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
          {filter.payment_type && (
            <span className="inline-flex items-center px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
              유형:{' '}
              {filter.payment_type === 'membership'
                ? '회원권'
                : filter.payment_type === 'pt'
                  ? 'PT'
                  : '기타'}
              <button
                onClick={() => handleFilterChange('payment_type', undefined)}
                className="ml-1 text-green-600 hover:text-green-800"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {filter.status && (
            <span className="inline-flex items-center px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded-full">
              상태:{' '}
              {filter.status === 'completed'
                ? '완료'
                : filter.status === 'refunded'
                  ? '환불'
                  : filter.status === 'cancelled'
                    ? '취소'
                    : '대기'}
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
