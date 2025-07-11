# 🐙 Git & GitHub 완전 정복 가이드

> 비개발자를 위한 Git과 GitHub 사용법 - 처음부터 끝까지!

## 📚 목차
1. [Git이란 무엇인가?](#git이란-무엇인가)
2. [GitHub 계정 만들기](#github-계정-만들기)
3. [처음 GitHub에 올리기](#처음-github에-올리기)
4. [일상적인 Git 명령어들](#일상적인-git-명령어들)
5. [커밋 확인하고 관리하기](#커밋-확인하고-관리하기)
6. [GitHub에서 코드 가져오기](#github에서-코드-가져오기)
7. [문제 상황 해결하기](#문제-상황-해결하기)
8. [실무에서 자주 쓰는 패턴](#실무에서-자주-쓰는-패턴)

## 🤔 Git이란 무엇인가?

### 쉽게 설명하면
- **Git**: 코드의 "변경 이력"을 저장하는 도구 (로컬 컴퓨터에서)
- **GitHub**: Git으로 저장한 코드를 온라인에 백업하고 공유하는 서비스

### 왜 사용하나요?
- 🔄 **버전 관리**: "이전 버전으로 되돌리기" 가능
- 💾 **백업**: 컴퓨터가 고장나도 코드가 안전함
- 👥 **협업**: 여러 사람이 함께 개발 가능
- 📝 **이력 추적**: 언제 누가 무엇을 바꿨는지 기록

## 🚀 GitHub 계정 만들기

### 1단계: GitHub 가입
1. [github.com](https://github.com)에 접속
2. "Sign up" 클릭
3. 이메일, 사용자명, 비밀번호 입력
4. 이메일 인증 완료

### 2단계: Git 설정 (최초 1회만)
```bash
# 본인 정보 설정 (GitHub 계정과 동일하게)
git config --global user.name "당신의이름"
git config --global user.email "your.email@example.com"

# 설정 확인
git config --list
```

### 3단계: SSH 키 설정 (선택사항, 하지만 권장)
```bash
# SSH 키 생성
ssh-keygen -t ed25519 -C "your.email@example.com"

# 생성된 공개키 복사 (Mac)
cat ~/.ssh/id_ed25519.pub | pbcopy

# 생성된 공개키 복사 (Windows)
cat ~/.ssh/id_ed25519.pub
```

그 다음:
1. GitHub → Settings → SSH and GPG keys
2. "New SSH key" 클릭
3. 복사한 키 붙여넣기
4. "Add SSH key" 클릭

## 🎯 처음 GitHub에 올리기

### 방법 1: 기존 프로젝트를 GitHub에 올리기

```bash
# 1. 프로젝트 폴더로 이동
cd /Users/taeseokkim/Awarefit-CRM

# 2. Git 저장소 초기화 (이미 했다면 생략)
git init

# 3. 모든 파일 추가
git add .

# 4. 첫 번째 커밋 생성
git commit -m "🎉 프로젝트 초기 설정 완료"

# 5. GitHub에서 새 저장소 만들기 (웹에서)
# - github.com에서 "New repository" 클릭
# - Repository name: "Awarefit-CRM" 입력
# - "Create repository" 클릭

# 6. 로컬과 GitHub 연결
git branch -M main
git remote add origin https://github.com/당신의사용자명/Awarefit-CRM.git

# 7. GitHub에 처음 업로드
git push -u origin main
```

### 방법 2: GitHub에서 시작하기

```bash
# 1. GitHub에서 저장소 만들기 후 복사
git clone https://github.com/당신의사용자명/저장소이름.git

# 2. 폴더로 이동
cd 저장소이름

# 3. 코드 작업 후 업로드
git add .
git commit -m "기능 추가"
git push
```

## 📝 일상적인 Git 명령어들

### 기본 워크플로우 (매일 사용)

```bash
# 1. 현재 상태 확인
git status

# 2. 변경된 파일들 추가
git add .                    # 모든 파일
git add src/components/      # 특정 폴더만
git add package.json         # 특정 파일만

# 3. 커밋 생성 (변경사항 저장)
git commit -m "회원 검색 기능 추가"

# 4. GitHub에 업로드
git push
```

### 의미있는 커밋 메시지 작성법

```bash
# ✅ 좋은 예시들
git commit -m "✨ 회원 등록 폼에 유효성 검사 추가"
git commit -m "🐛 회원 목록 페이지네이션 버그 수정"
git commit -m "💄 로그인 페이지 UI 개선"
git commit -m "📝 사용자 가이드 문서 업데이트"

# ❌ 나쁜 예시들
git commit -m "수정"
git commit -m "업데이트"
git commit -m "작업중"
```

### 유용한 이모지들
- ✨ `:sparkles:` - 새 기능
- 🐛 `:bug:` - 버그 수정
- 💄 `:lipstick:` - UI/스타일 개선
- ♻️ `:recycle:` - 코드 리팩토링
- 📝 `:memo:` - 문서 추가/수정
- 🎉 `:tada:` - 프로젝트 시작
- 🚀 `:rocket:` - 배포 관련

## 🔍 커밋 확인하고 관리하기

### 커밋 이력 보기

```bash
# 최근 커밋들 보기 (간단)
git log --oneline

# 상세한 커밋 이력
git log

# 예쁘게 그래프로 보기
git log --graph --oneline --all

# 최근 5개만 보기
git log --oneline -5

# 특정 파일의 변경 이력
git log --oneline src/pages/Members.tsx
```

### 특정 커밋 정보 확인

```bash
# 특정 커밋의 상세 내용 보기
git show 커밋해시

# 두 커밋 간 차이점 보기
git diff 이전커밋해시 최신커밋해시

# 현재 작업 중인 변경사항 보기
git diff
```

### 커밋 수정하기

```bash
# 마지막 커밋 메시지 수정
git commit --amend -m "새로운 커밋 메시지"

# 마지막 커밍에 파일 추가
git add 추가할파일.txt
git commit --amend --no-edit

# ⚠️ 주의: 이미 push한 커밋은 수정하지 마세요!
```

## 📥 GitHub에서 코드 가져오기

### 처음 가져오기 (Clone)

```bash
# HTTPS 방식
git clone https://github.com/사용자명/저장소명.git

# SSH 방식 (SSH 키 설정했다면)
git clone git@github.com:사용자명/저장소명.git

# 특정 폴더명으로 가져오기
git clone https://github.com/사용자명/저장소명.git 내가원하는폴더명
```

### 최신 변경사항 가져오기 (Pull)

```bash
# GitHub의 최신 변경사항 가져오기
git pull

# 더 안전한 방법 (권장)
git fetch                # 변경사항 확인
git pull                 # 실제로 가져오기
```

### 다른 사람의 저장소 복사하기 (Fork)

1. GitHub에서 원하는 저장소 방문
2. "Fork" 버튼 클릭
3. 내 계정으로 복사됨
4. 복사된 저장소를 Clone

```bash
git clone https://github.com/내계정/복사된저장소명.git
```

## 🚨 문제 상황 해결하기

### 실수했을 때 되돌리기

```bash
# 1. 아직 커밋하지 않은 변경사항 취소
git checkout -- 파일명              # 특정 파일만
git reset --hard                    # 모든 변경사항 취소 (주의!)

# 2. 마지막 커밋 취소 (변경사항은 유지)
git reset --soft HEAD~1

# 3. 마지막 커밋 완전히 삭제 (주의!)
git reset --hard HEAD~1

# 4. 특정 커밋으로 돌아가기
git reset --hard 커밋해시
```

### 충돌(Conflict) 해결하기

```bash
# pull할 때 충돌이 발생했다면:
git pull                            # 충돌 발생!

# 1. 충돌된 파일을 Cursor에서 열어서 수정
# 2. <<<<<<<, =======, >>>>>>> 표시 제거
# 3. 원하는 코드만 남기기
# 4. 수정 완료 후:

git add .
git commit -m "충돌 해결"
```

### 실수로 삭제한 파일 복구

```bash
# 커밋된 파일 복구
git checkout HEAD -- 삭제된파일명

# 특정 커밋에서 파일 복구
git checkout 커밋해시 -- 파일명
```

## 💼 실무에서 자주 쓰는 패턴

### 일일 작업 루틴

```bash
# 아침: 작업 시작 전
git pull                            # 최신 변경사항 받기
git status                          # 현재 상태 확인

# 작업 중: 중간중간 저장
git add .
git commit -m "작업 중간 저장: 로그인 폼 구현"

# 저녁: 하루 작업 마무리
git add .
git commit -m "✨ 로그인 기능 완성"
git push                           # GitHub에 백업
```

### 기능 개발 패턴

```bash
# 새 기능 시작
git add .
git commit -m "🚧 회원 관리 기능 개발 시작"

# 기능 완성
git add .
git commit -m "✨ 회원 등록/수정/삭제 기능 완성"

# 테스트 완료
git add .
git commit -m "✅ 회원 관리 기능 테스트 완료"
git push
```

### 브랜치 사용하기 (고급)

```bash
# 새로운 기능용 브랜치 만들기
git checkout -b feature/member-search

# 브랜치에서 작업
git add .
git commit -m "✨ 회원 검색 기능 추가"

# 메인 브랜치로 돌아가기
git checkout main

# 브랜치 병합하기
git merge feature/member-search

# 사용 완료된 브랜치 삭제
git branch -d feature/member-search
```

## 📋 자주 사용하는 Git 명령어 모음

### 📊 상태 확인
| 명령어 | 용도 |
|--------|------|
| `git status` | 현재 상태 확인 |
| `git log --oneline` | 커밋 이력 보기 |
| `git diff` | 변경사항 보기 |
| `git remote -v` | 연결된 저장소 확인 |

### 💾 저장하기
| 명령어 | 용도 |
|--------|------|
| `git add .` | 모든 변경사항 추가 |
| `git commit -m "메시지"` | 커밋 생성 |
| `git push` | GitHub에 업로드 |
| `git push -u origin main` | 처음 업로드할 때 |

### 📥 가져오기
| 명령어 | 용도 |
|--------|------|
| `git clone URL` | 저장소 복사 |
| `git pull` | 최신 변경사항 가져오기 |
| `git fetch` | 변경사항 확인만 |

### 🔄 되돌리기
| 명령어 | 용도 |
|--------|------|
| `git reset --soft HEAD~1` | 마지막 커밋 취소 (파일 유지) |
| `git reset --hard HEAD~1` | 마지막 커밋 완전 삭제 |
| `git checkout -- 파일명` | 파일 변경사항 취소 |

## 🎯 Awarefit CRM 프로젝트 전용 Git 워크플로우

### 매일 개발 시작할 때
```bash
cd /Users/taeseokkim/Awarefit-CRM
git status
git pull  # 혹시 다른 곳에서 작업했다면
npm run quick-start
```

### 기능 개발 완료 후
```bash
git add .
git commit -m "✨ 새로운 기능 설명"
git push
```

### 주요 마일스톤 완료 후
```bash
git add .
git commit -m "🎉 v1.0 회원 관리 기능 완성"
git tag v1.0.0
git push origin v1.0.0
```

## 💡 꿀팁들

### 1. 커밋 전 체크리스트
- [ ] `npm run health-check`로 에러 없는지 확인
- [ ] 의미있는 커밋 메시지 작성
- [ ] 너무 많은 변경사항을 한 번에 커밋하지 않기

### 2. 유용한 Git 별칭 설정
```bash
git config --global alias.st status
git config --global alias.co checkout  
git config --global alias.br branch
git config --global alias.cm commit
git config --global alias.lg "log --oneline --graph"
```

이제 이렇게 쓸 수 있어요:
```bash
git st      # git status 대신
git lg      # git log --oneline --graph 대신
```

### 3. .gitignore 파일 활용
이미 설정되어 있지만, 추가로 무시하고 싶은 파일이 있다면:
```bash
echo "무시할파일.txt" >> .gitignore
git add .gitignore
git commit -m "📝 gitignore 업데이트"
```

## 🆘 자주 하는 실수와 해결법

### 실수 1: 잘못된 파일을 커밋했을 때
```bash
git reset --soft HEAD~1
# 필요한 파일만 다시 선택
git add 올바른파일.txt
git commit -m "올바른 커밋 메시지"
```

### 실수 2: 커밋 메시지를 잘못 썼을 때
```bash
git commit --amend -m "올바른 커밋 메시지"
```

### 실수 3: 중요한 파일을 실수로 삭제했을 때
```bash
git checkout HEAD -- 삭제된파일.txt
```

### 실수 4: push 후에 문제를 발견했을 때
```bash
# 새로운 커밋으로 문제 해결 (권장)
git add .
git commit -m "🐛 이전 커밋 문제 수정"
git push
```

---

## 🎓 마무리

Git과 GitHub는 처음에는 어려워 보이지만, 기본 명령어들만 익숙해지면 정말 유용한 도구입니다!

**기억하세요**:
- 🔄 자주 커밋하고 push하세요 (백업의 개념)
- 📝 의미있는 커밋 메시지를 작성하세요
- 🚨 문제가 생기면 당황하지 말고 차근차근 해결하세요
- 💡 모르는 것이 있으면 언제든 AI에게 물어보세요!

**AI에게 이렇게 질문하세요**:
- "git에서 이 에러가 나는데 어떻게 해결하지?"
- "실수로 파일을 삭제했는데 복구할 수 있을까?"
- "커밋 메시지를 잘못 썼는데 수정할 수 있어?"

Happy Coding! 🚀 