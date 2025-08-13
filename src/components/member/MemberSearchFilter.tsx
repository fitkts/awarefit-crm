import { Bookmark, ChevronDown, Filter, Plus, RefreshCw, RotateCcw, Search } from '@/utils/lucide-shim';
import React, { useEffect, useState } from 'react';
import { FilterPreset, MemberSearchFilter } from '../../types/member';

interface MemberSearchFilterProps {
  filter: MemberSearchFilter;
  onFilterChange: (filter: MemberSearchFilter) => void;
  onReset: () => void;
  memberCount: number;
  loading?: boolean;
  onRefresh: () => void;
  onAddMember: () => void;
}

const MemberSearchFilterComponent: React.FC<MemberSearchFilterProps> = ({
  filter,
  onFilterChange,
  onReset,
  memberCount,
  loading = false,
  onRefresh,
  onAddMember,
}) => {
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const MIN_SEARCH_LENGTH = 1;
  const [searchInput, setSearchInput] = useState<string>(filter.search || '');
  const [staffList, setStaffList] = useState<Array<{ id: number; name: string; position: string }>>(
    []
  );

  // 날짜 생성 헬퍼 함수들
  const getCurrentMonthDateRange = () => {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    return {
      from: firstDay.toISOString().split('T')[0],
      to: lastDay.toISOString().split('T')[0],
    };
  };

  const getAnniversaryDateRange = () => {
    const now = new Date();
    const oneYearAgo = new Date(now.getFullYear() - 1, now.getMonth(), 1);
    const oneYearAgoLastDay = new Date(now.getFullYear() - 1, now.getMonth() + 1, 0);

    return {
      from: oneYearAgo.toISOString().split('T')[0],
      to: oneYearAgoLastDay.toISOString().split('T')[0],
    };
  };

  // 필터 프리셋
  const filterPresets: FilterPreset[] = [
    {
      id: 'all',
      name: '전체 회원',
      filter: { active: 'all' },
      icon: 'Users',
    },
    {
      id: 'active',
      name: '활성 회원',
      filter: { active: true },
      icon: 'UserCheck',
    },
    {
      id: 'inactive',
      name: '비활성 회원',
      filter: { active: false },
      icon: 'UserX',
    },
    {
      id: 'birthday_this_month',
      name: '이번달 생일',
      filter: (() => {
        const dateRange = getCurrentMonthDateRange();
        return {
          birth_date_from: dateRange.from,
          birth_date_to: dateRange.to,
        };
      })(),
      icon: 'Calendar',
    },
    {
      id: 'anniversary_this_month',
      name: '가입 1주년',
      filter: (() => {
        const dateRange = getAnniversaryDateRange();
        return {
          join_date_from: dateRange.from,
          join_date_to: dateRange.to,
        };
      })(),
      icon: 'Award',
    },
  ];

  // 외부에서 필터가 변경되면 입력값 동기화
  useEffect(() => {
    setSearchInput(filter.search || '');
  }, [filter.search]);

  // 자동검색 제거: 입력값만 업데이트
  const handleSearchChange = (value: string) => {
    setSearchInput(value);
  };

  // Enter 검색 / ESC 클리어
  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const value = e.currentTarget.value.trim();
      if (value.length === 0 || value.length < MIN_SEARCH_LENGTH) {
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

  // 필터 업데이트 핸들러
  const updateFilter = (updates: Partial<MemberSearchFilter>) => {
    onFilterChange({ ...filter, ...updates });
  };

  // 프리셋 적용
  const applyPreset = (preset: FilterPreset) => {
    console.log('🔍 [MemberSearchFilter] 프리셋 적용:', preset.name);
    console.log('🔍 [MemberSearchFilter] 프리셋 필터:', preset.filter);

    onFilterChange(preset.filter);
  };

  // 활성 필터 개수 계산
  const getActiveFilterCount = () => {
    let count = 0;
    if (filter.search) count++;
    if (filter.gender) count++;
    if (filter.active !== undefined && filter.active !== 'all') count++;
    if (filter.join_date_from || filter.join_date_to) count++;
    if (filter.birth_date_from || filter.birth_date_to) count++;
    if (filter.has_phone !== undefined) count++;
    if (filter.has_email !== undefined) count++;
    if (filter.has_membership !== undefined) count++;
    if (filter.age_min || filter.age_max) count++;
    if (filter.assigned_staff_id && filter.assigned_staff_id !== 'all') count++;
    return count;
  };

  const activeFilterCount = getActiveFilterCount();

  // 직원 목록 로드
  useEffect(() => {
    const loadStaff = async () => {
      try {
        if (window.electronAPI?.database?.staff?.getAll) {
          const result = await window.electronAPI.database.staff.getAll({ is_active: true });
          setStaffList(
            result.map((staff: any) => ({
              id: staff.id,
              name: staff.name,
              position: staff.position,
            }))
          );
        }
      } catch (error) {
        console.error('직원 목록 로드 실패:', error);
      }
    };

    loadStaff();
  }, []);

  // 자동검색 제거됨: 디바운스 정리 불필요

  return (
    <div className="bg-white dark:bg-dark-800 rounded-lg shadow-sm border border-gray-200 dark:border-dark-600 sticky top-0 z-30">
      {/* 기본 검색 바 */}
      <div className="p-4 border-b border-gray-200 dark:border-dark-600">
        <div className="flex flex-col lg:flex-row lg:items-center gap-3">
          {/* 검색 입력 - 크기 50% 축소 */}
          <div className="lg:w-96 relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input
              type="text"
              placeholder="회원 이름, 전화번호, 이메일 검색"
              value={searchInput}
              onChange={e => handleSearchChange(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 dark:border-dark-600 bg-white dark:bg-dark-700 dark:text-dark-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              disabled={loading}
            />
          </div>

          {/* 가운데 여백 */}
          <div className="flex-1" />

          {/* 오른쪽 액션 버튼들 */}
          <div className="flex items-center gap-2">
            {/* 필터 토글 */}
            <button
              onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
              className={`flex items-center gap-1.5 px-3 py-2 text-sm border rounded-lg transition-colors ${
                isAdvancedOpen || activeFilterCount > 0
                  ? 'bg-blue-50 border-blue-500 text-blue-700'
                  : 'border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
              disabled={loading}
            >
              <Filter className="w-4 h-4" />
              <span>필터</span>
              {activeFilterCount > 0 && (
                <span className="bg-blue-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
              <ChevronDown
                className={`w-3 h-3 transition-transform ${isAdvancedOpen ? 'rotate-180' : ''}`}
              />
            </button>

            {/* 초기화 버튼 */}
            {activeFilterCount > 0 && (
              <button
                onClick={onReset}
                className="flex items-center gap-1.5 px-3 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
                disabled={loading}
              >
                <RotateCcw className="w-3 h-3" />
                <span className="hidden sm:inline">초기화</span>
              </button>
            )}

            {/* 새로고침 버튼 - 작게 */}
            <button
              onClick={onRefresh}
              className="flex items-center gap-1.5 px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              disabled={loading}
            >
              <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">새로고침</span>
            </button>

            {/* 신규 등록 버튼 */}
            <button
              onClick={onAddMember}
              className="flex items-center gap-1.5 px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>신규등록</span>
            </button>
          </div>
        </div>

        {/* 결과 카운트 */}
        <div className="mt-3 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-3 w-3 border-2 border-blue-600 border-t-transparent"></div>
                <span>검색 중...</span>
              </div>
            ) : (
              <span>
                총{' '}
                <span className="font-semibold text-gray-900">
                  {memberCount.toLocaleString()}명
                </span>
                의 회원
              </span>
            )}
          </div>

          {/* 빠른 필터 프리셋 */}
          <div className="hidden lg:flex items-center gap-2">
            {filterPresets.map(preset => (
              <button
                key={preset.id}
                onClick={() => applyPreset(preset)}
                className={`flex items-center gap-1 px-2 py-1 text-xs rounded-full transition-colors ${
                  JSON.stringify(filter) === JSON.stringify(preset.filter)
                    ? 'bg-blue-100 text-blue-700 border border-blue-300'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
                disabled={loading}
              >
                <Bookmark className="w-3 h-3" />
                <span>{preset.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 고급 필터 패널 */}
      {isAdvancedOpen && (
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {/* 성별 필터 */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">성별</label>
              <select
                value={filter.gender || ''}
                onChange={e => updateFilter({ gender: e.target.value as '남성' | '여성' | '' })}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={loading}
              >
                <option value="">전체</option>
                <option value="남성">남성</option>
                <option value="여성">여성</option>
              </select>
            </div>

            {/* 활성 상태 필터 */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">회원 상태</label>
              <select
                value={filter.active === true ? 'true' : filter.active === false ? 'false' : 'all'}
                onChange={e => {
                  const value = e.target.value;
                  updateFilter({
                    active: value === 'all' ? 'all' : value === 'true' ? true : false,
                  });
                }}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={loading}
              >
                <option value="all">전체</option>
                <option value="true">활성</option>
                <option value="false">비활성</option>
              </select>
            </div>

            {/* 가입일 범위 */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">가입일 (시작)</label>
              <input
                type="date"
                value={filter.join_date_from || ''}
                onChange={e => updateFilter({ join_date_from: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">가입일 (종료)</label>
              <input
                type="date"
                value={filter.join_date_to || ''}
                onChange={e => updateFilter({ join_date_to: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={loading}
              />
            </div>

            {/* 생년월일 범위 */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                생년월일 (시작)
              </label>
              <input
                type="date"
                value={filter.birth_date_from || ''}
                onChange={e => updateFilter({ birth_date_from: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                생년월일 (종료)
              </label>
              <input
                type="date"
                value={filter.birth_date_to || ''}
                onChange={e => updateFilter({ birth_date_to: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={loading}
              />
            </div>

            {/* 나이 범위 */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">최소 나이</label>
              <input
                type="number"
                value={filter.age_min || ''}
                onChange={e =>
                  updateFilter({ age_min: e.target.value ? parseInt(e.target.value) : undefined })
                }
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="예: 20"
                min="0"
                max="100"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">최대 나이</label>
              <input
                type="number"
                value={filter.age_max || ''}
                onChange={e =>
                  updateFilter({ age_max: e.target.value ? parseInt(e.target.value) : undefined })
                }
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="예: 50"
                min="0"
                max="100"
                disabled={loading}
              />
            </div>

            {/* 담당직원 필터 */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">담당직원</label>
              <select
                value={filter.assigned_staff_id || 'all'}
                onChange={e =>
                  updateFilter({
                    assigned_staff_id: e.target.value === 'all' ? undefined : e.target.value,
                  })
                }
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={loading}
              >
                <option value="all">전체</option>
                <option value="unassigned">미배정</option>
                {staffList.map(staff => (
                  <option key={staff.id} value={staff.id.toString()}>
                    {staff.name} ({staff.position})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* 체크박스 필터 */}
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filter.has_phone === true}
                onChange={e => updateFilter({ has_phone: e.target.checked ? true : undefined })}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                disabled={loading}
              />
              <span className="text-xs text-gray-700">전화번호 있음</span>
            </label>

            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filter.has_email === true}
                onChange={e => updateFilter({ has_email: e.target.checked ? true : undefined })}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                disabled={loading}
              />
              <span className="text-xs text-gray-700">이메일 있음</span>
            </label>

            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filter.has_membership === true}
                onChange={e =>
                  updateFilter({ has_membership: e.target.checked ? true : undefined })
                }
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                disabled={loading}
              />
              <span className="text-xs text-gray-700">회원권 보유</span>
            </label>
          </div>

          {/* 모바일용 빠른 필터 */}
          <div className="mt-4 lg:hidden">
            <label className="block text-xs font-medium text-gray-700 mb-2">빠른 필터</label>
            <div className="flex flex-wrap gap-2">
              {filterPresets.map(preset => (
                <button
                  key={preset.id}
                  onClick={() => applyPreset(preset)}
                  className={`flex items-center gap-1 px-2 py-1 text-xs rounded-lg transition-colors ${
                    JSON.stringify(filter) === JSON.stringify(preset.filter)
                      ? 'bg-blue-100 text-blue-700 border border-blue-300'
                      : 'bg-white dark:bg-dark-700 text-gray-600 dark:text-dark-300 hover:bg-gray-50 dark:hover:bg-dark-600 border border-gray-300 dark:border-dark-600'
                  }`}
                  disabled={loading}
                >
                  <Bookmark className="w-3 h-3" />
                  <span>{preset.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MemberSearchFilterComponent;
