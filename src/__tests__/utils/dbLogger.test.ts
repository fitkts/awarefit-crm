import { DbLogger } from '../../utils/dbLogger';

describe('DbLogger', () => {
  let dbLogger: DbLogger;
  let consoleSpy: jest.SpyInstance;

  beforeEach(() => {
    dbLogger = new DbLogger();
    consoleSpy = jest.spyOn(console, 'log').mockImplementation();
  });

  afterEach(() => {
    consoleSpy.mockRestore();
  });

  test('쿼리 로깅', () => {
    const query = 'SELECT * FROM members WHERE id = ?';
    const params = [1];

    dbLogger.logQuery(query, params);

    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('🔍 [DB]'),
      expect.stringContaining(query)
    );
  });

  test('파라미터 개수 검증', () => {
    const query = 'SELECT * FROM members WHERE id = ? AND name = ?';
    const params = [1]; // 파라미터 개수 부족

    expect(() => {
      dbLogger.validateParams(query, params);
    }).toThrow('파라미터 개수 불일치');
  });

  test('실행 시간 측정', () => {
    const startTime = dbLogger.startTimer();
    const duration = dbLogger.endTimer(startTime);

    expect(typeof duration).toBe('number');
    expect(duration).toBeGreaterThanOrEqual(0);
  });
});
