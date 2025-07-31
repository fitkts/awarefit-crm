#!/usr/bin/env node

/**
 * 첫 번째 GitHub 업로드를 도와주는 스크립트
 * 비개발자가 쉽게 GitHub에 프로젝트를 올릴 수 있도록 안내
 */

const { execSync } = require('child_process');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function ask(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

function runCommand(command, description) {
  console.log(`\n🔄 ${description}...`);
  try {
    execSync(command, { stdio: 'inherit' });
    console.log(`✅ ${description} 완료!`);
    return true;
  } catch (error) {
    console.error(`❌ ${description} 실패:`, error.message);
    return false;
  }
}

async function main() {
  console.log('🚀 Awarefit CRM 첫 번째 GitHub 업로드 가이드\n');
  
  // Git 설정 확인
  console.log('📋 1단계: Git 설정 확인');
  try {
    const userName = execSync('git config user.name', { encoding: 'utf8' }).trim();
    const userEmail = execSync('git config user.email', { encoding: 'utf8' }).trim();
    
    console.log(`✅ Git 사용자: ${userName} <${userEmail}>`);
    
    const confirm = await ask('이 정보가 맞나요? (y/N): ');
    if (confirm.toLowerCase() !== 'y') {
      console.log('\n🔧 Git 설정을 먼저 해주세요:');
      console.log('git config --global user.name "당신의이름"');
      console.log('git config --global user.email "your.email@example.com"');
      process.exit(1);
    }
  } catch (error) {
    console.log('❌ Git 설정이 되어있지 않습니다.');
    console.log('\n🔧 다음 명령어로 Git 설정을 해주세요:');
    console.log('git config --global user.name "당신의이름"');
    console.log('git config --global user.email "your.email@example.com"');
    process.exit(1);
  }

  // GitHub 저장소 URL 입력받기
  console.log('\n📋 2단계: GitHub 저장소 설정');
  console.log('GitHub에서 새 저장소를 만드셨나요?');
  console.log('만들지 않았다면 github.com에서 "New repository"를 클릭해서 만들어주세요.\n');
  
  const repoUrl = await ask('GitHub 저장소 URL을 입력해주세요 (예: https://github.com/username/Awarefit-CRM.git): ');
  
  if (!repoUrl || !repoUrl.includes('github.com')) {
    console.log('❌ 올바른 GitHub URL을 입력해주세요.');
    process.exit(1);
  }

  // 프로젝트 상태 확인
  console.log('\n📋 3단계: 프로젝트 상태 확인');
  if (!runCommand('npm run health-check', '프로젝트 상태 확인')) {
    console.log('⚠️ 프로젝트에 문제가 있습니다. npm run fix-all을 실행해보세요.');
    const continueAnyway = await ask('그래도 계속 진행하시겠습니까? (y/N): ');
    if (continueAnyway.toLowerCase() !== 'y') {
      process.exit(1);
    }
  }

  // 파일 정리 및 추가
  console.log('\n📋 4단계: 파일 준비');
  runCommand('npm run fix-all', '코드 자동 정리');
  
  // Git 저장소 초기화 (이미 되어있을 수 있음)
  console.log('\n📋 5단계: Git 저장소 설정');
  try {
    execSync('git status', { stdio: 'ignore' });
    console.log('✅ Git 저장소가 이미 초기화되어 있습니다.');
  } catch {
    runCommand('git init', 'Git 저장소 초기화');
  }

  // 파일 추가
  runCommand('git add .', '모든 파일 추가');

  // 커밋 메시지 입력받기
  console.log('\n📋 6단계: 첫 번째 커밋 생성');
  const commitMessage = await ask('커밋 메시지를 입력해주세요 (기본값: "🎉 Awarefit CRM 프로젝트 초기 설정"): ');
  const finalCommitMessage = commitMessage.trim() || '🎉 Awarefit CRM 프로젝트 초기 설정';
  
  if (!runCommand(`git commit -m "${finalCommitMessage}"`, '첫 번째 커밋 생성')) {
    console.log('❌ 커밋 생성에 실패했습니다.');
    process.exit(1);
  }

  // 리모트 저장소 설정
  console.log('\n📋 7단계: GitHub 저장소 연결');
  runCommand('git branch -M main', '메인 브랜치 설정');
  runCommand(`git remote add origin ${repoUrl}`, 'GitHub 저장소 연결');

  // GitHub에 업로드
  console.log('\n📋 8단계: GitHub에 업로드');
  console.log('🚀 이제 GitHub에 프로젝트를 업로드합니다...');
  
  const pushSuccess = runCommand('git push -u origin main', 'GitHub에 업로드');
  
  if (pushSuccess) {
    console.log('\n🎉 축하합니다! 프로젝트가 성공적으로 GitHub에 업로드되었습니다!');
    console.log(`📂 저장소 URL: ${repoUrl.replace('.git', '')}`);
    console.log('\n💡 이제 다음 명령어들을 사용할 수 있습니다:');
    console.log('  npm run git:status    - 현재 상태 확인');
    console.log('  npm run git:save      - 변경사항 준비');
    console.log('  npm run git:backup    - 일일 백업');
    console.log('  npm run git:sync      - 빠른 저장 및 업로드');
  } else {
    console.log('\n❌ 업로드에 실패했습니다.');
    console.log('💡 가능한 해결방법:');
    console.log('1. GitHub 저장소가 비어있는지 확인');
    console.log('2. 저장소 URL이 올바른지 확인');
    console.log('3. GitHub 로그인 상태 확인');
    console.log('4. SSH 키 설정 확인 (선택사항)');
  }

  rl.close();
}

main().catch(console.error); 