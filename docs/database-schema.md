# Awarefit-CRM 데이터베이스 스키마 설계

## 📊 데이터베이스 구조 개요

500명 규모에서 대규모 확장까지 고려한 체계적인 스키마 설계

### **핵심 테이블 구조 (8개)**

```
📋 Core Tables (4개)
├─ members (정식 회원)
├─ staff (직원 정보) 
├─ membership_types (회원권 타입)
└─ pt_packages (PT 패키지)

💼 Business Tables (4개)
├─ payments (결제 정보)
├─ membership_history (회원권 이용 이력)
├─ pt_sessions (PT 세션 기록)
└─ attendance (출석 기록)
```

---

## 📝 상세 테이블 설계

### 1. 회원 정보 테이블 (members)
```sql
CREATE TABLE members (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  member_number TEXT UNIQUE NOT NULL,        -- 회원번호 (예: M2025001)
  name TEXT NOT NULL,
  phone TEXT UNIQUE,
  email TEXT,
  gender TEXT CHECK(gender IN ('남성', '여성')),
  birth_date DATE,
  join_date DATE NOT NULL DEFAULT CURRENT_DATE,
  address TEXT,
  emergency_contact TEXT,                    -- 비상연락처
  emergency_phone TEXT,                      -- 비상연락처 전화번호
  notes TEXT,                               -- 특이사항
  active BOOLEAN DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### 2. 직원 정보 테이블 (staff)
```sql
CREATE TABLE staff (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  staff_number TEXT UNIQUE NOT NULL,         -- 직원번호
  name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  position TEXT,                            -- 직책 (관리자, 트레이너, 데스크 등)
  hire_date DATE NOT NULL,
  is_active BOOLEAN DEFAULT 1,
  can_manage_payments BOOLEAN DEFAULT 0,     -- 결제 권한
  can_manage_members BOOLEAN DEFAULT 1,      -- 회원 관리 권한
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### 3. 회원권 타입 테이블 (membership_types)
```sql
CREATE TABLE membership_types (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT UNIQUE NOT NULL,                -- '1개월권', '3개월권' 등
  duration_months INTEGER NOT NULL,         -- 개월 수
  price DECIMAL(10,2) NOT NULL,            -- 가격
  description TEXT,                         -- 설명
  is_active BOOLEAN DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 기본 데이터 삽입
INSERT INTO membership_types (name, duration_months, price, description) VALUES
('1개월권', 1, 100000, '1개월 무제한 이용권'),
('3개월권', 3, 270000, '3개월 무제한 이용권 (10% 할인)'),
('6개월권', 6, 480000, '6개월 무제한 이용권 (20% 할인)'),
('12개월권', 12, 840000, '12개월 무제한 이용권 (30% 할인)');
```

### 4. PT 패키지 테이블 (pt_packages)
```sql
CREATE TABLE pt_packages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT UNIQUE NOT NULL,                -- '10회권', '20회권' 등
  session_count INTEGER NOT NULL,           -- 세션 횟수
  price DECIMAL(10,2) NOT NULL,            -- 가격
  validity_days INTEGER DEFAULT 90,         -- 유효기간 (일)
  description TEXT,
  is_active BOOLEAN DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 기본 데이터 삽입
INSERT INTO pt_packages (name, session_count, price, validity_days, description) VALUES
('PT 10회권', 10, 500000, 90, 'PT 10회 이용권 (3개월 유효)'),
('PT 20회권', 20, 900000, 120, 'PT 20회 이용권 (4개월 유효)'),
('PT 30회권', 30, 1200000, 150, 'PT 30회 이용권 (5개월 유효)');
```

### 5. 결제 정보 테이블 (payments)
```sql
CREATE TABLE payments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  payment_number TEXT UNIQUE NOT NULL,      -- 결제번호
  member_id INTEGER NOT NULL,
  payment_type TEXT CHECK(payment_type IN ('membership', 'pt', 'other')),
  membership_type_id INTEGER,               -- 회원권 결제 시
  pt_package_id INTEGER,                   -- PT권 결제 시
  amount DECIMAL(10,2) NOT NULL,
  payment_method TEXT CHECK(payment_method IN ('현금', '카드', '계좌이체', '기타')),
  payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
  staff_id INTEGER NOT NULL,               -- 처리 직원
  notes TEXT,                              -- 결제 메모
  status TEXT DEFAULT 'completed' CHECK(status IN ('completed', 'refunded', 'cancelled')),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (member_id) REFERENCES members(id),
  FOREIGN KEY (membership_type_id) REFERENCES membership_types(id),
  FOREIGN KEY (pt_package_id) REFERENCES pt_packages(id),
  FOREIGN KEY (staff_id) REFERENCES staff(id)
);
```

### 6. 회원권 이용 이력 테이블 (membership_history)
```sql
CREATE TABLE membership_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  member_id INTEGER NOT NULL,
  membership_type_id INTEGER NOT NULL,
  payment_id INTEGER NOT NULL,             -- 관련 결제
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  is_active BOOLEAN DEFAULT 1,             -- 현재 활성 여부
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (member_id) REFERENCES members(id),
  FOREIGN KEY (membership_type_id) REFERENCES membership_types(id),
  FOREIGN KEY (payment_id) REFERENCES payments(id)
);
```

### 7. PT 세션 기록 테이블 (pt_sessions)
```sql
CREATE TABLE pt_sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  member_id INTEGER NOT NULL,
  pt_package_id INTEGER NOT NULL,
  payment_id INTEGER NOT NULL,             -- 관련 PT권 결제
  trainer_id INTEGER NOT NULL,             -- 담당 트레이너
  session_date DATE NOT NULL,
  session_time TIME,                       -- 세션 시간
  duration_minutes INTEGER DEFAULT 60,     -- 세션 길이 (분)
  notes TEXT,                              -- 세션 메모
  status TEXT DEFAULT 'completed' CHECK(status IN ('scheduled', 'completed', 'cancelled', 'no_show')),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (member_id) REFERENCES members(id),
  FOREIGN KEY (pt_package_id) REFERENCES pt_packages(id),
  FOREIGN KEY (payment_id) REFERENCES payments(id),
  FOREIGN KEY (trainer_id) REFERENCES staff(id)
);
```

### 8. 출석 기록 테이블 (attendance)
```sql
CREATE TABLE attendance (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  member_id INTEGER NOT NULL,
  check_in_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  check_out_time DATETIME,
  attendance_date DATE NOT NULL DEFAULT CURRENT_DATE,
  
  FOREIGN KEY (member_id) REFERENCES members(id)
);
```

---

## 📈 핵심 인덱스 (성능 최적화)

```sql
-- 회원 검색 최적화
CREATE INDEX idx_members_name ON members(name);
CREATE INDEX idx_members_phone ON members(phone);
CREATE INDEX idx_members_member_number ON members(member_number);

-- 결제 관련 최적화
CREATE INDEX idx_payments_member_id ON payments(member_id);
CREATE INDEX idx_payments_date ON payments(payment_date);
CREATE INDEX idx_payments_type ON payments(payment_type);

-- 회원권 이력 최적화
CREATE INDEX idx_membership_history_member_id ON membership_history(member_id);
CREATE INDEX idx_membership_history_active ON membership_history(is_active);
CREATE INDEX idx_membership_history_dates ON membership_history(start_date, end_date);

-- PT 세션 최적화
CREATE INDEX idx_pt_sessions_member_id ON pt_sessions(member_id);
CREATE INDEX idx_pt_sessions_trainer_id ON pt_sessions(trainer_id);
CREATE INDEX idx_pt_sessions_date ON pt_sessions(session_date);

-- 출석 최적화
CREATE INDEX idx_attendance_member_id ON attendance(member_id);
CREATE INDEX idx_attendance_date ON attendance(attendance_date);
```

---

## 🔍 핵심 비즈니스 로직 쿼리

### 활성 회원권 조회
```sql
SELECT 
  m.name,
  mt.name as membership_type,
  mh.start_date,
  mh.end_date,
  CASE 
    WHEN mh.end_date >= CURRENT_DATE THEN '활성'
    ELSE '만료'
  END as status
FROM members m
JOIN membership_history mh ON m.id = mh.member_id
JOIN membership_types mt ON mh.membership_type_id = mt.id
WHERE mh.is_active = 1
ORDER BY mh.end_date DESC;
```

### 월별 매출 통계
```sql
SELECT 
  strftime('%Y-%m', payment_date) as month,
  payment_type,
  COUNT(*) as payment_count,
  SUM(amount) as total_amount
FROM payments
WHERE status = 'completed'
GROUP BY strftime('%Y-%m', payment_date), payment_type
ORDER BY month DESC;
```

### PT 세션 잔여 횟수 조회
```sql
SELECT 
  m.name,
  pp.name as package_name,
  pp.session_count,
  COUNT(ps.id) as used_sessions,
  (pp.session_count - COUNT(ps.id)) as remaining_sessions
FROM members m
JOIN payments p ON m.id = p.member_id
JOIN pt_packages pp ON p.pt_package_id = pp.id
LEFT JOIN pt_sessions ps ON p.id = ps.payment_id AND ps.status = 'completed'
WHERE p.payment_type = 'pt' AND p.status = 'completed'
GROUP BY m.id, p.id;
```

---

## 🚀 확장성 고려사항

### Phase 2 확장을 위한 추가 고려사항:
1. **다중 지점 지원**: `branches` 테이블 추가
2. **온라인 결제**: `online_payments` 테이블
3. **모바일 앱**: `app_tokens` 테이블
4. **알림 시스템**: `notifications` 테이블

### 데이터 이관 계획:
- SQLite → PostgreSQL (클라우드 확장 시)
- 기존 데이터 무손실 이관 스크립트 준비 