import React, { Suspense, useCallback, useEffect, useState } from 'react';
import { useToastHelpers } from '../components/common/Toast';
import {
  CreateStaffInput,
  Staff,
  StaffBulkAction,
  StaffPaginationInfo,
  StaffSearchFilter as StaffSearchFilterType,
  StaffSortOption,
  StaffStats as StaffStatsType,
  UpdateStaffInput,
} from '../types/staff';
import { mockData, safeElectronCall } from '../utils/environmentUtils';
// 코드 스플리팅: 초기 엔트리 최소화를 위해 지연 로딩
const StaffDetailModal = React.lazy(
  () => import(/* webpackChunkName: "staff-detail-modal" */ '../components/staff/StaffDetailModal')
);
const StaffForm = React.lazy(
  () => import(/* webpackChunkName: "staff-form" */ '../components/staff/StaffForm')
);
const StaffSearchFilter = React.lazy(
  () =>
    import(/* webpackChunkName: "staff-search-filter" */ '../components/staff/StaffSearchFilter')
);
const StaffStats = React.lazy(
  () => import(/* webpackChunkName: "staff-stats" */ '../components/staff/StaffStats')
);
const StaffTable = React.lazy(
  () => import(/* webpackChunkName: "staff-table" */ '../components/staff/StaffTable')
);

