import React, { useState, useEffect } from 'react';
import { Search, Filter, ChevronDown, RotateCcw, Bookmark } from 'lucide-react';
import { MemberSearchFilter, FilterPreset } from '../../types/member';

interface MemberSearchFilterProps {
  filter: MemberSearchFilter;
  onFilterChange: (filter: MemberSearchFilter) => void;
  onReset: () => void;
  memberCount: number;
  loading?: boolean;
}

const MemberSearchFilterComponent: React.FC<MemberSearchFilterProps> = ({
  filter,
  onFilterChange,
  onReset,
  memberCount,
  loading = false,
}) => {
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const [searchDebounce, setSearchDebounce] = useState<NodeJS.Timeout | null>(null);

  // 필터 프리셋
  const filterPresets: FilterPreset[] = [
    {
      id: 'all',
      name: '전체 회원',
      filter: {},
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
      id: 'new_members',
      name: '신규 회원 (30일)',
      filter: {
        join_date_from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
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
  const updateFilter = (updates: Partial<MemberSearchFilter>) => {
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
    if (filter.active !== undefined && filter.active !== 'all') count++;
    if (filter.join_date_from || filter.join_date_to) count++;
    if (filter.birth_date_from || filter.birth_date_to) count++;
    if (filter.has_phone !== undefined) count++;
    if (filter.has_email !== undefined) count++;
    if (filter.age_min || filter.age_max) count++;
    return count;
  };

  const activeFilterCount = getActiveFilterCount();

  useEffect(() => {
    return () => {
      if (searchDebounce) {
        clearTimeout(searchDebounce);
      }
    };
  }, [searchDebounce]);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      {/* 기본 검색 바 */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex flex-col lg:flex-row lg:items-center gap-4">
          {/* 검색 입력 */}
          <div className="flex-1 relative">
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input
              type="text"
              placeholder="회원 이름, 전화번호, 이메일로 검색..."
              defaultValue={filter.search || ''}
              onChange={e => handleSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              disabled={loading}
            />
          </div>

          {/* 필터 토글 및 초기화 버튼 */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
              className={`flex items-center gap-2 px-4 py-3 border rounded-lg transition-colors ${
                isAdvancedOpen || activeFilterCount > 0
                  ? 'bg-blue-50 border-blue-500 text-blue-700'
                  : 'border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
              disabled={loading}
            >
              <Filter className="w-5 h-5" />
              <span>고급 필터</span>
              {activeFilterCount > 0 && (
                <span className="bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
              <ChevronDown
                className={`w-4 h-4 transition-transform ${isAdvancedOpen ? 'rotate-180' : ''}`}
              />
            </button>

            {activeFilterCount > 0 && (
              <button
                onClick={onReset}
                className="flex items-center gap-2 px-4 py-3 text-gray-600 hover:text-gray-800 transition-colors"
                disabled={loading}
              >
                <RotateCcw className="w-4 h-4" />
                <span className="hidden sm:inline">초기화</span>
              </button>
            )}
          </div>
        </div>

        {/* 결과 카운트 */}
        <div className="mt-4 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent"></div>
                <span>검색 중...</span>
              </div>
            ) : (
              <span>
                총{' '}
                <span className="font-semibold text-gray-900">
                  {memberCount.toLocaleString()}명
                </span>
                의 회원이 검색되었습니다
              </span>
            )}
          </div>

          {/* 빠른 필터 프리셋 */}
          <div className="hidden lg:flex items-center gap-2">
            {filterPresets.map(preset => (
              <button
                key={preset.id}
                onClick={() => applyPreset(preset)}
                className={`flex items-center gap-1 px-3 py-1 text-xs rounded-full transition-colors ${
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
        <div className="p-6 border-b border-gray-200 bg-gray-50">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {/* 성별 필터 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">성별</label>
              <select
                value={filter.gender || ''}
                onChange={e => updateFilter({ gender: e.target.value as '남성' | '여성' | '' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={loading}
              >
                <option value="">전체</option>
                <option value="남성">남성</option>
                <option value="여성">여성</option>
              </select>
            </div>

            {/* 활성 상태 필터 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">회원 상태</label>
              <select
                value={filter.active === true ? 'true' : filter.active === false ? 'false' : 'all'}
                onChange={e => {
                  const value = e.target.value;
                  updateFilter({
                    active: value === 'all' ? 'all' : value === 'true' ? true : false,
                  });
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={loading}
              >
                <option value="all">전체</option>
                <option value="true">활성</option>
                <option value="false">비활성</option>
              </select>
            </div>

            {/* 가입일 범위 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">가입일 (시작)</label>
              <input
                type="date"
                value={filter.join_date_from || ''}
                onChange={e => updateFilter({ join_date_from: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">가입일 (종료)</label>
              <input
                type="date"
                value={filter.join_date_to || ''}
                onChange={e => updateFilter({ join_date_to: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={loading}
              />
            </div>

            {/* 생년월일 범위 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                생년월일 (시작)
              </label>
              <input
                type="date"
                value={filter.birth_date_from || ''}
                onChange={e => updateFilter({ birth_date_from: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                생년월일 (종료)
              </label>
              <input
                type="date"
                value={filter.birth_date_to || ''}
                onChange={e => updateFilter({ birth_date_to: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={loading}
              />
            </div>

            {/* 나이 범위 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">최소 나이</label>
              <input
                type="number"
                value={filter.age_min || ''}
                onChange={e =>
                  updateFilter({ age_min: e.target.value ? parseInt(e.target.value) : undefined })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="예: 20"
                min="0"
                max="100"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">최대 나이</label>
              <input
                type="number"
                value={filter.age_max || ''}
                onChange={e =>
                  updateFilter({ age_max: e.target.value ? parseInt(e.target.value) : undefined })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="예: 50"
                min="0"
                max="100"
                disabled={loading}
              />
            </div>
          </div>

          {/* 체크박스 필터 */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filter.has_phone === true}
                onChange={e => updateFilter({ has_phone: e.target.checked ? true : undefined })}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                disabled={loading}
              />
              <span className="text-sm text-gray-700">전화번호 있음</span>
            </label>

            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filter.has_email === true}
                onChange={e => updateFilter({ has_email: e.target.checked ? true : undefined })}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                disabled={loading}
              />
              <span className="text-sm text-gray-700">이메일 있음</span>
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
              <span className="text-sm text-gray-700">회원권 보유</span>
            </label>
          </div>

          {/* 모바일용 빠른 필터 */}
          <div className="mt-6 lg:hidden">
            <label className="block text-sm font-medium text-gray-700 mb-2">빠른 필터</label>
            <div className="flex flex-wrap gap-2">
              {filterPresets.map(preset => (
                <button
                  key={preset.id}
                  onClick={() => applyPreset(preset)}
                  className={`flex items-center gap-1 px-3 py-2 text-sm rounded-lg transition-colors ${
                    JSON.stringify(filter) === JSON.stringify(preset.filter)
                      ? 'bg-blue-100 text-blue-700 border border-blue-300'
                      : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-300'
                  }`}
                  disabled={loading}
                >
                  <Bookmark className="w-4 h-4" />
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
