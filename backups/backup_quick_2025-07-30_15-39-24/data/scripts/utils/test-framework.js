#!/usr/bin/env node

/**
 * 공통 테스트 프레임워크 유틸리티
 * 
 * 모든 테스트 스크립트에서 사용할 수 있는 통합 테스트 프레임워크입니다.
 * 중복된 테스트 함수들을 제거하고 일관된 테스트 실행 환경을 제공합니다.
 */

class TestFramework {
  constructor(testSuiteName = '테스트') {
    this.testSuiteName = testSuiteName;
    this.totalTests = 0;
    this.passedTests = 0;
    this.failedTests = 0;
    this.results = [];
    this.startTime = Date.now();
  }

  /**
   * 동기 테스트 실행
   * @param {string} testName - 테스트 이름
   * @param {Function} testFn - 테스트 함수
   * @returns {boolean} - 테스트 성공 여부
   */
  runTest(testName, testFn) {
    this.totalTests++;
    const testStartTime = Date.now();
    
    try {
      const result = testFn();
      const executionTime = Date.now() - testStartTime;
      
      if (result) {
        this.passedTests++;
        console.log(`✅ ${testName}: 통과 (${executionTime}ms)`);
        this.results.push({
          name: testName,
          status: 'passed',
          executionTime,
          error: null
        });
        return true;
      } else {
        this.failedTests++;
        console.log(`❌ ${testName}: 실패 (${executionTime}ms)`);
        this.results.push({
          name: testName,
          status: 'failed',
          executionTime,
          error: 'Test returned false'
        });
        return false;
      }
    } catch (error) {
      const executionTime = Date.now() - testStartTime;
      this.failedTests++;
      console.log(`❌ ${testName}: 오류 - ${error.message} (${executionTime}ms)`);
      this.results.push({
        name: testName,
        status: 'error',
        executionTime,
        error: error.message
      });
      return false;
    }
  }

  /**
   * 비동기 테스트 실행
   * @param {string} testName - 테스트 이름
   * @param {Function} testFn - 비동기 테스트 함수
   * @returns {Promise<boolean>} - 테스트 성공 여부
   */
  runAsyncTest(testName, testFn) {
    this.totalTests++;
    const testStartTime = Date.now();
    
    return testFn()
      .then(result => {
        const executionTime = Date.now() - testStartTime;
        
        if (result) {
          this.passedTests++;
          console.log(`✅ ${testName}: 통과 (${executionTime}ms)`);
          this.results.push({
            name: testName,
            status: 'passed',
            executionTime,
            error: null
          });
          return true;
        } else {
          this.failedTests++;
          console.log(`❌ ${testName}: 실패 (${executionTime}ms)`);
          this.results.push({
            name: testName,
            status: 'failed',
            executionTime,
            error: 'Test returned false'
          });
          return false;
        }
      })
      .catch(error => {
        const executionTime = Date.now() - testStartTime;
        this.failedTests++;
        console.log(`❌ ${testName}: 오류 - ${error.message} (${executionTime}ms)`);
        this.results.push({
          name: testName,
          status: 'error',
          executionTime,
          error: error.message
        });
        return false;
      });
  }

  /**
   * 테스트 그룹 시작
   * @param {string} groupName - 그룹 이름
   */
  startGroup(groupName) {
    console.log(`\n${groupName}`);
    console.log('-'.repeat(Math.min(groupName.length + 5, 50)));
  }

  /**
   * 현재 페이지 감지 (브라우저 환경용)
   * @returns {string} - 감지된 페이지 타입
   */
  detectCurrentPage() {
    if (typeof window === 'undefined') {
      return 'node'; // Node.js 환경
    }

    const path = window.location?.pathname || window.location?.hash || '';
    const title = document?.title || '';
    const url = window.location?.href || '';

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
      if (typeof document !== 'undefined') {
        if (document.querySelector('[class*="member"], [title*="회원"]')) return 'members';
        if (document.querySelector('[class*="staff"], [title*="직원"]')) return 'staff';
        if (document.querySelector('[class*="payment"], [title*="결제"]')) return 'payments';
        if (document.querySelector('[class*="dashboard"], [title*="대시보드"]')) return 'dashboard';
      }
    }

