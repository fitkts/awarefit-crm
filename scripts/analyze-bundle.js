#!/usr/bin/env node

/**
 * 웹팩 번들 분석 스크립트
 * 빌드 결과물의 크기와 구성을 분석합니다.
 */

const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
const webpack = require('webpack');
const path = require('path');

// 웹팩 설정 로드
const webpackConfig = require('../webpack.config.js');

console.log('🔍 웹팩 번들 분석을 시작합니다...');

// Bundle Analyzer 플러그인 추가
const configWithAnalyzer = {
  ...webpackConfig,
  mode: 'production',
  plugins: [
    ...webpackConfig.plugins,
    new BundleAnalyzerPlugin({
      analyzerMode: 'server',
      openAnalyzer: true,
      analyzerPort: 8888,
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
  console.log('🌐 브라우저에서 http://localhost:8888 을 열어 결과를 확인하세요.');
}); 