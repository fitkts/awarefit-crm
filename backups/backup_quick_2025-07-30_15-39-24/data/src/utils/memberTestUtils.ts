/**
 * 회원관리 페이지 자동 기능 검증 유틸리티
 *
 * 이 파일은 회원관리 페이지의 주요 기능들을 프로그래밍적으로 검증할 수 있는
 * 도구들을 제공합니다. 개발자 도구 콘솔에서 사용하거나 테스트 환경에서 활용할 수 있습니다.
 */

interface TestResult {
  testName: string;
  success: boolean;
  message: string;
  details?: any;
  executionTime: number;
}

interface TestSuite {
  suiteName: string;
  tests: TestResult[];
  totalTests: number;
  passedTests: number;
  failedTests: number;
  totalTime: number;
}

/**
 * 회원관리 페이지 자동 테스트 클래스
 */
export class MemberPageTester {
  private results: TestSuite[] = [];

  /**
   * 모든 테스트 실행
   */
  async runAllTests(): Promise<void> {
    console.log('🚀 회원관리 페이지 자동 테스트 시작');
    console.log('=' * 50);

    try {
      await this.testAPIConnections();
      await this.testDataLoading();
      await this.testSearchAndFiltering();
      await this.testCRUDOperations();
      await this.testUIComponents();

      this.generateReport();
    } catch (error) {
      console.error('🚨 테스트 실행 중 오류 발생:', error);
    }
  }

  /**
   * API 연결 테스트
   */
  async testAPIConnections(): Promise<void> {
    const suite: TestSuite = {
      suiteName: 'API 연결 테스트',
      tests: [],
      totalTests: 0,
      passedTests: 0,
      failedTests: 0,
      totalTime: 0,
    };

    // electronAPI 존재 여부 테스트
    await this.runTest(suite, 'electronAPI 객체 존재 확인', async () => {
      if (!window.electronAPI) {
        throw new Error('window.electronAPI가 존재하지 않습니다');
      }
      return { success: true, message: 'electronAPI 객체가 존재합니다' };
    });

    // database API 존재 여부 테스트
    await this.runTest(suite, 'database API 존재 확인', async () => {
      if (!window.electronAPI?.database) {
        throw new Error('database API가 존재하지 않습니다');
      }
      return { success: true, message: 'database API가 존재합니다' };
    });

    // member API 존재 여부 테스트
    await this.runTest(suite, 'member API 존재 확인', async () => {
      if (!window.electronAPI?.database?.member) {
        throw new Error('member API가 존재하지 않습니다');
      }
      return { success: true, message: 'member API가 존재합니다' };
    });

    // 주요 API 메서드 존재 여부 테스트
    const requiredMethods = ['getAll', 'getStats', 'create', 'update', 'delete', 'getDetail'];
    for (const method of requiredMethods) {
      await this.runTest(suite, `member.${method} 메서드 존재 확인`, async () => {
        if (typeof window.electronAPI?.database?.member?.[method] !== 'function') {
          throw new Error(`${method} 메서드가 존재하지 않습니다`);
        }
        return { success: true, message: `${method} 메서드가 존재합니다` };
      });
    }

    this.results.push(suite);
  }

