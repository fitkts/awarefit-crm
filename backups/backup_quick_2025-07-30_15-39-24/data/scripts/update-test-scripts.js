#!/usr/bin/env node

/**
 * 테스트 스크립트 자동 업데이트 도구
 * 
 * 모든 테스트 스크립트에서 중복된 runTest, runAsyncTest 함수를
 * 새로운 TestFramework로 자동 변환합니다.
 */

const fs = require('fs');
const path = require('path');

class TestScriptUpdater {
  constructor() {
    this.scriptsToUpdate = [
      'scripts/test-dashboard-features.js',
      'scripts/test-staff-features.js', 
      'scripts/test-payment-features.js'
    ];
    this.backupDir = 'scripts/backup';
    this.results = [];
  }

  /**
   * 백업 디렉토리 생성
   */
  createBackupDir() {
    if (!fs.existsSync(this.backupDir)) {
      fs.mkdirSync(this.backupDir, { recursive: true });
      console.log(`📁 백업 디렉토리 생성: ${this.backupDir}`);
    }
  }

  /**
   * 파일 백업
   */
  backupFile(filePath) {
    const fileName = path.basename(filePath);
    const backupPath = path.join(this.backupDir, `${fileName}.backup`);
    
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      fs.writeFileSync(backupPath, content);
      console.log(`💾 백업 완료: ${fileName} -> ${backupPath}`);
      return true;
    } catch (error) {
      console.error(`❌ 백업 실패: ${fileName} - ${error.message}`);
      return false;
    }
  }

  /**
   * 파일 변환
   */
  transformFile(filePath) {
    try {
      let content = fs.readFileSync(filePath, 'utf8');
      const originalContent = content;
      
      // TestFramework 로드 코드 추가
      const frameworkLoader = `
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
`;

      // 기존 변수 선언 및 함수 제거
      content = content.replace(/\s*let totalTests = 0;\s*let passedTests = 0;\s*let failedTests = 0;\s*/g, '');
      
      // runTest 함수 제거
      content = content.replace(/\s*function runTest\(testName, testFn\) \{[\s\S]*?\}\s*/g, '');
      
      // runAsyncTest 함수 제거  
      content = content.replace(/\s*function runAsyncTest\(testName, testFn\) \{[\s\S]*?\}\s*/g, '');

      // IIFE 시작 부분 찾아서 TestFramework 로드 코드 삽입
      content = content.replace(
        /(\(function \(\) \{[\s\S]*?console\.log\('.*?'\);[\s\S]*?console\.log\('='.repeat\(50\)\);)/,
        `$1

  // TestFramework 인스턴스 생성
  const tester = new TestFramework('${this.getTestSuiteName(filePath)}');`
      );

      // TestFramework 로드 코드를 파일 상단에 추가
      content = content.replace(
        /(\*\/\s*\n)(\(function \(\) \{)/,
        `$1
${frameworkLoader}
$2`
      );

      // runTest 호출을 tester.runTest로 변경
      content = content.replace(/runTest\(/g, 'tester.runTest(');
      
      // runAsyncTest 호출을 tester.runAsyncTest로 변경
      content = content.replace(/runAsyncTest\(/g, 'tester.runAsyncTest(');

      // console.log 그룹 시작을 tester.startGroup으로 변경
      content = content.replace(
        /console\.log\('\\n([^']+)'\);\s*console\.log\('-'\.repeat\(\d+\)\);/g,
        (match, groupName) => `tester.startGroup('${groupName.trim()}');`
      );

      // 결과 요약 부분을 tester.printSummary로 변경
      content = this.replaceSummarySection(content);

      // 변경사항이 있는지 확인
      if (content !== originalContent) {
        fs.writeFileSync(filePath, content);
        console.log(`✅ 변환 완료: ${path.basename(filePath)}`);
        return { success: true, changes: true };
      } else {
        console.log(`⚠️ 변경사항 없음: ${path.basename(filePath)}`);
        return { success: true, changes: false };
      }

    } catch (error) {
      console.error(`❌ 변환 실패: ${path.basename(filePath)} - ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  /**
   * 파일명에 따른 테스트 스위트 이름 결정
   */
  getTestSuiteName(filePath) {
    const fileName = path.basename(filePath, '.js');
    
    if (fileName.includes('dashboard')) return '대시보드 페이지';
    if (fileName.includes('staff')) return '직원관리 페이지';
    if (fileName.includes('payment')) return '결제관리 페이지';
    if (fileName.includes('member')) return '회원관리 페이지';
    
    return fileName.replace('test-', '').replace('-features', '') + ' 테스트';
  }

  /**
   * 결과 요약 섹션 교체
   */
  replaceSummarySection(content) {
    // 복잡한 결과 요약 로직을 간단한 tester.printSummary 호출로 교체
    const summaryPattern = /setTimeout\(\(\) => \{[\s\S]*?console\.log\(.+='.repeat\(50\).*?\);[\s\S]*?console\.log\(.*테스트 결과.*?\);[\s\S]*?console\.log\(.+='.repeat\(50\).*?\);[\s\S]*?\}, \d+\)/;
    
    if (summaryPattern.test(content)) {
      content = content.replace(
        summaryPattern,
        `setTimeout(() => {
        const summary = tester.printSummary({
          showDetails: true,
          showTiming: true,
          showRecommendations: true
        });
        
        // 페이지별 특화 권장사항은 기존 로직 유지
        console.log('\\n📚 추가 권장사항 및 팁은 기존 로직을 참고하세요.');
        console.log('🎯 테스트 완료!');
      }, 1000)`
      );
    }

    return content;
  }

  /**
   * 단일 파일 업데이트
   */
  updateSingleFile(filePath) {
    console.log(`\n🔄 ${path.basename(filePath)} 업데이트 중...`);
    
    // 파일 존재 확인
    if (!fs.existsSync(filePath)) {
      console.log(`❌ 파일을 찾을 수 없습니다: ${filePath}`);
      return { success: false, error: 'File not found' };
    }

    // 백업 생성
    if (!this.backupFile(filePath)) {
      return { success: false, error: 'Backup failed' };
    }

    // 파일 변환
    const result = this.transformFile(filePath);
    
    this.results.push({
      file: path.basename(filePath),
      ...result
    });

    return result;
  }

  /**
   * 모든 파일 업데이트
   */
  updateAllFiles() {
    console.log('🚀 테스트 스크립트 자동 업데이트 시작\n');
    
    this.createBackupDir();

    for (const filePath of this.scriptsToUpdate) {
      this.updateSingleFile(filePath);
    }

    this.printSummary();
  }

  /**
   * 결과 요약 출력
   */
  printSummary() {
    console.log('\n' + '='.repeat(50));
    console.log('📊 업데이트 결과 요약');
    console.log('='.repeat(50));

    const successful = this.results.filter(r => r.success).length;
    const withChanges = this.results.filter(r => r.success && r.changes).length;
    const failed = this.results.filter(r => !r.success).length;

    console.log(`총 파일: ${this.results.length}개`);
    console.log(`성공: ${successful}개`);
    console.log(`변경됨: ${withChanges}개`);
    console.log(`실패: ${failed}개`);

    if (withChanges > 0) {
      console.log('\n✅ 업데이트된 파일들:');
      this.results
        .filter(r => r.success && r.changes)
        .forEach(r => console.log(`  - ${r.file}`));
    }

    if (failed > 0) {
      console.log('\n❌ 실패한 파일들:');
      this.results
        .filter(r => !r.success)
        .forEach(r => console.log(`  - ${r.file}: ${r.error}`));
    }

    console.log('\n💡 다음 단계:');
    console.log('1. 업데이트된 파일들을 수동으로 검토하세요');
    console.log('2. 테스트 스크립트를 실행해서 정상 작동하는지 확인하세요');
    console.log('3. 문제가 있으면 scripts/backup/ 폴더의 백업 파일을 사용하세요');

    // 사용법 안내
    console.log('\n🧪 새로운 TestFramework 사용법:');
    console.log('- 통합된 테스트 실행 인터페이스');
    console.log('- 자동 성능 측정 및 결과 분석');
    console.log('- 환경 감지 및 맞춤형 피드백');
    console.log('- 일관된 오류 처리 및 리포팅');

    console.log('\n🎉 테스트 스크립트 중복 제거 완료!');
  }

  /**
   * 롤백 기능
   */
  rollback(fileName) {
    const filePath = `scripts/${fileName}`;
    const backupPath = `${this.backupDir}/${fileName}.backup`;

    if (!fs.existsSync(backupPath)) {
      console.log(`❌ 백업 파일을 찾을 수 없습니다: ${backupPath}`);
      return false;
    }

    try {
      const backupContent = fs.readFileSync(backupPath, 'utf8');
      fs.writeFileSync(filePath, backupContent);
      console.log(`✅ 롤백 완료: ${fileName}`);
      return true;
    } catch (error) {
      console.error(`❌ 롤백 실패: ${fileName} - ${error.message}`);
      return false;
    }
  }
}

// 스크립트 실행
if (require.main === module) {
  const updater = new TestScriptUpdater();
  
  // 명령행 인수 처리
  const args = process.argv.slice(2);
  
  if (args.includes('--rollback')) {
    const fileName = args[args.indexOf('--rollback') + 1];
    if (fileName) {
      updater.rollback(fileName);
    } else {
      console.log('❌ 롤백할 파일명을 지정하세요: --rollback <filename>');
    }
  } else if (args.includes('--file')) {
    const fileName = args[args.indexOf('--file') + 1];
    if (fileName) {
      updater.updateSingleFile(`scripts/${fileName}`);
    } else {
      console.log('❌ 업데이트할 파일명을 지정하세요: --file <filename>');
    }
  } else {
    updater.updateAllFiles();
  }
}

module.exports = TestScriptUpdater; 