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
  role_id?: number | null; // 역할 ID (새로 추가)
  notes?: string | null;
  is_active: boolean; // 데이터베이스 컬럼명과 일치
  can_manage_payments: boolean;
  can_manage_members: boolean;
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
  hire_date: string; // 입사일은 필수
}

// 직원 수정을 위한 입력 데이터
export interface UpdateStaffInput extends Partial<CreateStaffInput> {
  id: number;
  is_active?: boolean;
  role_id?: number;
  can_manage_payments?: boolean;
  can_manage_members?: boolean;
}

// 직원 검색 필터
export interface StaffSearchFilter {
  search?: string;
  gender?: '남성' | '여성' | '';
  position?: string;
  department?: string;
  role_id?: number | 'all';
  is_active?: boolean | 'all';
  hire_date_from?: string;
  hire_date_to?: string;
  birth_date_from?: string;
  birth_date_to?: string;
  has_phone?: boolean;
  has_email?: boolean;
  salary_min?: number;
  salary_max?: number;
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
  by_role: Record<string, number>;
  average_tenure_months: number;
  total_salary_cost: number;
  average_salary: number;
}

// 직원 권한 관리
export interface StaffPermissions {
  member_management: boolean;
  payment_management: boolean;
  staff_management: boolean;
  report_access: boolean;
  system_settings: boolean;
}

// 직원 역할 정의
export interface StaffRole {
  id: number;
  name: string;
  permissions: StaffPermissions;
  description?: string | null;
  is_active: boolean;
  created_at: string;
}

// 직원 역할 생성/수정 입력
export interface StaffRoleInput {
  name: string;
  permissions: StaffPermissions;
  description?: string;
}

// 급여 조정 이력
export interface StaffSalaryHistory {
  id: number;
  staff_id: number;
  previous_salary?: number | null;
  new_salary: number;
  adjustment_amount: number;
  adjustment_reason?: string | null;
  effective_date: string; // YYYY-MM-DD 형식
  created_by?: number | null;
  created_at: string;
}

// 급여 조정 입력
export interface SalaryAdjustmentInput {
  staff_id: number;
  new_salary: number;
  adjustment_reason?: string;
  effective_date: string;
}

// 직원 상세 정보 (관련 데이터 포함)
export interface StaffDetail extends Staff {
  age?: number;
  tenure_months?: number;
  role?: StaffRole | null;
  salary_history: StaffSalaryHistory[];
  managed_members_count: number;
  total_sales_amount: number;
  last_salary_adjustment?: StaffSalaryHistory | null;
}

// 정렬 옵션
export interface StaffSortOption {
  field: 'name' | 'hire_date' | 'position' | 'department' | 'salary' | 'created_at';
  direction: 'asc' | 'desc';
}

// 페이지네이션 정보
export interface StaffPaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// 일괄 작업 타입
export type StaffBulkAction =
  | 'activate'
  | 'deactivate'
  | 'delete'
  | 'assign_role'
  | 'update_department'
  | 'salary_adjustment';

// 공통 개인 정보 인터페이스 (회원과 직원이 공유)
export interface PersonalInfo {
  name: string;
  phone?: string;
  email?: string;
  gender?: '남성' | '여성';
  birth_date?: string;
  join_date?: string; // 회원 가입일 (회원 전용)
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
    type: 'text' | 'select' | 'number' | 'date' | 'textarea';
    required?: boolean;
    placeholder?: string;
    options?: Array<{ value: string; label: string }>;
  }>;
}
