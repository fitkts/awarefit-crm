import { expect, test } from '@playwright/test';

test.describe('컴포넌트 데모 페이지', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');

    // 컴포넌트 데모 페이지로 이동
    await page.getByRole('button', { name: '컴포넌트 데모' }).click();
    await expect(page.getByText('컴포넌트 데모')).toBeVisible();
  });

  test('페이지 로딩 및 기본 구조 확인', async ({ page }) => {
    // 헤더 확인
    await expect(page.getByRole('heading', { name: '컴포넌트 데모' })).toBeVisible();
    await expect(
      page.getByText('재사용 가능한 UI 컴포넌트들을 직접 테스트하고 코드를 확인해보세요')
    ).toBeVisible();

    // 네비게이션 링크들 확인
    await expect(page.getByRole('link', { name: 'Button 컴포넌트' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Card 컴포넌트' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Modal 컴포넌트' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Input 컴포넌트' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Toast 알림' })).toBeVisible();

    // 각 섹션 제목 확인
    await expect(page.getByText('Button 컴포넌트').nth(1)).toBeVisible();
    await expect(page.getByText('Card 컴포넌트').nth(1)).toBeVisible();
    await expect(page.getByText('Modal 컴포넌트').nth(1)).toBeVisible();
    await expect(page.getByText('Input 컴포넌트').nth(1)).toBeVisible();
    await expect(page.getByText('Toast 알림').nth(1)).toBeVisible();
  });

  test('Button 컴포넌트 인터랙션', async ({ page }) => {
    // Variant 변경
    await page.selectOption('select[aria-describedby*="Variant"]', 'danger');
    await expect(page.getByText('버튼 텍스트')).toHaveClass(/bg-red-600/);

    // Size 변경
    await page.selectOption('select[aria-describedby*="Size"]', 'lg');
    await expect(page.getByText('버튼 텍스트')).toHaveClass(/text-base/);

    // Loading 체크박스
    await page.getByLabel('Loading').check();
    await expect(page.locator('.animate-spin')).toBeVisible();
    await page.getByLabel('Loading').uncheck();

    // Disabled 체크박스
    await page.getByLabel('Disabled').check();
    await expect(page.getByText('버튼 텍스트')).toBeDisabled();
    await page.getByLabel('Disabled').uncheck();

    // Full Width 체크박스
    await page.getByLabel('Full Width').check();
    await expect(page.getByText('버튼 텍스트')).toHaveClass(/w-full/);

    // 모든 variant 버튼들 테스트
    const variants = ['primary', 'secondary', 'danger', 'success', 'warning', 'ghost', 'outline'];
    for (const variant of variants) {
      await expect(page.getByRole('button', { name: variant })).toBeVisible();
    }
  });

  test('Card 컴포넌트 인터랙션', async ({ page }) => {
    // Card variant 변경
    await page.selectOption('select[aria-describedby*="Variant"]', 'elevated');

    // Hoverable 체크박스
    await page.getByLabel('Hoverable').check();

    // Padding 체크박스 해제
    await page.getByLabel('Padding').uncheck();

    // Card 내용 확인
    await expect(page.getByText('카드 제목')).toBeVisible();
    await expect(page.getByText('카드의 부제목입니다')).toBeVisible();
    await expect(page.getByText('여기는 카드의 본문 내용이 들어가는 영역입니다')).toBeVisible();
  });

  test('Modal 컴포넌트 기능', async ({ page }) => {
    // Modal 크기 변경
    await page.selectOption('select[aria-describedby*="Size"]', 'lg');

    // Modal 열기
    await page.getByRole('button', { name: '모달 열기' }).click();
    await expect(page.getByText('데모 모달')).toBeVisible();
    await expect(page.getByText('이것은 lg 크기의 모달 예시입니다')).toBeVisible();

    // Modal 기능 설명 확인
    await expect(page.getByText('ESC 키로 닫기')).toBeVisible();
    await expect(page.getByText('배경 클릭으로 닫기')).toBeVisible();

    // ESC 키로 닫기 테스트
    await page.keyboard.press('Escape');
    await expect(page.getByText('데모 모달')).not.toBeVisible();

    // 다시 열고 X 버튼으로 닫기
    await page.getByRole('button', { name: '모달 열기' }).click();
    await page.getByRole('button', { name: '닫기' }).click();
    await expect(page.getByText('데모 모달')).not.toBeVisible();

    // 다시 열고 취소 버튼으로 닫기
    await page.getByRole('button', { name: '모달 열기' }).click();
    await page.getByRole('button', { name: '취소' }).click();
    await expect(page.getByText('데모 모달')).not.toBeVisible();
  });

  test('Input 컴포넌트 기능', async ({ page }) => {
    // 기본 Input 테스트
    const nameInput = page.getByLabel('이름 *');
    await nameInput.fill('테스트 사용자');
    await expect(nameInput).toHaveValue('테스트 사용자');

    // 이메일 Input 테스트
    const emailInput = page.getByLabel('이메일');
    await emailInput.fill('test@example.com');
    await expect(emailInput).toHaveValue('test@example.com');

    // 전화번호 Input 테스트
    const phoneInput = page.getByLabel('전화번호');
    await phoneInput.fill('010-1234-5678');
    await expect(phoneInput).toHaveValue('010-1234-5678');

    // 오류 표시 버튼 테스트
    await page.getByRole('button', { name: '오류 표시' }).click();
    await expect(page.getByText('필수 필드입니다')).toBeVisible();

    // 성공 표시 버튼 테스트
    await page.getByRole('button', { name: '성공 표시' }).click();
    await expect(page.getByText('올바른 형식입니다')).toBeVisible();

    // 초기화 버튼 테스트
    await page.getByRole('button', { name: '초기화' }).click();
    await expect(page.getByText('필수 필드입니다')).not.toBeVisible();
    await expect(page.getByText('올바른 형식입니다')).not.toBeVisible();

    // Select 테스트
    await page.selectOption('select[aria-describedby*="카테고리"]', 'support');

    // Textarea 테스트
    const messageTextarea = page.getByLabel('메시지');
    await messageTextarea.fill('테스트 메시지입니다.');
    await expect(messageTextarea).toHaveValue('테스트 메시지입니다.');
  });

  test('Toast 알림 기능', async ({ page }) => {
    // 성공 알림 테스트
    await page.getByRole('button', { name: '성공 알림' }).click();
    await expect(page.getByText('성공!')).toBeVisible();
    await expect(page.getByText('작업이 성공적으로 완료되었습니다.')).toBeVisible();

    // 오류 알림 테스트
    await page.getByRole('button', { name: '오류 알림' }).click();
    await expect(page.getByText('오류 발생')).toBeVisible();

    // 경고 알림 테스트
    await page.getByRole('button', { name: '경고 알림' }).click();
    await expect(page.getByText('주의')).toBeVisible();

    // 정보 알림 테스트
    await page.getByRole('button', { name: '정보 알림' }).click();
    await expect(page.getByText('정보')).toBeVisible();

    // Toast가 자동으로 사라지는지 확인 (5초 대기)
    await page.waitForTimeout(5000);
    await expect(page.getByText('성공!')).not.toBeVisible();
  });

  test('실제 사용 예제 폼', async ({ page }) => {
    // 폼의 모든 필드 채우기
    await page.getByLabel('이름', { exact: true }).nth(1).fill('홍길동');
    await page.getByLabel('이메일', { exact: true }).nth(1).fill('hong@example.com');
    await page.getByLabel('전화번호', { exact: true }).nth(1).fill('010-1234-5678');
    await page.selectOption('select[aria-describedby*="문의 카테고리"]', 'general');
    await page.getByLabel('메시지', { exact: true }).nth(1).fill('문의 내용입니다.');

    // 제출 버튼 클릭
    await page.getByRole('button', { name: '제출하기' }).click();
    await expect(page.getByText('폼 제출 완료')).toBeVisible();
    await expect(page.getByText('문의가 성공적으로 접수되었습니다.')).toBeVisible();

    // 초기화 버튼 테스트
    await page.getByRole('button', { name: '초기화' }).click();
    await expect(page.getByText('폼 초기화')).toBeVisible();

    // 필드들이 초기화되었는지 확인
    await expect(page.getByLabel('이름', { exact: true }).nth(1)).toHaveValue('');
    await expect(page.getByLabel('이메일', { exact: true }).nth(1)).toHaveValue('');
  });

  test('코드 복사 기능', async ({ page }) => {
    // 권한 허용
    await page.context().grantPermissions(['clipboard-write']);

    // Button 코드 복사 테스트
    await page.locator('button:has(svg[class*="w-4 h-4"])').first().click();

    // Toast 확인
    await expect(page.getByText('코드 복사됨')).toBeVisible();
    await expect(page.getByText('클립보드에 복사되었습니다.')).toBeVisible();
  });

  test('반응형 레이아웃 확인', async ({ page }) => {
    // 모바일 크기로 변경
    await page.setViewportSize({ width: 375, height: 667 });

    // 헤더가 여전히 표시되는지 확인
    await expect(page.getByRole('heading', { name: '컴포넌트 데모' })).toBeVisible();

    // 태블릿 크기로 변경
    await page.setViewportSize({ width: 768, height: 1024 });

    // 데스크톱 크기로 복원
    await page.setViewportSize({ width: 1280, height: 720 });
  });

  test('접근성 확인', async ({ page }) => {
    // 키보드 네비게이션 테스트
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');

    // 포커스가 있는 요소 확인
    const focusedElement = page.locator(':focus');
    await expect(focusedElement).toBeVisible();

    // ARIA 레이블 확인
    await expect(page.getByLabel('이름 *')).toBeVisible();
    await expect(page.getByLabel('이메일')).toBeVisible();

    // 버튼의 접근성 확인
    await expect(page.getByRole('button', { name: '모달 열기' })).toBeVisible();
  });
});
