import { expect, test } from '@playwright/test';

test('should navigate to the dashboard page', async ({ page }) => {
  // Start from the index page
  await page.goto('/');

  // The page should contain a heading with "대시보드"
  await expect(page.getByRole('heading', { name: '대시보드' })).toBeVisible();
});
