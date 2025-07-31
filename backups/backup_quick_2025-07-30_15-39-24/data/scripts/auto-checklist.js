#!/usr/bin/env node

/**
 * 자동 체크리스트 생성 스크립트
 * 
 * 코드 변경 사항을 분석해서 검증해야 할 항목들을 자동으로 생성합니다.
 * Git diff를 분석하여 변경된 파일에 따라 맞춤형 체크리스트를 만듭니다.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class AutoChecklistGenerator {
  constructor() {
    this.checklist = [];
    this.changedFiles = [];
    this.gitDiff = '';
  }

  /**
   * Git 변경 사항 분석
   */
  analyzeGitChanges() {
    try {
      // 스테이징된 파일들 가져오기
      const stagedFiles = execSync('git diff --cached --name-only', { encoding: 'utf8' })
        .split('\n')
        .filter(file => file.trim());

      // 스테이징되지 않은 변경 사항도 포함
      const modifiedFiles = execSync('git diff --name-only', { encoding: 'utf8' })
        .split('\n')
        .filter(file => file.trim());

      this.changedFiles = [...new Set([...stagedFiles, ...modifiedFiles])];

      // Git diff 내용 가져오기
      this.gitDiff = execSync('git diff HEAD', { encoding: 'utf8' });

      console.log('🔍 [AutoChecklist] 변경된 파일들:', this.changedFiles);
      
    } catch (error) {
      console.warn('⚠️ [AutoChecklist] Git 정보를 가져올 수 없습니다:', error.message);
      // Git이 없거나 초기화되지 않은 경우, src 폴더의 최근 수정된 파일들 분석
      this.analyzeRecentlyModifiedFiles();
    }
  }

  /**
   * 최근 수정된 파일들 분석 (Git이 없는 경우)
   */
  analyzeRecentlyModifiedFiles() {
    const srcPath = path.join(process.cwd(), 'src');
    if (!fs.existsSync(srcPath)) return;

    const getRecentFiles = (dir, files = []) => {
      const items = fs.readdirSync(dir);
      
      for (const item of items) {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory() && !item.startsWith('.')) {
          getRecentFiles(fullPath, files);
        } else if (stat.isFile() && /\.(ts|tsx|js|jsx)$/.test(item)) {
          const relativePath = path.relative(process.cwd(), fullPath);
          files.push({ path: relativePath, mtime: stat.mtime });
        }
      }
      
      return files;
    };

    const allFiles = getRecentFiles(srcPath);
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    
    this.changedFiles = allFiles
      .filter(file => file.mtime > oneHourAgo)
      .map(file => file.path);

    console.log('�� [AutoChecklist] 최근 1시간 내 수정된 파일들:', this.changedFiles);
  }

  /**
   * SQL 관련 변경 사항 확인
   */
  checkSQLChanges() {
    const sqlFiles = this.changedFiles.filter(file => 
      file.includes('ipc/') && file.includes('Handlers.ts')
    );

    if (sqlFiles.length > 0) {
      this.addChecklistItem('🛡️ SQL 안전성 검증', [
        'QueryBuilder 패턴 사용 확인',
        '파라미터 개수 검증 로직 포함',
        '디버깅 로그 추가 확인',
        'COUNT 쿼리 파라미터 처리 검증',
        '페이지네이션 로직 테스트',
        'SQL injection 방지 확인'
      ]);

      // Git diff에서 SQL 관련 위험 패턴 검사
      if (this.gitDiff.includes('db.prepare') && !this.gitDiff.includes('params.length')) {
        this.addWarning('⚠️ db.prepare() 사용 시 파라미터 검증 로직이 없습니다!');
      }

      if (this.gitDiff.includes('COUNT(*)') || this.gitDiff.includes('count(*)')) {
        this.addChecklistItem('🔢 COUNT 쿼리 검증', [
          'LIMIT/OFFSET 파라미터 제외 확인',
          '페이지네이션 파라미터 개수 정확성 검증'
        ]);
      }
    }
  }

  /**
   * 프론트엔드 필터 변경 사항 확인
   */
  checkFilterChanges() {
    const filterFiles = this.changedFiles.filter(file => 
      file.includes('SearchFilter.tsx') || file.includes('Filter')
    );

    if (filterFiles.length > 0) {
      this.addChecklistItem('🔍 필터 기능 검증', [
        '프리셋 버튼 동작 확인',
        '날짜 범위 필터 정확성 검증',
        '필터 값 전달 과정 확인',
        '필터 초기화 기능 테스트',
        'URL 파라미터 동기화 확인'
      ]);

      // 프리셋 관련 변경사항 체크
      if (this.gitDiff.includes('filterPresets') || this.gitDiff.includes('preset')) {
        this.addChecklistItem('🎯 프리셋 기능 검증', [
          '새로운 프리셋 버튼 표시 확인',
          '프리셋 클릭 시 정확한 필터 적용',
          '프리셋 간 전환 테스트',
          '프리셋 활성 상태 표시 확인'
        ]);
      }
    }
  }

  /**
   * API 변경 사항 확인
   */
  checkAPIChanges() {
    const apiFiles = this.changedFiles.filter(file => 
      file.includes('ipc/') || file.includes('preload.ts') || file.includes('electronAPI')
    );

    if (apiFiles.length > 0) {
      this.addChecklistItem('🔗 API 연동 검증', [
        'API 함수 존재 여부 확인',
        '에러 처리 로직 검증',
        '타입 정의 일치성 확인',
        'preload.ts에 API 노출 확인',
        '프론트엔드에서 API 호출 테스트'
      ]);
    }
  }

  /**
   * 컴포넌트 변경 사항 확인
   */
  checkComponentChanges() {
    const componentFiles = this.changedFiles.filter(file => 
      file.includes('components/') && (file.endsWith('.tsx') || file.endsWith('.ts'))
    );

    if (componentFiles.length > 0) {
      this.addChecklistItem('🎨 UI 컴포넌트 검증', [
        '컴포넌트 렌더링 확인',
        '프롭스 전달 정확성 검증',
        '이벤트 핸들러 동작 확인',
        '스타일링 적용 확인',
        '반응형 디자인 테스트'
      ]);

      // 폼 관련 변경사항
      if (componentFiles.some(file => file.includes('Form'))) {
        this.addChecklistItem('📝 폼 기능 검증', [
          '입력 필드 유효성 검사',
          '필수 필드 검증',
          '제출 시 데이터 변환 확인',
          '에러 메시지 표시 확인',
          '성공 시 피드백 확인'
        ]);
      }

      // 테이블 관련 변경사항
      if (componentFiles.some(file => file.includes('Table'))) {
        this.addChecklistItem('📊 테이블 기능 검증', [
          '데이터 로딩 및 표시 확인',
          '정렬 기능 동작 확인',
          '페이지네이션 동작 확인',
          '선택 기능 (체크박스) 확인',
          '액션 버튼들 동작 확인'
        ]);
      }
    }
  }

  /**
   * 테스트 파일 변경 사항 확인
   */
  checkTestChanges() {
    const testFiles = this.changedFiles.filter(file => 
      file.includes('e2e/') || file.includes('__tests__/') || file.includes('.spec.') || file.includes('.test.')
    );

    const hasCodeChanges = this.changedFiles.some(file => 
      file.includes('src/') && !file.includes('__tests__/')
    );

    if (hasCodeChanges && testFiles.length === 0) {
      this.addWarning('⚠️ 코드가 변경되었지만 테스트 파일이 업데이트되지 않았습니다!');
      this.addChecklistItem('🧪 테스트 업데이트 필요', [
        'E2E 테스트 케이스 추가/수정',
        '단위 테스트 업데이트',
        '기존 테스트 실행 및 통과 확인',
        '새로운 기능에 대한 테스트 작성'
      ]);
    }

    if (testFiles.length > 0) {
      this.addChecklistItem('🧪 테스트 실행 검증', [
        '수정된 테스트 케이스 실행',
        '전체 테스트 스위트 실행',
        '테스트 커버리지 확인',
        'CI/CD 파이프라인 통과 확인'
      ]);
    }
  }

  /**
   * 타입 정의 변경 사항 확인
   */
  checkTypeChanges() {
    const typeFiles = this.changedFiles.filter(file => 
      file.includes('types/') || file.includes('.d.ts')
    );

    if (typeFiles.length > 0) {
      this.addChecklistItem('📏 타입 정의 검증', [
        'TypeScript 컴파일 오류 확인',
        '타입 호환성 검증',
        '인터페이스 구현 완성도 확인',
        '제네릭 타입 정확성 검증'
      ]);
    }
  }

  /**
   * 필수 검증 항목 추가
   */
  addMandatoryChecks() {
    this.addChecklistItem('🔧 기본 검증 (필수)', [
      'npm run type-check 통과',
      'npm run lint 통과',
      '콘솔에 오류 메시지 없음',
      '기능 수동 테스트 완료'
    ]);

    if (this.changedFiles.length > 0) {
      this.addChecklistItem('🎯 기능별 검증', [
        '변경된 기능 정상 동작 확인',
        '기존 기능에 영향 없음 확인',
        '에러 케이스 처리 확인',
        '사용자 경험 체크'
      ]);
    }
  }

  /**
   * 체크리스트 항목 추가
   */
  addChecklistItem(title, items) {
    this.checklist.push({
      type: 'section',
      title,
      items: items.map(item => `- [ ] ${item}`)
    });
  }

  /**
   * 경고 메시지 추가
   */
  addWarning(message) {
    this.checklist.push({
      type: 'warning',
      message
    });
  }

  /**
   * 체크리스트 파일 생성
   */
  generateChecklistFile() {
    const timestamp = new Date().toLocaleString('ko-KR');
    let content = `# 🔍 자동 생성된 검증 체크리스트\n\n`;
    content += `**생성 시간**: ${timestamp}\n`;
    content += `**변경된 파일**: ${this.changedFiles.length}개\n\n`;

    if (this.changedFiles.length > 0) {
      content += `## 📁 변경된 파일 목록\n\n`;
      this.changedFiles.forEach(file => {
        content += `- \`${file}\`\n`;
      });
      content += `\n`;
    }

    // 경고 메시지들 먼저 표시
    const warnings = this.checklist.filter(item => item.type === 'warning');
    if (warnings.length > 0) {
      content += `## ⚠️ 주의사항\n\n`;
      warnings.forEach(warning => {
        content += `${warning.message}\n\n`;
      });
    }

    // 체크리스트 섹션들
    const sections = this.checklist.filter(item => item.type === 'section');
    sections.forEach(section => {
      content += `## ${section.title}\n\n`;
      section.items.forEach(item => {
        content += `${item}\n`;
      });
      content += `\n`;
    });

    // 추가 정보
    content += `---\n\n`;
    content += `## 📋 검증 완료 후 체크사항\n\n`;
    content += `- [ ] 모든 항목이 완료되었습니다\n`;
    content += `- [ ] 추가 테스트가 필요한 부분이 있다면 기록했습니다\n`;
    content += `- [ ] 팀원과 공유가 필요한 변경사항이 있다면 정리했습니다\n\n`;
    
    content += `> 💡 **팁**: 이 체크리스트는 \`node scripts/auto-checklist.js\` 명령어로 언제든 재생성할 수 있습니다.\n`;

    fs.writeFileSync('CHECKLIST.md', content);
    console.log('✅ [AutoChecklist] 자동 체크리스트 생성 완료: CHECKLIST.md');
    
    // 간단한 요약 출력
    console.log(`\n📊 [AutoChecklist] 요약:`);
    console.log(`- 변경된 파일: ${this.changedFiles.length}개`);
    console.log(`- 검증 섹션: ${sections.length}개`);
    console.log(`- 경고 메시지: ${warnings.length}개`);

    if (warnings.length > 0) {
      console.log(`\n⚠️ [AutoChecklist] 중요한 주의사항이 있습니다. CHECKLIST.md를 확인하세요!`);
    }
  }

  /**
   * 메인 실행 함수
   */
  run() {
    console.log('🤖 [AutoChecklist] 자동 체크리스트 생성 시작...\n');

    this.analyzeGitChanges();
    this.checkSQLChanges();
    this.checkFilterChanges();
    this.checkAPIChanges();
    this.checkComponentChanges();
    this.checkTestChanges();
    this.checkTypeChanges();
    this.addMandatoryChecks();
    this.generateChecklistFile();

    console.log('\n🎉 [AutoChecklist] 체크리스트 생성 완료!');
  }
}

// 스크립트 실행
if (require.main === module) {
  const generator = new AutoChecklistGenerator();
  generator.run();
}

module.exports = AutoChecklistGenerator;
