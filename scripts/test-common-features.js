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

(function () {
  console.clear();
  console.log('🌐 CRM 시스템 공통 기능 테스트');
  console.log('='.repeat(50));

  let totalTests = 0;
  let passedTests = 0;
  let failedTests = 0;

  function runTest(testName, testFn) {
    totalTests++;
    try {
      const result = testFn();
      if (result) {
        passedTests++;
        console.log(`✅ ${testName}: 통과`);
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
  }

  function runAsyncTest(testName, testFn) {
    totalTests++;
    return testFn()
      .then(result => {
        if (result) {
          passedTests++;
          console.log(`✅ ${testName}: 통과`);
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

  // 현재 페이지 감지
  function detectCurrentPage() {
    const path = window.location.pathname || window.location.hash || '';
    const title = document.title || '';
    const url = window.location.href || '';

    if (path.includes('member') || title.includes('회원') || url.includes('member')) {
      return 'members';
    } else if (path.includes('staff') || title.includes('직원') || url.includes('staff')) {
      return 'staff';
    } else if (path.includes('payment') || title.includes('결제') || url.includes('payment')) {
      return 'payments';
    } else if (path.includes('dashboard') || title.includes('대시보드') || url.includes('dashboard')) {
      return 'dashboard';
    } else {
      // DOM 기반 감지
      if (document.querySelector('[class*="member"], [title*="회원"]')) return 'members';
      if (document.querySelector('[class*="staff"], [title*="직원"]')) return 'staff';
      if (document.querySelector('[class*="payment"], [title*="결제"]')) return 'payments';
      if (document.querySelector('[class*="dashboard"], [title*="대시보드"]')) return 'dashboard';
    }

    return 'unknown';
  }

  const currentPage = detectCurrentPage();
  console.log(`📍 감지된 페이지: ${currentPage}`);
  console.log('-'.repeat(30));

  // 1. 기본 환경 테스트
  console.log('\n🔧 1. 기본 환경 테스트');
  console.log('-'.repeat(25));

  runTest('Electron 환경 확인', () => {
    return typeof window !== 'undefined' && !!window.process;
  });

  runTest('electronAPI 존재 확인', () => {
    return typeof window.electronAPI === 'object' && window.electronAPI !== null;
  });

  runTest('database API 존재 확인', () => {
    return typeof window.electronAPI?.database === 'object';
  });

  // 2. 공통 API 테스트
  console.log('\n🔌 2. 공통 API 테스트');
  console.log('-'.repeat(25));

  runTest('system API 존재', () => {
    return typeof window.electronAPI?.system === 'object';
  });

  runTest('database 연결 상태', () => {
    return typeof window.electronAPI?.database === 'object' &&
      Object.keys(window.electronAPI.database).length > 0;
  });

  // 페이지별 특화 API 체크
  if (currentPage === 'members') {
    runTest('member API 존재', () => {
      return typeof window.electronAPI?.database?.member === 'object';
    });

    runTest('member API 메서드들', () => {
      const member = window.electronAPI?.database?.member;
      const requiredMethods = ['getAll', 'getStats', 'create', 'update', 'delete'];
      return member && requiredMethods.every(method => typeof member[method] === 'function');
    });
  } else if (currentPage === 'staff') {
    runTest('staff API 존재', () => {
      return typeof window.electronAPI?.database?.staff === 'object';
    });

    runTest('staff API 메서드들', () => {
      const staff = window.electronAPI?.database?.staff;
      const requiredMethods = ['getAll', 'getStats', 'create', 'update', 'delete'];
      return staff && requiredMethods.every(method => typeof staff[method] === 'function');
    });
  } else if (currentPage === 'payments') {
    runTest('payment API 존재', () => {
      return typeof window.electronAPI?.database?.payment === 'object';
    });

    runTest('payment API 메서드들', () => {
      const payment = window.electronAPI?.database?.payment;
      const requiredMethods = ['getAll', 'getStats', 'create', 'update', 'delete'];
      return payment && requiredMethods.every(method => typeof payment[method] === 'function');
    });
  } else {
    // 알 수 없는 페이지인 경우 모든 주요 API 확인
    runTest('주요 API들 존재', () => {
      return !!(window.electronAPI?.database?.member &&
        window.electronAPI?.database?.staff &&
        window.electronAPI?.database?.payment);
    });
  }

  // 3. UI 컴포넌트 테스트
  console.log('\n🎨 3. UI 컴포넌트 테스트');
  console.log('-'.repeat(25));

  runTest('기본 입력 요소 존재', () => {
    return document.querySelectorAll('input, select, textarea').length > 0;
  });

  runTest('버튼들 존재', () => {
    return document.querySelectorAll('button').length >= 3;
  });

  runTest('네비게이션 존재', () => {
    return !!(document.querySelector('nav') ||
      document.querySelector('.sidebar') ||
      document.querySelector('[class*="nav"]') ||
      document.querySelector('[role="navigation"]'));
  });

  runTest('메인 컨텐츠 영역', () => {
    return !!(document.querySelector('main') ||
      document.querySelector('.main') ||
      document.querySelector('[class*="content"]') ||
      document.querySelector('[role="main"]'));
  });

  // 페이지별 특화 UI 체크
  if (currentPage === 'members') {
    runTest('회원 관련 UI 요소', () => {
      const hasTable = !!document.querySelector('table');
      const hasSearchInput = !!document.querySelector('input[placeholder*="검색"]');
      const hasCards = document.querySelectorAll('.bg-white.rounded-lg, .card').length >= 3;
      return hasTable || hasSearchInput || hasCards;
    });
  } else if (currentPage === 'staff') {
    runTest('직원 관련 UI 요소', () => {
      const hasStaffElements = !!(document.querySelector('[class*="staff"]') ||
        document.querySelector('[title*="직원"]') ||
        document.querySelector('table'));
      return hasStaffElements;
    });
  } else if (currentPage === 'payments') {
    runTest('결제 관련 UI 요소', () => {
      const hasPaymentElements = !!(document.querySelector('[class*="payment"]') ||
        document.querySelector('[title*="결제"]') ||
        document.querySelector('table'));
      return hasPaymentElements;
    });
  } else if (currentPage === 'dashboard') {
    runTest('대시보드 위젯들', () => {
      const widgets = document.querySelectorAll('.bg-white.rounded-lg, .card, [class*="widget"]');
      return widgets.length >= 4;
    });
  }

  // 4. 반응형 및 접근성 테스트
  console.log('\n📱 4. 반응형 및 접근성 테스트');
  console.log('-'.repeat(25));

  runTest('CSS 스타일시트 로드', () => {
    return document.styleSheets.length > 0;
  });

  runTest('모바일 뷰포트 설정', () => {
    const viewport = document.querySelector('meta[name="viewport"]');
    return !!viewport;
  });

  runTest('기본 접근성 요소', () => {
    const hasAltTexts = document.querySelectorAll('img[alt]').length > 0 ||
      document.querySelectorAll('img').length === 0;
    const hasLabels = document.querySelectorAll('label').length > 0 ||
      document.querySelectorAll('input[aria-label]').length > 0;
    return hasAltTexts && (hasLabels || document.querySelectorAll('input').length === 0);
  });

  // 5. 성능 테스트
  console.log('\n⚡ 5. 성능 테스트');
  console.log('-'.repeat(25));

  runTest('DOM 렌더링 완료', () => {
    return document.readyState === 'complete';
  });

  runTest('메모리 사용량 확인', () => {
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
    console.log('\n📊 6. 데이터 로딩 테스트');
    console.log('-'.repeat(25));

    if (window.electronAPI?.database) {
      if (currentPage === 'members' && window.electronAPI.database.member) {
        await runAsyncTest('회원 목록 로딩', async () => {
          const result = await window.electronAPI.database.member.getAll({});
          return result !== null && result !== undefined;
        });

        await runAsyncTest('회원 통계 로딩', async () => {
          const stats = await window.electronAPI.database.member.getStats();
          return stats && typeof stats.total === 'number';
        });
      } else if (currentPage === 'staff' && window.electronAPI.database.staff) {
        await runAsyncTest('직원 목록 로딩', async () => {
          const result = await window.electronAPI.database.staff.getAll({});
          return result !== null && result !== undefined;
        });

        await runAsyncTest('직원 통계 로딩', async () => {
          const stats = await window.electronAPI.database.staff.getStats();
          return stats && typeof stats.total === 'number';
        });
      } else if (currentPage === 'payments' && window.electronAPI.database.payment) {
        await runAsyncTest('결제 목록 로딩', async () => {
          const result = await window.electronAPI.database.payment.getAll({});
          return result !== null && result !== undefined;
        });

        await runAsyncTest('결제 통계 로딩', async () => {
          const stats = await window.electronAPI.database.payment.getStats();
          return stats && typeof stats.total === 'number';
        });
      }
    } else {
      console.log('⚠️ 데이터베이스 API가 없어 데이터 로딩 테스트를 건너뜁니다.');
    }

    // 테스트 결과 요약
    setTimeout(() => {
      console.log('\n' + '='.repeat(50));
      console.log('📊 테스트 결과 요약');
      console.log('='.repeat(50));
      console.log(`페이지: ${currentPage}`);
      console.log(`총 테스트: ${totalTests}개`);
      console.log(`성공: ${passedTests}개`);
      console.log(`실패: ${failedTests}개`);

      const successRate = totalTests > 0 ? ((passedTests / totalTests) * 100).toFixed(1) : 0;
      console.log(`성공률: ${successRate}%`);

      // 결과 해석
      if (successRate >= 90) {
        console.log('\n🎉 훌륭합니다! 페이지가 정상적으로 작동합니다.');
        console.log('💡 배포 준비가 완료되었습니다.');
      } else if (successRate >= 75) {
        console.log('\n👍 양호합니다. 대부분의 기능이 정상 작동합니다.');
        console.log('💡 일부 개선사항이 있지만 사용에는 문제없습니다.');
      } else if (successRate >= 50) {
        console.log('\n⚠️ 주의 필요. 여러 기능에 문제가 있습니다.');
        console.log('💡 문제점들을 수정한 후 재테스트를 권장합니다.');
      } else {
        console.log('\n🚨 심각한 문제가 있습니다.');
        console.log('💡 기본 기능부터 점검이 필요합니다.');
      }

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

      // 문제 해결 팁
      if (failedTests > 0) {
        console.log('\n🔧 문제 해결 팁:');

        if (!window.electronAPI) {
          console.log('- electronAPI 없음: 앱 재시작 또는 preload 스크립트 확인');
        }

        if (document.querySelectorAll('button').length < 3) {
          console.log('- UI 요소 부족: 페이지 로딩 완료 후 다시 시도');
        }

        if (document.readyState !== 'complete') {
          console.log('- 페이지 로딩 미완료: 잠시 후 다시 실행');
        }
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

// 공통 유틸리티 함수들을 전역에 등록
window.commonPageTest = {
  // 현재 페이지 확인
  getCurrentPage: function () {
    const path = window.location.pathname || window.location.hash || '';
    const title = document.title || '';

    if (path.includes('member') || title.includes('회원')) return 'members';
    if (path.includes('staff') || title.includes('직원')) return 'staff';
    if (path.includes('payment') || title.includes('결제')) return 'payments';
    if (path.includes('dashboard') || title.includes('대시보드')) return 'dashboard';

    return 'unknown';
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
    const page = this.getCurrentPage();
    console.log(`📍 현재 페이지: ${page}`);
    this.checkAPIStatus();
    this.checkUIStatus();

    const health = {
      api: !!window.electronAPI?.database,
      ui: document.querySelectorAll('button').length > 2,
      page: page !== 'unknown'
    };

    const score = Object.values(health).filter(Boolean).length;
    console.log(`🏥 종합 상태: ${score}/3 ${score === 3 ? '🟢' : score >= 2 ? '🟡' : '🔴'}`);

    return health;
  }
};

console.log('\n💡 추가 유틸리티 사용법:');
console.log('- commonPageTest.getCurrentPage() : 현재 페이지 확인');
console.log('- commonPageTest.checkAPIStatus() : API 상태 확인');
console.log('- commonPageTest.checkUIStatus() : UI 상태 확인');
console.log('- commonPageTest.quickCheck() : 종합 빠른 체크'); 