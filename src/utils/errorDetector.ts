/**
 * 실시간 오류 감지 및 자동 해결책 제시 시스템
 *
 * 이 모듈은 런타임에서 발생하는 SQL 파라미터 오류, API 연결 오류 등을
 * 자동으로 감지하고 즉시 해결책을 제시합니다.
 */

export interface ErrorPattern {
  pattern: RegExp | string;
  category: 'SQL' | 'API' | 'UI' | 'Network' | 'Type' | 'Other';
  severity: 'critical' | 'warning' | 'info';
  solution: string[];
  preventionTips: string[];
}

export interface ErrorReport {
  timestamp: Date;
  category: string;
  severity: string;
  originalMessage: string;
  detectedPattern: string;
  solutions: string[];
  preventionTips: string[];
  stackTrace?: string;
}

class ErrorDetector {
  private patterns: ErrorPattern[] = [];
  private errorHistory: ErrorReport[] = [];
  private isSetup: boolean = false;
  private originalConsoleError: typeof console.error;
  private originalConsoleWarn: typeof console.warn;

  constructor() {
    this.originalConsoleError = console.error;
    this.originalConsoleWarn = console.warn;
    this.setupErrorPatterns();
  }

  /**
   * 에러 패턴 설정
   */
  private setupErrorPatterns(): void {
    this.patterns = [
      // SQL 관련 오류들
      {
        pattern: /Too few parameter values were provided/i,
        category: 'SQL',
        severity: 'critical',
        solution: [
          '🔧 QueryBuilder 클래스를 사용하세요: src/utils/queryBuilder.ts',
          '🔧 SQL 쿼리의 ? 개수와 파라미터 배열 길이를 확인하세요',
          '🔧 COUNT 쿼리 생성 시 LIMIT/OFFSET 파라미터를 제외하세요',
          '🔧 dbLogger.executeQuery()를 사용하여 자동 검증하세요',
        ],
        preventionTips: [
          '💡 항상 QueryBuilder 패턴을 사용하세요',
          '💡 쿼리 실행 전 파라미터 개수를 검증하세요',
          '💡 복잡한 동적 쿼리는 단계별로 빌드하세요',
        ],
      },
      {
        pattern: /SQLITE_ERROR.*syntax error/i,
        category: 'SQL',
        severity: 'critical',
        solution: [
          '🔧 SQL 문법을 확인하세요',
          '🔧 테이블명과 컬럼명을 검증하세요',
          '🔧 쿼리를 단순화해서 테스트해보세요',
          '🔧 SQLite 문법 가이드를 참조하세요',
        ],
        preventionTips: [
          '💡 쿼리 작성 시 IDE의 SQL 하이라이팅을 활용하세요',
          '💡 복잡한 쿼리는 단계별로 빌드하고 테스트하세요',
        ],
      },

      // API 관련 오류들
      {
        pattern: /electronAPI.*undefined|Cannot read.*electronAPI/i,
        category: 'API',
        severity: 'critical',
        solution: [
          '🔧 preload.ts가 올바르게 로드되었는지 확인하세요',
          '🔧 main.ts에서 preload 스크립트 경로를 확인하세요',
          '🔧 개발 서버를 재시작해보세요',
          '🔧 Electron 환경에서 실행 중인지 확인하세요',
        ],
        preventionTips: [
          '💡 API 호출 전 window.electronAPI 존재 여부를 확인하세요',
          '💡 환경 감지 로직을 추가하세요',
          '💡 웹 브라우저용 fallback을 구현하세요',
        ],
      },
      {
        pattern: /fetch.*network.*error|Failed to fetch/i,
        category: 'Network',
        severity: 'warning',
        solution: [
          '🔧 네트워크 연결을 확인하세요',
          '🔧 API 서버가 실행 중인지 확인하세요',
          '🔧 CORS 설정을 확인하세요',
          '🔧 재시도 로직을 구현하세요',
        ],
        preventionTips: [
          '💡 네트워크 오류에 대한 적절한 fallback을 구현하세요',
          '💡 사용자에게 명확한 오류 메시지를 표시하세요',
        ],
      },

      // UI/React 관련 오류들
      {
        pattern: /Cannot read prop.*undefined|TypeError.*prop/i,
        category: 'UI',
        severity: 'warning',
        solution: [
          '🔧 컴포넌트 prop의 기본값을 설정하세요',
          '🔧 optional chaining (?.)을 사용하세요',
          '🔧 TypeScript 타입 정의를 확인하세요',
          '🔧 prop 전달 과정을 검토하세요',
        ],
        preventionTips: [
          '💡 모든 prop에 대해 타입과 기본값을 정의하세요',
          '💡 prop-types 또는 TypeScript를 활용하세요',
        ],
      },
      {
        pattern: /React.*Hook.*called conditionally|Hooks.*order/i,
        category: 'UI',
        severity: 'critical',
        solution: [
          '🔧 Hook을 조건문 밖으로 이동하세요',
          '🔧 Hook 호출 순서를 일정하게 유지하세요',
          '🔧 React Hook 규칙을 준수하세요',
          '🔧 ESLint react-hooks 플러그인을 사용하세요',
        ],
        preventionTips: [
          '💡 Hook은 항상 컴포넌트 최상단에 작성하세요',
          '💡 조건부 Hook 사용을 피하세요',
        ],
      },

      // TypeScript 관련 오류들
      {
        pattern: /Type.*is not assignable to type|Property.*does not exist/i,
        category: 'Type',
        severity: 'warning',
        solution: [
          '🔧 TypeScript 타입 정의를 확인하세요',
          '🔧 인터페이스와 실제 구현이 일치하는지 확인하세요',
          '🔧 타입 가드나 타입 단언을 사용하세요',
          '🔧 npm run type-check를 실행하세요',
        ],
        preventionTips: ['💡 strict 모드를 활성화하세요', '💡 any 타입 사용을 최소화하세요'],
      },
    ];
  }

