import Database from 'better-sqlite3';
import * as fs from 'fs';
import * as path from 'path';

export interface Migration {
  version: number;
  name: string;
  sql: string;
  applied_at?: string;
}

export class MigrationRunner {
  private db: Database.Database;
  private migrationsPath: string;

  constructor(database: Database.Database) {
    this.db = database;
    this.migrationsPath = path.join(__dirname);
    this.initializeMigrationTable();
  }

  // 마이그레이션 테이블 초기화
  private initializeMigrationTable(): void {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        version INTEGER PRIMARY KEY,
        name TEXT NOT NULL,
        applied_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
  }

  // 적용된 마이그레이션 목록 조회
  private getAppliedMigrations(): number[] {
    const stmt = this.db.prepare('SELECT version FROM schema_migrations ORDER BY version');
    const results = stmt.all() as { version: number }[];
    return results.map(r => r.version);
  }

  // 마이그레이션 파일들 로드
  private loadMigrationFiles(): Migration[] {
    const migrations: Migration[] = [];
    
    try {
      const files = fs.readdirSync(this.migrationsPath);
      const sqlFiles = files.filter(file => file.endsWith('.sql'));
      
      for (const file of sqlFiles) {
        const match = file.match(/^(\d+)_(.+)\.sql$/);
        if (match) {
          const version = parseInt(match[1]);
          const name = match[2];
          const filePath = path.join(this.migrationsPath, file);
          const sql = fs.readFileSync(filePath, 'utf8');
          
          migrations.push({ version, name, sql });
        }
      }
    } catch (error) {
      console.warn('마이그레이션 파일 로드 중 오류:', error);
    }

    return migrations.sort((a, b) => a.version - b.version);
  }

  // 마이그레이션 실행
  public runMigrations(): void {
    const appliedMigrations = this.getAppliedMigrations();
    const availableMigrations = this.loadMigrationFiles();
    
    const pendingMigrations = availableMigrations.filter(
      migration => !appliedMigrations.includes(migration.version)
    );

    if (pendingMigrations.length === 0) {
      console.log('실행할 마이그레이션이 없습니다.');
      return;
    }

    console.log(`${pendingMigrations.length}개의 마이그레이션을 실행합니다.`);

    for (const migration of pendingMigrations) {
      try {
        console.log(`마이그레이션 실행 중: ${migration.version}_${migration.name}`);
        
        // SQL 실행 (마이그레이션 파일에 이미 트랜잭션이 포함되어 있음)
        this.db.exec(migration.sql);
        
        // 마이그레이션 기록을 별도 트랜잭션으로 처리
        const stmt = this.db.prepare(`
          INSERT INTO schema_migrations (version, name) VALUES (?, ?)
        `);
        stmt.run(migration.version, migration.name);
        console.log(`마이그레이션 완료: ${migration.version}_${migration.name}`);
      } catch (error) {
        console.error(`마이그레이션 실패: ${migration.version}_${migration.name}`, error);
        throw error;
      }
    }

    console.log('모든 마이그레이션이 완료되었습니다.');
  }

  // 특정 마이그레이션 롤백 (주의: 데이터 손실 가능)
  public async rollbackMigration(version: number): Promise<void> {
    console.warn(`마이그레이션 ${version} 롤백은 수동으로 처리해야 합니다.`);
    // 실제 롤백 로직은 각 마이그레이션에 따라 수동으로 작성해야 함
  }
} 