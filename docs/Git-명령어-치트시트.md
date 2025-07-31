# 🚀 Git 명령어 치트시트

> 자주 사용하는 Git 명령어들을 빠르게 찾아보세요!

## 📱 npm 스크립트로 간편하게 (추천!)

### 🎯 일상 사용

```bash
npm run git:status        # 현재 상태 확인
npm run git:log          # 최근 커밋 10개 보기
npm run git:save         # 변경사항 준비 (코드 정리 + git add)
npm run git:sync         # 빠른 백업 (자동 커밋 + 푸시)
npm run git:backup       # 일일 백업 (날짜와 함께)
```

### 🔧 설정 및 시작

```bash
npm run git:setup        # Git 초기 설정 가이드
npm run git:first-push   # 첫 GitHub 업로드 (대화형)
```

### 🚨 문제 해결

```bash
npm run git:diff         # 변경사항 확인
npm run git:undo         # 마지막 커밋 취소
npm run git:pull         # 최신 변경사항 가져오기
```

---

## 🛠️ 기본 Git 명령어들

### 📊 상태 확인

```bash
git status              # 현재 상태 확인
git log --oneline       # 커밋 이력 간단히 보기
git log --graph         # 브랜치 그래프로 보기
git diff                # 변경사항 확인
git diff --staged       # 스테이징된 변경사항 확인
```

### 💾 저장하기

```bash
git add .               # 모든 변경사항 추가
git add 파일명          # 특정 파일만 추가
git commit -m "메시지"  # 커밋 생성
git push                # GitHub에 업로드
git push origin main    # 특정 브랜치에 업로드
```

### 📥 가져오기

```bash
git pull                # 최신 변경사항 가져오기
git fetch               # 변경사항 확인만 (병합X)
git clone URL           # 저장소 복사
```

### 🔄 되돌리기

```bash
git reset --soft HEAD~1     # 마지막 커밋 취소 (파일 유지)
git reset --hard HEAD~1     # 마지막 커밋 완전 삭제
git checkout -- 파일명      # 파일 변경사항 취소
git revert 커밋해시         # 특정 커밋 되돌리기 (안전)
```

---

## 🎯 시나리오별 명령어

### 🌅 매일 작업 시작할 때 (완전 자동화!)

```bash
cd /Users/taeseokkim/Awarefit-CRM

# 전체 시스템 상태 확인 (5분)
npm run health-check      # 91.7/100점 진단
npm run perf:analyze      # 성능 상태 (75%)
npm run migrate:check     # DB 상태 확인

# 안전장치 준비
npm run backup:quick      # 11초 빠른 백업

# Git 상태 확인
npm run git:status
npm run git:pull

# 개발 시작
npm run quick-start
```

### 💼 작업 완료 후 저장 (자동화됨!)

```bash
# 코드 정리 및 저장
npm run git:save
git commit -m "✨ 새로운 기능 추가"

# 자동 백업 및 업로드
npm run backup:quick      # 작업 백업
npm run git:push         # Git 업로드
```

### 🚨 급하게 백업하고 싶을 때

```bash
npm run git:sync         # Git 즉시 동기화
npm run backup:quick     # 11초 백업 (추가!)
```

### 📅 하루 작업 마무리 (완전 자동화!)

```bash
# 성능 리포트 생성
npm run perf:report      # HTML 리포트

# 전체 백업
npm run backup          # 완전 백업

# Git 백업
npm run git:backup
```

### 🗄️ 데이터베이스 작업 시 (신규!)

```bash
# DB 상태 확인
npm run migrate:check    # 마이그레이션 필요성 확인

# 안전한 DB 업데이트
npm run migrate:run      # 자동 백업 후 스키마 변경

# 문제 시 즉시 롤백
npm run migrate:rollback # 이전 상태로 복구
```

### 🔍 뭔가 이상할 때

```bash
npm run git:status
npm run git:diff
npm run git:log
```

---

## 💡 커밋 메시지 예시

### 🎨 이모지 활용법

```bash
git commit -m "✨ 회원 검색 기능 추가"
git commit -m "🐛 로그인 버그 수정"
git commit -m "💄 UI 디자인 개선"
git commit -m "📝 문서 업데이트"
git commit -m "🚀 성능 최적화"
git commit -m "🔧 설정 파일 수정"
git commit -m "♻️ 코드 리팩토링"
git commit -m "🎉 v1.0 릴리즈"
```

### 📝 구체적인 메시지 예시

```bash
git commit -m "회원 목록에 정렬 기능 추가 - 이름, 가입일순 정렬 가능"
git commit -m "회원 등록 폼 유효성 검사 강화 - 전화번호, 이메일 형식 체크"
git commit -m "데이터베이스 연결 에러 수정 - SQLite 초기화 로직 개선"
```

---

## 🚨 자주 하는 실수와 해결법

### 실수 1: 잘못된 파일을 커밋했을 때

```bash
git reset --soft HEAD~1
# 원하는 파일만 다시 추가
git add 올바른파일.js
git commit -m "올바른 커밋 메시지"
```

### 실수 2: 커밋 메시지를 잘못 썼을 때

```bash
git commit --amend -m "올바른 메시지"
```

### 실수 3: 중요한 파일을 삭제했을 때

```bash
git checkout HEAD -- 삭제된파일.js
```

### 실수 4: merge 충돌이 발생했을 때

```bash
# 1. 충돌 파일을 Cursor에서 열어서 수정
# 2. <<<<<<<, =======, >>>>>>> 표시 제거
# 3. 원하는 코드만 남기기
git add .
git commit -m "충돌 해결"
```

---

## 🔑 중요한 규칙들

### ✅ 해야 할 것들

- 🔄 자주 커밋하기 (최소 하루 1번)
- 📝 의미있는 커밋 메시지 작성
- 💾 중요한 작업 전에는 백업
- 🧹 커밋 전에 코드 정리 (`npm run fix-all`)

### ❌ 하지 말아야 할 것들

- 🚫 `git reset --hard`를 함부로 사용하지 말기
- 🚫 이미 push한 커밋을 강제로 변경하지 말기
- 🚫 너무 큰 변경사항을 한 번에 커밋하지 말기
- 🚫 의미없는 커밋 메시지 ("수정", "업데이트" 등)

---

## 📞 도움말

### 🤖 AI에게 이렇게 질문하세요

```
"git에서 이 에러가 나는데 어떻게 해결하지?"
"실수로 파일을 삭제했는데 복구할 수 있을까?"
"커밋을 잘못했는데 되돌릴 수 있어?"
"GitHub에 업로드가 안 되는데 왜 그럴까?"
```

### 📚 더 자세한 정보

- 📖 [Git & GitHub 완전정복 가이드](./Git-GitHub-완전정복-가이드.md)
- 🎯 [비개발자 개발환경 가이드](./비개발자-개발환경-가이드.md)

---

💡 **팁**: 이 치트시트를 북마크해두고 필요할 때마다 참고하세요!
