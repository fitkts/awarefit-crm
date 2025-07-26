import type { Meta, StoryObj } from '@storybook/react-webpack5';
import { FormConfig } from '../../types/staff';
import { PersonForm } from './PersonForm';

const meta: Meta<typeof PersonForm> = {
  title: 'Common/PersonForm',
  component: PersonForm,
  tags: ['autodocs'],
  argTypes: {
    isOpen: { control: 'boolean' },
    isLoading: { control: 'boolean' },
    onClose: { action: 'closed' },
    onSubmit: { action: 'submitted' },
  },
};

export default meta;
type Story = StoryObj<typeof PersonForm>;

const memberConfig: FormConfig = {
  title: '신규 회원 등록',
  entityType: 'member',
  submitButtonText: '회원 등록',
};

const staffConfig: FormConfig = {
  title: '신규 직원 등록',
  entityType: 'staff',
  submitButtonText: '직원 등록',
};

export const NewMember: Story = {
  args: {
    isOpen: true,
    config: memberConfig,
    isLoading: false,
    person: undefined,
  },
};

export const EditMember: Story = {
  args: {
    isOpen: true,
    config: { ...memberConfig, title: '회원 정보 수정' },
    isLoading: false,
    person: {
      id: 1,
      member_number: 'A0001',
      name: '김철수',
      phone: '010-1111-2222',
      email: 'chulsoo@example.com',
      gender: '남성',
      birth_date: '1990-01-01',
      address: '서울시 강남구 테헤란로',
      notes: 'VIP 회원',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      join_date: '2023-01-01',
      active: true,
    },
  },
};

export const NewStaff: Story = {
  args: {
    isOpen: true,
    config: staffConfig,
    isLoading: false,
    person: undefined,
  },
}; 