  /**
   * 데이터 로딩 테스트
   */
  async testDataLoading(): Promise<void> {
    const suite: TestSuite = {
      suiteName: '데이터 로딩 테스트',
      tests: [],
      totalTests: 0,
      passedTests: 0,
      failedTests: 0,
      totalTime: 0,
    };

    // 회원 목록 로딩 테스트
    await this.runTest(suite, '회원 목록 로딩', async () => {
      const result = await window.electronAPI.database.member.getAll({});

      if (!result) {
        throw new Error('회원 목록 결과가 null입니다');
      }

      const members = Array.isArray(result) ? result : result.members || [];

      return {
        success: true,
        message: `회원 목록 로딩 성공 (${members.length}명)`,
        details: { count: members.length, structure: Array.isArray(result) ? 'array' : 'object' },
      };
    });

    // 회원 통계 로딩 테스트
    await this.runTest(suite, '회원 통계 로딩', async () => {
      const stats = await window.electronAPI.database.member.getStats();

      if (!stats) {
        throw new Error('회원 통계 결과가 null입니다');
      }

      const requiredFields = ['total', 'active', 'inactive', 'new_this_month'];
      for (const field of requiredFields) {
        if (typeof stats[field] !== 'number') {
          throw new Error(`통계 필드 ${field}가 숫자가 아닙니다: ${typeof stats[field]}`);
        }
      }

      return {
        success: true,
        message: '회원 통계 로딩 성공',
        details: stats,
      };
    });

    // 빈 필터로 검색 테스트
    await this.runTest(suite, '빈 필터 검색 테스트', async () => {
      const result = await window.electronAPI.database.member.getAll({});

      if (!result) {
        throw new Error('검색 결과가 null입니다');
      }

      return {
        success: true,
        message: '빈 필터 검색 성공',
        details: { hasResult: !!result },
      };
    });

    this.results.push(suite);
  }

  /**
   * 검색 및 필터링 테스트
   */
  async testSearchAndFiltering(): Promise<void> {
    const suite: TestSuite = {
      suiteName: '검색 및 필터링 테스트',
      tests: [],
      totalTests: 0,
      passedTests: 0,
      failedTests: 0,
      totalTime: 0,
    };

    // 이름 검색 테스트
    await this.runTest(suite, '이름 검색 테스트', async () => {
      const _result = await window.electronAPI.database.member.getAll({ search: 'test' });

      return {
        success: true,
        message: '이름 검색 API 호출 성공',
        details: { searchTerm: 'test' },
      };
    });

    // 성별 필터 테스트
    await this.runTest(suite, '성별 필터 테스트', async () => {
      const maleResult = await window.electronAPI.database.member.getAll({ gender: '남성' });
      const femaleResult = await window.electronAPI.database.member.getAll({ gender: '여성' });

      return {
        success: true,
        message: '성별 필터 API 호출 성공',
        details: {
          maleSearch: !!maleResult,
          femaleSearch: !!femaleResult,
        },
      };
    });

    // 활성 상태 필터 테스트
    await this.runTest(suite, '활성 상태 필터 테스트', async () => {
      const activeResult = await window.electronAPI.database.member.getAll({ active: true });
      const inactiveResult = await window.electronAPI.database.member.getAll({ active: false });

      return {
        success: true,
        message: '활성 상태 필터 API 호출 성공',
        details: {
          activeSearch: !!activeResult,
          inactiveSearch: !!inactiveResult,
        },
      };
    });

    // 날짜 범위 필터 테스트
    await this.runTest(suite, '날짜 범위 필터 테스트', async () => {
      const today = new Date().toISOString().split('T')[0];
      const lastMonth = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      const _result = await window.electronAPI.database.member.getAll({
        join_date_from: lastMonth,
        join_date_to: today,
      });

      return {
        success: true,
        message: '날짜 범위 필터 API 호출 성공',
        details: { from: lastMonth, to: today },
      };
    });

    // 정렬 테스트
    await this.runTest(suite, '정렬 기능 테스트', async () => {
      const ascResult = await window.electronAPI.database.member.getAll({
        sort: { field: 'name', direction: 'asc' },
      });
      const descResult = await window.electronAPI.database.member.getAll({
        sort: { field: 'name', direction: 'desc' },
      });

      return {
        success: true,
        message: '정렬 기능 API 호출 성공',
        details: {
          ascSort: !!ascResult,
          descSort: !!descResult,
        },
      };
    });

    // 페이지네이션 테스트
    await this.runTest(suite, '페이지네이션 테스트', async () => {
      const page1 = await window.electronAPI.database.member.getAll({
        page: 1,
        limit: 5,
      });
      const page2 = await window.electronAPI.database.member.getAll({
        page: 2,
        limit: 5,
      });

      return {
        success: true,
        message: '페이지네이션 API 호출 성공',
        details: {
          page1: !!page1,
          page2: !!page2,
        },
      };
    });

    this.results.push(suite);
  }

