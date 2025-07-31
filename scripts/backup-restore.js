#!/usr/bin/env node

/**
 * 🗄️ Awarefit CRM 자동 백업 및 복원 시스템
 * 
 * 프로젝트의 모든 중요한 데이터와 파일을 안전하게 백업하고,
 * 필요시 쉽게 복원할 수 있는 종합 시스템입니다.
 * 
 * 비개발자도 안심하고 사용할 수 있도록 설계되었습니다.
 * 
 * 사용법:
 * npm run backup        # 전체 백업
 * npm run backup:quick  # 빠른 백업 (코드만)
 * npm run restore       # 대화형 복원
 * node scripts/backup-restore.js --help
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const readline = require('readline');

class BackupRestoreSystem {
  constructor() {
    this.backupDir = 'backups';
    this.tempDir = 'temp-backup';
    this.configFile = 'backup-config.json';
    this.logFile = 'backup.log';
    
    this.defaultConfig = {
      version: '1.0.0',
      auto_backup: {
        enabled: true,
        interval: 'daily',
        keep_count: 7,
        include_node_modules: false
      },
      backup_paths: {
        critical: [
          'src/',
          'scripts/',
          'e2e/',
          'docs/',
          'package.json',
          'package-lock.json',
          'tsconfig.json',
          'webpack.config.js',
          'playwright.config.ts',
          '.cursorrules',
          '.gitignore',
          '.husky/'
        ],
        important: [
          'public/',
          'commitlint.config.js',
          'jest.config.js',
          'postcss.config.js',
          'tailwind.config.js',
          'env.example'
        ],
        optional: [
          'README.md',
          'CHANGELOG.md',
          'LICENSE',
          '.vscode/',
          '.github/'
        ]
      },
      exclude_patterns: [
        'node_modules/',
        'dist/',
        'build/',
        '.git/',
        'backups/',
        'temp-backup/',
        '*.log',
        '.DS_Store',
        'Thumbs.db',
        '*.tmp',
        '*.cache'
      ]
    };

    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
  }

  /**
   * 메인 실행 함수
   */
  async run() {
    const args = process.argv.slice(2);
    
    try {
      if (args.includes('--help') || args.includes('-h')) {
        this.showHelp();
        return;
      }

      await this.initializeSystem();

      if (args.includes('--backup') || args.includes('-b')) {
        await this.createBackup('full');
      } else if (args.includes('--backup-quick') || args.includes('-q')) {
        await this.createBackup('quick');
      } else if (args.includes('--restore') || args.includes('-r')) {
        await this.interactiveRestore();
      } else if (args.includes('--list') || args.includes('-l')) {
        await this.listBackups();
      } else if (args.includes('--cleanup')) {
        await this.cleanupOldBackups();
      } else if (args.includes('--auto-setup')) {
        await this.setupAutomaticBackup();
      } else {
        // 대화형 메뉴
        await this.showInteractiveMenu();
      }
    } catch (error) {
      this.logError('시스템 실행 중 오류', error);
      console.error('❌ 오류가 발생했습니다:', error.message);
    } finally {
      this.rl.close();
    }
  }

  /**
   * 시스템 초기화
   */
  async initializeSystem() {
    console.log('🗄️ 백업 시스템 초기화 중...');

    // 백업 디렉토리 생성
    if (!fs.existsSync(this.backupDir)) {
      fs.mkdirSync(this.backupDir, { recursive: true });
      console.log(`📁 백업 디렉토리 생성: ${this.backupDir}/`);
    }

    // 설정 파일 생성 또는 로드
    await this.loadOrCreateConfig();

    // 임시 디렉토리 정리
    if (fs.existsSync(this.tempDir)) {
      fs.rmSync(this.tempDir, { recursive: true, force: true });
    }

    console.log('✅ 시스템 초기화 완료\n');
  }

  /**
   * 설정 파일 로드 또는 생성
   */
  async loadOrCreateConfig() {
    if (fs.existsSync(this.configFile)) {
      try {
        const configData = fs.readFileSync(this.configFile, 'utf8');
        this.config = { ...this.defaultConfig, ...JSON.parse(configData) };
        console.log('📋 기존 설정 파일 로드됨');
      } catch (error) {
        console.log('⚠️ 설정 파일 오류, 기본 설정 사용');
        this.config = this.defaultConfig;
      }
    } else {
      this.config = this.defaultConfig;
      this.saveConfig();
      console.log('📋 새 설정 파일 생성됨');
    }
  }

  /**
   * 설정 파일 저장
   */
  saveConfig() {
    fs.writeFileSync(this.configFile, JSON.stringify(this.config, null, 2));
  }

  /**
   * 대화형 메뉴
   */
  async showInteractiveMenu() {
    console.log('🗄️ Awarefit CRM 백업 시스템');
    console.log('='.repeat(40));
    console.log('1. 📦 전체 백업 생성');
    console.log('2. ⚡ 빠른 백업 (코드만)');
    console.log('3. 📂 백업 목록 보기');
    console.log('4. 🔄 백업 복원');
    console.log('5. 🧹 오래된 백업 정리');
    console.log('6. ⚙️ 자동 백업 설정');
    console.log('7. ❓ 도움말');
    console.log('0. 🚪 종료');
    console.log('');

    const choice = await this.askQuestion('선택하세요 (0-7): ');

    switch (choice.trim()) {
      case '1':
        await this.createBackup('full');
        break;
      case '2':
        await this.createBackup('quick');
        break;
      case '3':
        await this.listBackups();
        break;
      case '4':
        await this.interactiveRestore();
        break;
      case '5':
        await this.cleanupOldBackups();
        break;
      case '6':
        await this.setupAutomaticBackup();
        break;
      case '7':
        this.showHelp();
        break;
      case '0':
        console.log('👋 백업 시스템을 종료합니다.');
        return;
      default:
        console.log('❌ 잘못된 선택입니다.');
        await this.showInteractiveMenu();
    }
  }

  /**
   * 백업 생성
   */
  async createBackup(type = 'full') {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0] + '_' + 
                     new Date().toTimeString().split(' ')[0].replace(/:/g, '-');
    const backupName = `backup_${type}_${timestamp}`;
    const backupPath = path.join(this.backupDir, backupName);

    console.log(`\n📦 ${type === 'full' ? '전체' : '빠른'} 백업 시작...`);
    console.log(`📅 시간: ${new Date().toLocaleString('ko-KR')}`);
    console.log(`📁 저장 위치: ${backupPath}`);
    console.log('');

    const startTime = Date.now();

    try {
      // 백업 디렉토리 생성
      fs.mkdirSync(backupPath, { recursive: true });

      // 백업 메타데이터 생성
      const metadata = await this.createBackupMetadata(type);
      fs.writeFileSync(
        path.join(backupPath, 'backup-info.json'),
        JSON.stringify(metadata, null, 2)
      );

      // 파일 백업 실행
      const stats = await this.performBackup(backupPath, type);

      // 백업 완료 정보
      const duration = Date.now() - startTime;
      const completionInfo = {
        ...metadata,
        completion_time: new Date().toISOString(),
        duration_ms: duration,
        stats: stats,
        status: 'completed'
      };

      fs.writeFileSync(
        path.join(backupPath, 'backup-info.json'),
        JSON.stringify(completionInfo, null, 2)
      );

      // 결과 출력
      console.log('\n✅ 백업 완료!');
      console.log('📊 백업 통계:');
      console.log(`  📁 디렉토리: ${stats.directories}개`);
      console.log(`  📄 파일: ${stats.files}개`);
      console.log(`  💾 크기: ${this.formatFileSize(stats.totalSize)}`);
      console.log(`  ⏱️ 소요시간: ${(duration / 1000).toFixed(1)}초`);
      console.log(`  📍 위치: ${backupPath}`);

      // 로그 기록
      this.logBackup(backupName, stats, duration);

      // 자동 정리 (설정에 따라)
      if (this.config.auto_backup.enabled) {
        await this.autoCleanupOldBackups();
      }

    } catch (error) {
      // 실패한 백업 디렉토리 정리
      if (fs.existsSync(backupPath)) {
        fs.rmSync(backupPath, { recursive: true, force: true });
      }
      
      this.logError('백업 생성 실패', error);
      throw error;
    }
  }

  /**
   * 백업 메타데이터 생성
   */
  async createBackupMetadata(type) {
    // Git 정보 가져오기
    let gitInfo = {};
    try {
      gitInfo = {
        branch: execSync('git branch --show-current', { encoding: 'utf8' }).trim(),
        commit: execSync('git rev-parse HEAD', { encoding: 'utf8' }).trim(),
        status: execSync('git status --porcelain', { encoding: 'utf8' }).trim()
      };
    } catch {
      gitInfo = { note: 'Git 정보를 가져올 수 없음' };
    }

    // 프로젝트 정보
    let projectInfo = {};
    try {
      const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
      projectInfo = {
        name: packageJson.name,
        version: packageJson.version,
        description: packageJson.description
      };
    } catch {
      projectInfo = { note: 'package.json을 읽을 수 없음' };
    }

    return {
      backup_name: path.basename(arguments[0] || ''),
      backup_type: type,
      created_at: new Date().toISOString(),
      created_by: 'Backup System v1.0',
      project_info: projectInfo,
      git_info: gitInfo,
      system_info: {
        platform: process.platform,
        node_version: process.version,
        cwd: process.cwd()
      },
      config_used: this.config
    };
  }

  /**
   * 실제 백업 수행
   */
  async performBackup(backupPath, type) {
    const stats = { directories: 0, files: 0, totalSize: 0 };
    
    // 백업할 경로 결정
    const pathsToBackup = type === 'quick' 
      ? this.config.backup_paths.critical
      : [...this.config.backup_paths.critical, ...this.config.backup_paths.important, ...this.config.backup_paths.optional];

    console.log('📂 백업 중인 파일들:');
    
    for (const itemPath of pathsToBackup) {
      if (fs.existsSync(itemPath)) {
        const relativePath = itemPath;
        const targetPath = path.join(backupPath, 'data', relativePath);
        
        await this.copyItem(itemPath, targetPath, stats);
        console.log(`  ✅ ${relativePath}`);
      } else {
        console.log(`  ⚠️ ${itemPath} (존재하지 않음)`);
      }
    }

    // 특별 항목 백업
    await this.backupSpecialItems(backupPath, stats);

    return stats;
  }

  /**
   * 항목 복사 (재귀적)
   */
  async copyItem(source, target, stats) {
    const sourceStat = fs.statSync(source);

    if (sourceStat.isDirectory()) {
      // 제외 패턴 확인
      if (this.shouldExclude(source)) {
        return;
      }

      stats.directories++;
      fs.mkdirSync(target, { recursive: true });

      const items = fs.readdirSync(source);
      for (const item of items) {
        await this.copyItem(
          path.join(source, item),
          path.join(target, item),
          stats
        );
      }
    } else {
      // 제외 패턴 확인
      if (this.shouldExclude(source)) {
        return;
      }

      stats.files++;
      stats.totalSize += sourceStat.size;

      // 디렉토리 생성
      fs.mkdirSync(path.dirname(target), { recursive: true });
      
      // 파일 복사
      fs.copyFileSync(source, target);
    }
  }

  /**
   * 제외 패턴 확인
   */
  shouldExclude(filePath) {
    const normalizedPath = filePath.replace(/\\/g, '/');
    
    return this.config.exclude_patterns.some(pattern => {
      if (pattern.endsWith('/')) {
        return normalizedPath.includes(pattern);
      } else {
        return normalizedPath.includes(pattern) || 
               path.basename(normalizedPath) === pattern;
      }
    });
  }

  /**
   * 특별 항목 백업 (로그, 설정 등)
   */
  async backupSpecialItems(backupPath, stats) {
    const specialDir = path.join(backupPath, 'special');
    fs.mkdirSync(specialDir, { recursive: true });

    // 현재 헬스체크 상태
    try {
      if (fs.existsSync('HEALTH_REPORT.json')) {
        fs.copyFileSync('HEALTH_REPORT.json', path.join(specialDir, 'health-report.json'));
        stats.files++;
      }
    } catch (error) {
      console.log('  ⚠️ 헬스리포트 백업 실패');
    }

    // 백업 로그
    try {
      if (fs.existsSync(this.logFile)) {
        fs.copyFileSync(this.logFile, path.join(specialDir, 'backup-history.log'));
        stats.files++;
      }
    } catch (error) {
      console.log('  ⚠️ 백업 로그 백업 실패');
    }

    // Git 상태 정보
    try {
      const gitStatus = execSync('git status', { encoding: 'utf8' });
      fs.writeFileSync(path.join(specialDir, 'git-status.txt'), gitStatus);
      stats.files++;
    } catch (error) {
      console.log('  ⚠️ Git 상태 백업 실패');
    }

    // 설치된 패키지 리스트
    try {
      const npmList = execSync('npm list --depth=0', { encoding: 'utf8' });
      fs.writeFileSync(path.join(specialDir, 'npm-packages.txt'), npmList);
      stats.files++;
    } catch (error) {
      console.log('  ⚠️ npm 패키지 리스트 백업 실패');
    }
  }

  /**
   * 백업 목록 조회
   */
  async listBackups() {
    console.log('\n📂 백업 목록');
    console.log('='.repeat(60));

    if (!fs.existsSync(this.backupDir)) {
      console.log('📭 백업이 없습니다.');
      return;
    }

    const backups = fs.readdirSync(this.backupDir)
      .filter(item => fs.statSync(path.join(this.backupDir, item)).isDirectory())
      .sort((a, b) => b.localeCompare(a)); // 최신순 정렬

    if (backups.length === 0) {
      console.log('📭 백업이 없습니다.');
      return;
    }

    console.log(`총 ${backups.length}개의 백업이 있습니다:\n`);

    for (let i = 0; i < backups.length; i++) {
      const backup = backups[i];
      const backupPath = path.join(this.backupDir, backup);
      const infoPath = path.join(backupPath, 'backup-info.json');

      let info = { backup_type: '알 수 없음', created_at: '날짜 없음' };
      if (fs.existsSync(infoPath)) {
        try {
          info = JSON.parse(fs.readFileSync(infoPath, 'utf8'));
        } catch (error) {
          console.log(`⚠️ ${backup}: 정보 파일 읽기 실패`);
        }
      }

      const size = this.getDirectorySize(backupPath);
      const date = new Date(info.created_at).toLocaleString('ko-KR');
      const type = info.backup_type === 'full' ? '전체' : '빠른';
      
      console.log(`${(i + 1).toString().padStart(2)}. 📦 ${backup}`);
      console.log(`    📅 생성일: ${date}`);
      console.log(`    📝 타입: ${type} 백업`);
      console.log(`    💾 크기: ${this.formatFileSize(size)}`);
      
      if (info.stats) {
        console.log(`    📊 파일: ${info.stats.files}개, 디렉토리: ${info.stats.directories}개`);
      }
      
      if (info.git_info && info.git_info.branch) {
        console.log(`    🌿 Git 브랜치: ${info.git_info.branch}`);
      }
      
      console.log('');
    }

    // 디스크 사용량 정보
    const totalSize = this.getDirectorySize(this.backupDir);
    console.log(`💽 총 백업 크기: ${this.formatFileSize(totalSize)}`);
  }

  /**
   * 대화형 복원
   */
  async interactiveRestore() {
    console.log('\n🔄 백업 복원');
    console.log('='.repeat(40));

    // 백업 목록 표시
    await this.listBackups();

    const backups = fs.readdirSync(this.backupDir)
      .filter(item => fs.statSync(path.join(this.backupDir, item)).isDirectory())
      .sort((a, b) => b.localeCompare(a));

    if (backups.length === 0) {
      console.log('❌ 복원할 백업이 없습니다.');
      return;
    }

    console.log('⚠️ 주의: 복원하면 현재 파일들이 백업의 파일들로 교체됩니다!');
    console.log('🛡️ 복원 전에 현재 상태를 백업하는 것을 권장합니다.\n');

    const createCurrentBackup = await this.askQuestion('현재 상태를 먼저 백업하시겠습니까? (y/N): ');
    if (createCurrentBackup.toLowerCase() === 'y') {
      await this.createBackup('full');
      console.log('');
    }

    const backupChoice = await this.askQuestion(`복원할 백업 번호 (1-${backups.length}): `);
    const backupIndex = parseInt(backupChoice) - 1;

    if (backupIndex < 0 || backupIndex >= backups.length) {
      console.log('❌ 잘못된 백업 번호입니다.');
      return;
    }

    const selectedBackup = backups[backupIndex];
    console.log(`\n📦 선택된 백업: ${selectedBackup}`);

    const confirmation = await this.askQuestion('정말로 복원하시겠습니까? (y/N): ');
    if (confirmation.toLowerCase() !== 'y') {
      console.log('❌ 복원이 취소되었습니다.');
      return;
    }

    await this.performRestore(selectedBackup);
  }

  /**
   * 실제 복원 수행
   */
  async performRestore(backupName) {
    const backupPath = path.join(this.backupDir, backupName);
    const dataPath = path.join(backupPath, 'data');

    console.log('\n🔄 복원 중...');
    console.log('⚠️ 이 과정은 몇 분이 걸릴 수 있습니다.');

    const startTime = Date.now();

    try {
      // 백업 정보 로드
      const infoPath = path.join(backupPath, 'backup-info.json');
      let backupInfo = {};
      if (fs.existsSync(infoPath)) {
        backupInfo = JSON.parse(fs.readFileSync(infoPath, 'utf8'));
      }

      // 데이터 복원
      if (fs.existsSync(dataPath)) {
        await this.copyDirectory(dataPath, process.cwd());
      } else {
        throw new Error('백업 데이터를 찾을 수 없습니다.');
      }

      // node_modules 재설치 안내
      console.log('\n📦 의존성 재설치가 필요할 수 있습니다.');
      const reinstallDeps = await this.askQuestion('npm install을 실행하시겠습니까? (Y/n): ');
      
      if (reinstallDeps.toLowerCase() !== 'n') {
        console.log('📦 의존성 설치 중...');
        try {
          execSync('npm install', { stdio: 'inherit' });
          console.log('✅ 의존성 설치 완료');
        } catch (error) {
          console.log('⚠️ 의존성 설치 실패. 수동으로 npm install을 실행하세요.');
        }
      }

      const duration = Date.now() - startTime;
      console.log('\n✅ 복원 완료!');
      console.log(`⏱️ 소요시간: ${(duration / 1000).toFixed(1)}초`);
      console.log(`📅 복원된 백업 날짜: ${new Date(backupInfo.created_at).toLocaleString('ko-KR')}`);

      // 복원 로그 기록
      this.logRestore(backupName, duration);

    } catch (error) {
      this.logError('복원 실패', error);
      console.error('❌ 복원 중 오류가 발생했습니다:', error.message);
      console.log('💡 수동 복원을 시도하거나 최신 백업을 사용해보세요.');
    }
  }

  /**
   * 디렉토리 복사
   */
  async copyDirectory(source, target) {
    const items = fs.readdirSync(source);

    for (const item of items) {
      const sourcePath = path.join(source, item);
      const targetPath = path.join(target, item);
      const stat = fs.statSync(sourcePath);

      if (stat.isDirectory()) {
        fs.mkdirSync(targetPath, { recursive: true });
        await this.copyDirectory(sourcePath, targetPath);
      } else {
        fs.mkdirSync(path.dirname(targetPath), { recursive: true });
        fs.copyFileSync(sourcePath, targetPath);
      }
    }
  }

  /**
   * 오래된 백업 정리
   */
  async cleanupOldBackups() {
    console.log('\n🧹 백업 정리');
    console.log('='.repeat(30));

    const keepCount = this.config.auto_backup.keep_count;
    console.log(`📋 설정: 최근 ${keepCount}개 백업 유지`);

    const backups = fs.readdirSync(this.backupDir)
      .filter(item => fs.statSync(path.join(this.backupDir, item)).isDirectory())
      .sort((a, b) => b.localeCompare(a)); // 최신순 정렬

    if (backups.length <= keepCount) {
      console.log('✅ 정리할 백업이 없습니다.');
      return;
    }

    const toDelete = backups.slice(keepCount);
    console.log(`🗑️ 삭제 예정: ${toDelete.length}개 백업`);

    for (const backup of toDelete) {
      console.log(`  - ${backup}`);
    }

    const confirm = await this.askQuestion(`정말로 ${toDelete.length}개 백업을 삭제하시겠습니까? (y/N): `);
    
    if (confirm.toLowerCase() === 'y') {
      let deletedSize = 0;
      
      for (const backup of toDelete) {
        const backupPath = path.join(this.backupDir, backup);
        const size = this.getDirectorySize(backupPath);
        
        fs.rmSync(backupPath, { recursive: true, force: true });
        deletedSize += size;
        
        console.log(`🗑️ 삭제됨: ${backup}`);
      }

      console.log(`\n✅ 정리 완료!`);
      console.log(`💾 확보된 공간: ${this.formatFileSize(deletedSize)}`);
      
      this.logCleanup(toDelete.length, deletedSize);
    } else {
      console.log('❌ 정리가 취소되었습니다.');
    }
  }

  /**
   * 자동 정리 (조용히 실행)
   */
  async autoCleanupOldBackups() {
    const keepCount = this.config.auto_backup.keep_count;
    const backups = fs.readdirSync(this.backupDir)
      .filter(item => fs.statSync(path.join(this.backupDir, item)).isDirectory())
      .sort((a, b) => b.localeCompare(a));

    if (backups.length > keepCount) {
      const toDelete = backups.slice(keepCount);
      
      for (const backup of toDelete) {
        const backupPath = path.join(this.backupDir, backup);
        fs.rmSync(backupPath, { recursive: true, force: true });
      }

      console.log(`🧹 자동 정리: ${toDelete.length}개 오래된 백업 삭제됨`);
    }
  }

  /**
   * 자동 백업 설정
   */
  async setupAutomaticBackup() {
    console.log('\n⚙️ 자동 백업 설정');
    console.log('='.repeat(30));
    console.log(`현재 상태: ${this.config.auto_backup.enabled ? '✅ 활성화' : '❌ 비활성화'}`);
    console.log(`보관 개수: ${this.config.auto_backup.keep_count}개`);
    console.log('');

    const enable = await this.askQuestion('자동 백업을 활성화하시겠습니까? (Y/n): ');
    this.config.auto_backup.enabled = enable.toLowerCase() !== 'n';

    if (this.config.auto_backup.enabled) {
      const keepCount = await this.askQuestion(`보관할 백업 개수 (현재: ${this.config.auto_backup.keep_count}): `);
      if (keepCount.trim() && !isNaN(parseInt(keepCount))) {
        this.config.auto_backup.keep_count = parseInt(keepCount);
      }

      console.log('\n⚡ 자동 백업 트리거 설정:');
      console.log('1. Git 커밋 전 (pre-commit hook)');
      console.log('2. 개발 서버 시작 전');
      console.log('3. 수동으로만 실행');

      const triggerChoice = await this.askQuestion('선택 (1-3): ');
      
      if (triggerChoice === '1') {
        await this.setupGitHook();
      } else if (triggerChoice === '2') {
        await this.setupDevServerHook();
      }
    }

    this.saveConfig();
    console.log('\n✅ 설정이 저장되었습니다.');
  }

  /**
   * Git hook 설정
   */
  async setupGitHook() {
    const hookPath = '.husky/pre-commit';
    const backupCommand = 'node scripts/backup-restore.js --backup-quick';

    if (fs.existsSync(hookPath)) {
      const hookContent = fs.readFileSync(hookPath, 'utf8');
      if (!hookContent.includes(backupCommand)) {
        const updatedContent = hookContent + '\n# 자동 백업\n' + backupCommand + '\n';
        fs.writeFileSync(hookPath, updatedContent);
        console.log('✅ Git pre-commit hook에 자동 백업 추가됨');
      } else {
        console.log('ℹ️ Git hook에 이미 자동 백업이 설정되어 있습니다.');
      }
    } else {
      console.log('⚠️ .husky/pre-commit 파일을 찾을 수 없습니다.');
    }
  }

  /**
   * 개발 서버 hook 설정
   */
  async setupDevServerHook() {
    // package.json의 dev 스크립트 수정
    try {
      const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
      const currentDevScript = packageJson.scripts.dev;
      const backupCommand = 'node scripts/backup-restore.js --backup-quick && ';

      if (!currentDevScript.includes(backupCommand)) {
        packageJson.scripts.dev = backupCommand + currentDevScript;
        fs.writeFileSync('package.json', JSON.stringify(packageJson, null, 2));
        console.log('✅ 개발 서버 시작 전 자동 백업 설정됨');
      } else {
        console.log('ℹ️ 개발 서버에 이미 자동 백업이 설정되어 있습니다.');
      }
    } catch (error) {
      console.log('⚠️ package.json 수정 실패:', error.message);
    }
  }

  /**
   * 유틸리티 함수들
   */
  async askQuestion(question) {
    return new Promise((resolve) => {
      this.rl.question(question, resolve);
    });
  }

  getDirectorySize(dirPath) {
    if (!fs.existsSync(dirPath)) return 0;

    let size = 0;
    const items = fs.readdirSync(dirPath);

    for (const item of items) {
      const itemPath = path.join(dirPath, item);
      const stat = fs.statSync(itemPath);

      if (stat.isDirectory()) {
        size += this.getDirectorySize(itemPath);
      } else {
        size += stat.size;
      }
    }

    return size;
  }

  formatFileSize(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  }

  /**
   * 로깅 함수들
   */
  logBackup(backupName, stats, duration) {
    const logEntry = `[${new Date().toISOString()}] BACKUP_CREATED: ${backupName} | Files: ${stats.files} | Size: ${this.formatFileSize(stats.totalSize)} | Duration: ${duration}ms\n`;
    fs.appendFileSync(this.logFile, logEntry);
  }

  logRestore(backupName, duration) {
    const logEntry = `[${new Date().toISOString()}] BACKUP_RESTORED: ${backupName} | Duration: ${duration}ms\n`;
    fs.appendFileSync(this.logFile, logEntry);
  }

  logCleanup(deletedCount, freedSpace) {
    const logEntry = `[${new Date().toISOString()}] CLEANUP: Deleted ${deletedCount} backups | Freed: ${this.formatFileSize(freedSpace)}\n`;
    fs.appendFileSync(this.logFile, logEntry);
  }

  logError(operation, error) {
    const logEntry = `[${new Date().toISOString()}] ERROR: ${operation} | ${error.message}\n`;
    fs.appendFileSync(this.logFile, logEntry);
  }

  /**
   * 도움말 표시
   */
  showHelp() {
    console.log('\n🗄️ Awarefit CRM 백업 시스템 도움말');
    console.log('='.repeat(50));
    console.log('');
    console.log('📋 사용법:');
    console.log('  node scripts/backup-restore.js [옵션]');
    console.log('');
    console.log('🔧 옵션:');
    console.log('  --backup, -b       전체 백업 생성');
    console.log('  --backup-quick, -q 빠른 백업 (코드만)');
    console.log('  --restore, -r      대화형 복원');
    console.log('  --list, -l         백업 목록 보기');
    console.log('  --cleanup          오래된 백업 정리');
    console.log('  --auto-setup       자동 백업 설정');
    console.log('  --help, -h         이 도움말 표시');
    console.log('');
    console.log('📦 npm 스크립트:');
    console.log('  npm run backup        # 전체 백업');
    console.log('  npm run backup:quick  # 빠른 백업');
    console.log('  npm run restore       # 대화형 복원');
    console.log('');
    console.log('💡 팁:');
    console.log('  - 중요한 작업 전에는 항상 백업을 생성하세요');
    console.log('  - 정기적으로 백업 목록을 확인하고 정리하세요');
    console.log('  - 자동 백업을 설정하면 실수로 인한 손실을 방지할 수 있습니다');
    console.log('');
  }
}

// 스크립트 실행
if (require.main === module) {
  const backupSystem = new BackupRestoreSystem();
  backupSystem.run().catch(error => {
    console.error('💥 시스템 오류:', error);
    process.exit(1);
  });
}

module.exports = BackupRestoreSystem; 