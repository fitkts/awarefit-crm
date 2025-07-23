// 결제 기본 정보 인터페이스
export interface Payment {
  id: number;
  payment_number: string;
  member_id: number;
  payment_type: 'membership' | 'pt' | 'other';
  membership_type_id?: number | null;
  pt_package_id?: number | null;
  amount: number; // DECIMAL(10,2) → 원 단위 정수로 변환
  payment_method: '현금' | '카드' | '계좌이체' | '온라인결제' | '기타';
  payment_date: string; // YYYY-MM-DD 형식
  staff_id: number;
  notes?: string | null;
  status: 'completed' | 'refunded' | 'cancelled';
  locker_type?: string | null; // 'individual', 'couple', etc.
  expiry_date?: string | null; // YYYY-MM-DD 형식
  auto_renewal: boolean;
  created_at: string;
}

// 결제 생성을 위한 입력 데이터
export interface CreatePaymentInput {
  member_id: number;
  payment_type: 'membership' | 'pt' | 'other';
  membership_type_id?: number;
  pt_package_id?: number;
  amount: number;
  payment_method: '현금' | '카드' | '계좌이체' | '온라인결제' | '기타';
  payment_date?: string; // 기본값: 오늘 날짜
  staff_id: number;
  notes?: string;
  locker_type?: string;
  expiry_date?: string;
  auto_renewal?: boolean;
  items?: CreatePaymentItemInput[]; // 복합 결제 지원
}

// 결제 수정을 위한 입력 데이터
export interface UpdatePaymentInput extends Partial<CreatePaymentInput> {
  id: number;
  status?: 'completed' | 'refunded' | 'cancelled';
}

// 결제 상세 항목 인터페이스
export interface PaymentItem {
  id: number;
  payment_id: number;
  item_type: 'membership' | 'pt' | 'locker';
  item_subtype?: string | null; // '1m', '3m', '12m' or '5sessions', '10sessions', '20sessions'
  item_name: string; // '1개월 회원권', '10회 피티', '개인 락커'
  quantity: number;
  unit_price: number; // 원 단위
  total_amount: number; // 원 단위
  specifications?: string | null; // JSON 형태 추가 정보
  created_at: string;
}

// 결제 항목 생성을 위한 입력 데이터
export interface CreatePaymentItemInput {
  item_type: 'membership' | 'pt' | 'locker';
  item_subtype?: string;
  item_name: string;
  quantity: number;
  unit_price: number;
  total_amount: number;
  specifications?: string;
}

// 락커 배정 인터페이스
export interface LockerAssignment {
  id: number;
  member_id: number;
  payment_id: number;
  locker_number: string;
  locker_type: 'individual' | 'couple';
  start_date: string; // YYYY-MM-DD 형식
  end_date: string; // YYYY-MM-DD 형식
  monthly_fee: number; // 원 단위
  status: 'active' | 'expired' | 'cancelled';
  created_at: string;
  updated_at: string;
}

// 락커 배정 생성을 위한 입력 데이터
export interface CreateLockerAssignmentInput {
  member_id: number;
  payment_id: number;
  locker_number: string;
  locker_type: 'individual' | 'couple';
  start_date: string;
  end_date: string;
  monthly_fee: number;
}

// 환불 정보 인터페이스
export interface Refund {
  id: number;
  payment_id: number;
  requested_by: number; // staff.id
  approved_by?: number | null; // staff.id
  refund_amount: number; // 원 단위
  reason: string;
  refund_method: 'account_transfer' | 'card_cancel' | 'cash';
  account_info?: string | null; // 환불 계좌 정보
  status: 'pending' | 'approved' | 'rejected' | 'processed';
  requested_at: string;
  approved_at?: string | null;
  processed_at?: string | null;
  notes?: string | null;
}

// 환불 요청을 위한 입력 데이터
export interface CreateRefundInput {
  payment_id: number;
  refund_amount: number;
  reason: string;
  refund_method: 'account_transfer' | 'card_cancel' | 'cash';
  account_info?: string;
  notes?: string;
}

// 환불 승인/거부를 위한 입력 데이터
export interface UpdateRefundInput {
  status: 'approved' | 'rejected' | 'processed';
  approved_by?: number;
  notes?: string;
}

// 결제 이력 인터페이스
export interface PaymentHistory {
  id: number;
  payment_id: number;
  action: 'created' | 'updated' | 'refund_requested' | 'refunded' | 'cancelled';
  old_value?: string | null; // JSON 형태
  new_value?: string | null; // JSON 형태
  performed_by: number; // staff.id
  notes?: string | null;
  ip_address?: string | null;
  created_at: string;
}

// 결제 검색 필터
export interface PaymentSearchFilter {
  search?: string; // 결제번호, 회원명, 전화번호 검색
  payment_type?: 'membership' | 'pt' | 'other' | 'all';
  payment_method?: '현금' | '카드' | '계좌이체' | '온라인결제' | '기타' | 'all';
  status?: 'completed' | 'refunded' | 'cancelled' | 'all';
  member_id?: number;
  staff_id?: number;
  payment_date_from?: string;
  payment_date_to?: string;
  amount_min?: number;
  amount_max?: number;
  has_refund?: boolean;
  expiry_date_from?: string;
  expiry_date_to?: string;
}