  /**
   * 오류 감지 시스템 활성화
   */
  setup(): void {
    if (this.isSetup) return;

    // console.error 래핑
    console.error = (...args: any[]) => {
      this.analyzeError('error', args);
      this.originalConsoleError.apply(console, args);
    };

    // console.warn 래핑
    console.warn = (...args: any[]) => {
      this.analyzeError('warn', args);
      this.originalConsoleWarn.apply(console, args);
    };

    // 전역 에러 핸들러
    if (typeof window !== 'undefined') {
      window.addEventListener('error', event => {
        this.analyzeError('error', [event.error?.message || event.message]);
      });

      window.addEventListener('unhandledrejection', event => {
        this.analyzeError('error', [event.reason]);
      });
    }

    this.isSetup = true;
    console.log('🤖 [ErrorDetector] 실시간 오류 감지 시스템이 활성화되었습니다.');
  }

  /**
   * 오류 분석 및 해결책 제시
   */
  private analyzeError(level: 'error' | 'warn', args: any[]): void {
    const message = args.join(' ');
    const matchedPattern = this.findMatchingPattern(message);

    if (matchedPattern) {
      const report: ErrorReport = {
        timestamp: new Date(),
        category: matchedPattern.category,
        severity: level === 'error' ? 'high' : matchedPattern.severity,
        originalMessage: message,
        detectedPattern: matchedPattern.pattern.toString(),
        solutions: matchedPattern.solution,
        preventionTips: matchedPattern.preventionTips,
        stackTrace: this.extractStackTrace(args),
      };

      this.errorHistory.push(report);
      this.showErrorGuidance(report);

      // 최대 50개까지만 보관
      if (this.errorHistory.length > 50) {
        this.errorHistory.shift();
      }
    }
  }

  /**
   * 매칭되는 오류 패턴 찾기
   */
  private findMatchingPattern(message: string): ErrorPattern | null {
    for (const pattern of this.patterns) {
      if (typeof pattern.pattern === 'string') {
        if (message.toLowerCase().includes(pattern.pattern.toLowerCase())) {
          return pattern;
        }
      } else if (pattern.pattern instanceof RegExp) {
        if (pattern.pattern.test(message)) {
          return pattern;
        }
      }
    }
    return null;
  }

  /**
   * 스택 트레이스 추출
   */
  private extractStackTrace(args: any[]): string | undefined {
    for (const arg of args) {
      if (arg instanceof Error && arg.stack) {
        return arg.stack;
      }
      if (typeof arg === 'object' && arg.stack) {
        return arg.stack;
      }
    }
    return undefined;
  }

  /**
   * 오류 가이드 표시
   */
  private showErrorGuidance(report: ErrorReport): void {
    const style = this.getConsoleStyle(report.severity);

    console.group(`🚨 [ErrorDetector] ${report.category} 오류 감지!`);
    console.log(`%c📊 분류: ${report.category} (${report.severity})`, style);
    console.log(`%c🔍 원인: ${report.originalMessage}`, 'color: #666;');

    console.log(`%c💡 해결 방법:`, 'color: #2196F3; font-weight: bold;');
    report.solutions.forEach((solution, index) => {
      console.log(`%c  ${index + 1}. ${solution}`, 'color: #4CAF50;');
    });

    console.log(`%c🛡️ 예방 팁:`, 'color: #FF9800; font-weight: bold;');
    report.preventionTips.forEach((tip, index) => {
      console.log(`%c  ${index + 1}. ${tip}`, 'color: #FF9800;');
    });

    // 특별한 조치가 필요한 경우
    if (report.severity === 'critical') {
      console.log(
        `%c⚠️ 이 오류는 즉시 수정이 필요합니다!`,
        'color: #F44336; font-weight: bold; background: #FFEBEE; padding: 4px;'
      );
    }

    console.groupEnd();
  }

