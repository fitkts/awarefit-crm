import Database from 'better-sqlite3';
import { getDatabase } from '../../database/init';

export class DatabaseService {
  private db: Database.Database;

  constructor() {
    this.db = getDatabase();
  }

  // 일반적인 쿼리 실행
  query(sql: string, params: any[] = []): any {
    try {
      const stmt = this.db.prepare(sql);
      if (sql.trim().toLowerCase().startsWith('select')) {
        return stmt.all(params);
      } else {
        return stmt.run(params);
      }
    } catch (error) {
      console.error('Database query error:', error);
      throw error;
    }
  }

  // 트랜잭션 실행
  transaction(fn: () => any): any {
    const transaction = this.db.transaction(fn);
    return transaction();
  }

  // 데이터베이스 상태 확인
  isHealthy(): boolean {
    try {
      const result = this.db.prepare('SELECT 1').get();
      return result !== undefined;
    } catch {
      return false;
    }
  }

  // 테이블 존재 여부 확인
  tableExists(tableName: string): boolean {
    try {
      const result = this.db
        .prepare(
          `
        SELECT name FROM sqlite_master 
        WHERE type='table' AND name=?
      `
        )
        .get(tableName);
      return result !== undefined;
    } catch {
      return false;
    }
  }

  // 인덱스 생성
  createIndex(indexName: string, tableName: string, columns: string[]): void {
    try {
      const sql = `CREATE INDEX IF NOT EXISTS ${indexName} ON ${tableName} (${columns.join(', ')})`;
      this.db.exec(sql);
    } catch (error) {
      console.error('Index creation error:', error);
      throw error;
    }
  }

  // 백업 생성
  backup(backupPath: string): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.db.backup(backupPath);
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  }

  // 데이터베이스 최적화
  optimize(): void {
    try {
      this.db.exec('VACUUM');
      this.db.exec('ANALYZE');
    } catch (error) {
      console.error('Database optimization error:', error);
      throw error;
    }
  }

  // 연결 종료
  close(): void {
    if (this.db) {
      this.db.close();
    }
  }
}
