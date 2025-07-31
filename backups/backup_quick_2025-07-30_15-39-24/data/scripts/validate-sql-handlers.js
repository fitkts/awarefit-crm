#!/usr/bin/env node

/**
 * SQL 핸들러 검증 스크립트
 * 
 * Git commit 시 SQL 관련 파일의 안전성을 검증합니다.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class SQLHandlerValidator {
  constructor() {
    this.issues = [];
    this.warnings = [];
  }

  /**
   * 변경된 SQL 핸들러 파일들 검증
   */
  validateChangedFiles() {
    try {
      // 스테이징된 SQL 관련 파일들 가져오기
      const changedFiles = execSync('git diff --cached --name-only', { encoding: 'utf8' })
        .split('\n')
        .filter(file => file.trim())
        .filter(file => 
          file.includes('ipc/') && file.includes('Handlers.ts') ||
          file.includes('queryBuilder.ts') ||
          file.includes('dbLogger.ts')
        );

      if (changedFiles.length === 0) {
        console.log('✅ [SQLValidator] SQL 관련 파일 변경 없음');
        return true;
      }

      console.log(`🔍 [SQLValidator] SQL 관련 파일 검증 중: ${changedFiles.length}개`);

      for (const file of changedFiles) {
        this.validateFile(file);
      }

      return this.reportResults();

    } catch (error) {
      console.error('❌ [SQLValidator] 검증 중 오류 발생:', error.message);
      return false;
    }
  }

  /**
   * 개별 파일 검증
   */
  validateFile(filePath) {
    if (!fs.existsSync(filePath)) {
      console.log(`⚠️ [SQLValidator] 파일이 존재하지 않음: ${filePath}`);
      return;
    }

    console.log(`  🔍 검증 중: ${filePath}`);

    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const diff = execSync(`git diff --cached "${filePath}"`, { encoding: 'utf8' });

      this.checkParameterBinding(filePath, content, diff);
      this.checkQueryBuilderUsage(filePath, content, diff);
      this.checkErrorHandling(filePath, content, diff);
      this.checkLogging(filePath, content, diff);
      this.checkCountQueries(filePath, content, diff);

    } catch (error) {
      this.issues.push(`${filePath}: 파일 읽기 오류 - ${error.message}`);
    }
  }

  /**
   * 파라미터 바인딩 검증
   */
  checkParameterBinding(filePath, content, diff) {
    // db.prepare 사용 시 파라미터 검증 로직 확인
    const prepareCalls = (content.match(/db\.prepare\s*\(/g) || []).length;
    const paramValidations = (content.match(/params\.length|\.length.*params/g) || []).length;

    if (prepareCalls > 0 && paramValidations === 0) {
      this.issues.push(
        `${filePath}: db.prepare() 사용 시 파라미터 개수 검증 로직이 없습니다. ` +
        `QueryBuilder 또는 dbLogger 사용을 권장합니다.`
      );
    }

    // 새로 추가된 db.prepare 호출 확인
    const newPrepareCalls = (diff.match(/^\+.*db\.prepare\s*\(/gm) || []).length;
    const newParamValidations = (diff.match(/^\+.*params\.length/gm) || []).length;

    if (newPrepareCalls > 0 && newParamValidations === 0) {
      this.warnings.push(
        `${filePath}: 새로 추가된 db.prepare() 호출에 파라미터 검증이 없습니다.`
      );
    }
  }

  /**
   * QueryBuilder 사용 권장 사항 확인
   */
  checkQueryBuilderUsage(filePath, content, diff) {
    const complexQueryPattern = /query\s*\+=.*AND|query\s*\+=.*OR|query\s*\+=.*WHERE/;
    
    if (complexQueryPattern.test(content) && !content.includes('QueryBuilder')) {
      this.warnings.push(
        `${filePath}: 복잡한 동적 쿼리가 감지되었습니다. QueryBuilder 사용을 권장합니다.`
      );
    }

    // 새로 추가된 복잡한 쿼리 확인
    if (complexQueryPattern.test(diff) && !diff.includes('QueryBuilder')) {
      this.warnings.push(
        `${filePath}: 새로 추가된 복잡한 쿼리에 QueryBuilder 사용을 권장합니다.`
      );
    }
  }

  /**
   * 에러 처리 확인
   */
  checkErrorHandling(filePath, content, diff) {
    const tryCatchBlocks = (content.match(/try\s*{/g) || []).length;
    const dbCalls = (content.match(/db\.(prepare|exec)/g) || []).length;

    if (dbCalls > 0 && tryCatchBlocks === 0) {
      this.issues.push(
        `${filePath}: DB 호출에 대한 에러 처리(try-catch)가 없습니다.`
      );
    }

    // console.error 사용 확인
    if (!content.includes('console.error') && !content.includes('dbLogger')) {
      this.warnings.push(
        `${filePath}: 오류 로깅이 없습니다. console.error 또는 dbLogger 사용을 권장합니다.`
      );
    }
  }

  /**
   * 로깅 확인
   */
  checkLogging(filePath, content, diff) {
    if (filePath.includes('Handlers.ts')) {
      const hasDebugLogging = content.includes('console.log') || content.includes('dbLogger');
      
      if (!hasDebugLogging) {
        this.warnings.push(
          `${filePath}: 디버깅을 위한 로깅이 없습니다. 개발 환경에서 로깅 추가를 권장합니다.`
        );
      }

      // 쿼리 실행 전 로깅 확인
      const hasQueryLogging = content.includes('쿼리:') || content.includes('query:');
      if (!hasQueryLogging && content.includes('db.prepare')) {
        this.warnings.push(
          `${filePath}: 쿼리 실행 전 로깅이 없습니다. 디버깅을 위해 추가를 권장합니다.`
        );
      }
    }
  }

  /**
   * COUNT 쿼리 검증
   */
  checkCountQueries(filePath, content, diff) {
    const countQueries = content.match(/COUNT\(\*\)|count\(\*\)/g);
    
    if (countQueries && countQueries.length > 0) {
      // LIMIT/OFFSET 제거 로직 확인
      const hasLimitRemoval = content.includes('LIMIT') && (
        content.includes('replace') || 
        content.includes('slice') ||
        content.includes('limitParamCount')
      );

      if (!hasLimitRemoval) {
        this.issues.push(
          `${filePath}: COUNT 쿼리에서 LIMIT/OFFSET 파라미터 처리 로직이 없습니다.`
        );
      }
    }

    // 새로 추가된 COUNT 쿼리 확인
    if (diff.includes('COUNT(') || diff.includes('count(')) {
      this.warnings.push(
        `${filePath}: 새로 추가된 COUNT 쿼리의 페이지네이션 파라미터 처리를 확인하세요.`
      );
    }
  }

  /**
   * 검증 결과 보고
   */
  reportResults() {
    console.log('\n📊 [SQLValidator] 검증 결과:');

    if (this.issues.length === 0 && this.warnings.length === 0) {
      console.log('✅ 모든 검증을 통과했습니다!');
      return true;
    }

    if (this.issues.length > 0) {
      console.log(`\n❌ 심각한 문제 (${this.issues.length}개):`);
      this.issues.forEach((issue, index) => {
        console.log(`  ${index + 1}. ${issue}`);
      });
    }

    if (this.warnings.length > 0) {
      console.log(`\n⚠️ 개선 권장 사항 (${this.warnings.length}개):`);
      this.warnings.forEach((warning, index) => {
        console.log(`  ${index + 1}. ${warning}`);
      });
    }

    // 심각한 문제가 있으면 커밋 차단
    if (this.issues.length > 0) {
      console.log('\n🚫 심각한 문제로 인해 커밋이 차단되었습니다.');
      console.log('💡 문제를 수정한 후 다시 커밋하세요.');
      return false;
    }

    // 경고만 있으면 커밋 허용하되 알림
    if (this.warnings.length > 0) {
      console.log('\n⚠️ 경고가 있지만 커밋이 허용됩니다.');
      console.log('💡 가능하면 개선 사항을 적용해주세요.');
    }

    return true;
  }
}

// 스크립트 실행
if (require.main === module) {
  const validator = new SQLHandlerValidator();
  const isValid = validator.validateChangedFiles();
  process.exit(isValid ? 0 : 1);
}

module.exports = SQLHandlerValidator;
