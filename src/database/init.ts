import Database from 'better-sqlite3';
import { app } from 'electron';
import * as path from 'path';
import { ensureBetterSqlite3Compatibility } from '../main/services/betterSqlite3Service';
import { MigrationRunner } from './migrations/migrationRunner';

let db: Database.Database | null = null;

// 데이터베이스 파일 경로
const getDatabasePath = (): string => {
  const userDataPath = app.getPath('userData');
  return path.join(userDataPath, 'awarefit.db');
};

// 데이터베이스 초기화 (완전 자동 복구 버전)
export const initializeDatabase = async (): Promise<Database.Database> => {
  // 최대 3번 시도
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      console.log(`🚀 데이터베이스 초기화 시도 ${attempt}/3...`);
      
      // 🔧 better-sqlite3 호환성 자동 보장
      if (attempt === 1) {
        const isCompatible = await ensureBetterSqlite3Compatibility();
        if (!isCompatible) {
          throw new Error('better-sqlite3 호환성 문제를 해결할 수 없습니다');
        }
      }

      const dbPath = getDatabasePath();
      console.log('🔗 데이터베이스 연결 시도:', dbPath);

      db = new Database(dbPath);

      // 🚀 최고 성능 설정 (빠른 시작을 위해)
      db.pragma('journal_mode = WAL');
      db.pragma('synchronous = NORMAL');
      db.pragma('cache_size = 1000000');
      db.pragma('temp_store = memory');
      db.pragma('mmap_size = 268435456'); // 256MB 메모리 맵핑

      // 외래 키 제약 조건 활성화
      db.pragma('foreign_keys = ON');

      // 🚀 필수 테이블만 먼저 생성 (기본 작동에 필요한 것들)
      createEssentialTables(db);

    // 🚀 기본 데이터는 더 나중에 백그라운드에서 삽입
    setImmediate(() => {
      try {
        // 나머지 테이블 생성
        if (db) {
          createOptionalTables(db);

          // 기본 데이터 삽입
          insertDefaultData(db);
        }

        console.log('✅ 보조 테이블 및 기본 데이터 삽입 완료');
      } catch (error) {
        console.error('보조 초기화 실패:', error);
      }
    });

    // 🚀 마이그레이션은 더욱 뒤로 지연
    setTimeout(() => {
      try {
        console.log('🔄 백그라운드에서 마이그레이션 시작...');
        if (db) {
          const migrationRunner = new MigrationRunner(db);
          migrationRunner.runMigrations();
          console.log('✅ 마이그레이션 완료');
        }
      } catch (migrationError) {
        console.error('마이그레이션 실행 중 오류 발생:', migrationError);
        console.log('마이그레이션 실패했지만 앱은 계속 실행됩니다.');
      }
    }, 500);

      console.log(`✅ 데이터베이스 초기화 완료 (시도 ${attempt}/3 성공)`);
      return db;
      
    } catch (error) {
      console.error(`❌ 데이터베이스 초기화 시도 ${attempt}/3 실패:`, error);
      
      if (attempt < 3) {
        console.log(`🔄 ${attempt + 1}번째 시도를 위해 추가 복구 수행...`);
        
        // 각 시도마다 더 강력한 복구 방법 사용
        if (attempt === 1) {
          // 2번째 시도: 강제 복구
          const { BetterSqlite3Service } = await import('../main/services/betterSqlite3Service');
          const service = BetterSqlite3Service.getInstance();
          await service.forceFixManual();
        } else if (attempt === 2) {
          // 3번째 시도: 완전 재설치
          console.log('🛠️ 최종 시도: 완전 재설치...');
          const { execSync } = require('child_process');
          try {
            execSync('rm -rf node_modules/better-sqlite3', { stdio: 'pipe' });
            execSync('npm install better-sqlite3 --no-save', { stdio: 'pipe' });
            execSync('npx electron-rebuild', { stdio: 'pipe' });
          } catch (_rebuildError) {
            console.log('⚠️ 완전 재설치 실패, 마지막 시도 계속...');
          }
        }
        
        // 잠시 대기 후 재시도
        await new Promise(resolve => setTimeout(resolve, 1000));
        continue;
      }
      
      // 모든 시도 실패
      console.error('💥 모든 복구 시도 실패. 데이터베이스 없이 실행됩니다.');
      throw error;
    }
  }
  
  // 이 지점에 도달하면 안 됨 (TypeScript 타입 체커를 위한 fallback)
  throw new Error('데이터베이스 초기화 중 예상치 못한 오류가 발생했습니다.');
};

