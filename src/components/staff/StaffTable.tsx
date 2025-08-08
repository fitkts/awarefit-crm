import {
    ArrowUpDown,
    Briefcase,
    Building,
    Calendar,
    CheckSquare,
    CreditCard,
    Download,
    Edit,
    Eye,
    Mail,
    Phone,
    Settings,
    Square,
    Trash2,
    User,
    Users,
} from '@/utils/lucide-shim';
import React, { useState } from 'react';
import { Staff, StaffBulkAction, StaffPaginationInfo, StaffSortOption } from '../../types/staff';

// 컬럼 설정 타입
interface StaffTableColumn {
  key: string;
  label: string;
  sortable: boolean;
  visible: boolean;
  sticky?: boolean;
  width?: string;
}

interface StaffTableProps {
  staff: Staff[];
  loading?: boolean;
  sortOption: StaffSortOption;
  onSortChange: (sort: StaffSortOption) => void;
  pagination: StaffPaginationInfo;
  onPageChange: (page: number) => void;
  onEdit: (staff: Staff) => void;
  onDelete: (staff: Staff) => void;
  onView: (staff: Staff) => void;
  selectedStaff: number[];
  onSelectionChange: (staffIds: number[]) => void;
  onBulkAction: (action: StaffBulkAction, staffIds: number[]) => void;
}

