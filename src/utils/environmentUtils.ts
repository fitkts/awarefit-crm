/**
 * 환경 감지 및 API 호출 유틸리티
 * 브라우저와 Electron 환경을 구분하여 처리
 */

// 환경 타입 정의
export type Environment = 'electron' | 'browser' | 'unknown';

/**
 * 현재 실행 환경을 감지합니다
 */
export function detectEnvironment(): Environment {
  try {
    // Electron 환경 확인
    if (typeof window !== 'undefined' && window.electronAPI) {
      return 'electron';
    }

    // 브라우저 환경 확인
    if (typeof window !== 'undefined' && !window.electronAPI) {
      return 'browser';
    }

    return 'unknown';
  } catch (error) {
    console.warn('환경 감지 실패:', error);
    return 'unknown';
  }
}

/**
 * Electron API가 사용 가능한지 확인합니다
 */
export function isElectronAvailable(): boolean {
  return detectEnvironment() === 'electron';
}

/**
 * 브라우저 환경인지 확인합니다
 */
export function isBrowserEnvironment(): boolean {
  return detectEnvironment() === 'browser';
}

/**
 * Electron API 호출을 안전하게 실행합니다
 * @param apiCall - 실행할 API 호출 함수
 * @param fallbackData - Electron이 없을 때 반환할 기본 데이터
 * @param fallbackMessage - 사용자에게 표시할 메시지
 */
export async function safeElectronCall<T>(
  apiCall: () => Promise<T>,
  fallbackData: T,
  fallbackMessage?: string
): Promise<{ data: T; isFromElectron: boolean; message?: string }> {
  try {
    if (isElectronAvailable()) {
      const data = await apiCall();
      return { data, isFromElectron: true };
    } else {
      const message =
        fallbackMessage ||
        '이 기능은 데스크톱 앱에서만 완전히 지원됩니다. 브라우저에서는 시뮬레이션 데이터를 표시합니다.';

      console.warn('🌐 [Browser Mode]', message);
      return { data: fallbackData, isFromElectron: false, message };
    }
  } catch (error) {
    console.error('API 호출 실패:', error);
    const message = `API 호출에 실패했습니다: ${error instanceof Error ? error.message : '알 수 없는 오류'}`;
    return { data: fallbackData, isFromElectron: false, message };
  }
}

/**
 * 브라우저 환경에서 사용할 시뮬레이션 데이터
 */
export const mockData = {
  members: [
    {
      id: 1,
      name: '김민수',
      phone: '010-1234-5678',
      email: 'kim@example.com',
      gender: '남성' as const,
      birth_date: '1990-01-15',
      join_date: '2025-01-01',
      status: 'active' as const,
      staff_id: 1,
      staff_name: '트레이너A',
      membership_type: '정기회원',
      membership_status: 'active',
    },
    {
      id: 2,
      name: '이영희',
      phone: '010-9876-5432',
      email: 'lee@example.com',
      gender: '여성' as const,
      birth_date: '1985-05-20',
      join_date: '2025-01-10',
      status: 'active' as const,
      staff_id: 2,
      staff_name: '트레이너B',
      membership_type: '정기회원',
      membership_status: 'active',
    },
  ],

  memberStats: {
    total: 2,
    active: 2,
    inactive: 0,
    newThisMonth: 2,
    newThisWeek: 2,
    withMembership: 2,
    withoutMembership: 0,
    activeRate: 100,
    membershipRate: 100,
    growthRate: 100,
  } as const,

  staff: [
    {
      id: 1,
      name: '트레이너A',
      phone: '010-1111-2222',
      email: 'trainera@gym.com',
      position: '트레이너',
      department: '피트니스',
      hire_date: '2024-01-01',
      status: 'active' as const,
      salary: 3000000,
      role: 'trainer' as const,
    },
    {
      id: 2,
      name: '트레이너B',
      phone: '010-3333-4444',
      email: 'trainerb@gym.com',
      position: '트레이너',
      department: '피트니스',
      hire_date: '2024-02-01',
      status: 'active' as const,
      salary: 3200000,
      role: 'trainer' as const,
    },
  ],

  staffStats: {
    total: 2,
    active: 2,
    inactive: 0,
    newThisMonth: 0,
    departments: [{ department: '피트니스', count: 2 }],
    roles: [{ role: 'trainer', count: 2 }],
  } as const,

  payments: [
    {
      id: 1,
      member_id: 1,
      member_name: '김민수',
      amount: 120000,
      payment_method: '카드' as const,
      payment_type: '회원권' as const,
      payment_date: '2025-01-01',
      status: 'completed' as const,
      description: '3개월 회원권',
    },
    {
      id: 2,
      member_id: 2,
      member_name: '이영희',
      amount: 200000,
      payment_method: '카드' as const,
      payment_type: 'PT' as const,
      payment_date: '2025-01-10',
      status: 'completed' as const,
      description: '개인 트레이닝 10회',
    },
  ],

  paymentStats: {
    totalRevenue: 320000,
    thisMonthRevenue: 320000,
    thisWeekRevenue: 0,
    todayRevenue: 0,
    membershipRevenue: 120000,
    ptRevenue: 200000,
    otherRevenue: 0,
    paymentMethods: [
      { method: '카드', amount: 320000, count: 2 },
      { method: '현금', amount: 0, count: 0 },
      { method: '계좌이체', amount: 0, count: 0 },
    ],
    paymentTypes: [
      { type: '회원권', amount: 120000, count: 1 },
      { type: 'PT', amount: 200000, count: 1 },
      { type: '기타', amount: 0, count: 0 },
    ],
  },
};

/**
 * 환경에 따른 사용자 안내 메시지
 */
export function getEnvironmentMessage(): string {
  const env = detectEnvironment();

  switch (env) {
    case 'electron':
      return '✅ 데스크톱 환경에서 실행 중 - 모든 기능을 사용할 수 있습니다.';
    case 'browser':
      return '🌐 브라우저 환경에서 실행 중 - 시뮬레이션 데이터를 표시합니다. 전체 기능을 사용하려면 `npm run dev`로 실행해주세요.';
    default:
      return '⚠️ 환경을 감지할 수 없습니다. 새로고침 후 다시 시도해주세요.';
  }
}
