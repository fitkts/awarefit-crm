# 🏋️‍♂️ Awarefit CRM

> 피트니스 센터를 위한 현대적인 회원 관리 시스템

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-4.9+-blue.svg)](https://www.typescriptlang.org/)
[![Electron](https://img.shields.io/badge/Electron-Latest-brightgreen.svg)](https://www.electronjs.org/)
[![React](https://img.shields.io/badge/React-18+-blue.svg)](https://reactjs.org/)

## 📋 프로젝트 소개

Awarefit CRM은 피트니스 센터의 회원, 직원, 결제를 효율적으로 관리할 수 있는 데스크톱 애플리케이션입니다.

### ✨ 주요 기능

- 👥 **회원 관리**: 등록, 수정, 조회, 통계
- 👨‍💼 **직원 관리**: 직원 정보, 급여 관리
- 💳 **결제 관리**: 결제 내역, 환불 처리
- 📊 **대시보드**: 실시간 통계 및 분석
- 🔍 **고급 검색**: 다양한 필터링 옵션

### 🛠️ 기술 스택

- **Frontend**: React 18 + TypeScript
- **Backend**: Electron Main Process
- **Database**: SQLite (better-sqlite3)
- **Styling**: Tailwind CSS
- **Testing**: Jest + Playwright
- **Build**: Webpack + Electron Builder

## 🚀 시작하기

### 📋 필수 요구사항

- Node.js 16 이상
- npm 또는 yarn
- Git

### 📦 설치 및 실행

```bash
# 저장소 클론
git clone https://github.com/your-username/awarefit-crm.git
cd awarefit-crm

# 의존성 설치
npm install

# 개발 서버 실행
npm run dev

# 웹 전용 개발 서버 (브라우저 테스트용)
npm run dev:webpack

# Electron만 실행
npm run dev:electron
```

### 🧪 테스트

```bash
# 단위 테스트
npm test

# E2E 테스트
npx playwright test

# 테스트 커버리지
npm run test:coverage
```

### 🔍 코드 품질 검사

```bash
# TypeScript 타입 체크
npm run type-check

# ESLint 검사
npm run lint

# 코드 포맷팅
npm run format

# 전체 품질 검사
npm run check-all

# 자동 수정
npm run fix-all
```

### 🏥 시스템 헬스체크

```bash
# 전체 시스템 상태 체크
npm run health-check

# 기본 상태 체크
npm run health-check:basic

# 프로젝트 진단
npm run doctor
```

## 📁 프로젝트 구조

```
src/
├── components/          # React 컴포넌트
│   ├── common/         # 공통 컴포넌트
│   ├── member/         # 회원 관련 컴포넌트
│   ├── staff/          # 직원 관련 컴포넌트
│   ├── payment/        # 결제 관련 컴포넌트
│   └── ui/            # UI 기본 컴포넌트
├── pages/              # 페이지 컴포넌트
├── main/               # Electron 메인 프로세스
│   ├── ipc/           # IPC 핸들러
│   └── services/      # 백엔드 서비스
├── types/              # TypeScript 타입 정의
├── utils/              # 유틸리티 함수
├── database/           # 데이터베이스 관련
│   ├── models/        # 데이터 모델
│   ├── repositories/  # 데이터 접근 계층
│   └── migrations/    # DB 마이그레이션
└── __tests__/          # 테스트 파일
```

## 🔧 개발 가이드

### 📝 코딩 스타일

- **TypeScript**: 엄격한 타입 정의
- **React**: 함수형 컴포넌트 + Hooks
- **CSS**: Tailwind CSS 사용
- **테스트**: 기능 개발 시 테스트 케이스 필수 작성

### 🎯 개발 워크플로우

1. **기능 설계** 및 타입 정의
2. **컴포넌트 개발** (UI 우선)
3. **API 연동** (IPC 핸들러)
4. **테스트 작성** (E2E + 단위 테스트)
5. **코드 품질 검사** (타입체크 + 린트)
6. **커밋 및 푸시**

### 🔒 커밋 규칙

```bash
✨ feat: 새로운 기능 추가
🐛 fix: 버그 수정
📚 docs: 문서 업데이트
💄 style: 코드 스타일 변경
♻️ refactor: 코드 리팩토링
🧪 test: 테스트 추가/수정
⚡ perf: 성능 개선
🔧 chore: 기타 작업
```

## 🛠️ 빌드 및 배포

```bash
# 프로덕션 빌드
npm run build

# Electron 앱 빌드
npm run build:electron

# 안전한 빌드 (품질 검사 포함)
npm run safe-build

# 릴리즈 빌드
npm run release
```

## 📊 자동화 스크립트

프로젝트에는 개발 효율성을 높이는 다양한 자동화 스크립트가 포함되어 있습니다:

- **품질 대시보드**: `npm run quality-dashboard`
- **자동 체크리스트**: `npm run auto-checklist`
- **SQL 검증**: `npm run validate-sql`
- **테스트 자동화**: `scripts/test-*.js`
- **전체 자동 수정**: `npm run auto-fix-all`

## 🤝 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m '✨ feat: Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다. 자세한 내용은 `LICENSE` 파일을 참조하세요.

## 📞 지원

문제가 발생하거나 질문이 있으시면:

- 📧 이슈 등록: [GitHub Issues](https://github.com/your-username/awarefit-crm/issues)
- 📖 문서: `docs/` 폴더 참조
- 🔧 자동 진단: `npm run doctor`

---

**🎯 핵심 원칙**: "기능 개발 = 테스트 개발"  
안정적이고 신뢰할 수 있는 피트니스 관리 시스템을 함께 만들어갑니다! 💪