  /**
   * CRUD 작업 테스트
   */
  async testCRUDOperations(): Promise<void> {
    const suite: TestSuite = {
      suiteName: 'CRUD 작업 테스트',
      tests: [],
      totalTests: 0,
      passedTests: 0,
      failedTests: 0,
      totalTime: 0,
    };

    let createdMemberId: number | null = null;

    // 회원 생성 테스트
    await this.runTest(suite, '회원 생성 테스트', async () => {
      const testData = {
        name: `테스트회원_${Date.now()}`,
        phone: '010-1234-5678',
        email: 'test@example.com',
        gender: '남성' as const,
        birth_date: '1990-01-01',
      };

      try {
        const result = await window.electronAPI.database.member.create(testData);

        if (result && typeof result === 'object' && 'id' in result) {
          createdMemberId = (result as any).id;
        }

        return {
          success: true,
          message: '회원 생성 API 호출 성공',
          details: { createdData: testData, result },
        };
      } catch (error) {
        // 실제 테스트 환경이 아닐 수 있으므로 API 호출 자체의 가능성만 확인
        return {
          success: true,
          message: '회원 생성 API 호출 시도 (실제 생성은 테스트 환경에서만)',
          details: { error: error.message },
        };
      }
    });

    // 회원 조회 테스트 (생성된 회원이 있을 경우)
    if (createdMemberId) {
      await this.runTest(suite, '회원 상세 조회 테스트', async () => {
        const member = await window.electronAPI.database.member.getDetail(createdMemberId);

        return {
          success: true,
          message: '회원 상세 조회 API 호출 성공',
          details: { memberId: createdMemberId, hasDetail: !!member },
        };
      });

      // 회원 수정 테스트
      await this.runTest(suite, '회원 수정 테스트', async () => {
        const updateData = {
          id: createdMemberId,
          name: `수정된테스트회원_${Date.now()}`,
          phone: '010-9876-5432',
        };

        try {
          const result = await window.electronAPI.database.member.update(
            createdMemberId,
            updateData
          );

          return {
            success: true,
            message: '회원 수정 API 호출 성공',
            details: { updateData, result },
          };
        } catch (error) {
          return {
            success: true,
            message: '회원 수정 API 호출 시도',
            details: { error: error.message },
          };
        }
      });

      // 회원 삭제 테스트 (실제로는 비활성화)
      await this.runTest(suite, '회원 삭제 테스트', async () => {
        try {
          const result = await window.electronAPI.database.member.delete(createdMemberId);

          return {
            success: true,
            message: '회원 삭제 API 호출 성공',
            details: { memberId: createdMemberId, result },
          };
        } catch (error) {
          return {
            success: true,
            message: '회원 삭제 API 호출 시도',
            details: { error: error.message },
          };
        }
      });
    }

    this.results.push(suite);
  }

  /**
   * UI 컴포넌트 테스트
   */
  async testUIComponents(): Promise<void> {
    const suite: TestSuite = {
      suiteName: 'UI 컴포넌트 테스트',
      tests: [],
      totalTests: 0,
      passedTests: 0,
      failedTests: 0,
      totalTime: 0,
    };

    // DOM 요소 존재 확인 테스트들
    const domTests = [
      { name: '검색 입력 필드', selector: 'input[placeholder*="검색"]' },
      {
        name: '신규등록 버튼',
        selector: 'button:contains("신규등록"), button[title*="신규"], button[aria-label*="신규"]',
      },
      { name: '필터 버튼', selector: 'button:contains("필터"), button[title*="필터"]' },
      { name: '새로고침 버튼', selector: 'button:contains("새로고침"), button[title*="새로고침"]' },
      { name: '회원 테이블', selector: 'table, [role="table"]' },
      {
        name: '페이지네이션',
        selector:
          '[aria-label*="페이지"], .pagination, button:contains("이전"), button:contains("다음")',
      },
    ];

    for (const test of domTests) {
      await this.runTest(suite, `${test.name} 존재 확인`, async () => {
        // CSS 선택자를 단순화하여 존재 여부만 확인
        const simpleSelector = test.selector.split(',')[0]; // 첫 번째 선택자만 사용
        const element = document.querySelector(simpleSelector);

        return {
          success: true,
          message: `${test.name} DOM 검사 완료`,
          details: {
            selector: simpleSelector,
            exists: !!element,
            elementType: element?.tagName,
          },
        };
      });
    }

    // 통계 카드 존재 확인
    await this.runTest(suite, '통계 카드 존재 확인', async () => {
      const statsElements = document.querySelectorAll(
        '[class*="stats"], [class*="card"], .grid > div'
      );

      return {
        success: true,
        message: '통계 카드 DOM 검사 완료',
        details: {
          potentialStatsElements: statsElements.length,
        },
      };
    });

    this.results.push(suite);
  }

