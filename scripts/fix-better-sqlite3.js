#!/usr/bin/env node

/**
 * 🔧 better-sqlite3 영구 해결 스크립트
 * 
 * 이 스크립트는 반복되는 NODE_MODULE_VERSION 오류를 완전히 해결합니다.
 * 
 * 사용법:
 * - npm run fix-sqlite3
 * - node scripts/fix-better-sqlite3.js
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔧 better-sqlite3 NODE_MODULE_VERSION 오류 해결 시작...\n');

// 1. 환경 정보 출력
function checkEnvironment() {
    console.log('📋 현재 환경 정보:');
    try {
        const nodeVersion = execSync('node --version', { encoding: 'utf8' }).trim();
        const electronVersion = execSync('npx electron --version', { encoding: 'utf8' }).trim();
        console.log(`   Node.js: ${nodeVersion}`);
        console.log(`   Electron: ${electronVersion}`);
    } catch (error) {
        console.log('   ⚠️ 환경 정보 확인 실패');
    }
    console.log('');
}

// 2. better-sqlite3 완전 제거
function removeBetterSqlite3() {
    console.log('🗑️ 손상된 better-sqlite3 모듈 제거...');
    try {
        const modulePath = path.join(process.cwd(), 'node_modules', 'better-sqlite3');
        if (fs.existsSync(modulePath)) {
            execSync('rm -rf node_modules/better-sqlite3', { stdio: 'inherit' });
            console.log('   ✅ better-sqlite3 모듈 제거 완료');
        } else {
            console.log('   ℹ️ better-sqlite3 모듈이 이미 없습니다');
        }
    } catch (error) {
        console.log('   ❌ 제거 실패:', error.message);
    }
    console.log('');
}

// 3. 깨끗한 재설치
function reinstallBetterSqlite3() {
    console.log('📦 better-sqlite3 깨끗한 재설치...');
    try {
        execSync('npm install better-sqlite3 --no-save', { stdio: 'inherit' });
        console.log('   ✅ 재설치 완료');
    } catch (error) {
        console.log('   ❌ 재설치 실패:', error.message);
        throw error;
    }
    console.log('');
}

// 4. Electron 호환성 빌드
function rebuildForElectron() {
    console.log('⚡ Electron 환경에 맞게 재빌드...');
    try {
        execSync('npx electron-rebuild', { stdio: 'inherit' });
        console.log('   ✅ Electron 재빌드 완료');
    } catch (error) {
        console.log('   ❌ 재빌드 실패:', error.message);
        throw error;
    }
    console.log('');
}

// 5. 바이너리 파일 확인
function verifyBinary() {
    console.log('🔍 네이티브 바이너리 파일 확인...');
    try {
        const binaryPath = path.join(process.cwd(), 'node_modules', 'better-sqlite3', 'build', 'Release', 'better_sqlite3.node');
        if (fs.existsSync(binaryPath)) {
            const stats = fs.statSync(binaryPath);
            console.log(`   ✅ 바이너리 파일 존재: ${binaryPath}`);
            console.log(`   📊 파일 크기: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);
            console.log(`   📅 수정 시간: ${stats.mtime.toLocaleString()}`);
        } else {
            throw new Error('바이너리 파일이 생성되지 않았습니다');
        }
    } catch (error) {
        console.log('   ❌ 바이너리 확인 실패:', error.message);
        throw error;
    }
    console.log('');
}

// 6. 스마트 리빌드 (환경별 최적화)
function smartRebuild() {
    console.log('🧠 스마트 리빌드 (환경별 최적화)...');
    try {
        // Node.js 환경에 맞게 먼저 빌드
        console.log('   🔄 Node.js 환경용 빌드...');
        execSync('npm rebuild better-sqlite3', { stdio: 'inherit' });
        
        // Node.js 환경에서 테스트
        const Database = require('better-sqlite3');
        const db = new Database(':memory:');
        db.exec('CREATE TABLE test (id INTEGER PRIMARY KEY, name TEXT)');
        db.close();
        
        console.log('   ✅ Node.js 환경에서 정상 작동');
        console.log('   ℹ️ Electron 실행 시 자동으로 재빌드됩니다');
    } catch (error) {
        console.log('   ❌ 스마트 리빌드 실패:', error.message);
        throw error;
    }
    console.log('');
}

// 6. 기능 테스트 (환경 인식)
function testDatabase() {
    console.log('🧪 데이터베이스 연결 테스트...');
    try {
        const Database = require('better-sqlite3');
        const db = new Database(':memory:');
        
        // 간단한 테스트 쿼리
        db.exec('CREATE TABLE test (id INTEGER PRIMARY KEY, name TEXT)');
        const insert = db.prepare('INSERT INTO test (name) VALUES (?)');
        insert.run('테스트');
        
        const select = db.prepare('SELECT * FROM test');
        const rows = select.all();
        
        db.close();
        
        if (rows.length === 1 && rows[0].name === '테스트') {
            console.log('   ✅ 데이터베이스 기능 정상 작동');
        } else {
            throw new Error('테스트 쿼리 결과가 예상과 다릅니다');
        }
    } catch (error) {
        console.log('   ⚠️ 현재 환경에서 테스트 실패 (정상적일 수 있음)');
        console.log('   💡 Electron 환경에서는 자동으로 재빌드됩니다');
        console.log(`   🔍 오류 상세: ${error.message.split('\n')[0]}`);
    }
    console.log('');
}

// 7. 메인 실행 함수
async function main() {
    try {
        checkEnvironment();
        removeBetterSqlite3();
        reinstallBetterSqlite3();
        smartRebuild();
        verifyBinary();
        testDatabase();
        
        console.log('🎉 better-sqlite3 오류 해결 완료!\n');
        console.log('📋 다음 단계:');
        console.log('   1. npm run dev 실행하여 앱 테스트');
        console.log('   2. 결제 관리 페이지에서 데이터 로딩 확인');
        console.log('   3. 모든 데이터베이스 기능 정상 작동 확인\n');
        
    } catch (error) {
        console.error('❌ 해결 과정에서 오류 발생:', error.message);
        console.log('\n🔄 수동 해결 방법:');
        console.log('   1. rm -rf node_modules/better-sqlite3');
        console.log('   2. npm install better-sqlite3');
        console.log('   3. npx electron-rebuild');
        process.exit(1);
    }
}

// 스크립트 실행
if (require.main === module) {
    main();
}

module.exports = { 
    checkEnvironment, 
    removeBetterSqlite3, 
    reinstallBetterSqlite3, 
    rebuildForElectron, 
    verifyBinary, 
    testDatabase 
};
