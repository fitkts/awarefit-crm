import React from 'react';
import { CreateStaffInput, FormConfig, Staff, UpdateStaffInput } from '../../types/staff';
import PersonForm from '../common/PersonForm';

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
  const staffFormConfig: FormConfig = {
    entityType: 'staff',
    title: staff ? '직원 정보 수정' : '새 직원 등록',
    submitButtonText: staff ? '수정' : '등록',
  };

  return (
    <PersonForm
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={onSubmit}
      config={staffFormConfig}
      person={staff}
      isLoading={isLoading}
    />
  );
};

export default StaffForm; 