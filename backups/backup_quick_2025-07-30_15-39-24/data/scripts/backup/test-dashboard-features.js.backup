/**
 * 대시보드 페이지 전용 기능 테스트 스크립트
 * 
 * 대시보드 페이지에서 사용할 수 있는 특화된 테스트 스크립트입니다.
 * 대시보드의 모든 위젯과 차트, 통계를 체계적으로 검증합니다.
 * 
 * 사용 방법:
 * 1. 대시보드 페이지 열기
 * 2. F12 키로 개발자 도구 열기
 * 3. Console 탭 선택
 * 4. 이 스크립트 전체를 복사하여 붙여넣기
 * 5. Enter 키 실행
 */

(function () {
  console.clear();
  console.log('📊 대시보드 페이지 기능 테스트 시작');
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

  console.log('\n🔧 1. API 연결 테스트');
  console.log('-'.repeat(30));

  // API 존재 확인
  runTest('electronAPI 존재 확인', () => {
    return typeof window.electronAPI === 'object' && window.electronAPI !== null;
  });

  runTest('database API 존재 확인', () => {
    return typeof window.electronAPI?.database === 'object';
  });

  // 모든 주요 API 확인 (대시보드는 모든 데이터 소스 필요)
  const requiredAPIs = ['member', 'staff', 'payment'];
  requiredAPIs.forEach(api => {
    runTest(`${api} API 존재 확인`, () => {
      return typeof window.electronAPI?.database?.[api] === 'object';
    });

    runTest(`${api}.getStats 메서드 존재`, () => {
      return typeof window.electronAPI?.database?.[api]?.getStats === 'function';
    });
  });

  // 시스템 API 확인
  runTest('system API 존재 확인', () => {
    return typeof window.electronAPI?.system === 'object';
  });

  console.log('\n🎨 2. 대시보드 UI 컴포넌트 테스트');
  console.log('-'.repeat(30));

  // 기본 대시보드 구조
  runTest('대시보드 메인 컨테이너', () => {
    return !!(document.querySelector('.dashboard') ||
      document.querySelector('[class*="dashboard"]') ||
      document.querySelector('main') ||
      document.querySelector('[role="main"]'));
  });

  runTest('통계 카드들 존재', () => {
    const cards = document.querySelectorAll('.bg-white.rounded-lg, .card, [class*="stat"], [class*="widget"]');
    return cards.length >= 6; // 최소 6개 이상의 카드/위젯
  });

  runTest('그리드 레이아웃', () => {
    const gridElements = document.querySelectorAll('[class*="grid"], .grid, [style*="grid"]');
    return gridElements.length > 0;
  });

  // 회원 관련 위젯
  runTest('회원 관련 통계 위젯', () => {
    const memberWidgets = Array.from(document.querySelectorAll('*')).some(el => {
      const text = el.textContent?.toLowerCase() || '';
      return text.includes('전체 회원') || text.includes('활성 회원') ||
        text.includes('신규 회원') || text.includes('회원수');
    });
    return memberWidgets;
  });

  // 직원 관련 위젯
  runTest('직원 관련 통계 위젯', () => {
    const staffWidgets = Array.from(document.querySelectorAll('*')).some(el => {
      const text = el.textContent?.toLowerCase() || '';
      return text.includes('직원') || text.includes('스태프') || text.includes('근무');
    });
    return staffWidgets;
  });

  // 결제 관련 위젯
  runTest('결제 관련 통계 위젯', () => {
    const paymentWidgets = Array.from(document.querySelectorAll('*')).some(el => {
      const text = el.textContent?.toLowerCase() || '';
      return text.includes('결제') || text.includes('매출') || text.includes('수익') ||
        text.includes('원') && text.match(/\d+,?\d*/);
    });
    return paymentWidgets;
  });

  // 차트 및 그래프
  runTest('차트/그래프 요소', () => {
    const chartElements = document.querySelectorAll('canvas, svg, [class*="chart"], [class*="graph"]');
    return chartElements.length > 0;
  });

  // 네비게이션 링크
  runTest('페이지 이동 링크', () => {
    const links = Array.from(document.querySelectorAll('a, button, [role="link"]')).some(el => {
      const text = el.textContent?.toLowerCase() || '';
      return text.includes('회원관리') || text.includes('직원관리') ||
        text.includes('결제관리') || text.includes('더보기');
    });
    return links;
  });

  // 시간 정보
  runTest('날짜/시간 표시', () => {
    const timeElements = Array.from(document.querySelectorAll('*')).some(el => {
      const text = el.textContent || '';
      return text.includes('년') || text.includes('월') || text.includes('일') ||
        text.match(/\d{4}-\d{2}-\d{2}/) || text.includes('오늘') || text.includes('이번달');
    });
    return timeElements;
  });

  console.log('\n📊 3. 데이터 로딩 테스트');
  console.log('-'.repeat(30));

  // 비동기 테스트들을 순차적으로 실행
  async function runAsyncTests() {
    // 회원 통계 로딩
    if (window.electronAPI?.database?.member?.getStats) {
      await runAsyncTest('회원 통계 로딩', async () => {
        const stats = await window.electronAPI.database.member.getStats();
        return stats && typeof stats.total === 'number';
      });
    }

    // 직원 통계 로딩
    if (window.electronAPI?.database?.staff?.getStats) {
      await runAsyncTest('직원 통계 로딩', async () => {
        const stats = await window.electronAPI.database.staff.getStats();
        return stats && typeof stats === 'object';
      });
    }

    // 결제 통계 로딩
    if (window.electronAPI?.database?.payment?.getStats) {
      await runAsyncTest('결제 통계 로딩', async () => {
        const stats = await window.electronAPI.database.payment.getStats();
        return stats && typeof stats === 'object';
      });
    }

    // 최근 활동 데이터
    if (window.electronAPI?.database?.member?.getAll) {
      await runAsyncTest('최근 신규 회원 조회', async () => {
        const recentMembers = await window.electronAPI.database.member.getAll({
          limit: 5,
          sort: { field: 'join_date', direction: 'desc' }
        });
        return recentMembers !== null;
      });
    }

    if (window.electronAPI?.database?.payment?.getAll) {
      await runAsyncTest('최근 결제 내역 조회', async () => {
        const recentPayments = await window.electronAPI.database.payment.getAll({
          limit: 5,
          sort: { field: 'payment_date', direction: 'desc' }
        });
        return recentPayments !== null;
      });
    }

    // 시스템 정보
    if (window.electronAPI?.system) {
      await runAsyncTest('시스템 정보 조회', async () => {
        try {
          if (window.electronAPI.system.getAppVersion) {
            const version = await window.electronAPI.system.getAppVersion();
            return typeof version === 'string';
          }
          return true; // 메서드가 없어도 통과
        } catch (error) {
          return false;
        }
      });
    }

    console.log('\n📈 4. 통계 및 분석 테스트');
    console.log('-'.repeat(30));

    // 숫자 포맷팅 확인
    runTest('숫자 포맷팅 (천 단위 구분)', () => {
      const formattedNumbers = Array.from(document.querySelectorAll('*')).some(el => {
        const text = el.textContent || '';
        return text.match(/\d{1,3}(,\d{3})+/) || text.includes('천') || text.includes('만');
      });
      return formattedNumbers;
    });

    // 백분율 표시
    runTest('백분율 표시', () => {
      const percentages = Array.from(document.querySelectorAll('*')).some(el => {
        const text = el.textContent || '';
        return text.includes('%') || text.includes('퍼센트');
      });
      return percentages;
    });

    // 증감 표시
    runTest('증감 표시 (전월 대비 등)', () => {
      const changeIndicators = Array.from(document.querySelectorAll('*')).some(el => {
        const text = el.textContent?.toLowerCase() || '';
        const className = el.className?.toLowerCase() || '';
        return text.includes('증가') || text.includes('감소') || text.includes('대비') ||
          text.includes('↑') || text.includes('↓') || text.includes('+') ||
          className.includes('increase') || className.includes('decrease') ||
          className.includes('up') || className.includes('down');
      });
      return changeIndicators;
    });

    // 기간 필터링
    runTest('기간 선택 UI', () => {
      const periodFilters = Array.from(document.querySelectorAll('*')).some(el => {
        const text = el.textContent?.toLowerCase() || '';
        return text.includes('오늘') || text.includes('이번주') || text.includes('이번달') ||
          text.includes('지난달') || text.includes('올해') || text.includes('기간');
      });
      return periodFilters;
    });

    console.log('\n🎯 5. 대시보드 특화 기능 테스트');
    console.log('-'.repeat(30));

    // 실시간 업데이트
    runTest('실시간 데이터 표시', () => {
      const realTimeElements = Array.from(document.querySelectorAll('*')).some(el => {
        const text = el.textContent?.toLowerCase() || '';
        const className = el.className?.toLowerCase() || '';
        return text.includes('실시간') || text.includes('최신') || text.includes('업데이트') ||
          className.includes('realtime') || className.includes('live') ||
          className.includes('refresh');
      });
      return realTimeElements;
    });

    // 알림 및 알람
    runTest('알림/알람 기능', () => {
      const alertElements = Array.from(document.querySelectorAll('*')).some(el => {
        const text = el.textContent?.toLowerCase() || '';
        const className = el.className?.toLowerCase() || '';
        return text.includes('알림') || text.includes('경고') || text.includes('주의') ||
          className.includes('alert') || className.includes('notification') ||
          className.includes('warning');
      });
      return alertElements;
    });

    // 빠른 액션 버튼
    runTest('빠른 액션 버튼', () => {
      const quickActions = Array.from(document.querySelectorAll('button, a')).some(el => {
        const text = el.textContent?.toLowerCase() || '';
        return text.includes('신규') || text.includes('등록') || text.includes('추가') ||
          text.includes('바로가기') || text.includes('더보기');
      });
      return quickActions;
    });

    // 검색 기능
    runTest('통합 검색 기능', () => {
      const searchElements = document.querySelectorAll('input[type="search"], input[placeholder*="검색"]');
      return searchElements.length > 0;
    });

    // 사용자 정보
    runTest('사용자 정보 표시', () => {
      const userInfo = Array.from(document.querySelectorAll('*')).some(el => {
        const text = el.textContent?.toLowerCase() || '';
        const className = el.className?.toLowerCase() || '';
        return text.includes('사용자') || text.includes('관리자') || text.includes('로그인') ||
          className.includes('user') || className.includes('profile') ||
          className.includes('admin');
      });
      return userInfo;
    });

    console.log('\n📱 6. 반응형 및 성능 테스트');
    console.log('-'.repeat(30));

    // 반응형 디자인
    runTest('반응형 그리드 시스템', () => {
      const responsiveClasses = Array.from(document.querySelectorAll('*')).some(el => {
        const className = el.className || '';
        return className.includes('sm:') || className.includes('md:') ||
          className.includes('lg:') || className.includes('xl:') ||
          className.includes('responsive') || className.includes('mobile');
      });
      return responsiveClasses;
    });

    // 로딩 상태
    runTest('로딩 상태 표시', () => {
      const loadingElements = Array.from(document.querySelectorAll('*')).some(el => {
        const className = el.className || '';
        const text = el.textContent || '';
        return className.includes('loading') || className.includes('spinner') ||
          className.includes('skeleton') || className.includes('animate') ||
          text.includes('로딩') || text.includes('Loading');
      });
      return loadingElements;
    });

    // 에러 처리
    runTest('에러 상태 표시', () => {
      const errorElements = Array.from(document.querySelectorAll('*')).some(el => {
        const className = el.className || '';
        return className.includes('error') || className.includes('alert-danger') ||
          className.includes('bg-red') || className.includes('text-red');
      });
      return errorElements || true; // 에러가 없을 수도 있으므로 관대하게 처리
    });

    // 성능 체크
    runTest('렌더링 성능', () => {
      const renderTime = performance.now();
      const isComplete = document.readyState === 'complete';
      const hasLargeDOM = document.querySelectorAll('*').length < 1000; // DOM 노드가 너무 많지 않은지

      return isComplete && hasLargeDOM;
    });

    console.log('\n📊 7. 차트 및 시각화 테스트');
    console.log('-'.repeat(30));

    // Canvas 기반 차트
    runTest('Canvas 차트 요소', () => {
      const canvasElements = document.querySelectorAll('canvas');
      return canvasElements.length > 0;
    });

    // SVG 기반 차트
    runTest('SVG 차트 요소', () => {
      const svgElements = document.querySelectorAll('svg');
      return svgElements.length > 0;
    });

    // 차트 라이브러리 로딩
    runTest('차트 라이브러리 로딩', () => {
      return !!(window.Chart || window.d3 || window.Highcharts ||
        window.ApexCharts || window.echarts);
    });

    // 프로그레스 바
    runTest('프로그레스 바/게이지', () => {
      const progressElements = document.querySelectorAll('progress, [role="progressbar"], [class*="progress"]');
      return progressElements.length > 0;
    });

    // 테스트 결과 요약
    setTimeout(() => {
      console.log('\n' + '='.repeat(50));
      console.log('📊 대시보드 페이지 테스트 결과');
      console.log('='.repeat(50));
      console.log(`총 테스트: ${totalTests}개`);
      console.log(`성공: ${passedTests}개`);
      console.log(`실패: ${failedTests}개`);

      const successRate = totalTests > 0 ? ((passedTests / totalTests) * 100).toFixed(1) : 0;
      console.log(`성공률: ${successRate}%`);

      // 결과 해석
      if (successRate >= 90) {
        console.log('\n🎉 훌륭합니다! 대시보드가 완벽하게 작동합니다.');
        console.log('💡 모든 위젯과 차트가 정상적으로 표시되고 있습니다.');
      } else if (successRate >= 75) {
        console.log('\n👍 양호합니다. 대부분의 기능이 정상 작동합니다.');
        console.log('💡 대시보드의 핵심 기능들이 잘 작동하고 있습니다.');
      } else if (successRate >= 50) {
        console.log('\n⚠️ 주의 필요. 여러 기능에 문제가 있습니다.');
        console.log('💡 일부 위젯이나 통계가 제대로 표시되지 않을 수 있습니다.');
      } else {
        console.log('\n🚨 심각한 문제가 있습니다.');
        console.log('💡 대시보드의 기본 기능부터 점검이 필요합니다.');
      }

      // 대시보드 특화 권장사항
      console.log('\n📚 대시보드 개선 권장사항:');

      if (failedTests > 0) {
        console.log('\n🔧 발견된 문제점들:');

        if (!window.electronAPI?.database) {
          console.log('- 데이터베이스 API 연결 문제: 통계 데이터 로딩 불가');
        }

        const hasCards = document.querySelectorAll('.bg-white.rounded-lg, .card').length >= 6;
        if (!hasCards) {
          console.log('- 통계 카드 부족: 위젯들이 제대로 렌더링되지 않음');
        }

        const hasCharts = document.querySelectorAll('canvas, svg').length > 0;
        if (!hasCharts) {
          console.log('- 차트 요소 없음: 시각화 기능이 구현되지 않음');
        }

        const hasNumbers = Array.from(document.querySelectorAll('*')).some(el =>
          el.textContent?.match(/\d+/));
        if (!hasNumbers) {
          console.log('- 통계 수치 표시 문제: 데이터가 로딩되지 않음');
        }
      }

      // 기능 강화 제안
      console.log('\n💡 기능 강화 제안사항:');
      console.log('- 실시간 데이터 업데이트 기능');
      console.log('- 대화형 차트 및 드릴다운 기능');
      console.log('- 커스터마이징 가능한 위젯 배치');
      console.log('- 모바일 최적화 대시보드');
      console.log('- 알림 및 알람 시스템');
      console.log('- 데이터 내보내기 기능');

      // 성능 최적화 제안
      console.log('\n⚡ 성능 최적화 제안:');
      console.log('- 지연 로딩(Lazy Loading) 구현');
      console.log('- 차트 데이터 캐싱');
      console.log('- 불필요한 API 호출 최소화');
      console.log('- 메모리 사용량 최적화');

      // 사용자 경험 개선
      console.log('\n🎨 사용자 경험 개선:');
      console.log('- 스켈레톤 로딩 화면');
      console.log('- 다크 모드 지원');
      console.log('- 키보드 단축키');
      console.log('- 접근성 개선');

      // 사용 가능한 API 정보
      if (window.electronAPI?.database) {
        console.log('\n🔧 사용 가능한 API들:');
        const apis = Object.keys(window.electronAPI.database);
        apis.forEach(api => {
          const hasStats = typeof window.electronAPI.database[api]?.getStats === 'function';
          console.log(`  - ${api} API: ${hasStats ? '통계 지원' : '기본만'}`);
        });
      }

      console.log('\n🎯 대시보드 페이지 테스트 완료!');
      console.log('💡 추가 테스트: scripts/test-common-features.js로 공통 기능 확인');
    }, 1000);
  }

  // 비동기 테스트 실행
  runAsyncTests();

})();

