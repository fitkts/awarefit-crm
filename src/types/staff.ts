// 직원 기본 정보 인터페이스
export interface Staff {
  id: number;
  staff_number: string;
  name: string;
  phone?: string | null;
  email?: string | null;
  gender?: '남성' | '여성' | null;
  birth_date?: string | null; // YYYY-MM-DD 형식
  hire_date: string; // YYYY-MM-DD 형식
  position: string; // 직책 (트레이너, 관리자, 청소, 등)
  department?: string | null; // 부서
  salary?: number | null;
  address?: string | null;
  notes?: string | null;
  active: boolean;
  created_at: string;
  updated_at: string;
}

// 직원 생성을 위한 입력 데이터
export interface CreateStaffInput {
  name: string;
  phone?: string;
  email?: string;
  gender?: '남성' | '여성';
  birth_date?: string;
  position: string;
  department?: string;
  salary?: number;
  address?: string;
  notes?: string;
}

// 직원 수정을 위한 입력 데이터
export interface UpdateStaffInput extends Partial<CreateStaffInput> {
  id: number;
  active?: boolean;
}

// 직원 검색 필터
export interface StaffSearchFilter {
  search?: string;
  gender?: '남성' | '여성' | '';
  position?: string;
  department?: string;
  active?: boolean | 'all';
  hire_date_from?: string;
  hire_date_to?: string;
  birth_date_from?: string;
  birth_date_to?: string;
  has_phone?: boolean;
  has_email?: boolean;
  age_min?: number;
  age_max?: number;
}

// 직원 통계
export interface StaffStats {
  total: number;
  active: number;
  inactive: number;
  new_this_month: number;
  by_position: Record<string, number>;
  by_department: Record<string, number>;
  average_tenure_months: number;
}

// 공통 개인 정보 인터페이스 (회원과 직원이 공유)
export interface PersonalInfo {
  name: string;
  phone?: string;
  email?: string;
  gender?: '남성' | '여성';
  birth_date?: string;
  address?: string;
  notes?: string;
}

// 공통 폼 타입 (회원/직원 구분)
export type EntityType = 'member' | 'staff';

export interface FormConfig {
  entityType: EntityType;
  title: string;
  submitButtonText: string;
  additionalFields?: Array<{
    key: string;
    label: string;
    type: 'text' | 'select' | 'number' | 'date';
    required?: boolean;
    options?: Array<{ value: string; label: string }>;
  }>;
} 