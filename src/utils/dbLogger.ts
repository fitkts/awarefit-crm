/**
 * 데이터베이스 실행 래퍼 - 자동 로깅 및 검증
 * 
 * 이 유틸리티는 모든 SQL 실행을 래핑하여 자동으로 로깅하고 검증합니다.
 * SQL 파라미터 불일치 오류를 사전에 방지하고 디버깅을 용이하게 합니다.
 */

export interface QueryExecutionResult {
  success: boolean;
  data?: any;
  error?: Error;
  executionTime: number;
  query: string;
  params: any[];
}

export interface DatabaseStats {
  totalQueries: number;
  successfulQueries: number;
  failedQueries: number;
  averageExecutionTime: number;
  slowQueries: Array<{
    query: string;
    executionTime: number;
    timestamp: Date;
  }>;
}

class DatabaseLogger {
  private stats: DatabaseStats = {
    totalQueries: 0,
    successfulQueries: 0,
    failedQueries: 0,
    averageExecutionTime: 0,
    slowQueries: []
  };

  private debugMode: boolean = process.env.NODE_ENV === 'development';
  private slowQueryThreshold: number = 1000; // 1초 이상이면 느린 쿼리

  /**
   * SELECT 쿼리 실행 (여러 행 반환)
   */
  executeQuery(db: any, query: string, params: any[] = []): QueryExecutionResult {
    const startTime = Date.now();
    
    try {
      this.validateAndLog(query, params, 'SELECT');
      
      const stmt = db.prepare(query);
      const data = stmt.all(params);
      
      const executionTime = Date.now() - startTime;
      this.updateStats(true, executionTime, query);
      
      this.log('✅ [DB] 쿼리 성공', {
        resultCount: data.length,
        executionTime: `${executionTime}ms`
      });

      return {
        success: true,
        data,
        executionTime,
        query,
        params
      };
      
    } catch (error) {
      const executionTime = Date.now() - startTime;
      this.updateStats(false, executionTime, query);
      
      this.logError('🚨 [DB] 쿼리 실행 실패', error as Error, query, params);
      
      return {
        success: false,
        error: error as Error,
        executionTime,
        query,
        params
      };
    }
  }

  /**
   * SELECT 쿼리 실행 (단일 행 반환)
   */
  executeQueryOne(db: any, query: string, params: any[] = []): QueryExecutionResult {
    const startTime = Date.now();
    
    try {
      this.validateAndLog(query, params, 'SELECT ONE');
      
      const stmt = db.prepare(query);
      const data = stmt.get(params);
      
      const executionTime = Date.now() - startTime;
      this.updateStats(true, executionTime, query);
      
      this.log('✅ [DB] 단일 쿼리 성공', {
        hasResult: !!data,
        executionTime: `${executionTime}ms`
      });

      return {
        success: true,
        data,
        executionTime,
        query,
        params
      };
      
    } catch (error) {
      const executionTime = Date.now() - startTime;
      this.updateStats(false, executionTime, query);
      
      this.logError('🚨 [DB] 단일 쿼리 실행 실패', error as Error, query, params);
      
      return {
        success: false,
        error: error as Error,
        executionTime,
        query,
        params
      };
    }
  }

  /**
   * INSERT/UPDATE/DELETE 쿼리 실행
   */
  executeCommand(db: any, query: string, params: any[] = []): QueryExecutionResult {
    const startTime = Date.now();
    
    try {
      this.validateAndLog(query, params, 'COMMAND');
      
      const stmt = db.prepare(query);
      const result = stmt.run(params);
      
      const executionTime = Date.now() - startTime;
      this.updateStats(true, executionTime, query);
      
      this.log('✅ [DB] 명령 실행 성공', {
        changes: result.changes,
        lastInsertRowid: result.lastInsertRowid,
        executionTime: `${executionTime}ms`
      });

      return {
        success: true,
        data: result,
        executionTime,
        query,
        params
      };
      
    } catch (error) {
      const executionTime = Date.now() - startTime;
      this.updateStats(false, executionTime, query);
      
      this.logError('🚨 [DB] 명령 실행 실패', error as Error, query, params);
      
      return {
        success: false,
        error: error as Error,
        executionTime,
        query,
        params
      };
    }
  }

  /**
   * 트랜잭션 실행
   */
  executeTransaction(db: any, operations: Array<{ query: string; params: any[] }>): QueryExecutionResult {
    const startTime = Date.now();
    const allQueries = operations.map(op => op.query).join('; ');
    const allParams = operations.flatMap(op => op.params);
    
    try {
      this.log('�� [DB] 트랜잭션 시작', { operationCount: operations.length });
      
      const transaction = db.transaction(() => {
        const results = [];
        
        for (const operation of operations) {
          this.validateAndLog(operation.query, operation.params, 'TRANSACTION');
          const stmt = db.prepare(operation.query);
          const result = stmt.run(operation.params);
          results.push(result);
        }
        
        return results;
      });
      
      const data = transaction();
      const executionTime = Date.now() - startTime;
      this.updateStats(true, executionTime, allQueries);
      
      this.log('✅ [DB] 트랜잭션 성공', {
        operationCount: operations.length,
        executionTime: `${executionTime}ms`
      });

      return {
        success: true,
        data,
        executionTime,
        query: allQueries,
        params: allParams
      };
      
    } catch (error) {
      const executionTime = Date.now() - startTime;
      this.updateStats(false, executionTime, allQueries);
      
      this.logError('🚨 [DB] 트랜잭션 실패', error as Error, allQueries, allParams);
      
      return {
        success: false,
        error: error as Error,
        executionTime,
        query: allQueries,
        params: allParams
      };
    }
  }