    return 'unknown';
  }

  /**
   * 환경 감지 및 기본 체크
   * @returns {object} - 환경 정보
   */
  checkEnvironment() {
    const env = {
      isNode: typeof window === 'undefined',
      isBrowser: typeof window !== 'undefined',
      isElectron: typeof window !== 'undefined' && !!window.process,
      hasElectronAPI: typeof window !== 'undefined' && !!window.electronAPI,
      currentPage: this.detectCurrentPage()
    };

    return env;
  }

  /**
   * 테스트 결과 요약 출력
   * @param {object} options - 출력 옵션
   */
  printSummary(options = {}) {
    const {
      showDetails = false,
      showTiming = true,
      showRecommendations = true
    } = options;

    const totalTime = Date.now() - this.startTime;
    const successRate = this.totalTests > 0 ? ((this.passedTests / this.totalTests) * 100).toFixed(1) : 0;

    console.log('\n' + '='.repeat(50));
    console.log(`📊 ${this.testSuiteName} 테스트 결과`);
    console.log('='.repeat(50));
    console.log(`총 테스트: ${this.totalTests}개`);
    console.log(`성공: ${this.passedTests}개`);
    console.log(`실패: ${this.failedTests}개`);
    console.log(`성공률: ${successRate}%`);
    
    if (showTiming) {
      console.log(`실행 시간: ${totalTime}ms`);
      
      if (this.results.length > 0) {
        const avgTime = this.results.reduce((sum, r) => sum + r.executionTime, 0) / this.results.length;
        console.log(`평균 테스트 시간: ${avgTime.toFixed(1)}ms`);
      }
    }

    // 결과 해석
    if (successRate >= 90) {
      console.log('\n🎉 훌륭합니다! 시스템이 정상적으로 작동합니다.');
    } else if (successRate >= 75) {
      console.log('\n👍 양호합니다. 대부분의 기능이 정상 작동합니다.');
    } else if (successRate >= 50) {
      console.log('\n⚠️ 주의 필요. 여러 기능에 문제가 있습니다.');
    } else {
      console.log('\n🚨 심각한 문제가 있습니다.');
    }

    // 실패한 테스트 상세 정보
    if (showDetails && this.failedTests > 0) {
      console.log('\n❌ 실패한 테스트들:');
      this.results
        .filter(r => r.status !== 'passed')
        .forEach(r => {
          console.log(`  - ${r.name}: ${r.error || '실패'}`);
        });
    }

    // 권장사항
    if (showRecommendations && this.failedTests > 0) {
      console.log('\n💡 권장사항:');
      
      if (typeof window !== 'undefined' && !window.electronAPI) {
        console.log('- electronAPI 없음: 앱 재시작 또는 preload 스크립트 확인');
      }

      if (typeof document !== 'undefined' && document.querySelectorAll('button').length < 3) {
        console.log('- UI 요소 부족: 페이지 로딩 완료 후 다시 시도');
      }

      if (typeof document !== 'undefined' && document.readyState !== 'complete') {
        console.log('- 페이지 로딩 미완료: 잠시 후 다시 실행');
      }
    }

    return {
      totalTests: this.totalTests,
      passedTests: this.passedTests,
      failedTests: this.failedTests,
      successRate: parseFloat(successRate),
      totalTime,
      results: this.results
    };
  }

  /**
   * JSON 형태로 결과 반환
   * @returns {object} - 테스트 결과 객체
   */
  getResults() {
    return {
      testSuiteName: this.testSuiteName,
      totalTests: this.totalTests,
      passedTests: this.passedTests,
      failedTests: this.failedTests,
      successRate: this.totalTests > 0 ? ((this.passedTests / this.totalTests) * 100) : 0,
      executionTime: Date.now() - this.startTime,
      results: this.results,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * 테스트 결과를 파일로 저장
   * @param {string} filename - 저장할 파일명
   */
  saveResults(filename) {
    if (typeof require !== 'undefined') {
      const fs = require('fs');
      const results = this.getResults();
      
      try {
        fs.writeFileSync(filename, JSON.stringify(results, null, 2));
        console.log(`\n📄 테스트 결과가 ${filename}에 저장되었습니다.`);
      } catch (error) {
        console.error(`❌ 결과 저장 실패: ${error.message}`);
      }
    }
  }

  /**
   * 빠른 상태 체크 (간단한 API와 UI 확인)
   * @returns {object} - 기본 상태 정보
   */
  quickHealthCheck() {
    const env = this.checkEnvironment();
    
    const health = {
      environment: env.currentPage !== 'unknown' ? '✅' : '⚠️',
      api: env.hasElectronAPI ? '✅' : '❌',
      ui: typeof document !== 'undefined' && document.querySelectorAll('button').length > 2 ? '✅' : '⚠️'
    };

    console.log('⚡ 빠른 상태 체크:');
    console.log(`🌍 환경: ${health.environment} (${env.currentPage})`);
    console.log(`🔧 API: ${health.api} ${env.hasElectronAPI ? '연결됨' : '연결 안됨'}`);
    console.log(`🎨 UI: ${health.ui} ${typeof document !== 'undefined' ? `버튼 ${document.querySelectorAll('button').length}개` : 'N/A'}`);

    const overall = Object.values(health).every(status => status === '✅');
    console.log(`🏥 종합: ${overall ? '✅ 정상' : '⚠️ 점검 필요'}`);

    return { ...health, overall, environment: env };
  }
}

// 브라우저 환경에서 사용할 수 있도록 전역 객체에 등록
if (typeof window !== 'undefined') {
  window.TestFramework = TestFramework;
}

// Node.js 환경에서 모듈로 내보내기
if (typeof module !== 'undefined' && module.exports) {
  module.exports = TestFramework;
}

// 직접 실행시 데모
if (typeof require !== 'undefined' && require.main === module) {
  console.log('🧪 TestFramework 데모 실행');
  
  const demo = new TestFramework('데모 테스트');
  
  demo.startGroup('🔧 기본 환경 테스트');
  demo.runTest('Node.js 환경 확인', () => typeof process !== 'undefined');
  demo.runTest('TestFramework 동작 확인', () => true);
  demo.runTest('실패 테스트 예시', () => false);
  
  // 비동기 테스트 예시
  demo.startGroup('📡 비동기 테스트');
  
  Promise.resolve()
    .then(() => demo.runAsyncTest('비동기 성공 테스트', async () => {
      await new Promise(resolve => setTimeout(resolve, 100));
      return true;
    }))
    .then(() => demo.runAsyncTest('비동기 실패 테스트', async () => {
      await new Promise(resolve => setTimeout(resolve, 50));
      return false;
    }))
    .then(() => {
      setTimeout(() => {
        demo.printSummary({
          showDetails: true,
          showTiming: true,
          showRecommendations: true
        });
      }, 200);
    });
} 