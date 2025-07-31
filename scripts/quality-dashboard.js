#!/usr/bin/env node

/**
 * 자동 품질 측정 대시보드
 * 
 * 프로젝트의 코드 품질을 자동으로 측정하고 종합적인 리포트를 생성합니다.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class QualityDashboard {
  constructor() {
    this.report = {
      timestamp: new Date(),
      scores: {},
      details: {},
      recommendations: [],
      totalScore: 0
    };
  }

  /**
   * 전체 품질 측정 실행
   */
  async run() {
    console.log('📊 [QualityDashboard] 코드 품질 측정 시작...\n');

    try {
      this.measureTypeScriptHealth();
      this.measureLintHealth();
      this.measureTestCoverage();
      this.measureSQLSafety();
      this.measureFileStructure();
      this.measurePerformance();
      this.measureDocumentation();
      
      this.calculateTotalScore();
      this.generateRecommendations();
      this.printReport();
      this.saveReport();

      console.log('\n🎉 [QualityDashboard] 품질 측정 완료!');
      
    } catch (error) {
      console.error('❌ [QualityDashboard] 측정 중 오류:', error.message);
    }
  }

  /**
   * TypeScript 건강도 측정
   */
  measureTypeScriptHealth() {
    console.log('🔧 [QualityDashboard] TypeScript 건강도 측정 중...');
    
    try {
      // TypeScript 컴파일 체크
      execSync('npm run type-check', { stdio: 'pipe' });
      this.report.scores.typescript = 100;
      this.report.details.typescript = {
        status: '✅ 모든 타입 검사 통과',
        errors: 0,
        warnings: 0
      };
    } catch (error) {
      const output = error.stdout?.toString() || error.stderr?.toString() || '';
      const errorCount = (output.match(/error TS/g) || []).length;
      const warningCount = (output.match(/warning TS/g) || []).length;
      
      this.report.scores.typescript = Math.max(0, 100 - (errorCount * 10) - (warningCount * 5));
      this.report.details.typescript = {
        status: errorCount > 0 ? '❌ 타입 오류 있음' : '⚠️ 경고 있음',
        errors: errorCount,
        warnings: warningCount
      };

      if (errorCount > 0) {
        this.report.recommendations.push(
          '🔧 TypeScript 타입 오류를 수정하세요 (우선순위: 높음)'
        );
      }
    }
  }

  /**
   * ESLint 건강도 측정
   */
  measureLintHealth() {
    console.log('🔧 [QualityDashboard] ESLint 건강도 측정 중...');
    
    try {
      execSync('npm run lint', { stdio: 'pipe' });
      this.report.scores.lint = 100;
      this.report.details.lint = {
        status: '✅ 모든 린트 검사 통과',
        errors: 0,
        warnings: 0
      };
    } catch (error) {
      const output = error.stdout?.toString() || error.stderr?.toString() || '';
      const errorCount = (output.match(/✖.*error/g) || []).length;
      const warningCount = (output.match(/⚠.*warning/g) || []).length;
      
      this.report.scores.lint = Math.max(0, 100 - (errorCount * 8) - (warningCount * 3));
      this.report.details.lint = {
        status: errorCount > 0 ? '❌ 린트 오류 있음' : '⚠️ 경고 있음',
        errors: errorCount,
        warnings: warningCount
      };

      if (errorCount > 5) {
        this.report.recommendations.push(
          '🔧 ESLint 오류가 많습니다. 코딩 스타일을 개선하세요'
        );
      }
    }
  }

  /**
   * 테스트 커버리지 측정
   */
  measureTestCoverage() {
    console.log('�� [QualityDashboard] 테스트 커버리지 측정 중...');
    
    try {
      // E2E 테스트 파일 개수 확인
      const e2eFiles = this.getFileCount('e2e', '.spec.ts');
      const unitTestFiles = this.getFileCount('src', '.test.ts') + this.getFileCount('src', '.spec.ts');
      const srcFiles = this.getFileCount('src', '.ts') + this.getFileCount('src', '.tsx');
      
      const testRatio = ((e2eFiles + unitTestFiles) / Math.max(1, srcFiles)) * 100;
      this.report.scores.tests = Math.min(100, testRatio * 2); // 가중치 적용
      
      this.report.details.tests = {
        status: testRatio > 30 ? '✅ 양호' : testRatio > 15 ? '⚠️ 보통' : '❌ 부족',
        e2eTests: e2eFiles,
        unitTests: unitTestFiles,
        sourceFiles: srcFiles,
        coverage: `${testRatio.toFixed(1)}%`
      };

      if (testRatio < 20) {
        this.report.recommendations.push(
          '🧪 테스트 커버리지가 낮습니다. E2E 테스트를 추가하세요'
        );
      }
      
    } catch (error) {
      this.report.scores.tests = 0;
      this.report.details.tests = {
        status: '❌ 측정 실패',
        error: error.message
      };
    }
  }

  /**
   * SQL 안전성 측정
   */
  measureSQLSafety() {
    console.log('🛡️ [QualityDashboard] SQL 안전성 측정 중...');
    
    try {
      const handlerFiles = this.findFiles('src/main/ipc', 'Handlers.ts');
      let safetyScore = 100;
      let issues = [];

      for (const file of handlerFiles) {
        const content = fs.readFileSync(file, 'utf8');
        
        // 위험한 패턴 확인
        const directDbPrepare = (content.match(/db\.prepare/g) || []).length;
        const paramValidations = (content.match(/params\.length|QueryBuilder|dbLogger/g) || []).length;
        
        if (directDbPrepare > paramValidations) {
          safetyScore -= 20;
          issues.push(`${path.basename(file)}: 파라미터 검증 부족`);
        }

        // SQL Injection 위험 패턴
        if (content.includes('${') && content.includes('SELECT')) {
          safetyScore -= 30;
          issues.push(`${path.basename(file)}: SQL Injection 위험`);
        }

        // 로깅 부족
        if (!content.includes('console.log') && !content.includes('dbLogger')) {
          safetyScore -= 10;
          issues.push(`${path.basename(file)}: 디버깅 로그 부족`);
        }
      }

      this.report.scores.sqlSafety = Math.max(0, safetyScore);
      this.report.details.sqlSafety = {
        status: safetyScore >= 80 ? '✅ 안전' : safetyScore >= 60 ? '⚠️ 주의' : '❌ 위험',
        handlerFiles: handlerFiles.length,
        issues: issues,
        score: safetyScore
      };

      if (issues.length > 0) {
        this.report.recommendations.push(
          '🛡️ SQL 안전성을 개선하세요. QueryBuilder 사용을 권장합니다'
        );
      }
      
    } catch (error) {
      this.report.scores.sqlSafety = 50;
      this.report.details.sqlSafety = {
        status: '⚠️ 측정 불가',
        error: error.message
      };
    }
  }

  /**
   * 파일 구조 품질 측정
   */
  measureFileStructure() {
    console.log('📁 [QualityDashboard] 파일 구조 측정 중...');
    
    try {
      let structureScore = 100;
      let issues = [];

      // 필수 디렉토리 확인
      const requiredDirs = ['src/components', 'src/types', 'src/utils', 'e2e', 'scripts'];
      const missingDirs = requiredDirs.filter(dir => !fs.existsSync(dir));
      
      structureScore -= missingDirs.length * 10;
      issues.push(...missingDirs.map(dir => `필수 디렉토리 누락: ${dir}`));

      // 파일 명명 규칙 확인
      const componentFiles = this.findFiles('src/components', '.tsx');
      const wrongNamed = componentFiles.filter(file => {
        const basename = path.basename(file, '.tsx');
        return basename[0] !== basename[0].toUpperCase(); // PascalCase 확인
      });

      structureScore -= wrongNamed.length * 5;
      issues.push(...wrongNamed.map(file => `컴포넌트 명명 규칙 위반: ${path.basename(file)}`));

      // 큰 파일 확인 (1000줄 이상)
      const allFiles = [
        ...this.findFiles('src', '.ts'),
        ...this.findFiles('src', '.tsx')
      ];

      const largeFiles = allFiles.filter(file => {
        const content = fs.readFileSync(file, 'utf8');
        return content.split('\n').length > 1000;
      });

      structureScore -= largeFiles.length * 15;
      issues.push(...largeFiles.map(file => `큰 파일 (1000+ 줄): ${path.basename(file)}`));

      this.report.scores.fileStructure = Math.max(0, structureScore);
      this.report.details.fileStructure = {
        status: structureScore >= 80 ? '✅ 양호' : structureScore >= 60 ? '⚠️ 보통' : '❌ 개선 필요',
        issues: issues,
        totalFiles: allFiles.length,
        componentFiles: componentFiles.length
      };

      if (issues.length > 5) {
        this.report.recommendations.push(
          '📁 파일 구조를 개선하세요. 큰 파일은 분할을 고려하세요'
        );
      }
      
    } catch (error) {
      this.report.scores.fileStructure = 70;
      this.report.details.fileStructure = {
        status: '⚠️ 측정 오류',
        error: error.message
      };
    }
  }

  /**
   * 성능 측정
   */
  measurePerformance() {
    console.log('⚡ [QualityDashboard] 성능 지표 측정 중...');
    
    try {
      let performanceScore = 100;
      let issues = [];

      // 번들 크기 추정 (node_modules 제외한 src 폴더 크기)
      const srcSize = this.getDirectorySize('src');
      const sizeInMB = srcSize / (1024 * 1024);
      
      if (sizeInMB > 10) {
        performanceScore -= 20;
        issues.push(`소스 코드 크기가 큽니다: ${sizeInMB.toFixed(2)}MB`);
      }

      // 큰 의존성 확인
      if (fs.existsSync('package.json')) {
        const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
        const depCount = Object.keys(packageJson.dependencies || {}).length + 
                        Object.keys(packageJson.devDependencies || {}).length;
        
        if (depCount > 100) {
          performanceScore -= 15;
          issues.push(`의존성이 많습니다: ${depCount}개`);
        }
      }

      // 메모리 누수 위험 패턴 확인
      const componentFiles = this.findFiles('src/components', '.tsx');
      let memoryLeakRisks = 0;

      for (const file of componentFiles) {
        const content = fs.readFileSync(file, 'utf8');
        
        // useEffect cleanup 누락 확인
        const useEffectCount = (content.match(/useEffect\(/g) || []).length;
        const cleanupCount = (content.match(/return\s*\(\s*\)\s*=>/g) || []).length;
        
        if (useEffectCount > cleanupCount + 1) { // 간단한 휴리스틱
          memoryLeakRisks++;
        }
      }

      performanceScore -= memoryLeakRisks * 10;
      if (memoryLeakRisks > 0) {
        issues.push(`메모리 누수 위험: ${memoryLeakRisks}개 파일`);
      }

      this.report.scores.performance = Math.max(0, performanceScore);
      this.report.details.performance = {
        status: performanceScore >= 80 ? '✅ 양호' : performanceScore >= 60 ? '⚠️ 주의' : '❌ 개선 필요',
        sourceSize: `${sizeInMB.toFixed(2)}MB`,
        memoryLeakRisks: memoryLeakRisks,
        issues: issues
      };

      if (issues.length > 2) {
        this.report.recommendations.push(
          '⚡ 성능 최적화가 필요합니다. 번들 크기와 메모리 사용을 확인하세요'
        );
      }
      
    } catch (error) {
      this.report.scores.performance = 70;
      this.report.details.performance = {
        status: '⚠️ 측정 오류',
        error: error.message
      };
    }
  }

  /**
   * 문서화 품질 측정
   */
  measureDocumentation() {
    console.log('📚 [QualityDashboard] 문서화 품질 측정 중...');
    
    try {
      let docScore = 100;
      let issues = [];

      // 필수 문서 확인
      const requiredDocs = ['README.md', '.cursorrules', 'package.json'];
      const missingDocs = requiredDocs.filter(doc => !fs.existsSync(doc));
      
      docScore -= missingDocs.length * 20;
      issues.push(...missingDocs.map(doc => `필수 문서 누락: ${doc}`));

      // 코드 주석 비율 확인
      const tsFiles = this.findFiles('src', '.ts');
      let totalLines = 0;
      let commentLines = 0;

      for (const file of tsFiles.slice(0, 20)) { // 샘플링
        const content = fs.readFileSync(file, 'utf8');
        const lines = content.split('\n');
        totalLines += lines.length;
        commentLines += lines.filter(line => 
          line.trim().startsWith('//') || 
          line.trim().startsWith('/*') || 
          line.trim().startsWith('*')
        ).length;
      }

      const commentRatio = totalLines > 0 ? (commentLines / totalLines) * 100 : 0;
      
      if (commentRatio < 10) {
        docScore -= 25;
        issues.push(`코드 주석 비율이 낮습니다: ${commentRatio.toFixed(1)}%`);
      }

      // 타입 문서화 확인
      const typeFiles = this.findFiles('src/types', '.ts');
      if (typeFiles.length === 0) {
        docScore -= 20;
        issues.push('타입 정의 파일이 없습니다');
      }

      this.report.scores.documentation = Math.max(0, docScore);
      this.report.details.documentation = {
        status: docScore >= 80 ? '✅ 양호' : docScore >= 60 ? '⚠️ 보통' : '❌ 부족',
        commentRatio: `${commentRatio.toFixed(1)}%`,
        typeFiles: typeFiles.length,
        issues: issues
      };

      if (commentRatio < 15) {
        this.report.recommendations.push(
          '📚 코드 주석을 추가하여 가독성을 높이세요'
        );
      }
      
    } catch (error) {
      this.report.scores.documentation = 50;
      this.report.details.documentation = {
        status: '⚠️ 측정 오류',
        error: error.message
      };
    }
  }

  /**
   * 총점 계산
   */
  calculateTotalScore() {
    const weights = {
      typescript: 0.25,
      lint: 0.15,
      tests: 0.20,
      sqlSafety: 0.20,
      fileStructure: 0.10,
      performance: 0.15,
      documentation: 0.10
    };

    this.report.totalScore = Object.entries(weights).reduce((total, [key, weight]) => {
      return total + (this.report.scores[key] || 0) * weight;
    }, 0);
  }

  /**
   * 권장 사항 생성
   */
  generateRecommendations() {
    const scores = this.report.scores;

    // 가장 낮은 점수 영역에 대한 권장사항
    const sortedScores = Object.entries(scores).sort((a, b) => a[1] - b[1]);
    const worstArea = sortedScores[0];

    if (worstArea[1] < 70) {
      const areaNames = {
        typescript: 'TypeScript 타입 시스템',
        lint: '코딩 스타일',
        tests: '테스트 커버리지',
        sqlSafety: 'SQL 안전성',
        fileStructure: '파일 구조',
        performance: '성능',
        documentation: '문서화'
      };

      this.report.recommendations.unshift(
        `🎯 우선 개선 영역: ${areaNames[worstArea[0]]} (${worstArea[1].toFixed(1)}점)`
      );
    }

    // 총점에 따른 전반적인 권장사항
    if (this.report.totalScore >= 90) {
      this.report.recommendations.unshift('🎉 코드 품질이 우수합니다! 현재 수준을 유지하세요.');
    } else if (this.report.totalScore >= 75) {
      this.report.recommendations.unshift('✅ 코드 품질이 양호합니다. 몇 가지 개선 사항이 있습니다.');
    } else if (this.report.totalScore >= 60) {
      this.report.recommendations.unshift('⚠️ 코드 품질 개선이 필요합니다.');
    } else {
      this.report.recommendations.unshift('🚨 코드 품질이 낮습니다. 즉시 개선이 필요합니다.');
    }
  }

  /**
   * 리포트 출력
   */
  printReport() {
    console.log('\n📊 [QualityDashboard] 코드 품질 리포트');
    console.log('='.repeat(50));
    console.log(`📅 측정 시간: ${this.report.timestamp.toLocaleString('ko-KR')}`);
    console.log(`🏆 총점: ${this.report.totalScore.toFixed(1)}/100`);
    
    console.log('\n📈 영역별 점수:');
    const scoreLabels = {
      typescript: 'TypeScript',
      lint: 'ESLint',
      tests: '테스트',
      sqlSafety: 'SQL 안전성',
      fileStructure: '파일 구조',
      performance: '성능',
      documentation: '문서화'
    };

    Object.entries(this.report.scores).forEach(([key, score]) => {
      const label = scoreLabels[key] || key;
      const bar = '█'.repeat(Math.floor(score / 5)) + '░'.repeat(20 - Math.floor(score / 5));
      console.log(`  ${label.padEnd(12)}: ${score.toFixed(1).padStart(5)}/100 [${bar}]`);
    });

    console.log('\n💡 권장 사항:');
    this.report.recommendations.forEach((rec, index) => {
      console.log(`  ${index + 1}. ${rec}`);
    });
  }

  /**
   * 리포트 파일 저장
   */
  saveReport() {
    const reportContent = {
      ...this.report,
      version: '1.0.0',
      projectName: 'Awarefit CRM'
    };

    // JSON 리포트
    fs.writeFileSync('quality-report.json', JSON.stringify(reportContent, null, 2));
    
    // Markdown 리포트
    const mdContent = this.generateMarkdownReport();
    fs.writeFileSync('QUALITY_REPORT.md', mdContent);
    
    console.log('\n📄 [QualityDashboard] 리포트 저장 완료:');
    console.log('  - quality-report.json (상세 데이터)');
    console.log('  - QUALITY_REPORT.md (요약 리포트)');
  }

  /**
   * 마크다운 리포트 생성
   */
  generateMarkdownReport() {
    const { totalScore, scores, details, recommendations, timestamp } = this.report;
    
    let md = `# 📊 코드 품질 리포트\n\n`;
    md += `**측정 시간**: ${timestamp.toLocaleString('ko-KR')}\n`;
    md += `**총점**: ${totalScore.toFixed(1)}/100\n\n`;

    md += `## 🏆 종합 평가\n\n`;
    if (totalScore >= 90) {
      md += `🎉 **우수** - 코드 품질이 매우 좋습니다!\n\n`;
    } else if (totalScore >= 75) {
      md += `✅ **양호** - 코드 품질이 좋습니다.\n\n`;
    } else if (totalScore >= 60) {
      md += `⚠️ **보통** - 일부 개선이 필요합니다.\n\n`;
    } else {
      md += `🚨 **개선필요** - 코드 품질 향상이 시급합니다.\n\n`;
    }

    md += `## 📈 영역별 상세 점수\n\n`;
    md += `| 영역 | 점수 | 상태 | 세부 사항 |\n`;
    md += `|------|------|------|----------|\n`;

    const areaDetails = {
      typescript: 'TypeScript',
      lint: 'ESLint',
      tests: '테스트 커버리지',
      sqlSafety: 'SQL 안전성',
      fileStructure: '파일 구조',
      performance: '성능',
      documentation: '문서화'
    };

    Object.entries(scores).forEach(([key, score]) => {
      const detail = details[key];
      const status = detail?.status || '측정됨';
      const info = this.getDetailSummary(detail);
      md += `| ${areaDetails[key]} | ${score.toFixed(1)}/100 | ${status} | ${info} |\n`;
    });

    md += `\n## 💡 개선 권장 사항\n\n`;
    recommendations.forEach((rec, index) => {
      md += `${index + 1}. ${rec}\n`;
    });

    md += `\n## 📋 다음 단계\n\n`;
    md += `- [ ] 가장 낮은 점수 영역부터 개선 시작\n`;
    md += `- [ ] 권장 사항 중 우선순위가 높은 항목 적용\n`;
    md += `- [ ] 정기적인 품질 측정 (주 1회 권장)\n`;
    md += `- [ ] 팀과 개선 계획 공유\n\n`;

    md += `---\n`;
    md += `*이 리포트는 \`node scripts/quality-dashboard.js\` 명령어로 생성되었습니다.*\n`;

    return md;
  }

  /**
   * 세부 정보 요약
   */
  getDetailSummary(detail) {
    if (!detail) return '-';
    
    if (detail.errors !== undefined) {
      return `오류: ${detail.errors}개, 경고: ${detail.warnings}개`;
    }
    if (detail.coverage !== undefined) {
      return `커버리지: ${detail.coverage}`;
    }
    if (detail.issues !== undefined) {
      return `이슈: ${detail.issues.length}개`;
    }
    if (detail.sourceSize !== undefined) {
      return `크기: ${detail.sourceSize}`;
    }
    
    return '-';
  }

  /**
   * 유틸리티 함수들
   */
  getFileCount(directory, extension) {
    if (!fs.existsSync(directory)) return 0;
    
    let count = 0;
    const traverse = (dir) => {
      const items = fs.readdirSync(dir);
      for (const item of items) {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory() && !item.startsWith('.')) {
          traverse(fullPath);
        } else if (stat.isFile() && item.endsWith(extension)) {
          count++;
        }
      }
    };
    
    traverse(directory);
    return count;
  }

  findFiles(directory, extension) {
    if (!fs.existsSync(directory)) return [];
    
    const files = [];
    const traverse = (dir) => {
      const items = fs.readdirSync(dir);
      for (const item of items) {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory() && !item.startsWith('.')) {
          traverse(fullPath);
        } else if (stat.isFile() && item.includes(extension)) {
          files.push(fullPath);
        }
      }
    };
    
    traverse(directory);
    return files;
  }

  getDirectorySize(directory) {
    if (!fs.existsSync(directory)) return 0;
    
    let size = 0;
    const traverse = (dir) => {
      const items = fs.readdirSync(dir);
      for (const item of items) {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
          traverse(fullPath);
        } else if (stat.isFile()) {
          size += stat.size;
        }
      }
    };
    
    traverse(directory);
    return size;
  }
}

// 스크립트 실행
if (require.main === module) {
  const dashboard = new QualityDashboard();
  dashboard.run();
}

module.exports = QualityDashboard;
