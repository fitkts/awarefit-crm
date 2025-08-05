import { Bookmark, ChevronDown, Filter, Plus, RefreshCw, RotateCcw, Search } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { StaffRole, StaffSearchFilter } from '../../types/staff';

// 필터 프리셋 타입
interface FilterPreset {
  id: string;
  name: string;
  filter: StaffSearchFilter;
  icon: string;
}

interface StaffSearchFilterProps {
  filter: StaffSearchFilter;
  onFilterChange: (filter: StaffSearchFilter) => void;
  onReset: () => void;
  staffCount: number;
  loading?: boolean;
  onRefresh: () => void;
  onAddStaff: () => void;
}

const StaffSearchFilterComponent: React.FC<StaffSearchFilterProps> = ({
  filter,
  onFilterChange,
  onReset,
  staffCount,
  loading = false,
  onRefresh,
  onAddStaff,
}) => {
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const [searchDebounce, setSearchDebounce] = useState<NodeJS.Timeout | null>(null);
  const [roles, setRoles] = useState<StaffRole[]>([]);

  // 역할 목록 조회
  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const result = await window.electronAPI.database.staffRole.getAll();
        setRoles(result);
      } catch (error) {
        console.error('역할 목록 조회 실패:', error);
        setRoles([]);
      }
    };

    fetchRoles();
  }, []);

  // 필터 프리셋
  const filterPresets: FilterPreset[] = [
    {
      id: 'all',
      name: '전체 직원',
      filter: {},
      icon: 'Users',
    },
    {
      id: 'active',
      name: '활성 직원',
      filter: { is_active: true },
      icon: 'UserCheck',
    },
    {
      id: 'inactive',
      name: '비활성 직원',
      filter: { is_active: false },
      icon: 'UserX',
    },
    {
      id: 'managers',
      name: '매니저',
      filter: { position: '매니저' },
      icon: 'Crown',
    },
    {
      id: 'trainers',
      name: '트레이너',
      filter: { position: '트레이너' },
      icon: 'Dumbbell',
    },
    {
      id: 'new_staff',
      name: '신규 직원 (30일)',
      filter: {
        hire_date_from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      },
      icon: 'Calendar',
    },
    {
      id: 'no_contact',
      name: '연락처 미등록',
      filter: { has_phone: false },
      icon: 'X',
    },
  ];

  // 검색어 디바운스 처리
  const handleSearchChange = (value: string) => {
    if (searchDebounce) {
      clearTimeout(searchDebounce);
    }

    const timeout = setTimeout(() => {
      onFilterChange({ ...filter, search: value });
    }, 300);

    setSearchDebounce(timeout);
  };

  // 필터 업데이트 핸들러
  const updateFilter = (updates: Partial<StaffSearchFilter>) => {
    onFilterChange({ ...filter, ...updates });
  };

  // 프리셋 적용
  const applyPreset = (preset: FilterPreset) => {
    onFilterChange(preset.filter);
  };

  // 활성 필터 개수 계산
  const getActiveFilterCount = () => {
    let count = 0;
    if (filter.search) count++;
    if (filter.gender) count++;
    if (filter.position) count++;
    if (filter.department) count++;
    if (filter.role_id && filter.role_id !== 'all') count++;
    if (filter.is_active !== undefined && filter.is_active !== 'all') count++;
    if (filter.hire_date_from || filter.hire_date_to) count++;
    if (filter.birth_date_from || filter.birth_date_to) count++;
    if (filter.salary_min || filter.salary_max) count++;
    if (filter.has_phone !== undefined) count++;
    if (filter.has_email !== undefined) count++;
    if (filter.age_min || filter.age_max) count++;
    return count;
  };

  const activeFilterCount = getActiveFilterCount();

  // 컴포넌트 언마운트 시 디바운스 정리
  useEffect(() => {
    return () => {
      if (searchDebounce) {
        clearTimeout(searchDebounce);
      }
    };
  }, [searchDebounce]);

  return (
    <div className="bg-white dark:bg-dark-800 rounded-lg shadow-sm border border-gray-200 dark:border-dark-600 sticky top-4 z-20">
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
                placeholder="이름, 연락처, 직원번호 검색..."
                onChange={e => handleSearchChange(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 text-sm border border-gray-300 dark:border-dark-600 bg-white dark:bg-dark-700 dark:text-dark-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={loading}
              />
            </div>

            {/* 고급 필터 토글 */}
            <button
              onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
              className={`flex items-center gap-2 px-3 py-2 text-sm border rounded-lg transition-colors ${
                isAdvancedOpen || activeFilterCount > 0
                  ? 'bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-700'
                  : 'bg-white dark:bg-dark-800 text-gray-700 dark:text-dark-300 border-gray-300 dark:border-dark-600 hover:bg-gray-50 dark:hover:bg-dark-700'
              }`}
              disabled={loading}
            >
              <Filter className="w-4 h-4" />
              <span>고급 필터</span>
              {activeFilterCount > 0 && (
                <span className="bg-blue-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
              <ChevronDown
                className={`w-4 h-4 transition-transform ${isAdvancedOpen ? 'rotate-180' : ''}`}
              />
            </button>

            {/* 초기화 버튼 */}
            {activeFilterCount > 0 && (
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
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>

            {/* 직원 추가 */}
            <button
              onClick={onAddStaff}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
              disabled={loading}
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">직원 추가</span>
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
                총{' '}
                <span className="font-semibold text-gray-900 dark:text-dark-100">{staffCount.toLocaleString()}명</span>
                의 직원
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
                    ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 border border-blue-300 dark:border-blue-700'
                    : 'bg-gray-100 dark:bg-dark-700 text-gray-600 dark:text-dark-400 hover:bg-gray-200 dark:hover:bg-dark-600'
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
        <div className="p-4 border-b border-gray-200 dark:border-dark-600 bg-gray-50 dark:bg-dark-700">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {/* 성별 필터 */}
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-dark-300 mb-1">성별</label>
              <select
                value={filter.gender || ''}
                onChange={e => updateFilter({ gender: e.target.value as '남성' | '여성' | '' })}
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-dark-600 bg-white dark:bg-dark-800 dark:text-dark-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={loading}
              >
                <option value="">전체</option>
                <option value="남성">남성</option>
                <option value="여성">여성</option>
              </select>
            </div>

            {/* 직책 필터 */}
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-dark-300 mb-1">직책</label>
              <select
                value={filter.position || ''}
                onChange={e => updateFilter({ position: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-dark-600 bg-white dark:bg-dark-800 dark:text-dark-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={loading}
              >
                <option value="">전체</option>
                <option value="매니저">매니저</option>
                <option value="트레이너">트레이너</option>
                <option value="데스크">데스크</option>
                <option value="청소">청소</option>
                <option value="기타">기타</option>
              </select>
            </div>

            {/* 부서 필터 */}
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-dark-300 mb-1">부서</label>
              <select
                value={filter.department || ''}
                onChange={e => updateFilter({ department: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-dark-600 bg-white dark:bg-dark-800 dark:text-dark-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={loading}
              >
                <option value="">전체</option>
                <option value="운영팀">운영팀</option>
                <option value="트레이닝팀">트레이닝팀</option>
                <option value="고객서비스팀">고객서비스팀</option>
                <option value="시설관리팀">시설관리팀</option>
              </select>
            </div>

            {/* 역할 필터 */}
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-dark-300 mb-1">역할</label>
              <select
                value={filter.role_id === 'all' ? 'all' : filter.role_id?.toString() || ''}
                onChange={e => {
                  const value = e.target.value;
                  updateFilter({
                    role_id: value === '' ? undefined : value === 'all' ? 'all' : parseInt(value),
                  });
                }}
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-dark-600 bg-white dark:bg-dark-800 dark:text-dark-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={loading}
              >
                <option value="">전체</option>
                {roles.map(role => (
                  <option key={role.id} value={role.id.toString()}>
                    {role.name}
                  </option>
                ))}
              </select>
            </div>

            {/* 활성 상태 필터 */}
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-dark-300 mb-1">직원 상태</label>
              <select
                value={
                  filter.is_active === true ? 'true' : filter.is_active === false ? 'false' : 'all'
                }
                onChange={e => {
                  const value = e.target.value;
                  updateFilter({
                    is_active: value === 'all' ? 'all' : value === 'true' ? true : false,
                  });
                }}
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-dark-600 bg-white dark:bg-dark-800 dark:text-dark-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={loading}
              >
                <option value="all">전체</option>
                <option value="true">활성</option>
                <option value="false">비활성</option>
              </select>
            </div>

            {/* 입사일 범위 */}
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-dark-300 mb-1">입사일 (시작)</label>
              <input
                type="date"
                value={filter.hire_date_from || ''}
                onChange={e => updateFilter({ hire_date_from: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-dark-600 bg-white dark:bg-dark-800 dark:text-dark-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-dark-300 mb-1">입사일 (종료)</label>
              <input
                type="date"
                value={filter.hire_date_to || ''}
                onChange={e => updateFilter({ hire_date_to: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-dark-600 bg-white dark:bg-dark-800 dark:text-dark-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={loading}
              />
            </div>

            {/* 급여 범위 */}
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-dark-300 mb-1">
                최소 급여 (만원)
              </label>
              <input
                type="number"
                placeholder="예: 200"
                value={filter.salary_min || ''}
                onChange={e =>
                  updateFilter({
                    salary_min: e.target.value ? parseInt(e.target.value) * 10000 : undefined,
                  })
                }
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-dark-600 bg-white dark:bg-dark-800 dark:text-dark-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-dark-300 mb-1">
                최대 급여 (만원)
              </label>
              <input
                type="number"
                placeholder="예: 500"
                value={filter.salary_max || ''}
                onChange={e =>
                  updateFilter({
                    salary_max: e.target.value ? parseInt(e.target.value) * 10000 : undefined,
                  })
                }
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-dark-600 bg-white dark:bg-dark-800 dark:text-dark-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={loading}
              />
            </div>

            {/* 생년월일 범위 */}
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-dark-300 mb-1">
                생년월일 (시작)
              </label>
              <input
                type="date"
                value={filter.birth_date_from || ''}
                onChange={e => updateFilter({ birth_date_from: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-dark-600 bg-white dark:bg-dark-800 dark:text-dark-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-dark-300 mb-1">
                생년월일 (종료)
              </label>
              <input
                type="date"
                value={filter.birth_date_to || ''}
                onChange={e => updateFilter({ birth_date_to: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-dark-600 bg-white dark:bg-dark-800 dark:text-dark-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={loading}
              />
            </div>

            {/* 나이 범위 */}
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-dark-300 mb-1">최소 나이</label>
              <input
                type="number"
                placeholder="예: 20"
                value={filter.age_min || ''}
                onChange={e =>
                  updateFilter({ age_min: e.target.value ? parseInt(e.target.value) : undefined })
                }
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-dark-600 bg-white dark:bg-dark-800 dark:text-dark-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-dark-300 mb-1">최대 나이</label>
              <input
                type="number"
                placeholder="예: 65"
                value={filter.age_max || ''}
                onChange={e =>
                  updateFilter({ age_max: e.target.value ? parseInt(e.target.value) : undefined })
                }
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-dark-600 bg-white dark:bg-dark-800 dark:text-dark-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={loading}
              />
            </div>

            {/* 연락처 필터 */}
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-dark-300 mb-1">연락처</label>
              <select
                value={
                  filter.has_phone === true ? 'true' : filter.has_phone === false ? 'false' : ''
                }
                onChange={e => {
                  const value = e.target.value;
                  updateFilter({
                    has_phone: value === '' ? undefined : value === 'true' ? true : false,
                  });
                }}
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-dark-600 bg-white dark:bg-dark-800 dark:text-dark-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={loading}
              >
                <option value="">전체</option>
                <option value="true">등록됨</option>
                <option value="false">미등록</option>
              </select>
            </div>

            {/* 이메일 필터 */}
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-dark-300 mb-1">이메일</label>
              <select
                value={
                  filter.has_email === true ? 'true' : filter.has_email === false ? 'false' : ''
                }
                onChange={e => {
                  const value = e.target.value;
                  updateFilter({
                    has_email: value === '' ? undefined : value === 'true' ? true : false,
                  });
                }}
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-dark-600 bg-white dark:bg-dark-800 dark:text-dark-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={loading}
              >
                <option value="">전체</option>
                <option value="true">등록됨</option>
                <option value="false">미등록</option>
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffSearchFilterComponent;