  /**
   * 콘솔 스타일 반환
   */
  private getConsoleStyle(severity: string): string {
    switch (severity) {
      case 'critical':
        return 'color: #F44336; font-weight: bold;';
      case 'warning':
        return 'color: #FF9800; font-weight: bold;';
      case 'info':
        return 'color: #2196F3; font-weight: bold;';
      default:
        return 'color: #666;';
    }
  }

  /**
   * 오류 패턴 추가
   */
  addPattern(pattern: ErrorPattern): void {
    this.patterns.push(pattern);
    console.log(`🔧 [ErrorDetector] 새로운 오류 패턴이 추가되었습니다: ${pattern.category}`);
  }

  /**
   * 오류 통계 반환
   */
  getErrorStats(): {
    total: number;
    byCategory: Record<string, number>;
    bySeverity: Record<string, number>;
    recent: ErrorReport[];
  } {
    const byCategory: Record<string, number> = {};
    const bySeverity: Record<string, number> = {};

    this.errorHistory.forEach(error => {
      byCategory[error.category] = (byCategory[error.category] || 0) + 1;
      bySeverity[error.severity] = (bySeverity[error.severity] || 0) + 1;
    });

    return {
      total: this.errorHistory.length,
      byCategory,
      bySeverity,
      recent: this.errorHistory.slice(-10), // 최근 10개
    };
  }

  /**
   * 오류 리포트 생성
   */
  generateReport(): string {
    const stats = this.getErrorStats();
    let report = `# 🚨 오류 감지 리포트\n\n`;
    report += `**생성 시간**: ${new Date().toLocaleString('ko-KR')}\n`;
    report += `**총 감지된 오류**: ${stats.total}개\n\n`;

    if (stats.total === 0) {
      report += `✅ 감지된 오류가 없습니다!\n`;
      return report;
    }

    report += `## 📊 카테고리별 통계\n\n`;
    Object.entries(stats.byCategory).forEach(([category, count]) => {
      report += `- **${category}**: ${count}개\n`;
    });

    report += `\n## ⚠️ 심각도별 통계\n\n`;
    Object.entries(stats.bySeverity).forEach(([severity, count]) => {
      report += `- **${severity}**: ${count}개\n`;
    });

    report += `\n## 🕒 최근 오류 (최대 10개)\n\n`;
    stats.recent.forEach((error, index) => {
      report += `### ${index + 1}. ${error.category} 오류\n`;
      report += `- **시간**: ${error.timestamp.toLocaleString('ko-KR')}\n`;
      report += `- **심각도**: ${error.severity}\n`;
      report += `- **메시지**: ${error.originalMessage}\n`;
      report += `- **해결책**: ${error.solutions[0]}\n\n`;
    });

    return report;
  }

  /**
   * 시스템 비활성화
   */
  disable(): void {
    if (!this.isSetup) return;

    console.error = this.originalConsoleError;
    console.warn = this.originalConsoleWarn;
    this.isSetup = false;

    console.log('🔴 [ErrorDetector] 오류 감지 시스템이 비활성화되었습니다.');
  }
}

// 싱글톤 인스턴스
export const errorDetector = new ErrorDetector();

/**
 * 자동 초기화 함수
 */
export const setupErrorDetection = () => {
  errorDetector.setup();
};

/**
 * 오류 통계 출력
 */
export const printErrorStats = () => {
  const stats = errorDetector.getErrorStats();
  console.log('\n📊 [ErrorDetector] 오류 통계:');
  console.log(`- 총 감지된 오류: ${stats.total}개`);
  console.log('- 카테고리별:', stats.byCategory);
  console.log('- 심각도별:', stats.bySeverity);
  console.log('');
};

/**
 * 오류 리포트 파일 생성
 */
export const generateErrorReportFile = () => {
  const fs = require('fs');
  const report = errorDetector.generateReport();
  fs.writeFileSync('ERROR_REPORT.md', report);
  console.log('📄 [ErrorDetector] 오류 리포트가 ERROR_REPORT.md에 저장되었습니다.');
};
