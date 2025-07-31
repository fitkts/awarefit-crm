import { expect, test } from '@playwright/test';

test.describe('🧭 네비게이션 테스트', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('대시보드 페이지 로드 확인', async ({ page }) => {
    // 대시보드 헤더 확인
    await expect(page.getByRole('heading', { name: '대시보드' })).toBeVisible();

    // 환영 메시지 확인
    await expect(page.getByText('안녕하세요! 👋')).toBeVisible();

    // 통계 카드들 확인
    await expect(page.getByText('총 회원 수')).toBeVisible();
    await expect(page.getByText('이번 달 매출')).toBeVisible();
    await expect(page.getByText('활성 회원')).toBeVisible();
    await expect(page.getByText('오늘 출석')).toBeVisible();
  });

  test('회원 관리 페이지 이동', async ({ page }) => {
    await page.click('text=회원 관리');

    // 페이지 헤더 확인
    await expect(page.getByRole('heading', { name: '회원 관리' })).toBeVisible();
    await expect(page.getByText('회원 정보를 등록, 수정, 조회할 수 있습니다')).toBeVisible();

    // 활성 네비게이션 상태 확인
    await expect(page.locator('button:has-text("회원 관리")[class*="active"]')).toBeVisible();

    // 주요 UI 요소들 확인
    await expect(page.getByPlaceholder('회원 이름, 전화번호, 이메일 검색')).toBeVisible();
    await expect(page.getByRole('button', { name: '신규등록' })).toBeVisible();
    await expect(page.getByRole('button', { name: '새로고침' })).toBeVisible();
  });

  test('결제 관리 페이지 이동', async ({ page }) => {
    await page.click('text=결제 관리');

    // 페이지 헤더 확인
    await expect(page.getByRole('heading', { name: '결제 관리' })).toBeVisible();
    await expect(page.getByText('회원권 및 PT 결제 내역을 관리합니다')).toBeVisible();

    // 활성 네비게이션 상태 확인
    await expect(page.locator('button:has-text("결제 관리")[class*="active"]')).toBeVisible();

    // 주요 UI 요소들 확인
    await expect(page.getByPlaceholder('회원명, 전화번호, 결제번호로 검색...')).toBeVisible();
    await expect(page.getByRole('button', { name: '새 결제' })).toBeVisible();
    await expect(page.getByRole('button', { name: '새로고침' })).toBeVisible();
  });

  test('직원 관리 페이지 이동', async ({ page }) => {
    await page.click('text=직원 관리');

    // 페이지 헤더 확인
    await expect(page.getByRole('heading', { name: '직원 관리' })).toBeVisible();
    await expect(page.getByText('직원 정보와 권한을 관리합니다')).toBeVisible();

    // 활성 네비게이션 상태 확인
    await expect(page.locator('button:has-text("직원 관리")[class*="active"]')).toBeVisible();

    // 주요 UI 요소들 확인
    await expect(page.getByPlaceholder('이름, 연락처, 직원번호 검색...')).toBeVisible();
    await expect(page.getByRole('button', { name: '직원 추가' })).toBeVisible();
    await expect(page.getByRole('button', { name: '새로고침' })).toBeVisible();
  });

  test('통계 분석 페이지 이동', async ({ page }) => {
    await page.click('text=통계 분석');

    // 활성 네비게이션 상태 확인
    await expect(page.locator('button:has-text("통계 분석")[class*="active"]')).toBeVisible();

    // 현재 통계 분석 페이지는 대시보드와 동일한 것으로 보임
    await expect(page.getByRole('heading', { name: '대시보드' })).toBeVisible();
  });

  test('비활성화된 메뉴 확인', async ({ page }) => {
    // PT 스케줄 버튼이 비활성화 상태인지 확인
    await expect(page.locator('button:has-text("PT 스케줄")[disabled]')).toBeVisible();
    await expect(page.getByText('개발중')).toBeVisible();

    // 시스템 설정 버튼이 비활성화 상태인지 확인
    await expect(page.locator('button:has-text("시스템 설정")[disabled]')).toBeVisible();
  });

  test('사이드바 정보 확인', async ({ page }) => {
    // 버전 정보 확인
    await expect(page.getByText('현재 버전')).toBeVisible();
    await expect(page.getByText('v1.0.0')).toBeVisible();

    // 마지막 업데이트 정보 확인
    await expect(page.getByText('마지막 업데이트:')).toBeVisible();
  });

  test('모든 페이지 순환 네비게이션', async ({ page }) => {
    const pages = [
      { name: '회원 관리', heading: '회원 관리' },
      { name: '결제 관리', heading: '결제 관리' },
      { name: '직원 관리', heading: '직원 관리' },
      { name: '대시보드', heading: '대시보드' },
    ];

    for (const pageInfo of pages) {
      await page.click(`text=${pageInfo.name}`);
      await expect(page.getByRole('heading', { name: pageInfo.heading })).toBeVisible();

      // 페이지 로딩 완료 대기
      await page.waitForLoadState('networkidle');

      // 활성 상태 확인
      await expect(
        page.locator(`button:has-text("${pageInfo.name}")[class*="active"]`)
      ).toBeVisible();
    }
  });
});
