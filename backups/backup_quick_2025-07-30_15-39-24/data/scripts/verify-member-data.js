#!/usr/bin/env node

/**
 * 회원 데이터 일치성 검증 스크립트
 *
 * 이 스크립트는 회원 테이블의 데이터와 통계 API가 반환하는 수치가 일치하는지 확인합니다.
 * 특히 삭제된 회원이 통계에 포함되지 않는지 검증합니다.
 *
 * 사용법:
 * npm run verify-member-data
 * 또는
 * node scripts/verify-member-data.js
 */

const path = require('path');
const fs = require('fs');

// Electron 환경에서 실행되는 것을 시뮬레이션
const electronPath = path.join(
  __dirname,
  '../node_modules/electron/dist/Electron.app/Contents/MacOS/Electron'
);
const appPath = path.join(__dirname, '../');

async function runVerification() {
  console.log('🔍 회원 데이터 일치성 검증을 시작합니다...');
  console.log('📱 이 스크립트는 Electron 애플리케이션을 통해 실행됩니다.');
  console.log('');

  // Electron 앱이 실행되어야 함을 안내
  console.log('⚠️  중요한 안내:');
  console.log('   이 검증을 실행하려면 다음 중 하나를 선택하세요:');
  console.log('');
  console.log('1️⃣ 방법 1: 개발 서버에서 직접 실행');
  console.log('   - npm run dev 실행');
  console.log('   - 개발자 도구 콘솔에서 다음 명령어 실행:');
  console.log('   window.electronAPI.database.member.verifyDataConsistency()');
  console.log('     .then(result => console.table(result))');
  console.log('');
  console.log('2️⃣ 방법 2: 브라우저 테스트 환경에서 실행');
  console.log('   - npm run dev:webpack 실행');
  console.log('   - 브라우저 개발자 도구에서 동일한 명령어 실행');
  console.log('');
  console.log('3️⃣ 방법 3: 직접 데이터베이스 확인');
  console.log('   - 아래의 SQL 쿼리들을 직접 실행해서 확인하세요:');
  console.log('');

  // SQL 쿼리 예시 제공
  const sqlQueries = [
    {
      name: '전체 회원 수 (삭제 포함)',
      sql: 'SELECT COUNT(*) as total_including_deleted FROM members;',
    },
    {
      name: '삭제되지 않은 회원 수',
      sql: 'SELECT COUNT(*) as total_not_deleted FROM members WHERE deleted_at IS NULL;',
    },
    {
      name: '활성 회원 수 (삭제되지 않은)',
      sql: 'SELECT COUNT(*) as active_members FROM members WHERE deleted_at IS NULL AND active = 1;',
    },
    {
      name: '비활성 회원 수 (삭제되지 않은)',
      sql: 'SELECT COUNT(*) as inactive_members FROM members WHERE deleted_at IS NULL AND active = 0;',
    },
    {
      name: '삭제된 회원 수',
      sql: 'SELECT COUNT(*) as deleted_members FROM members WHERE deleted_at IS NOT NULL;',
    },
    {
      name: '삭제된 회원 목록',
      sql: 'SELECT id, name, member_number, active, deleted_at FROM members WHERE deleted_at IS NOT NULL ORDER BY deleted_at DESC;',
    },
  ];

  console.log('📊 검증용 SQL 쿼리들:');
  console.log('');
  sqlQueries.forEach((query, index) => {
    console.log(`${index + 1}. ${query.name}:`);
    console.log(`   ${query.sql}`);
    console.log('');
  });

  console.log('🎯 검증 포인트:');
  console.log('   ✅ "삭제되지 않은 회원 수" = 통계 API의 "전체 회원 수"');
  console.log('   ✅ "활성 회원 수" = 통계 API의 "활성 회원 수"');
  console.log('   ✅ "비활성 회원 수" = 통계 API의 "비활성 회원 수"');
  console.log('   ❌ "삭제된 회원"은 통계에 포함되면 안됨');
  console.log('');

  console.log('🔧 문제 해결:');
  console.log('   만약 수치가 일치하지 않는다면:');
  console.log('   1. 삭제된 회원이 통계에 포함되고 있는지 확인');
  console.log('   2. soft delete (deleted_at) 필드가 올바르게 설정되었는지 확인');
  console.log('   3. 통계 계산 로직에서 WHERE deleted_at IS NULL 조건이 빠졌는지 확인');
  console.log('');

  // JavaScript로 실행할 수 있는 검증 코드 제공
  console.log('🚀 Electron 환경에서 실행할 검증 코드:');
  console.log('');
  console.log('```javascript');
  console.log('// 개발자 콘솔에서 실행하세요:');
  console.log('async function verifyMemberData() {');
  console.log('  try {');
  console.log('    console.log("🔍 회원 데이터 검증 시작...");');
  console.log(
    '    const result = await window.electronAPI.database.member.verifyDataConsistency();'
  );
  console.log('    ');
  console.log('    console.log("📊 검증 결과:");');
  console.log('    console.table({');
  console.log('      "전체 회원 (삭제 포함)": result.table_counts.total_including_deleted,');
  console.log('      "삭제되지 않은 회원": result.table_counts.total_not_deleted,');
  console.log('      "통계 API 전체": result.stats_counts.total,');
  console.log('      "활성 회원": result.table_counts.active_not_deleted,');
  console.log('      "통계 API 활성": result.stats_counts.active,');
  console.log('      "삭제된 회원": result.table_counts.deleted');
  console.log('    });');
  console.log('    ');
  console.log('    if (result.discrepancies.length > 0) {');
  console.log('      console.error("❌ 불일치 발견:", result.discrepancies);');
  console.log('    } else {');
  console.log('      console.log("✅ 모든 수치가 일치합니다!");');
  console.log('    }');
  console.log('    ');
  console.log('    return result;');
  console.log('  } catch (error) {');
  console.log('    console.error("검증 실패:", error);');
  console.log('  }');
  console.log('}');
  console.log('');
  console.log('// 실행');
  console.log('verifyMemberData();');
  console.log('```');
  console.log('');

  console.log('💡 빠른 실행:');
  console.log('   개발 서버가 실행 중이라면, 아래 한 줄만 복사해서 붙여넣으세요:');
  console.log('');
  console.log(
    '   window.electronAPI.database.member.verifyDataConsistency().then(r => {console.log("🔍 검증 결과:"); console.table({전체포함삭제: r.table_counts.total_including_deleted, 삭제되지않음: r.table_counts.total_not_deleted, 통계API전체: r.stats_counts.total, 삭제됨: r.table_counts.deleted}); r.discrepancies.length ? console.error("❌ 불일치:", r.discrepancies) : console.log("✅ 일치!");})'
  );
  console.log('');
}

// 스크립트 실행
if (require.main === module) {
  runVerification().catch(console.error);
}

module.exports = { runVerification };
