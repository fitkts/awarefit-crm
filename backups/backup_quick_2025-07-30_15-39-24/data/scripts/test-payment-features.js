/**
 * 결제관리 페이지 전용 기능 테스트 스크립트
 * 
 * 결제관리 페이지에서 사용할 수 있는 특화된 테스트 스크립트입니다.
 * 결제 관련 모든 기능을 체계적으로 검증합니다.
 * 
 * 사용 방법:
 * 1. 결제관리 페이지 열기
 * 2. F12 키로 개발자 도구 열기
 * 3. Console 탭 선택
 * 4. 이 스크립트 전체를 복사하여 붙여넣기
 * 5. Enter 키 실행
 */



// TestFramework 로드
let TestFramework;
if (typeof window !== 'undefined' && window.TestFramework) {
  TestFramework = window.TestFramework;
} else if (typeof require !== 'undefined') {
  try {
    TestFramework = require('./utils/test-framework.js');
  } catch (error) {
    console.error('TestFramework를 로드할 수 없습니다:', error.message);
    
    // 브라우저에서 동적으로 로드 시도
    if (typeof window !== 'undefined') {
      const script = document.createElement('script');
      script.src = './utils/test-framework.js';
      script.onload = () => {
        console.log('TestFramework 로드 완료. 스크립트를 다시 실행하세요.');
      };
      script.onerror = () => {
        console.error('TestFramework 로드 실패. 파일 경로를 확인하세요.');
      };
      document.head.appendChild(script);
      return;
    }
  }
}

