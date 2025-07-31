import { expect, test } from '@playwright/test';

test.describe('🎨 UI 요소 및 폼 기능 테스트', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test.describe('회원 관리 폼 테스트', () => {
    test.beforeEach(async ({ page }) => {
      await page.click('text=회원 관리');
    });

    test('회원 등록 모달 열기/닫기', async ({ page }) => {
      // 모달 열기
      await page.click('text=신규등록');

      // 모달 헤더 확인
      await expect(page.getByRole('heading', { name: '새 회원 등록' })).toBeVisible();

      // 모달 배경 확인
      await expect(page.locator('.fixed.inset-0.bg-black.bg-opacity-50')).toBeVisible();

      // 닫기 버튼으로 모달 닫기
      await page.click('text=닫기');

      // 모달이 사라졌는지 확인
      await expect(page.getByRole('heading', { name: '새 회원 등록' })).not.toBeVisible();
    });

    test('회원 등록 폼 필드 테스트', async ({ page }) => {
      await page.click('text=신규등록');

      // 필수 필드 확인
      await expect(page.locator('text=이름').locator('..').getByText('*')).toBeVisible();

      // 기본 정보 필드들
      const nameField = page.getByPlaceholder('이름을 입력하세요');
      await expect(nameField).toBeVisible();
      await nameField.fill('테스트 사용자');

      // 성별 선택
      const genderSelect = page.locator('select').first();
      await genderSelect.selectOption('남성');

      // 생년월일 입력
      const birthDateField = page.locator('input[type="date"]').first();
      await birthDateField.fill('1990-05-15');

      // 연락처 필드들
      const phoneField = page.getByPlaceholder('010-0000-0000');
      await phoneField.fill('010-1234-5678');

      const emailField = page.getByPlaceholder('example@email.com');
      await emailField.fill('test@example.com');

      // 주소 필드
      const addressField = page.getByPlaceholder('주소를 입력하세요');
      await addressField.fill('서울시 강남구');

      // 메모 필드
      const memoField = page.getByPlaceholder('추가 정보나 특이사항');
      await memoField.fill('테스트 회원입니다.');

      // 입력된 값 확인
      await expect(nameField).toHaveValue('테스트 사용자');
      await expect(phoneField).toHaveValue('010-1234-5678');
      await expect(emailField).toHaveValue('test@example.com');
    });

    test('회원 등록 폼 제출 테스트', async ({ page }) => {
      await page.click('text=신규등록');

      // 필수 필드 입력
      await page.getByPlaceholder('이름을 입력하세요').fill('테스트 사용자');
      await page.locator('select').first().selectOption('남성');
      await page.getByPlaceholder('010-0000-0000').fill('010-1234-5678');

      // 등록 버튼 클릭
      await page.click('text=등록');

      // 오류 메시지나 성공 메시지 확인 (Electron API 오류 예상)
      // 현재는 API 오류가 발생하므로 오류 토스트가 나타날 것으로 예상
      await expect(page.locator('.fixed').filter({ hasText: '실패' })).toBeVisible({
        timeout: 5000,
      });
    });

    test('검색 기능 테스트', async ({ page }) => {
      const searchField = page.getByPlaceholder('회원 이름, 전화번호, 이메일 검색');

      // 검색 필드 확인
      await expect(searchField).toBeVisible();

      // 검색어 입력
      await searchField.fill('김');

      // 검색 실행 (Enter 키)
      await searchField.press('Enter');

      // 검색 결과 또는 오류 메시지 확인
      // 현재는 API 오류로 인해 "검색 결과가 없습니다" 메시지가 표시될 것
      await expect(page.getByText('검색 결과가 없습니다')).toBeVisible();
    });

    test('필터 버튼 기능 테스트', async ({ page }) => {
      // 기본 필터 버튼들 확인
      await expect(page.getByRole('button', { name: '전체 회원' })).toBeVisible();
      await expect(page.getByRole('button', { name: '활성 회원' })).toBeVisible();
      await expect(page.getByRole('button', { name: '비활성 회원' })).toBeVisible();

      // 새로운 이벤트 형식 프리셋 확인
      await expect(page.getByRole('button', { name: '이번달 생일' })).toBeVisible();
      await expect(page.getByRole('button', { name: '가입 1주년' })).toBeVisible();

      // '전체 회원' 필터 클릭 테스트 - 모든 회원이 표시되어야 함
      await page.click('text=전체 회원');
      await page.waitForTimeout(1000); // API 호출 대기

      // 활성 회원 필터 클릭 테스트
      await page.click('text=활성 회원');
      await page.waitForTimeout(1000); // API 호출 대기

      // 이벤트 형식 필터 테스트
      await page.click('text=이번달 생일');
      await page.waitForTimeout(1000); // API 호출 대기
    });
  });

  test.describe('결제 관리 폼 테스트', () => {
    test.beforeEach(async ({ page }) => {
      await page.click('text=결제 관리');
    });

    test('결제 등록 모달 열기/닫기', async ({ page }) => {
      // 모달 열기
      await page.click('text=새 결제');

      // 모달 헤더 확인
      await expect(page.getByRole('heading', { name: '새 결제 등록' })).toBeVisible();

      // 닫기 버튼으로 모달 닫기
      await page.click('text=취소');

      // 모달이 사라졌는지 확인
      await expect(page.getByRole('heading', { name: '새 결제 등록' })).not.toBeVisible();
    });

    test('결제 등록 폼 필드 테스트', async ({ page }) => {
      await page.click('text=새 결제');

      // 필수 필드들 확인
      await expect(page.getByText('회원 선택 *')).toBeVisible();
      await expect(page.getByText('담당 직원 *')).toBeVisible();
      await expect(page.getByText('결제 유형 *')).toBeVisible();
      await expect(page.getByText('결제 금액 *')).toBeVisible();

      // 결제 유형 라디오 버튼 테스트
      const membershipRadio = page.getByRole('radio', { name: '회원권' });
      const ptRadio = page.getByRole('radio', { name: 'PT' });
      const otherRadio = page.getByRole('radio', { name: '기타' });

      await expect(membershipRadio).toBeChecked(); // 기본 선택

      await ptRadio.click();
      await expect(ptRadio).toBeChecked();

      await otherRadio.click();
      await expect(otherRadio).toBeChecked();

      // 결제 금액 입력
      const amountField = page.locator('input[type="number"]');
      await amountField.fill('100000');
      await expect(amountField).toHaveValue('100000');

      // 결제 방법 선택
      const paymentMethodSelect = page.locator('select').filter({ hasText: '현금' });
      await paymentMethodSelect.selectOption('카드');

      // 메모 입력
      const memoField = page.getByPlaceholder('추가 메모가 있으면 입력하세요');
      await memoField.fill('테스트 결제입니다.');
    });

    test('결제 검색 및 필터 테스트', async ({ page }) => {
      const searchField = page.getByPlaceholder('회원명, 전화번호, 결제번호로 검색...');

      // 검색 필드 확인
      await expect(searchField).toBeVisible();

      // 날짜 필터 버튼들 확인
      await expect(page.getByRole('button', { name: '오늘' })).toBeVisible();
      await expect(page.getByRole('button', { name: '1주일' })).toBeVisible();
      await expect(page.getByRole('button', { name: '1개월' })).toBeVisible();

      // 고급 필터 버튼 확인
      await expect(page.getByRole('button', { name: '고급 필터 2' })).toBeVisible();

      // 초기화 버튼 확인
      await expect(page.getByRole('button', { name: '초기화' })).toBeVisible();
    });
  });

  test.describe('직원 관리 폼 테스트', () => {
    test.beforeEach(async ({ page }) => {
      await page.click('text=직원 관리');
    });

    test('직원 추가 버튼 및 검색 기능 확인', async ({ page }) => {
      // 직원 추가 버튼 확인
      await expect(page.getByRole('button', { name: '직원 추가' })).toBeVisible();

      // 검색 필드 확인
      const searchField = page.getByPlaceholder('이름, 연락처, 직원번호 검색...');
      await expect(searchField).toBeVisible();

      // 고급 필터 버튼 확인
      await expect(page.getByRole('button', { name: '고급 필터' })).toBeVisible();

      // 필터 버튼들 확인
      await expect(page.getByRole('button', { name: '전체 직원' })).toBeVisible();
      await expect(page.getByRole('button', { name: '활성 직원' })).toBeVisible();
      await expect(page.getByRole('button', { name: '매니저' })).toBeVisible();
      await expect(page.getByRole('button', { name: '트레이너' })).toBeVisible();
    });

    test('직원 통계 카드 확인', async ({ page }) => {
      // 통계 카드들이 표시되는지 확인
      await expect(page.getByText('전체 직원')).toBeVisible();
      await expect(page.getByText('활성 직원')).toBeVisible();
      await expect(page.getByText('평균 근속')).toBeVisible();
      await expect(page.getByText('총 급여 비용')).toBeVisible();

      // 차트 영역 확인
      await expect(page.getByText('직책별 분포')).toBeVisible();
      await expect(page.getByText('부서별 분포')).toBeVisible();
      await expect(page.getByText('역할별 분포')).toBeVisible();
    });
  });

  test.describe('반응형 디자인 테스트', () => {
    test('모바일 뷰포트 테스트', async ({ page }) => {
      // 모바일 크기로 변경
      await page.setViewportSize({ width: 375, height: 667 });

      // 메인 요소들이 여전히 보이는지 확인
      await expect(page.getByRole('heading', { name: '대시보드' })).toBeVisible();

      // 사이드바가 적절히 조정되었는지 확인
      await expect(page.getByText('Awarefit')).toBeVisible();
    });

    test('태블릿 뷰포트 테스트', async ({ page }) => {
      // 태블릿 크기로 변경
      await page.setViewportSize({ width: 768, height: 1024 });

      // 레이아웃이 적절히 조정되었는지 확인
      await expect(page.getByRole('heading', { name: '대시보드' })).toBeVisible();
      await expect(page.getByText('총 회원 수')).toBeVisible();
    });
  });

  test.describe('키보드 네비게이션 테스트', () => {
    test('Tab 키 네비게이션', async ({ page }) => {
      // 첫 번째 포커스 가능한 요소로 이동
      await page.keyboard.press('Tab');

      // 여러 번 Tab을 눌러서 네비게이션 확인
      for (let i = 0; i < 5; i++) {
        await page.keyboard.press('Tab');
        await page.waitForTimeout(100);
      }

      // Enter 키로 요소 활성화 테스트
      await page.keyboard.press('Enter');
    });

    test('Escape 키로 모달 닫기', async ({ page }) => {
      await page.click('text=회원 관리');
      await page.click('text=신규등록');

      // 모달이 열렸는지 확인
      await expect(page.getByRole('heading', { name: '새 회원 등록' })).toBeVisible();

      // Escape 키로 모달 닫기
      await page.keyboard.press('Escape');

      // 모달이 닫혔는지 확인
      await expect(page.getByRole('heading', { name: '새 회원 등록' })).not.toBeVisible();
    });
  });
});
