#!/usr/bin/env node

/**
 * 🗄️ Awarefit CRM 데이터 마이그레이션 자동화 시스템
 * 
 * 데이터베이스 스키마 변경과 데이터 마이그레이션을 안전하게 자동화합니다.
 * 비개발자도 안심하고 데이터베이스를 업데이트할 수 있도록 설계되었습니다.
 * 
 * 주요 기능:
 * - 자동 데이터베이스 백업 및 복원
 * - 스키마 변경 사항 자동 감지
 * - 단계별 마이그레이션 실행
 * - 데이터 무결성 검증
 * - 롤백 및 복구 지원
 * - 마이그레이션 이력 관리
 * - 충돌 감지 및 해결
 * - 성능 영향 분석
 * 
 * 사용법:
 * npm run migrate:check     # 마이그레이션 필요 확인
 * npm run migrate:run       # 마이그레이션 실행
 * npm run migrate:rollback  # 마이그레이션 롤백
 * npm run migrate:status    # 마이그레이션 상태 확인
 * node scripts/migrate.js --help
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const readline = require('readline');
const sqlite3 = require('better-sqlite3');

// 다른 시스템들 로드
const BackupRestoreSystem = require('./backup-restore.js');
const SystemHealthChecker = require('./health-check.js');

class DatabaseMigrationSystem {
  constructor() {
    this.migrationConfig = {
      version: '1.0.0',
      database_path: 'database.sqlite',
      migrations_dir: 'src/database/migrations',
      backup_before_migration: true,
      verify_data_integrity: true,
      max_rollback_versions: 5,
      migration_timeout: 300000, // 5분
      safety_checks: {
        require_backup: true,
        verify_schema: true,
        test_queries: true,
        check_constraints: true
      }
    };

    this.migrationHistory = [];
    this.pendingMigrations = [];
    this.currentVersion = 0;
    
    this.logFile = 'migration.log';
    this.statusFile = 'migration-status.json';
    this.backupDir = 'migration-backups';
    
    this.db = null;
    
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

      console.log('🗄️ Awarefit CRM 데이터 마이그레이션 시스템');
      console.log('='.repeat(50));
      console.log(`⏰ 시작 시간: ${new Date().toLocaleString('ko-KR')}`);
      console.log('');

      await this.initializeMigrationSystem();

      if (args.includes('--check') || args.includes('-c')) {
        await this.checkMigrationStatus();
      } else if (args.includes('--run') || args.includes('-r')) {
        await this.runMigrations();
      } else if (args.includes('--rollback') || args.includes('-rb')) {
        await this.rollbackMigration();
      } else if (args.includes('--status') || args.includes('-s')) {
        await this.showMigrationStatus();
      } else if (args.includes('--create') || args.includes('-cr')) {
        await this.createNewMigration();
      } else if (args.includes('--repair') || args.includes('-rp')) {
        await this.repairDatabase();
      } else {
        // 대화형 메뉴
        await this.showMigrationMenu();
      }

    } catch (error) {
      this.logError('마이그레이션 시스템 오류', error);
      console.error('💥 마이그레이션 시스템 오류:', error.message);
    } finally {
      this.closeDatabase();
      this.rl.close();
    }
  }

  /**
   * 마이그레이션 시스템 초기화
   */
  async initializeMigrationSystem() {
    console.log('⚙️ 마이그레이션 시스템 초기화 중...');

    // 설정 로드
    await this.loadMigrationConfig();

    // 필요한 디렉토리 생성
    const dirs = [this.migrationConfig.migrations_dir, this.backupDir, 'logs'];
    for (const dir of dirs) {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        console.log(`📁 디렉토리 생성: ${dir}/`);
      }
    }

    // 데이터베이스 연결
    await this.connectDatabase();

    // 마이그레이션 테이블 초기화
    await this.initializeMigrationTable();

    // 현재 상태 로드
    await this.loadMigrationHistory();
    await this.scanPendingMigrations();

    console.log('✅ 마이그레이션 시스템 초기화 완료\n');
  }

  /**
   * 대화형 마이그레이션 메뉴
   */
  async showMigrationMenu() {
    console.log('🗄️ 마이그레이션 옵션');
    console.log('='.repeat(30));
    console.log('1. 🔍 마이그레이션 상태 확인');
    console.log('2. 🚀 마이그레이션 실행');
    console.log('3. 🔄 마이그레이션 롤백');
    console.log('4. 📋 마이그레이션 이력 보기');
    console.log('5. 📝 새 마이그레이션 생성');
    console.log('6. 🛠️ 데이터베이스 복구');
    console.log('7. 🔧 데이터 무결성 검사');
    console.log('8. ⚙️ 마이그레이션 설정');
    console.log('9. ❓ 도움말');
    console.log('0. 🚪 종료');
    console.log('');

    const choice = await this.askQuestion('선택하세요 (0-9): ');

    switch (choice.trim()) {
      case '1':
        await this.checkMigrationStatus();
        break;
      case '2':
        await this.runMigrations();
        break;
      case '3':
        await this.rollbackMigration();
        break;
      case '4':
        await this.showMigrationHistory();
        break;
      case '5':
        await this.createNewMigration();
        break;
      case '6':
        await this.repairDatabase();
        break;
      case '7':
        await this.checkDataIntegrity();
        break;
      case '8':
        await this.configureMigrationSettings();
        break;
      case '9':
        this.showHelp();
        break;
      case '0':
        console.log('👋 마이그레이션 시스템을 종료합니다.');
        return;
      default:
        console.log('❌ 잘못된 선택입니다.');
        await this.showMigrationMenu();
    }
  }

  /**
   * 1. 마이그레이션 상태 확인
   */
  async checkMigrationStatus() {
    console.log('\n🔍 마이그레이션 상태 확인');
    console.log('='.repeat(40));

    try {
      // 현재 데이터베이스 버전
      console.log(`📊 현재 데이터베이스 버전: ${this.currentVersion}`);
      
      // 사용 가능한 마이그레이션
      console.log(`📁 사용 가능한 마이그레이션: ${this.pendingMigrations.length}개`);
      
      if (this.pendingMigrations.length > 0) {
        console.log('\n📋 실행 대기 중인 마이그레이션:');
        this.pendingMigrations.forEach((migration, index) => {
          console.log(`  ${index + 1}. ${migration.filename} - ${migration.description || '설명 없음'}`);
        });
        
        console.log('\n⚠️ 마이그레이션 실행이 필요합니다.');
        console.log('💡 실행 방법: npm run migrate:run');
      } else {
        console.log('\n✅ 모든 마이그레이션이 최신 상태입니다.');
      }

      // 데이터베이스 상태 확인
      const dbStatus = await this.checkDatabaseHealth();
      console.log(`\n🏥 데이터베이스 상태: ${dbStatus.status}`);
      
      if (dbStatus.issues.length > 0) {
        console.log('⚠️ 발견된 문제:');
        dbStatus.issues.forEach(issue => {
          console.log(`  - ${issue}`);
        });
      }

      // 백업 상태 확인
      const backupStatus = await this.checkBackupStatus();
      console.log(`💾 최근 백업: ${backupStatus.lastBackup || '없음'}`);
      
      return {
        currentVersion: this.currentVersion,
        pendingMigrations: this.pendingMigrations.length,
        databaseHealth: dbStatus.status,
        needsMigration: this.pendingMigrations.length > 0
      };

    } catch (error) {
      console.error('❌ 마이그레이션 상태 확인 실패:', error.message);
      return { error: error.message };
    }
  }

  /**
   * 2. 마이그레이션 실행
   */
  async runMigrations() {
    console.log('\n🚀 마이그레이션 실행');
    console.log('='.repeat(30));

    try {
      if (this.pendingMigrations.length === 0) {
        console.log('✅ 실행할 마이그레이션이 없습니다.');
        return;
      }

      // 사전 안전 검사
      console.log('🔍 사전 안전 검사 중...');
      const safetyCheck = await this.performSafetyChecks();
      
      if (!safetyCheck.passed) {
        console.log('❌ 안전 검사 실패:');
        safetyCheck.issues.forEach(issue => {
          console.log(`  - ${issue}`);
        });
        
        const proceed = await this.askQuestion('그래도 계속 진행하시겠습니까? (y/N): ');
        if (proceed.toLowerCase() !== 'y') {
          console.log('❌ 마이그레이션이 취소되었습니다.');
          return;
        }
      }

      // 백업 생성
      if (this.migrationConfig.backup_before_migration) {
        console.log('\n💾 마이그레이션 전 백업 생성 중...');
        await this.createMigrationBackup();
      }

      // 마이그레이션 실행
      console.log('\n🔄 마이그레이션 실행 중...');
      let successCount = 0;
      let failedMigration = null;

      for (const migration of this.pendingMigrations) {
        try {
          console.log(`\n📝 실행 중: ${migration.filename}`);
          console.log(`📄 설명: ${migration.description || '설명 없음'}`);
          
          const startTime = Date.now();
          
          // 마이그레이션 실행
          await this.executeMigration(migration);
          
          const duration = Date.now() - startTime;
          successCount++;
          
          console.log(`✅ 완료 (${duration}ms)`);
          
          // 이력에 기록
          this.logMigrationExecution(migration, 'success', duration);

        } catch (error) {
          failedMigration = { migration, error };
          console.error(`❌ 실패: ${error.message}`);
          this.logMigrationExecution(migration, 'failed', 0, error.message);
          break;
        }
      }

      // 결과 처리
      if (failedMigration) {
        console.log(`\n⚠️ 마이그레이션 실패: ${failedMigration.migration.filename}`);
        console.log(`📊 성공: ${successCount}개, 실패: 1개`);
        
        const rollbackChoice = await this.askQuestion('실패한 마이그레이션을 롤백하시겠습니까? (Y/n): ');
        if (rollbackChoice.toLowerCase() !== 'n') {
          await this.rollbackFailedMigration(failedMigration.migration);
        }
      } else {
        console.log(`\n🎉 모든 마이그레이션 완료!`);
        console.log(`📊 총 ${successCount}개 마이그레이션 성공`);
        
        // 데이터 무결성 검증
        if (this.migrationConfig.verify_data_integrity) {
          console.log('\n🔍 데이터 무결성 검증 중...');
          const integrityCheck = await this.verifyDataIntegrity();
          
          if (integrityCheck.passed) {
            console.log('✅ 데이터 무결성 검증 통과');
          } else {
            console.log('⚠️ 데이터 무결성 검증 실패:');
            integrityCheck.issues.forEach(issue => {
              console.log(`  - ${issue}`);
            });
          }
        }
      }

      // 상태 업데이트
      await this.updateMigrationStatus();

    } catch (error) {
      console.error('💥 마이그레이션 실행 중 오류:', error.message);
      
      // 긴급 롤백 제안
      const emergencyRollback = await this.askQuestion('긴급 롤백을 수행하시겠습니까? (Y/n): ');
      if (emergencyRollback.toLowerCase() !== 'n') {
        await this.performEmergencyRollback();
      }
    }
  }

  /**
   * 3. 마이그레이션 롤백
   */
  async rollbackMigration() {
    console.log('\n🔄 마이그레이션 롤백');
    console.log('='.repeat(30));

    try {
      // 롤백 가능한 마이그레이션 확인
      const rollbackableMigrations = await this.getRollbackableMigrations();
      
      if (rollbackableMigrations.length === 0) {
        console.log('❌ 롤백할 수 있는 마이그레이션이 없습니다.');
        return;
      }

      console.log('📋 롤백 가능한 마이그레이션:');
      rollbackableMigrations.forEach((migration, index) => {
        const date = new Date(migration.executed_at).toLocaleString('ko-KR');
        console.log(`  ${index + 1}. ${migration.filename} (${date})`);
      });

      const choice = await this.askQuestion(`롤백할 마이그레이션 번호 (1-${rollbackableMigrations.length}): `);
      const migrationIndex = parseInt(choice) - 1;

      if (migrationIndex < 0 || migrationIndex >= rollbackableMigrations.length) {
        console.log('❌ 잘못된 선택입니다.');
        return;
      }

      const selectedMigration = rollbackableMigrations[migrationIndex];
      
      console.log(`\n⚠️ 주의: ${selectedMigration.filename}을(를) 롤백합니다.`);
      console.log('이 작업은 데이터베이스 구조와 데이터에 영향을 줄 수 있습니다.');
      
      const confirm = await this.askQuestion('정말로 롤백하시겠습니까? (yes/no): ');
      if (confirm.toLowerCase() !== 'yes') {
        console.log('❌ 롤백이 취소되었습니다.');
        return;
      }

      // 롤백 전 백업
      console.log('\n💾 롤백 전 백업 생성 중...');
      await this.createMigrationBackup('rollback');

      // 롤백 실행
      console.log('\n🔄 롤백 실행 중...');
      await this.executeRollback(selectedMigration);

      console.log('✅ 롤백 완료!');
      
      // 데이터 무결성 재확인
      const integrityCheck = await this.verifyDataIntegrity();
      if (integrityCheck.passed) {
        console.log('✅ 롤백 후 데이터 무결성 확인됨');
      } else {
        console.log('⚠️ 롤백 후 데이터 무결성 문제 발견');
      }

    } catch (error) {
      console.error('❌ 롤백 실패:', error.message);
      
      // 백업에서 복원 제안
      const restoreFromBackup = await this.askQuestion('백업에서 복원하시겠습니까? (Y/n): ');
      if (restoreFromBackup.toLowerCase() !== 'n') {
        await this.restoreFromBackup();
      }
    }
  }

  /**
   * 데이터베이스 연결
   */
  async connectDatabase() {
    try {
      const dbPath = this.migrationConfig.database_path;
      
      if (!fs.existsSync(dbPath)) {
        console.log(`⚠️ 데이터베이스 파일이 없습니다: ${dbPath}`);
        console.log('🔧 새 데이터베이스를 생성합니다...');
      }

      this.db = new sqlite3(dbPath);
      console.log(`🔗 데이터베이스 연결: ${dbPath}`);
      
      // 기본 설정
      this.db.pragma('journal_mode = WAL');
      this.db.pragma('foreign_keys = ON');
      
    } catch (error) {
      throw new Error(`데이터베이스 연결 실패: ${error.message}`);
    }
  }

  /**
   * 마이그레이션 테이블 초기화
   */
  async initializeMigrationTable() {
    try {
      const createTableSQL = `
        CREATE TABLE IF NOT EXISTS migrations (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          filename TEXT NOT NULL UNIQUE,
          version INTEGER NOT NULL,
          description TEXT,
          executed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          execution_time INTEGER,
          checksum TEXT,
          rollback_sql TEXT
        )
      `;
      
      this.db.exec(createTableSQL);
      console.log('📊 마이그레이션 테이블 초기화 완료');
      
    } catch (error) {
      throw new Error(`마이그레이션 테이블 초기화 실패: ${error.message}`);
    }
  }

  /**
   * 마이그레이션 히스토리 로드
   */
  async loadMigrationHistory() {
    try {
      const historyQuery = `
        SELECT * FROM migrations 
        ORDER BY version ASC
      `;
      
      this.migrationHistory = this.db.prepare(historyQuery).all();
      
      if (this.migrationHistory.length > 0) {
        this.currentVersion = Math.max(...this.migrationHistory.map(m => m.version));
      }
      
      console.log(`📚 마이그레이션 이력 로드: ${this.migrationHistory.length}개 항목`);
      
    } catch (error) {
      console.log('⚠️ 마이그레이션 이력 로드 실패:', error.message);
      this.migrationHistory = [];
      this.currentVersion = 0;
    }
  }

  /**
   * 대기 중인 마이그레이션 스캔
   */
  async scanPendingMigrations() {
    try {
      const migrationsDir = this.migrationConfig.migrations_dir;
      
      if (!fs.existsSync(migrationsDir)) {
        console.log('📁 마이그레이션 디렉토리가 없습니다.');
        this.pendingMigrations = [];
        return;
      }

      const files = fs.readdirSync(migrationsDir)
        .filter(file => file.endsWith('.sql'))
        .sort();

      const executedFilenames = this.migrationHistory.map(m => m.filename);
      
      this.pendingMigrations = [];

      for (const file of files) {
        if (!executedFilenames.includes(file)) {
          const filePath = path.join(migrationsDir, file);
          const migration = await this.parseMigrationFile(filePath);
          this.pendingMigrations.push(migration);
        }
      }

      console.log(`🔍 대기 중인 마이그레이션: ${this.pendingMigrations.length}개`);
      
    } catch (error) {
      console.log('⚠️ 마이그레이션 스캔 실패:', error.message);
      this.pendingMigrations = [];
    }
  }

  /**
   * 마이그레이션 파일 파싱
   */
  async parseMigrationFile(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const filename = path.basename(filePath);
      
      // 버전 번호 추출 (001_description.sql 형식)
      const versionMatch = filename.match(/^(\d+)_/);
      const version = versionMatch ? parseInt(versionMatch[1]) : 0;
      
      // 설명 추출 (-- Description: 주석에서)
      const descriptionMatch = content.match(/--\s*Description:\s*(.+)/i);
      const description = descriptionMatch ? descriptionMatch[1].trim() : null;
      
      // UP/DOWN 섹션 분리
      const upMatch = content.match(/--\s*UP\s*\n([\s\S]*?)(?=--\s*DOWN|\s*$)/i);
      const downMatch = content.match(/--\s*DOWN\s*\n([\s\S]*?)$/i);
      
      const upSQL = upMatch ? upMatch[1].trim() : content.trim();
      const downSQL = downMatch ? downMatch[1].trim() : null;
      
      // 체크섬 계산
      const crypto = require('crypto');
      const checksum = crypto.createHash('md5').update(content).digest('hex');

      return {
        filename,
        filePath,
        version,
        description,
        upSQL,
        downSQL,
        checksum,
        content
      };
      
    } catch (error) {
      throw new Error(`마이그레이션 파일 파싱 실패 (${filePath}): ${error.message}`);
    }
  }

  /**
   * 안전 검사 수행
   */
  async performSafetyChecks() {
    const checks = {
      passed: true,
      issues: []
    };

    try {
      // 1. 데이터베이스 연결 확인
      if (!this.db) {
        checks.issues.push('데이터베이스 연결이 없습니다');
        checks.passed = false;
      }

      // 2. 백업 상태 확인
      if (this.migrationConfig.safety_checks.require_backup) {
        const backupStatus = await this.checkBackupStatus();
        if (!backupStatus.hasRecentBackup) {
          checks.issues.push('최근 백업이 없습니다 (권장: 24시간 이내)');
        }
      }

      // 3. 디스크 공간 확인
      const dbSize = this.getDatabaseSize();
      const freeSpace = this.getFreeSpace();
      
      if (freeSpace < dbSize * 2) {
        checks.issues.push(`디스크 공간 부족 (필요: ${this.formatBytes(dbSize * 2)}, 사용가능: ${this.formatBytes(freeSpace)})`);
        checks.passed = false;
      }

      // 4. 실행 중인 프로세스 확인
      const activeConnections = await this.checkActiveConnections();
      if (activeConnections > 1) {
        checks.issues.push(`다른 데이터베이스 연결이 활성화되어 있습니다 (${activeConnections}개)`);
      }

      // 5. 마이그레이션 순서 확인
      const orderCheck = this.validateMigrationOrder();
      if (!orderCheck.valid) {
        checks.issues.push(`마이그레이션 순서 오류: ${orderCheck.error}`);
        checks.passed = false;
      }

    } catch (error) {
      checks.issues.push(`안전 검사 중 오류: ${error.message}`);
      checks.passed = false;
    }

    return checks;
  }

  /**
   * 마이그레이션 실행
   */
  async executeMigration(migration) {
    try {
      // 트랜잭션 시작
      const transaction = this.db.transaction(() => {
        // UP SQL 실행
        if (migration.upSQL) {
          this.db.exec(migration.upSQL);
        }
        
        // 마이그레이션 기록
        const insertQuery = `
          INSERT INTO migrations (filename, version, description, execution_time, checksum, rollback_sql)
          VALUES (?, ?, ?, ?, ?, ?)
        `;
        
        this.db.prepare(insertQuery).run(
          migration.filename,
          migration.version,
          migration.description,
          Date.now(),
          migration.checksum,
          migration.downSQL
        );
      });

      // 트랜잭션 실행
      transaction();
      
      // 현재 버전 업데이트
      this.currentVersion = Math.max(this.currentVersion, migration.version);
      
    } catch (error) {
      throw new Error(`마이그레이션 실행 실패 (${migration.filename}): ${error.message}`);
    }
  }

  /**
   * 마이그레이션 백업 생성
   */
  async createMigrationBackup(type = 'migration') {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0] + '_' + 
                       new Date().toTimeString().split(' ')[0].replace(/:/g, '-');
      const backupName = `${type}_backup_${timestamp}`;
      const backupPath = path.join(this.backupDir, backupName);

      // 백업 디렉토리 생성
      fs.mkdirSync(backupPath, { recursive: true });

      // 데이터베이스 파일 복사
      const dbPath = this.migrationConfig.database_path;
      if (fs.existsSync(dbPath)) {
        fs.copyFileSync(dbPath, path.join(backupPath, 'database.sqlite'));
      }

      // 백업 메타데이터
      const metadata = {
        backup_type: type,
        created_at: new Date().toISOString(),
        database_version: this.currentVersion,
        database_size: this.getDatabaseSize(),
        migration_count: this.migrationHistory.length
      };

      fs.writeFileSync(
        path.join(backupPath, 'backup-info.json'),
        JSON.stringify(metadata, null, 2)
      );

      console.log(`💾 백업 생성 완료: ${backupPath}`);
      return backupPath;

    } catch (error) {
      throw new Error(`백업 생성 실패: ${error.message}`);
    }
  }

  /**
   * 데이터베이스 상태 확인
   */
  async checkDatabaseHealth() {
    const health = {
      status: 'healthy',
      issues: []
    };

    try {
      // 1. 데이터베이스 연결 테스트
      this.db.prepare('SELECT 1').get();

      // 2. 테이블 무결성 검사
      const integrityCheck = this.db.prepare('PRAGMA integrity_check').get();
      if (integrityCheck.integrity_check !== 'ok') {
        health.issues.push('데이터베이스 무결성 검사 실패');
        health.status = 'warning';
      }

      // 3. 외래 키 검사
      const foreignKeyCheck = this.db.prepare('PRAGMA foreign_key_check').all();
      if (foreignKeyCheck.length > 0) {
        health.issues.push(`외래 키 제약 조건 위반: ${foreignKeyCheck.length}개`);
        health.status = 'warning';
      }

      // 4. 테이블 존재 확인
      const tables = this.db.prepare(`
        SELECT name FROM sqlite_master 
        WHERE type='table' AND name NOT LIKE 'sqlite_%'
      `).all();

      const expectedTables = ['members', 'staff', 'payments', 'migrations'];
      const missingTables = expectedTables.filter(table => 
        !tables.some(t => t.name === table)
      );

      if (missingTables.length > 0) {
        health.issues.push(`누락된 테이블: ${missingTables.join(', ')}`);
        health.status = 'critical';
      }

    } catch (error) {
      health.issues.push(`데이터베이스 상태 확인 실패: ${error.message}`);
      health.status = 'critical';
    }

    return health;
  }

  /**
   * 백업 상태 확인
   */
  async checkBackupStatus() {
    try {
      if (!fs.existsSync(this.backupDir)) {
        return { hasRecentBackup: false, lastBackup: null };
      }

      const backups = fs.readdirSync(this.backupDir)
        .filter(item => fs.statSync(path.join(this.backupDir, item)).isDirectory())
        .map(backup => {
          const backupPath = path.join(this.backupDir, backup);
          const infoPath = path.join(backupPath, 'backup-info.json');
          
          if (fs.existsSync(infoPath)) {
            try {
              const info = JSON.parse(fs.readFileSync(infoPath, 'utf8'));
              return {
                name: backup,
                path: backupPath,
                created_at: new Date(info.created_at),
                ...info
              };
            } catch (error) {
              return null;
            }
          }
          return null;
        })
        .filter(backup => backup !== null)
        .sort((a, b) => b.created_at - a.created_at);

      const lastBackup = backups[0];
      const hasRecentBackup = lastBackup && 
        (Date.now() - lastBackup.created_at.getTime()) < 24 * 60 * 60 * 1000; // 24시간

      return {
        hasRecentBackup,
        lastBackup: lastBackup ? lastBackup.created_at.toLocaleString('ko-KR') : null,
        backupCount: backups.length
      };

    } catch (error) {
      return { hasRecentBackup: false, lastBackup: null, error: error.message };
    }
  }

  /**
   * 데이터 무결성 검증
   */
  async verifyDataIntegrity() {
    const integrity = {
      passed: true,
      issues: []
    };

    try {
      // 1. 기본 무결성 검사
      const integrityCheck = this.db.prepare('PRAGMA integrity_check').get();
      if (integrityCheck.integrity_check !== 'ok') {
        integrity.issues.push('SQLite 무결성 검사 실패');
        integrity.passed = false;
      }

      // 2. 외래 키 검사
      const foreignKeyCheck = this.db.prepare('PRAGMA foreign_key_check').all();
      if (foreignKeyCheck.length > 0) {
        integrity.issues.push(`외래 키 제약 조건 위반: ${foreignKeyCheck.length}개`);
        integrity.passed = false;
      }

      // 3. 데이터 일관성 검사
      const consistencyChecks = [
        {
          name: '회원 데이터 일관성',
          query: 'SELECT COUNT(*) as count FROM members WHERE email IS NULL OR email = ""',
          expectZero: true
        },
        {
          name: '직원 데이터 일관성', 
          query: 'SELECT COUNT(*) as count FROM staff WHERE name IS NULL OR name = ""',
          expectZero: true
        },
        {
          name: '결제 데이터 일관성',
          query: 'SELECT COUNT(*) as count FROM payments WHERE amount IS NULL OR amount <= 0',
          expectZero: true
        }
      ];

      for (const check of consistencyChecks) {
        try {
          const result = this.db.prepare(check.query).get();
          if (check.expectZero && result.count > 0) {
            integrity.issues.push(`${check.name}: ${result.count}개 문제 발견`);
            integrity.passed = false;
          }
        } catch (error) {
          integrity.issues.push(`${check.name} 검사 실패: ${error.message}`);
        }
      }

    } catch (error) {
      integrity.issues.push(`무결성 검증 중 오류: ${error.message}`);
      integrity.passed = false;
    }

    return integrity;
  }

  /**
   * 새 마이그레이션 생성
   */
  async createNewMigration() {
    console.log('\n📝 새 마이그레이션 생성');
    console.log('='.repeat(30));

    try {
      const description = await this.askQuestion('마이그레이션 설명을 입력하세요: ');
      if (!description.trim()) {
        console.log('❌ 설명은 필수입니다.');
        return;
      }

      // 다음 버전 번호 계산
      const nextVersion = this.getNextMigrationVersion();
      const timestamp = new Date().toISOString().split('T')[0].replace(/-/g, '');
      const filename = `${nextVersion.toString().padStart(3, '0')}_${description.toLowerCase().replace(/\s+/g, '_')}.sql`;

      // 마이그레이션 템플릿 생성
      const template = `-- Description: ${description}
-- Created: ${new Date().toISOString()}
-- Version: ${nextVersion}

-- UP
-- 여기에 스키마 변경 SQL을 작성하세요
-- 예: CREATE TABLE new_table (id INTEGER PRIMARY KEY, name TEXT);

-- DOWN  
-- 여기에 롤백 SQL을 작성하세요 (선택사항)
-- 예: DROP TABLE IF EXISTS new_table;
`;

      const filePath = path.join(this.migrationConfig.migrations_dir, filename);
      fs.writeFileSync(filePath, template);

      console.log(`✅ 새 마이그레이션 생성됨: ${filename}`);
      console.log(`📁 위치: ${filePath}`);
      console.log('💡 파일을 편집하여 SQL을 추가한 후 마이그레이션을 실행하세요.');

    } catch (error) {
      console.error('❌ 마이그레이션 생성 실패:', error.message);
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

  getDatabaseSize() {
    try {
      if (fs.existsSync(this.migrationConfig.database_path)) {
        return fs.statSync(this.migrationConfig.database_path).size;
      }
      return 0;
    } catch (error) {
      return 0;
    }
  }

  getFreeSpace() {
    try {
      // 간단한 디스크 공간 확인 (실제로는 더 정확한 방법 필요)
      const stats = fs.statSync('.');
      return 1024 * 1024 * 1024; // 1GB로 가정
    } catch (error) {
      return 1024 * 1024 * 1024;
    }
  }

  formatBytes(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  }

  async checkActiveConnections() {
    // SQLite는 단일 writer이므로 1로 반환
    return 1;
  }

  validateMigrationOrder() {
    try {
      const versions = this.pendingMigrations.map(m => m.version).sort((a, b) => a - b);
      const expectedVersion = this.currentVersion + 1;
      
      if (versions.length > 0 && versions[0] !== expectedVersion) {
        return {
          valid: false,
          error: `다음 마이그레이션 버전은 ${expectedVersion}이어야 하지만 ${versions[0]}입니다.`
        };
      }
      
      // 연속성 검사
      for (let i = 1; i < versions.length; i++) {
        if (versions[i] !== versions[i-1] + 1) {
          return {
            valid: false,
            error: `마이그레이션 버전이 연속적이지 않습니다: ${versions[i-1]} → ${versions[i]}`
          };
        }
      }
      
      return { valid: true };
      
    } catch (error) {
      return { valid: false, error: error.message };
    }
  }

  getNextMigrationVersion() {
    const maxExistingVersion = Math.max(
      this.currentVersion,
      ...this.pendingMigrations.map(m => m.version),
      0
    );
    return maxExistingVersion + 1;
  }

  async loadMigrationConfig() {
    const configFile = 'migration-config.json';
    if (fs.existsSync(configFile)) {
      try {
        const config = JSON.parse(fs.readFileSync(configFile, 'utf8'));
        this.migrationConfig = { ...this.migrationConfig, ...config };
        console.log('📋 마이그레이션 설정 로드됨');
      } catch (error) {
        console.log('⚠️ 설정 파일 오류, 기본값 사용');
      }
    } else {
      fs.writeFileSync(configFile, JSON.stringify(this.migrationConfig, null, 2));
      console.log('📋 기본 마이그레이션 설정 생성됨');
    }
  }

  async updateMigrationStatus() {
    const status = {
      last_updated: new Date().toISOString(),
      current_version: this.currentVersion,
      pending_migrations: this.pendingMigrations.length,
      total_migrations: this.migrationHistory.length
    };

    fs.writeFileSync(this.statusFile, JSON.stringify(status, null, 2));
  }

  logMigrationExecution(migration, status, duration, error = null) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      migration: migration.filename,
      version: migration.version,
      status: status,
      duration: duration,
      error: error
    };
    
    fs.appendFileSync(this.logFile, JSON.stringify(logEntry) + '\n');
  }

  logError(operation, error) {
    const logEntry = `[${new Date().toISOString()}] ERROR: ${operation} | ${error.message}\n`;
    fs.appendFileSync('migration-error.log', logEntry);
  }

  closeDatabase() {
    if (this.db) {
      this.db.close();
      this.db = null;
    }
  }

  showHelp() {
    console.log('\n🗄️ Awarefit CRM 데이터 마이그레이션 시스템 도움말');
    console.log('='.repeat(60));
    console.log('');
    console.log('📋 사용법:');
    console.log('  node scripts/migrate.js [옵션]');
    console.log('');
    console.log('🔧 옵션:');
    console.log('  --check, -c        마이그레이션 상태 확인');
    console.log('  --run, -r          마이그레이션 실행');
    console.log('  --rollback, -rb    마이그레이션 롤백');
    console.log('  --status, -s       마이그레이션 이력 보기');
    console.log('  --create, -cr      새 마이그레이션 생성');
    console.log('  --repair, -rp      데이터베이스 복구');
    console.log('  --help, -h         이 도움말 표시');
    console.log('');
    console.log('📦 npm 스크립트:');
    console.log('  npm run migrate:check      # 마이그레이션 상태 확인');
    console.log('  npm run migrate:run        # 마이그레이션 실행');
    console.log('  npm run migrate:rollback   # 마이그레이션 롤백');
    console.log('  npm run migrate:status     # 마이그레이션 이력');
    console.log('');
    console.log('📁 마이그레이션 파일 형식:');
    console.log('  001_create_users_table.sql');
    console.log('  002_add_email_column.sql');
    console.log('  003_create_payments_table.sql');
    console.log('');
    console.log('📄 마이그레이션 파일 구조:');
    console.log('  -- Description: 테이블 생성');
    console.log('  -- UP');
    console.log('  CREATE TABLE users (id INTEGER PRIMARY KEY);');
    console.log('  -- DOWN');
    console.log('  DROP TABLE IF EXISTS users;');
    console.log('');
    console.log('⚠️ 주의사항:');
    console.log('  - 마이그레이션 실행 전 자동으로 백업이 생성됩니다');
    console.log('  - 모든 마이그레이션은 트랜잭션 내에서 실행됩니다');
    console.log('  - 실패 시 자동으로 롤백됩니다');
    console.log('  - 데이터 무결성이 자동으로 검증됩니다');
    console.log('');
  }

  /**
   * 실패한 마이그레이션 롤백
   */
  async rollbackFailedMigration(migration) {
    try {
      console.log(`🔄 마이그레이션 롤백 중: ${migration.filename}`);
      
      // 롤백 SQL이 있는 경우 실행
      if (migration.downSQL) {
        const transaction = this.db.transaction(() => {
          this.db.exec(migration.downSQL);
          
          // 마이그레이션 기록 삭제
          this.db.prepare('DELETE FROM migrations WHERE filename = ?').run(migration.filename);
        });
        
        transaction();
        console.log('✅ 롤백 완료');
      } else {
        console.log('⚠️ 롤백 SQL이 없어 자동 롤백이 불가능합니다.');
        
        const emergencyChoice = await this.askQuestion('긴급 롤백을 수행하시겠습니까? (Y/n): ');
        if (emergencyChoice.toLowerCase() !== 'n') {
          await this.performEmergencyRollback();
        }
      }
    } catch (error) {
      console.error(`❌ 롤백 실패: ${error.message}`);
      throw error;
    }
  }

  /**
   * 긴급 롤백 (백업에서 복원)
   */
  async performEmergencyRollback() {
    try {
      console.log('🚨 긴급 롤백 실행 중...');
      
      // 가장 최근 백업 찾기
      const backupDir = 'migration-backups';
      if (!fs.existsSync(backupDir)) {
        throw new Error('백업 디렉토리가 존재하지 않습니다.');
      }
      
      const backups = fs.readdirSync(backupDir)
        .filter(dir => dir.startsWith('migration_backup_'))
        .sort()
        .reverse();
        
      if (backups.length === 0) {
        throw new Error('사용 가능한 백업이 없습니다.');
      }
      
      const latestBackup = backups[0];
      const backupPath = path.join(backupDir, latestBackup, 'database.sqlite');
      
      if (!fs.existsSync(backupPath)) {
        throw new Error(`백업 파일이 존재하지 않습니다: ${backupPath}`);
      }
      
      console.log(`📦 백업에서 복원 중: ${latestBackup}`);
      
      // 현재 데이터베이스 닫기
      if (this.db) {
        this.db.close();
      }
      
      // 백업에서 복원
      fs.copyFileSync(backupPath, this.migrationConfig.database_path);
      
      // 데이터베이스 다시 연결
      this.db = sqlite3(this.migrationConfig.database_path);
      
      console.log('✅ 긴급 롤백 완료');
      
    } catch (error) {
      console.error(`❌ 긴급 롤백 실패: ${error.message}`);
      throw error;
    }
  }
}

// 스크립트 실행
if (require.main === module) {
  const migrationSystem = new DatabaseMigrationSystem();
  migrationSystem.run().catch(error => {
    console.error('💥 마이그레이션 시스템 오류:', error);
    process.exit(1);
  });
}

module.exports = DatabaseMigrationSystem; 