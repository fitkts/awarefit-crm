-- Migration: Create initial database tables
-- Created: 2024-01-01
-- Description: Create all initial tables for the fitness CRM system
-- 1. 회원 정보 테이블
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
);
-- 2. 직원 정보 테이블
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
);
-- 3. 회원권 타입 테이블
CREATE TABLE IF NOT EXISTS membership_types (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL,
    duration_months INTEGER NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
-- 4. PT 패키지 테이블
CREATE TABLE IF NOT EXISTS pt_packages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL,
    session_count INTEGER NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    validity_days INTEGER DEFAULT 90,
    description TEXT,
    is_active BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
-- 5. 결제 정보 테이블
CREATE TABLE IF NOT EXISTS payments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    payment_number TEXT UNIQUE NOT NULL,
    member_id INTEGER NOT NULL,
    payment_type TEXT CHECK(payment_type IN ('membership', 'pt', 'other')),
    membership_type_id INTEGER,
    pt_package_id INTEGER,
    amount DECIMAL(10, 2) NOT NULL,
    payment_method TEXT CHECK(payment_method IN ('현금', '카드', '계좌이체', '기타')),
    payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
    staff_id INTEGER NOT NULL,
    notes TEXT,
    status TEXT DEFAULT 'completed' CHECK(status IN ('completed', 'refunded', 'cancelled')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (member_id) REFERENCES members(id),
    FOREIGN KEY (membership_type_id) REFERENCES membership_types(id),
    FOREIGN KEY (pt_package_id) REFERENCES pt_packages(id),
    FOREIGN KEY (staff_id) REFERENCES staff(id)
);
-- 6. 회원권 이용 이력 테이블
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
);
-- 7. PT 세션 기록 테이블
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
    status TEXT DEFAULT 'completed' CHECK(
        status IN ('scheduled', 'completed', 'cancelled', 'no_show')
    ),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (member_id) REFERENCES members(id),
    FOREIGN KEY (pt_package_id) REFERENCES pt_packages(id),
    FOREIGN KEY (payment_id) REFERENCES payments(id),
    FOREIGN KEY (trainer_id) REFERENCES staff(id)
);
-- 8. 출석 기록 테이블
CREATE TABLE IF NOT EXISTS attendance (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    member_id INTEGER NOT NULL,
    check_in_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    check_out_time DATETIME,
    attendance_date DATE NOT NULL DEFAULT CURRENT_DATE,
    FOREIGN KEY (member_id) REFERENCES members(id)
);
-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_members_active ON members(active);
CREATE INDEX IF NOT EXISTS idx_members_join_date ON members(join_date);
CREATE INDEX IF NOT EXISTS idx_payments_member_id ON payments(member_id);
CREATE INDEX IF NOT EXISTS idx_payments_date ON payments(payment_date);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_membership_history_member ON membership_history(member_id);
CREATE INDEX IF NOT EXISTS idx_membership_history_active ON membership_history(is_active);
CREATE INDEX IF NOT EXISTS idx_attendance_member ON attendance(member_id);
CREATE INDEX IF NOT EXISTS idx_attendance_date ON attendance(attendance_date);
-- 기본 데이터 삽입
-- 기본 회원권 타입
INSERT
    OR IGNORE INTO membership_types (name, duration_months, price, description)
VALUES ('1개월 회원권', 1, 120000, '1개월 헬스 이용권'),
    ('3개월 회원권', 3, 320000, '3개월 헬스 이용권'),
    ('6개월 회원권', 6, 600000, '6개월 헬스 이용권'),
    ('1년 회원권', 12, 1100000, '1년 헬스 이용권');
-- 기본 PT 패키지
INSERT
    OR IGNORE INTO pt_packages (
        name,
        session_count,
        price,
        validity_days,
        description
    )
VALUES ('PT 10회', 10, 800000, 90, 'PT 10회 패키지'),
    ('PT 20회', 20, 1500000, 120, 'PT 20회 패키지'),
    ('PT 30회', 30, 2100000, 150, 'PT 30회 패키지');
-- 기본 직원 (현재 날짜로 고용일 설정)
INSERT
    OR IGNORE INTO staff (
        staff_number,
        name,
        position,
        hire_date,
        can_manage_payments,
        can_manage_members
    )
VALUES ('STF-001', '관리자', '매니저', date('now'), 1, 1);