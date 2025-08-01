import { expect, test } from '@playwright/test';

/**
 * 결제 수정 버그 재현 테스트
 * 
 * 버그: 결제 테이블에서 "수정" 버튼 클릭 후 가격 변경하고 "수정하기" 클릭하면
 * 기존 데이터가 수정되는 것이 아니라 새로운 결제로 등록되는 문제
 */

test.describe('결제 수정 버그 재현 테스트', () => {
  test.beforeEach(async ({ page }) => {
    // 결제 페이지로 이동
    await page.goto('/');
    await page.click('text=결제 관리');
    await page.waitForSelector('[data-testid="payment-table"]', { timeout: 10000 });
  });

  test('결제 수정 시 새 결제가 생성되는 버그 재현', async ({ page }) => {
    // 1. 새 결제 하나 생성 (테스트 데이터 준비)
    await page.click('text=새 결제 등록');
    await page.waitForSelector('[data-testid="payment-form"]');

    // 회원 선택
    await page.selectOption('select[name="member_id"]', { index: 1 });
    
    // 담당 직원 선택
    await page.selectOption('select[name="staff_id"]', { index: 1 });
    
    // 결제 유형 선택 (회원권)
    await page.check('input[value="membership"]');
    
    // 회원권 종류 선택
    await page.selectOption('select[name="membership_type_id"]', { index: 1 });
    
    // 결제 금액 확인 (자동 계산됨)
    const originalAmount = await page.inputValue('input[type="number"]');
    console.log('🔍 원래 결제 금액:', originalAmount);
    
    // 결제 등록
    await page.click('button[type="submit"]');
    await page.waitForSelector('text=새 결제가 등록되었습니다');
    
    // 2. 현재 결제 목록 개수 확인
    await page.waitForSelector('[data-testid="payment-table"] tbody tr');
    const initialPaymentCount = await page.locator('[data-testid="payment-table"] tbody tr').count();
    console.log('🔍 초기 결제 개수:', initialPaymentCount);

    // 3. 첫 번째 결제의 ID 추출 (결제번호 또는 고유 식별자)
    const firstPaymentRow = page.locator('[data-testid="payment-table"] tbody tr').first();
    const firstPaymentNumber = await firstPaymentRow.locator('td').first().textContent();
    console.log('🔍 수정할 결제번호:', firstPaymentNumber);
    
    // 4. 첫 번째 결제의 "수정" 버튼 클릭
    await firstPaymentRow.locator('button[title="수정"]').click();
    await page.waitForSelector('[data-testid="payment-form"]');
    
    // 모달 제목이 "결제 정보 수정"인지 확인
    await expect(page.locator('h2')).toContainText('결제 정보 수정');
    
    // 5. 결제 금액 변경
    const newAmount = parseInt(originalAmount) + 10000;
    await page.fill('input[type="number"]', newAmount.toString());
    console.log('🔍 변경된 결제 금액:', newAmount);
    
    // 6. "수정하기" 버튼 클릭
    await page.click('button[type="submit"]');
    
    // 7. 성공 메시지 대기
    await page.waitForSelector('text=결제 정보가 수정되었습니다', { timeout: 5000 });
    
    // 8. 결과 검증
    await page.waitForTimeout(1000); // 데이터 로드 대기
    
    // 결제 목록 개수 재확인
    const finalPaymentCount = await page.locator('[data-testid="payment-table"] tbody tr').count();
    console.log('🔍 최종 결제 개수:', finalPaymentCount);
    
    // 🚨 버그 확인: 결제 개수가 증가했다면 새 결제가 생성된 것
    if (finalPaymentCount > initialPaymentCount) {
      console.error('🚨 버그 발견: 결제 수정 시 새 결제가 생성됨!');
      console.error(`예상: ${initialPaymentCount}개, 실제: ${finalPaymentCount}개`);
      
      // 버그 재현 성공을 표시하기 위해 테스트 실패
      expect(finalPaymentCount).toBe(initialPaymentCount); // 이 assertion이 실패해야 함
    } else {
      console.log('✅ 결제 수정이 올바르게 동작함');
      expect(finalPaymentCount).toBe(initialPaymentCount);
    }
    
    // 9. 수정된 금액이 올바르게 반영되었는지 확인
    const updatedAmount = await firstPaymentRow.locator('td').nth(4).textContent(); // 금액 컬럼
    const formattedNewAmount = newAmount.toLocaleString('ko-KR') + '원';
    
    console.log('🔍 예상 금액:', formattedNewAmount);
    console.log('🔍 실제 금액:', updatedAmount);
    
    expect(updatedAmount).toContain(newAmount.toString());
  });

  test('결제 수정 폼이 올바른 데이터로 초기화되는지 확인', async ({ page }) => {
    // 첫 번째 결제 행 선택
    const firstPaymentRow = page.locator('[data-testid="payment-table"] tbody tr').first();
    
    // 원본 데이터 추출
    const originalAmount = await firstPaymentRow.locator('td').nth(4).textContent(); // 금액 컬럼
    const originalMember = await firstPaymentRow.locator('td').nth(1).textContent(); // 회원명 컬럼
    
    console.log('🔍 원본 금액:', originalAmount);
    console.log('🔍 원본 회원:', originalMember);
    
    // 수정 버튼 클릭
    await firstPaymentRow.locator('button[title="수정"]').click();
    await page.waitForSelector('[data-testid="payment-form"]');
    
    // 폼 필드들이 올바른 값으로 초기화되었는지 확인
    const formAmount = await page.inputValue('input[type="number"]');
    console.log('🔍 폼 금액:', formAmount);
    
    // 금액에서 "원"과 쉼표 제거 후 비교
    const cleanOriginalAmount = originalAmount?.replace(/[,원]/g, '') || '';
    expect(formAmount).toBe(cleanOriginalAmount);
    
    // 모달 닫기
    await page.click('button:has-text("취소")');
  });

  test('여러 결제 수정을 연속으로 수행했을 때의 동작 확인', async ({ page }) => {
    const paymentRows = page.locator('[data-testid="payment-table"] tbody tr');
    const totalRows = await paymentRows.count();
    
    console.log('🔍 총 결제 건수:', totalRows);
    
    if (totalRows < 2) {
      console.log('테스트를 위해 결제 데이터가 부족합니다. 건너뜁니다.');
      test.skip();
      return;
    }
    
    // 초기 결제 개수 기록
    const initialCount = totalRows;
    
    // 첫 번째 결제 수정
    await paymentRows.nth(0).locator('button[title="수정"]').click();
    await page.waitForSelector('[data-testid="payment-form"]');
    
    const firstAmount = await page.inputValue('input[type="number"]');
    const newFirstAmount = parseInt(firstAmount) + 5000;
    
    await page.fill('input[type="number"]', newFirstAmount.toString());
    await page.click('button[type="submit"]');
    await page.waitForSelector('text=결제 정보가 수정되었습니다');
    
    // 잠시 대기
    await page.waitForTimeout(1000);
    
    // 두 번째 결제 수정
    await paymentRows.nth(1).locator('button[title="수정"]').click();
    await page.waitForSelector('[data-testid="payment-form"]');
    
    const secondAmount = await page.inputValue('input[type="number"]');
    const newSecondAmount = parseInt(secondAmount) + 3000;
    
    await page.fill('input[type="number"]', newSecondAmount.toString());
    await page.click('button[type="submit"]');
    await page.waitForSelector('text=결제 정보가 수정되었습니다');
    
    // 최종 검증
    await page.waitForTimeout(1000);
    const finalCount = await paymentRows.count();
    
    console.log('🔍 초기 개수:', initialCount);
    console.log('🔍 최종 개수:', finalCount);
    
    // 연속 수정 후에도 결제 개수가 증가하지 않아야 함
    expect(finalCount).toBe(initialCount);
  });
});