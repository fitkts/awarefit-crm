#!/usr/bin/env node

/**
 * 웹팩 번들 분석 스크립트
 * 빌드 결과물의 크기와 구성을 분석합니다.
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 웹팩 번들 분석을 시작합니다...');

// 의존성 확인
try {
  const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
  const webpack = require('webpack');
  
  // 웹팩 설정 로드
  const webpackConfig = require('../webpack.config.js');
  
  console.log('📦 webpack-bundle-analyzer 모듈 확인됨');
  
  // 모드 결정: CI/자동 실행 시에는 static 모드로 리포트만 생성
  const analyzeMode = process.env.ANALYZE_MODE || (process.env.CI ? 'static' : 'server');
  const openAnalyzer = process.env.ANALYZE_OPEN ? process.env.ANALYZE_OPEN !== 'false' : analyzeMode !== 'static';

  // Bundle Analyzer 플러그인 추가
  const configWithAnalyzer = {
    ...webpackConfig,
    mode: 'production',
    plugins: [
      ...webpackConfig.plugins,
      new BundleAnalyzerPlugin({
        analyzerMode: analyzeMode,
        openAnalyzer,
        analyzerPort: 8888,
        generateStatsFile: true,
        statsFilename: 'bundle-stats.json',
        reportFilename: 'bundle-report.html',
      }),
    ],
  };

  // 웹팩 실행
  webpack(configWithAnalyzer, (err, stats) => {
    if (err || stats.hasErrors()) {
      console.error('❌ 번들 분석 중 오류가 발생했습니다:');
      if (err) {
        console.error(err.stack || err);
        if (err.details) {
          console.error(err.details);
        }
        return;
      }

      const info = stats.toJson();
      if (stats.hasErrors()) {
        info.errors.forEach(error => console.error(error));
      }
      if (stats.hasWarnings()) {
        info.warnings.forEach(warning => console.warn(warning));
      }
      return;
    }

    console.log('✅ 번들 분석이 완료되었습니다!');
    if (analyzeMode === 'server') {
      console.log('🌐 브라우저에서 http://localhost:8888 을 열어 결과를 확인하세요.');
    } else {
      console.log('📄 정적 리포트: bundle-report.html');
    }
    console.log('📊 번들 통계가 bundle-stats.json 파일에 저장되었습니다.');
  });

} catch (error) {
  if (error.code === 'MODULE_NOT_FOUND') {
    console.error('❌ webpack-bundle-analyzer 모듈을 찾을 수 없습니다.');
    console.log('💡 해결 방법:');
    console.log('   1. npm install 을 실행하여 의존성을 다시 설치하세요.');
    console.log('   2. package.json에 webpack-bundle-analyzer가 있는지 확인하세요.');
    console.log('   3. 수동 설치: npm install --save-dev webpack-bundle-analyzer');
    
    // 대안적인 번들 크기 분석
    console.log('\n🔍 대안적인 번들 분석을 실행합니다...');
    
    try {
      const distPath = path.join(__dirname, '../dist');
      if (fs.existsSync(distPath)) {
        const files = fs.readdirSync(distPath);
        const jsFiles = files.filter(file => file.endsWith('.js'));
        
        console.log('\n📁 빌드된 JavaScript 파일들:');
        let totalSize = 0;
        
        jsFiles.forEach(file => {
          const filePath = path.join(distPath, file);
          const stats = fs.statSync(filePath);
          const sizeKB = (stats.size / 1024).toFixed(2);
          totalSize += stats.size;
          console.log(`   📄 ${file}: ${sizeKB} KB`);
        });
        
        console.log(`\n📊 총 JavaScript 크기: ${(totalSize / 1024).toFixed(2)} KB`);
      } else {
        console.log('⚠️ dist 폴더를 찾을 수 없습니다. npm run build를 먼저 실행하세요.');
      }
    } catch (fallbackError) {
      console.error('대안적인 분석도 실패했습니다:', fallbackError.message);
    }
    
    process.exit(1);
  } else {
    console.error('❌ 예상치 못한 오류:', error.message);
    process.exit(1);
  }
} 