-- Migration: Expand payment management system
-- Created: 2024-01-16
-- Description: Add comprehensive payment management tables for fitness CRM
-- 1. 기존 payments 테이블에 락커 결제 지원 컬럼 추가
-- 기존 payment_method 제약조건은 그대로 유지하고 확장
ALTER TABLE payments
ADD COLUMN locker_type TEXT;
-- 'individual', 'couple', etc.
ALTER TABLE payments
ADD COLUMN expiry_date DATE;
-- 회원권/락커 만료일
ALTER TABLE payments
ADD COLUMN auto_renewal BOOLEAN DEFAULT 0;
-- 자동 갱신 여부
-- 2. 결제 상세 항목 테이블 생성 (복합 결제 지원)
CREATE TABLE IF NOT EXISTS payment_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  payment_id INTEGER NOT NULL,
  item_type TEXT NOT NULL CHECK(item_type IN ('membership', 'pt', 'locker')),
  item_subtype TEXT,
  -- '1m', '3m', '12m' or '5sessions', '10sessions', '20sessions'
  item_name TEXT NOT NULL,
  -- '1개월 회원권', '10회 피티', '개인 락커'
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price INTEGER NOT NULL,
  -- 원 단위 (정수)
  total_amount INTEGER NOT NULL,
  -- 원 단위 (정수)
  specifications TEXT,
  -- JSON 형태 추가 정보
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (payment_id) REFERENCES payments(id) ON DELETE CASCADE
);
-- 3. PT 세션 테이블 개선 (패키지 관리 기능 추가)
ALTER TABLE pt_sessions
ADD COLUMN total_sessions INTEGER;
-- 총 구매 횟수
ALTER TABLE pt_sessions
ADD COLUMN used_sessions INTEGER DEFAULT 0;
-- 사용한 횟수
ALTER TABLE pt_sessions
ADD COLUMN remaining_sessions INTEGER;
-- 남은 횟수
ALTER TABLE pt_sessions
ADD COLUMN package_expiry_date DATE;
-- 패키지 만료일
ALTER TABLE pt_sessions
ADD COLUMN package_status TEXT DEFAULT 'active' CHECK(
    package_status IN ('active', 'expired', 'cancelled')
  );
-- 4. 락커 배정 관리 테이블 생성
CREATE TABLE IF NOT EXISTS locker_assignments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  member_id INTEGER NOT NULL,
  payment_id INTEGER NOT NULL,
  locker_number TEXT NOT NULL,
  locker_type TEXT DEFAULT 'individual' CHECK(locker_type IN ('individual', 'couple')),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  monthly_fee INTEGER NOT NULL,
  -- 원 단위
  status TEXT DEFAULT 'active' CHECK(status IN ('active', 'expired', 'cancelled')),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (member_id) REFERENCES members(id),
  FOREIGN KEY (payment_id) REFERENCES payments(id),
  UNIQUE(locker_number, start_date) -- 동일 락커의 중복 배정 방지
);
-- 5. 환불 관리 테이블 생성
CREATE TABLE IF NOT EXISTS refunds (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  payment_id INTEGER NOT NULL,
  requested_by INTEGER NOT NULL,
  -- staff.id
  approved_by INTEGER,
  -- staff.id (NULL이면 대기 중)
  refund_amount INTEGER NOT NULL,
  -- 원 단위
  reason TEXT NOT NULL,
  refund_method TEXT NOT NULL CHECK(
    refund_method IN ('account_transfer', 'card_cancel', 'cash')
  ),
  account_info TEXT,
  -- 환불 계좌 정보 (암호화 저장)
  status TEXT NOT NULL DEFAULT 'pending' CHECK(
    status IN ('pending', 'approved', 'rejected', 'processed')
  ),
  requested_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  approved_at DATETIME,
  processed_at DATETIME,
  notes TEXT,
  FOREIGN KEY (payment_id) REFERENCES payments(id),
  FOREIGN KEY (requested_by) REFERENCES staff(id),
  FOREIGN KEY (approved_by) REFERENCES staff(id)
);
-- 6. 결제 이력 추적 테이블 생성
CREATE TABLE IF NOT EXISTS payment_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  payment_id INTEGER NOT NULL,
  action TEXT NOT NULL CHECK(
    action IN (
      'created',
      'updated',
      'refund_requested',
      'refunded',
      'cancelled'
    )
  ),
  old_value TEXT,
  -- JSON 형태로 이전 값
  new_value TEXT,
  -- JSON 형태로 새 값
  performed_by INTEGER NOT NULL,
  -- staff.id
  notes TEXT,
  ip_address TEXT,
  -- 보안 추적용
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (payment_id) REFERENCES payments(id),
  FOREIGN KEY (performed_by) REFERENCES staff(id)
);
-- 7. 중요한 인덱스 생성 (성능 최적화)
CREATE INDEX IF NOT EXISTS idx_payments_member_staff ON payments(member_id, staff_id);
CREATE INDEX IF NOT EXISTS idx_payments_date_type ON payments(payment_date, payment_type);
CREATE INDEX IF NOT EXISTS idx_payment_items_payment ON payment_items(payment_id);
CREATE INDEX IF NOT EXISTS idx_payment_items_type ON payment_items(item_type);
CREATE INDEX IF NOT EXISTS idx_locker_assignments_member ON locker_assignments(member_id);
CREATE INDEX IF NOT EXISTS idx_locker_assignments_status ON locker_assignments(status);
CREATE INDEX IF NOT EXISTS idx_locker_assignments_dates ON locker_assignments(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_refunds_status ON refunds(status);
CREATE INDEX IF NOT EXISTS idx_refunds_payment ON refunds(payment_id);
CREATE INDEX IF NOT EXISTS idx_payment_history_payment ON payment_history(payment_id);
CREATE INDEX IF NOT EXISTS idx_payment_history_action ON payment_history(action);
-- 8. 트리거 생성 (데이터 일관성 보장)
-- PT 세션 잔여 횟수 자동 계산
CREATE TRIGGER IF NOT EXISTS update_pt_remaining_sessions
AFTER
UPDATE OF used_sessions ON pt_sessions BEGIN
UPDATE pt_sessions
SET remaining_sessions = COALESCE(total_sessions, 0) - COALESCE(NEW.used_sessions, 0)
WHERE id = NEW.id;
END;
-- 결제 변경 시 자동 이력 저장
CREATE TRIGGER IF NOT EXISTS log_payment_changes
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
-- 9. 기존 결제 방식에 새로운 옵션 추가를 위한 제약조건 업데이트 준비
-- 기존: ('현금', '카드', '계좌이체', '기타')
-- 새로운 제약조건은 애플리케이션 레벨에서 처리하여 호환성 유지
-- 10. 기본 락커 설정 데이터 (예시)
INSERT
  OR IGNORE INTO locker_assignments (
    member_id,
    payment_id,
    locker_number,
    locker_type,
    start_date,
    end_date,
    monthly_fee,
    status
  )
SELECT 1,
  -- 예시 member_id (실제로는 존재하는 회원 ID 필요)
  1,
  -- 예시 payment_id (실제로는 존재하는 결제 ID 필요)
  'A001',
  -- 락커 번호
  'individual',
  '2024-01-01',
  '2024-12-31',
  30000,
  -- 월 30,000원
  'active'
WHERE EXISTS (
    SELECT 1
    FROM members
    WHERE id = 1
    LIMIT 1
  )
  AND EXISTS (
    SELECT 1
    FROM payments
    WHERE id = 1
    LIMIT 1
  );