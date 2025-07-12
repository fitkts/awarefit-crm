// 회원 기본 정보 인터페이스
export interface Member {
  id: number;
  member_number: string;
  name: string;
  phone?: string | null;
  email?: string | null;
  gender?: '남성' | '여성' | null;
  birth_date?: string | null; // YYYY-MM-DD 형식
  join_date: string; // YYYY-MM-DD 형식
  address?: string | null;
  notes?: string | null;
  active: boolean;
  created_at: string;
  updated_at: string;
}

// 회원 생성을 위한 입력 데이터 (ID와 자동 생성 필드 제외)
export interface CreateMemberInput {
  name: string;
  phone?: string;
  email?: string;
  gender?: '남성' | '여성';
  birth_date?: string;
  address?: string;
  notes?: string;
}

// 회원 수정을 위한 입력 데이터
export interface UpdateMemberInput extends Partial<CreateMemberInput> {
  id: number;
  active?: boolean;
}

// 고급 회원 검색 필터
export interface MemberSearchFilter {
  search?: string; // 이름 또는 전화번호 검색
  gender?: '남성' | '여성' | '';
  active?: boolean | 'all';
  join_date_from?: string;
  join_date_to?: string;
  birth_date_from?: string;
  birth_date_to?: string;
  has_phone?: boolean;
  has_email?: boolean;
  has_membership?: boolean;
  age_min?: number;
  age_max?: number;
}

// 정렬 옵션
export interface SortOption {
  field: keyof Member | 'age' | 'membership_status';
  direction: 'asc' | 'desc';
}

// 페이지네이션 정보
export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// 회원 목록 응답
export interface MemberListResponse {
  members: Member[];
  pagination: PaginationInfo;
}

// API 응답 기본 구조
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// 회원 통계 정보
export interface MemberStats {
  total: number;
  active: number;
  inactive: number;
  new_this_month: number;
  new_this_week: number;
  male: number;
  female: number;
  with_membership: number;
  without_membership: number;
  average_age: number;
  age_distribution: {
    '10-19': number;
    '20-29': number;
    '30-39': number;
    '40-49': number;
    '50-59': number;
    '60+': number;
  };
  recent_registrations: Member[];
  upcoming_membership_expiry: number;
}

// 회원권 타입
export interface MembershipType {
  id: number;
  name: string;
  durationMonths: number;
  price: number;
  description?: string | null;
  isActive: boolean;
  createdAt: string;
}

// 회원권 이용 이력
export interface MembershipHistory {
  id: number;
  memberId: number;
  membershipTypeId: number;
  paymentId: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
  createdAt: string;

  // 조인된 데이터
  member?: Member;
  membershipType?: MembershipType;
}

// 확장된 회원권 이력 (상세 정보 포함)
export interface ExtendedMembershipHistory extends MembershipHistory {
  membershipType: MembershipType;
  daysRemaining: number;
  isExpiringSoon: boolean;
}

// 회원 상세 정보 (관련 데이터 포함)
export interface MemberDetail extends Member {
  age?: number; // null 대신 undefined 사용
  currentMembership?: ExtendedMembershipHistory;
  membershipHistory: MembershipHistory[];
  totalPayments: number;
  lastVisit?: string | null;
  visitCount: number;
  totalSpent: number;
  averageVisitsPerMonth: number;
  membershipStatus: 'active' | 'expired' | 'expiring_soon' | 'none';
  profileImage?: string | null;
}

// 회원 등록 마법사 단계
export interface MemberRegistrationStep {
  step: number;
  title: string;
  completed: boolean;
  data: Partial<CreateMemberInput>;
}

// 일괄 작업 타입
export interface BulkAction {
  type: 'delete' | 'activate' | 'deactivate' | 'export';
  label: string;
  icon: string;
  confirmMessage?: string;
  requiresConfirmation: boolean;
}

// 테이블 컬럼 설정
export interface MemberTableColumn {
  key: keyof Member | 'age' | 'membership_status' | 'actions';
  label: string;
  sortable?: boolean;
  filterable?: boolean;
  width?: string;
  visible?: boolean;
  sticky?: boolean;
  render?: (value: any, member: Member) => React.ReactNode;
}

// 필터 프리셋
export interface FilterPreset {
  id: string;
  name: string;
  filter: MemberSearchFilter;
  icon?: string;
  count?: number;
}

// 데이터 내보내기 옵션
export interface ExportOptions {
  format: 'csv' | 'excel' | 'pdf';
  columns: string[];
  filter?: MemberSearchFilter;
  includeStats?: boolean;
}

// 회원 가져오기 결과
export interface ImportResult {
  success: number;
  failed: number;
  errors: Array<{
    row: number;
    field: string;
    message: string;
    data: any;
  }>;
  duplicates: number;
}

// 회원 활동 로그
export interface MemberActivityLog {
  id: number;
  memberId: number;
  type: 'registration' | 'update' | 'payment' | 'visit' | 'membership_change';
  description: string;
  timestamp: string;
  staffId?: number;
  metadata?: Record<string, any>;
}

// 대시보드 위젯 데이터
export interface DashboardWidget {
  id: string;
  title: string;
  type: 'stat' | 'chart' | 'list' | 'progress';
  size: 'small' | 'medium' | 'large';
  data: any;
  refreshInterval?: number;
}

// 알림 및 얼럿
export interface MemberAlert {
  id: string;
  type: 'info' | 'warning' | 'error' | 'success';
  title: string;
  message: string;
  memberId?: number;
  actionRequired?: boolean;
  createdAt: string;
  readAt?: string | null;
}

// 폼 상태 및 유효성 검사
export interface FormValidation {
  field: keyof CreateMemberInput;
  rules: ValidationRule[];
  message: string;
}

export interface ValidationRule {
  type: 'required' | 'email' | 'phone' | 'date' | 'minLength' | 'maxLength' | 'pattern' | 'custom';
  value?: any;
  validator?: (value: any) => boolean;
}

// 유틸리티 타입들
export type MemberStatus = 'active' | 'inactive';
export type MembershipStatus = 'active' | 'expired' | 'expiring_soon' | 'none';
export type Gender = '남성' | '여성';

// React 컴포넌트를 위한 타입 import
import React from 'react';

// 유틸리티 함수들의 타입 정의
export interface MemberUtils {
  calculateAge: (birthDate?: string | null) => number | undefined;
  formatPhoneNumber: (phone?: string | null) => string;
  getMembershipStatus: (membership?: ExtendedMembershipHistory) => MembershipStatus;
  isValidEmail: (email: string) => boolean;
  isValidPhone: (phone: string) => boolean;
}
