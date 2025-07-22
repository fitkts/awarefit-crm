-- Migration: Expand staff management system
-- Created: 2024-01-15  
-- Description: Add missing fields to staff table and create role/salary management tables

BEGIN TRANSACTION;

-- 1. staff 테이블에 누락된 컬럼 추가 (SQLite는 IF NOT EXISTS를 ALTER TABLE에서 지원하지 않음)
-- 컬럼 중복 생성 방지를 위해 각각을 별도로 처리

-- gender 컬럼 추가 (이미 존재할 수 있으므로 에러 무시)
-- SQLite는 컬럼 존재 체크가 어려우므로, 실행 후 에러는 무시하도록 처리
ALTER TABLE staff ADD COLUMN gender TEXT CHECK(gender IN ('남성', '여성'));

-- birth_date 컬럼 추가
ALTER TABLE staff ADD COLUMN birth_date DATE;

-- address 컬럼 추가  
ALTER TABLE staff ADD COLUMN address TEXT;

-- salary 컬럼 추가
ALTER TABLE staff ADD COLUMN salary DECIMAL(10,2);

-- department 컬럼 추가
ALTER TABLE staff ADD COLUMN department TEXT;

-- role_id 컬럼 추가 (역할 관리용)
ALTER TABLE staff ADD COLUMN role_id INTEGER;

-- notes 컬럼 추가
ALTER TABLE staff ADD COLUMN notes TEXT;

-- updated_at 컬럼 추가
ALTER TABLE staff ADD COLUMN updated_at DATETIME DEFAULT CURRENT_TIMESTAMP;

-- 2. 직원 역할 관리 테이블 생성
CREATE TABLE IF NOT EXISTS staff_roles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT UNIQUE NOT NULL,
  permissions TEXT NOT NULL, -- JSON 형태로 권한 저장
  description TEXT,
  is_active BOOLEAN DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 3. 직원 급여 조정 이력 테이블 생성
CREATE TABLE IF NOT EXISTS staff_salary_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  staff_id INTEGER NOT NULL,
  previous_salary DECIMAL(10,2),
  new_salary DECIMAL(10,2) NOT NULL,
  adjustment_amount DECIMAL(10,2) NOT NULL,
  adjustment_reason TEXT,
  effective_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_by INTEGER, -- 조정한 관리자 ID
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (staff_id) REFERENCES staff(id),
  FOREIGN KEY (created_by) REFERENCES staff(id)
);

-- 4. 회원-직원 연동을 위해 members 테이블에 담당직원 컬럼 추가
ALTER TABLE members ADD COLUMN assigned_staff_id INTEGER;

-- 5. 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_staff_active ON staff(is_active);
CREATE INDEX IF NOT EXISTS idx_staff_position ON staff(position);
CREATE INDEX IF NOT EXISTS idx_staff_department ON staff(department);
CREATE INDEX IF NOT EXISTS idx_staff_role ON staff(role_id);
CREATE INDEX IF NOT EXISTS idx_staff_salary_history_staff ON staff_salary_history(staff_id);
CREATE INDEX IF NOT EXISTS idx_staff_salary_history_date ON staff_salary_history(effective_date);
CREATE INDEX IF NOT EXISTS idx_members_assigned_staff ON members(assigned_staff_id);

-- 6. 기본 역할 데이터 삽입
INSERT OR IGNORE INTO staff_roles (name, permissions, description) VALUES 
  ('관리자', '{"member_management":true,"payment_management":true,"staff_management":true,"report_access":true,"system_settings":true}', '모든 권한을 가진 관리자'),
  ('트레이너', '{"member_management":true,"payment_management":false,"staff_management":false,"report_access":true,"system_settings":false}', 'PT 및 회원 관리 담당'),
  ('데스크', '{"member_management":true,"payment_management":true,"staff_management":false,"report_access":false,"system_settings":false}', '프론트 데스크 담당'),
  ('청소', '{"member_management":false,"payment_management":false,"staff_management":false,"report_access":false,"system_settings":false}', '시설 관리 담당');

-- 7. 기존 관리자 직원에게 관리자 역할 할당
UPDATE staff SET role_id = 1 WHERE position = '매니저' OR can_manage_payments = 1;

COMMIT; 