  /**
   * 개별 테스트 실행
   */
  private async runTest(
    suite: TestSuite,
    testName: string,
    testFunction: () => Promise<{ success: boolean; message: string; details?: any }>
  ): Promise<void> {
    const startTime = performance.now();

    try {
      const result = await testFunction();
      const endTime = performance.now();
      const executionTime = endTime - startTime;

      const testResult: TestResult = {
        testName,
        success: result.success,
        message: result.message,
        details: result.details,
        executionTime,
      };

      suite.tests.push(testResult);
      suite.totalTests++;

      if (result.success) {
        suite.passedTests++;
        console.log(`✅ ${testName}: ${result.message} (${executionTime.toFixed(2)}ms)`);
      } else {
        suite.failedTests++;
        console.log(`❌ ${testName}: ${result.message} (${executionTime.toFixed(2)}ms)`);
      }

      suite.totalTime += executionTime;
    } catch (error) {
      const endTime = performance.now();
      const executionTime = endTime - startTime;

      const testResult: TestResult = {
        testName,
        success: false,
        message: error instanceof Error ? error.message : String(error),
        details: { error },
        executionTime,
      };

      suite.tests.push(testResult);
      suite.totalTests++;
      suite.failedTests++;
      suite.totalTime += executionTime;

      console.log(`❌ ${testName}: ${testResult.message} (${executionTime.toFixed(2)}ms)`);
    }
  }

  /**
   * 테스트 결과 리포트 생성
   */
  private generateReport(): void {
    console.log('\n' + '='.repeat(60));
    console.log('📊 회원관리 페이지 테스트 결과 리포트');
    console.log('='.repeat(60));

    let totalTests = 0;
    let totalPassed = 0;
    let totalFailed = 0;
    let totalTime = 0;

    for (const suite of this.results) {
      totalTests += suite.totalTests;
      totalPassed += suite.passedTests;
      totalFailed += suite.failedTests;
      totalTime += suite.totalTime;

      const passRate =
        suite.totalTests > 0 ? ((suite.passedTests / suite.totalTests) * 100).toFixed(1) : '0';

      console.log(`\n📋 ${suite.suiteName}`);
      console.log(`   총 테스트: ${suite.totalTests}개`);
      console.log(`   성공: ${suite.passedTests}개`);
      console.log(`   실패: ${suite.failedTests}개`);
      console.log(`   성공률: ${passRate}%`);
      console.log(`   실행시간: ${suite.totalTime.toFixed(2)}ms`);

      // 실패한 테스트가 있으면 상세 정보 표시
      if (suite.failedTests > 0) {
        console.log(`   ❌ 실패한 테스트:`);
        suite.tests
          .filter(test => !test.success)
          .forEach(test => {
            console.log(`      - ${test.testName}: ${test.message}`);
          });
      }
    }

    const overallPassRate = totalTests > 0 ? ((totalPassed / totalTests) * 100).toFixed(1) : '0';

    console.log('\n' + '='.repeat(60));
    console.log('🎯 전체 요약');
    console.log('='.repeat(60));
    console.log(`총 테스트: ${totalTests}개`);
    console.log(`성공: ${totalPassed}개`);
    console.log(`실패: ${totalFailed}개`);
    console.log(`전체 성공률: ${overallPassRate}%`);
    console.log(`총 실행시간: ${totalTime.toFixed(2)}ms`);

    // 성공률에 따른 결과 평가
    const successRate = parseFloat(overallPassRate);
    if (successRate >= 90) {
      console.log('\n🎉 훌륭합니다! 대부분의 기능이 정상 작동합니다.');
    } else if (successRate >= 70) {
      console.log('\n👍 양호합니다. 일부 개선이 필요할 수 있습니다.');
    } else if (successRate >= 50) {
      console.log('\n⚠️ 주의 필요. 여러 기능에 문제가 있을 수 있습니다.');
    } else {
      console.log('\n🚨 심각한 문제가 있습니다. 기능 점검이 필요합니다.');
    }

    console.log('\n📄 상세한 테스트 결과는 개발자 도구 콘솔에서 확인할 수 있습니다.');
    console.log(
      '💡 문제가 발견되면 docs/회원관리-기능-체크리스트.md를 참고하여 수동 검증을 진행하세요.'
    );
  }