const StaffPage: React.FC = () => {
  // 상태 관리
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [searchFilter, setSearchFilter] = useState<StaffSearchFilterType>({});
  const [sortOption, setSortOption] = useState<StaffSortOption>({
    field: 'hire_date',
    direction: 'desc',
  });
  const [pagination, setPagination] = useState<StaffPaginationInfo>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false,
  });

  // 모달 및 폼 상태
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<Staff | undefined>(undefined);
  const [viewingStaff, setViewingStaff] = useState<Staff | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  // 일괄 작업 상태
  const [selectedStaff, setSelectedStaff] = useState<number[]>([]);

  // 통계 데이터
  const [staffStats, setStaffStats] = useState<StaffStatsType>({
    total: 0,
    active: 0,
    inactive: 0,
    new_this_month: 0,
    by_position: {},
    by_department: {},
    by_role: {},
    average_tenure_months: 0,
    total_salary_cost: 0,
    average_salary: 0,
  });

  // 에러 상태
  const [error, setError] = useState<string | null>(null);

  // 토스트 알림 훅
  const { showSuccess, showError } = useToastHelpers();

  // 컴포넌트 마운트 시 데이터 로드
  useEffect(() => {
    loadInitialData();
  }, []);

  // 검색 필터나 정렬 옵션 변경 시 직원 목록 다시 로드
  useEffect(() => {
    loadStaff();
  }, [searchFilter, sortOption, pagination.page]);

  // 초기 데이터 로드
  const loadInitialData = async () => {
    await Promise.all([loadStaff(), loadStaffStats()]);
  };

  // 직원 목록 조회
  const loadStaff = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('직원 목록 로딩 시도:', { searchFilter, sortOption });

      const result = await safeElectronCall(
        async () => window.electronAPI.database.staff.getAll(searchFilter),
        mockData.staff,
        undefined
      );

      console.log('직원 목록 조회 결과:', result);

      if (Array.isArray(result.data)) {
        // 정렬 적용
        const sortedStaff = [...result.data].sort((a, b) => {
          const aValue = a[sortOption.field];
          const bValue = b[sortOption.field];

          if (sortOption.direction === 'asc') {
            return aValue > bValue ? 1 : -1;
          } else {
            return aValue < bValue ? 1 : -1;
          }
        });

        setStaff(sortedStaff);

        // 페이지네이션 정보 업데이트 (간단한 클라이언트 사이드 페이지네이션)
        const total = sortedStaff.length;
        const totalPages = Math.ceil(total / pagination.limit);
        setPagination(prev => ({
          ...prev,
          total,
          totalPages,
          hasNext: prev.page < totalPages,
          hasPrev: prev.page > 1,
        }));
      } else {
        console.error('예상치 못한 응답 형식:', result);
        setStaff([]);
      }
    } catch (error) {
      console.error('직원 목록 조회 실패:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      setError(`직원 목록을 불러오는데 실패했습니다: ${errorMessage}`);
      setStaff([]);
    } finally {
      setLoading(false);
    }
  }, [searchFilter, sortOption, pagination.limit]);

  // 직원 통계 조회
  const loadStaffStats = useCallback(async () => {
    try {
      setStatsLoading(true);

      if (!window.electronAPI?.database?.staff?.getStats) {
        throw new Error('통계 API가 사용할 수 없습니다.');
      }

      const stats = await window.electronAPI.database.staff.getStats();
      console.log('직원 통계 조회 결과:', stats);
      setStaffStats(stats);
    } catch (error) {
      console.error('직원 통계 조회 실패:', error);
      // 통계 로딩 실패는 에러로 처리하지 않고 기본값 유지
    } finally {
      setStatsLoading(false);
    }
  }, []);

  // 새로고침
  const handleRefresh = () => {
    loadInitialData();
  };

  // 직원 생성 핸들러
  const handleCreateStaff = async (data: CreateStaffInput) => {
    try {
      setFormLoading(true);
      console.log('직원 생성 시도:', data);

      if (!window.electronAPI?.database?.staff?.create) {
        throw new Error('electronAPI가 사용할 수 없습니다.');
      }

      const result = await window.electronAPI.database.staff.create(data);
      console.log('직원 생성 결과:', result);

      await loadInitialData(); // 목록과 통계 새로고침
      setIsFormOpen(false);

      showSuccess('새 직원이 성공적으로 등록되었습니다.');
    } catch (error) {
      console.error('직원 생성 실패:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      showError(`직원 등록에 실패했습니다: ${errorMessage}`);
      throw error;
    } finally {
      setFormLoading(false);
    }
  };

  // 직원 수정 핸들러
  const handleUpdateStaff = async (data: UpdateStaffInput) => {
    try {
      setFormLoading(true);
      console.log('직원 수정 시도:', data);

      if (!window.electronAPI?.database?.staff?.update) {
        throw new Error('electronAPI가 사용할 수 없습니다.');
      }

      const result = await window.electronAPI.database.staff.update(data.id, data);
      console.log('직원 수정 결과:', result);

      await loadInitialData(); // 목록과 통계 새로고침
      setIsFormOpen(false);
      setEditingStaff(undefined);

      showSuccess('직원 정보가 성공적으로 수정되었습니다.');
    } catch (error) {
      console.error('직원 수정 실패:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      showError(`직원 수정에 실패했습니다: ${errorMessage}`);
      throw error;
    } finally {
      setFormLoading(false);
    }
  };

  // 통합 submit 핸들러
  const handleSubmit = async (data: CreateStaffInput | UpdateStaffInput) => {
    if (editingStaff && 'id' in data) {
      await handleUpdateStaff(data as UpdateStaffInput);
    } else {
      await handleCreateStaff(data as CreateStaffInput);
    }
  };

  // 직원 삭제 핸들러
  const handleDeleteStaff = async (staffMember: Staff) => {
    if (
      !confirm(
        `정말로 "${staffMember.name}" 직원을 삭제하시겠습니까?\n\n이 작업은 되돌릴 수 없습니다.`
      )
    ) {
      return;
    }

    try {
      console.log('직원 삭제 시도:', staffMember);

      if (!window.electronAPI?.database?.staff?.delete) {
        throw new Error('electronAPI가 사용할 수 없습니다.');
      }

      await window.electronAPI.database.staff.delete(staffMember.id);
      await loadInitialData(); // 목록과 통계 새로고침
      setSelectedStaff(prev => prev.filter(id => id !== staffMember.id));

      showSuccess(`"${staffMember.name}" 직원이 성공적으로 삭제되었습니다.`);
    } catch (error) {
      console.error('직원 삭제 실패:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      showError(`직원 삭제에 실패했습니다: ${errorMessage}`);
    }
  };

  // 직원 상세보기
  const handleViewStaff = (staffMember: Staff) => {
    setViewingStaff(staffMember);
    setIsDetailModalOpen(true);
  };

  // 직원 수정 모드 열기
  const openEditMode = (staffMember: Staff) => {
    setEditingStaff(staffMember);
    setIsFormOpen(true);
  };

  // 폼 닫기
  const closeForm = () => {
    setIsFormOpen(false);
    setEditingStaff(undefined);
  };

  // 상세 모달 닫기
  const closeDetailModal = () => {
    setIsDetailModalOpen(false);
    setViewingStaff(null);
  };

  // 검색 필터 변경
  const handleFilterChange = (filter: StaffSearchFilterType) => {
    setSearchFilter(filter);
    setPagination(prev => ({ ...prev, page: 1 })); // 첫 페이지로 리셋
    setSelectedStaff([]); // 선택 초기화
  };

  // 검색 필터 초기화
  const handleFilterReset = () => {
    setSearchFilter({});
    setPagination(prev => ({ ...prev, page: 1 }));
    setSelectedStaff([]);
  };

  // 정렬 변경
  const handleSortChange = (sort: StaffSortOption) => {
    setSortOption(sort);
    setPagination(prev => ({ ...prev, page: 1 }));
    setSelectedStaff([]);
  };

  // 페이지 변경
  const handlePageChange = (page: number) => {
    setPagination(prev => ({ ...prev, page }));
    setSelectedStaff([]);
  };

  // 일괄 작업 처리
  const handleBulkAction = async (action: StaffBulkAction, staffIds: number[]) => {
    if (staffIds.length === 0) {
      showError('선택된 직원이 없습니다.');
      return;
    }

    try {
      console.log('일괄 작업 시도:', { action, staffIds });

      switch (action) {
        case 'activate':
          // TODO: 일괄 활성화 API 구현
          showSuccess(`${staffIds.length}명의 직원이 활성화되었습니다.`);
          break;
        case 'deactivate':
          // TODO: 일괄 비활성화 API 구현
          showSuccess(`${staffIds.length}명의 직원이 비활성화되었습니다.`);
          break;
        case 'delete':
          if (confirm(`정말로 선택된 ${staffIds.length}명의 직원을 삭제하시겠습니까?`)) {
            // TODO: 일괄 삭제 API 구현
            showSuccess(`${staffIds.length}명의 직원이 삭제되었습니다.`);
          }
          break;
        default:
          showError('지원하지 않는 작업입니다.');
          return;
      }

      await loadInitialData();
      setSelectedStaff([]);
    } catch (error) {
      console.error('일괄 작업 실패:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      showError(`일괄 작업에 실패했습니다: ${errorMessage}`);
    }
  };

  // 신규 등록 핸들러
  const handleAddStaff = () => {
    setIsFormOpen(true);
  };

  return (
    <div className="space-y-4">
      {/* 에러 알림 */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <p className="text-sm text-red-700">{error}</p>
            <button onClick={() => setError(null)} className="text-red-500 hover:text-red-700">
              ×
            </button>
          </div>
        </div>
      )}

      {/* 검색 및 필터 - 최상단 */}
      <Suspense
        fallback={
          <div
            className="p-4 rounded-lg border bg-white/50 dark:bg-gray-800/50 animate-pulse"
            aria-busy
          >
            <div className="h-6 w-48 bg-gray-200 dark:bg-gray-700 rounded mb-3" />
            <div className="h-10 w-full bg-gray-100 dark:bg-gray-700 rounded" />
          </div>
        }
      >
        <StaffSearchFilter
          filter={searchFilter}
          onFilterChange={handleFilterChange}
          onReset={handleFilterReset}
          staffCount={pagination.total}
          loading={loading}
          onRefresh={handleRefresh}
          onAddStaff={handleAddStaff}
        />
      </Suspense>

      {/* 직원 통계 대시보드 */}
      <Suspense
        fallback={
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, idx) => (
              <div
                key={idx}
                className="h-24 rounded-lg border bg-white/50 dark:bg-gray-800/50 animate-pulse"
              />
            ))}
          </div>
        }
      >
        <StaffStats stats={staffStats} loading={statsLoading} />
      </Suspense>

      {/* 직원 목록 테이블 */}
      <Suspense
        fallback={
          <div className="rounded-lg border overflow-hidden">
            <div className="h-10 bg-gray-100 dark:bg-gray-800 animate-pulse" />
            {Array.from({ length: 8 }).map((_, idx) => (
              <div
                key={idx}
                className="h-12 border-t bg-white/50 dark:bg-gray-900/50 animate-pulse"
              />
            ))}
          </div>
        }
      >
        <StaffTable
          staff={staff}
          loading={loading}
          sortOption={sortOption}
          onSortChange={handleSortChange}
          pagination={pagination}
          onPageChange={handlePageChange}
          onEdit={openEditMode}
          onDelete={handleDeleteStaff}
          onView={handleViewStaff}
          selectedStaff={selectedStaff}
          onSelectionChange={setSelectedStaff}
          onBulkAction={handleBulkAction}
        />
      </Suspense>

      {/* 직원 등록/수정 폼 모달 */}
      <Suspense fallback={null}>
        <StaffForm
          isOpen={isFormOpen}
          onClose={closeForm}
          onSubmit={handleSubmit}
          staff={editingStaff}
          isLoading={formLoading}
        />
      </Suspense>

      {/* 직원 상세 정보 모달 */}
      <Suspense fallback={null}>
        <StaffDetailModal
          isOpen={isDetailModalOpen}
          onClose={closeDetailModal}
          staff={viewingStaff}
          onEdit={openEditMode}
        />
      </Suspense>
    </div>
  );
};

export default StaffPage;
