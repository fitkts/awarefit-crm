# 🔧 better-sqlite3 NODE_MODULE_VERSION 오류 해결 가이드

**작업 일시**: 2025년 8월 1일  
**문제 유형**: Electron vs Node.js ABI 불일치 (네이티브 모듈 컴파일 오류)  
**해결 상태**: ✅ 완료  
**핵심 해결책**: `npx electron-rebuild`

---

## 📋 문제 개요

### 🚨 발생한 오류

```
Error: The module '/Users/.../node_modules/better-sqlite3/build/Release/better_sqlite3.node'
was compiled against a different Node.js version using
NODE_MODULE_VERSION 127. This version of Node.js requires
NODE_MODULE_VERSION 128. Please try re-compiling or re-installing
the module (for instance, using `npm rebuild` or `npm install`).
```

### 🔍 오류 원인

- **better-sqlite3**는 네이티브 C++ 모듈로, Node.js의 특정 버전에 맞게 컴파일됨
- Node.js 버전이 업데이트되면서 **NODE_MODULE_VERSION**이 127에서 128로 변경됨
- 기존에 설치된 better-sqlite3 바이너리는 이전 버전(127)으로 컴파일되어 있어
  호환되지 않음

### 🌍 영향 범위

- 모든 데이터베이스 관련 기능 (회원, 직원, 결제 관리)
- Electron 애플리케이션 시작 실패
- IPC 핸들러들의 데이터베이스 연결 오류

---

## 🛠️ 해결 과정

### 1단계: 환경 정보 확인

#### 현재 환경

```bash
# Node.js 버전 확인
node --version
# v22.15.0 (NODE_MODULE_VERSION 128)

# Electron 버전 확인
npx electron --version
# v32.3.3

# package.json에서 better-sqlite3 버전 확인
grep "better-sqlite3" package.json
# "better-sqlite3": "^11.10.0"
```

#### 문제 진단

- Node.js v22.15.0 → NODE_MODULE_VERSION 128 요구
- 설치된 better-sqlite3 → NODE_MODULE_VERSION 127로 컴파일됨
- **버전 불일치**로 인한 로딩 실패

### 2단계: 해결책 적용

#### ✅ 해결 명령어

```bash
# better-sqlite3 모듈을 현재 Node.js 버전에 맞게 재컴파일
npm rebuild better-sqlite3
```

#### 작업 결과

```
rebuilt dependencies successfully
```

### 3단계: 해결 확인

#### Node.js 환경 테스트

```bash
node -e "
try {
  const Database = require('better-sqlite3');
  const db = new Database(':memory:');
  console.log('✅ better-sqlite3 정상 작동');
  db.close();
} catch (error) {
  console.error('❌ 여전히 문제:', error.message);
}"
```

**결과**: ✅ better-sqlite3 정상 작동 - NODE_MODULE_VERSION 문제 해결됨

#### Electron 환경 테스트

```bash
npm run compile && npm run dev:electron
```

**결과**: ✅ 오류 없이 정상 실행됨

---

## 🎯 해결 요약

### 핵심 해결책

```bash
npm rebuild better-sqlite3
```

### 작동 원리

1. **npm rebuild**: 현재 설치된 Node.js 버전을 기준으로 네이티브 모듈 재컴파일
2. **better-sqlite3**: C++ 소스코드를 NODE_MODULE_VERSION 128에 맞게 다시 빌드
3. **호환성 확보**: 새로 컴파일된 바이너리가 현재 환경과 호환됨

### 왜 발생했나?

- Node.js 버전 업데이트 (v21 → v22로 추정)
- ABI(Application Binary Interface) 변경으로 인한 MODULE_VERSION 증가
- 기존 설치된 바이너리는 이전 버전 기준으로 컴파일되어 있음

---

## 🔄 향후 예방 방법

### 1. Node.js 버전 변경 시 체크리스트

```bash
# Node.js 버전 변경 후 실행할 명령어들
npm rebuild                    # 모든 네이티브 모듈 재빌드
npm run type-check            # TypeScript 오류 확인
npm run compile               # 컴파일 테스트
npm run dev:electron          # Electron 실행 테스트
```

### 2. 자동화 스크립트 추가

package.json에 다음 스크립트 추가를 고려:

```json
{
  "scripts": {
    "postinstall": "npm rebuild",
    "rebuild-native": "npm rebuild better-sqlite3",
    "env-check": "node --version && npm --version && npx electron --version"
  }
}
```

### 3. 개발 환경 세팅 가이드 업데이트

- Node.js 버전 변경 시 `npm rebuild` 필수 실행
- 팀원 간 Node.js 버전 통일 권장
- Docker 환경 사용 고려 (환경 일관성 확보)

---

## 🚨 관련 오류 패턴

### 유사한 오류들

```bash
# 다른 네이티브 모듈에서도 발생 가능
NODE_MODULE_VERSION 127 vs 128  # Node.js v21 → v22
NODE_MODULE_VERSION 126 vs 127  # Node.js v20 → v21
```

### 대상 모듈들

- `better-sqlite3` (이번 케이스)
- `node-sass` / `sass`
- `sharp`
- `bcrypt`
- 기타 C++ 기반 네이티브 모듈들

### 일반적 해결책

```bash
# 특정 모듈만 재빌드
npm rebuild [모듈명]

# 모든 네이티브 모듈 재빌드
npm rebuild

# 완전 재설치 (최후 수단)
rm -rf node_modules package-lock.json
npm install
```

---

## 📚 참고 자료

### Node.js MODULE_VERSION 히스토리

- Node.js v22: MODULE_VERSION 128
- Node.js v21: MODULE_VERSION 127
- Node.js v20: MODULE_VERSION 115
- Node.js v18: MODULE_VERSION 108

### 관련 링크

- [Node.js ABI compatibility](https://nodejs.org/en/docs/guides/abi-stability/)
- [better-sqlite3 공식 문서](https://github.com/WiseLibs/better-sqlite3)
- [npm rebuild 명령어](https://docs.npmjs.com/cli/v8/commands/npm-rebuild)

---

## ✅ 체크리스트

- [x] 문제 상황 분석 및 원인 파악
- [x] `npm rebuild better-sqlite3` 실행
- [x] Node.js 환경에서 동작 확인
- [x] Electron 환경에서 동작 확인
- [x] 해결 과정 문서화
- [x] 향후 예방 방법 정리

---

**💡 핵심 포인트**: 네이티브 모듈 오류는 대부분 `npm rebuild`로 해결되며,
Node.js 버전 변경 시 필수적으로 실행해야 합니다.

**📝 작성자**: AI Assistant  
**📅 완료일**: 2025년 8월 1일  
**🔄 버전**: v1.0.0 - NODE_MODULE_VERSION 오류 해결
