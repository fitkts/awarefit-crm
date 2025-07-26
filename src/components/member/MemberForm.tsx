import React, { useEffect, useState } from 'react';
import { CreateMemberInput, Member, UpdateMemberInput } from '../../types/member';
import { FormConfig } from '../../types/staff';
import { PersonForm } from '../common/PersonForm';

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
        // API 존재 여부 확인
        if (!window.electronAPI?.database?.staff?.getAll) {
          console.error('🚨 [MemberForm] staff.getAll API가 존재하지 않습니다');
          setStaffList([]);
          return;
        }

        const result = await window.electronAPI.database.staff.getAll({ is_active: true });

        if (!Array.isArray(result)) {
          console.error('🚨 [MemberForm] 직원 목록 응답이 배열이 아닙니다:', result);
          setStaffList([]);
          return;
        }

        const staffOptions = result.map((staff: any) => ({
          id: staff.id,
          name: staff.name,
          position: staff.position,
        }));
        setStaffList(staffOptions);
        console.log('✅ [MemberForm] 직원 목록 로딩 완료:', staffOptions.length, '명');
      } catch (error) {
        console.error('🚨 [MemberForm] 직원 목록 조회 실패:', error);
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
        placeholder: '담당 직원을 선택하세요',
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
    console.log('🔍 [MemberForm] handleSubmit 호출됨');
    console.log('🔍 [MemberForm] 원본 데이터:', data);
    console.log('🔍 [MemberForm] assigned_staff_id 원본값:', data.assigned_staff_id);

    const transformedData = {
      ...data,
      // assigned_staff_id를 숫자로 변환 (빈 문자열인 경우 null)
      assigned_staff_id: data.assigned_staff_id ? parseInt(data.assigned_staff_id) : null,
    };

    console.log('🔍 [MemberForm] 변환된 데이터:', transformedData);
    console.log('🔍 [MemberForm] assigned_staff_id 변환값:', transformedData.assigned_staff_id);

    await onSubmit(transformedData);
  };

  // 초기 assigned_staff_id 값 설정
  const initialAssignedStaffId = member?.assigned_staff_id?.toString() || '';

  return (
    <PersonForm
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={handleSubmit}
      config={memberFormConfig}
      person={
        member
          ? ({
              ...member,
              assigned_staff_id: initialAssignedStaffId, // PersonForm에서 사용할 수 있도록 문자열로 변환
            } as any)
          : undefined
      }
      isLoading={isLoading}
    />
  );
};

export default MemberForm;