// 데이터베이스 인스턴스 반환 (동기적)
export const getDatabase = (): Database.Database => {
  if (!db) {
    throw new Error('데이터베이스가 아직 초기화되지 않았습니다. initializeDatabase()를 먼저 호출하세요.');
  }
  return db;
};

// 데이터베이스 인스턴스 비동기 반환
export const getDatabaseAsync = async (): Promise<Database.Database> => {
  if (!db) {
    return await initializeDatabase();
  }
  return db;
};

// 🚀 필수 테이블만 먼저 생성 (빠른 시작)
const createEssentialTables = (database: Database.Database): void => {
  const createEssentialTransaction = database.transaction(() => {
    // 🚀 1. 핵심 회원 정보 테이블만 먼저
    database.exec(`
      CREATE TABLE IF NOT EXISTS members (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        member_number TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        phone TEXT UNIQUE,
        email TEXT,
        gender TEXT CHECK(gender IN ('남성', '여성')),
        birth_date DATE,
        join_date DATE NOT NULL DEFAULT CURRENT_DATE,
        address TEXT,
        notes TEXT,
        active BOOLEAN DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 🚀 2. 기본 직원 정보 테이블
    database.exec(`
      CREATE TABLE IF NOT EXISTS staff (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        staff_number TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        phone TEXT,
        email TEXT,
        position TEXT,
        hire_date DATE NOT NULL,
        is_active BOOLEAN DEFAULT 1,
        can_manage_payments BOOLEAN DEFAULT 0,
        can_manage_members BOOLEAN DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 🚀 3. 기본 결제 시스템을 위한 최소 테이블들
    database.exec(`
      CREATE TABLE IF NOT EXISTS membership_types (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE NOT NULL,
        duration_months INTEGER NOT NULL,
        price DECIMAL(10,2) NOT NULL,
        description TEXT,
        is_active BOOLEAN DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    database.exec(`
      CREATE TABLE IF NOT EXISTS payments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        payment_number TEXT UNIQUE NOT NULL,
        member_id INTEGER NOT NULL,
        payment_type TEXT CHECK(payment_type IN ('membership', 'pt', 'other')),
        membership_type_id INTEGER,
        pt_package_id INTEGER,
        amount DECIMAL(10,2) NOT NULL,
        payment_method TEXT CHECK(payment_method IN ('현금', '카드', '계좌이체', '기타')),
        payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
        staff_id INTEGER NOT NULL,
        notes TEXT,
        status TEXT DEFAULT 'completed' CHECK(status IN ('completed', 'refunded', 'cancelled')),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        
        FOREIGN KEY (member_id) REFERENCES members(id),
        FOREIGN KEY (membership_type_id) REFERENCES membership_types(id),
        FOREIGN KEY (staff_id) REFERENCES staff(id)
      )
    `);
  });

  // 트랜잭션 실행
  createEssentialTransaction();
};

// 🚀 부가적인 테이블들 (지연 생성)
const createOptionalTables = (database: Database.Database): void => {
  const createOptionalTransaction = database.transaction(() => {
    // PT 패키지 테이블
    database.exec(`
      CREATE TABLE IF NOT EXISTS pt_packages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE NOT NULL,
        session_count INTEGER NOT NULL,
        price DECIMAL(10,2) NOT NULL,
        validity_days INTEGER DEFAULT 90,
        description TEXT,
        is_active BOOLEAN DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 회원권 이용 이력 테이블
    database.exec(`
      CREATE TABLE IF NOT EXISTS membership_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        member_id INTEGER NOT NULL,
        membership_type_id INTEGER NOT NULL,
        payment_id INTEGER NOT NULL,
        start_date DATE NOT NULL,
        end_date DATE NOT NULL,
        is_active BOOLEAN DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        
        FOREIGN KEY (member_id) REFERENCES members(id),
        FOREIGN KEY (membership_type_id) REFERENCES membership_types(id),
        FOREIGN KEY (payment_id) REFERENCES payments(id)
      )
    `);

    // PT 세션 기록 테이블
    database.exec(`
      CREATE TABLE IF NOT EXISTS pt_sessions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        member_id INTEGER NOT NULL,
        pt_package_id INTEGER NOT NULL,
        payment_id INTEGER NOT NULL,
        trainer_id INTEGER NOT NULL,
        session_date DATE NOT NULL,
        session_time TIME,
        duration_minutes INTEGER DEFAULT 60,
        notes TEXT,
        status TEXT DEFAULT 'completed' CHECK(status IN ('scheduled', 'completed', 'cancelled', 'no_show')),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        
        FOREIGN KEY (member_id) REFERENCES members(id),
        FOREIGN KEY (pt_package_id) REFERENCES pt_packages(id),
        FOREIGN KEY (payment_id) REFERENCES payments(id),
        FOREIGN KEY (trainer_id) REFERENCES staff(id)
      )
    `);

    // 출석 기록 테이블
    database.exec(`
      CREATE TABLE IF NOT EXISTS attendance (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        member_id INTEGER NOT NULL,
        check_in_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        check_out_time DATETIME,
        attendance_date DATE NOT NULL DEFAULT CURRENT_DATE,
        
        FOREIGN KEY (member_id) REFERENCES members(id)
      )
    `);
  });

  createOptionalTransaction();

  // 인덱스 생성도 지연 처리
  setTimeout(() => {
    createIndexes(database);
  }, 100);
};

// 인덱스 생성
const createIndexes = (database: Database.Database): void => {
  const indexes = [
    'CREATE INDEX IF NOT EXISTS idx_members_active ON members(active)',
    'CREATE INDEX IF NOT EXISTS idx_members_join_date ON members(join_date)',
    'CREATE INDEX IF NOT EXISTS idx_payments_member_id ON payments(member_id)',
    'CREATE INDEX IF NOT EXISTS idx_payments_date ON payments(payment_date)',
    'CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status)',
    'CREATE INDEX IF NOT EXISTS idx_membership_history_member ON membership_history(member_id)',
    'CREATE INDEX IF NOT EXISTS idx_membership_history_active ON membership_history(is_active)',
    'CREATE INDEX IF NOT EXISTS idx_attendance_member ON attendance(member_id)',
    'CREATE INDEX IF NOT EXISTS idx_attendance_date ON attendance(attendance_date)',
  ];

  indexes.forEach(indexSQL => {
    try {
      database.exec(indexSQL);
    } catch (error) {
      console.warn('인덱스 생성 중 오류:', indexSQL, error);
    }
  });
};

// 기본 데이터 삽입
const insertDefaultData = (database: Database.Database): void => {
  try {
    const transaction = database.transaction(() => {
      // 기본 회원권 타입 삽입
      const insertMembershipType = database.prepare(`
        INSERT OR IGNORE INTO membership_types (name, duration_months, price, description)
        VALUES (?, ?, ?, ?)
      `);

      insertMembershipType.run('1개월 회원권', 1, 120000, '1개월 헬스 이용권');
      insertMembershipType.run('3개월 회원권', 3, 320000, '3개월 헬스 이용권');
      insertMembershipType.run('6개월 회원권', 6, 600000, '6개월 헬스 이용권');
      insertMembershipType.run('1년 회원권', 12, 1100000, '1년 헬스 이용권');

      // 기본 PT 패키지 삽입
      const insertPTPackage = database.prepare(`
        INSERT OR IGNORE INTO pt_packages (name, session_count, price, validity_days, description)
        VALUES (?, ?, ?, ?, ?)
      `);

      insertPTPackage.run('PT 10회', 10, 800000, 90, 'PT 10회 패키지');
      insertPTPackage.run('PT 20회', 20, 1500000, 120, 'PT 20회 패키지');
      insertPTPackage.run('PT 30회', 30, 2100000, 150, 'PT 30회 패키지');

      // 기본 직원 추가
      const insertStaff = database.prepare(`
        INSERT OR IGNORE INTO staff (staff_number, name, position, hire_date, can_manage_payments, can_manage_members)
        VALUES (?, ?, ?, ?, ?, ?)
      `);

      insertStaff.run('STF-001', '관리자', '매니저', new Date().toISOString().split('T')[0], 1, 1);
    });

    transaction();
    console.log('기본 데이터 삽입 완료');
  } catch (error) {
    console.error('기본 데이터 삽입 실패:', error);
  }
};

// 데이터베이스 연결 종료
export const closeDatabase = (): void => {
  if (db) {
    db.close();
    db = null;
    console.log('데이터베이스 연결 종료');
  }
};