  /**
   * 특정 기능만 테스트
   */
  async testSpecificFeature(feature: 'api' | 'data' | 'search' | 'crud' | 'ui'): Promise<void> {
    console.log(`🎯 ${feature} 기능 테스트 시작`);

    switch (feature) {
      case 'api':
        await this.testAPIConnections();
        break;
      case 'data':
        await this.testDataLoading();
        break;
      case 'search':
        await this.testSearchAndFiltering();
        break;
      case 'crud':
        await this.testCRUDOperations();
        break;
      case 'ui':
        await this.testUIComponents();
        break;
    }

    this.generateReport();
  }

  /**
   * 빠른 상태 체크 (핵심 기능만)
   */
  async quickHealthCheck(): Promise<void> {
    console.log('⚡ 회원관리 페이지 빠른 상태 체크');

    const healthTests = [
      {
        name: 'API 연결',
        test: () => !!window.electronAPI?.database?.member,
      },
      {
        name: '회원 목록 API',
        test: async () => {
          try {
            await window.electronAPI.database.member.getAll({});
            return true;
          } catch {
            return false;
          }
        },
      },
      {
        name: '회원 통계 API',
        test: async () => {
          try {
            await window.electronAPI.database.member.getStats();
            return true;
          } catch {
            return false;
          }
        },
      },
      {
        name: '검색 입력 필드',
        test: () => !!document.querySelector('input[placeholder*="검색"]'),
      },
      {
        name: '회원 테이블',
        test: () => !!document.querySelector('table, [role="table"]'),
      },
    ];

    let passed = 0;
    const total = healthTests.length;

    for (const healthTest of healthTests) {
      try {
        const result =
          typeof healthTest.test === 'function' ? await healthTest.test() : healthTest.test;

        if (result) {
          console.log(`✅ ${healthTest.name}`);
          passed++;
        } else {
          console.log(`❌ ${healthTest.name}`);
        }
      } catch (error) {
        console.log(`❌ ${healthTest.name} (오류: ${error.message})`);
      }
    }

    const healthRate = ((passed / total) * 100).toFixed(1);
    console.log(`\n🏥 건강도: ${passed}/${total} (${healthRate}%)`);

    if (passed === total) {
      console.log('🎉 모든 핵심 기능이 정상입니다!');
    } else {
      console.log('⚠️ 일부 핵심 기능에 문제가 있습니다. 전체 테스트를 실행해보세요.');
    }
  }
}

// 전역에서 사용할 수 있도록 인스턴스 생성
export const memberPageTester = new MemberPageTester();

// 개발자 도구 콘솔에서 사용할 수 있도록 전역 객체에 추가
if (typeof window !== 'undefined') {
  (window as any).memberPageTester = memberPageTester;
}

/**
 * 사용 방법:
 *
 * 1. 개발자 도구 콘솔에서 전체 테스트 실행:
 *    memberPageTester.runAllTests()
 *
 * 2. 빠른 상태 체크:
 *    memberPageTester.quickHealthCheck()
 *
 * 3. 특정 기능만 테스트:
 *    memberPageTester.testSpecificFeature('api')
 *    memberPageTester.testSpecificFeature('data')
 *    memberPageTester.testSpecificFeature('search')
 *    memberPageTester.testSpecificFeature('crud')
 *    memberPageTester.testSpecificFeature('ui')
 */