(function () {
  console.clear();
  console.log('💳 결제관리 페이지 기능 테스트 시작');
  console.log('='.repeat(50));

  // TestFramework 인스턴스 생성
  const tester = new TestFramework('결제관리 페이지');: 통과`);
        return true;
      } else {
        failedTests++;
        console.log(`❌ ${testName}: 실패`);
        return false;
      }
    } catch (error) {
      failedTests++;
      console.log(`❌ ${testName}: 오류 - ${error.message}`);
      return false;
    }
  }: 통과`);
          return true;
        } else {
          failedTests++;
          console.log(`❌ ${testName}: 실패`);
          return false;
        }
      })
      .catch(error => {
        failedTests++;
        console.log(`❌ ${testName}: 오류 - ${error.message}`);
        return false;
      });
  }

  tester.startGroup('🔧 1. API 연결 테스트');

  // API 존재 확인
  tester.runTest('electronAPI 존재 확인', () => {
    return typeof window.electronAPI === 'object' && window.electronAPI !== null;
  });

  tester.runTest('database API 존재 확인', () => {
    return typeof window.electronAPI?.database === 'object';
  });

  tester.runTest('payment API 존재 확인', () => {
    return typeof window.electronAPI?.database?.payment === 'object';
  });

  // 주요 API 메서드 확인
  const requiredMethods = ['getAll', 'getStats', 'create', 'update', 'delete'];
  requiredMethods.forEach(method => {
    tester.runTest(`payment.${method} 메서드 존재`, () => {
      return typeof window.electronAPI?.database?.payment?.[method] === 'function';
    });
  });

  // 결제 관련 추가 메서드들
  const additionalMethods = ['getById', 'search', 'refund', 'getByMember', 'getByDateRange'];
  additionalMethods.forEach(method => {
    tester.runTest(`payment.${method} 메서드 존재 (선택)`, () => {
      return typeof window.electronAPI?.database?.payment?.[method] === 'function';
    });
  });

  // 연관 API 확인 (회원, 회원권 타입)
  tester.runTest('member API 존재 (연관)', () => {
    return typeof window.electronAPI?.database?.member === 'object';
  });

  tester.runTest('membershipType API 존재 (선택)', () => {
    return typeof window.electronAPI?.database?.membershipType === 'object' ||
      typeof window.electronAPI?.system?.getMembershipTypes === 'function';
  });

  tester.startGroup('🎨 2. UI 컴포넌트 테스트');

  // 기본 UI 요소들
  tester.runTest('결제 검색 입력 필드', () => {
    return !!document.querySelector('input[placeholder*="검색"], input[placeholder*="결제"], input[placeholder*="번호"]');
  });

  tester.runTest('신규등록 버튼', () => {
    const buttons = Array.from(document.querySelectorAll('button'));
    return buttons.some(btn =>
      btn.textContent.includes('신규등록') ||
      btn.textContent.includes('신규') ||
      btn.textContent.includes('추가') ||
      btn.textContent.includes('결제등록')
    );
  });

  tester.runTest('필터 버튼', () => {
    const buttons = Array.from(document.querySelectorAll('button'));
    return buttons.some(btn => btn.textContent.includes('필터'));
  });

  tester.runTest('새로고침 버튼', () => {
    const buttons = Array.from(document.querySelectorAll('button'));
    return buttons.some(btn => btn.textContent.includes('새로고침'));
  });

  tester.runTest('결제 목록 테이블', () => {
    return !!document.querySelector('table') || !!document.querySelector('[role="table"]');
  });

  tester.runTest('페이지네이션', () => {
    const buttons = Array.from(document.querySelectorAll('button'));
    return buttons.some(btn =>
      btn.textContent.includes('이전') ||
      btn.textContent.includes('다음') ||
      btn.textContent.match(/\d+/)
    );
  });

  // 결제 통계 카드 확인
  tester.runTest('결제 통계 카드', () => {
    const cards = document.querySelectorAll('.bg-white.rounded-lg, .card, [class*="stat"]');
    return cards.length >= 3; // 최소 3개 이상의 통계 카드
  });

  // 결제 관련 특화 UI
  tester.runTest('결제 테이블 컬럼들', () => {
    const headers = Array.from(document.querySelectorAll('th, [role="columnheader"]'));
    const paymentColumns = headers.some(header => {
      const text = header.textContent?.toLowerCase() || '';
      return text.includes('결제번호') || text.includes('금액') || text.includes('결제일') ||
        text.includes('결제방법') || text.includes('회원') || text.includes('상태');
    });
    return paymentColumns;
  });

  tester.runTest('결제 상태 표시', () => {
    const statusElements = Array.from(document.querySelectorAll('*')).some(el => {
      const text = el.textContent?.toLowerCase() || '';
      const className = el.className?.toLowerCase() || '';
      return text.includes('완료') || text.includes('대기') || text.includes('취소') ||
        className.includes('status') || className.includes('badge');
    });
    return statusElements;
  });

  tester.runTest('금액 표시 포맷', () => {
    const amountElements = Array.from(document.querySelectorAll('*')).some(el => {
      const text = el.textContent || '';
      return text.includes('원') || text.includes(',') && text.match(/\d+,\d+/);
    });
    return amountElements;
  });

  // 환불 기능 UI
  tester.runTest('환불 관련 UI', () => {
    const refundElements = Array.from(document.querySelectorAll('*')).some(el => {
      const text = el.textContent?.toLowerCase() || '';
      const className = el.className?.toLowerCase() || '';
      return text.includes('환불') || className.includes('refund');
    });
    return refundElements;
  });

  tester.startGroup('📊 3. 데이터 로딩 테스트');

  // 비동기 테스트들을 순차적으로 실행
  async function runAsyncTests() {
    if (window.electronAPI?.database?.payment) {
      await tester.runAsyncTest('결제 목록 로딩', async () => {
        const result = await window.electronAPI.database.payment.getAll({});
        return result !== null && result !== undefined;
      });

      await tester.runAsyncTest('결제 통계 로딩', async () => {
        const stats = await window.electronAPI.database.payment.getStats();
        return stats && typeof stats === 'object';
      });

      await tester.runAsyncTest('빈 필터 검색', async () => {
        const result = await window.electronAPI.database.payment.getAll({});
        return result !== null;
      });

      await tester.runAsyncTest('결제번호 검색 테스트', async () => {
        const result = await window.electronAPI.database.payment.getAll({ search: 'test' });
        return result !== null;
      });

      await tester.runAsyncTest('결제방법 필터 테스트', async () => {
        const cardResult = await window.electronAPI.database.payment.getAll({ payment_method: 'card' });
        const cashResult = await window.electronAPI.database.payment.getAll({ payment_method: 'cash' });
        return cardResult !== null && cashResult !== null;
      });

      await tester.runAsyncTest('결제상태 필터 테스트', async () => {
        const completedResult = await window.electronAPI.database.payment.getAll({ status: 'completed' });
        const pendingResult = await window.electronAPI.database.payment.getAll({ status: 'pending' });
        return completedResult !== null && pendingResult !== null;
      });

      await tester.runAsyncTest('날짜 범위 필터 테스트', async () => {
        const today = new Date().toISOString().split('T')[0];
        const lastMonth = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

        const result = await window.electronAPI.database.payment.getAll({
          payment_date_from: lastMonth,
          payment_date_to: today
        });
        return result !== null;
      });

      await tester.runAsyncTest('금액 범위 필터 테스트', async () => {
        const result = await window.electronAPI.database.payment.getAll({
          amount_min: 10000,
          amount_max: 100000
        });
        return result !== null;
      });

      await tester.runAsyncTest('정렬 기능 테스트', async () => {
        const ascResult = await window.electronAPI.database.payment.getAll({
          sort: { field: 'payment_date', direction: 'asc' }
        });
        const descResult = await window.electronAPI.database.payment.getAll({
          sort: { field: 'amount', direction: 'desc' }
        });
        return ascResult !== null && descResult !== null;
      });

      await tester.runAsyncTest('페이지네이션 테스트', async () => {
        const page1 = await window.electronAPI.database.payment.getAll({
          page: 1,
          limit: 10
        });
        const page2 = await window.electronAPI.database.payment.getAll({
          page: 2,
          limit: 10
        });
        return page1 !== null && page2 !== null;
      });

      // 회원별 결제 조회 (있는 경우)
      if (window.electronAPI.database.payment.getByMember) {
        await tester.runAsyncTest('회원별 결제 조회', async () => {
          const result = await window.electronAPI.database.payment.getByMember(1);
          return result !== null;
        });
      }

      // 환불 기능 테스트 (있는 경우)
      if (window.electronAPI.database.payment.refund) {
        console.log('⚠️ 환불 기능은 실제 데이터에 영향을 주므로 테스트를 건너뜁니다.');
      }

    } else {
      console.log('⚠️ payment API가 사용 불가능하여 데이터 로딩 테스트를 건너뜁니다.');
    }

    tester.startGroup('🔍 4. 고급 기능 테스트');

    // 결제 타입별 분류
    tester.runTest('결제 타입 분류 UI', () => {
      const typeElements = Array.from(document.querySelectorAll('*')).some(el => {
        const text = el.textContent?.toLowerCase() || '';
        return text.includes('회원권') || text.includes('pt') || text.includes('락커') ||
          text.includes('기타') || text.includes('개인레슨');
      });
      return typeElements;
    });

    // 할인 및 프로모션
    tester.runTest('할인 관련 UI', () => {
      const discountElements = Array.from(document.querySelectorAll('*')).some(el => {
        const text = el.textContent?.toLowerCase() || '';
        const className = el.className?.toLowerCase() || '';
        return text.includes('할인') || text.includes('프로모션') || text.includes('쿠폰') ||
          className.includes('discount') || className.includes('promotion');
      });
      return discountElements;
    });

    // 영수증 출력 기능
    tester.runTest('영수증 관련 UI', () => {
      const receiptElements = Array.from(document.querySelectorAll('*')).some(el => {
        const text = el.textContent?.toLowerCase() || '';
        const className = el.className?.toLowerCase() || '';
        return text.includes('영수증') || text.includes('출력') || text.includes('인쇄') ||
          className.includes('receipt') || className.includes('print');
      });
      return receiptElements;
    });

    // 월별/연도별 통계
    tester.runTest('기간별 통계 UI', () => {
      const statsElements = Array.from(document.querySelectorAll('*')).some(el => {
        const text = el.textContent?.toLowerCase() || '';
        return text.includes('월별') || text.includes('연도별') || text.includes('일별') ||
          text.includes('기간별') || text.includes('통계');
      });
      return statsElements;
    });

    tester.startGroup('💳 5. 결제 시스템 특화 테스트');

    // 결제 수단 다양성
    tester.runTest('다양한 결제 수단 지원', () => {
      const paymentMethods = Array.from(document.querySelectorAll('*')).some(el => {
        const text = el.textContent?.toLowerCase() || '';
        return (text.includes('카드') || text.includes('현금') || text.includes('계좌이체')) &&
          (text.includes('신용카드') || text.includes('체크카드') || text.includes('무통장입금'));
      });
      return paymentMethods;
    });

    // 분할 결제 지원
    tester.runTest('분할 결제 UI', () => {
      const installmentElements = Array.from(document.querySelectorAll('*')).some(el => {
        const text = el.textContent?.toLowerCase() || '';
        return text.includes('분할') || text.includes('할부') || text.includes('개월');
      });
      return installmentElements;
    });

    // 자동 결제 설정
    tester.runTest('자동 결제 관련 UI', () => {
      const autoPayElements = Array.from(document.querySelectorAll('*')).some(el => {
        const text = el.textContent?.toLowerCase() || '';
        const className = el.className?.toLowerCase() || '';
        return text.includes('자동결제') || text.includes('정기결제') ||
          className.includes('auto') || className.includes('recurring');
      });
      return autoPayElements;
    });

    tester.startGroup('📱 6. 반응형 및 보안 테스트');

    // 모바일 결제 지원
    tester.runTest('모바일 최적화', () => {
      const viewport = document.querySelector('meta[name="viewport"]');
      const mobileClasses = Array.from(document.querySelectorAll('*')).some(el => {
        const className = el.className || '';
        return className.includes('sm:') || className.includes('md:') || className.includes('mobile');
      });
      return !!viewport || mobileClasses;
    });

    // 보안 요소
    tester.runTest('보안 관련 UI', () => {
      const securityElements = Array.from(document.querySelectorAll('*')).some(el => {
        const text = el.textContent?.toLowerCase() || '';
        return text.includes('암호화') || text.includes('보안') || text.includes('ssl') ||
          text.includes('인증') || text.includes('검증');
      });
      return securityElements;
    });

    // 에러 처리
    tester.runTest('결제 에러 처리 UI', () => {
      const errorElements = Array.from(document.querySelectorAll('*')).some(el => {
        const className = el.className || '';
        return className.includes('error') || className.includes('alert') ||
          className.includes('warning') || className.includes('danger');
      });
      return errorElements;
    });

    // 테스트 결과 요약
    setTimeout(() => {
        const summary = tester.printSummary({
          showDetails: true,
          showTiming: true,
          showRecommendations: true
        });
        
        // 페이지별 특화 권장사항은 기존 로직 유지
        console.log('\n📚 추가 권장사항 및 팁은 기존 로직을 참고하세요.');
        console.log('🎯 테스트 완료!');
      }, 1000);
  }

  // 비동기 테스트 실행
  runAsyncTests();

})();

