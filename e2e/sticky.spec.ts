import { expect, test } from '@playwright/test';

test.describe('Sticky filter behavior', () => {
  test('PaymentSearchFilter sticks to top while scrolling main container', async ({ page }) => {
    await page.goto('/');
    // 일부 환경에서 개발 오버레이가 클릭을 가로막는 문제 회피
    await page.addStyleTag({
      content:
        '#webpack-dev-server-client-overlay, #wsErrorOverlay { display: none !important; pointer-events: none !important; }',
    });
    await page.click('text=결제 관리');

    const filter = page.getByTestId('payment-filter');
    await expect(filter).toBeVisible();

    const main = page.locator('main');
    await expect(main).toBeVisible();

    // Force the main container to be scrollable regardless of content height
    await main.evaluate(el => {
      const element = el as HTMLElement;
      element.style.height = '150px';
      element.style.overflowY = 'auto';
    });

    // Initial large scroll
    await main.evaluate(el => {
      const element = el as HTMLElement;
      element.scrollTop = 1000;
    });
    await page.waitForTimeout(100);

    const topAfterFirstScroll = await filter.evaluate(el => el.getBoundingClientRect().top);

    // Scroll further
    await main.evaluate(el => {
      const element = el as HTMLElement;
      element.scrollTop = 2000;
    });
    await page.waitForTimeout(100);

    const topAfterSecondScroll = await filter.evaluate(el => el.getBoundingClientRect().top);

    // Expect the filter to remain at a stable top position (stuck)
    expect(Math.abs(topAfterFirstScroll - topAfterSecondScroll)).toBeLessThan(1.5);

    // Additionally, verify it stays near the area just below the header
    const headerBottom = await page.locator('header').evaluate(el => el.getBoundingClientRect().bottom);
    expect(topAfterSecondScroll).toBeGreaterThanOrEqual(headerBottom - 2);
    expect(topAfterSecondScroll - headerBottom).toBeLessThan(48); // allow padding/margins
  });
});


