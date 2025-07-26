module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat',     // 새로운 기능
        'fix',      // 버그 수정
        'docs',     // 문서 수정
        'style',    // 코드 포맷팅, 세미콜론 누락, 코드 변경 없음
        'refactor', // 코드 리팩토링
        'test',     // 테스트 추가, 테스트 리팩토링
        'chore',    // 빌드 업무 수정, 패키지 매니저 수정
        'perf',     // 성능 개선
        'ci',       // CI 관련 설정
        'build',    // 빌드 시스템 또는 외부 종속성에 영향을 주는 변경사항
        'revert',   // 커밋 되돌리기
      ],
    ],
    'type-case': [2, 'always', 'lower-case'],
    'type-empty': [2, 'never'],
    'scope-case': [2, 'always', 'lower-case'],
    'subject-case': [
      2,
      'never',
      ['sentence-case', 'start-case', 'pascal-case', 'upper-case'],
    ],
    'subject-empty': [2, 'never'],
    'subject-full-stop': [2, 'never', '.'],
    'header-max-length': [2, 'always', 72],
  },
}; 