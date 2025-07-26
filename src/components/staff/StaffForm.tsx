import React, { useEffect, useState } from 'react';
import {
  CreateStaffInput,
  FormConfig,
  Staff,
  StaffRole,
  UpdateStaffInput,
} from '../../types/staff';
import { PersonForm } from '../common/PersonForm';

interface StaffFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateStaffInput | UpdateStaffInput) => Promise<void>;
  staff?: Staff; // 수정 모드일 때 전달되는 기존 직원 데이터
  isLoading?: boolean;
}

const StaffForm: React.FC<StaffFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  staff,
  isLoading = false,
}) => {
  const [roles, setRoles] = useState<StaffRole[]>([]);
  const [rolesLoading, setRolesLoading] = useState(false);

  // 역할 목록 조회
  useEffect(() => {
    const fetchRoles = async () => {
      if (!isOpen) return;

      setRolesLoading(true);
      try {
        const result = await window.electronAPI.database.staffRole.getAll();
        setRoles(result);
      } catch (error) {
        console.error('역할 목록 조회 실패:', error);
        setRoles([]);
      } finally {
        setRolesLoading(false);
      }
    };

    fetchRoles();
  }, [isOpen]);

  const staffFormConfig: FormConfig = {
    entityType: 'staff',
    title: staff ? '직원 정보 수정' : '새 직원 등록',
    submitButtonText: staff ? '수정' : '등록',
    additionalFields: [
      {
        key: 'position',
        label: '직책',
        type: 'select',
        required: true,
        options: [
          { value: '매니저', label: '매니저' },
          { value: '트레이너', label: '트레이너' },
          { value: '데스크', label: '데스크' },
          { value: '청소', label: '청소' },
          { value: '기타', label: '기타' },
        ],
      },
      {
        key: 'department',
        label: '부서',
        type: 'select',
        required: false,
        options: [
          { value: '운영팀', label: '운영팀' },
          { value: '트레이닝팀', label: '트레이닝팀' },
          { value: '고객서비스팀', label: '고객서비스팀' },
          { value: '시설관리팀', label: '시설관리팀' },
        ],
      },
      {
        key: 'role_id',
        label: '역할',
        type: 'select',
        required: false,
        options: rolesLoading
          ? [{ value: '', label: '로딩 중...' }]
          : [
              { value: '', label: '역할 선택' },
              ...roles.map(role => ({
                value: role.id.toString(),
                label: role.name,
              })),
            ],
      },
      {
        key: 'salary',
        label: '급여',
        type: 'number',
        required: false,
      },
      {
        key: 'hire_date',
        label: '입사일',
        type: 'date',
        required: true,
      },
      {
        key: 'can_manage_payments',
        label: '결제 관리 권한',
        type: 'select',
        required: false,
        options: [
          { value: 'false', label: '없음' },
          { value: 'true', label: '있음' },
        ],
      },
      {
        key: 'can_manage_members',
        label: '회원 관리 권한',
        type: 'select',
        required: false,
        options: [
          { value: 'false', label: '없음' },
          { value: 'true', label: '있음' },
        ],
      },
    ],
  };

  // 제출 데이터 변환 처리
  const handleSubmit = async (data: any) => {
    const transformedData = {
      ...data,
      // 문자열을 boolean으로 변환
      can_manage_payments: data.can_manage_payments === 'true',
      can_manage_members: data.can_manage_members === 'true',
      // role_id를 숫자로 변환 (빈 문자열인 경우 null)
      role_id: data.role_id ? parseInt(data.role_id) : null,
      // salary를 숫자로 변환 (빈 문자열인 경우 null)
      salary: data.salary ? parseFloat(data.salary) : null,
      // hire_date가 없으면 오늘 날짜 설정
      hire_date: data.hire_date || new Date().toISOString().split('T')[0],
    };

    await onSubmit(transformedData);
  };

  return (
    <PersonForm
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={handleSubmit}
      config={staffFormConfig}
      person={staff}
      isLoading={isLoading}
    />
  );
};

export default StaffForm;
