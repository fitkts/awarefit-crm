import { app, ipcMain } from 'electron';
import * as fs from 'fs';
import * as path from 'path';
import { getDatabase } from '../../database/init';

// 시스템 관련 IPC 핸들러 등록
export const registerSystemHandlers = (): void => {
  const db = getDatabase();

  // 앱 버전 조회
  ipcMain.handle('app-version', () => {
    return app.getVersion();
  });

  // 앱 경로 조회
  ipcMain.handle('get-app-path', () => {
    return app.getAppPath();
  });

  // 데이터베이스 쿼리 실행
  ipcMain.handle('database-query', async (_, sql, params = []) => {
    try {
      const stmt = db.prepare(sql);
      if (sql.trim().toLowerCase().startsWith('select')) {
        return stmt.all(params);
      } else {
        return stmt.run(params);
      }
    } catch (error) {
      console.error('데이터베이스 쿼리 실행 실패:', error);
      throw error;
    }
  });

  // 회원권 타입 관련 핸들러
  ipcMain.handle('membership-type-get-all', async () => {
    try {
      const stmt = db.prepare(
        'SELECT * FROM membership_types WHERE is_active = 1 ORDER BY duration_months'
      );
      return stmt.all();
    } catch (error) {
      console.error('회원권 타입 조회 실패:', error);
      throw error;
    }
  });

  ipcMain.handle('membership-type-create', async (_, data) => {
    try {
      const stmt = db.prepare(`
        INSERT INTO membership_types (name, duration_months, price, description)
        VALUES (?, ?, ?, ?)
      `);

      const result = stmt.run(
        data.name,
        data.duration_months,
        data.price,
        data.description || null
      );

      return { id: result.lastInsertRowid };
    } catch (error) {
      console.error('회원권 타입 생성 실패:', error);
      throw error;
    }
  });

  // 통계 관련 핸들러
  ipcMain.handle('stats-get-dashboard', async () => {
    try {
      // 기본 통계 수집
      const totalMembers = (
        db.prepare('SELECT COUNT(*) as count FROM members WHERE active = 1').get() as {
          count: number;
        }
      ).count;
      const totalPayments = (
        db.prepare('SELECT COUNT(*) as count FROM payments WHERE status = "completed"').get() as {
          count: number;
        }
      ).count;
      const todayPayments = db
        .prepare(
          `
        SELECT COUNT(*) as count, COALESCE(SUM(amount), 0) as total 
        FROM payments 
        WHERE status = "completed" AND payment_date = date('now')
      `
        )
        .get() as { count: number; total: number };

      const monthlyRevenue = (
        db
          .prepare(
            `
        SELECT COALESCE(SUM(amount), 0) as total 
        FROM payments 
        WHERE status = "completed" 
        AND payment_date >= date('now', 'start of month')
      `
          )
          .get() as { total: number }
      ).total;

      // 활성 회원권 수
      const activeMemberships = (
        db
          .prepare(
            `
        SELECT COUNT(*) as count 
        FROM membership_history 
        WHERE is_active = 1 AND end_date >= date('now')
      `
          )
          .get() as { count: number }
      ).count;

      return {
        totalMembers,
        totalPayments,
        todayPayments: todayPayments.count,
        todayRevenue: todayPayments.total,
        monthlyRevenue,
        activeMemberships,
      };
    } catch (error) {
      console.error('대시보드 통계 조회 실패:', error);
      throw error;
    }
  });

  // 데이터베이스 백업
  ipcMain.handle('database-backup', async (_, filePath) => {
    try {
      const sourcePath = path.join(app.getPath('userData'), 'awarefit.db');
      await fs.promises.copyFile(sourcePath, filePath);
      return { success: true, message: '백업이 완료되었습니다.' };
    } catch (error) {
      console.error('데이터베이스 백업 실패:', error);
      throw error;
    }
  });

  // 데이터베이스 복원
  ipcMain.handle('database-restore', async (_, filePath) => {
    try {
      const targetPath = path.join(app.getPath('userData'), 'awarefit.db');

      // 기존 데이터베이스 백업
      const backupPath = path.join(app.getPath('userData'), `awarefit_backup_${Date.now()}.db`);
      await fs.promises.copyFile(targetPath, backupPath);

      // 새 데이터베이스로 복원
      await fs.promises.copyFile(filePath, targetPath);

      return { success: true, message: '복원이 완료되었습니다. 앱을 재시작해주세요.' };
    } catch (error) {
      console.error('데이터베이스 복원 실패:', error);
      throw error;
    }
  });
};
