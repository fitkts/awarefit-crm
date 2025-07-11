// 공통 응답 타입
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// 페이지네이션 타입
export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// 필터 기본 타입
export interface BaseFilter {
  search?: string;
  active?: boolean | 'all';
  dateFrom?: string;
  dateTo?: string;
}

// 이벤트 핸들러 타입
export type EventHandler<T = any> = (data: T) => void;
export type AsyncEventHandler<T = any> = (data: T) => Promise<void>;

// 폼 상태 타입
export interface FormState {
  isLoading: boolean;
  errors: Record<string, string>;
  isDirty: boolean;
}

// 테이블 컬럼 타입
export interface TableColumn<T = any> {
  key: keyof T;
  label: string;
  sortable?: boolean;
  width?: string;
  render?: (value: any, row: T) => React.ReactNode;
}

// 색상 변형 타입
export type ColorVariant = 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';

// 크기 변형 타입
export type SizeVariant = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
