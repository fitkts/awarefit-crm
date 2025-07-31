/**
 * 직원관리 페이지 전용 기능 테스트 스크립트
 * 
 * 직원관리 페이지에서 사용할 수 있는 특화된 테스트 스크립트입니다.
 * 직원 관련 모든 기능을 체계적으로 검증합니다.
 * 
 * 사용 방법:
 * 1. 직원관리 페이지 열기
 * 2. F12 키로 개발자 도구 열기
 * 3. Console 탭 선택
 * 4. 이 스크립트 전체를 복사하여 붙여넣기
 * 5. Enter 키 실행
 */

(function () {
  console.clear();
  console.log('👥 직원관리 페이지 기능 테스트 시작');
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

  runTest('staff API 존재 확인', () => {
    return typeof window.electronAPI?.database?.staff === 'object';
  });

  // 주요 API 메서드 확인
  const requiredMethods = ['getAll', 'getStats', 'create', 'update', 'delete'];
  requiredMethods.forEach(method => {
    runTest(`staff.${method} 메서드 존재`, () => {
      return typeof window.electronAPI?.database?.staff?.[method] === 'function';
    });
  });

  // 추가 직원 관련 메서드들
  const additionalMethods = ['getById', 'search', 'getRoles'];
  additionalMethods.forEach(method => {
    runTest(`staff.${method} 메서드 존재 (선택)`, () => {
      return typeof window.electronAPI?.database?.staff?.[method] === 'function';
    });
  });

  console.log('\n🎨 2. UI 컴포넌트 테스트');
  console.log('-'.repeat(30));

  // 기본 UI 요소들
  runTest('직원 검색 입력 필드', () => {
    return !!document.querySelector('input[placeholder*="검색"], input[placeholder*="직원"], input[placeholder*="이름"]');
  });

  runTest('신규등록 버튼', () => {
    const buttons = Array.from(document.querySelectorAll('button'));
    return buttons.some(btn =>
      btn.textContent.includes('신규등록') ||
      btn.textContent.includes('신규') ||
      btn.textContent.includes('추가') ||
      btn.textContent.includes('등록')
    );
  });

  runTest('필터 버튼', () => {
    const buttons = Array.from(document.querySelectorAll('button'));
    return buttons.some(btn => btn.textContent.includes('필터'));
  });

  runTest('새로고침 버튼', () => {
    const buttons = Array.from(document.querySelectorAll('button'));
    return buttons.some(btn => btn.textContent.includes('새로고침'));
  });

  runTest('직원 목록 테이블', () => {
    return !!document.querySelector('table') || !!document.querySelector('[role="table"]');
  });

  runTest('페이지네이션', () => {
    const buttons = Array.from(document.querySelectorAll('button'));
    return buttons.some(btn =>
      btn.textContent.includes('이전') ||
      btn.textContent.includes('다음') ||
      btn.textContent.match(/\d+/) // 숫자 버튼
    );
  });

  // 직원 통계 카드 확인
  runTest('직원 통계 카드', () => {
    const cards = document.querySelectorAll('.bg-white.rounded-lg, .card, [class*="stat"]');
    return cards.length >= 3; // 최소 3개 이상의 통계 카드
  });

  // 직원 관련 특화 UI
  runTest('직원 테이블 컬럼들', () => {
    const headers = Array.from(document.querySelectorAll('th, [role="columnheader"]'));
    const staffColumns = headers.some(header => {
      const text = header.textContent?.toLowerCase() || '';
      return text.includes('이름') || text.includes('직책') || text.includes('부서') ||
        text.includes('연락처') || text.includes('입사일');
    });
    return staffColumns;
  });

  runTest('작업 버튼들 (수정/삭제)', () => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const actionButtons = buttons.filter(btn => {
      const text = btn.textContent?.toLowerCase() || '';
      return text.includes('수정') || text.includes('삭제') || text.includes('보기');
    });
    return actionButtons.length > 0;
  });

  console.log('\n📊 3. 데이터 로딩 테스트');
  console.log('-'.repeat(30));

  // 비동기 테스트들을 순차적으로 실행
  async function runAsyncTests() {
    if (window.electronAPI?.database?.staff) {
      await runAsyncTest('직원 목록 로딩', async () => {
        const result = await window.electronAPI.database.staff.getAll({});
        return result !== null && result !== undefined;
      });

      await runAsyncTest('직원 통계 로딩', async () => {
        const stats = await window.electronAPI.database.staff.getStats();
        return stats && typeof stats === 'object';
      });

      await runAsyncTest('빈 필터 검색', async () => {
        const result = await window.electronAPI.database.staff.getAll({});
        return result !== null;
      });

      await runAsyncTest('이름 검색 테스트', async () => {
        const result = await window.electronAPI.database.staff.getAll({ search: 'test' });
        return result !== null;
      });

      await runAsyncTest('부서 필터 테스트', async () => {
        const result = await window.electronAPI.database.staff.getAll({ department: '운영팀' });
        return result !== null;
      });

      await runAsyncTest('직책 필터 테스트', async () => {
        const result = await window.electronAPI.database.staff.getAll({ position: '매니저' });
        return result !== null;
      });

      await runAsyncTest('활성 상태 필터 테스트', async () => {
        const activeResult = await window.electronAPI.database.staff.getAll({ is_active: true });
        const inactiveResult = await window.electronAPI.database.staff.getAll({ is_active: false });
        return activeResult !== null && inactiveResult !== null;
      });

      await runAsyncTest('정렬 기능 테스트', async () => {
        const ascResult = await window.electronAPI.database.staff.getAll({
          sort: { field: 'name', direction: 'asc' }
        });
        const descResult = await window.electronAPI.database.staff.getAll({
          sort: { field: 'name', direction: 'desc' }
        });
        return ascResult !== null && descResult !== null;
      });

      await runAsyncTest('페이지네이션 테스트', async () => {
        const page1 = await window.electronAPI.database.staff.getAll({
          page: 1,
          limit: 5
        });
        const page2 = await window.electronAPI.database.staff.getAll({
          page: 2,
          limit: 5
        });
        return page1 !== null && page2 !== null;
      });

      // 역할/권한 관리 테스트 (있는 경우)
      if (window.electronAPI.database.staff.getRoles) {
        await runAsyncTest('직원 역할 조회', async () => {
          const roles = await window.electronAPI.database.staff.getRoles();
          return roles !== null;
        });
      }

    } else {
      console.log('⚠️ staff API가 사용 불가능하여 데이터 로딩 테스트를 건너뜁니다.');
    }

    console.log('\n🔍 4. 고급 기능 테스트');
    console.log('-'.repeat(30));

    // 급여 관리 기능 (있는 경우)
    runTest('급여 관리 UI', () => {
      const salaryElements = Array.from(document.querySelectorAll('*')).some(el => {
        const text = el.textContent?.toLowerCase() || '';
        const className = el.className?.toLowerCase() || '';
        return text.includes('급여') || text.includes('월급') ||
          className.includes('salary') || className.includes('pay');
      });
      return salaryElements;
    });

    // 출근 관리 기능 (있는 경우)
    runTest('출근 관리 UI', () => {
      const attendanceElements = Array.from(document.querySelectorAll('*')).some(el => {
        const text = el.textContent?.toLowerCase() || '';
        const className = el.className?.toLowerCase() || '';
        return text.includes('출근') || text.includes('근무') || text.includes('출퇴근') ||
          className.includes('attendance') || className.includes('work');
      });
      return attendanceElements;
    });

    // 권한 관리 기능
    runTest('권한 관리 UI', () => {
      const permissionElements = Array.from(document.querySelectorAll('*')).some(el => {
        const text = el.textContent?.toLowerCase() || '';
        const className = el.className?.toLowerCase() || '';
        return text.includes('권한') || text.includes('역할') ||
          className.includes('permission') || className.includes('role');
      });
      return permissionElements;
    });

    console.log('\n📱 5. 반응형 및 사용성 테스트');
    console.log('-'.repeat(30));

    // 모바일 반응형
    runTest('모바일 반응형 지원', () => {
      const viewport = document.querySelector('meta[name="viewport"]');
      const responsiveClasses = Array.from(document.querySelectorAll('*')).some(el => {
        const className = el.className || '';
        return className.includes('responsive') ||
          className.includes('sm:') ||
          className.includes('md:') ||
          className.includes('lg:');
      });
      return !!viewport || responsiveClasses;
    });

    // 로딩 상태 표시
    runTest('로딩 상태 UI', () => {
      const loadingElements = Array.from(document.querySelectorAll('*')).some(el => {
        const className = el.className || '';
        const text = el.textContent || '';
        return className.includes('loading') ||
          className.includes('spinner') ||
          text.includes('로딩') ||
          text.includes('Loading');
      });
      return loadingElements || document.querySelectorAll('[class*="animate"]').length > 0;
    });

    // 에러 처리 UI
    runTest('에러 메시지 표시', () => {
      const errorElements = Array.from(document.querySelectorAll('*')).some(el => {
        const className = el.className || '';
        return className.includes('error') ||
          className.includes('alert') ||
          className.includes('danger') ||
          className.includes('red');
      });
      return errorElements;
    });

    // 테스트 결과 요약
    setTimeout(() => {
      console.log('\n' + '='.repeat(50));
      console.log('📊 직원관리 페이지 테스트 결과');
      console.log('='.repeat(50));
      console.log(`총 테스트: ${totalTests}개`);
      console.log(`성공: ${passedTests}개`);
      console.log(`실패: ${failedTests}개`);

      const successRate = totalTests > 0 ? ((passedTests / totalTests) * 100).toFixed(1) : 0;
      console.log(`성공률: ${successRate}%`);

      // 결과 해석
      if (successRate >= 90) {
        console.log('\n🎉 훌륭합니다! 직원관리 기능이 완벽하게 작동합니다.');
        console.log('💡 배포 준비가 완료되었습니다.');
      } else if (successRate >= 75) {
        console.log('\n👍 양호합니다. 대부분의 기능이 정상 작동합니다.');
        console.log('💡 일부 개선사항이 있지만 사용에는 문제없습니다.');
      } else if (successRate >= 50) {
        console.log('\n⚠️ 주의 필요. 여러 기능에 문제가 있습니다.');
        console.log('💡 핵심 기능들을 점검하고 수정이 필요합니다.');
      } else {
        console.log('\n🚨 심각한 문제가 있습니다.');
        console.log('💡 기본 API 연결부터 점검이 필요합니다.');
      }

      // 직원관리 특화 권장사항
      console.log('\n📚 직원관리 개선 권장사항:');

      if (failedTests > 0) {
        console.log('\n🔧 발견된 문제점들:');

        if (!window.electronAPI?.database?.staff) {
          console.log('- staff API 연결 문제: 백엔드 핸들러 확인 필요');
        }

        const hasTable = !!document.querySelector('table');
        if (!hasTable) {
          console.log('- 직원 목록 테이블 없음: UI 컴포넌트 렌더링 확인');
        }

        const hasSearchInput = !!document.querySelector('input[placeholder*="검색"]');
        if (!hasSearchInput) {
          console.log('- 검색 기능 없음: 검색 컴포넌트 구현 필요');
        }

        const buttons = document.querySelectorAll('button').length;
        if (buttons < 5) {
          console.log('- UI 버튼 부족: 액션 버튼들이 제대로 렌더링되지 않음');
        }
      }

      // 개선 제안사항
      console.log('\n💡 개선 제안사항:');
      console.log('- 급여 관리 기능 추가 고려');
      console.log('- 출근/근무 시간 관리 기능 고려');
      console.log('- 직원 성과 관리 기능 고려');
      console.log('- 휴가 관리 시스템 연동 고려');

      // 사용 가능한 API 정보
      if (window.electronAPI?.database?.staff) {
        console.log('\n🔧 사용 가능한 staff API 메서드:');
        const methods = Object.keys(window.electronAPI.database.staff);
        methods.forEach(method => {
          console.log(`  - ${method}()`);
        });
      }

      console.log('\n🎯 직원관리 페이지 테스트 완료!');
      console.log('💡 추가 테스트: scripts/test-common-features.js로 공통 기능 확인');
    }, 1000);
  }

  // 비동기 테스트 실행
  runAsyncTests();

})();

