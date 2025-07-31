import {
  Member,
  MemberDetail,
  ExtendedMembershipHistory,
  MembershipStatus,
  MemberUtils,
} from '../types/member';

/**
 * 회원 관련 유틸리티 함수들
 * 타입 안전성을 보장하고 일관된 데이터 처리를 위한 공통 함수들
 */

// 나이 계산 함수 (null-safe)
export const calculateAge = (birthDate?: string | null): number | undefined => {
  if (!birthDate) return undefined;

  try {
    const today = new Date();
    const birth = new Date(birthDate);

    // 유효하지 않은 날짜 체크
    if (isNaN(birth.getTime())) return undefined;

    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }

    return age >= 0 ? age : undefined;
  } catch {
    return undefined;
  }
};

// 전화번호 포맷팅 (null-safe)
export const formatPhoneNumber = (phone?: string | null): string => {
  if (!phone) return '미등록';

  // 숫자만 추출
  const cleaned = phone.replace(/\D/g, '');

  // 한국 휴대폰 번호 형식으로 포맷팅
  if (cleaned.length === 11 && cleaned.startsWith('01')) {
    return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 7)}-${cleaned.slice(7)}`;
  }

  return phone; // 원본 반환
};

// 이메일 포맷팅 (null-safe)
export const formatEmail = (email?: string | null): string => {
  return email || '미등록';
};

// 주소 포맷팅 (null-safe)
export const formatAddress = (address?: string | null): string => {
  return address || '미등록';
};

// 회원권 상태 계산
export const getMembershipStatus = (membership?: ExtendedMembershipHistory): MembershipStatus => {
  if (!membership || !membership.isActive) return 'none';

  const today = new Date();
  const endDate = new Date(membership.endDate);

  if (endDate < today) return 'expired';

  const daysRemaining = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  if (daysRemaining <= 7) return 'expiring_soon';

  return 'active';
};

// 이메일 유효성 검사
export const isValidEmail = (email: string): boolean => {
  if (!email) return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// 전화번호 유효성 검사
export const isValidPhone = (phone: string): boolean => {
  if (!phone) return false;
  const phoneRegex = /^01[0-9]-?[0-9]{4}-?[0-9]{4}$/;
  return phoneRegex.test(phone.replace(/-/g, ''));
};

// 생년월일 유효성 검사
export const isValidBirthDate = (birthDate: string): boolean => {
  if (!birthDate) return false;

  try {
    const date = new Date(birthDate);
    const year = date.getFullYear();
    const currentYear = new Date().getFullYear();

    return !isNaN(date.getTime()) && year >= 1900 && year <= currentYear;
  } catch {
    return false;
  }
};

// 회원 데이터 정제 함수 (DB에서 가져온 데이터의 null/undefined 처리)
export const sanitizeMemberData = (member: any): Member => {
  return {
    ...member,
    phone: member.phone || null,
    email: member.email || null,
    gender: member.gender || null,
    birth_date: member.birth_date || null,
    address: member.address || null,
    emergency_contact: member.emergency_contact || null,
    emergency_phone: member.emergency_phone || null,
    notes: member.notes || null,
  };
};

// 회원 상세 정보 생성 헬퍼 (타입 안전한 변환)
export const createMemberDetail = (
  member: Member,
  additionalData: Partial<Omit<MemberDetail, keyof Member>> = {}
): MemberDetail => {
  return {
    ...member,
    age: calculateAge(member.birth_date),
    membershipHistory: [],
    totalPayments: 0,
    visitCount: 0,
    totalSpent: 0,
    averageVisitsPerMonth: 0,
    membershipStatus: 'none',
    ...additionalData,
  };
};

// 회원 검색 필터링 함수
export const filterMembers = (members: Member[], searchTerm: string): Member[] => {
  if (!searchTerm.trim()) return members;

  const term = searchTerm.toLowerCase();

  return members.filter(
    member =>
      member.name.toLowerCase().includes(term) ||
      member.member_number.toLowerCase().includes(term) ||
      (member.phone && member.phone.replace(/-/g, '').includes(term.replace(/-/g, ''))) ||
      (member.email && member.email.toLowerCase().includes(term))
  );
};

// 날짜 포맷팅 유틸리티
export const formatDate = (date: string | Date, format: 'ko-KR' | 'en-US' = 'ko-KR'): string => {
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString(format);
  } catch {
    return '날짜 오류';
  }
};

// 회원 통계 계산 헬퍼
export const calculateMemberStats = (members: Member[]) => {
  const total = members.length;
  const active = members.filter(m => m.active).length;
  const inactive = total - active;

  const genderStats = members.reduce(
    (acc, member) => {
      if (member.gender === '남성') acc.male++;
      else if (member.gender === '여성') acc.female++;
      return acc;
    },
    { male: 0, female: 0 }
  );

  // 연령대 분포 계산
  const ageDistribution = members.reduce(
    (acc, member) => {
      const age = calculateAge(member.birth_date);
      if (age === undefined) return acc;

      if (age < 20) acc['10-19']++;
      else if (age < 30) acc['20-29']++;
      else if (age < 40) acc['30-39']++;
      else if (age < 50) acc['40-49']++;
      else if (age < 60) acc['50-59']++;
      else acc['60+']++;

      return acc;
    },
    { '10-19': 0, '20-29': 0, '30-39': 0, '40-49': 0, '50-59': 0, '60+': 0 }
  );

  // 평균 나이 계산
  const agesArray = members
    .map(m => calculateAge(m.birth_date))
    .filter((age): age is number => age !== undefined);

  const averageAge =
    agesArray.length > 0 ? agesArray.reduce((sum, age) => sum + age, 0) / agesArray.length : 0;

  return {
    total,
    active,
    inactive,
    ...genderStats,
    ageDistribution,
    averageAge: Number(averageAge.toFixed(1)),
  };
};

// 에러 핸들링 래퍼
export const safeExecute = <T>(fn: () => T, fallback: T): T => {
  try {
    return fn();
  } catch {
    return fallback;
  }
};

// 디바운스 함수
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;

  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(null, args), wait);
  };
};

// 유틸리티 객체 (인터페이스 구현)
export const memberUtils: MemberUtils = {
  calculateAge,
  formatPhoneNumber,
  getMembershipStatus,
  isValidEmail,
  isValidPhone,
};

// 기본 export
export default {
  calculateAge,
  formatPhoneNumber,
  formatEmail,
  formatAddress,
  getMembershipStatus,
  isValidEmail,
  isValidPhone,
  isValidBirthDate,
  sanitizeMemberData,
  createMemberDetail,
  filterMembers,
  formatDate,
  calculateMemberStats,
  safeExecute,
  debounce,
  memberUtils,
};
