import { ipcMain } from 'electron';
import { getDatabase } from '../../database/init';

// 결제 관련 IPC 핸들러 등록
export const registerPaymentHandlers = (): void => {
  const db = getDatabase();

  // 모든 결제 조회 (필터링 포함)
  ipcMain.handle('payment-get-all', async (_, filter) => {
    try {
      let query = `
        SELECT p.*, 
               m.name as member_name, m.phone as member_phone, m.member_number,
               mt.name as membership_type_name, 
               pt.name as pt_package_name,
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
        if (filter.search) {
          query += ` AND (
            p.payment_number LIKE ? OR 
            m.name LIKE ? OR 
            m.phone LIKE ? OR 
            m.member_number LIKE ?
          )`;
          const searchTerm = `%${filter.search}%`;
          params.push(searchTerm, searchTerm, searchTerm, searchTerm);
        }

        if (filter.payment_type && filter.payment_type !== 'all') {
          query += ' AND p.payment_type = ?';
          params.push(filter.payment_type);
        }

        if (filter.payment_method && filter.payment_method !== 'all') {
          query += ' AND p.payment_method = ?';
          params.push(filter.payment_method);
        }

        if (filter.status && filter.status !== 'all') {
          query += ' AND p.status = ?';
          params.push(filter.status);
        }

        if (filter.member_id) {
          query += ' AND p.member_id = ?';
          params.push(filter.member_id);
        }

        if (filter.staff_id) {
          query += ' AND p.staff_id = ?';
          params.push(filter.staff_id);
        }

        if (filter.payment_date_from) {
          query += ' AND p.payment_date >= ?';
          params.push(filter.payment_date_from);
        }

        if (filter.payment_date_to) {
          query += ' AND p.payment_date <= ?';
          params.push(filter.payment_date_to);
        }

        if (filter.amount_min) {
          query += ' AND p.amount >= ?';
          params.push(filter.amount_min);
        }

        if (filter.amount_max) {
          query += ' AND p.amount <= ?';
          params.push(filter.amount_max);
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

  // 특정 결제 조회 (상세 정보 포함)
  ipcMain.handle('payment-get-by-id', async (_, id) => {
    try {
      // 기본 결제 정보
      const paymentStmt = db.prepare(`
        SELECT p.*, 
               m.name as member_name, m.phone as member_phone, m.member_number,
               mt.name as membership_type_name, 
               pt.name as pt_package_name,
               s.name as staff_name
        FROM payments p
        JOIN members m ON p.member_id = m.id
        LEFT JOIN membership_types mt ON p.membership_type_id = mt.id
        LEFT JOIN pt_packages pt ON p.pt_package_id = pt.id
        JOIN staff s ON p.staff_id = s.id
        WHERE p.id = ?
      `);
      const payment = paymentStmt.get(id);

      if (!payment) {
        throw new Error('결제 정보를 찾을 수 없습니다.');
      }

      // 결제 항목들
      const itemsStmt = db.prepare(
        'SELECT * FROM payment_items WHERE payment_id = ? ORDER BY created_at'
      );
      const items = itemsStmt.all(id);

      // 락커 배정 정보
      const lockersStmt = db.prepare('SELECT * FROM locker_assignments WHERE payment_id = ?');
      const lockers = lockersStmt.all(id);

      // 환불 정보
      const refundsStmt = db.prepare(`
        SELECT r.*, 
               s1.name as requested_by_name,
               s2.name as approved_by_name
        FROM refunds r
        LEFT JOIN staff s1 ON r.requested_by = s1.id
        LEFT JOIN staff s2 ON r.approved_by = s2.id
        WHERE r.payment_id = ?
        ORDER BY r.requested_at DESC
      `);
      const refunds = refundsStmt.all(id);

      // 결제 이력
      const historyStmt = db.prepare(`
        SELECT h.*, s.name as performed_by_name
        FROM payment_history h
        JOIN staff s ON h.performed_by = s.id
        WHERE h.payment_id = ?
        ORDER BY h.created_at DESC
      `);
      const history = historyStmt.all(id);

      return {
        ...payment,
        items,
        locker_assignments: lockers,
        refunds,
        history,
      };
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
            amount, payment_method, payment_date, staff_id, notes, locker_type,
            expiry_date, auto_renewal
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
          data.notes || null,
          data.locker_type || null,
          data.expiry_date || null,
          data.auto_renewal ? 1 : 0
        );

        const paymentId = paymentResult.lastInsertRowid;

        // 결제 항목들 삽입 (복합 결제 지원)
        if (data.items && data.items.length > 0) {
          const itemStmt = db.prepare(`
            INSERT INTO payment_items (
              payment_id, item_type, item_subtype, item_name, quantity,
              unit_price, total_amount, specifications
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
          `);

          for (const item of data.items) {
            itemStmt.run(
              paymentId,
              item.item_type,
              item.item_subtype || null,
              item.item_name,
              item.quantity,
              item.unit_price,
              item.total_amount,
              item.specifications || null
            );
          }
        }

        // 회원권 결제인 경우 회원권 이력 생성
        if (data.payment_type === 'membership' && data.membership_type_id) {
          const membershipType = db
            .prepare('SELECT * FROM membership_types WHERE id = ?')
            .get(data.membership_type_id) as { duration_months: number };

          if (membershipType) {
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
              paymentId,
              startDate.toISOString().split('T')[0],
              endDate.toISOString().split('T')[0]
            );
          }
        }

        // PT 결제인 경우 PT 세션 패키지 생성
        if (data.payment_type === 'pt' && data.pt_package_id) {
          const ptPackage = db
            .prepare('SELECT * FROM pt_packages WHERE id = ?')
            .get(data.pt_package_id) as { session_count: number; validity_days: number };

          if (ptPackage) {
            const startDate = new Date(data.payment_date || new Date());
            const expiryDate = new Date(startDate);
            expiryDate.setDate(expiryDate.getDate() + ptPackage.validity_days);

            const ptStmt = db.prepare(`
              INSERT INTO pt_sessions (
                member_id, pt_package_id, payment_id, trainer_id, session_date,
                total_sessions, used_sessions, remaining_sessions, package_expiry_date, package_status
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `);

            ptStmt.run(
              data.member_id,
              data.pt_package_id,
              paymentId,
              data.staff_id, // 담당 직원을 트레이너로 설정
              startDate.toISOString().split('T')[0],
              ptPackage.session_count,
              0, // 사용한 세션 수
              ptPackage.session_count, // 남은 세션 수
              expiryDate.toISOString().split('T')[0],
              'active'
            );
          }
        }

        // 락커 결제인 경우 락커 배정 생성
        if (data.locker_type && data.expiry_date) {
          const lockerStmt = db.prepare(`
            INSERT INTO locker_assignments (
              member_id, payment_id, locker_number, locker_type,
              start_date, end_date, monthly_fee
            ) VALUES (?, ?, ?, ?, ?, ?, ?)
          `);

          // 임시 락커 번호 생성 (실제로는 사용 가능한 락커 조회 로직 필요)
          const lockerNumber = `L${String(paymentId).padStart(3, '0')}`;

          lockerStmt.run(
            data.member_id,
            paymentId,
            lockerNumber,
            data.locker_type,
            data.payment_date || new Date().toISOString().split('T')[0],
            data.expiry_date,
            Math.floor(data.amount / 12) // 월별 요금 계산 (임시)
          );
        }

        // 결제 이력 기록
        const historyStmt = db.prepare(`
          INSERT INTO payment_history (
            payment_id, action, new_value, performed_by
          ) VALUES (?, ?, ?, ?)
        `);

        historyStmt.run(
          paymentId,
          'created',
          JSON.stringify({
            amount: data.amount,
            payment_method: data.payment_method,
            payment_type: data.payment_type,
          }),
          data.staff_id
        );

        return { id: paymentId, payment_number: paymentNumber };
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
      // 기존 결제 정보 조회
      const oldPayment = db.prepare('SELECT * FROM payments WHERE id = ?').get(id);
      if (!oldPayment) {
        throw new Error('결제 정보를 찾을 수 없습니다.');
      }

      const transaction = db.transaction(() => {
        // 결제 정보 업데이트
        const updateFields = [];
        const updateValues = [];

        if (data.amount !== undefined) {
          updateFields.push('amount = ?');
          updateValues.push(data.amount);
        }
        if (data.payment_method !== undefined) {
          updateFields.push('payment_method = ?');
          updateValues.push(data.payment_method);
        }
        if (data.payment_date !== undefined) {
          updateFields.push('payment_date = ?');
          updateValues.push(data.payment_date);
        }
        if (data.notes !== undefined) {
          updateFields.push('notes = ?');
          updateValues.push(data.notes);
        }
        if (data.status !== undefined) {
          updateFields.push('status = ?');
          updateValues.push(data.status);
        }

        if (updateFields.length > 0) {
          const stmt = db.prepare(`
            UPDATE payments SET ${updateFields.join(', ')}
            WHERE id = ?
          `);
          updateValues.push(id);
          stmt.run(...updateValues);
        }

        return { changes: updateFields.length };
      });

      return transaction();
    } catch (error) {
      console.error('결제 수정 실패:', error);
      throw error;
    }
  });

  // 결제 취소 (소프트 삭제)
  ipcMain.handle('payment-cancel', async (_, id, staffId, reason) => {
    try {
      const transaction = db.transaction(() => {
        // 결제 상태를 취소로 변경
        const stmt = db.prepare('UPDATE payments SET status = ? WHERE id = ?');
        const result = stmt.run('cancelled', id);

        // 이력 기록
        const historyStmt = db.prepare(`
          INSERT INTO payment_history (
            payment_id, action, old_value, new_value, performed_by, notes
          ) VALUES (?, ?, ?, ?, ?, ?)
        `);

        historyStmt.run(
          id,
          'cancelled',
          JSON.stringify({ status: 'completed' }),
          JSON.stringify({ status: 'cancelled' }),
          staffId,
          reason || '결제 취소'
        );

        return { changes: result.changes };
      });

      return transaction();
    } catch (error) {
      console.error('결제 취소 실패:', error);
      throw error;
    }
  });

  // 환불 요청 생성
  ipcMain.handle('refund-create', async (_, data) => {
    try {
      const transaction = db.transaction(() => {
        const stmt = db.prepare(`
          INSERT INTO refunds (
            payment_id, requested_by, refund_amount, reason, refund_method,
            account_info, notes
          ) VALUES (?, ?, ?, ?, ?, ?, ?)
        `);

        const result = stmt.run(
          data.payment_id,
          data.requested_by,
          data.refund_amount,
          data.reason,
          data.refund_method,
          data.account_info || null,
          data.notes || null
        );

        // 결제 이력에 환불 요청 기록
        const historyStmt = db.prepare(`
          INSERT INTO payment_history (
            payment_id, action, new_value, performed_by, notes
          ) VALUES (?, ?, ?, ?, ?)
        `);

        historyStmt.run(
          data.payment_id,
          'refund_requested',
          JSON.stringify({
            refund_amount: data.refund_amount,
            refund_method: data.refund_method,
          }),
          data.requested_by,
          data.reason
        );

        return { id: result.lastInsertRowid };
      });

      return transaction();
    } catch (error) {
      console.error('환불 요청 생성 실패:', error);
      throw error;
    }
  });

  // 환불 승인/거부
  ipcMain.handle('refund-update', async (_, refundId, data) => {
    try {
      const transaction = db.transaction(() => {
        const updateFields = ['status = ?'];
        const updateValues = [data.status];

        if (data.status === 'approved' || data.status === 'rejected') {
          updateFields.push('approved_by = ?', 'approved_at = ?');
          updateValues.push(data.approved_by, new Date().toISOString());
        }

        if (data.status === 'processed') {
          updateFields.push('processed_at = ?');
          updateValues.push(new Date().toISOString());
        }

        if (data.notes) {
          updateFields.push('notes = ?');
          updateValues.push(data.notes);
        }

        const stmt = db.prepare(`
          UPDATE refunds SET ${updateFields.join(', ')}
          WHERE id = ?
        `);
        updateValues.push(refundId);
        const result = stmt.run(...updateValues);

        // 승인된 경우 결제 상태도 업데이트
        if (data.status === 'processed') {
          const refund = db.prepare('SELECT payment_id FROM refunds WHERE id = ?').get(refundId) as
            | { payment_id: number }
            | undefined;
          if (refund) {
            db.prepare('UPDATE payments SET status = ? WHERE id = ?').run(
              'refunded',
              refund.payment_id
            );
          }
        }

        return { changes: result.changes };
      });

      return transaction();
    } catch (error) {
      console.error('환불 처리 실패:', error);
      throw error;
    }
  });

  // 결제 통계 조회
  ipcMain.handle('payment-get-stats', async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const thisMonth = new Date().toISOString().substring(0, 7);

      // 전체 통계
      const totalStmt = db.prepare(`
        SELECT 
          COUNT(*) as total_payments,
          COALESCE(SUM(amount), 0) as total_amount
        FROM payments 
        WHERE status = 'completed'
      `);
      const total = totalStmt.get() as { total_payments: number; total_amount: number };

      // 오늘 통계
      const todayStmt = db.prepare(`
        SELECT 
          COUNT(*) as today_payments,
          COALESCE(SUM(amount), 0) as today_amount
        FROM payments 
        WHERE status = 'completed' AND payment_date = ?
      `);
      const todayStats = todayStmt.get(today) as { today_payments: number; today_amount: number };

      // 이번 달 통계
      const monthStmt = db.prepare(`
        SELECT 
          COUNT(*) as month_payments,
          COALESCE(SUM(amount), 0) as month_amount
        FROM payments 
        WHERE status = 'completed' AND strftime('%Y-%m', payment_date) = ?
      `);
      const monthStats = monthStmt.get(thisMonth) as {
        month_payments: number;
        month_amount: number;
      };

      // 유형별 통계
      const byTypeStmt = db.prepare(`
        SELECT 
          payment_type,
          COUNT(*) as count,
          COALESCE(SUM(amount), 0) as amount
        FROM payments 
        WHERE status = 'completed'
        GROUP BY payment_type
      `);
      const typeResults = byTypeStmt.all() as Array<{
        payment_type: string;
        count: number;
        amount: number;
      }>;

      // 결제 방식별 통계
      const byMethodStmt = db.prepare(`
        SELECT 
          payment_method,
          COUNT(*) as count,
          COALESCE(SUM(amount), 0) as amount
        FROM payments 
        WHERE status = 'completed'
        GROUP BY payment_method
      `);
      const methodResults = byMethodStmt.all() as Array<{
        payment_method: string;
        count: number;
        amount: number;
      }>;

      // 상태별 통계
      const byStatusStmt = db.prepare(`
        SELECT 
          status,
          COUNT(*) as count,
          COALESCE(SUM(amount), 0) as amount
        FROM payments 
        GROUP BY status
      `);
      const statusResults = byStatusStmt.all() as Array<{
        status: string;
        count: number;
        amount: number;
      }>;

      // 직원별 매출 통계
      const topStaffStmt = db.prepare(`
        SELECT 
          s.id as staff_id,
          s.name as staff_name,
          COUNT(p.id) as count,
          COALESCE(SUM(p.amount), 0) as amount
        FROM staff s
        LEFT JOIN payments p ON s.id = p.staff_id AND p.status = 'completed'
        WHERE s.is_active = 1
        GROUP BY s.id, s.name
        ORDER BY amount DESC
        LIMIT 10
      `);
      const topStaff = topStaffStmt.all() as Array<{
        staff_id: number;
        staff_name: string;
        count: number;
        amount: number;
      }>;

      // 대기 중인 환불 건수
      const pendingRefundsStmt = db.prepare(
        'SELECT COUNT(*) as count FROM refunds WHERE status = ?'
      );
      const pendingRefunds = (pendingRefundsStmt.get('pending') as { count: number }).count;

      // 30일 이내 만료 예정
      const expiringSoonStmt = db.prepare(`
        SELECT COUNT(*) as count 
        FROM payments 
        WHERE expiry_date IS NOT NULL 
        AND expiry_date BETWEEN ? AND ?
        AND status = 'completed'
      `);
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
      const expiringSoon = (
        expiringSoonStmt.get(today, thirtyDaysFromNow.toISOString().split('T')[0]) as {
          count: number;
        }
      ).count;

      return {
        ...total,
        ...todayStats,
        ...monthStats,
        by_type: typeResults.reduce(
          (acc, item) => {
            acc[item.payment_type] = { count: item.count, amount: item.amount };
            return acc;
          },
          {} as Record<string, { count: number; amount: number }>
        ),
        by_method: methodResults.reduce(
          (acc, item) => {
            acc[item.payment_method] = { count: item.count, amount: item.amount };
            return acc;
          },
          {} as Record<string, { count: number; amount: number }>
        ),
        by_status: statusResults.reduce(
          (acc, item) => {
            acc[item.status] = { count: item.count, amount: item.amount };
            return acc;
          },
          {} as Record<string, { count: number; amount: number }>
        ),
        top_staff: topStaff,
        pending_refunds: pendingRefunds,
        expiring_soon: expiringSoon,
      };
    } catch (error) {
      console.error('결제 통계 조회 실패:', error);
      throw error;
    }
  });

  // 회원별 결제 내역 조회
  ipcMain.handle('payment-get-by-member', async (_, memberId) => {
    try {
      const stmt = db.prepare(`
        SELECT p.*, 
               mt.name as membership_type_name, 
               pt.name as pt_package_name,
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

  // 직원별 결제 내역 조회
  ipcMain.handle('payment-get-by-staff', async (_, staffId) => {
    try {
      const stmt = db.prepare(`
        SELECT p.*, 
               m.name as member_name, m.member_number,
               mt.name as membership_type_name, 
               pt.name as pt_package_name
        FROM payments p
        JOIN members m ON p.member_id = m.id
        LEFT JOIN membership_types mt ON p.membership_type_id = mt.id
        LEFT JOIN pt_packages pt ON p.pt_package_id = pt.id
        WHERE p.staff_id = ? AND p.status != 'cancelled'
        ORDER BY p.payment_date DESC
      `);
      return stmt.all(staffId);
    } catch (error) {
      console.error('직원별 결제 조회 실패:', error);
      throw error;
    }
  });

  // 환불 가능 여부 확인
  ipcMain.handle('payment-check-refund-eligibility', async (_, paymentId) => {
    try {
      const payment = db.prepare('SELECT * FROM payments WHERE id = ?').get(paymentId) as any;
      if (!payment) {
        return { eligible: false, reason: '결제 정보를 찾을 수 없습니다.' };
      }

      if (payment.status !== 'completed') {
        return { eligible: false, reason: '완료된 결제만 환불 가능합니다.' };
      }

      // 이미 환불된 금액 계산
      const refundedStmt = db.prepare(`
        SELECT COALESCE(SUM(refund_amount), 0) as refunded_amount
        FROM refunds 
        WHERE payment_id = ? AND status IN ('approved', 'processed')
      `);
      const refunded = (refundedStmt.get(paymentId) as { refunded_amount: number }).refunded_amount;

      const maxRefundAmount = payment.amount - refunded;

      if (maxRefundAmount <= 0) {
        return { eligible: false, reason: '이미 전액 환불되었습니다.' };
      }

      // 결제 방식에 따른 환불 방법 제안
      let suggestedMethod: 'account_transfer' | 'card_cancel' | 'cash' = 'cash';
      if (payment.payment_method === '카드') {
        suggestedMethod = 'card_cancel';
      } else if (payment.payment_method === '계좌이체') {
        suggestedMethod = 'account_transfer';
      }

      return {
        eligible: true,
        max_refund_amount: maxRefundAmount,
        suggested_method: suggestedMethod,
      };
    } catch (error) {
      console.error('환불 가능 여부 확인 실패:', error);
      throw error;
    }
  });
};
