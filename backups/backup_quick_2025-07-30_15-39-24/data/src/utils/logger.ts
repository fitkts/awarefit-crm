/**
 * 로깅 시스템 - 에러 추적 및 디버깅을 위한 통합 로거
 * 비개발자도 쉽게 문제를 파악할 수 있도록 구성
 */

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  FATAL = 4,
}

export interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: Date;
  context?: string;
  data?: any;
  stack?: string;
}

class Logger {
  private logLevel: LogLevel = LogLevel.INFO;
  private logs: LogEntry[] = [];
  private maxLogs = 1000; // 메모리 관리를 위한 최대 로그 수

  constructor() {
    // 개발 환경에서는 DEBUG 레벨부터 모든 로그 표시
    if (process.env.NODE_ENV === 'development') {
      this.logLevel = LogLevel.DEBUG;
    }
  }

  private log(level: LogLevel, message: string, context?: string, data?: any, error?: Error): void {
    if (level < this.logLevel) return;

    const logEntry: LogEntry = {
      level,
      message,
      timestamp: new Date(),
      context,
      data,
      stack: error?.stack,
    };

    // 메모리 관리
    this.logs.push(logEntry);
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }

    // 콘솔 출력
    this.consoleLog(logEntry);

    // 심각한 오류는 별도 처리
    if (level >= LogLevel.ERROR) {
      this.handleError(logEntry);
    }
  }

  private consoleLog(entry: LogEntry): void {
    const timestamp = entry.timestamp.toISOString();
    const levelName = LogLevel[entry.level];
    const prefix = `[${timestamp}] [${levelName}]`;
    const context = entry.context ? `[${entry.context}]` : '';
    const message = `${prefix} ${context} ${entry.message}`;

    switch (entry.level) {
      case LogLevel.DEBUG:
        console.debug(message, entry.data);
        break;
      case LogLevel.INFO:
        console.info(message, entry.data);
        break;
      case LogLevel.WARN:
        console.warn(message, entry.data);
        break;
      case LogLevel.ERROR:
      case LogLevel.FATAL:
        console.error(message, entry.data);
        if (entry.stack) {
          console.error('Stack trace:', entry.stack);
        }
        break;
    }
  }

  private handleError(entry: LogEntry): void {
    // TODO: 향후 에러 리포팅 서비스 연동 시 여기에 구현
    // 예: Sentry, 로컬 파일 저장, 이메일 알림 등

    // 지금은 콘솔에만 표시하고 로컬 스토리지에 저장
    if (typeof window !== 'undefined') {
      try {
        const errorLog = {
          timestamp: entry.timestamp.toISOString(),
          level: LogLevel[entry.level],
          message: entry.message,
          context: entry.context,
          data: entry.data,
          stack: entry.stack,
        };

        const existingErrors = JSON.parse(localStorage.getItem('app-errors') || '[]');
        existingErrors.push(errorLog);

        // 최대 50개의 에러만 저장
        if (existingErrors.length > 50) {
          existingErrors.shift();
        }

        localStorage.setItem('app-errors', JSON.stringify(existingErrors));
      } catch (e) {
        console.error('로컬 스토리지에 에러 저장 실패:', e);
      }
    }
  }

  // 공개 메서드들
  debug(message: string, data?: any, context?: string): void {
    this.log(LogLevel.DEBUG, message, context, data);
  }

  info(message: string, data?: any, context?: string): void {
    this.log(LogLevel.INFO, message, context, data);
  }

  warn(message: string, data?: any, context?: string): void {
    this.log(LogLevel.WARN, message, context, data);
  }

  error(message: string, error?: Error | any, context?: string): void {
    const errorObj = error instanceof Error ? error : new Error(String(error));
    this.log(LogLevel.ERROR, message, context, error, errorObj);
  }

  fatal(message: string, error?: Error | any, context?: string): void {
    const errorObj = error instanceof Error ? error : new Error(String(error));
    this.log(LogLevel.FATAL, message, context, error, errorObj);
  }

  // 유틸리티 메서드들
  getLogs(level?: LogLevel): LogEntry[] {
    if (level !== undefined) {
      return this.logs.filter(log => log.level >= level);
    }
    return [...this.logs];
  }

  clearLogs(): void {
    this.logs = [];
  }

  setLevel(level: LogLevel): void {
    this.logLevel = level;
  }

  // 에러 리포트 생성 (비개발자를 위한 간단한 리포트)
  generateErrorReport(): string {
    const errors = this.getLogs(LogLevel.ERROR);
    const recentErrors = errors.slice(-10); // 최근 10개 에러만

    let report = '=== Awarefit CRM 에러 리포트 ===\n\n';
    report += `생성일시: ${new Date().toLocaleString('ko-KR')}\n`;
    report += `총 에러 수: ${errors.length}개\n`;
    report += `최근 에러 수: ${recentErrors.length}개\n\n`;

    if (recentErrors.length === 0) {
      report += '✅ 최근 에러가 없습니다!\n';
    } else {
      report += '🚨 최근 발생한 에러들:\n\n';
      recentErrors.forEach((error, index) => {
        report += `${index + 1}. [${error.timestamp.toLocaleString('ko-KR')}]\n`;
        report += `   ${error.message}\n`;
        if (error.context) {
          report += `   위치: ${error.context}\n`;
        }
        report += '\n';
      });
    }

    report += '\n=== 리포트 끝 ===';
    return report;
  }

  // localStorage에서 에러 로그 가져오기
  getStoredErrors(): any[] {
    if (typeof window === 'undefined') return [];

    try {
      return JSON.parse(localStorage.getItem('app-errors') || '[]');
    } catch {
      return [];
    }
  }

  // localStorage 에러 로그 삭제
  clearStoredErrors(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('app-errors');
    }
  }
}

// 싱글톤 인스턴스 생성
export const logger = new Logger();

// 전역 에러 핸들러 설정 (브라우저 환경에서만)
if (typeof window !== 'undefined') {
  window.addEventListener('error', event => {
    logger.error(
      `전역 에러 발생: ${event.message}`,
      event.error,
      `${event.filename}:${event.lineno}:${event.colno}`
    );
  });

  window.addEventListener('unhandledrejection', event => {
    logger.error(`처리되지 않은 Promise 에러: ${event.reason}`, event.reason, 'unhandledPromise');
  });
}

// 비개발자를 위한 간편 사용법을 위한 기본 export
export default logger;
