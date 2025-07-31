/**
 * 공통 페이지 기능 테스트 스크립트
 * 
 * 모든 CRM 페이지에서 사용할 수 있는 범용 테스트 스크립트입니다.
 * 현재 페이지를 자동으로 감지하고 해당 페이지에 맞는 테스트를 실행합니다.
 * 
 * 사용 방법:
 * 1. 아무 CRM 페이지에서 F12 키로 개발자 도구 열기
 * 2. Console 탭 선택
 * 3. 이 스크립트 전체를 복사하여 붙여넣기
 * 4. Enter 키 실행
 */

// TestFramework 로드 (브라우저 환경에서는 별도 로드 필요)
let TestFramework;
if (typeof window !== 'undefined' && window.TestFramework) {
  TestFramework = window.TestFramework;
} else if (typeof require !== 'undefined') {
  try {
    TestFramework = require('./utils/test-framework.js');
  } catch (error) {
    console.error('TestFramework를 로드할 수 없습니다:', error.message);
    console.log('브라우저에서는 먼저 TestFramework를 로드해주세요.');
    
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
  console.log('🌐 CRM 시스템 공통 기능 테스트');
  console.log('='.repeat(50));

  // TestFramework 인스턴스 생성
  const tester = new TestFramework('CRM 공통 기능');

  // 현재 페이지 감지
  const currentPage = tester.detectCurrentPage();
  console.log(`📍 감지된 페이지: ${currentPage}`);
  console.log('-'.repeat(30));

  // 환경 정보 확인
  const env = tester.checkEnvironment();

  // 1. 기본 환경 테스트
  tester.startGroup('🔧 1. 기본 환경 테스트');

  tester.runTest('Electron 환경 확인', () => {
    return env.isElectron;
  });

  tester.runTest('electronAPI 존재 확인', () => {
    return env.hasElectronAPI;
  });

  tester.runTest('database API 존재 확인', () => {
    return typeof window.electronAPI?.database === 'object';
  });

  // 2. 공통 API 테스트
  tester.startGroup('🔌 2. 공통 API 테스트');

  tester.runTest('system API 존재', () => {
    return typeof window.electronAPI?.system === 'object';
  });

  tester.runTest('database 연결 상태', () => {
    return typeof window.electronAPI?.database === 'object' &&
      Object.keys(window.electronAPI.database).length > 0;
  });

  // 페이지별 특화 API 체크
  if (currentPage === 'members') {
    tester.runTest('member API 존재', () => {
      return typeof window.electronAPI?.database?.member === 'object';
    });

    tester.runTest('member API 메서드들', () => {
      const member = window.electronAPI?.database?.member;
      const requiredMethods = ['getAll', 'getStats', 'create', 'update', 'delete'];
      return member && requiredMethods.every(method => typeof member[method] === 'function');
    });
  } else if (currentPage === 'staff') {
    tester.runTest('staff API 존재', () => {
      return typeof window.electronAPI?.database?.staff === 'object';
    });

    tester.runTest('staff API 메서드들', () => {
      const staff = window.electronAPI?.database?.staff;
      const requiredMethods = ['getAll', 'getStats', 'create', 'update', 'delete'];
      return staff && requiredMethods.every(method => typeof staff[method] === 'function');
    });
  } else if (currentPage === 'payments') {
    tester.runTest('payment API 존재', () => {
      return typeof window.electronAPI?.database?.payment === 'object';
    });

    tester.runTest('payment API 메서드들', () => {
      const payment = window.electronAPI?.database?.payment;
      const requiredMethods = ['getAll', 'getStats', 'create', 'update', 'delete'];
      return payment && requiredMethods.every(method => typeof payment[method] === 'function');
    });
  } else {
    // 알 수 없는 페이지인 경우 모든 주요 API 확인
    tester.runTest('주요 API들 존재', () => {
      return !!(window.electronAPI?.database?.member &&
        window.electronAPI?.database?.staff &&
        window.electronAPI?.database?.payment);
    });
  }

  // 3. UI 컴포넌트 테스트
  tester.startGroup('🎨 3. UI 컴포넌트 테스트');

  tester.runTest('기본 입력 요소 존재', () => {
    return document.querySelectorAll('input, select, textarea').length > 0;
  });

  tester.runTest('버튼들 존재', () => {
    return document.querySelectorAll('button').length >= 3;
  });

  tester.runTest('네비게이션 존재', () => {
    return !!(document.querySelector('nav') ||
      document.querySelector('.sidebar') ||
      document.querySelector('[class*="nav"]') ||
      document.querySelector('[role="navigation"]'));
  });

  tester.runTest('메인 컨텐츠 영역', () => {
    return !!(document.querySelector('main') ||
      document.querySelector('.main') ||
      document.querySelector('[class*="content"]') ||
      document.querySelector('[role="main"]'));
  });

  // 페이지별 특화 UI 체크
  if (currentPage === 'members') {
    tester.runTest('회원 관련 UI 요소', () => {
      const hasTable = !!document.querySelector('table');
      const hasSearchInput = !!document.querySelector('input[placeholder*="검색"]');
      const hasCards = document.querySelectorAll('.bg-white.rounded-lg, .card').length >= 3;
      return hasTable || hasSearchInput || hasCards;
    });
  } else if (currentPage === 'staff') {
    tester.runTest('직원 관련 UI 요소', () => {
      const hasStaffElements = !!(document.querySelector('[class*="staff"]') ||
        document.querySelector('[title*="직원"]') ||
        document.querySelector('table'));
      return hasStaffElements;
    });
  } else if (currentPage === 'payments') {
    tester.runTest('결제 관련 UI 요소', () => {
      const hasPaymentElements = !!(document.querySelector('[class*="payment"]') ||
        document.querySelector('[title*="결제"]') ||
        document.querySelector('table'));
      return hasPaymentElements;
    });
  } else if (currentPage === 'dashboard') {
    tester.runTest('대시보드 위젯들', () => {
      const widgets = document.querySelectorAll('.bg-white.rounded-lg, .card, [class*="widget"]');
      return widgets.length >= 4;
    });
  }

  // 4. 반응형 및 접근성 테스트
  tester.startGroup('📱 4. 반응형 및 접근성 테스트');

  tester.runTest('CSS 스타일시트 로드', () => {
    return document.styleSheets.length > 0;
  });

  tester.runTest('모바일 뷰포트 설정', () => {
    const viewport = document.querySelector('meta[name="viewport"]');
    return !!viewport;
  });

  tester.runTest('기본 접근성 요소', () => {
    const hasAltTexts = document.querySelectorAll('img[alt]').length > 0 ||
      document.querySelectorAll('img').length === 0;
    const hasLabels = document.querySelectorAll('label').length > 0 ||
      document.querySelectorAll('input[aria-label]').length > 0;
    return hasAltTexts && (hasLabels || document.querySelectorAll('input').length === 0);
  });

  // 5. 성능 테스트
  tester.startGroup('⚡ 5. 성능 테스트');

  tester.runTest('DOM 렌더링 완료', () => {
    return document.readyState === 'complete';
  });

  tester.runTest('메모리 사용량 확인', () => {
    if (performance.memory) {
      const used = performance.memory.usedJSHeapSize;
      const limit = performance.memory.jsHeapSizeLimit;
      const ratio = used / limit;
      console.log(`  메모리 사용률: ${(ratio * 100).toFixed(1)}%`);
      return ratio < 0.8; // 80% 미만이면 정상
    }
    return true; // 메모리 정보가 없으면 통과
  });

  // 비동기 테스트들
  async function runAsyncTests() {
    // 6. 데이터 로딩 테스트
    tester.startGroup('📊 6. 데이터 로딩 테스트');

    if (window.electronAPI?.database) {
      if (currentPage === 'members' && window.electronAPI.database.member) {
        await tester.runAsyncTest('회원 목록 로딩', async () => {
          const result = await window.electronAPI.database.member.getAll({});
          return result !== null && result !== undefined;
        });

        await tester.runAsyncTest('회원 통계 로딩', async () => {
          const stats = await window.electronAPI.database.member.getStats();
          return stats && typeof stats.total === 'number';
        });
      } else if (currentPage === 'staff' && window.electronAPI.database.staff) {
        await tester.runAsyncTest('직원 목록 로딩', async () => {
          const result = await window.electronAPI.database.staff.getAll({});
          return result !== null && result !== undefined;
        });

        await tester.runAsyncTest('직원 통계 로딩', async () => {
          const stats = await window.electronAPI.database.staff.getStats();
          return stats && typeof stats.total === 'number';
        });
      } else if (currentPage === 'payments' && window.electronAPI.database.payment) {
        await tester.runAsyncTest('결제 목록 로딩', async () => {
          const result = await window.electronAPI.database.payment.getAll({});
          return result !== null && result !== undefined;
        });

        await tester.runAsyncTest('결제 통계 로딩', async () => {
          const stats = await window.electronAPI.database.payment.getStats();
          return stats && typeof stats.total === 'number';
        });
      }
    } else {
      console.log('⚠️ 데이터베이스 API가 없어 데이터 로딩 테스트를 건너뜁니다.');
    }

    // 테스트 결과 요약
    setTimeout(() => {
      const summary = tester.printSummary({
        showDetails: true,
        showTiming: true,
        showRecommendations: true
      });

      // 페이지별 추가 권장사항
      console.log('\n📚 추가 테스트 권장사항:');
      if (currentPage === 'members') {
        console.log('- scripts/test-member-features.js로 회원관리 특화 테스트');
      } else if (currentPage === 'staff') {
        console.log('- scripts/test-staff-features.js로 직원관리 특화 테스트');
      } else if (currentPage === 'payments') {
        console.log('- scripts/test-payment-features.js로 결제관리 특화 테스트');
      } else if (currentPage === 'dashboard') {
        console.log('- scripts/test-dashboard-features.js로 대시보드 특화 테스트');
      }

      // 사용 가능한 API 목록
      if (window.electronAPI?.database) {
        console.log('\n🔧 사용 가능한 데이터베이스 API:');
        Object.keys(window.electronAPI.database).forEach(api => {
          const methods = window.electronAPI.database[api];
          if (typeof methods === 'object' && methods !== null) {
            console.log(`  - ${api}: ${Object.keys(methods).join(', ')}`);
          }
        });
      }

      console.log('\n🎯 테스트 완료! 필요시 페이지별 특화 테스트를 진행하세요.');
    }, 1000);
  }

  // 비동기 테스트 실행
  runAsyncTests();

})();