// 결제 통계 정보
export interface PaymentStats {
  total_payments: number;
  total_amount: number;
  today_payments: number;
  today_amount: number;
  month_payments: number;
  month_amount: number;
  by_type: {
    membership: { count: number; amount: number };
    pt: { count: number; amount: number };
    other: { count: number; amount: number };
  };
  by_method: {
    현금: { count: number; amount: number };
    카드: { count: number; amount: number };
    계좌이체: { count: number; amount: number };
    온라인결제: { count: number; amount: number };
    기타: { count: number; amount: number };
  };
  by_status: {
    completed: { count: number; amount: number };
    refunded: { count: number; amount: number };
    cancelled: { count: number; amount: number };
  };
  recent_payments: PaymentDetail[];
  top_staff: Array<{ staff_id: number; staff_name: string; count: number; amount: number }>;
  pending_refunds: number;
  expiring_soon: number; // 30일 이내 만료 예정
}

// 확장된 결제 상세 정보 (관련 데이터 포함)
export interface PaymentDetail extends Payment {
  member_name: string;
  member_phone?: string | null;
  member_number: string;
  staff_name: string;
  membership_type_name?: string | null;
  pt_package_name?: string | null;
  items: PaymentItem[];
  locker_assignments: LockerAssignment[];
  refunds: Refund[];
  history: PaymentHistory[];
  remaining_amount?: number; // 환불 후 남은 금액
  is_refundable: boolean;
  days_until_expiry?: number | null;
}

// 정렬 옵션
export interface PaymentSortOption {
  field: 'payment_date' | 'amount' | 'member_name' | 'staff_name' | 'payment_type' | 'status' | 'created_at';
  direction: 'asc' | 'desc';
}

// 페이지네이션 정보 (기존 패턴 재사용)
export interface PaymentPaginationInfo {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

// 일괄 작업
export interface PaymentBulkAction {
  type: 'cancel' | 'export' | 'mark_completed';
  label: string;
  icon: string;
  requiresConfirmation: boolean;
}

// 결제 테이블 컬럼 설정
export interface PaymentTableColumn {
  key: keyof Payment | 'member_name' | 'staff_name' | 'items_summary' | 'actions';
  label: string;
  sortable?: boolean;
  filterable?: boolean;
  width?: string;
  visible?: boolean;
  sticky?: boolean;
  render?: (value: any, payment: Payment) => React.ReactNode;
}

// API 응답 타입
export interface PaymentListResponse {
  payments: PaymentDetail[];
  pagination: PaymentPaginationInfo;
  stats?: PaymentStats;
}

// 환불 가능 여부 체크 결과
export interface RefundEligibility {
  eligible: boolean;
  reason?: string;
  max_refund_amount: number;
  suggested_method: 'account_transfer' | 'card_cancel' | 'cash';
}

// 결제 유효성 검사 규칙
export interface PaymentValidationRule {
  type: 'required' | 'min_amount' | 'max_amount' | 'member_exists' | 'staff_permissions' | 'custom';
  value?: any;
  validator?: (value: any) => boolean;
  message: string;
}

// 결제 알림 설정
export interface PaymentNotification {
  id: number;
  type: 'expiry_warning' | 'payment_due' | 'refund_approved' | 'payment_completed';
  recipient_type: 'member' | 'staff' | 'admin';
  recipient_id: number;
  title: string;
  message: string;
  scheduled_at: string;
  sent_at?: string | null;
  status: 'pending' | 'sent' | 'failed';
}

// 결제 리포트 옵션
export interface PaymentReportOptions {
  type: 'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom';
  start_date: string;
  end_date: string;
  group_by: 'date' | 'type' | 'method' | 'staff' | 'member';
  include_refunds: boolean;
  include_cancelled: boolean;
  format: 'summary' | 'detailed' | 'chart_data';
}

// 유틸리티 타입들
export type PaymentType = 'membership' | 'pt' | 'other';
export type PaymentMethod = '현금' | '카드' | '계좌이체' | '온라인결제' | '기타';
export type PaymentStatus = 'completed' | 'refunded' | 'cancelled';
export type RefundStatus = 'pending' | 'approved' | 'rejected' | 'processed';
export type LockerType = 'individual' | 'couple';

// 폼 구성 인터페이스 (기존 FormConfig 확장)
export interface PaymentFormConfig {
  entityType: 'payment';
  title: string;
  submitButtonText: string;
  allowMultipleItems: boolean;
  defaultPaymentMethod?: PaymentMethod;
  enableAutoCalculation: boolean;
  restrictToMembershipTypes?: number[];
  restrictToPTPackages?: number[];
}

// 유틸리티 함수들의 타입 정의
export interface PaymentUtils {
  formatCurrency: (amount: number) => string;
  calculateExpiry: (startDate: string, duration: number, unit: 'months' | 'days') => string;
  validatePaymentAmount: (amount: number, type: PaymentType) => boolean;
  generatePaymentNumber: (date?: string) => string;
  calculateRefundAmount: (payment: Payment, refundDate: string) => number;
  isRefundEligible: (payment: Payment) => RefundEligibility;
} 