  /**
   * 쿼리 및 파라미터 검증
   */
  private validateAndLog(query: string, params: any[], type: string): void {
    const paramCount = (query.match(/\?/g) || []).length;
    
    this.log(`🔍 [DB] ${type} 실행 시작:`, {
      query: this.sanitizeQueryForLog(query),
      params: params,
      parameterCount: params.length,
      placeholderCount: paramCount
    });
    
    if (paramCount !== params.length) {
      const error = new Error(
        `🚨 DB Logger: 파라미터 개수 불일치 (쿼리: ${paramCount}개, 파라미터: ${params.length}개)`
      );
      this.logError('🚨 [DB] 파라미터 검증 실패', error, query, params);
      throw error;
    }
    
    this.log('✅ [DB] 파라미터 검증 통과');
  }

  /**
   * 통계 업데이트
   */
  private updateStats(success: boolean, executionTime: number, query: string): void {
    this.stats.totalQueries++;
    
    if (success) {
      this.stats.successfulQueries++;
    } else {
      this.stats.failedQueries++;
    }
    
    // 평균 실행 시간 계산
    const totalTime = (this.stats.averageExecutionTime * (this.stats.totalQueries - 1)) + executionTime;
    this.stats.averageExecutionTime = totalTime / this.stats.totalQueries;
    
    // 느린 쿼리 추적
    if (executionTime > this.slowQueryThreshold) {
      this.stats.slowQueries.push({
        query: this.sanitizeQueryForLog(query),
        executionTime,
        timestamp: new Date()
      });
      
      // 최대 10개까지만 보관
      if (this.stats.slowQueries.length > 10) {
        this.stats.slowQueries.shift();
      }
      
      this.log('🐌 [DB] 느린 쿼리 감지', {
        executionTime: `${executionTime}ms`,
        threshold: `${this.slowQueryThreshold}ms`
      });
    }
  }

  /**
   * 로그용 쿼리 정리 (긴 쿼리 축약)
   */
  private sanitizeQueryForLog(query: string): string {
    const cleaned = query.replace(/\s+/g, ' ').trim();
    return cleaned.length > 200 ? cleaned.substring(0, 200) + '...' : cleaned;
  }

  /**
   * 일반 로깅
   */
  private log(message: string, data?: any): void {
    if (this.debugMode) {
      if (data !== undefined) {
        console.log(message, data);
      } else {
        console.log(message);
      }
    }
  }

  /**
   * 에러 로깅
   */
  private logError(message: string, error: Error, query: string, params: any[]): void {
    console.error(message, {
      error: error.message,
      query: this.sanitizeQueryForLog(query),
      params: params,
      stack: this.debugMode ? error.stack : undefined
    });
  }

  /**
   * 통계 정보 반환
   */
  getStats(): DatabaseStats {
    return { ...this.stats };
  }

  /**
   * 통계 초기화
   */
  resetStats(): void {
    this.stats = {
      totalQueries: 0,
      successfulQueries: 0,
      failedQueries: 0,
      averageExecutionTime: 0,
      slowQueries: []
    };
    this.log('🔄 [DB] 통계 초기화됨');
  }

  /**
   * 성능 리포트 출력
   */
  printPerformanceReport(): void {
    const stats = this.getStats();
    const successRate = stats.totalQueries > 0 ? (stats.successfulQueries / stats.totalQueries * 100).toFixed(2) : '0';
    
    console.log('\n📊 [DB] 성능 리포트:');
    console.log(`- 총 쿼리: ${stats.totalQueries}개`);
    console.log(`- 성공률: ${successRate}%`);
    console.log(`- 평균 실행 시간: ${stats.averageExecutionTime.toFixed(2)}ms`);
    console.log(`- 느린 쿼리: ${stats.slowQueries.length}개`);
    
    if (stats.slowQueries.length > 0) {
      console.log('\n🐌 느린 쿼리 목록:');
      stats.slowQueries.forEach((slowQuery, index) => {
        console.log(`${index + 1}. ${slowQuery.executionTime}ms - ${slowQuery.query}`);
      });
    }
    console.log('');
  }
}

// 싱글톤 인스턴스 생성
export const dbLogger = new DatabaseLogger();

/**
 * 편의 함수들 - 기존 코드와 호환성을 위해
 */

/**
 * SELECT 쿼리 실행 (여러 행)
 */
export const executeQuery = (db: any, query: string, params: any[] = []) => {
  const result = dbLogger.executeQuery(db, query, params);
  if (!result.success) {
    throw result.error;
  }
  return result.data;
};

/**
 * SELECT 쿼리 실행 (단일 행)
 */
export const executeQueryOne = (db: any, query: string, params: any[] = []) => {
  const result = dbLogger.executeQueryOne(db, query, params);
  if (!result.success) {
    throw result.error;
  }
  return result.data;
};

/**
 * INSERT/UPDATE/DELETE 실행
 */
export const executeCommand = (db: any, query: string, params: any[] = []) => {
  const result = dbLogger.executeCommand(db, query, params);
  if (!result.success) {
    throw result.error;
  }
  return result.data;
};

/**
 * 트랜잭션 실행
 */
export const executeTransaction = (db: any, operations: Array<{ query: string; params: any[] }>) => {
  const result = dbLogger.executeTransaction(db, operations);
  if (!result.success) {
    throw result.error;
  }
  return result.data;
};
