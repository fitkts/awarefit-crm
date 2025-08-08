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

  // SQL 문을 개별적으로 실행하여 에러 발생시 계속 진행
  private executeSQLSafely(sql: string, migrationName: string): void {
    // 트랜잭션이 포함된 SQL인지 확인
    const hasTransaction = sql.includes('BEGIN TRANSACTION') || sql.includes('BEGIN;');

    if (hasTransaction) {
      // 트랜잭션이 포함된 경우 전체를 하나의 블록으로 실행
      try {
        this.db.exec(sql);
      } catch (error: any) {
        // 컬럼 중복 생성 에러는 무시하고 계속 진행
        if (
          error.code === 'SQLITE_ERROR' &&
          (error.message.includes('duplicate column name') ||
            error.message.includes('already exists'))
        ) {
          console.log(`컬럼이 이미 존재합니다 (무시): ${error.message}`);

          // 트랜잭션 롤백 후 성공적인 부분만 실행
          try {
            this.db.exec('ROLLBACK;');
          } catch (_rollbackError) {
            // 롤백 에러는 무시
          }

          // 테이블 생성과 데이터 삽입만 개별적으로 실행
          this.executeNonConflictingStatements(sql);
          return;
        }

        console.warn(`마이그레이션 ${migrationName} 중 경고:`, error.message);

        // 치명적 에러만 중단
        if (error.code === 'SQLITE_ERROR' && error.message.includes('syntax error')) {
          throw error;
        }
      }
    } else {
      // 트랜잭션이 없는 경우 기존 방식 사용
      const statements = sql.split(';').filter(stmt => stmt.trim().length > 0);

      for (const statement of statements) {
        const trimmedStatement = statement.trim();
        if (!trimmedStatement) continue;

        try {
          this.db.exec(trimmedStatement + ';');
        } catch (error: any) {
          // 컬럼 중복 생성 에러는 무시하고 계속 진행
          if (
            error.code === 'SQLITE_ERROR' &&
            (error.message.includes('duplicate column name') ||
              error.message.includes('already exists'))
          ) {
            console.log(`컬럼이 이미 존재합니다 (무시): ${error.message}`);
            continue;
          }

          // 다른 에러는 로그 출력 후 계속 진행
          console.warn(`마이그레이션 ${migrationName} 중 경고:`, trimmedStatement, error.message);

          // 치명적 에러만 중단 (테이블 생성 실패 등)
          if (
            error.code === 'SQLITE_ERROR' &&
            (error.message.includes('syntax error') ||
              (error.message.includes('no such table') && trimmedStatement.includes('INSERT')))
          ) {
            throw error;
          }
        }
      }
    }
  }

  // 충돌하지 않는 문장들만 실행 (테이블 생성, 인덱스, 데이터 삽입)
  private executeNonConflictingStatements(sql: string): void {
    const lines = sql.split('\n');
    const statements: string[] = [];
    let currentStatement = '';

    for (const line of lines) {
      const trimmedLine = line.trim();

      // 트랜잭션 관련 명령은 스킵
      if (
        trimmedLine.startsWith('BEGIN') ||
        trimmedLine.startsWith('COMMIT') ||
        trimmedLine.startsWith('ROLLBACK')
      ) {
        continue;
      }

      // ALTER TABLE 문은 스킵 (이미 존재할 수 있는 컬럼들)
      if (trimmedLine.startsWith('ALTER TABLE') && trimmedLine.includes('ADD COLUMN')) {
        // 세미콜론까지 스킵
        while (!line.includes(';')) {
          continue;
        }
        continue;
      }

      currentStatement += line + '\n';

      if (trimmedLine.endsWith(';')) {
        const stmt = currentStatement.trim();
        if (stmt && !stmt.startsWith('--')) {
          statements.push(stmt);
        }
        currentStatement = '';
      }
    }

    // 안전한 문장들만 실행
    for (const statement of statements) {
      try {
        this.db.exec(statement);
      } catch (error: any) {
        console.log(`문장 실행 중 오류 (무시): ${error.message}`);
      }
    }
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

        // SQL을 안전하게 실행 (에러 발생해도 계속 진행)
        this.executeSQLSafely(migration.sql, `${migration.version}_${migration.name}`);

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
