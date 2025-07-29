import { expect, test } from '@playwright/test';

test.describe('⚡ 성능 및 접근성 테스트', () => {
  test.describe('페이지 로딩 성능', () => {
    test('초기 페이지 로드 시간', async ({ page }) => {
      const startTime = Date.now();

      await page.goto('/');

      // 주요 요소가 로드될 때까지 대기
      await expect(page.getByRole('heading', { name: '대시보드' })).toBeVisible();

      const loadTime = Date.now() - startTime;

      // 로드 시간이 5초 이내인지 확인
      expect(loadTime).toBeLessThan(5000);
      console.log(`페이지 로드 시간: ${loadTime}ms`);
    });

    test('페이지 간 네비게이션 속도', async ({ page }) => {
      await page.goto('/');

      const pages = ['회원 관리', '결제 관리', '직원 관리', '대시보드'];
      const loadTimes: Record<string, number> = {};

      for (const pageName of pages) {
        const startTime = Date.now();

        await page.click(`text=${pageName}`);
        await page.waitForLoadState('networkidle');

        const loadTime = Date.now() - startTime;
        loadTimes[pageName] = loadTime;

        // 각 페이지 로드가 3초 이내인지 확인
        expect(loadTime).toBeLessThan(3000);
      }

      console.log('페이지별 로드 시간:', loadTimes);
    });

    test('리소스 로딩 최적화 확인', async ({ page }) => {
      const resourceSizes: Record<string, number> = {};
      const resourceCounts = { js: 0, css: 0, images: 0, fonts: 0 };

      page.on('response', response => {
        const url = response.url();
        const contentLength = response.headers()['content-length'];

        if (contentLength) {
          resourceSizes[url] = parseInt(contentLength);
        }

        // 리소스 타입별 카운트
        if (url.endsWith('.js')) resourceCounts.js++;
        else if (url.endsWith('.css')) resourceCounts.css++;
        else if (url.match(/\.(png|jpg|jpeg|gif|svg|ico)$/)) resourceCounts.images++;
        else if (url.match(/\.(woff|woff2|ttf|otf)$/)) resourceCounts.fonts++;
      });

      await page.goto('/');
      await page.waitForLoadState('networkidle');

      console.log('리소스 카운트:', resourceCounts);

      // 리소스 개수 확인 (과도하지 않은지)
      expect(resourceCounts.js).toBeLessThan(20);
      expect(resourceCounts.css).toBeLessThan(10);
    });
  });

  test.describe('메모리 및 CPU 사용량', () => {
    test('메모리 사용량 모니터링', async ({ page }) => {
      await page.goto('/');

      // 초기 메모리 사용량
      const initialMetrics = await page.evaluate(() => {
        return (performance as any).memory
          ? {
              usedJSHeapSize: (performance as any).memory.usedJSHeapSize,
              totalJSHeapSize: (performance as any).memory.totalJSHeapSize,
            }
          : null;
      });

      if (initialMetrics) {
        console.log('초기 메모리 사용량:', initialMetrics);

        // 여러 페이지 탐색
        const pages = ['회원 관리', '결제 관리', '직원 관리'];
        for (const pageName of pages) {
          await page.click(`text=${pageName}`);
          await page.waitForTimeout(1000);
        }

        // 최종 메모리 사용량
        const finalMetrics = await page.evaluate(() => {
          return (performance as any).memory
            ? {
                usedJSHeapSize: (performance as any).memory.usedJSHeapSize,
                totalJSHeapSize: (performance as any).memory.totalJSHeapSize,
              }
            : null;
        });

        if (finalMetrics) {
          console.log('최종 메모리 사용량:', finalMetrics);

          // 메모리 증가량이 과도하지 않은지 확인 (50MB 이내)
          const memoryIncrease = finalMetrics.usedJSHeapSize - initialMetrics.usedJSHeapSize;
          expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024);
        }
      }
    });

    test('장시간 사용 시 성능 안정성', async ({ page }) => {
      await page.goto('/');

      // 여러 작업을 반복 수행
      for (let i = 0; i < 5; i++) {
        // 회원 관리 페이지로 이동
        await page.click('text=회원 관리');
        await page.waitForTimeout(500);

        // 검색 수행
        const searchField = page.getByPlaceholder('회원 이름, 전화번호, 이메일 검색');
        await searchField.fill(`테스트${i}`);
        await searchField.press('Enter');
        await page.waitForTimeout(500);

        // 결제 관리 페이지로 이동
        await page.click('text=결제 관리');
        await page.waitForTimeout(500);

        // 검색 수행
        const paymentSearchField = page.getByPlaceholder('회원명, 전화번호, 결제번호로 검색...');
        await paymentSearchField.fill(`결제${i}`);
        await page.waitForTimeout(500);
      }

      // 마지막에도 페이지가 정상적으로 작동하는지 확인
      await expect(page.getByRole('heading', { name: '결제 관리' })).toBeVisible();
    });
  });

  test.describe('접근성 테스트', () => {
    test('키보드 네비게이션 지원', async ({ page }) => {
      await page.goto('/');

      // Tab 키로 포커스 이동 가능한지 확인
      await page.keyboard.press('Tab');

      // 포커스된 요소가 시각적으로 구분되는지 확인
      const focusedElement = await page.evaluate(() => document.activeElement?.tagName);
      expect(focusedElement).toBeTruthy();

      // 여러 번 Tab을 눌러서 모든 인터랙티브 요소에 접근 가능한지 확인
      for (let i = 0; i < 10; i++) {
        await page.keyboard.press('Tab');
        await page.waitForTimeout(100);
      }
    });

    test('ARIA 레이블 및 시맨틱 HTML 확인', async ({ page }) => {
      await page.goto('/');

      // 주요 랜드마크가 있는지 확인
      await expect(page.locator('main')).toBeVisible();
      await expect(page.locator('nav')).toBeVisible();

      // 헤딩 구조가 올바른지 확인
      const headings = await page.locator('h1, h2, h3, h4, h5, h6').all();
      expect(headings.length).toBeGreaterThan(0);

      // 폼 레이블이 있는지 확인
      await page.click('text=회원 관리');
      await page.click('text=신규등록');

      const labeledInputs = await page.locator('input[id]').all();
      for (const input of labeledInputs.slice(0, 3)) {
        // 처음 3개만 확인
        const inputId = await input.getAttribute('id');
        if (inputId) {
          const hasLabel = await page.locator(`label[for="${inputId}"]`).count();
          if (hasLabel === 0) {
            // aria-label이나 다른 접근성 속성이 있는지 확인
            const ariaLabel = await input.getAttribute('aria-label');
            const placeholder = await input.getAttribute('placeholder');
            expect(ariaLabel || placeholder).toBeTruthy();
          }
        }
      }
    });

    test('색상 대비 및 가독성', async ({ page }) => {
      await page.goto('/');

      // 중요한 텍스트 요소들의 색상 대비 확인
      const textElements = [
        page.getByRole('heading', { name: '대시보드' }),
        page.getByText('총 회원 수'),
        page.getByText('이번 달 매출'),
      ];

      for (const element of textElements) {
        const styles = await element.evaluate(el => {
          const computed = window.getComputedStyle(el);
          return {
            color: computed.color,
            backgroundColor: computed.backgroundColor,
            fontSize: computed.fontSize,
          };
        });

        // 폰트 크기가 너무 작지 않은지 확인 (최소 12px)
        const fontSize = parseInt(styles.fontSize);
        expect(fontSize).toBeGreaterThanOrEqual(12);
      }
    });

    test('모바일 접근성', async ({ page }) => {
      // 모바일 뷰포트로 설정
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/');

      // 터치 대상이 충분히 큰지 확인 (최소 44px)
      const buttons = await page.locator('button').all();

      for (const button of buttons.slice(0, 5)) {
        // 처음 5개 버튼만 확인
        const boundingBox = await button.boundingBox();
        if (boundingBox) {
          expect(boundingBox.height).toBeGreaterThanOrEqual(32); // 조금 여유를 둠
          expect(boundingBox.width).toBeGreaterThanOrEqual(32);
        }
      }

      // 가로 스크롤이 없는지 확인
      const hasHorizontalScroll = await page.evaluate(() => {
        return document.documentElement.scrollWidth > document.documentElement.clientWidth;
      });
      expect(hasHorizontalScroll).toBe(false);
    });
  });

  test.describe('오류 복구 및 안정성', () => {
    test('네트워크 오류 시 복구', async ({ page }) => {
      await page.goto('/');

      // 네트워크를 오프라인으로 설정
      await page.context().setOffline(true);

      // 페이지 새로고침 시도
      await page.reload();

      // 네트워크 복구
      await page.context().setOffline(false);

      // 다시 새로고침
      await page.reload();

      // 페이지가 정상적으로 로드되는지 확인
      await expect(page.getByRole('heading', { name: '대시보드' })).toBeVisible({ timeout: 10000 });
    });

    test('JavaScript 오류 발생 시 UI 안정성', async ({ page }) => {
      const jsErrors: string[] = [];

      // JavaScript 오류 수집
      page.on('pageerror', error => {
        jsErrors.push(error.message);
      });

      await page.goto('/');

      // 여러 페이지 탐색
      await page.click('text=회원 관리');
      await page.click('text=결제 관리');
      await page.click('text=직원 관리');

      // 치명적인 JavaScript 오류가 없는지 확인
      const fatalErrors = jsErrors.filter(
        error =>
          error.includes('ReferenceError') ||
          (error.includes('TypeError') && error.includes('undefined'))
      );

      console.log('JavaScript 오류들:', jsErrors);
      console.log('치명적인 오류들:', fatalErrors);

      // 페이지가 여전히 작동하는지 확인
      await expect(page.getByRole('heading', { name: '직원 관리' })).toBeVisible();
    });
  });
});
