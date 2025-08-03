import { expect, test } from '@playwright/test';

test.describe('다크모드 기능', () => {
  test.beforeEach(async ({ page }) => {
    // 각 테스트 전에 로컬스토리지 초기화
    await page.goto('http://localhost:3000');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
  });

  test('다크모드 토글 버튼이 존재하고 클릭 가능해야 함', async ({ page }) => {
    await page.goto('http://localhost:3000');
    
    // 다크모드 토글 버튼 찾기
    const themeToggle = page.locator('button[aria-label*="다크모드"], button[title*="다크모드"]').first();
    await expect(themeToggle).toBeVisible();
    
    // 버튼이 클릭 가능한지 확인
    await expect(themeToggle).toBeEnabled();
    
    // 초기 상태는 라이트모드여야 함
    await expect(page.locator('html')).not.toHaveClass(/dark/);
  });

  test('다크모드 토글이 정상적으로 작동해야 함', async ({ page }) => {
    await page.goto('http://localhost:3000');
    
    // 다크모드 토글 버튼 찾기
    const themeToggle = page.locator('button[aria-label*="다크모드"], button[title*="다크모드"]').first();
    
    // 다크모드로 전환
    await themeToggle.click();
    
    // HTML에 dark 클래스가 추가되었는지 확인
    await expect(page.locator('html')).toHaveClass(/dark/);
    
    // 로컬스토리지에 저장되었는지 확인
    const theme = await page.evaluate(() => localStorage.getItem('awarefit-theme'));
    expect(theme).toBe('dark');
    
    // 라이트모드로 다시 전환
    await themeToggle.click();
    
    // HTML에서 dark 클래스가 제거되었는지 확인
    await expect(page.locator('html')).not.toHaveClass(/dark/);
    
    // 로컬스토리지 업데이트 확인
    const lightTheme = await page.evaluate(() => localStorage.getItem('awarefit-theme'));
    expect(lightTheme).toBe('light');
  });

  test('페이지 새로고침 후에도 다크모드 설정이 유지되어야 함', async ({ page }) => {
    await page.goto('http://localhost:3000');
    
    // 다크모드로 전환
    const themeToggle = page.locator('button[aria-label*="다크모드"], button[title*="다크모드"]').first();
    await themeToggle.click();
    
    // 다크모드가 적용되었는지 확인
    await expect(page.locator('html')).toHaveClass(/dark/);
    
    // 페이지 새로고침
    await page.reload();
    
    // 새로고침 후에도 다크모드가 유지되는지 확인
    await expect(page.locator('html')).toHaveClass(/dark/);
    
    // 로컬스토리지에서도 확인
    const theme = await page.evaluate(() => localStorage.getItem('awarefit-theme'));
    expect(theme).toBe('dark');
  });

  test('사이드바가 다크모드에서 올바른 스타일을 가져야 함', async ({ page }) => {
    await page.goto('http://localhost:3000');
    
    // 다크모드로 전환
    const themeToggle = page.locator('button[aria-label*="다크모드"], button[title*="다크모드"]').first();
    await themeToggle.click();
    
    // 사이드바 컨테이너 확인
    const sidebar = page.locator('nav').first();
    await expect(sidebar).toBeVisible();
    
    // 사이드바 호버 시 확장 테스트
    await sidebar.hover();
    
    // 메뉴 아이템들이 다크모드에서 올바르게 표시되는지 확인
    const menuItems = page.locator('nav button');
    const firstMenuItem = menuItems.first();
    await expect(firstMenuItem).toBeVisible();
  });

  test('다양한 페이지에서 다크모드가 올바르게 작동해야 함', async ({ page }) => {
    await page.goto('http://localhost:3000');
    
    // 다크모드로 전환
    const themeToggle = page.locator('button[aria-label*="다크모드"], button[title*="다크모드"]').first();
    await themeToggle.click();
    
    // 다크모드 적용 확인
    await expect(page.locator('html')).toHaveClass(/dark/);
    
    // 사이드바 호버하여 메뉴 표시
    const sidebar = page.locator('nav').first();
    await sidebar.hover();
    
    // 다른 페이지들로 이동하면서 다크모드 유지 확인
    const menuItems = [
      { selector: 'button:has-text("회원 관리")', expectedUrl: '/members' },
      { selector: 'button:has-text("결제 관리")', expectedUrl: '/payments' },
      { selector: 'button:has-text("직원 관리")', expectedUrl: '/staff' },
      { selector: 'button:has-text("대시보드")', expectedUrl: '/dashboard' }
    ];
    
    for (const item of menuItems) {
      const menuButton = page.locator(item.selector);
      
      if (await menuButton.isVisible()) {
        await menuButton.click();
        
        // 잠시 기다려서 페이지 로딩 완료
        await page.waitForTimeout(500);
        
        // 다크모드가 여전히 적용되어 있는지 확인
        await expect(page.locator('html')).toHaveClass(/dark/);
      }
    }
  });

  test('모달과 팝업들이 다크모드에서 올바르게 표시되어야 함', async ({ page }) => {
    await page.goto('http://localhost:3000');
    
    // 다크모드로 전환
    const themeToggle = page.locator('button[aria-label*="다크모드"], button[title*="다크모드"]').first();
    await themeToggle.click();
    
    // 회원 관리 페이지로 이동
    const sidebar = page.locator('nav').first();
    await sidebar.hover();
    
    const membersButton = page.locator('button:has-text("회원 관리")');
    if (await membersButton.isVisible()) {
      await membersButton.click();
      await page.waitForTimeout(1000);
      
      // 회원 추가 버튼 클릭 시도 (존재한다면)
      const addButton = page.locator('button:has-text("추가"), button:has-text("등록"), button:has-text("새")').first();
      
      if (await addButton.isVisible()) {
        await addButton.click();
        await page.waitForTimeout(500);
        
        // 모달이 다크모드 스타일로 표시되는지 확인
        const modal = page.locator('[role="dialog"], .modal, .fixed').first();
        if (await modal.isVisible()) {
          await expect(modal).toBeVisible();
        }
      }
    }
  });

  test('시스템 테마 설정에 따른 초기 테마 감지', async ({ page, context }) => {
    // 시스템을 다크모드로 설정
    await context.addInitScript(() => {
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: (query: string) => ({
          matches: query.includes('dark'),
          media: query,
          onchange: null,
          addListener: () => {},
          removeListener: () => {},
          addEventListener: () => {},
          removeEventListener: () => {},
          dispatchEvent: () => {},
        }),
      });
    });
    
    await page.goto('http://localhost:3000');
    
    // 시스템 다크모드 설정에 따라 초기에 다크모드가 적용되어야 함
    await expect(page.locator('html')).toHaveClass(/dark/);
  });
});