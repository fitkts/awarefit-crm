# 🔧 better-sqlite3 문제해결 치트시트

## 🚨 **긴급 상황 대응**

### **증상 확인**

```bash
# 오류 메시지에서 확인할 키워드
NODE_MODULE_VERSION 127
NODE_MODULE_VERSION 128
better_sqlite3.node
ERR_DLOPEN_FAILED
```

### **즉시 해결 명령어**

```bash
# 1순위: 자동 해결 스크립트
npm run fix-sqlite3

# 2순위: 안전한 재빌드
npm run rebuild:safe

# 3순위: 수동 해결
rm -rf node_modules/better-sqlite3
npm install better-sqlite3 --no-save
npx electron-rebuild
```

## 🔍 **진단 명령어**

### **환경 확인**

```bash
node --version          # Node.js 버전
npx electron --version  # Electron 버전
npm list better-sqlite3 # 설치된 버전
```

### **바이너리 확인**

```bash
# 바이너리 파일 존재 확인
ls -la node_modules/better-sqlite3/build/Release/
find node_modules/better-sqlite3 -name "*.node" -ls
```

### **테스트 실행**

```bash
# 데이터베이스 연결 테스트
node -e "const Database = require('better-sqlite3'); const db = new Database(':memory:'); console.log('✅ 성공'); db.close();"
```

## 🛠️ **자동화 시스템 상태 확인**

### **로그 확인 키워드**

```
✅ [BetterSqlite3] 호환성 검사 통과     → 정상
🔍 [BetterSqlite3] Database 인스턴스 테스트 실패 → 자동복구 진행중
🔄 [BetterSqlite3] 완전 복구 시작      → 1단계 복구
🛠️ [BetterSqlite3] 수동 강제 수정 시작   → 2단계 복구
🛠️ 최종 시도: 완전 재설치            → 3단계 복구
✅ 데이터베이스 초기화 완료            → 성공
```

### **시스템 상태 확인**

```typescript
// 개발자 콘솔에서 실행
window.electronAPI?.system?.getDatabaseStatus?.();
```

## 📋 **문제별 해결법**

### **Case 1: 첫 실행 시 오류**

```bash
# 해결: 자동복구 대기 (10-15초)
npm run dev
# → 로그 확인 후 자동 해결됨
```

### **Case 2: npm install 후 오류**

```bash
# 해결: postinstall 자동 실행
npm install  # 자동으로 electron-rebuild 실행됨
```

### **Case 3: Electron 버전 업데이트 후**

```bash
# 해결: 강제 재빌드
npm run fix-sqlite3
```

### **Case 4: 자동복구 시스템 실패**

```bash
# 수동 완전 복구
rm -rf node_modules package-lock.json
npm install
npx electron-rebuild
```

## 🔄 **예방 조치**

### **개발 환경 설정**

```json
// package.json에 포함된 자동화 스크립트들
{
  "scripts": {
    "postinstall": "npx electron-rebuild || echo '⚠️ rebuild failed'",
    "rebuild:safe": "npm install better-sqlite3 --no-save && npx electron-rebuild",
    "fix-sqlite3": "node scripts/fix-better-sqlite3.js"
  }
}
```

### **정기 점검**

```bash
# 주간 점검 명령어
npm run type-check  # TypeScript 오류 확인
npm run lint        # 코딩 스타일 확인
npm test           # 단위 테스트
npx playwright test # E2E 테스트
```

## 📞 **지원 및 참고**

### **관련 문서**

- `docs/better-sqlite3-자동복구-시스템-완전가이드.md` - 완전한 기술 문서
- `docs/better-sqlite3-NODE_MODULE_VERSION-오류-해결-가이드.md` - 기존 가이드

### **핵심 파일**

- `src/main/services/betterSqlite3Service.ts` - 자동복구 서비스
- `src/database/init.ts` - 3단계 재시도 로직
- `scripts/fix-better-sqlite3.js` - 수동 복구 스크립트

### **긴급 연락**

```bash
# 모든 방법 실패 시 이슈 리포트
echo "환경: $(node --version) $(npx electron --version)"
echo "OS: $(uname -a)"
echo "오류 로그: [터미널 출력 복사]"
```

---

**💡 기억하세요**: 이제 대부분의 문제가 자동으로 해결됩니다!  
**🎯 핵심**: `npm run fix-sqlite3` 하나로 99% 해결
