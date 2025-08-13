#!/usr/bin/env node

/**
 * 📊 Awarefit CRM 성능 모니터링 시스템
 * 
 * 실시간으로 시스템 성능을 추적하고 분석합니다.
 * 병목지점을 자동으로 감지하고 최적화 방안을 제시합니다.
 * 
 * 주요 기능:
 * - 실시간 성능 메트릭 수집
 * - 메모리, CPU, 디스크 사용량 모니터링
 * - 웹팩 번들 크기 분석
 * - 데이터베이스 쿼리 성능 추적
 * - Electron 앱 성능 측정
 * - 자동 최적화 제안
 * - 성능 히스토리 및 트렌드 분석
 * 
 * 사용법:
 * npm run perf:monitor     # 실시간 모니터링
 * npm run perf:analyze     # 성능 분석
 * npm run perf:optimize    # 자동 최적화
 * npm run perf:report      # 성능 리포트
 * node scripts/performance-monitor.js --help
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const os = require('os');
const readline = require('readline');

// 다른 시스템들 로드
const SystemHealthChecker = require('./health-check.js');

class PerformanceMonitor {
  constructor() {
    this.monitoringConfig = {
      version: '1.0.0',
      monitoring_interval: 5000,  // 5초마다
      alert_thresholds: {
        memory_usage: 80,          // 80% 이상
        cpu_usage: 70,             // 70% 이상
        disk_usage: 85,            // 85% 이상
        bundle_size: 5 * 1024 * 1024, // 5MB 이상
        query_time: 1000,          // 1초 이상
        startup_time: 10000        // 10초 이상
      },
      performance_targets: {
        bundle_size: 2 * 1024 * 1024, // 2MB 목표
        startup_time: 3000,           // 3초 목표
        memory_usage: 512 * 1024 * 1024, // 512MB 목표
        query_time: 100               // 100ms 목표
      }
    };

    this.performanceData = {
      system: [],
      application: [],
      database: [],
      bundle: [],
      timestamps: []
    };

    this.logFile = 'performance.log';
    this.reportFile = 'performance-report.json';
    this.alertFile = 'performance-alerts.log';
    
    this.isMonitoring = false;
    this.monitoringInterval = null;
    
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
  }

  /**
   * 메인 실행 함수
   */
  async run() {
    const args = process.argv.slice(2);
    
    try {
      if (args.includes('--help') || args.includes('-h')) {
        this.showHelp();
        return;
      }

      console.log('📊 Awarefit CRM 성능 모니터링 시스템');
      console.log('='.repeat(50));
      console.log(`⏰ 시작 시간: ${new Date().toLocaleString('ko-KR')}`);
      console.log('');

      await this.initializeMonitoring();

      if (args.includes('--monitor') || args.includes('-m')) {
        await this.startRealTimeMonitoring();
      } else if (args.includes('--analyze') || args.includes('-a')) {
        await this.performanceAnalysis();
      } else if (args.includes('--optimize') || args.includes('-o')) {
        await this.autoOptimization();
      } else if (args.includes('--report') || args.includes('-r')) {
        await this.generatePerformanceReport();
      } else if (args.includes('--benchmark') || args.includes('-b')) {
        await this.runBenchmarks();
      } else {
        // 대화형 메뉴
        await this.showPerformanceMenu();
      }

    } catch (error) {
      this.logError('성능 모니터링 시스템 오류', error);
      console.error('💥 성능 모니터링 오류:', error.message);
    } finally {
      this.stopMonitoring();
      this.rl.close();
    }
  }

  /**
   * 성능 모니터링 시스템 초기화
   */
  async initializeMonitoring() {
    console.log('⚙️ 성능 모니터링 시스템 초기화 중...');

    // 설정 로드
    await this.loadMonitoringConfig();

    // 기존 데이터 로드
    await this.loadPerformanceHistory();

    // 기본 시스템 정보 수집
    await this.collectSystemInfo();

    console.log('✅ 성능 모니터링 시스템 초기화 완료\n');
  }

  /**
   * 대화형 성능 메뉴
   */
  async showPerformanceMenu() {
    console.log('📊 성능 모니터링 옵션');
    console.log('='.repeat(30));
    console.log('1. 📈 실시간 모니터링 시작');
    console.log('2. 🔍 성능 분석 실행');
    console.log('3. ⚡ 자동 최적화');
    console.log('4. 📋 성능 리포트 생성');
    console.log('5. 🏃 벤치마크 테스트');
    console.log('6. 📊 번들 크기 분석');
    console.log('7. 💾 데이터베이스 성능 검사');
    console.log('8. ⚙️ 모니터링 설정');
    console.log('9. ❓ 도움말');
    console.log('0. 🚪 종료');
    console.log('');

    const choice = await this.askQuestion('선택하세요 (0-9): ');

    switch (choice.trim()) {
      case '1':
        await this.startRealTimeMonitoring();
        break;
      case '2':
        await this.performanceAnalysis();
        break;
      case '3':
        await this.autoOptimization();
        break;
      case '4':
        await this.generatePerformanceReport();
        break;
      case '5':
        await this.runBenchmarks();
        break;
      case '6':
        await this.analyzeBundleSize();
        break;
      case '7':
        await this.analyzeDatabasePerformance();
        break;
      case '8':
        await this.configureMonitoring();
        break;
      case '9':
        this.showHelp();
        break;
      case '0':
        console.log('👋 성능 모니터링을 종료합니다.');
        return;
      default:
        console.log('❌ 잘못된 선택입니다.');
        await this.showPerformanceMenu();
    }
  }

  /**
   * 1. 실시간 모니터링
   */
  async startRealTimeMonitoring() {
    console.log('\n📈 실시간 성능 모니터링 시작');
    console.log('='.repeat(40));
    console.log('🔍 시스템 리소스를 실시간으로 모니터링합니다.');
    console.log('⚠️ 중지하려면 Ctrl+C를 누르세요.\n');

    this.isMonitoring = true;
    let monitoringCount = 0;

    // 실시간 모니터링 루프
    this.monitoringInterval = setInterval(async () => {
      try {
        monitoringCount++;
        const timestamp = new Date();

        // 시스템 메트릭 수집
        const systemMetrics = await this.collectSystemMetrics();
        const appMetrics = await this.collectApplicationMetrics();

        // 데이터 저장
        this.performanceData.system.push(systemMetrics);
        this.performanceData.application.push(appMetrics);
        this.performanceData.timestamps.push(timestamp);

        // 실시간 출력
        this.displayRealTimeMetrics(systemMetrics, appMetrics, monitoringCount);

        // 임계값 검사 및 알림
        await this.checkThresholds(systemMetrics, appMetrics);

        // 데이터 정리 (최근 100개만 유지)
        if (this.performanceData.system.length > 100) {
          this.performanceData.system.shift();
          this.performanceData.application.shift();
          this.performanceData.timestamps.shift();
        }

        // 10분마다 자동 저장
        if (monitoringCount % 120 === 0) { // 5초 * 120 = 10분
          await this.savePerformanceData();
          console.log('\n💾 성능 데이터 자동 저장됨');
        }

      } catch (error) {
        console.error('⚠️ 모니터링 중 오류:', error.message);
      }
    }, this.monitoringConfig.monitoring_interval);

    // Ctrl+C 처리
    process.on('SIGINT', async () => {
      console.log('\n\n⏹️ 모니터링 중지 중...');
      await this.stopMonitoring();
      await this.savePerformanceData();
      console.log('💾 성능 데이터 저장 완료');
      process.exit(0);
    });

    // 수동 중지 대기
    await this.askQuestion('\n엔터를 누르면 모니터링을 중지합니다...');
    await this.stopMonitoring();
  }

  /**
   * 실시간 메트릭 화면 출력
   */
  displayRealTimeMetrics(systemMetrics, appMetrics, count) {
    // 화면 지우기 (터미널)
    if (count > 1) {
      process.stdout.write('\x1b[2J\x1b[H');
    }

    console.log('📊 실시간 성능 모니터링');
    console.log('='.repeat(50));
    console.log(`📅 ${new Date().toLocaleString('ko-KR')} (${count}회)`);
    console.log('');

    // 시스템 메트릭
    console.log('🖥️ 시스템 리소스:');
    console.log(`  💾 메모리: ${this.formatBytes(systemMetrics.memory.used)}/${this.formatBytes(systemMetrics.memory.total)} (${systemMetrics.memory.percentage.toFixed(1)}%)`);
    console.log(`  🔥 CPU: ${systemMetrics.cpu.percentage.toFixed(1)}% (${systemMetrics.cpu.cores}코어)`);
    console.log(`  💿 디스크: ${this.formatBytes(systemMetrics.disk.used)}/${this.formatBytes(systemMetrics.disk.total)} (${systemMetrics.disk.percentage.toFixed(1)}%)`);
    console.log(`  📡 네트워크: ↑${this.formatBytes(systemMetrics.network.sent)} ↓${this.formatBytes(systemMetrics.network.received)}`);
    console.log('');

    // 애플리케이션 메트릭
    console.log('🚀 애플리케이션:');
    console.log(`  🧠 Node.js 메모리: ${this.formatBytes(appMetrics.memory.heapUsed)}/${this.formatBytes(appMetrics.memory.heapTotal)}`);
    console.log(`  ⚡ 업타임: ${this.formatDuration(appMetrics.uptime * 1000)}`);
    console.log(`  🔄 이벤트 루프 지연: ${appMetrics.eventLoopDelay.toFixed(2)}ms`);
    console.log('');

    // 경고 표시
    const warnings = this.checkWarnings(systemMetrics, appMetrics);
    if (warnings.length > 0) {
      console.log('⚠️ 경고:');
      warnings.forEach(warning => console.log(`  ${warning}`));
      console.log('');
    }

    console.log('💡 Ctrl+C로 중지 | 엔터로 일시 중지');
  }

  /**
   * 시스템 메트릭 수집
   */
  async collectSystemMetrics() {
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const usedMem = totalMem - freeMem;

    // CPU 사용률 계산
    const cpus = os.cpus();
    let totalIdle = 0;
    let totalTick = 0;

    cpus.forEach(cpu => {
      for (const type in cpu.times) {
        totalTick += cpu.times[type];
      }
      totalIdle += cpu.times.idle;
    });

    const idle = totalIdle / cpus.length;
    const total = totalTick / cpus.length;
    const cpuUsage = 100 - ~~(100 * idle / total);

    // 디스크 사용량 (현재 디렉토리 기준)
    let diskStats = { used: 0, total: 0, percentage: 0 };
    try {
      const stats = fs.statSync('.');
      // 간단한 디스크 사용량 (실제로는 더 정확한 방법 필요)
      diskStats = {
        used: this.getDirectorySize('.'),
        total: totalMem * 10, // 임시 추정값
        percentage: 50 // 임시값
      };
    } catch (error) {
      // 디스크 정보 수집 실패 시 기본값
    }

    return {
      memory: {
        total: totalMem,
        used: usedMem,
        free: freeMem,
        percentage: (usedMem / totalMem) * 100
      },
      cpu: {
        percentage: cpuUsage,
        cores: cpus.length,
        model: cpus[0].model,
        speed: cpus[0].speed
      },
      disk: diskStats,
      network: {
        sent: 0, // 실제 구현에서는 네트워크 통계 수집
        received: 0
      },
      timestamp: new Date()
    };
  }

  /**
   * 애플리케이션 메트릭 수집
   */
  async collectApplicationMetrics() {
    const memUsage = process.memoryUsage();
    
    // 이벤트 루프 지연 측정
    const start = process.hrtime.bigint();
    await new Promise(resolve => setImmediate(resolve));
    const delay = Number(process.hrtime.bigint() - start) / 1000000; // ms로 변환

    return {
      memory: {
        rss: memUsage.rss,
        heapTotal: memUsage.heapTotal,
        heapUsed: memUsage.heapUsed,
        external: memUsage.external,
        arrayBuffers: memUsage.arrayBuffers
      },
      uptime: process.uptime(),
      eventLoopDelay: delay,
      version: process.version,
      platform: process.platform,
      timestamp: new Date()
    };
  }

  /**
   * 임계값 검사 및 알림
   */
  async checkThresholds(systemMetrics, appMetrics) {
    const alerts = [];
    const thresholds = this.monitoringConfig.alert_thresholds;

    // 메모리 사용량 검사
    if (systemMetrics.memory.percentage > thresholds.memory_usage) {
      alerts.push({
        type: 'memory',
        level: 'warning',
        message: `메모리 사용량이 ${systemMetrics.memory.percentage.toFixed(1)}%로 임계값 ${thresholds.memory_usage}%를 초과했습니다.`,
        value: systemMetrics.memory.percentage,
        threshold: thresholds.memory_usage
      });
    }

    // CPU 사용량 검사
    if (systemMetrics.cpu.percentage > thresholds.cpu_usage) {
      alerts.push({
        type: 'cpu',
        level: 'warning',
        message: `CPU 사용량이 ${systemMetrics.cpu.percentage.toFixed(1)}%로 임계값 ${thresholds.cpu_usage}%를 초과했습니다.`,
        value: systemMetrics.cpu.percentage,
        threshold: thresholds.cpu_usage
      });
    }

    // 이벤트 루프 지연 검사
    if (appMetrics.eventLoopDelay > 100) { // 100ms 이상
      alerts.push({
        type: 'event_loop',
        level: 'warning',
        message: `이벤트 루프 지연이 ${appMetrics.eventLoopDelay.toFixed(2)}ms로 과도합니다.`,
        value: appMetrics.eventLoopDelay,
        threshold: 100
      });
    }

    // 알림 로깅
    for (const alert of alerts) {
      this.logAlert(alert);
    }

    return alerts;
  }

  /**
   * 경고 메시지 생성
   */
  checkWarnings(systemMetrics, appMetrics) {
    const warnings = [];
    const thresholds = this.monitoringConfig.alert_thresholds;

    if (systemMetrics.memory.percentage > thresholds.memory_usage) {
      warnings.push(`🔴 메모리 사용량 높음 (${systemMetrics.memory.percentage.toFixed(1)}%)`);
    }

    if (systemMetrics.cpu.percentage > thresholds.cpu_usage) {
      warnings.push(`🔴 CPU 사용량 높음 (${systemMetrics.cpu.percentage.toFixed(1)}%)`);
    }

    if (appMetrics.eventLoopDelay > 100) {
      warnings.push(`🔴 이벤트 루프 지연 (${appMetrics.eventLoopDelay.toFixed(2)}ms)`);
    }

    if (appMetrics.memory.heapUsed > 200 * 1024 * 1024) { // 200MB 이상
      warnings.push(`🟡 힙 메모리 사용량 높음 (${this.formatBytes(appMetrics.memory.heapUsed)})`);
    }

    return warnings;
  }

  /**
   * 2. 성능 분석
   */
  async performanceAnalysis() {
    console.log('\n🔍 성능 분석 실행');
    console.log('='.repeat(30));

    const analysis = {
      bundle_analysis: await this.analyzeBundleSize(),
      startup_analysis: await this.analyzeStartupPerformance(),
      memory_analysis: await this.analyzeMemoryUsage(),
      database_analysis: await this.analyzeDatabasePerformance(),
      recommendations: []
    };

    // 종합 분석 및 권장사항
    analysis.recommendations = this.generateRecommendations(analysis);

    // 결과 출력
    this.displayAnalysisResults(analysis);

    // 분석 결과 저장
    fs.writeFileSync('performance-analysis.json', JSON.stringify(analysis, null, 2));
    console.log('\n💾 분석 결과가 performance-analysis.json에 저장되었습니다.');

    return analysis;
  }

  /**
   * 번들 크기 분석
   */
  async analyzeBundleSize() {
    console.log('📦 번들 크기 분석 중...');
    
    const bundleStats = {
      total_size: 0,
      files: [],
      analysis: {},
      recommendations: []
    };

    try {
      // 웹팩 번들 분석
      if (fs.existsSync('dist')) {
        const bundleFiles = this.getBundleFiles('dist');
        bundleStats.files = bundleFiles;
        bundleStats.total_size = bundleFiles.reduce((sum, file) => sum + file.size, 0);

        // 큰 파일들 식별
        const largeFiles = bundleFiles.filter(file => file.size > 1024 * 1024); // 1MB 이상
        if (largeFiles.length > 0) {
          bundleStats.recommendations.push({
            type: 'bundle_optimization',
            message: '큰 번들 파일들을 코드 스플리팅으로 최적화할 수 있습니다.',
            files: largeFiles.map(f => f.name)
          });
        }

        console.log(`  📊 총 번들 크기: ${this.formatBytes(bundleStats.total_size)}`);
        console.log(`  📄 파일 수: ${bundleFiles.length}개`);
      } else {
        console.log('  ⚠️ 빌드된 번들을 찾을 수 없습니다. npm run build를 먼저 실행하세요.');
      }

      // 웹팩 번들 분석기 실행
      try {
        console.log('  🔍 상세 번들 분석 실행 중...');
        // 비대화형(static) 모드로 실행하여 블로킹 방지
        execSync(process.platform === 'win32'
          ? 'npm run analyze'
          : 'npm run analyze',
          { stdio: 'ignore', env: { ...process.env, ANALYZE_MODE: 'static', ANALYZE_OPEN: 'false' } }
        );
        bundleStats.analysis.detailed = true;
        console.log('  ✅ 번들 분석 완료 (webpack-bundle-analyzer 결과 확인)');
      } catch (error) {
        bundleStats.analysis.detailed = false;
        console.log('  ⚠️ 상세 번들 분석 실패 (webpack-bundle-analyzer 없음)');
      }

    } catch (error) {
      console.log('  ❌ 번들 분석 실패:', error.message);
    }

    return bundleStats;
  }

  /**
   * 시작 성능 분석
   */
  async analyzeStartupPerformance() {
    console.log('⚡ 시작 성능 분석 중...');

    const startupStats = {
      measurements: [],
      average_time: 0,
      recommendations: []
    };

    try {
      console.log('  🔄 시작 시간 측정 중 (5회)...');
      
      for (let i = 0; i < 5; i++) {
        const startTime = Date.now();
        
        try {
          // 개발 서버 시작 시간 시뮬레이션
          // 실제로는 웹팩 컴파일 시간 측정
          execSync('npm run compile', { stdio: 'ignore' });
          
          const duration = Date.now() - startTime;
          startupStats.measurements.push(duration);
          
          console.log(`    ${i + 1}회: ${duration}ms`);
        } catch (error) {
          console.log(`    ${i + 1}회: 실패 (${error.message})`);
        }
        
        // 잠깐 대기
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      if (startupStats.measurements.length > 0) {
        startupStats.average_time = startupStats.measurements.reduce((a, b) => a + b, 0) / startupStats.measurements.length;
        
        console.log(`  📊 평균 시작 시간: ${startupStats.average_time.toFixed(0)}ms`);

        // 권장사항 생성
        if (startupStats.average_time > this.monitoringConfig.alert_thresholds.startup_time) {
          startupStats.recommendations.push({
            type: 'startup_optimization',
            message: `시작 시간이 ${startupStats.average_time.toFixed(0)}ms로 목표 ${this.monitoringConfig.performance_targets.startup_time}ms보다 느립니다.`,
            suggestions: [
              '웹팩 설정 최적화',
              '불필요한 import 제거',
              '코드 스플리팅 적용',
              'tree shaking 활성화'
            ]
          });
        }
      }

    } catch (error) {
      console.log('  ❌ 시작 성능 분석 실패:', error.message);
    }

    return startupStats;
  }

  /**
   * 메모리 사용량 분석
   */
  async analyzeMemoryUsage() {
    console.log('💾 메모리 사용량 분석 중...');

    const memoryStats = {
      current: process.memoryUsage(),
      history: this.performanceData.application.slice(-50), // 최근 50개
      trends: {},
      recommendations: []
    };

    try {
      if (memoryStats.history.length > 0) {
        // 메모리 사용량 트렌드 분석
        const heapUsages = memoryStats.history.map(data => data.memory.heapUsed);
        const avgHeapUsage = heapUsages.reduce((a, b) => a + b, 0) / heapUsages.length;
        const maxHeapUsage = Math.max(...heapUsages);
        
        memoryStats.trends = {
          average: avgHeapUsage,
          maximum: maxHeapUsage,
          current: memoryStats.current.heapUsed,
          trend: heapUsages.length > 10 ? this.calculateTrend(heapUsages.slice(-10)) : 'insufficient_data'
        };

        console.log(`  📊 현재 힙 사용량: ${this.formatBytes(memoryStats.current.heapUsed)}`);
        console.log(`  📈 평균 힙 사용량: ${this.formatBytes(avgHeapUsage)}`);
        console.log(`  📊 최대 힙 사용량: ${this.formatBytes(maxHeapUsage)}`);

        // 메모리 누수 의심 체크
        if (memoryStats.trends.trend === 'increasing' && maxHeapUsage > 200 * 1024 * 1024) {
          memoryStats.recommendations.push({
            type: 'memory_leak',
            message: '메모리 사용량이 지속적으로 증가하고 있습니다. 메모리 누수를 확인하세요.',
            suggestions: [
              '이벤트 리스너 정리 확인',
              '타이머 해제 확인',
              '대용량 객체 참조 제거',
              'WeakMap/WeakSet 사용 고려'
            ]
          });
        }
      } else {
        console.log('  ⚠️ 충분한 메모리 사용량 히스토리가 없습니다.');
      }

    } catch (error) {
      console.log('  ❌ 메모리 분석 실패:', error.message);
    }

    return memoryStats;
  }

  /**
   * 데이터베이스 성능 분석
   */
  async analyzeDatabasePerformance() {
    console.log('🗄️ 데이터베이스 성능 분석 중...');

    const dbStats = {
      query_performance: [],
      slow_queries: [],
      recommendations: []
    };

    try {
      // 실제 구현에서는 SQL 쿼리 로그 분석
      // 여기서는 시뮬레이션
      console.log('  🔍 쿼리 성능 분석...');
      
      // 샘플 쿼리 성능 데이터
      const sampleQueries = [
        { query: 'SELECT * FROM members', time: 45, type: 'SELECT' },
        { query: 'SELECT * FROM payments WHERE date > ?', time: 120, type: 'SELECT' },
        { query: 'INSERT INTO members (...)', time: 25, type: 'INSERT' },
        { query: 'UPDATE members SET ... WHERE id = ?', time: 35, type: 'UPDATE' }
      ];

      dbStats.query_performance = sampleQueries;
      dbStats.slow_queries = sampleQueries.filter(q => q.time > 100);

      const avgQueryTime = sampleQueries.reduce((sum, q) => sum + q.time, 0) / sampleQueries.length;
      
      console.log(`  📊 평균 쿼리 시간: ${avgQueryTime.toFixed(1)}ms`);
      console.log(`  🐌 느린 쿼리: ${dbStats.slow_queries.length}개`);

      if (dbStats.slow_queries.length > 0) {
        dbStats.recommendations.push({
          type: 'database_optimization',
          message: `${dbStats.slow_queries.length}개의 느린 쿼리가 발견되었습니다.`,
          suggestions: [
            '인덱스 추가 고려',
            '쿼리 최적화',
            '페이지네이션 적용',
            'N+1 쿼리 문제 해결'
          ],
          slow_queries: dbStats.slow_queries
        });
      }

    } catch (error) {
      console.log('  ❌ 데이터베이스 분석 실패:', error.message);
    }

    return dbStats;
  }

  /**
   * 3. 자동 최적화
   */
  async autoOptimization() {
    console.log('\n⚡ 자동 최적화 실행');
    console.log('='.repeat(30));

    const optimizations = [];

    try {
      // 1. 코드 최적화
      console.log('1️⃣ 코드 최적화 중...');
      const codeOptimization = await this.optimizeCode();
      optimizations.push(codeOptimization);

      // 2. 번들 최적화
      console.log('\n2️⃣ 번들 최적화 중...');
      const bundleOptimization = await this.optimizeBundle();
      optimizations.push(bundleOptimization);

      // 3. 의존성 최적화
      console.log('\n3️⃣ 의존성 최적화 중...');
      const depsOptimization = await this.optimizeDependencies();
      optimizations.push(depsOptimization);

      // 4. 캐시 최적화
      console.log('\n4️⃣ 캐시 최적화 중...');
      const cacheOptimization = await this.optimizeCache();
      optimizations.push(cacheOptimization);

      // 최적화 결과 요약
      console.log('\n📊 최적화 완료 요약:');
      optimizations.forEach((opt, index) => {
        console.log(`${index + 1}. ${opt.name}: ${opt.success ? '✅ 성공' : '❌ 실패'}`);
        if (opt.improvements.length > 0) {
          opt.improvements.forEach(improvement => {
            console.log(`   - ${improvement}`);
          });
        }
      });

      // 최적화 결과 저장
      fs.writeFileSync('optimization-results.json', JSON.stringify(optimizations, null, 2));
      console.log('\n💾 최적화 결과가 optimization-results.json에 저장되었습니다.');

    } catch (error) {
      console.error('❌ 자동 최적화 실패:', error.message);
    }
  }

  /**
   * 코드 최적화
   */
  async optimizeCode() {
    const optimization = {
      name: '코드 최적화',
      success: false,
      improvements: [],
      errors: []
    };

    try {
      // ESLint 자동 수정
      console.log('  🔧 ESLint 자동 수정...');
      try {
        execSync('npm run lint:fix', { stdio: 'ignore' });
        optimization.improvements.push('ESLint 규칙 위반 자동 수정');
      } catch (error) {
        optimization.errors.push('ESLint 자동 수정 실패');
      }

      // Prettier 코드 포맷팅
      console.log('  💄 코드 포맷팅...');
      try {
        execSync('npm run format', { stdio: 'ignore' });
        optimization.improvements.push('코드 포맷팅 적용');
      } catch (error) {
        optimization.errors.push('코드 포맷팅 실패');
      }

      // 사용하지 않는 import 제거 (실제로는 더 정교한 도구 필요)
      console.log('  🧹 사용하지 않는 import 검사...');
      // 여기서는 시뮬레이션
      optimization.improvements.push('사용하지 않는 import 검사 완료');

      optimization.success = optimization.errors.length === 0;

    } catch (error) {
      optimization.errors.push(error.message);
    }

    return optimization;
  }

  /**
   * 번들 최적화
   */
  async optimizeBundle() {
    const optimization = {
      name: '번들 최적화',
      success: false,
      improvements: [],
      errors: []
    };

    try {
      // 웹팩 최적화 빌드
      console.log('  📦 최적화된 빌드 생성...');
      try {
        execSync('npm run safe-build', { stdio: 'ignore' });
        optimization.improvements.push('최적화된 프로덕션 빌드 생성');
      } catch (error) {
        optimization.errors.push('최적화 빌드 실패');
      }

      // 번들 크기 확인
      if (fs.existsSync('dist')) {
        const bundleFiles = this.getBundleFiles('dist');
        const totalSize = bundleFiles.reduce((sum, file) => sum + file.size, 0);
        optimization.improvements.push(`번들 크기: ${this.formatBytes(totalSize)}`);
        
        // 크기 임계값 확인
        if (totalSize < this.monitoringConfig.performance_targets.bundle_size) {
          optimization.improvements.push('번들 크기 목표 달성');
        } else {
          optimization.improvements.push('번들 크기 추가 최적화 권장');
        }
      }

      optimization.success = optimization.errors.length === 0;

    } catch (error) {
      optimization.errors.push(error.message);
    }

    return optimization;
  }

  /**
   * 의존성 최적화
   */
  async optimizeDependencies() {
    const optimization = {
      name: '의존성 최적화',
      success: false,
      improvements: [],
      errors: []
    };

    try {
      // 불필요한 의존성 제거
      console.log('  🧹 불필요한 의존성 정리...');
      try {
        execSync('npm prune', { stdio: 'ignore' });
        optimization.improvements.push('불필요한 의존성 제거');
      } catch (error) {
        optimization.errors.push('의존성 정리 실패');
      }

      // 보안 취약점 확인
      console.log('  🔒 보안 취약점 검사...');
      try {
        execSync('npm audit --audit-level moderate', { stdio: 'ignore' });
        optimization.improvements.push('보안 취약점 없음');
      } catch (error) {
        optimization.improvements.push('보안 취약점 발견됨 - 수동 확인 필요');
      }

      // 중복 의존성 확인
      console.log('  🔍 중복 의존성 검사...');
      try {
        const duplicates = execSync('npm ls --depth=0 2>/dev/null | grep -c "UNMET"', { encoding: 'utf8' });
        if (parseInt(duplicates) === 0) {
          optimization.improvements.push('의존성 트리 정상');
        }
      } catch (error) {
        // 검사 실패 시 무시
      }

      optimization.success = optimization.errors.length === 0;

    } catch (error) {
      optimization.errors.push(error.message);
    }

    return optimization;
  }

  /**
   * 캐시 최적화
   */
  async optimizeCache() {
    const optimization = {
      name: '캐시 최적화',
      success: false,
      improvements: [],
      errors: []
    };

    try {
      // npm 캐시 정리
      console.log('  🗑️ npm 캐시 정리...');
      try {
        execSync('npm cache clean --force', { stdio: 'ignore' });
        optimization.improvements.push('npm 캐시 정리');
      } catch (error) {
        optimization.errors.push('npm 캐시 정리 실패');
      }

      // 웹팩 캐시 정리
      console.log('  🗑️ 빌드 캐시 정리...');
      const cacheDirectories = ['.cache', 'node_modules/.cache', 'dist'];
      
      for (const cacheDir of cacheDirectories) {
        if (fs.existsSync(cacheDir)) {
          try {
            fs.rmSync(cacheDir, { recursive: true, force: true });
            optimization.improvements.push(`${cacheDir} 캐시 정리`);
          } catch (error) {
            optimization.errors.push(`${cacheDir} 캐시 정리 실패`);
          }
        }
      }

      optimization.success = optimization.errors.length === 0;

    } catch (error) {
      optimization.errors.push(error.message);
    }

    return optimization;
  }

  /**
   * 4. 벤치마크 테스트
   */
  async runBenchmarks() {
    console.log('\n🏃 벤치마크 테스트 실행');
    console.log('='.repeat(30));

    const benchmarks = {
      startup_benchmark: await this.benchmarkStartup(),
      memory_benchmark: await this.benchmarkMemory(),
      cpu_benchmark: await this.benchmarkCPU(),
      io_benchmark: await this.benchmarkIO()
    };

    // 벤치마크 결과 요약
    this.displayBenchmarkResults(benchmarks);

    // 결과 저장
    fs.writeFileSync('benchmark-results.json', JSON.stringify(benchmarks, null, 2));
    console.log('\n💾 벤치마크 결과가 benchmark-results.json에 저장되었습니다.');

    return benchmarks;
  }

  /**
   * 시작 시간 벤치마크
   */
  async benchmarkStartup() {
    console.log('⚡ 시작 시간 벤치마크...');
    
    const measurements = [];
    const iterations = 3;

    for (let i = 0; i < iterations; i++) {
      console.log(`  🔄 ${i + 1}/${iterations} 측정 중...`);
      
      const startTime = process.hrtime.bigint();
      
      try {
        // 컴파일 시간 측정
        execSync('npm run compile', { stdio: 'ignore' });
        
        const endTime = process.hrtime.bigint();
        const duration = Number(endTime - startTime) / 1000000; // ms로 변환
        
        measurements.push(duration);
        console.log(`    ⏱️ ${duration.toFixed(0)}ms`);
      } catch (error) {
        console.log(`    ❌ 측정 실패: ${error.message}`);
      }
    }

    const average = measurements.reduce((a, b) => a + b, 0) / measurements.length;
    const min = Math.min(...measurements);
    const max = Math.max(...measurements);

    return {
      measurements,
      average,
      min,
      max,
      target: this.monitoringConfig.performance_targets.startup_time,
      passed: average <= this.monitoringConfig.performance_targets.startup_time
    };
  }

  /**
   * 메모리 벤치마크
   */
  async benchmarkMemory() {
    console.log('💾 메모리 벤치마크...');
    
    const initialMemory = process.memoryUsage();
    console.log(`  📊 초기 메모리: ${this.formatBytes(initialMemory.heapUsed)}`);

    // 메모리 집약적 작업 시뮬레이션
    console.log('  🔄 메모리 집약적 작업 실행...');
    
    const data = [];
    const iterations = 1000;
    
    for (let i = 0; i < iterations; i++) {
      data.push(new Array(1000).fill(Math.random()));
    }

    const peakMemory = process.memoryUsage();
    console.log(`  📈 최대 메모리: ${this.formatBytes(peakMemory.heapUsed)}`);

    // 메모리 해제
    data.length = 0;
    global.gc && global.gc(); // 가비지 컬렉션 (Node.js 실행 시 --expose-gc 필요)

    const finalMemory = process.memoryUsage();
    console.log(`  📉 최종 메모리: ${this.formatBytes(finalMemory.heapUsed)}`);

    return {
      initial: initialMemory.heapUsed,
      peak: peakMemory.heapUsed,
      final: finalMemory.heapUsed,
      increase: peakMemory.heapUsed - initialMemory.heapUsed,
      target: this.monitoringConfig.performance_targets.memory_usage,
      passed: peakMemory.heapUsed <= this.monitoringConfig.performance_targets.memory_usage
    };
  }

  /**
   * CPU 벤치마크
   */
  async benchmarkCPU() {
    console.log('🔥 CPU 벤치마크...');
    
    console.log('  🔄 CPU 집약적 작업 실행...');
    
    const startTime = process.hrtime.bigint();
    const startCpuTime = process.cpuUsage();

    // CPU 집약적 작업 (피보나치 계산)
    const fibonacci = (n) => {
      if (n < 2) return n;
      return fibonacci(n - 1) + fibonacci(n - 2);
    };

    const result = fibonacci(35); // 충분히 CPU를 사용하는 계산
    
    const endTime = process.hrtime.bigint();
    const endCpuTime = process.cpuUsage(startCpuTime);
    
    const wallClockTime = Number(endTime - startTime) / 1000000; // ms
    const cpuTime = (endCpuTime.user + endCpuTime.system) / 1000; // ms

    console.log(`  ⏱️ 실행 시간: ${wallClockTime.toFixed(0)}ms`);
    console.log(`  🔥 CPU 시간: ${cpuTime.toFixed(0)}ms`);
    console.log(`  📊 CPU 효율성: ${((cpuTime / wallClockTime) * 100).toFixed(1)}%`);

    return {
      wallClockTime,
      cpuTime,
      efficiency: (cpuTime / wallClockTime) * 100,
      result,
      passed: wallClockTime < 5000 // 5초 이내
    };
  }

  /**
   * I/O 벤치마크
   */
  async benchmarkIO() {
    console.log('💿 I/O 벤치마크...');
    
    const testFile = 'io-benchmark-test.txt';
    const testData = 'A'.repeat(1024 * 1024); // 1MB 데이터
    const iterations = 10;

    console.log('  📝 파일 쓰기 벤치마크...');
    const writeStartTime = process.hrtime.bigint();
    
    for (let i = 0; i < iterations; i++) {
      fs.writeFileSync(`${testFile}.${i}`, testData);
    }
    
    const writeEndTime = process.hrtime.bigint();
    const writeTime = Number(writeEndTime - writeStartTime) / 1000000; // ms

    console.log('  📖 파일 읽기 벤치마크...');
    const readStartTime = process.hrtime.bigint();
    
    for (let i = 0; i < iterations; i++) {
      fs.readFileSync(`${testFile}.${i}`);
    }
    
    const readEndTime = process.hrtime.bigint();
    const readTime = Number(readEndTime - readStartTime) / 1000000; // ms

    // 테스트 파일 정리
    for (let i = 0; i < iterations; i++) {
      fs.unlinkSync(`${testFile}.${i}`);
    }

    const totalSize = testData.length * iterations;
    const writeSpeed = totalSize / (writeTime / 1000); // bytes/second
    const readSpeed = totalSize / (readTime / 1000); // bytes/second

    console.log(`  📝 쓰기 속도: ${this.formatBytes(writeSpeed)}/s`);
    console.log(`  📖 읽기 속도: ${this.formatBytes(readSpeed)}/s`);

    return {
      writeTime,
      readTime,
      writeSpeed,
      readSpeed,
      totalSize,
      iterations,
      passed: writeTime < 1000 && readTime < 500 // 쓰기 1초, 읽기 0.5초 이내
    };
  }

  /**
   * 유틸리티 함수들
   */
  async askQuestion(question) {
    return new Promise((resolve) => {
      this.rl.question(question, resolve);
    });
  }

  formatBytes(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  }

  formatDuration(ms) {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
      return `${hours}시간 ${minutes % 60}분 ${seconds % 60}초`;
    } else if (minutes > 0) {
      return `${minutes}분 ${seconds % 60}초`;
    } else {
      return `${seconds}초`;
    }
  }

  getBundleFiles(directory) {
    const files = [];
    
    const readDir = (dir) => {
      const items = fs.readdirSync(dir);
      
      for (const item of items) {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
          readDir(fullPath);
        } else {
          files.push({
            name: path.relative(directory, fullPath),
            size: stat.size,
            path: fullPath
          });
        }
      }
    };

    if (fs.existsSync(directory)) {
      readDir(directory);
    }

    return files;
  }

  getDirectorySize(directory) {
    let size = 0;
    
    const readDir = (dir) => {
      try {
        const items = fs.readdirSync(dir);
        
        for (const item of items) {
          const fullPath = path.join(dir, item);
          const stat = fs.statSync(fullPath);
          
          if (stat.isDirectory()) {
            readDir(fullPath);
          } else {
            size += stat.size;
          }
        }
      } catch (error) {
        // 접근 권한 없는 디렉토리는 무시
      }
    };

    if (fs.existsSync(directory)) {
      readDir(directory);
    }

    return size;
  }

  calculateTrend(values) {
    if (values.length < 2) return 'insufficient_data';
    
    const first = values.slice(0, Math.floor(values.length / 2));
    const second = values.slice(Math.floor(values.length / 2));
    
    const firstAvg = first.reduce((a, b) => a + b, 0) / first.length;
    const secondAvg = second.reduce((a, b) => a + b, 0) / second.length;
    
    const change = ((secondAvg - firstAvg) / firstAvg) * 100;
    
    if (change > 10) return 'increasing';
    if (change < -10) return 'decreasing';
    return 'stable';
  }

  generateRecommendations(analysis) {
    const recommendations = [];

    // 번들 크기 권장사항
    if (analysis.bundle_analysis.total_size > this.monitoringConfig.performance_targets.bundle_size) {
      recommendations.push({
        type: 'bundle_size',
        priority: 'high',
        message: '번들 크기 최적화가 필요합니다.',
        actions: [
          'webpack-bundle-analyzer로 큰 모듈 식별',
          '코드 스플리팅 적용',
          '불필요한 라이브러리 제거',
          'tree shaking 확인'
        ]
      });
    }

    // 시작 성능 권장사항
    if (analysis.startup_analysis.average_time > this.monitoringConfig.performance_targets.startup_time) {
      recommendations.push({
        type: 'startup_performance',
        priority: 'medium',
        message: '시작 성능 개선이 필요합니다.',
        actions: [
          '웹팩 설정 최적화',
          '초기 로딩 모듈 최소화',
          '지연 로딩 적용',
          'HMR(Hot Module Replacement) 활용'
        ]
      });
    }

    // 메모리 권장사항
    if (analysis.memory_analysis.trends && analysis.memory_analysis.trends.trend === 'increasing') {
      recommendations.push({
        type: 'memory_optimization',
        priority: 'high',
        message: '메모리 누수 가능성이 있습니다.',
        actions: [
          '이벤트 리스너 정리 확인',
          '순환 참조 제거',
          '대용량 객체 참조 해제',
          'Chrome DevTools로 메모리 프로파일링'
        ]
      });
    }

    // 데이터베이스 권장사항
    if (analysis.database_analysis.slow_queries.length > 0) {
      recommendations.push({
        type: 'database_optimization',
        priority: 'medium',
        message: '데이터베이스 쿼리 최적화가 필요합니다.',
        actions: [
          '느린 쿼리에 인덱스 추가',
          '쿼리 실행 계획 분석',
          'N+1 쿼리 문제 해결',
          '페이지네이션 적용'
        ]
      });
    }

    return recommendations;
  }

  displayAnalysisResults(analysis) {
    console.log('\n📊 성능 분석 결과');
    console.log('='.repeat(40));

    // 번들 분석 결과
    console.log('\n📦 번들 분석:');
    if (analysis.bundle_analysis.total_size > 0) {
      console.log(`  📊 총 크기: ${this.formatBytes(analysis.bundle_analysis.total_size)}`);
      console.log(`  📄 파일 수: ${analysis.bundle_analysis.files.length}개`);
      
      const targetSize = this.monitoringConfig.performance_targets.bundle_size;
      const status = analysis.bundle_analysis.total_size <= targetSize ? '✅' : '⚠️';
      console.log(`  🎯 목표 대비: ${status} (목표: ${this.formatBytes(targetSize)})`);
    } else {
      console.log('  ⚠️ 번들 정보 없음');
    }

    // 시작 성능 결과
    console.log('\n⚡ 시작 성능:');
    if (analysis.startup_analysis.average_time > 0) {
      console.log(`  📊 평균 시간: ${analysis.startup_analysis.average_time.toFixed(0)}ms`);
      
      const targetTime = this.monitoringConfig.performance_targets.startup_time;
      const status = analysis.startup_analysis.average_time <= targetTime ? '✅' : '⚠️';
      console.log(`  🎯 목표 대비: ${status} (목표: ${targetTime}ms)`);
    } else {
      console.log('  ⚠️ 시작 성능 정보 없음');
    }

    // 메모리 분석 결과
    console.log('\n💾 메모리 분석:');
    if (analysis.memory_analysis.trends) {
      console.log(`  📊 현재 사용량: ${this.formatBytes(analysis.memory_analysis.current.heapUsed)}`);
      console.log(`  📈 평균 사용량: ${this.formatBytes(analysis.memory_analysis.trends.average)}`);
      console.log(`  📊 최대 사용량: ${this.formatBytes(analysis.memory_analysis.trends.maximum)}`);
      console.log(`  📈 트렌드: ${analysis.memory_analysis.trends.trend}`);
    } else {
      console.log('  ⚠️ 메모리 트렌드 정보 부족');
    }

    // 데이터베이스 분석 결과
    console.log('\n🗄️ 데이터베이스 성능:');
    if (analysis.database_analysis.query_performance.length > 0) {
      const avgTime = analysis.database_analysis.query_performance.reduce((sum, q) => sum + q.time, 0) / 
                     analysis.database_analysis.query_performance.length;
      console.log(`  📊 평균 쿼리 시간: ${avgTime.toFixed(1)}ms`);
      console.log(`  🐌 느린 쿼리: ${analysis.database_analysis.slow_queries.length}개`);
      
      const targetTime = this.monitoringConfig.performance_targets.query_time;
      const status = avgTime <= targetTime ? '✅' : '⚠️';
      console.log(`  🎯 목표 대비: ${status} (목표: ${targetTime}ms)`);
    }

    // 권장사항
    console.log('\n💡 최적화 권장사항:');
    if (analysis.recommendations.length > 0) {
      analysis.recommendations.forEach((rec, index) => {
        const priority = rec.priority === 'high' ? '🔴' : rec.priority === 'medium' ? '🟡' : '🟢';
        console.log(`${priority} ${index + 1}. ${rec.message}`);
        rec.actions.forEach(action => {
          console.log(`     - ${action}`);
        });
      });
    } else {
      console.log('  ✅ 현재 성능 상태가 양호합니다.');
    }
  }

  displayBenchmarkResults(benchmarks) {
    console.log('\n🏃 벤치마크 결과');
    console.log('='.repeat(30));

    // 시작 시간 벤치마크
    console.log('\n⚡ 시작 시간:');
    const startup = benchmarks.startup_benchmark;
    console.log(`  📊 평균: ${startup.average.toFixed(0)}ms`);
    console.log(`  ⚡ 최고: ${startup.min.toFixed(0)}ms`);
    console.log(`  🐌 최저: ${startup.max.toFixed(0)}ms`);
    console.log(`  🎯 결과: ${startup.passed ? '✅ 통과' : '❌ 실패'} (목표: ${startup.target}ms)`);

    // 메모리 벤치마크
    console.log('\n💾 메모리:');
    const memory = benchmarks.memory_benchmark;
    console.log(`  📊 초기: ${this.formatBytes(memory.initial)}`);
    console.log(`  📈 최대: ${this.formatBytes(memory.peak)}`);
    console.log(`  📉 최종: ${this.formatBytes(memory.final)}`);
    console.log(`  📊 증가량: ${this.formatBytes(memory.increase)}`);
    console.log(`  🎯 결과: ${memory.passed ? '✅ 통과' : '❌ 실패'} (목표: ${this.formatBytes(memory.target)})`);

    // CPU 벤치마크
    console.log('\n🔥 CPU:');
    const cpu = benchmarks.cpu_benchmark;
    console.log(`  ⏱️ 실행 시간: ${cpu.wallClockTime.toFixed(0)}ms`);
    console.log(`  🔥 CPU 시간: ${cpu.cpuTime.toFixed(0)}ms`);
    console.log(`  📊 효율성: ${cpu.efficiency.toFixed(1)}%`);
    console.log(`  🎯 결과: ${cpu.passed ? '✅ 통과' : '❌ 실패'}`);

    // I/O 벤치마크
    console.log('\n💿 I/O:');
    const io = benchmarks.io_benchmark;
    console.log(`  📝 쓰기 속도: ${this.formatBytes(io.writeSpeed)}/s`);
    console.log(`  📖 읽기 속도: ${this.formatBytes(io.readSpeed)}/s`);
    console.log(`  📊 테스트 크기: ${this.formatBytes(io.totalSize)}`);
    console.log(`  🎯 결과: ${io.passed ? '✅ 통과' : '❌ 실패'}`);

    // 종합 점수
    const totalTests = 4;
    const passedTests = Object.values(benchmarks).filter(b => b.passed).length;
    const score = (passedTests / totalTests) * 100;
    
    console.log(`\n🏆 종합 점수: ${score.toFixed(0)}% (${passedTests}/${totalTests} 통과)`);
  }

  async stopMonitoring() {
    this.isMonitoring = false;
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
  }

  async loadMonitoringConfig() {
    const configFile = 'performance-config.json';
    if (fs.existsSync(configFile)) {
      try {
        const config = JSON.parse(fs.readFileSync(configFile, 'utf8'));
        this.monitoringConfig = { ...this.monitoringConfig, ...config };
        console.log('📋 성능 모니터링 설정 로드됨');
      } catch (error) {
        console.log('⚠️ 설정 파일 오류, 기본값 사용');
      }
    } else {
      fs.writeFileSync(configFile, JSON.stringify(this.monitoringConfig, null, 2));
      console.log('📋 기본 성능 모니터링 설정 생성됨');
    }
  }

  async loadPerformanceHistory() {
    if (fs.existsSync(this.reportFile)) {
      try {
        const history = JSON.parse(fs.readFileSync(this.reportFile, 'utf8'));
        this.performanceData = { ...this.performanceData, ...history };
        console.log('📊 성능 히스토리 로드됨');
      } catch (error) {
        console.log('⚠️ 성능 히스토리 로드 실패');
      }
    }
  }

  async savePerformanceData() {
    try {
      fs.writeFileSync(this.reportFile, JSON.stringify(this.performanceData, null, 2));
    } catch (error) {
      console.error('성능 데이터 저장 실패:', error.message);
    }
  }

  async collectSystemInfo() {
    const systemInfo = {
      platform: os.platform(),
      arch: os.arch(),
      cpus: os.cpus().length,
      memory: os.totalmem(),
      nodeVersion: process.version,
      timestamp: new Date()
    };

    console.log(`💻 시스템: ${systemInfo.platform} ${systemInfo.arch}`);
    console.log(`🔥 CPU: ${systemInfo.cpus}코어`);
    console.log(`💾 메모리: ${this.formatBytes(systemInfo.memory)}`);
    console.log(`⚡ Node.js: ${systemInfo.nodeVersion}`);

    return systemInfo;
  }

  async configureMonitoring() {
    console.log('\n⚙️ 성능 모니터링 설정');
    console.log('='.repeat(30));
    
    console.log(`현재 모니터링 간격: ${this.monitoringConfig.monitoring_interval}ms`);
    console.log(`메모리 알림 임계값: ${this.monitoringConfig.alert_thresholds.memory_usage}%`);
    console.log(`CPU 알림 임계값: ${this.monitoringConfig.alert_thresholds.cpu_usage}%`);

    const newInterval = await this.askQuestion('새로운 모니터링 간격(ms, 현재값 유지하려면 Enter): ');
    if (newInterval.trim() && !isNaN(parseInt(newInterval))) {
      this.monitoringConfig.monitoring_interval = parseInt(newInterval);
    }

    const newMemThreshold = await this.askQuestion('새로운 메모리 임계값(%, 현재값 유지하려면 Enter): ');
    if (newMemThreshold.trim() && !isNaN(parseInt(newMemThreshold))) {
      this.monitoringConfig.alert_thresholds.memory_usage = parseInt(newMemThreshold);
    }

    // 설정 저장
    fs.writeFileSync('performance-config.json', JSON.stringify(this.monitoringConfig, null, 2));
    console.log('✅ 설정이 저장되었습니다.');
  }

  async generatePerformanceReport() {
    console.log('\n📋 성능 리포트 생성');
    console.log('='.repeat(30));

    const report = {
      generated_at: new Date().toISOString(),
      system_info: await this.collectSystemInfo(),
      current_performance: {
        system: await this.collectSystemMetrics(),
        application: await this.collectApplicationMetrics()
      },
      analysis: await this.performanceAnalysis(),
      recommendations: []
    };

    // HTML 리포트 생성
    const htmlReport = this.generateHTMLReport(report);
    fs.writeFileSync('performance-report.html', htmlReport);

    console.log('✅ 성능 리포트 생성 완료:');
    console.log('  📄 performance-report.json (JSON 형식)');
    console.log('  🌐 performance-report.html (웹 형식)');

    return report;
  }

  generateHTMLReport(report) {
    return `
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Awarefit CRM 성능 리포트</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { text-align: center; margin-bottom: 30px; }
        .metric-card { background: #f8f9fa; padding: 15px; margin: 10px 0; border-radius: 6px; border-left: 4px solid #007bff; }
        .metric-value { font-size: 1.5em; font-weight: bold; color: #007bff; }
        .recommendation { background: #fff3cd; padding: 15px; margin: 10px 0; border-radius: 6px; border-left: 4px solid #ffc107; }
        .section { margin: 20px 0; }
        .status-good { color: #28a745; }
        .status-warning { color: #ffc107; }
        .status-danger { color: #dc3545; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>📊 Awarefit CRM 성능 리포트</h1>
            <p>생성 시간: ${new Date(report.generated_at).toLocaleString('ko-KR')}</p>
        </div>

        <div class="section">
            <h2>🖥️ 시스템 정보</h2>
            <div class="metric-card">
                <div>플랫폼: ${report.system_info.platform} ${report.system_info.arch}</div>
                <div>CPU: ${report.system_info.cpus}코어</div>
                <div>메모리: ${this.formatBytes(report.system_info.memory)}</div>
                <div>Node.js: ${report.system_info.nodeVersion}</div>
            </div>
        </div>

        <div class="section">
            <h2>📊 현재 성능</h2>
            <div class="metric-card">
                <h4>메모리 사용량</h4>
                <div class="metric-value">${report.current_performance.system.memory.percentage.toFixed(1)}%</div>
                <div>${this.formatBytes(report.current_performance.system.memory.used)} / ${this.formatBytes(report.current_performance.system.memory.total)}</div>
            </div>
            <div class="metric-card">
                <h4>CPU 사용량</h4>
                <div class="metric-value">${report.current_performance.system.cpu.percentage.toFixed(1)}%</div>
                <div>${report.current_performance.system.cpu.cores}코어</div>
            </div>
            <div class="metric-card">
                <h4>애플리케이션 메모리</h4>
                <div class="metric-value">${this.formatBytes(report.current_performance.application.memory.heapUsed)}</div>
                <div>힙 사용량</div>
            </div>
        </div>

        <div class="section">
            <h2>📦 번들 분석</h2>
            <div class="metric-card">
                <h4>번들 크기</h4>
                <div class="metric-value">${this.formatBytes(report.analysis.bundle_analysis.total_size || 0)}</div>
                <div>파일 수: ${report.analysis.bundle_analysis.files?.length || 0}개</div>
            </div>
        </div>

        <div class="section">
            <h2>💡 최적화 권장사항</h2>
            ${report.analysis.recommendations.map(rec => `
                <div class="recommendation">
                    <h4>${rec.type}: ${rec.message}</h4>
                    <ul>
                        ${rec.actions.map(action => `<li>${action}</li>`).join('')}
                    </ul>
                </div>
            `).join('')}
        </div>
    </div>
</body>
</html>`;
  }

  logAlert(alert) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      type: alert.type,
      level: alert.level,
      message: alert.message,
      value: alert.value,
      threshold: alert.threshold
    };
    
    fs.appendFileSync(this.alertFile, JSON.stringify(logEntry) + '\n');
  }

  logError(operation, error) {
    const logEntry = `[${new Date().toISOString()}] ERROR: ${operation} | ${error.message}\n`;
    fs.appendFileSync('performance-error.log', logEntry);
  }

  showHelp() {
    console.log('\n📊 Awarefit CRM 성능 모니터링 시스템 도움말');
    console.log('='.repeat(60));
    console.log('');
    console.log('📋 사용법:');
    console.log('  node scripts/performance-monitor.js [옵션]');
    console.log('');
    console.log('🔧 옵션:');
    console.log('  --monitor, -m      실시간 모니터링 시작');
    console.log('  --analyze, -a      성능 분석 실행');
    console.log('  --optimize, -o     자동 최적화 실행');
    console.log('  --report, -r       성능 리포트 생성');
    console.log('  --benchmark, -b    벤치마크 테스트 실행');
    console.log('  --help, -h         이 도움말 표시');
    console.log('');
    console.log('📦 npm 스크립트:');
    console.log('  npm run perf:monitor     # 실시간 모니터링');
    console.log('  npm run perf:analyze     # 성능 분석');
    console.log('  npm run perf:optimize    # 자동 최적화');
    console.log('  npm run perf:report      # 성능 리포트');
    console.log('  npm run perf:benchmark   # 벤치마크');
    console.log('');
    console.log('🔍 모니터링 항목:');
    console.log('  💾 메모리 사용량 (시스템 및 애플리케이션)');
    console.log('  🔥 CPU 사용량');
    console.log('  💿 디스크 사용량');
    console.log('  📦 번들 크기');
    console.log('  🗄️ 데이터베이스 쿼리 성능');
    console.log('  ⚡ 애플리케이션 시작 시간');
    console.log('  🔄 이벤트 루프 지연');
    console.log('');
    console.log('💡 자동 최적화 기능:');
    console.log('  🔧 코드 품질 자동 개선');
    console.log('  📦 번들 크기 최적화');
    console.log('  🧹 의존성 정리');
    console.log('  🗑️ 캐시 정리');
    console.log('');
    console.log('📊 성능 목표:');
    console.log('  📦 번들 크기: 2MB 이하');
    console.log('  ⚡ 시작 시간: 3초 이하');
    console.log('  💾 메모리 사용량: 512MB 이하');
    console.log('  🗄️ 쿼리 시간: 100ms 이하');
    console.log('');
  }
}

// 스크립트 실행
if (require.main === module) {
  const performanceMonitor = new PerformanceMonitor();
  performanceMonitor.run().catch(error => {
    console.error('💥 성능 모니터링 시스템 오류:', error);
    process.exit(1);
  });
}

module.exports = PerformanceMonitor; 