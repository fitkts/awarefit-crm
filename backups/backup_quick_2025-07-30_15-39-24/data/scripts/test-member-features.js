/**
 * 회원관리 페이지 전용 기능 테스트 스크립트
 * 
 * 회원관리 페이지에서 사용할 수 있는 특화된 테스트 스크립트입니다.
 * 회원 관련 모든 기능을 체계적으로 검증합니다.
 * 
 * 사용 방법:
 * 1. 회원관리 페이지 열기
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
  console.log('👥 회원관리 페이지 기능 테스트 시작');
  console.log('='.repeat(50));

  // TestFramework 인스턴스 생성
  const tester = new TestFramework('회원관리 페이지');

  // 환경 정보 확인
  const env = tester.checkEnvironment();

  // 1. API 연결 테스트
  tester.startGroup('🔧 1. API 연결 테스트');

  // API 존재 확인
  tester.runTest('electronAPI 존재 확인', () => {
    return env.hasElectronAPI;
  });

  tester.runTest('database API 존재 확인', () => {
    return typeof window.electronAPI?.database === 'object';
  });

  tester.runTest('member API 존재 확인', () => {
    return typeof window.electronAPI?.database?.member === 'object';
  });

  // Member API 메서드 확인
  const requiredMethods = ['getAll', 'getStats', 'create', 'update', 'delete', 'search'];
  requiredMethods.forEach(method => {
    tester.runTest(`member.${method} 메서드 존재`, () => {
      return typeof window.electronAPI?.database?.member?.[method] === 'function';
    });
  });

  // 2. 회원관리 UI 컴포넌트 테스트
  tester.startGroup('🎨 2. 회원관리 UI 컴포넌트 테스트');

  // 기본 레이아웃
  tester.runTest('회원관리 메인 컨테이너', () => {
    return !!(document.querySelector('.members') ||
      document.querySelector('[class*="member"]') ||
      document.querySelector('main') ||
      document.querySelector('[role="main"]'));
  });

  tester.runTest('회원 테이블 존재', () => {
    return !!document.querySelector('table');
  });

  tester.runTest('검색 기능', () => {
    return !!document.querySelector('input[placeholder*="검색"]');
  });

  tester.runTest('필터 기능', () => {
    const hasFilterButtons = document.querySelectorAll('button').length >= 5;
    const hasFilterSelects = document.querySelectorAll('select').length >= 1;
    return hasFilterButtons || hasFilterSelects;
  });

  // 통계 카드들
  tester.runTest('통계 카드들', () => {
    const cards = document.querySelectorAll('.bg-white.rounded-lg, .card, [class*="stat"]');
    return cards.length >= 4; // 최소 4개 통계 카드
  });

  // 회원 관련 버튼들
  tester.runTest('회원 관리 버튼들', () => {
    const buttons = Array.from(document.querySelectorAll('button')).some(btn => {
      const text = btn.textContent?.toLowerCase() || '';
      return text.includes('추가') || text.includes('등록') || text.includes('신규');
    });
    return buttons;
  });

  // 페이지네이션
  tester.runTest('페이지네이션', () => {
    return !!(document.querySelector('.pagination') ||
      document.querySelector('[class*="page"]') ||
      document.querySelector('button[disabled]')); // 이전/다음 버튼
  });

  // 3. 회원 데이터 표시 테스트
  tester.startGroup('📊 3. 회원 데이터 표시 테스트');

  tester.runTest('테이블 헤더', () => {
    const table = document.querySelector('table');
    if (!table) return false;
    
    const headers = table.querySelectorAll('th');
    return headers.length >= 5; // 최소 5개 컬럼
  });

  tester.runTest('회원 정보 표시', () => {
    const hasNameFields = Array.from(document.querySelectorAll('*')).some(el => {
      const text = el.textContent || '';
      return text.includes('이름') || text.includes('성명');
    });
    
    const hasContactFields = Array.from(document.querySelectorAll('*')).some(el => {
      const text = el.textContent || '';
      return text.includes('전화') || text.includes('휴대폰') || text.includes('이메일');
    });
    
    return hasNameFields && hasContactFields;
  });

  tester.runTest('가입일 표시', () => {
    return Array.from(document.querySelectorAll('*')).some(el => {
      const text = el.textContent || '';
      return text.includes('가입일') || text.includes('등록일') || text.match(/\d{4}-\d{2}-\d{2}/);
    });
  });

  tester.runTest('회원 상태 표시', () => {
    return Array.from(document.querySelectorAll('*')).some(el => {
      const text = el.textContent?.toLowerCase() || '';
      return text.includes('활성') || text.includes('비활성') || text.includes('상태');
    });
  });

  // 4. 회원 관리 기능 테스트
  tester.startGroup('⚙️ 4. 회원 관리 기능 테스트');

  tester.runTest('검색 입력 필드', () => {
    const searchInput = document.querySelector('input[type="search"], input[placeholder*="검색"]');
    return !!searchInput;
  });

  tester.runTest('정렬 기능', () => {
    const sortableHeaders = Array.from(document.querySelectorAll('th')).some(th => {
      const hasClickHandler = th.onclick || th.addEventListener;
      const hasSortClass = th.className.includes('sort') || th.className.includes('order');
      return hasClickHandler || hasSortClass;
    });
    return sortableHeaders;
  });

  tester.runTest('필터 버튼들', () => {
    const filterButtons = Array.from(document.querySelectorAll('button')).filter(btn => {
      const text = btn.textContent?.toLowerCase() || '';
      return text.includes('전체') || text.includes('활성') || text.includes('오늘') || 
             text.includes('이번달') || text.includes('필터');
    });
    return filterButtons.length >= 3;
  });

  tester.runTest('액션 버튼들', () => {
    const actionButtons = Array.from(document.querySelectorAll('button')).filter(btn => {
      const text = btn.textContent?.toLowerCase() || '';
      return text.includes('보기') || text.includes('수정') || text.includes('삭제') ||
             text.includes('편집') || text.includes('상세');
    });
    return actionButtons.length >= 1;
  });

  // 5. 모달 및 폼 테스트
  tester.startGroup('📝 5. 모달 및 폼 테스트');

  tester.runTest('모달 관련 요소', () => {
    return !!(document.querySelector('.modal') ||
      document.querySelector('[class*="modal"]') ||
      document.querySelector('.fixed.inset-0') ||
      document.querySelector('[role="dialog"]'));
  });

  tester.runTest('폼 입력 필드들', () => {
    const inputs = document.querySelectorAll('input, select, textarea');
    return inputs.length >= 3; // 최소 3개 입력 필드
  });

  tester.runTest('필수 입력 필드 표시', () => {
    const requiredFields = document.querySelectorAll('input[required], [aria-required="true"]');
    const asterisks = Array.from(document.querySelectorAll('*')).some(el => 
      el.textContent?.includes('*'));
    return requiredFields.length > 0 || asterisks;
  });

  tester.runTest('제출/저장 버튼', () => {
    return Array.from(document.querySelectorAll('button')).some(btn => {
      const text = btn.textContent?.toLowerCase() || '';
      return text.includes('저장') || text.includes('등록') || text.includes('수정') ||
             text.includes('추가') || text.includes('확인');
    });
  });

  // 비동기 테스트들
  async function runAsyncTests() {
    // 6. 데이터 로딩 테스트
    tester.startGroup('📡 6. 데이터 로딩 테스트');

    if (window.electronAPI?.database?.member) {
      await tester.runAsyncTest('회원 목록 로딩', async () => {
        const members = await window.electronAPI.database.member.getAll({});
        return members !== null && members !== undefined;
      });

      await tester.runAsyncTest('회원 통계 로딩', async () => {
        const stats = await window.electronAPI.database.member.getStats();
        return stats && typeof stats.total === 'number';
      });

      await tester.runAsyncTest('회원 검색 기능', async () => {
        const searchResults = await window.electronAPI.database.member.getAll({
          search: { name: '테스트' }
        });
        return searchResults !== null;
      });

      await tester.runAsyncTest('페이지네이션 기능', async () => {
        const pagedResults = await window.electronAPI.database.member.getAll({
          page: 1,
          limit: 10
        });
        return pagedResults !== null;
      });

      await tester.runAsyncTest('정렬 기능', async () => {
        const sortedResults = await window.electronAPI.database.member.getAll({
          sort: { field: 'name', direction: 'asc' }
        });
        return sortedResults !== null;
      });
    } else {
      console.log('⚠️ member API가 없어 데이터 로딩 테스트를 건너뜁니다.');
    }

    // 테스트 결과 요약
    setTimeout(() => {
      const summary = tester.printSummary({
        showDetails: true,
        showTiming: true,
        showRecommendations: true
      });

      // 회원관리 특화 권장사항
      console.log('\n📚 회원관리 개선 권장사항:');

      if (summary.failedTests > 0) {
        console.log('\n🔧 발견된 문제점들:');

        if (!window.electronAPI?.database?.member) {
          console.log('- member API 연결 문제: 회원 데이터 로딩 불가');
        }

        const hasTable = !!document.querySelector('table');
        if (!hasTable) {
          console.log('- 회원 테이블 없음: 데이터 표시 인터페이스 누락');
        }

        const hasSearch = !!document.querySelector('input[placeholder*="검색"]');
        if (!hasSearch) {
          console.log('- 검색 기능 없음: 사용자 편의성 부족');
        }

        const hasStats = document.querySelectorAll('.bg-white.rounded-lg, .card').length >= 4;
        if (!hasStats) {
          console.log('- 통계 카드 부족: 대시보드 정보 표시 개선 필요');
        }
      }

      // 기능 강화 제안
      console.log('\n💡 기능 강화 제안사항:');
      console.log('- 회원 일괄 가져오기/내보내기 기능');
      console.log('- 회원 등급 관리 시스템');
      console.log('- 회원 활동 이력 추적');
      console.log('- 고급 필터링 및 그룹화');
      console.log('- 회원 커뮤니케이션 도구');
      console.log('- 회원권 만료 알림 시스템');

      // 사용 가능한 API 정보
      if (window.electronAPI?.database?.member) {
        console.log('\n🔧 사용 가능한 member API 메서드들:');
        const memberAPI = window.electronAPI.database.member;
        Object.keys(memberAPI).forEach(method => {
          console.log(`  - ${method}()`);
        });
      }

      console.log('\n🎯 회원관리 페이지 테스트 완료!');
      console.log('💡 추가 테스트: scripts/test-common-features.js로 공통 기능 확인');
    }, 1000);
  }

  // 비동기 테스트 실행
  runAsyncTests();

})();

// 회원관리 전용 유틸리티 함수들
window.memberPageTest = {
  // 회원 데이터 확인
  checkMemberData: async function () {
    console.log('👥 회원 데이터 확인:');

    try {
      if (window.electronAPI?.database?.member) {
        const stats = await window.electronAPI.database.member.getStats();
        console.log(`✅ 총 회원수: ${stats?.total || 0}명`);
        console.log(`✅ 활성 회원: ${stats?.active || 0}명`);
        console.log(`✅ 신규 회원: ${stats?.new_this_month || 0}명`);

        const recent = await window.electronAPI.database.member.getAll({
          limit: 5,
          sort: { field: 'join_date', direction: 'desc' }
        });
        console.log(`✅ 최근 가입: ${Array.isArray(recent) ? recent.length : 0}명`);

        return { stats, recent };
      } else {
        console.log('❌ member API를 사용할 수 없습니다.');
        return null;
      }
    } catch (error) {
      console.log(`❌ 회원 데이터 조회 실패: ${error.message}`);
      return null;
    }
  },

  // UI 요소 상태 확인
  checkUIElements: function () {
    console.log('🎨 회원관리 UI 요소 상태:');

    const elements = {
      '테이블': !!document.querySelector('table'),
      '검색 필드': !!document.querySelector('input[placeholder*="검색"]'),
      '필터 버튼': document.querySelectorAll('button').length >= 5,
      '통계 카드': document.querySelectorAll('.bg-white.rounded-lg, .card').length >= 4,
      '페이지네이션': !!(document.querySelector('.pagination') || 
                      document.querySelector('[class*="page"]')),
      '액션 버튼': Array.from(document.querySelectorAll('button')).some(btn =>
        btn.textContent?.includes('추가') || btn.textContent?.includes('등록'))
    };

    Object.entries(elements).forEach(([name, exists]) => {
      const icon = exists ? '✅' : '❌';
      console.log(`${icon} ${name}: ${exists ? '있음' : '없음'}`);
    });

    return elements;
  },

  // 검색 및 필터 테스트
  testSearchAndFilter: async function () {
    console.log('🔍 검색 및 필터 기능 테스트:');

    try {
      if (window.electronAPI?.database?.member) {
        // 검색 테스트
        const searchResult = await window.electronAPI.database.member.getAll({
          search: { name: 'test' }
        });
        console.log(`✅ 이름 검색: ${Array.isArray(searchResult) ? '작동' : '오류'}`);

        // 필터 테스트
        const filterResult = await window.electronAPI.database.member.getAll({
          filter: { status: 'active' }
        });
        console.log(`✅ 상태 필터: ${Array.isArray(filterResult) ? '작동' : '오류'}`);

        // 정렬 테스트
        const sortResult = await window.electronAPI.database.member.getAll({
          sort: { field: 'name', direction: 'asc' }
        });
        console.log(`✅ 정렬 기능: ${Array.isArray(sortResult) ? '작동' : '오류'}`);

        return { searchResult, filterResult, sortResult };
      } else {
        console.log('❌ member API를 사용할 수 없습니다.');
        return null;
      }
    } catch (error) {
      console.log(`❌ 검색/필터 테스트 실패: ${error.message}`);
      return null;
    }
  },

  // 종합 빠른 체크
  quickCheck: async function () {
    console.log('⚡ 회원관리 페이지 빠른 체크:');

    const api = !!window.electronAPI?.database?.member;
    const ui = this.checkUIElements();
    const uiScore = Object.values(ui).filter(Boolean).length;

    console.log(`🔧 API 상태: ${api ? '✅ 정상' : '❌ 문제'}`);
    console.log(`🎨 UI 상태: ${uiScore}/6 ${uiScore >= 4 ? '✅' : uiScore >= 2 ? '⚠️' : '❌'}`);

    if (api) {
      await this.checkMemberData();
    }

    const overall = api && uiScore >= 4;
    console.log(`🏥 종합 평가: ${overall ? '✅ 정상' : '❌ 점검 필요'}`);

    return { api, ui: uiScore, overall };
  }
};

console.log('\n💡 회원관리 전용 유틸리티 사용법:');
console.log('- memberPageTest.checkMemberData() : 회원 데이터 확인');
console.log('- memberPageTest.checkUIElements() : UI 요소 상태 확인');
console.log('- memberPageTest.testSearchAndFilter() : 검색/필터 기능 테스트');
console.log('- memberPageTest.quickCheck() : 종합 빠른 체크'); 