import React, { useState } from 'react';
import {
  ChevronUp,
  ChevronDown,
  Edit,
  Trash2,
  Eye,
  Phone,
  Mail,
  Calendar,
  CheckSquare,
  Square,
  ArrowUpDown,
  Settings,
  Download,
  Users,
  UserCheck,
  UserX,
} from 'lucide-react';
import {
  Member,
  SortOption,
  MemberTableColumn,
  BulkAction,
  PaginationInfo,
} from '../../types/member';

interface MemberTableProps {
  members: Member[];
  loading?: boolean;
  sortOption: SortOption;
  onSortChange: (sort: SortOption) => void;
  pagination: PaginationInfo;
  onPageChange: (page: number) => void;
  onEdit: (member: Member) => void;
  onDelete: (member: Member) => void;
  onView: (member: Member) => void;
  selectedMembers: number[];
  onSelectionChange: (memberIds: number[]) => void;
  onBulkAction: (action: BulkAction, memberIds: number[]) => void;
}

const MemberTable: React.FC<MemberTableProps> = ({
  members,
  loading = false,
  sortOption,
  onSortChange,
  pagination,
  onPageChange,
  onEdit,
  onDelete,
  onView,
  selectedMembers,
  onSelectionChange,
  onBulkAction,
}) => {
  const [columnSettings, setColumnSettings] = useState(false);

  // 기본 컬럼 설정
  const [columns, setColumns] = useState<MemberTableColumn[]>([
    {
      key: 'name',
      label: '회원 정보',
      sortable: true,
      visible: true,
      sticky: true,
      width: '250px',
    },
    { key: 'phone', label: '연락처', sortable: false, visible: true, width: '200px' },
    { key: 'gender', label: '성별', sortable: true, visible: true, width: '80px' },
    { key: 'age', label: '나이', sortable: true, visible: true, width: '80px' },
    { key: 'join_date', label: '가입일', sortable: true, visible: true, width: '120px' },
    {
      key: 'membership_status',
      label: '회원권 상태',
      sortable: false,
      visible: true,
      width: '120px',
    },
    { key: 'active', label: '상태', sortable: true, visible: true, width: '100px' },
    { key: 'actions', label: '작업', sortable: false, visible: true, sticky: true, width: '120px' },
  ]);

  // 일괄 작업 옵션
  const bulkActions: BulkAction[] = [
    {
      type: 'activate',
      label: '활성화',
      icon: 'UserCheck',
      requiresConfirmation: true,
      confirmMessage: '선택한 회원들을 활성화하시겠습니까?',
    },
    {
      type: 'deactivate',
      label: '비활성화',
      icon: 'UserX',
      requiresConfirmation: true,
      confirmMessage: '선택한 회원들을 비활성화하시겠습니까?',
    },
    {
      type: 'export',
      label: '내보내기',
      icon: 'Download',
      requiresConfirmation: false,
    },
    {
      type: 'delete',
      label: '삭제',
      icon: 'Trash2',
      requiresConfirmation: true,
      confirmMessage: '선택한 회원들을 정말 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.',
    },
  ];

  // 정렬 핸들러
  const handleSort = (field: keyof Member | 'age' | 'membership_status' | 'actions') => {
    if (field === 'actions') return; // actions 컬럼은 정렬 불가
    const newDirection =
      sortOption.field === field && sortOption.direction === 'asc' ? 'desc' : 'asc';
    onSortChange({
      field: field as keyof Member | 'age' | 'membership_status',
      direction: newDirection,
    });
  };

  // 전체 선택/해제
  const handleSelectAll = () => {
    if (selectedMembers.length === members.length) {
      onSelectionChange([]);
    } else {
      onSelectionChange(members.map(m => m.id));
    }
  };

  // 개별 선택
  const handleSelectMember = (memberId: number) => {
    if (selectedMembers.includes(memberId)) {
      onSelectionChange(selectedMembers.filter(id => id !== memberId));
    } else {
      onSelectionChange([...selectedMembers, memberId]);
    }
  };

  // 나이 계산
  const calculateAge = (birthDate?: string | null): number | undefined => {
    if (!birthDate) return undefined;
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  // 페이지네이션 버튼 생성
  const generatePageNumbers = () => {
    const pages = [];
    const { page, totalPages } = pagination;
    const maxVisible = 5;

    let start = Math.max(1, page - Math.floor(maxVisible / 2));
    const end = Math.min(totalPages, start + maxVisible - 1);

    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    return pages;
  };

  // 표시할 컬럼 필터링
  const visibleColumns = columns.filter(col => col.visible);

  // 컬럼 렌더링
  const renderCell = (member: Member, column: MemberTableColumn) => {
    switch (column.key) {
      case 'name':
        return (
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold shadow-md">
              {member.name.charAt(0)}
            </div>
            <div>
              <div className="text-sm font-medium text-gray-900">{member.name}</div>
              <div className="text-sm text-gray-500">{member.member_number}</div>
            </div>
          </div>
        );

      case 'phone':
        return (
          <div>
            <div className="flex items-center text-sm text-gray-900">
              {member.phone ? (
                <>
                  <Phone className="w-4 h-4 mr-1 text-gray-400" />
                  {member.phone}
                </>
              ) : (
                <span className="text-gray-400">미등록</span>
              )}
            </div>
            {member.email && (
              <div className="flex items-center text-sm text-gray-500 mt-1">
                <Mail className="w-4 h-4 mr-1 text-gray-400" />
                {member.email}
              </div>
            )}
          </div>
        );

      case 'gender':
        return (
          <span
            className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
              member.gender === '남성'
                ? 'bg-blue-100 text-blue-800'
                : member.gender === '여성'
                  ? 'bg-pink-100 text-pink-800'
                  : 'bg-gray-100 text-gray-800'
            }`}
          >
            {member.gender || '미설정'}
          </span>
        );

      case 'age': {
        const age = calculateAge(member.birth_date);
        return <div className="text-sm text-gray-900">{age ? `${age}세` : '-'}</div>;
      }

      case 'join_date':
        return (
          <div className="flex items-center text-sm text-gray-900">
            <Calendar className="w-4 h-4 mr-1 text-gray-400" />
            {new Date(member.join_date).toLocaleDateString('ko-KR')}
          </div>
        );

      case 'membership_status':
        // TODO: 실제 회원권 상태 로직 구현 필요
        return (
          <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
            활성
          </span>
        );

      case 'active':
        return (
          <span
            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
              member.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}
          >
            {member.active ? '활성' : '비활성'}
          </span>
        );

      case 'actions':
        return (
          <div className="flex items-center space-x-2">
            <button
              onClick={() => onView(member)}
              className="text-blue-600 hover:text-blue-900 p-1 rounded transition-colors"
              title="상세보기"
            >
              <Eye className="w-4 h-4" />
            </button>
            <button
              onClick={() => onEdit(member)}
              className="text-green-600 hover:text-green-900 p-1 rounded transition-colors"
              title="수정"
            >
              <Edit className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDelete(member)}
              className="text-red-600 hover:text-red-900 p-1 rounded transition-colors"
              title="삭제"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        );

      default:
        return member[column.key as keyof Member];
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* 테이블 헤더 - 일괄 작업 및 설정 */}
      <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h3 className="text-lg font-semibold text-gray-900">회원 목록</h3>

            {/* 선택된 항목 정보 */}
            {selectedMembers.length > 0 && (
              <div className="flex items-center space-x-3">
                <span className="text-sm text-gray-600">{selectedMembers.length}명 선택됨</span>

                {/* 일괄 작업 버튼들 */}
                <div className="flex items-center space-x-2">
                  {bulkActions.map(action => (
                    <button
                      key={action.type}
                      onClick={() => onBulkAction(action, selectedMembers)}
                      className={`flex items-center space-x-1 px-3 py-1 text-xs rounded-lg transition-colors ${
                        action.type === 'delete'
                          ? 'bg-red-100 text-red-700 hover:bg-red-200'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {action.icon === 'UserCheck' && <UserCheck className="w-3 h-3" />}
                      {action.icon === 'UserX' && <UserX className="w-3 h-3" />}
                      {action.icon === 'Download' && <Download className="w-3 h-3" />}
                      {action.icon === 'Trash2' && <Trash2 className="w-3 h-3" />}
                      <span>{action.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 테이블 설정 */}
          <button
            onClick={() => setColumnSettings(!columnSettings)}
            className="flex items-center space-x-1 px-3 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
          >
            <Settings className="w-4 h-4" />
            <span>컬럼 설정</span>
          </button>
        </div>

        {/* 컬럼 설정 패널 */}
        {columnSettings && (
          <div className="mt-4 p-4 bg-white rounded-lg border border-gray-200">
            <h4 className="text-sm font-medium text-gray-900 mb-3">표시할 컬럼 선택</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {columns.map(column => (
                <label key={column.key} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={column.visible}
                    onChange={e => {
                      setColumns(
                        columns.map(col =>
                          col.key === column.key ? { ...col, visible: e.target.checked } : col
                        )
                      );
                    }}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    disabled={column.sticky}
                  />
                  <span className="text-sm text-gray-700">{column.label}</span>
                </label>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 테이블 */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {/* 전체 선택 체크박스 */}
              <th className="w-12 px-6 py-3">
                <button onClick={handleSelectAll}>
                  {selectedMembers.length === members.length && members.length > 0 ? (
                    <CheckSquare className="w-5 h-5 text-blue-600" />
                  ) : (
                    <Square className="w-5 h-5 text-gray-400" />
                  )}
                </button>
              </th>

              {/* 컬럼 헤더 */}
              {visibleColumns.map(column => (
                <th
                  key={column.key}
                  className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${
                    column.width ? `w-[${column.width}]` : ''
                  }`}
                >
                  {column.sortable ? (
                    <button
                      onClick={() => handleSort(column.key)}
                      className="flex items-center space-x-1 hover:text-gray-700 transition-colors"
                    >
                      <span>{column.label}</span>
                      {sortOption.field === column.key ? (
                        sortOption.direction === 'asc' ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )
                      ) : (
                        <ArrowUpDown className="w-4 h-4 opacity-50" />
                      )}
                    </button>
                  ) : (
                    column.label
                  )}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={visibleColumns.length + 1} className="px-6 py-12 text-center">
                  <div className="flex items-center justify-center space-x-2">
                    <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent"></div>
                    <span className="text-gray-500">로딩 중...</span>
                  </div>
                </td>
              </tr>
            ) : members.length === 0 ? (
              <tr>
                <td colSpan={visibleColumns.length + 1} className="px-6 py-12 text-center">
                  <div className="flex flex-col items-center space-y-3">
                    <Users className="w-12 h-12 text-gray-300" />
                    <p className="text-gray-500">검색 결과가 없습니다.</p>
                    <p className="text-sm text-gray-400">다른 검색 조건을 시도해보세요.</p>
                  </div>
                </td>
              </tr>
            ) : (
              members.map(member => (
                <tr
                  key={member.id}
                  className={`hover:bg-gray-50 transition-colors ${
                    selectedMembers.includes(member.id) ? 'bg-blue-50' : ''
                  }`}
                >
                  {/* 선택 체크박스 */}
                  <td className="px-6 py-4">
                    <button onClick={() => handleSelectMember(member.id)}>
                      {selectedMembers.includes(member.id) ? (
                        <CheckSquare className="w-5 h-5 text-blue-600" />
                      ) : (
                        <Square className="w-5 h-5 text-gray-400" />
                      )}
                    </button>
                  </td>

                  {/* 데이터 셀 */}
                  {visibleColumns.map(column => (
                    <td key={column.key} className="px-6 py-4 whitespace-nowrap">
                      {renderCell(member, column)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* 페이지네이션 */}
      {!loading && members.length > 0 && (
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700">
              <span>
                {(pagination.page - 1) * pagination.limit + 1}-
                {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                {pagination.total.toLocaleString()} 결과
              </span>
            </div>

            <div className="flex items-center space-x-2">
              {/* 이전 버튼 */}
              <button
                onClick={() => onPageChange(pagination.page - 1)}
                disabled={!pagination.hasPrev}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                이전
              </button>

              {/* 페이지 번호들 */}
              {generatePageNumbers().map(pageNum => (
                <button
                  key={pageNum}
                  onClick={() => onPageChange(pageNum)}
                  className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                    pageNum === pagination.page
                      ? 'bg-blue-600 text-white'
                      : 'border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {pageNum}
                </button>
              ))}

              {/* 다음 버튼 */}
              <button
                onClick={() => onPageChange(pagination.page + 1)}
                disabled={!pagination.hasNext}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                다음
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MemberTable;
