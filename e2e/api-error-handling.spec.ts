import { expect, test } from '@playwright/test';

test.describe('🔌 API 및 오류 처리 테스트', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test.describe('환경 감지 테스트', () => {
    test('웹 환경 감지 확인', async ({ page }) => {
      // 개발 환경에서 환경 정보가 표시되는지 확인
      const envInfo = page.locator('text=Web').first();
      await expect(envInfo).toBeVisible({ timeout: 5000 });
    });

    test('electronAPI 부재 확인', async ({ page }) => {
      // 콘솔에서 electronAPI가 undefined인지 확인
      const electronAPIStatus = await page.evaluate(() => {
        return typeof window.electronAPI;
      });

      expect(electronAPIStatus).toBe('undefined');
    });
  });

  test.describe('API 오류 메시지 테스트', () => {
    test('회원 목록 로드 실패 메시지', async ({ page }) => {
      await page.click('text=회원 관리');

      // API 오류 메시지가 표시되는지 확인
      await expect(page.getByText('회원 목록을 불러오는데 실패했습니다')).toBeVisible({
        timeout: 10000,
      });
      await expect(page.getByText('electronAPI가 로드되지 않았습니다')).toBeVisible();
    });

    test('결제 목록 로드 실패 메시지', async ({ page }) => {
      await page.click('text=결제 관리');

      // API 오류 메시지가 표시되는지 확인
      await expect(page.getByText('결제 목록을 불러오는데 실패했습니다')).toBeVisible({
        timeout: 10000,
      });
      await expect(page.getByText('Cannot read properties of undefined')).toBeVisible();
    });

    test('직원 목록 로드 실패 메시지', async ({ page }) => {
      await page.click('text=직원 관리');

      // API 오류 메시지가 표시되는지 확인
      await expect(page.getByText('직원 목록을 불러오는데 실패했습니다')).toBeVisible({
        timeout: 10000,
      });
      await expect(page.getByText('electronAPI가 사용할 수 없습니다')).toBeVisible();
    });
  });

  test.describe('콘솔 오류 로그 확인', () => {
    test('회원 관리 페이지 콘솔 오류', async ({ page }) => {
      const consoleErrors: string[] = [];

      // 콘솔 오류 수집
      page.on('console', msg => {
        if (msg.type() === 'error') {
          consoleErrors.push(msg.text());
        }
      });

      await page.click('text=회원 관리');
      await page.waitForTimeout(3000); // API 호출 대기

      // 예상되는 오류들이 발생했는지 확인
      const hasElectronAPIError = consoleErrors.some(error =>
        error.includes('electronAPI가 로드되지 않았습니다')
      );
      expect(hasElectronAPIError).toBe(true);
    });

    test('결제 관리 페이지 콘솔 오류', async ({ page }) => {
      const consoleErrors: string[] = [];

      page.on('console', msg => {
        if (msg.type() === 'error') {
          consoleErrors.push(msg.text());
        }
      });

      await page.click('text=결제 관리');
      await page.waitForTimeout(3000);

      // 데이터베이스 관련 오류 확인
      const hasDatabaseError = consoleErrors.some(
        error => error.includes('Cannot read properties of undefined') && error.includes('database')
      );
      expect(hasDatabaseError).toBe(true);
    });
  });

  test.describe('폼 제출 오류 처리', () => {
    test('회원 등록 실패 처리', async ({ page }) => {
      await page.click('text=회원 관리');
      await page.click('text=신규등록');

      // 필수 필드 입력
      await page.getByPlaceholder('이름을 입력하세요').fill('테스트 사용자');
      await page.locator('select').first().selectOption('남성');
      await page.getByPlaceholder('010-0000-0000').fill('010-1234-5678');
      await page.getByPlaceholder('example@email.com').fill('test@example.com');

      // 등록 버튼 클릭
      await page.click('text=등록');

      // 오류 토스트 메시지가 나타나는지 확인
      await expect(page.locator('.fixed').filter({ hasText: '실패' })).toBeVisible({
        timeout: 5000,
      });
      await expect(page.getByText('electronAPI가 사용할 수 없습니다')).toBeVisible();
    });

    test('결제 등록 폼 오류 상태', async ({ page }) => {
      await page.click('text=결제 관리');
      await page.click('text=새 결제');

      // 회원 선택 드롭다운이 비어있는지 확인 (API 오류로 인해)
      const memberSelect = page.locator('select').filter({ hasText: '회원을 선택하세요' });
      await expect(memberSelect).toBeVisible();

      // 담당 직원 드롭다운도 비어있는지 확인
      const staffSelect = page.locator('select').filter({ hasText: '담당 직원을 선택하세요' });
      await expect(staffSelect).toBeVisible();
    });
  });

  test.describe('네트워크 오류 테스트', () => {
    test('WebSocket 연결 실패 확인', async ({ page }) => {
      const networkErrors: string[] = [];

      // 네트워크 이벤트 모니터링
      page.on('response', response => {
        if (!response.ok()) {
          networkErrors.push(`${response.status()}: ${response.url()}`);
        }
      });

      page.on('console', msg => {
        if (msg.type() === 'error' && msg.text().includes('WebSocket')) {
          networkErrors.push(msg.text());
        }
      });

      await page.waitForTimeout(5000); // 연결 시도 대기

      // WebSocket 연결 실패가 발생했는지 확인
      const hasWebSocketError = networkErrors.some(
        error => error.includes('WebSocket') || error.includes('ws://localhost:3002/ws')
      );

      // 개발 환경에서는 WebSocket 오류가 발생할 수 있음
      if (hasWebSocketError) {
        console.log('WebSocket 연결 실패 감지됨 (예상된 동작)');
      }
    });

    test('404 리소스 오류 확인', async ({ page }) => {
      const resourceErrors: string[] = [];

      page.on('response', response => {
        if (response.status() === 404) {
          resourceErrors.push(response.url());
        }
      });

      await page.waitForTimeout(3000);

      // 404 오류가 있다면 로그에 기록
      if (resourceErrors.length > 0) {
        console.log('404 리소스 오류들:', resourceErrors);
      }
    });
  });

  test.describe('사용자 경험 테스트', () => {
    test('로딩 상태 표시 확인', async ({ page }) => {
      await page.click('text=회원 관리');

      // 로딩 중에 어떤 상태가 표시되는지 확인
      // 빈 테이블이나 로딩 스피너가 있는지 확인
      const emptyState = page.getByText('검색 결과가 없습니다');
      const errorState = page.getByText('불러오는데 실패했습니다');

      // 둘 중 하나는 표시되어야 함
      await expect(emptyState.or(errorState)).toBeVisible({ timeout: 10000 });
    });

    test('새로고침 버튼 기능', async ({ page }) => {
      await page.click('text=회원 관리');

      // 새로고침 버튼 클릭
      await page.click('text=새로고침');

      // 새로고침 후에도 같은 오류가 발생하는지 확인
      await expect(page.getByText('회원 목록을 불러오는데 실패했습니다')).toBeVisible({
        timeout: 10000,
      });
    });

    test('오류 상황에서도 UI 반응성 유지', async ({ page }) => {
      await page.click('text=회원 관리');

      // API 오류가 발생해도 다른 기능들이 작동하는지 확인

      // 다른 페이지로 이동 가능한지 확인
      await page.click('text=결제 관리');
      await expect(page.getByRole('heading', { name: '결제 관리' })).toBeVisible();

      // 다시 회원 관리로 돌아가기
      await page.click('text=회원 관리');
      await expect(page.getByRole('heading', { name: '회원 관리' })).toBeVisible();

      // 검색 필드 입력 가능한지 확인
      const searchField = page.getByPlaceholder('회원 이름, 전화번호, 이메일 검색');
      await searchField.fill('테스트');
      await expect(searchField).toHaveValue('테스트');
    });
  });

  test.describe('디버그 도구 테스트', () => {
    test('개발 디버그 도구 버튼 확인', async ({ page }) => {
      await page.click('text=회원 관리');

      // 디버그 도구 섹션이 보이는지 확인
      await expect(page.getByText('개발 디버그 도구:')).toBeVisible();

      // DB 스키마 확인 버튼
      await expect(page.getByRole('button', { name: '🔍 DB 스키마 확인' })).toBeVisible();

      // DB 스키마 수정 버튼
      await expect(page.getByRole('button', { name: '🔧 DB 스키마 수정' })).toBeVisible();
    });

    test('버전 정보 표시', async ({ page }) => {
      // 하단에 버전 정보가 표시되는지 확인
      // Web 환경에서는 'Unknown | Web' 또는 'v1.0.0 | Web' 형태로 표시
      const versionPattern = /(v\d+\.\d+\.\d+|Unknown) \| Web/;
      const versionElement = page.locator('text=/v\\d+\\.\\d+\\.\\d+|Unknown/').first();
      await expect(versionElement).toBeVisible();
    });

    test('앱 버전 IPC 핸들러 오류 처리', async ({ page }) => {
      // 콘솔에서 app-version 관련 오류가 없는지 확인
      const consoleErrors: string[] = [];
      page.on('console', (msg) => {
        if (msg.type() === 'error' && msg.text().includes('app-version')) {
          consoleErrors.push(msg.text());
        }
      });

      // 페이지 로드 후 잠시 대기
      await page.waitForTimeout(2000);

      // app-version 관련 오류가 없어야 함
      expect(consoleErrors.length).toBe(0);
    });
  });
});