const StaffTable: React.FC<StaffTableProps> = ({
  staff,
  loading = false,
  sortOption,
  onSortChange,
  pagination,
  onPageChange,
  onEdit,
  onDelete,
  onView,
  selectedStaff,
  onSelectionChange,
  onBulkAction,
}) => {
  const [columnSettings, setColumnSettings] = useState(false);

  // 기본 컬럼 설정
  const [columns] = useState<StaffTableColumn[]>([
    {
      key: 'name',
      label: '이름',
      sortable: true,
      visible: true,
      sticky: true,
      width: '180px',
    },
    { key: 'phone', label: '연락처', sortable: false, visible: true, width: '140px' },
    { key: 'position', label: '직책', sortable: true, visible: true, width: '100px' },
    { key: 'department', label: '부서', sortable: true, visible: true, width: '120px' },
    { key: 'hire_date', label: '입사일', sortable: true, visible: true, width: '100px' },
    { key: 'salary', label: '급여', sortable: true, visible: true, width: '120px' },
    { key: 'permissions', label: '권한', sortable: false, visible: true, width: '100px' },
    { key: 'is_active', label: '상태', sortable: true, visible: true, width: '80px' },
    { key: 'actions', label: '작업', sortable: false, visible: true, sticky: true, width: '100px' },
  ]);

  // 일괄 작업 옵션
  const bulkActions: {
    type: StaffBulkAction;
    label: string;
    icon: string;
    requiresConfirmation: boolean;
    confirmMessage: string;
  }[] = [
    {
      type: 'activate',
      label: '활성화',
      icon: 'UserCheck',
      requiresConfirmation: true,
      confirmMessage: '선택한 직원들을 활성화하시겠습니까?',
    },
    {
      type: 'deactivate',
      label: '비활성화',
      icon: 'UserX',
      requiresConfirmation: true,
      confirmMessage: '선택한 직원들을 비활성화하시겠습니까?',
    },
    {
      type: 'delete',
      label: '삭제',
      icon: 'Trash2',
      requiresConfirmation: true,
      confirmMessage: '선택한 직원들을 삭제하시겠습니까?',
    },
    {
      type: 'update_department',
      label: '부서 변경',
      icon: 'Building',
      requiresConfirmation: true,
      confirmMessage: '선택한 직원들의 부서를 변경하시겠습니까?',
    },
  ];

  // 나이 계산 함수 (향후 사용 예정)
  // const calculateAge = (birthDate?: string | null): number | null => {
  //   if (!birthDate) return null;
  //   const today = new Date();
  //   const birth = new Date(birthDate);
  //   let age = today.getFullYear() - birth.getFullYear();
  //   const monthDiff = today.getMonth() - birth.getMonth();
  //   if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
  //     age--;
  //   }
  //   return age;
  // };

  // 근속 기간 계산 함수
  const calculateTenure = (hireDate: string): string => {
    const today = new Date();
    const hire = new Date(hireDate);
    const diffTime = Math.abs(today.getTime() - hire.getTime());
    const diffMonths = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 30.44));

    if (diffMonths < 12) {
      return `${diffMonths}개월`;
    } else {
      const years = Math.floor(diffMonths / 12);
      const months = diffMonths % 12;
      return months > 0 ? `${years}년 ${months}개월` : `${years}년`;
    }
  };

  // 정렬 핸들러
  const handleSort = (field: StaffSortOption['field']) => {
    const newDirection =
      sortOption.field === field && sortOption.direction === 'asc' ? 'desc' : 'asc';
    onSortChange({ field, direction: newDirection });
  };

  // 전체 선택/해제
  const handleSelectAll = () => {
    if (selectedStaff.length === staff.length) {
      onSelectionChange([]);
    } else {
      onSelectionChange(staff.map(s => s.id));
    }
  };

  // 개별 선택/해제
  const handleSelectStaff = (staffId: number) => {
    if (selectedStaff.includes(staffId)) {
      onSelectionChange(selectedStaff.filter(id => id !== staffId));
    } else {
      onSelectionChange([...selectedStaff, staffId]);
    }
  };

  // 일괄 작업 실행
  const handleBulkAction = (action: StaffBulkAction) => {
    if (selectedStaff.length === 0) return;

    const actionConfig = bulkActions.find(a => a.type === action);
    if (actionConfig?.requiresConfirmation) {
      if (window.confirm(actionConfig.confirmMessage)) {
        onBulkAction(action, selectedStaff);
      }
    } else {
      onBulkAction(action, selectedStaff);
    }
  };

  // 컬럼별 렌더링
  const renderCell = (staffMember: Staff, column: StaffTableColumn) => {
    switch (column.key) {
      case 'name':
        return (
          <div className="flex items-center">
            <div className="flex-shrink-0 h-8 w-8">
              <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center">
                <User className="h-4 w-4 text-gray-600" />
              </div>
            </div>
            <div className="ml-3">
              <div className="text-sm font-medium text-gray-900">{staffMember.name}</div>
              <div className="text-xs text-gray-500">
                {staffMember.phone || staffMember.email || '연락처 없음'}
              </div>
            </div>
          </div>
        );

      case 'phone':
        return (
          <div className="text-sm">
            {staffMember.phone ? (
              <div className="flex items-center">
                <Phone className="w-3 h-3 mr-1 text-gray-400" />
                <span className="text-xs">{staffMember.phone}</span>
              </div>
            ) : (
              <span className="text-xs text-gray-400">미등록</span>
            )}
            {staffMember.email && (
              <div className="flex items-center text-xs text-gray-500 mt-1">
                <Mail className="w-3 h-3 mr-1 text-gray-400" />
                {staffMember.email}
              </div>
            )}
          </div>
        );

      case 'position':
        return (
          <div className="flex items-center">
            <Briefcase className="w-3 h-3 mr-1 text-gray-400" />
            <span
              className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                staffMember.position === '매니저'
                  ? 'bg-purple-100 text-purple-800'
                  : staffMember.position === '트레이너'
                    ? 'bg-blue-100 text-blue-800'
                    : staffMember.position === '데스크'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
              }`}
            >
              {staffMember.position}
            </span>
          </div>
        );

      case 'department':
        return staffMember.department ? (
          <div className="flex items-center text-sm text-gray-900">
            <Building className="w-3 h-3 mr-1 text-gray-400" />
            {staffMember.department}
          </div>
        ) : (
          <span className="text-xs text-gray-400">미설정</span>
        );

      case 'hire_date':
        return (
          <div>
            <div className="flex items-center text-xs text-gray-900">
              <Calendar className="w-3 h-3 mr-1 text-gray-400" />
              {new Date(staffMember.hire_date).toLocaleDateString('ko-KR')}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              근속 {calculateTenure(staffMember.hire_date)}
            </div>
          </div>
        );

      case 'salary':
        return staffMember.salary ? (
          <div className="flex items-center text-sm text-gray-900">
            <CreditCard className="w-3 h-3 mr-1 text-gray-400" />
            {staffMember.salary.toLocaleString()}원
          </div>
        ) : (
          <span className="text-xs text-gray-400">미설정</span>
        );

      case 'permissions':
        return (
          <div className="flex items-center space-x-1">
            {staffMember.can_manage_payments && (
              <div className="flex items-center text-xs bg-blue-100 text-blue-800 px-1 py-0.5 rounded">
                <CreditCard className="w-3 h-3 mr-0.5" />
                결제
              </div>
            )}
            {staffMember.can_manage_members && (
              <div className="flex items-center text-xs bg-green-100 text-green-800 px-1 py-0.5 rounded">
                <Users className="w-3 h-3 mr-0.5" />
                회원
              </div>
            )}
            {!staffMember.can_manage_payments && !staffMember.can_manage_members && (
              <span className="text-xs text-gray-400">권한없음</span>
            )}
          </div>
        );

      case 'is_active':
        return (
          <span
            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
              staffMember.is_active
                ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300'
                : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-300'
            }`}
          >
            {staffMember.is_active ? '활성' : '비활성'}
          </span>
        );

      case 'actions':
        return (
          <div className="flex items-center space-x-1">
            <button
              onClick={() => onView(staffMember)}
              className="text-blue-600 hover:text-blue-900 p-1 rounded transition-colors"
              title="상세보기"
            >
              <Eye className="w-3 h-3" />
            </button>
            <button
              onClick={() => onEdit(staffMember)}
              className="text-green-600 hover:text-green-900 p-1 rounded transition-colors"
              title="수정"
            >
              <Edit className="w-3 h-3" />
            </button>
            <button
              onClick={() => onDelete(staffMember)}
              className="text-red-600 hover:text-red-900 p-1 rounded transition-colors"
              title="삭제"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        );

      default:
        return staffMember[column.key as keyof Staff];
    }
  };

  return (
    <div className="bg-white dark:bg-dark-800 rounded-lg shadow-sm border border-gray-200 dark:border-dark-600 overflow-hidden">
      {/* 테이블 헤더 - 일괄 작업 및 설정 */}
      <div className="px-4 py-3 border-b border-gray-200 dark:border-dark-600 bg-gray-50 dark:bg-dark-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {selectedStaff.length > 0 && (
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-700 dark:text-dark-300">
                  {selectedStaff.length}명 선택됨
                </span>
                <div className="flex items-center space-x-1">
                  {bulkActions.map(action => (
                    <button
                      key={action.type}
                      onClick={() => handleBulkAction(action.type)}
                      className="px-2 py-1 text-xs bg-gray-200 dark:bg-dark-600 text-gray-700 dark:text-dark-300 rounded hover:bg-gray-300 dark:hover:bg-dark-500 transition-colors"
                    >
                      {action.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() =>
                onBulkAction(
                  'activate',
                  staff.map(s => s.id)
                )
              }
              className="p-1 text-gray-500 dark:text-dark-400 hover:text-gray-700 dark:hover:text-dark-200 rounded transition-colors"
              title="내보내기"
            >
              <Download className="w-4 h-4" />
            </button>
            <button
              onClick={() => setColumnSettings(!columnSettings)}
              className="p-1 text-gray-500 dark:text-dark-400 hover:text-gray-700 dark:hover:text-dark-200 rounded transition-colors"
              title="컬럼 설정"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 테이블 */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-dark-600">
          <thead className="bg-gray-50 dark:bg-dark-700">
            <tr>
              <th className="w-8 px-4 py-3 text-left">
                <button onClick={handleSelectAll} className="flex items-center">
                  {selectedStaff.length === staff.length && staff.length > 0 ? (
                    <CheckSquare className="w-4 h-4 text-blue-600" />
                  ) : (
                    <Square className="w-4 h-4 text-gray-400" />
                  )}
                </button>
              </th>
              {columns
                .filter(column => column.visible)
                .map(column => (
                  <th
                    key={column.key}
                    className={`px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-dark-400 uppercase tracking-wider ${
                      column.sticky ? 'sticky bg-gray-50 dark:bg-dark-700' : ''
                    }`}
                    style={{ width: column.width }}
                  >
                    {column.sortable ? (
                      <button
                        onClick={() => handleSort(column.key as StaffSortOption['field'])}
                        className="flex items-center space-x-1 hover:text-gray-700 dark:hover:text-dark-200"
                      >
                        <span>{column.label}</span>
                        <ArrowUpDown className="w-3 h-3" />
                      </button>
                    ) : (
                      column.label
                    )}
                  </th>
                ))}
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-dark-800 divide-y divide-gray-200 dark:divide-dark-600">
            {loading ? (
              <tr>
                <td
                  colSpan={columns.filter(c => c.visible).length + 1}
                  className="px-4 py-8 text-center dark:text-dark-300"
                >
                  <div className="flex justify-center items-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                    <span className="ml-2 text-sm text-gray-500 dark:text-dark-400">
                      로딩 중...
                    </span>
                  </div>
                </td>
              </tr>
            ) : staff.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.filter(c => c.visible).length + 1}
                  className="px-4 py-8 text-center dark:text-dark-300"
                >
                  <div className="flex flex-col items-center">
                    <Users className="w-12 h-12 text-gray-400 mb-3" />
                    <p className="text-sm text-gray-500 dark:text-dark-400">
                      직원 데이터가 없습니다.
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              staff.map(staffMember => (
                <tr
                  key={staffMember.id}
                  className={`hover:bg-gray-50 dark:hover:bg-dark-700 ${
                    selectedStaff.includes(staffMember.id) ? 'bg-blue-50 dark:bg-blue-900' : ''
                  }`}
                >
                  <td className="w-8 px-4 py-3">
                    <button
                      onClick={() => handleSelectStaff(staffMember.id)}
                      className="flex items-center"
                    >
                      {selectedStaff.includes(staffMember.id) ? (
                        <CheckSquare className="w-4 h-4 text-blue-600" />
                      ) : (
                        <Square className="w-4 h-4 text-gray-400" />
                      )}
                    </button>
                  </td>
                  {columns
                    .filter(column => column.visible)
                    .map(column => (
                      <td
                        key={column.key}
                        className={`px-4 py-3 text-sm dark:text-dark-200 ${column.sticky ? 'sticky bg-white dark:bg-dark-800' : ''}`}
                      >
                        {renderCell(staffMember, column)}
                      </td>
                    ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* 페이지네이션 */}
      {!loading && staff.length > 0 && (
        <div className="px-4 py-3 border-t border-gray-200 dark:border-dark-600 bg-gray-50 dark:bg-dark-700">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700 dark:text-dark-300">
              전체 {pagination.total}명 중 {(pagination.page - 1) * pagination.limit + 1}-
              {Math.min(pagination.page * pagination.limit, pagination.total)}명 표시
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => onPageChange(pagination.page - 1)}
                disabled={!pagination.hasPrev}
                className="px-3 py-1 text-sm border border-gray-300 dark:border-dark-600 bg-white dark:bg-dark-800 text-gray-700 dark:text-dark-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-dark-600"
              >
                이전
              </button>
              <span className="text-sm text-gray-700 dark:text-dark-300">
                {pagination.page} / {pagination.totalPages}
              </span>
              <button
                onClick={() => onPageChange(pagination.page + 1)}
                disabled={!pagination.hasNext}
                className="px-3 py-1 text-sm border border-gray-300 dark:border-dark-600 bg-white dark:bg-dark-800 text-gray-700 dark:text-dark-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-dark-600"
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

export default StaffTable;
