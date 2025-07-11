import { ipcMain } from 'electron';
import { getDatabase } from '../../database/init';

// 회원 관련 IPC 핸들러 등록
export const registerMemberHandlers = (): void => {
  const db = getDatabase();

  // 모든 회원 조회
  ipcMain.handle('member-get-all', async (_, filter) => {
    try {
      let query = 'SELECT * FROM members WHERE active = 1';
      const params: any[] = [];

      if (filter) {
        if (filter.search) {
          query += ' AND (name LIKE ? OR phone LIKE ? OR member_number LIKE ?)';
          const searchTerm = `%${filter.search}%`;
          params.push(searchTerm, searchTerm, searchTerm);
        }
        if (filter.gender) {
          query += ' AND gender = ?';
          params.push(filter.gender);
        }
      }

      query += ' ORDER BY created_at DESC';

      const stmt = db.prepare(query);
      return stmt.all(params);
    } catch (error) {
      console.error('회원 목록 조회 실패:', error);
      throw error;
    }
  });

  // 특정 회원 조회
  ipcMain.handle('member-get-by-id', async (_, id) => {
    try {
      const stmt = db.prepare('SELECT * FROM members WHERE id = ?');
      return stmt.get(id);
    } catch (error) {
      console.error('회원 조회 실패:', error);
      throw error;
    }
  });

  // 회원 생성
  ipcMain.handle('member-create', async (_, data) => {
    try {
      // 회원번호 생성 (YYYYMMDD-###)
      const today = new Date().toISOString().split('T')[0].replace(/-/g, '');
      const countStmt = db.prepare(
        'SELECT COUNT(*) as count FROM members WHERE member_number LIKE ?'
      );
      const count = (countStmt.get(`${today}-%`) as { count: number }).count + 1;
      const memberNumber = `${today}-${count.toString().padStart(3, '0')}`;

      const stmt = db.prepare(`
        INSERT INTO members (
          member_number, name, phone, email, gender, birth_date,
          join_date, address, emergency_contact, emergency_phone, notes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      const result = stmt.run(
        memberNumber,
        data.name,
        data.phone || null,
        data.email || null,
        data.gender || null,
        data.birth_date || null,
        data.join_date || new Date().toISOString().split('T')[0],
        data.address || null,
        data.emergency_contact || null,
        data.emergency_phone || null,
        data.notes || null
      );

      return { id: result.lastInsertRowid, member_number: memberNumber };
    } catch (error) {
      console.error('회원 생성 실패:', error);
      throw error;
    }
  });

  // 회원 정보 수정
  ipcMain.handle('member-update', async (_, id, data) => {
    try {
      const stmt = db.prepare(`
        UPDATE members SET
          name = ?, phone = ?, email = ?, gender = ?, birth_date = ?,
          address = ?, emergency_contact = ?, emergency_phone = ?, notes = ?,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `);

      const result = stmt.run(
        data.name,
        data.phone || null,
        data.email || null,
        data.gender || null,
        data.birth_date || null,
        data.address || null,
        data.emergency_contact || null,
        data.emergency_phone || null,
        data.notes || null,
        id
      );

      return { changes: result.changes };
    } catch (error) {
      console.error('회원 수정 실패:', error);
      throw error;
    }
  });

  // 회원 삭제 (비활성화)
  ipcMain.handle('member-delete', async (_, id) => {
    try {
      const stmt = db.prepare('UPDATE members SET active = 0 WHERE id = ?');
      const result = stmt.run(id);
      return { changes: result.changes };
    } catch (error) {
      console.error('회원 삭제 실패:', error);
      throw error;
    }
  });

  // 회원 검색
  ipcMain.handle('member-search', async (_, query) => {
    try {
      const searchTerm = `%${query}%`;
      const stmt = db.prepare(`
        SELECT * FROM members 
        WHERE active = 1 
        AND (name LIKE ? OR phone LIKE ? OR member_number LIKE ?)
        ORDER BY name
        LIMIT 50
      `);
      return stmt.all(searchTerm, searchTerm, searchTerm);
    } catch (error) {
      console.error('회원 검색 실패:', error);
      throw error;
    }
  });
};
