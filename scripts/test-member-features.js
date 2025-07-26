/**
 * 회원관리 페이지 빠른 기능 테스트 스크립트
 * 
 * 이 스크립트를 회원관리 페이지에서 개발자 도구 콘솔에 붙여넣기 하여 실행하면
 * 주요 기능들의 상태를 빠르게 확인할 수 있습니다.
 * 
 * 사용 방법:
 * 1. 회원관리 페이지 열기
 * 2. F12 키로 개발자 도구 열기
 * 3. Console 탭 선택
 * 4. 이 스크립트 전체를 복사하여 붙여넣기
 * 5. Enter 키 실행
 */

(function () {
  console.clear();
  console.log('🚀 회원관리 페이지 빠른 기능 테스트 시작');
  console.log('=' * 50);

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

  runTest('member API 존재 확인', () => {
    return typeof window.electronAPI?.database?.member === 'object';
  });

  // 주요 API 메서드 확인
  const requiredMethods = ['getAll', 'getStats', 'create', 'update', 'delete', 'getDetail'];
  requiredMethods.forEach(method => {
    runTest(`member.${method} 메서드 존재`, () => {
      return typeof window.electronAPI?.database?.member?.[method] === 'function';
    });
  });

  console.log('\n🎨 2. UI 컴포넌트 테스트');
  console.log('-'.repeat(30));

  // DOM 요소 존재 확인
  runTest('검색 입력 필드 존재', () => {
    return document.querySelector('input[placeholder*="검색"]') !== null;
  });

  runTest('신규등록 버튼 존재', () => {
    const buttons = Array.from(document.querySelectorAll('button'));
    return buttons.some(btn => btn.textContent.includes('신규등록') || btn.textContent.includes('신규'));
  });

  runTest('필터 버튼 존재', () => {
    const buttons = Array.from(document.querySelectorAll('button'));
    return buttons.some(btn => btn.textContent.includes('필터'));
  });

  runTest('새로고침 버튼 존재', () => {
    const buttons = Array.from(document.querySelectorAll('button'));
    return buttons.some(btn => btn.textContent.includes('새로고침'));
  });

  runTest('회원 테이블 존재', () => {
    return document.querySelector('table') !== null ||
      document.querySelector('[role="table"]') !== null;
  });

  runTest('페이지네이션 존재', () => {
    const buttons = Array.from(document.querySelectorAll('button'));
    return buttons.some(btn => btn.textContent.includes('이전') || btn.textContent.includes('다음'));
  });

  // 통계 카드 확인
  runTest('통계 카드 존재', () => {
    const cards = document.querySelectorAll('.bg-white.rounded-lg, .card, [class*="stat"]');
    return cards.length >= 3; // 최소 3개 이상의 카드
  });

  console.log('\n📊 3. 데이터 로딩 테스트');
  console.log('-'.repeat(30));

  // 비동기 테스트들을 순차적으로 실행
  async function runAsyncTests() {
    if (window.electronAPI?.database?.member) {
      await runAsyncTest('회원 목록 로딩 테스트', async () => {
        const result = await window.electronAPI.database.member.getAll({});
        return result !== null && result !== undefined;
      });

      await runAsyncTest('회원 통계 로딩 테스트', async () => {
        const stats = await window.electronAPI.database.member.getStats();
        return stats && typeof stats.total === 'number';
      });

      await runAsyncTest('빈 필터 검색 테스트', async () => {
        const result = await window.electronAPI.database.member.getAll({});
        return result !== null;
      });

      await runAsyncTest('이름 검색 테스트', async () => {
        const result = await window.electronAPI.database.member.getAll({ search: 'test' });
        return result !== null;
      });

      await runAsyncTest('성별 필터 테스트', async () => {
        const result = await window.electronAPI.database.member.getAll({ gender: '남성' });
        return result !== null;
      });

      await runAsyncTest('정렬 기능 테스트', async () => {
        const result = await window.electronAPI.database.member.getAll({
          sort: { field: 'name', direction: 'asc' }
        });
        return result !== null;
      });
    } else {
      console.log('⚠️ API가 사용 불가능하여 데이터 로딩 테스트를 건너뜁니다.');
    }

    // 테스트 결과 요약
    setTimeout(() => {
      console.log('\n' + '='.repeat(50));
      console.log('📊 테스트 결과 요약');
      console.log('='.repeat(50));
      console.log(`총 테스트: ${totalTests}개`);
      console.log(`성공: ${passedTests}개`);
      console.log(`실패: ${failedTests}개`);

      const successRate = totalTests > 0 ? ((passedTests / totalTests) * 100).toFixed(1) : 0;
      console.log(`성공률: ${successRate}%`);

      if (successRate >= 90) {
        console.log('\n🎉 훌륭합니다! 대부분의 기능이 정상 작동합니다.');
        console.log('💡 상세한 테스트가 필요하면 memberPageTester.runAllTests()를 실행하세요.');
      } else if (successRate >= 70) {
        console.log('\n👍 양호합니다. 일부 개선이 필요할 수 있습니다.');
        console.log('💡 문제가 있는 영역을 확인하고 수동 테스트를 진행하세요.');
      } else if (successRate >= 50) {
        console.log('\n⚠️ 주의 필요. 여러 기능에 문제가 있을 수 있습니다.');
        console.log('💡 체크리스트를 참고하여 수동 검증을 진행하세요.');
      } else {
        console.log('\n🚨 심각한 문제가 있습니다. 기능 점검이 필요합니다.');
        console.log('💡 API 연결 및 기본 컴포넌트 로딩을 확인하세요.');
      }

      // 추가 테스트 방법 안내
      console.log('\n📚 추가 테스트 방법:');
      console.log('1. 전체 테스트: memberPageTester.runAllTests()');
      console.log('2. 빠른 상태 체크: memberPageTester.quickHealthCheck()');
      console.log('3. 특정 기능 테스트: memberPageTester.testSpecificFeature("api")');
      console.log('4. 체크리스트: docs/회원관리-기능-체크리스트.md 참고');
      console.log('5. 기능 매트릭스: docs/회원관리-기능-매트릭스.md 참고');

      // 실패한 테스트가 있으면 문제 해결 팁 제공
      if (failedTests > 0) {
        console.log('\n🔧 문제 해결 팁:');

        if (!window.electronAPI) {
          console.log('- electronAPI가 없음: preload 스크립트 로딩 확인');
        }

        if (!document.querySelector('input[placeholder*="검색"]')) {
          console.log('- 검색 필드가 없음: 컴포넌트 렌더링 확인');
        }

        if (!document.querySelector('table')) {
          console.log('- 테이블이 없음: 데이터 로딩 및 컴포넌트 확인');
        }

        console.log('- 개발자 도구 Network 탭에서 API 호출 상태 확인');
        console.log('- 콘솔에서 에러 메시지 확인');
        console.log('- 페이지 새로고침 후 다시 시도');
      }

      console.log('\n🎯 테스트 완료! 문제가 있다면 수동 검증을 진행하세요.');
    }, 1000); // 비동기 테스트 완료를 위한 지연
  }

  // 비동기 테스트 실행
  runAsyncTests();

})();

