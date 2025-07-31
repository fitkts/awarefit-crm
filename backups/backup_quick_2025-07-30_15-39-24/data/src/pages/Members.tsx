import { Plus } from 'lucide-react';
import React, { useCallback, useEffect, useState } from 'react';
import { useToastHelpers } from '../components/common/Toast';
import MemberDetailModal from '../components/member/MemberDetailModal';
import MemberForm from '../components/member/MemberForm';
import MemberSearchFilter from '../components/member/MemberSearchFilter';
import MemberStats from '../components/member/MemberStats';
import MemberTable from '../components/member/MemberTable';
import {
  BulkAction,
  CreateMemberInput,
  Member,
  MemberSearchFilter as MemberSearchFilterType,
  MemberStats as MemberStatsType,
  PaginationInfo,
  SortOption,
  UpdateMemberInput,
} from '../types/member';

const Members: React.FC = () => {
  // 상태 관리
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [searchFilter, setSearchFilter] = useState<MemberSearchFilterType>({ active: 'all' });
  const [sortOption, setSortOption] = useState<SortOption>({
    field: 'join_date',
    direction: 'desc',
  });
  const [pagination, setPagination] = useState<PaginationInfo>({
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
  const [editingMember, setEditingMember] = useState<Member | undefined>(undefined);
  const [viewingMember, setViewingMember] = useState<Member | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  // 일괄 작업 상태
  const [selectedMembers, setSelectedMembers] = useState<number[]>([]);

  // 통계 데이터
  const [memberStats, setMemberStats] = useState<MemberStatsType>({
    total: 0,
    active: 0,
    inactive: 0,
    new_this_month: 0,
    new_this_week: 0,
    male: 0,
    female: 0,
    with_membership: 0,
    without_membership: 0,
    average_age: 0,
    age_distribution: {
      '10-19': 0,
      '20-29': 0,
      '30-39': 0,
      '40-49': 0,
      '50-59': 0,
      '60+': 0,
    },
    recent_registrations: [],
    upcoming_membership_expiry: 0,
  });

  // 에러 상태
  const [error, setError] = useState<string | null>(null);

  // 토스트 알림 훅
  const { showSuccess, showError } = useToastHelpers();

  // 컴포넌트 마운트 시 데이터 로드
  useEffect(() => {
    loadInitialData();
  }, []);

  // 검색 필터나 정렬 옵션 변경 시 회원 목록 다시 로드
  useEffect(() => {
    loadMembers();
  }, [searchFilter, sortOption, pagination.page]);

  // 초기 데이터 로드
  const loadInitialData = async () => {
    await Promise.all([loadMembers(), loadMemberStats()]);
  };

  // 회원 목록 조회
  const loadMembers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('🔍 [Members] 회원 목록 로딩 시도:', { searchFilter, sortOption });

      // API 단계별 존재 여부 확인
      if (!window.electronAPI) {
        throw new Error('electronAPI가 로드되지 않았습니다.');
      }

      if (!window.electronAPI.database) {
        throw new Error('database API가 로드되지 않았습니다.');
      }

      if (!window.electronAPI.database.member) {
        throw new Error('member API가 로드되지 않았습니다.');
      }

      if (typeof window.electronAPI.database.member.getAll !== 'function') {
        throw new Error('getAll 함수가 존재하지 않습니다.');
      }

      const result = await window.electronAPI.database.member.getAll({
        ...searchFilter,
        sort: sortOption,
        page: pagination.page,
        limit: pagination.limit,
      });

      console.log('✅ [Members] 회원 목록 결과:', result);

      if (result) {
        // API가 배열을 반환하므로 직접 설정
        if (Array.isArray(result)) {
          setMembers(result);
          console.log('✅ [Members] 배열 형태로 회원 목록 설정:', result.length, '명');
        } else {
          // 타입 가드를 사용해서 안전하게 처리
          const resultWithPagination = result as any;
          const members = resultWithPagination.members || [];
          setMembers(members);
          console.log('✅ [Members] 페이지네이션 형태로 회원 목록 설정:', members.length, '명');

          if (resultWithPagination.pagination) {
            setPagination(resultWithPagination.pagination);
            console.log(
              '✅ [Members] 페이지네이션 정보 업데이트:',
              resultWithPagination.pagination
            );
          }
        }
      } else {
        console.warn('⚠️ [Members] 빈 결과 반환됨');
        setMembers([]);
      }
    } catch (error) {
      console.error('🚨 [Members] 회원 목록 로드 실패:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      setError(`회원 목록을 불러오는데 실패했습니다: ${errorMessage}`);
      setMembers([]); // 실패 시 빈 배열로 설정
    } finally {
      setLoading(false);
    }
  }, [searchFilter, sortOption, pagination.page, pagination.limit]);

  // 회원 통계 로드
  const loadMemberStats = async () => {
    try {
      setStatsLoading(true);

      // API 존재 여부를 더 정확하게 확인
      console.log('🔍 [Debug] electronAPI 객체:', window.electronAPI);
      console.log('🔍 [Debug] database 객체:', window.electronAPI?.database);
      console.log('🔍 [Debug] member 객체:', window.electronAPI?.database?.member);
      console.log('🔍 [Debug] getStats 함수:', window.electronAPI?.database?.member?.getStats);

      if (!window.electronAPI) {
        throw new Error('electronAPI가 로드되지 않았습니다.');
      }

      if (!window.electronAPI.database) {
        throw new Error('database API가 로드되지 않았습니다.');
      }

      if (!window.electronAPI.database.member) {
        throw new Error('member API가 로드되지 않았습니다.');
      }

      if (typeof window.electronAPI.database.member.getStats !== 'function') {
        throw new Error('getStats 함수가 존재하지 않습니다.');
      }

      const stats = await window.electronAPI.database.member.getStats();
      console.log('회원 통계 결과:', stats);

      setMemberStats(stats);
    } catch (error) {
      console.error('회원 통계 로드 실패:', error);

      // 에러 발생시 기본값 설정
      setMemberStats({
        total: 0,
        active: 0,
        inactive: 0,
        new_this_month: 0,
        new_this_week: 0,
        male: 0,
        female: 0,
        with_membership: 0,
        without_membership: 0,
        average_age: 0,
        age_distribution: {
          '10-19': 0,
          '20-29': 0,
          '30-39': 0,
          '40-49': 0,
          '50-59': 0,
          '60+': 0,
        },
        recent_registrations: [],
        upcoming_membership_expiry: 0,
      });
    } finally {
      setStatsLoading(false);
    }
  };

  // 새 회원 등록 핸들러
  const handleCreateMember = async (data: CreateMemberInput) => {
    try {
      setFormLoading(true);
      console.log('회원 생성 시도:', data);

      if (!window.electronAPI?.database?.member?.create) {
        throw new Error('electronAPI가 사용할 수 없습니다.');
      }

      const result = await window.electronAPI.database.member.create(data);
      console.log('회원 생성 결과:', result);

      await loadInitialData(); // 목록과 통계 새로고침
      setIsFormOpen(false);
      setSelectedMembers([]); // 선택 초기화

      showSuccess('회원이 성공적으로 등록되었습니다.');
    } catch (error) {
      console.error('회원 등록 실패:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      showError(`회원 등록에 실패했습니다: ${errorMessage}`);
      throw error;
    } finally {
      setFormLoading(false);
    }
  };

  // 회원 정보 수정 핸들러
  const handleUpdateMember = async (data: UpdateMemberInput) => {
    try {
      setFormLoading(true);
      console.log('회원 수정 시도:', data);

      if (!window.electronAPI?.database?.member?.update) {
        throw new Error('electronAPI가 사용할 수 없습니다.');
      }

      const result = await window.electronAPI.database.member.update(data.id, data);
      console.log('회원 수정 결과:', result);

      await loadInitialData(); // 목록과 통계 새로고침
      setIsFormOpen(false);
      setEditingMember(undefined);

      showSuccess('회원 정보가 성공적으로 수정되었습니다.');
    } catch (error) {
      console.error('회원 수정 실패:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      showError(`회원 수정에 실패했습니다: ${errorMessage}`);
      throw error;
    } finally {
      setFormLoading(false);
    }
  };

  // 통합 submit 핸들러
  const handleSubmit = async (data: CreateMemberInput | UpdateMemberInput) => {
    if (editingMember && 'id' in data) {
      await handleUpdateMember(data as UpdateMemberInput);
    } else {
      await handleCreateMember(data as CreateMemberInput);
    }
  };

  // 회원 삭제 핸들러
  const handleDeleteMember = async (member: Member) => {
    if (
      !confirm(`정말로 "${member.name}" 회원을 삭제하시겠습니까?\n\n이 작업은 되돌릴 수 없습니다.`)
    ) {
      return;
    }

    try {
      console.log('회원 삭제 시도:', member);

      if (!window.electronAPI?.database?.member?.delete) {
        throw new Error('electronAPI가 사용할 수 없습니다.');
      }

      await window.electronAPI.database.member.delete(member.id);
      await loadInitialData(); // 목록과 통계 새로고침
      setSelectedMembers(prev => prev.filter(id => id !== member.id));

      showSuccess(`"${member.name}" 회원이 성공적으로 삭제되었습니다.`);
    } catch (error) {
      console.error('회원 삭제 실패:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      showError(`회원 삭제에 실패했습니다: ${errorMessage}`);
    }
  };

  // 회원 상세보기
  const handleViewMember = (member: Member) => {
    setViewingMember(member);
    setIsDetailModalOpen(true);
  };

  // 회원 수정 모드 열기
  const openEditMode = (member: Member) => {
    setEditingMember(member);
    setIsFormOpen(true);
  };

  // 폼 닫기
  const closeForm = () => {
    setIsFormOpen(false);
    setEditingMember(undefined);
  };

  // 상세 모달 닫기
  const closeDetailModal = () => {
    setIsDetailModalOpen(false);
    setViewingMember(null);
  };

  // 검색 필터 변경
  const handleFilterChange = (filter: MemberSearchFilterType) => {
    setSearchFilter(filter);
    setPagination(prev => ({ ...prev, page: 1 })); // 첫 페이지로 리셋
    setSelectedMembers([]); // 선택 초기화
  };

  // 검색 필터 초기화
  const handleFilterReset = () => {
    setSearchFilter({ active: 'all' });
    setPagination(prev => ({ ...prev, page: 1 }));
    setSelectedMembers([]);
  };

  // 정렬 변경
  const handleSortChange = (sort: SortOption) => {
    setSortOption(sort);
    setSelectedMembers([]);
  };

  // 페이지 변경
  const handlePageChange = (page: number) => {
    setPagination(prev => ({ ...prev, page }));
    setSelectedMembers([]);
  };

  // 일괄 작업 처리
  const handleBulkAction = async (action: BulkAction, memberIds: number[]) => {
    if (action.requiresConfirmation && action.confirmMessage) {
      if (!confirm(action.confirmMessage)) {
        return;
      }
    }

    try {
      if (!window.electronAPI?.database?.member?.bulkAction) {
        throw new Error('일괄 작업 API가 사용할 수 없습니다.');
      }

      console.log(`일괄 작업 시작: ${action.type}, 대상: ${memberIds.length}명`);

      let result;

      // 담당직원 변경은 별도 API 사용
      if (action.type === 'assign_staff') {
        if (!window.electronAPI?.database?.member?.bulkAssignStaff) {
          throw new Error('담당직원 일괄 변경 API가 사용할 수 없습니다.');
        }
        result = await window.electronAPI.database.member.bulkAssignStaff(
          memberIds,
          action.staffId || null
        );
      } else {
        result = await window.electronAPI.database.member.bulkAction(action.type, memberIds);
      }

      console.log('일괄 작업 결과:', result);

      // 결과에 따른 메시지 표시
      if (result.success) {
        const { processed_count, total_count, errors } = result;

        if (errors && errors.length > 0) {
          // 일부 실패한 경우
          showError(
            `${action.label} 작업: ${processed_count}/${total_count}명 처리 완료. ${errors.length}건 실패`
          );
          console.warn('일괄 작업 오류:', errors);
        } else {
          // 모두 성공한 경우
          showSuccess(
            `${action.label} 작업이 완료되었습니다. (${processed_count}/${total_count}명 처리)`
          );
        }

        // 내보내기가 아닌 경우에만 데이터 새로고침
        if (action.type !== 'export') {
          await loadInitialData(); // 목록과 통계 새로고침
          setSelectedMembers([]);
        } else {
          // 내보내기의 경우 선택만 해제
          setSelectedMembers([]);
        }
      } else {
        throw new Error(result.message || '일괄 작업 처리에 실패했습니다.');
      }
    } catch (error) {
      console.error('일괄 작업 실패:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      showError(`${action.label} 작업에 실패했습니다: ${errorMessage}`);
    }
  };

  // 데이터 새로고침
  const handleRefresh = () => {
    loadInitialData();
  };

  // 신규 등록 핸들러
  const handleAddMember = () => {
    setIsFormOpen(true);
  };

  // 디버그: 데이터베이스 스키마 확인
  const handleDebugSchema = async () => {
    try {
      // API 존재 여부 확인
      if (!window.electronAPI?.database?.member?.debugSchema) {
        console.error('🚨 [Debug] debugSchema 함수가 존재하지 않습니다');
        alert('debugSchema 함수가 존재하지 않습니다. API가 제대로 로드되지 않았을 수 있습니다.');
        return;
      }

      const result = await window.electronAPI.database.member.debugSchema();
      console.log('🔍 [Debug] 스키마 확인 결과:', result);
      alert('스키마 확인 완료. 콘솔을 확인하세요.');
    } catch (error) {
      console.error('🚨 [Debug] 스키마 확인 실패:', error);
      alert('스키마 확인 실패: ' + (error instanceof Error ? error.message : String(error)));
    }
  };

  // 디버그: 스키마 수정
  const handleFixSchema = async () => {
    try {
      // API 존재 여부 확인
      if (!window.electronAPI?.database?.member?.fixSchema) {
        console.error('🚨 [Debug] fixSchema 함수가 존재하지 않습니다');
        alert('fixSchema 함수가 존재하지 않습니다. API가 제대로 로드되지 않았을 수 있습니다.');
        return;
      }

      const result = await window.electronAPI.database.member.fixSchema();
      console.log('🔧 [Debug] 스키마 수정 결과:', result);
      alert('스키마 수정 완료: ' + result.message);

      // 수정 완료 후 데이터를 다시 로드
      await loadInitialData();
    } catch (error) {
      console.error('🚨 [Debug] 스키마 수정 실패:', error);
      alert('스키마 수정 실패: ' + (error instanceof Error ? error.message : String(error)));
    }
  };

  return (
    <div className="space-y-4">
      {/* 에러 알림 */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <p className="text-sm text-red-700">{error}</p>
            <button onClick={() => setError(null)} className="text-red-500 hover:text-red-700">
              <Plus className="w-3 h-3 rotate-45" />
            </button>
          </div>
        </div>
      )}

      {/* 검색 및 필터 - 최상단 */}
      <MemberSearchFilter
        filter={searchFilter}
        onFilterChange={handleFilterChange}
        onReset={handleFilterReset}
        memberCount={pagination.total}
        loading={loading}
        onRefresh={handleRefresh}
        onAddMember={handleAddMember}
      />

      {/* 개발 환경에서만 디버그 버튼 표시 */}
      {process.env.NODE_ENV === 'development' && (
        <div className="flex gap-2 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="text-sm text-yellow-700 mr-4">개발 디버그 도구:</div>
          <button
            onClick={handleDebugSchema}
            className="px-3 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600"
          >
            🔍 DB 스키마 확인
          </button>
          <button
            onClick={handleFixSchema}
            className="px-3 py-1 text-xs bg-orange-500 text-white rounded hover:bg-orange-600"
          >
            🔧 DB 스키마 수정
          </button>
        </div>
      )}

      {/* 회원 통계 대시보드 */}
      <MemberStats stats={memberStats} loading={statsLoading} />

      {/* 회원 목록 테이블 */}
      <MemberTable
        members={members}
        loading={loading}
        sortOption={sortOption}
        onSortChange={handleSortChange}
        pagination={pagination}
        onPageChange={handlePageChange}
        onEdit={openEditMode}
        onDelete={handleDeleteMember}
        onView={handleViewMember}
        selectedMembers={selectedMembers}
        onSelectionChange={setSelectedMembers}
        onBulkAction={handleBulkAction}
      />

      {/* 회원 등록/수정 폼 모달 */}
      <MemberForm
        isOpen={isFormOpen}
        onClose={closeForm}
        onSubmit={handleSubmit}
        member={editingMember}
        isLoading={formLoading}
      />

      {/* 회원 상세 정보 모달 */}
      <MemberDetailModal
        isOpen={isDetailModalOpen}
        onClose={closeDetailModal}
        member={viewingMember}
        onEdit={openEditMode}
      />
    </div>
  );
};

export default Members;
