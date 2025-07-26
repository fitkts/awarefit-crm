import { calculateAge } from '../memberUtils';

describe('calculateAge', () => {
  // 1. 생일이 지난 경우
  test('should return correct age when birthday has passed this year', () => {
    const birthDate = '1990-01-01';
    const today = new Date('2024-07-22'); // 오늘 날짜를 고정하여 테스트
    jest.spyOn(global, 'Date').mockImplementation(() => today);
    expect(calculateAge(birthDate)).toBe(34);
  });

  // 2. 생일이 아직 지나지 않은 경우
  test('should return correct age when birthday has not passed this year', () => {
    const birthDate = '1990-12-31';
    const today = new Date('2024-07-22');
    jest.spyOn(global, 'Date').mockImplementation(() => today);
    expect(calculateAge(birthDate)).toBe(33);
  });

  // 3. 오늘이 생일인 경우
  test('should return correct age when today is the birthday', () => {
    const birthDate = '1990-07-22';
    const today = new Date('2024-07-22');
    jest.spyOn(global, 'Date').mockImplementation(() => today);
    expect(calculateAge(birthDate)).toBe(34);
  });

  // 4. 윤년인 경우
  test('should handle leap years correctly', () => {
    const birthDate = '2000-02-29';
    const today = new Date('2024-02-28');
    jest.spyOn(global, 'Date').mockImplementation(() => today);
    expect(calculateAge(birthDate)).toBe(23);
  });

  // 5. birthDate가 null 또는 undefined인 경우
  test('should return undefined for null or undefined birthDate', () => {
    expect(calculateAge(null)).toBeUndefined();
    expect(calculateAge(undefined)).toBeUndefined();
  });

  // 6. 유효하지 않은 날짜 형식인 경우
  test('should return undefined for invalid date format', () => {
    expect(calculateAge('invalid-date')).toBeUndefined();
    expect(calculateAge('1990-99-99')).toBeUndefined();
  });

  // 7. 미래 날짜인 경우
  test('should return undefined for a future birth date', () => {
    const futureDate = new Date();
    futureDate.setFullYear(futureDate.getFullYear() + 1);
    const birthDate = futureDate.toISOString().split('T')[0];
    expect(calculateAge(birthDate)).toBeUndefined();
  });
});