// 추가 유틸리티 함수들
window.memberQuickTest = {
  // DOM 요소 확인
  checkDOM: function () {
    console.log('🔍 DOM 요소 상태 확인:');
    const elements = {
      '검색 입력': document.querySelector('input[placeholder*="검색"]'),
      '신규등록 버튼': Array.from(document.querySelectorAll('button')).find(btn => btn.textContent.includes('신규')),
      '필터 버튼': Array.from(document.querySelectorAll('button')).find(btn => btn.textContent.includes('필터')),
      '테이블': document.querySelector('table'),
      '통계 카드': document.querySelectorAll('.bg-white.rounded-lg').length
    };

    Object.entries(elements).forEach(([name, element]) => {
      if (element) {
        console.log(`✅ ${name}: 존재`);
      } else {
        console.log(`❌ ${name}: 없음`);
      }
    });
  },

  // API 상태 확인
  checkAPI: function () {
    console.log('🔍 API 상태 확인:');
    const apis = {
      'electronAPI': window.electronAPI,
      'database': window.electronAPI?.database,
      'member': window.electronAPI?.database?.member,
      'getAll': window.electronAPI?.database?.member?.getAll,
      'getStats': window.electronAPI?.database?.member?.getStats
    };

    Object.entries(apis).forEach(([name, api]) => {
      if (api) {
        console.log(`✅ ${name}: 사용 가능`);
      } else {
        console.log(`❌ ${name}: 사용 불가능`);
      }
    });
  },

  // 간단한 기능 테스트
  testBasicFeatures: async function () {
    console.log('🧪 기본 기능 테스트:');

    try {
      if (window.electronAPI?.database?.member?.getAll) {
        const members = await window.electronAPI.database.member.getAll({});
        console.log(`✅ 회원 목록 로딩: ${Array.isArray(members) ? members.length : '성공'}명`);
      } else {
        console.log('❌ 회원 목록 로딩: API 없음');
      }
    } catch (error) {
      console.log(`❌ 회원 목록 로딩: ${error.message}`);
    }

    try {
      if (window.electronAPI?.database?.member?.getStats) {
        const stats = await window.electronAPI.database.member.getStats();
        console.log(`✅ 회원 통계 로딩: 총 ${stats?.total || 0}명`);
      } else {
        console.log('❌ 회원 통계 로딩: API 없음');
      }
    } catch (error) {
      console.log(`❌ 회원 통계 로딩: ${error.message}`);
    }
  },

  // 전체 빠른 체크
  quickCheck: function () {
    this.checkAPI();
    this.checkDOM();
    this.testBasicFeatures();
  }
};

console.log('\n💡 추가 유틸리티 사용법:');
console.log('- memberQuickTest.checkDOM() : DOM 요소 확인');
console.log('- memberQuickTest.checkAPI() : API 상태 확인');
console.log('- memberQuickTest.testBasicFeatures() : 기본 기능 테스트');
console.log('- memberQuickTest.quickCheck() : 전체 빠른 체크'); 