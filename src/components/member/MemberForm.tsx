import React, { useEffect, useState } from 'react';
import { CreateMemberInput, Member, UpdateMemberInput } from '../../types/member';
import { FormConfig } from '../../types/staff';
import PersonForm from '../common/PersonForm';

interface MemberFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateMemberInput | UpdateMemberInput) => Promise<void>;
  member?: Member; // 수정 모드일 때 전달되는 기존 회원 데이터
  isLoading?: boolean;
}

interface StaffOption {
  id: number;
  name: string;
  position: string;
}

const MemberForm: React.FC<MemberFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  member,
  isLoading = false,
}) => {
  const [staffList, setStaffList] = useState<StaffOption[]>([]);
  const [staffLoading, setStaffLoading] = useState(false);

  // 직원 목록 조회
  useEffect(() => {
    const fetchStaff = async () => {
      if (!isOpen) return;

      setStaffLoading(true);
      try {
        const result = await window.electronAPI.database.staff.getAll({ is_active: true });
        const staffOptions = result.map((staff: any) => ({
          id: staff.id,
          name: staff.name,
          position: staff.position,
        }));
        setStaffList(staffOptions);
      } catch (error) {
        console.error('직원 목록 조회 실패:', error);
        setStaffList([]);
      } finally {
        setStaffLoading(false);
      }
    };

    fetchStaff();
  }, [isOpen]);

  const memberFormConfig: FormConfig = {
    entityType: 'member',
    title: member ? '회원 정보 수정' : '새 회원 등록',
    submitButtonText: member ? '수정' : '등록',
    additionalFields: [
      {
        key: 'assigned_staff_id',
        label: '담당 직원',
        type: 'select',
        required: false,
        options: staffLoading
          ? [{ value: '', label: '직원 목록 로딩 중...' }]
          : [
            { value: '', label: '담당 직원 선택 (선택사항)' },
            ...staffList.map(staff => ({
              value: staff.id.toString(),
              label: `${staff.name} (${staff.position})`,
            })),
          ],
      },
    ],
  };

  // 제출 데이터 변환 처리
  const handleSubmit = async (data: any) => {
    const transformedData = {
      ...data,
      // assigned_staff_id를 숫자로 변환 (빈 문자열인 경우 null)
      assigned_staff_id: data.assigned_staff_id ? parseInt(data.assigned_staff_id) : null,
    };

    await onSubmit(transformedData);
  };

  return (
    <PersonForm
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={handleSubmit}
      config={memberFormConfig}
      person={member}
      isLoading={isLoading}
    />
  );
};

export default MemberForm;