// 공통 유틸리티 함수들을 전역에 등록 (기존 호환성 유지)
window.commonPageTest = {
  // 현재 페이지 확인
  getCurrentPage: function () {
    const tester = new TestFramework();
    return tester.detectCurrentPage();
  },

  // API 상태 확인
  checkAPIStatus: function () {
    console.log('🔍 API 상태 확인:');
    console.log('electronAPI:', !!window.electronAPI);
    console.log('database:', !!window.electronAPI?.database);

    if (window.electronAPI?.database) {
      Object.keys(window.electronAPI.database).forEach(api => {
        console.log(`${api} API:`, !!window.electronAPI.database[api]);
      });
    }
  },

  // UI 상태 확인
  checkUIStatus: function () {
    console.log('🎨 UI 상태 확인:');
    console.log('입력 요소:', document.querySelectorAll('input, select, textarea').length, '개');
    console.log('버튼:', document.querySelectorAll('button').length, '개');
    console.log('테이블:', document.querySelectorAll('table').length, '개');
    console.log('폼:', document.querySelectorAll('form').length, '개');
  },

  // 종합 빠른 체크
  quickCheck: function () {
    const tester = new TestFramework('빠른 체크');
    return tester.quickHealthCheck();
  }
};

console.log('\n💡 추가 유틸리티 사용법:');
console.log('- commonPageTest.getCurrentPage() : 현재 페이지 확인');
console.log('- commonPageTest.checkAPIStatus() : API 상태 확인');
console.log('- commonPageTest.checkUIStatus() : UI 상태 확인');
console.log('- commonPageTest.quickCheck() : 종합 빠른 체크'); 