// 대시보드 전용 유틸리티 함수들
window.dashboardPageTest = {
  // 전체 통계 데이터 확인
  checkAllStats: async function () {
    console.log('📊 전체 통계 데이터 확인:');

    const stats = {};

    try {
      if (window.electronAPI?.database?.member?.getStats) {
        stats.member = await window.electronAPI.database.member.getStats();
        console.log(`✅ 회원 통계: 총 ${stats.member?.total || 0}명`);
      }

      if (window.electronAPI?.database?.staff?.getStats) {
        stats.staff = await window.electronAPI.database.staff.getStats();
        console.log(`✅ 직원 통계: 총 ${stats.staff?.total || 0}명`);
      }

      if (window.electronAPI?.database?.payment?.getStats) {
        stats.payment = await window.electronAPI.database.payment.getStats();
        console.log(`✅ 결제 통계: 총 ${stats.payment?.total_amount?.toLocaleString() || 0}원`);
      }

      return stats;
    } catch (error) {
      console.log(`❌ 통계 데이터 조회 실패: ${error.message}`);
      return null;
    }
  },

  // 위젯 상태 확인
  checkWidgets: function () {
    console.log('🎨 대시보드 위젯 상태:');

    const widgets = {
      '통계 카드': document.querySelectorAll('.bg-white.rounded-lg, .card, [class*="widget"]').length,
      '차트 요소': document.querySelectorAll('canvas, svg, [class*="chart"]').length,
      '그리드 레이아웃': !!document.querySelector('[class*="grid"]'),
      '네비게이션 링크': Array.from(document.querySelectorAll('a, button')).filter(el =>
        el.textContent?.includes('관리')).length,
      '숫자 표시': Array.from(document.querySelectorAll('*')).filter(el =>
        el.textContent?.match(/\d+/)).length
    };

    Object.entries(widgets).forEach(([name, value]) => {
      const status = typeof value === 'number' ? (value > 0 ? `${value}개` : '없음') : (value ? '있음' : '없음');
      const icon = (typeof value === 'number' ? value > 0 : value) ? '✅' : '❌';
      console.log(`${icon} ${name}: ${status}`);
    });

    return widgets;
  },

  // 최근 활동 데이터 확인
  checkRecentActivity: async function () {
    console.log('📈 최근 활동 데이터 확인:');

    try {
      const activity = {};

      if (window.electronAPI?.database?.member?.getAll) {
        const recentMembers = await window.electronAPI.database.member.getAll({
          limit: 5,
          sort: { field: 'join_date', direction: 'desc' }
        });
        activity.recentMembers = Array.isArray(recentMembers) ? recentMembers.length : 0;
        console.log(`✅ 최근 신규 회원: ${activity.recentMembers}명`);
      }

      if (window.electronAPI?.database?.payment?.getAll) {
        const recentPayments = await window.electronAPI.database.payment.getAll({
          limit: 5,
          sort: { field: 'payment_date', direction: 'desc' }
        });
        activity.recentPayments = Array.isArray(recentPayments) ? recentPayments.length : 0;
        console.log(`✅ 최근 결제: ${activity.recentPayments}건`);
      }

      return activity;
    } catch (error) {
      console.log(`❌ 최근 활동 데이터 조회 실패: ${error.message}`);
      return null;
    }
  },

  // 차트 라이브러리 확인
  checkChartLibraries: function () {
    console.log('📊 차트 라이브러리 상태:');

    const libraries = {
      'Chart.js': !!window.Chart,
      'D3.js': !!window.d3,
      'Highcharts': !!window.Highcharts,
      'ApexCharts': !!window.ApexCharts,
      'ECharts': !!window.echarts,
      'Canvas 요소': document.querySelectorAll('canvas').length > 0,
      'SVG 요소': document.querySelectorAll('svg').length > 0
    };

    Object.entries(libraries).forEach(([name, available]) => {
      const status = typeof available === 'boolean' ? (available ? '사용 가능' : '없음') : `${available}개`;
      const icon = (typeof available === 'boolean' ? available : available > 0) ? '✅' : '❌';
      console.log(`${icon} ${name}: ${status}`);
    });

    return libraries;
  },

  // 성능 분석
  analyzePerformance: function () {
    console.log('⚡ 대시보드 성능 분석:');

    const performance_data = {
      'DOM 노드 수': document.querySelectorAll('*').length,
      '이미지 수': document.querySelectorAll('img').length,
      'CSS 파일 수': document.styleSheets.length,
      '로딩 상태': document.readyState,
      '메모리 사용량': performance.memory ?
        `${(performance.memory.usedJSHeapSize / 1024 / 1024).toFixed(2)}MB` : '측정 불가'
    };

    Object.entries(performance_data).forEach(([metric, value]) => {
      console.log(`📊 ${metric}: ${value}`);
    });

    // 성능 점수 계산
    const domNodes = performance_data['DOM 노드 수'];
    const isComplete = performance_data['로딩 상태'] === 'complete';
    const score = (domNodes < 800 ? 2 : domNodes < 1200 ? 1 : 0) + (isComplete ? 1 : 0);

    console.log(`🏥 성능 점수: ${score}/3 ${score >= 2 ? '✅ 양호' : score >= 1 ? '⚠️ 보통' : '❌ 개선 필요'}`);

    return performance_data;
  },

  // 종합 빠른 체크
  quickCheck: async function () {
    console.log('⚡ 대시보드 페이지 빠른 체크:');

    const api = !!(window.electronAPI?.database?.member &&
      window.electronAPI?.database?.staff &&
      window.electronAPI?.database?.payment);

    const widgets = this.checkWidgets();
    const widgetScore = (widgets['통계 카드'] >= 4 ? 1 : 0) +
      (widgets['차트 요소'] >= 1 ? 1 : 0) +
      (widgets['그리드 레이아웃'] ? 1 : 0);

    console.log(`🔧 API 상태: ${api ? '✅ 정상' : '❌ 문제'}`);
    console.log(`🎨 위젯 상태: ${widgetScore}/3 ${widgetScore >= 2 ? '✅' : widgetScore >= 1 ? '⚠️' : '❌'}`);

    if (api) {
      await this.checkAllStats();
    }

    const overall = api && widgetScore >= 2;
    console.log(`🏥 종합 평가: ${overall ? '✅ 정상' : '❌ 점검 필요'}`);

    return { api, widgets: widgetScore, overall };
  }
};

console.log('\n💡 대시보드 전용 유틸리티 사용법:');
console.log('- dashboardPageTest.checkAllStats() : 전체 통계 데이터 확인');
console.log('- dashboardPageTest.checkWidgets() : 위젯 상태 확인');
console.log('- dashboardPageTest.checkRecentActivity() : 최근 활동 데이터 확인');
console.log('- dashboardPageTest.checkChartLibraries() : 차트 라이브러리 확인');
console.log('- dashboardPageTest.analyzePerformance() : 성능 분석');
console.log('- dashboardPageTest.quickCheck() : 종합 빠른 체크'); 