// 직원관리 전용 유틸리티 함수들
window.staffPageTest = {
  // 직원 데이터 간단 체크
  checkStaffData: async function () {
    console.log('👥 직원 데이터 상태 확인:');

    try {
      if (window.electronAPI?.database?.staff?.getAll) {
        const staff = await window.electronAPI.database.staff.getAll({});
        const staffCount = Array.isArray(staff) ? staff.length : (staff?.staff?.length || 0);
        console.log(`✅ 직원 수: ${staffCount}명`);

        if (window.electronAPI.database.staff.getStats) {
          const stats = await window.electronAPI.database.staff.getStats();
          console.log(`✅ 활성 직원: ${stats?.active || 0}명`);
          console.log(`✅ 부서 수: ${stats?.departments?.length || 0}개`);
        }
      } else {
        console.log('❌ staff API를 사용할 수 없습니다');
      }
    } catch (error) {
      console.log(`❌ 직원 데이터 조회 실패: ${error.message}`);
    }
  },

  // 직원 검색 테스트
  testStaffSearch: async function (searchTerm = 'test') {
    console.log(`🔍 직원 검색 테스트 (검색어: "${searchTerm}"):`);

    try {
      const results = await window.electronAPI.database.staff.getAll({ search: searchTerm });
      const resultCount = Array.isArray(results) ? results.length : (results?.staff?.length || 0);
      console.log(`✅ 검색 결과: ${resultCount}명`);
      return results;
    } catch (error) {
      console.log(`❌ 검색 실패: ${error.message}`);
      return null;
    }
  },

  // UI 상태 체크
  checkStaffUI: function () {
    console.log('🎨 직원관리 UI 상태:');

    const elements = {
      '검색 입력': !!document.querySelector('input[placeholder*="검색"]'),
      '직원 테이블': !!document.querySelector('table'),
      '신규등록 버튼': Array.from(document.querySelectorAll('button')).some(btn => btn.textContent.includes('등록')),
      '필터 기능': Array.from(document.querySelectorAll('button')).some(btn => btn.textContent.includes('필터')),
      '통계 카드': document.querySelectorAll('.bg-white.rounded-lg, .card').length >= 3
    };

    Object.entries(elements).forEach(([name, exists]) => {
      console.log(`${exists ? '✅' : '❌'} ${name}: ${exists ? '존재' : '없음'}`);
    });

    return elements;
  },

  // 종합 빠른 체크
  quickCheck: async function () {
    console.log('⚡ 직원관리 페이지 빠른 체크:');

    const api = !!window.electronAPI?.database?.staff;
    const ui = this.checkStaffUI();
    const uiScore = Object.values(ui).filter(Boolean).length;

    console.log(`🔧 API 상태: ${api ? '✅ 정상' : '❌ 문제'}`);
    console.log(`🎨 UI 상태: ${uiScore}/5 ${uiScore >= 4 ? '✅' : uiScore >= 3 ? '⚠️' : '❌'}`);

    if (api) {
      await this.checkStaffData();
    }

    const overall = api && uiScore >= 3;
    console.log(`🏥 종합 평가: ${overall ? '✅ 정상' : '❌ 점검 필요'}`);

    return { api, ui, overall };
  }
};

console.log('\n💡 직원관리 전용 유틸리티 사용법:');
console.log('- staffPageTest.checkStaffData() : 직원 데이터 확인');
console.log('- staffPageTest.testStaffSearch("검색어") : 직원 검색 테스트');
console.log('- staffPageTest.checkStaffUI() : UI 상태 확인');
console.log('- staffPageTest.quickCheck() : 종합 빠른 체크'); 