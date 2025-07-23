import { ipcMain } from 'electron';
import { getDatabase } from '../../database/init';

// 직원 관련 IPC 핸들러 등록
export const registerStaffHandlers = (): void => {
  const db = getDatabase();

  // 모든 직원 조회 (필터링 포함)
  ipcMain.handle('staff-get-all', async (_, filter) => {
    try {
      let query = `
        SELECT s.*, sr.name as role_name, sr.permissions as role_permissions
        FROM staff s
        LEFT JOIN staff_roles sr ON s.role_id = sr.id
        WHERE 1=1
      `;
      const params: any[] = [];

      if (filter) {
        if (filter.search) {
          query += ' AND (s.name LIKE ? OR s.phone LIKE ? OR s.staff_number LIKE ?)';
          const searchTerm = `%${filter.search}%`;
          params.push(searchTerm, searchTerm, searchTerm);
        }
        if (filter.gender) {
          query += ' AND s.gender = ?';
          params.push(filter.gender);
        }
        if (filter.position) {
          query += ' AND s.position = ?';
          params.push(filter.position);
        }
        if (filter.department) {
          query += ' AND s.department = ?';
          params.push(filter.department);
        }
        if (filter.role_id && filter.role_id !== 'all') {
          query += ' AND s.role_id = ?';
          params.push(filter.role_id);
        }
        // is_active 필터링: 기본적으로 활성 직원만 표시하되, 필터가 명시적으로 설정된 경우 그에 따름
        if (filter.is_active !== undefined && filter.is_active !== 'all') {
          query += ' AND s.is_active = ?';
          params.push(filter.is_active ? 1 : 0);
        } else {
          // 필터가 설정되지 않은 경우 기본적으로 활성 직원만 표시
          query += ' AND s.is_active = 1';
        }
        if (filter.hire_date_from) {
          query += ' AND s.hire_date >= ?';
          params.push(filter.hire_date_from);
        }
        if (filter.hire_date_to) {
          query += ' AND s.hire_date <= ?';
          params.push(filter.hire_date_to);
        }
        if (filter.salary_min) {
          query += ' AND s.salary >= ?';
          params.push(filter.salary_min);
        }
        if (filter.salary_max) {
          query += ' AND s.salary <= ?';
          params.push(filter.salary_max);
        }
      }

      query += ' ORDER BY s.created_at DESC';

      const stmt = db.prepare(query);
      return stmt.all(params);
    } catch (error) {
      console.error('직원 목록 조회 실패:', error);
      throw error;
    }
  });

  // 특정 직원 조회
  ipcMain.handle('staff-get-by-id', async (_, id) => {
    try {
      const stmt = db.prepare(`
        SELECT s.*, sr.name as role_name, sr.permissions as role_permissions
        FROM staff s
        LEFT JOIN staff_roles sr ON s.role_id = sr.id
        WHERE s.id = ?
      `);
      return stmt.get(id);
    } catch (error) {
      console.error('직원 조회 실패:', error);
      throw error;
    }
  });

  // 직원 생성
  ipcMain.handle('staff-create', async (_, data) => {
    try {
      // 직원번호 생성 (STF-YYYYMMDD-###)
      const today = new Date().toISOString().split('T')[0].replace(/-/g, '');
      const countStmt = db.prepare(
        'SELECT COUNT(*) as count FROM staff WHERE staff_number LIKE ?'
      );
      const count = (countStmt.get(`STF-${today}-%`) as { count: number }).count + 1;
      const staffNumber = `STF-${today}-${count.toString().padStart(3, '0')}`;

      const stmt = db.prepare(`
        INSERT INTO staff (
          staff_number, name, phone, email, gender, birth_date,
          hire_date, position, department, salary, address, role_id, notes,
          can_manage_payments, can_manage_members, is_active
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      const result = stmt.run(
        staffNumber,
        data.name,
        data.phone || null,
        data.email || null,
        data.gender || null,
        data.birth_date || null,
        data.hire_date || new Date().toISOString().split('T')[0],
        data.position,
        data.department || null,
        data.salary || null,
        data.address || null,
        data.role_id || null,
        data.notes || null,
        data.can_manage_payments ? 1 : 0,
        data.can_manage_members ? 1 : 0,
        1  // is_active를 명시적으로 1로 설정
      );

      // 급여가 설정된 경우 급여 이력에 기록
      if (data.salary) {
        const salaryHistoryStmt = db.prepare(`
          INSERT INTO staff_salary_history (
            staff_id, previous_salary, new_salary, adjustment_amount, 
            adjustment_reason, effective_date
          ) VALUES (?, ?, ?, ?, ?, ?)
        `);

        salaryHistoryStmt.run(
          result.lastInsertRowid,
          null,
          data.salary,
          data.salary,
          '신규 채용',
          data.hire_date || new Date().toISOString().split('T')[0]
        );
      }

      return { id: result.lastInsertRowid, staff_number: staffNumber };
    } catch (error) {
      console.error('직원 생성 실패:', error);
      throw error;
    }
  });

  // 직원 정보 수정
  ipcMain.handle('staff-update', async (_, id, data) => {
    try {
      const stmt = db.prepare(`
        UPDATE staff SET
          name = ?, phone = ?, email = ?, gender = ?, birth_date = ?,
          position = ?, department = ?, salary = ?, address = ?, role_id = ?,
          notes = ?, can_manage_payments = ?, can_manage_members = ?,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `);

      const result = stmt.run(
        data.name,
        data.phone || null,
        data.email || null,
        data.gender || null,
        data.birth_date || null,
        data.position,
        data.department || null,
        data.salary || null,
        data.address || null,
        data.role_id || null,
        data.notes || null,
        data.can_manage_payments ? 1 : 0,
        data.can_manage_members ? 1 : 0,
        id
      );

      return { changes: result.changes };
    } catch (error) {
      console.error('직원 수정 실패:', error);
      throw error;
    }
  });

  // 직원 삭제 (비활성화)
  ipcMain.handle('staff-delete', async (_, id) => {
    try {
      const stmt = db.prepare('UPDATE staff SET is_active = 0 WHERE id = ?');
      const result = stmt.run(id);
      return { changes: result.changes };
    } catch (error) {
      console.error('직원 삭제 실패:', error);
      throw error;
    }
  });

  // 직원 검색
  ipcMain.handle('staff-search', async (_, query) => {
    try {
      const searchTerm = `%${query}%`;
      const stmt = db.prepare(`
        SELECT s.*, sr.name as role_name 
        FROM staff s
        LEFT JOIN staff_roles sr ON s.role_id = sr.id
        WHERE s.is_active = 1 
        AND (s.name LIKE ? OR s.phone LIKE ? OR s.staff_number LIKE ?)
        ORDER BY s.name
        LIMIT 50
      `);
      return stmt.all(searchTerm, searchTerm, searchTerm);
    } catch (error) {
      console.error('직원 검색 실패:', error);
      throw error;
    }
  });

  // 직원별 결제 내역 조회
  ipcMain.handle('staff-get-by-payment', async (_, staffId) => {
    try {
      const stmt = db.prepare(`
        SELECT p.*, m.name as member_name, m.member_number
        FROM payments p
        JOIN members m ON p.member_id = m.id
        WHERE p.staff_id = ?
        ORDER BY p.payment_date DESC
      `);
      return stmt.all(staffId);
    } catch (error) {
      console.error('직원별 결제 조회 실패:', error);
      throw error;
    }
  });

  // 직원 통계 조회
  ipcMain.handle('staff-get-stats', async () => {
    try {
      const totalStmt = db.prepare('SELECT COUNT(*) as total FROM staff WHERE is_active = 1');
      const total = (totalStmt.get() as { total: number }).total;

      const recentStmt = db.prepare(`
        SELECT COUNT(*) as recent 
        FROM staff 
        WHERE is_active = 1 AND hire_date >= date('now', '-30 days')
      `);
      const recent = (recentStmt.get() as { recent: number }).recent;

      return {
        total_staff: total,
        recent_hires: recent,
        active_staff: total
      };
    } catch (error) {
      console.error('직원 통계 조회 실패:', error);
      throw error;
    }
  });

  // 직원 급여 이력 조회
  ipcMain.handle('staff-salary-history', async (_, staffId) => {
    try {
      const stmt = db.prepare(`
        SELECT ssh.*, s.name as created_by_name
        FROM staff_salary_history ssh
        LEFT JOIN staff s ON ssh.created_by = s.id
        WHERE ssh.staff_id = ?
        ORDER BY ssh.effective_date DESC
      `);
      return stmt.all(staffId);
    } catch (error) {
      console.error('급여 이력 조회 실패:', error);
      throw error;
    }
  });

  // 급여 조정
  ipcMain.handle('staff-salary-adjust', async (_, data) => {
    try {
      const transaction = db.transaction(() => {
        // 기존 급여 조회
        const currentStaff = db.prepare('SELECT salary FROM staff WHERE id = ?').get(data.staff_id) as { salary: number };

        // 급여 업데이트
        const updateStmt = db.prepare('UPDATE staff SET salary = ? WHERE id = ?');
        updateStmt.run(data.new_salary, data.staff_id);

        // 급여 이력 추가
        const historyStmt = db.prepare(`
          INSERT INTO staff_salary_history (
            staff_id, previous_salary, new_salary, adjustment_amount,
            adjustment_reason, effective_date, created_by
          ) VALUES (?, ?, ?, ?, ?, ?, ?)
        `);

        historyStmt.run(
          data.staff_id,
          currentStaff?.salary || 0,
          data.new_salary,
          data.new_salary - (currentStaff?.salary || 0),
          data.reason || '급여 조정',
          data.effective_date || new Date().toISOString().split('T')[0],
          data.created_by
        );

        return { success: true };
      });

      return transaction();
    } catch (error) {
      console.error('급여 조정 실패:', error);
      throw error;
    }
  });

  // 직원 역할 목록 조회
  ipcMain.handle('staff-roles-get-all', async () => {
    try {
      const stmt = db.prepare('SELECT * FROM staff_roles WHERE is_active = 1 ORDER BY name');
      return stmt.all();
    } catch (error) {
      console.error('직원 역할 조회 실패:', error);
      throw error;
    }
  });

  // 직원 역할 생성
  ipcMain.handle('staff-role-create', async (_, data) => {
    try {
      const stmt = db.prepare(`
        INSERT INTO staff_roles (name, permissions, description)
        VALUES (?, ?, ?)
      `);

      const result = stmt.run(
        data.name,
        typeof data.permissions === 'string' ? data.permissions : JSON.stringify(data.permissions),
        data.description || null
      );

      return { id: result.lastInsertRowid };
    } catch (error) {
      console.error('직원 역할 생성 실패:', error);
      throw error;
    }
  });

  // 직원 역할 수정
  ipcMain.handle('staff-role-update', async (_, id, data) => {
    try {
      const stmt = db.prepare(`
        UPDATE staff_roles SET
          name = ?, permissions = ?, description = ?
        WHERE id = ?
      `);

      const result = stmt.run(
        data.name,
        typeof data.permissions === 'string' ? data.permissions : JSON.stringify(data.permissions),
        data.description || null,
        id
      );

      return { changes: result.changes };
    } catch (error) {
      console.error('직원 역할 수정 실패:', error);
      throw error;
    }
  });

  // PT 패키지 목록 조회 (PaymentForm에서 필요)
  ipcMain.handle('pt-package-get-all', async () => {
    try {
      const stmt = db.prepare('SELECT * FROM pt_packages WHERE is_active = 1 ORDER BY session_count');
      return stmt.all();
    } catch (error) {
      console.error('PT 패키지 조회 실패:', error);
      throw error;
    }
  });
}; 