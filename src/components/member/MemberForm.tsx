import React from 'react';
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

const MemberForm: React.FC<MemberFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  member,
  isLoading = false,
}) => {
  const memberFormConfig: FormConfig = {
    entityType: 'member',
    title: member ? '회원 정보 수정' : '새 회원 등록',
    submitButtonText: member ? '수정' : '등록',
  };

  return (
    <PersonForm
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={onSubmit}
      config={memberFormConfig}
      person={member}
      isLoading={isLoading}
    />
  );
};

export default MemberForm;