// 결제관리 전용 유틸리티 함수들
window.paymentPageTest = {
  // 결제 데이터 간단 체크
  checkPaymentData: async function () {
    console.log('💳 결제 데이터 상태 확인:');

    try {
      if (window.electronAPI?.database?.payment?.getAll) {
        const payments = await window.electronAPI.database.payment.getAll({});
        const paymentCount = Array.isArray(payments) ? payments.length : (payments?.payments?.length || 0);
        console.log(`✅ 결제 건수: ${paymentCount}건`);

        if (window.electronAPI.database.payment.getStats) {
          const stats = await window.electronAPI.database.payment.getStats();
          console.log(`✅ 총 결제 금액: ${stats?.total_amount?.toLocaleString() || 0}원`);
          console.log(`✅ 이번달 결제: ${stats?.this_month_count || 0}건`);
          console.log(`✅ 평균 결제 금액: ${stats?.average_amount?.toLocaleString() || 0}원`);
        }
      } else {
        console.log('❌ payment API를 사용할 수 없습니다');
      }
    } catch (error) {
      console.log(`❌ 결제 데이터 조회 실패: ${error.message}`);
    }
  },

  // 결제 검색 테스트
  testPaymentSearch: async function (searchTerm = 'test') {
    console.log(`🔍 결제 검색 테스트 (검색어: "${searchTerm}"):`);

    try {
      const results = await window.electronAPI.database.payment.getAll({ search: searchTerm });
      const resultCount = Array.isArray(results) ? results.length : (results?.payments?.length || 0);
      console.log(`✅ 검색 결과: ${resultCount}건`);
      return results;
    } catch (error) {
      console.log(`❌ 검색 실패: ${error.message}`);
      return null;
    }
  },

  // 날짜별 결제 조회
  testDateRangePayments: async function (days = 7) {
    console.log(`📅 최근 ${days}일 결제 조회:`);

    try {
      const endDate = new Date().toISOString().split('T')[0];
      const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      const results = await window.electronAPI.database.payment.getAll({
        payment_date_from: startDate,
        payment_date_to: endDate
      });

      const resultCount = Array.isArray(results) ? results.length : (results?.payments?.length || 0);
      console.log(`✅ ${days}일간 결제: ${resultCount}건`);
      return results;
    } catch (error) {
      console.log(`❌ 날짜별 조회 실패: ${error.message}`);
      return null;
    }
  },

  // UI 상태 체크
  checkPaymentUI: function () {
    console.log('🎨 결제관리 UI 상태:');

    const elements = {
      '검색 입력': !!document.querySelector('input[placeholder*="검색"]'),
      '결제 테이블': !!document.querySelector('table'),
      '신규등록 버튼': Array.from(document.querySelectorAll('button')).some(btn =>
        btn.textContent.includes('등록') || btn.textContent.includes('결제')),
      '필터 기능': Array.from(document.querySelectorAll('button')).some(btn => btn.textContent.includes('필터')),
      '통계 카드': document.querySelectorAll('.bg-white.rounded-lg, .card').length >= 3,
      '금액 표시': Array.from(document.querySelectorAll('*')).some(el =>
        el.textContent?.includes('원') || el.textContent?.includes(',')),
      '결제 상태': Array.from(document.querySelectorAll('*')).some(el =>
        el.textContent?.includes('완료') || el.textContent?.includes('대기'))
    };

    Object.entries(elements).forEach(([name, exists]) => {
      console.log(`${exists ? '✅' : '❌'} ${name}: ${exists ? '존재' : '없음'}`);
    });

    return elements;
  },

  // 결제 방법별 분석
  analyzePaymentMethods: async function () {
    console.log('💰 결제 방법별 분석:');

    try {
      const methods = ['card', 'cash', 'transfer'];
      const results = {};

      for (const method of methods) {
        const payments = await window.electronAPI.database.payment.getAll({ payment_method: method });
        const count = Array.isArray(payments) ? payments.length : (payments?.payments?.length || 0);
        results[method] = count;

        const methodName = method === 'card' ? '카드' : method === 'cash' ? '현금' : '계좌이체';
        console.log(`${methodName}: ${count}건`);
      }

      return results;
    } catch (error) {
      console.log(`❌ 결제 방법 분석 실패: ${error.message}`);
      return null;
    }
  },

  // 종합 빠른 체크
  quickCheck: async function () {
    console.log('⚡ 결제관리 페이지 빠른 체크:');

    const api = !!window.electronAPI?.database?.payment;
    const ui = this.checkPaymentUI();
    const uiScore = Object.values(ui).filter(Boolean).length;

    console.log(`🔧 API 상태: ${api ? '✅ 정상' : '❌ 문제'}`);
    console.log(`🎨 UI 상태: ${uiScore}/7 ${uiScore >= 5 ? '✅' : uiScore >= 3 ? '⚠️' : '❌'}`);

    if (api) {
      await this.checkPaymentData();
    }

    const overall = api && uiScore >= 4;
    console.log(`🏥 종합 평가: ${overall ? '✅ 정상' : '❌ 점검 필요'}`);

    return { api, ui, overall };
  }
};

console.log('\n💡 결제관리 전용 유틸리티 사용법:');
console.log('- paymentPageTest.checkPaymentData() : 결제 데이터 확인');
console.log('- paymentPageTest.testPaymentSearch("검색어") : 결제 검색 테스트');
console.log('- paymentPageTest.testDateRangePayments(7) : 날짜별 결제 조회');
console.log('- paymentPageTest.checkPaymentUI() : UI 상태 확인');
console.log('- paymentPageTest.analyzePaymentMethods() : 결제 방법별 분석');
console.log('- paymentPageTest.quickCheck() : 종합 빠른 체크'); 