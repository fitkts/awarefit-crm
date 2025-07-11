import { ipcMain } from 'electron';
import { getDatabase } from '../../database/init';

// 결제 관련 IPC 핸들러 등록
export const registerPaymentHandlers = (): void => {
  const db = getDatabase();

  // 모든 결제 조회
  ipcMain.handle('payment-get-all', async (_, filter) => {
    try {
      let query = `
        SELECT p.*, m.name as member_name, m.phone as member_phone,
               mt.name as membership_type_name, pt.name as pt_package_name,
               s.name as staff_name
        FROM payments p
        JOIN members m ON p.member_id = m.id
        LEFT JOIN membership_types mt ON p.membership_type_id = mt.id
        LEFT JOIN pt_packages pt ON p.pt_package_id = pt.id
        JOIN staff s ON p.staff_id = s.id
        WHERE p.status != 'cancelled'
      `;
      const params: any[] = [];

      if (filter) {
        if (filter.payment_type) {
          query += ' AND p.payment_type = ?';
          params.push(filter.payment_type);
        }
        if (filter.member_id) {
          query += ' AND p.member_id = ?';
          params.push(filter.member_id);
        }
        if (filter.date_from) {
          query += ' AND p.payment_date >= ?';
          params.push(filter.date_from);
        }
        if (filter.date_to) {
          query += ' AND p.payment_date <= ?';
          params.push(filter.date_to);
        }
      }

      query += ' ORDER BY p.payment_date DESC, p.created_at DESC';

      const stmt = db.prepare(query);
      return stmt.all(params);
    } catch (error) {
      console.error('결제 목록 조회 실패:', error);
      throw error;
    }
  });

  // 특정 결제 조회
  ipcMain.handle('payment-get-by-id', async (_, id) => {
    try {
      const stmt = db.prepare(`
        SELECT p.*, m.name as member_name, m.phone as member_phone,
               mt.name as membership_type_name, pt.name as pt_package_name,
               s.name as staff_name
        FROM payments p
        JOIN members m ON p.member_id = m.id
        LEFT JOIN membership_types mt ON p.membership_type_id = mt.id
        LEFT JOIN pt_packages pt ON p.pt_package_id = pt.id
        JOIN staff s ON p.staff_id = s.id
        WHERE p.id = ?
      `);
      return stmt.get(id);
    } catch (error) {
      console.error('결제 조회 실패:', error);
      throw error;
    }
  });

  // 결제 생성
  ipcMain.handle('payment-create', async (_, data) => {
    try {
      const transaction = db.transaction(() => {
        // 결제번호 생성 (PAY-YYYYMMDD-###)
        const today = new Date().toISOString().split('T')[0].replace(/-/g, '');
        const countStmt = db.prepare(
          'SELECT COUNT(*) as count FROM payments WHERE payment_number LIKE ?'
        );
        const count = (countStmt.get(`PAY-${today}-%`) as { count: number }).count + 1;
        const paymentNumber = `PAY-${today}-${count.toString().padStart(3, '0')}`;

        // 결제 정보 삽입
        const paymentStmt = db.prepare(`
          INSERT INTO payments (
            payment_number, member_id, payment_type, membership_type_id, pt_package_id,
            amount, payment_method, payment_date, staff_id, notes
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);

        const paymentResult = paymentStmt.run(
          paymentNumber,
          data.member_id,
          data.payment_type,
          data.membership_type_id || null,
          data.pt_package_id || null,
          data.amount,
          data.payment_method,
          data.payment_date || new Date().toISOString().split('T')[0],
          data.staff_id,
          data.notes || null
        );

        // 회원권 결제인 경우 회원권 이력 생성
        if (data.payment_type === 'membership' && data.membership_type_id) {
          const membershipType = db
            .prepare('SELECT * FROM membership_types WHERE id = ?')
            .get(data.membership_type_id) as { duration_months: number };
          const startDate = new Date(data.payment_date || new Date());
          const endDate = new Date(startDate);
          endDate.setMonth(endDate.getMonth() + membershipType.duration_months);

          const historyStmt = db.prepare(`
            INSERT INTO membership_history (
              member_id, membership_type_id, payment_id, start_date, end_date
            ) VALUES (?, ?, ?, ?, ?)
          `);

          historyStmt.run(
            data.member_id,
            data.membership_type_id,
            paymentResult.lastInsertRowid,
            startDate.toISOString().split('T')[0],
            endDate.toISOString().split('T')[0]
          );
        }

        return { id: paymentResult.lastInsertRowid, payment_number: paymentNumber };
      });

      return transaction();
    } catch (error) {
      console.error('결제 생성 실패:', error);
      throw error;
    }
  });

  // 결제 정보 수정
  ipcMain.handle('payment-update', async (_, id, data) => {
    try {
      const stmt = db.prepare(`
        UPDATE payments SET
          amount = ?, payment_method = ?, payment_date = ?, notes = ?
        WHERE id = ?
      `);

      const result = stmt.run(
        data.amount,
        data.payment_method,
        data.payment_date,
        data.notes || null,
        id
      );

      return { changes: result.changes };
    } catch (error) {
      console.error('결제 수정 실패:', error);
      throw error;
    }
  });

  // 결제 삭제 (취소)
  ipcMain.handle('payment-delete', async (_, id) => {
    try {
      const stmt = db.prepare('UPDATE payments SET status = ? WHERE id = ?');
      const result = stmt.run('cancelled', id);
      return { changes: result.changes };
    } catch (error) {
      console.error('결제 삭제 실패:', error);
      throw error;
    }
  });

  // 회원별 결제 내역 조회
  ipcMain.handle('payment-get-by-member', async (_, memberId) => {
    try {
      const stmt = db.prepare(`
        SELECT p.*, mt.name as membership_type_name, pt.name as pt_package_name,
               s.name as staff_name
        FROM payments p
        LEFT JOIN membership_types mt ON p.membership_type_id = mt.id
        LEFT JOIN pt_packages pt ON p.pt_package_id = pt.id
        JOIN staff s ON p.staff_id = s.id
        WHERE p.member_id = ? AND p.status != 'cancelled'
        ORDER BY p.payment_date DESC
      `);
      return stmt.all(memberId);
    } catch (error) {
      console.error('회원별 결제 조회 실패:', error);
      throw error;
    }
  });
};
