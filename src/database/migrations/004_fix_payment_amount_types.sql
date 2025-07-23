-- Migration: Fix payment amount data types consistency
-- Created: 2024-01-17
-- Description: Convert all amount fields from DECIMAL to INTEGER for consistency
BEGIN TRANSACTION;
-- 1. payments 테이블의 amount 컬럼을 INTEGER로 변경
-- SQLite에서는 직접 컬럼 타입 변경이 불가능하므로 새 테이블 생성 후 데이터 이전
-- 백업 테이블 생성
CREATE TABLE payments_backup AS
SELECT *
FROM payments;
-- 기존 테이블 삭제
DROP TABLE payments;
-- 새 payments 테이블 생성 (INTEGER 타입으로)
CREATE TABLE payments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  payment_number TEXT UNIQUE NOT NULL,
  member_id INTEGER NOT NULL,
  payment_type TEXT CHECK(payment_type IN ('membership', 'pt', 'other')),
  membership_type_id INTEGER,
  pt_package_id INTEGER,
  amount INTEGER NOT NULL,
  -- DECIMAL에서 INTEGER로 변경
  payment_method TEXT CHECK(
    payment_method IN ('현금', '카드', '계좌이체', '온라인결제', '기타')
  ),
  payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
  staff_id INTEGER NOT NULL,
  notes TEXT,
  status TEXT DEFAULT 'completed' CHECK(status IN ('completed', 'refunded', 'cancelled')),
  locker_type TEXT,
  -- 이미 추가된 컬럼
  expiry_date DATE,
  -- 이미 추가된 컬럼
  auto_renewal BOOLEAN DEFAULT 0,
  -- 이미 추가된 컬럼
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (member_id) REFERENCES members(id),
  FOREIGN KEY (membership_type_id) REFERENCES membership_types(id),
  FOREIGN KEY (pt_package_id) REFERENCES pt_packages(id),
  FOREIGN KEY (staff_id) REFERENCES staff(id)
);
-- 데이터 이전 (DECIMAL 값을 정수로 변환)
INSERT INTO payments (
    id,
    payment_number,
    member_id,
    payment_type,
    membership_type_id,
    pt_package_id,
    amount,
    payment_method,
    payment_date,
    staff_id,
    notes,
    status,
    locker_type,
    expiry_date,
    auto_renewal,
    created_at
  )
SELECT id,
  payment_number,
  member_id,
  payment_type,
  membership_type_id,
  pt_package_id,
  CAST(amount AS INTEGER),
  -- DECIMAL을 INTEGER로 변환
  payment_method,
  payment_date,
  staff_id,
  notes,
  status,
  locker_type,
  expiry_date,
  auto_renewal,
  created_at
FROM payments_backup;
-- 백업 테이블 삭제
DROP TABLE payments_backup;
-- 2. membership_types 테이블의 price 컬럼을 INTEGER로 변경
CREATE TABLE membership_types_backup AS
SELECT *
FROM membership_types;
DROP TABLE membership_types;
CREATE TABLE membership_types (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT UNIQUE NOT NULL,
  duration_months INTEGER NOT NULL,
  price INTEGER NOT NULL,
  -- DECIMAL에서 INTEGER로 변경
  description TEXT,
  is_active BOOLEAN DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO membership_types (
    id,
    name,
    duration_months,
    price,
    description,
    is_active,
    created_at
  )
SELECT id,
  name,
  duration_months,
  CAST(price AS INTEGER),
  description,
  is_active,
  created_at
FROM membership_types_backup;
DROP TABLE membership_types_backup;
-- 3. pt_packages 테이블의 price 컬럼을 INTEGER로 변경
CREATE TABLE pt_packages_backup AS
SELECT *
FROM pt_packages;
DROP TABLE pt_packages;
CREATE TABLE pt_packages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT UNIQUE NOT NULL,
  session_count INTEGER NOT NULL,
  price INTEGER NOT NULL,
  -- DECIMAL에서 INTEGER로 변경
  validity_days INTEGER DEFAULT 90,
  description TEXT,
  is_active BOOLEAN DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO pt_packages (
    id,
    name,
    session_count,
    price,
    validity_days,
    description,
    is_active,
    created_at
  )
SELECT id,
  name,
  session_count,
  CAST(price AS INTEGER),
  validity_days,
  description,
  is_active,
  created_at
FROM pt_packages_backup;
DROP TABLE pt_packages_backup;
-- 4. 인덱스 재생성
CREATE INDEX IF NOT EXISTS idx_payments_member_id ON payments(member_id);
CREATE INDEX IF NOT EXISTS idx_payments_date ON payments(payment_date);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_member_staff ON payments(member_id, staff_id);
CREATE INDEX IF NOT EXISTS idx_payments_date_type ON payments(payment_date, payment_type);
-- 5. 트리거 재생성
-- PT 세션 잔여 횟수 자동 계산 트리거 (이미 존재하면 재생성)
DROP TRIGGER IF EXISTS update_pt_remaining_sessions;
CREATE TRIGGER update_pt_remaining_sessions
AFTER
UPDATE OF used_sessions ON pt_sessions BEGIN
UPDATE pt_sessions
SET remaining_sessions = COALESCE(total_sessions, 0) - COALESCE(NEW.used_sessions, 0)
WHERE id = NEW.id;
END;
-- 결제 변경 시 자동 이력 저장 트리거 (이미 존재하면 재생성)
DROP TRIGGER IF EXISTS log_payment_changes;
CREATE TRIGGER log_payment_changes
AFTER
UPDATE ON payments BEGIN
INSERT INTO payment_history (
    payment_id,
    action,
    old_value,
    new_value,
    performed_by
  )
VALUES (
    NEW.id,
    'updated',
    json_object('status', OLD.status, 'amount', OLD.amount),
    json_object('status', NEW.status, 'amount', NEW.amount),
    NEW.staff_id
  );
END;
-- 6. 기본 데이터 업데이트 (가격을 정수로 변환)
-- 기존 데이터가 있는 경우 가격을 정수로 업데이트
UPDATE membership_types
SET price = price
WHERE price = price;
-- 이미 변환됨
UPDATE pt_packages
SET price = price
WHERE price = price;
-- 이미 변환됨
COMMIT;