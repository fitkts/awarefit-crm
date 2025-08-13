/**
 * 🔧 better-sqlite3 자동 복구 서비스
 *
 * NODE_MODULE_VERSION 호환성 문제를 자동으로 감지하고 해결합니다.
 */

import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

export class BetterSqlite3Service {
  private static instance: BetterSqlite3Service;
  private isFixed = false;

  public static getInstance(): BetterSqlite3Service {
    if (!BetterSqlite3Service.instance) {
      BetterSqlite3Service.instance = new BetterSqlite3Service();
    }
    return BetterSqlite3Service.instance;
  }

  /**
   * better-sqlite3 호환성 문제를 자동으로 감지하고 수정 (모듈 캐시 클리어 포함)
   */
  async ensureCompatibility(): Promise<boolean> {
    if (this.isFixed) {
      return true;
    }

    console.log('🔍 [BetterSqlite3] 호환성 검사 시작...');

    try {
      // 1. 바이너리 파일 존재 여부 확인
      if (!this.checkBinaryExists()) {
        console.log('⚠️ [BetterSqlite3] 네이티브 바이너리 없음 - 재빌드 필요');
        await this.fullRecovery();
        return true;
      }

      // 2. 기본 로딩 테스트
      if (!this.testBasicLoading()) {
        console.log('⚠️ [BetterSqlite3] 로딩 실패 - 완전 복구 수행');
        await this.fullRecovery();
        return true;
      }

      console.log('✅ [BetterSqlite3] 호환성 검사 통과');
      this.isFixed = true;
      return true;
    } catch (error) {
      console.error('❌ [BetterSqlite3] 자동 복구 실패:', error);
      // 최후 수단: 강제 수동 복구
      console.log('🔄 [BetterSqlite3] 최후 수단: 강제 복구 시도...');
      return await this.forceFixManual();
    }
  }

  /**
   * 네이티브 바이너리 파일 존재 확인
   */
  private checkBinaryExists(): boolean {
    try {
      const binaryPath = path.join(
        process.cwd(),
        'node_modules',
        'better-sqlite3',
        'build',
        'Release',
        'better_sqlite3.node'
      );
      return fs.existsSync(binaryPath);
    } catch (_error) {
      return false;
    }
  }

  /**
   * 실제 Database 인스턴스 생성 테스트
   */
  private testBasicLoading(): boolean {
    try {
      // 실제 Database 인스턴스 생성 테스트 (메모리 DB)
      const Database = require('better-sqlite3');
      const testDb = new Database(':memory:');
      testDb.close();
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.log('🔍 [BetterSqlite3] Database 인스턴스 테스트 실패:', errorMessage.split('\n')[0]);
      return false;
    }
  }

  /**
   * Electron 전용 재빌드 수행
   */
  private async rebuildForElectron(): Promise<void> {
    console.log('⚡ [BetterSqlite3] Electron 재빌드 수행 중...');
    try {
      execSync('npx electron-rebuild -f -m better-sqlite3', {
        stdio: 'pipe',
        cwd: process.cwd(),
      });
      console.log('✅ [BetterSqlite3] Electron 재빌드 완료');
    } catch (_error) {
      // Electron rebuild 실패 시 전체 재빌드 시도
      console.log('🔄 [BetterSqlite3] 전체 Electron 재빌드 시도...');
      execSync('npx electron-rebuild', {
        stdio: 'pipe',
        cwd: process.cwd(),
      });
      console.log('✅ [BetterSqlite3] 전체 Electron 재빌드 완료');
    }
  }

  /**
   * 모듈 캐시 클리어 포함 완전 복구
   */
  async fullRecovery(): Promise<void> {
    console.log('🔄 [BetterSqlite3] 완전 복구 시작 (캐시 클리어 포함)...');

    try {
      // 1. 모듈 캐시에서 better-sqlite3 제거
      this.clearModuleCache();

      // 2. 재빌드 수행
      await this.rebuildForElectron();

      // 3. 다시 캐시 클리어 (재빌드 후에도)
      this.clearModuleCache();

      console.log('✅ [BetterSqlite3] 완전 복구 완료');
    } catch (_error) {
      console.error('❌ [BetterSqlite3] 완전 복구 실패:', _error);
      throw _error;
    }
  }

  /**
   * Node.js 모듈 캐시에서 better-sqlite3 관련 모듈 제거
   */
  private clearModuleCache(): void {
    console.log('🧹 [BetterSqlite3] 모듈 캐시 클리어...');

    try {
      // better-sqlite3 관련 모든 캐시된 모듈 찾기 및 제거
      const moduleKeys = Object.keys(require.cache);
      const betterSqliteKeys = moduleKeys.filter(
        key =>
          key.includes('better-sqlite3') ||
          key.includes('better_sqlite3') ||
          key.includes('bindings')
      );

      betterSqliteKeys.forEach(key => {
        console.log(`   🗑️ 캐시 제거: ${path.basename(key)}`);
        delete require.cache[key];
      });

      console.log(`   ✅ ${betterSqliteKeys.length}개 캐시 항목 제거 완료`);
    } catch (_error) {
      console.log('   ⚠️ 캐시 클리어 부분적 실패 (계속 진행)');
    }
  }

  /**
   * 수동 강제 수정 (최후 수단)
   */
  async forceFixManual(): Promise<boolean> {
    console.log('🛠️ [BetterSqlite3] 수동 강제 수정 시작...');
    try {
      // 1. 캐시 완전 클리어
      this.clearModuleCache();

      // 2. 모듈 완전 제거
      const modulePath = path.join(process.cwd(), 'node_modules', 'better-sqlite3');
      if (fs.existsSync(modulePath)) {
        execSync(`rm -rf "${modulePath}"`, { stdio: 'pipe' });
        console.log('   🗑️ 모듈 디렉토리 제거 완료');
      }

      // 3. 재설치
      console.log('   📦 모듈 재설치...');
      execSync('npm install better-sqlite3 --no-save', {
        stdio: 'pipe',
        cwd: process.cwd(),
      });

      // 4. Electron 재빌드
      console.log('   ⚡ Electron 재빌드...');
      execSync('npx electron-rebuild', {
        stdio: 'pipe',
        cwd: process.cwd(),
      });

      // 5. 마지막 캐시 클리어
      this.clearModuleCache();

      console.log('✅ [BetterSqlite3] 수동 강제 수정 완료');
      this.isFixed = true;
      return true;
    } catch (_error) {
      console.error('❌ [BetterSqlite3] 수동 강제 수정 실패:', _error);
      return false;
    }
  }

  /**
   * 상태 리셋 (개발용)
   */
  resetStatus(): void {
    this.isFixed = false;
  }
}

/**
 * 데이터베이스 초기화 전에 better-sqlite3 호환성 보장
 */
export async function ensureBetterSqlite3Compatibility(): Promise<boolean> {
  const service = BetterSqlite3Service.getInstance();
  return await service.ensureCompatibility();
}
