import { ipcMain } from 'electron';
import { getDatabase } from '../../database/init';

// 회원 관련 IPC 핸들러 등록
export const registerMemberHandlers = (): void => {
  const db = getDatabase();

  // 디버그: 마이그레이션 상태 확인
  ipcMain.handle('member-debug-schema', async () => {
    try {
      console.log('🔍 [Debug] 데이터베이스 스키마 및 마이그레이션 상태 확인');

      // 1. 마이그레이션 상태 확인
      const migrationStmt = db.prepare('SELECT * FROM schema_migrations ORDER BY version');
      const migrations = migrationStmt.all();
      console.log('🔍 [Debug] 적용된 마이그레이션들:', migrations);

      // 2. members 테이블 스키마 확인
      const schemaStmt = db.prepare('PRAGMA table_info(members)');
      const schemaInfo = schemaStmt.all();
      console.log('🔍 [Debug] members 테이블 현재 스키마:', schemaInfo);

      // 3. assigned_staff_id 컬럼 존재 여부
      const hasAssignedStaffColumn = schemaInfo.some(
        (col: any) => col.name === 'assigned_staff_id'
      );
      console.log('🔍 [Debug] assigned_staff_id 컬럼 존재:', hasAssignedStaffColumn);

      // 4. 샘플 데이터 확인
      const sampleStmt = db.prepare('SELECT * FROM members LIMIT 3');
      const sampleData = sampleStmt.all();
      console.log('🔍 [Debug] 샘플 회원 데이터:', sampleData);

      return {
        migrations,
        schema: schemaInfo,
        hasAssignedStaffColumn,
        sampleData,
      };
    } catch (error) {
      console.error('🚨 [Debug] 스키마 확인 실패:', error);
      throw error;
    }
  });

  // 디버그: 회원 데이터 일치성 검증
  ipcMain.handle('member-verify-data-consistency', async () => {
    try {
      console.log('🔍 [Debug] 회원 데이터 일치성 검증 시작');

      const verification = {
        timestamp: new Date().toISOString(),
        table_counts: {} as any,
        stats_counts: {} as any,
        discrepancies: [] as string[],
        deleted_members: {} as any,
        detailed_breakdown: {} as any,
      };

      // 1. 테이블 직접 카운트 (모든 조건별)
      console.log('📊 [Debug] 테이블 직접 카운트 실행');

      // 전체 회원 수 (삭제된 회원 포함)
      const totalAllStmt = db.prepare('SELECT COUNT(*) as count FROM members');
      verification.table_counts.total_including_deleted = (
        totalAllStmt.get() as { count: number }
      ).count;

      // 삭제되지 않은 전체 회원 수
      const totalNotDeletedStmt = db.prepare(
        'SELECT COUNT(*) as count FROM members WHERE deleted_at IS NULL'
      );
      verification.table_counts.total_not_deleted = (
        totalNotDeletedStmt.get() as { count: number }
      ).count;

      // 삭제되지 않은 활성 회원 수
      const activeNotDeletedStmt = db.prepare(
        'SELECT COUNT(*) as count FROM members WHERE deleted_at IS NULL AND active = 1'
      );
      verification.table_counts.active_not_deleted = (
        activeNotDeletedStmt.get() as { count: number }
      ).count;

      // 삭제되지 않은 비활성 회원 수
      const inactiveNotDeletedStmt = db.prepare(
        'SELECT COUNT(*) as count FROM members WHERE deleted_at IS NULL AND active = 0'
      );
      verification.table_counts.inactive_not_deleted = (
        inactiveNotDeletedStmt.get() as { count: number }
      ).count;

      // 삭제된 회원 수
      const deletedStmt = db.prepare(
        'SELECT COUNT(*) as count FROM members WHERE deleted_at IS NOT NULL'
      );
      verification.table_counts.deleted = (deletedStmt.get() as { count: number }).count;

      // 2. 통계 API로 계산된 수치 가져오기
      console.log('📊 [Debug] 통계 API 수치 가져오기');

      const base_condition = 'deleted_at IS NULL';
      const statsStmt = db.prepare(`
        SELECT 
          COUNT(*) as total,
          COUNT(CASE WHEN active = 1 THEN 1 END) as active,
          COUNT(CASE WHEN active = 0 THEN 1 END) as inactive
        FROM members
        WHERE ${base_condition}
      `);
      const statsResult = statsStmt.get() as { total: number; active: number; inactive: number };

      verification.stats_counts = {
        total: statsResult.total,
        active: statsResult.active,
        inactive: statsResult.inactive,
      };

      // 3. 삭제된 회원들 상세 정보
      console.log('🗑️ [Debug] 삭제된 회원들 분석');

      const deletedMembersStmt = db.prepare(`
        SELECT id, name, member_number, active, deleted_at, created_at 
        FROM members 
        WHERE deleted_at IS NOT NULL 
        ORDER BY deleted_at DESC
      `);
      const deletedMembersData = deletedMembersStmt.all();

      verification.deleted_members = {
        count: deletedMembersData.length,
        list: deletedMembersData,
        active_when_deleted: deletedMembersData.filter((m: any) => m.active === 1).length,
        inactive_when_deleted: deletedMembersData.filter((m: any) => m.active === 0).length,
      };

      // 4. 일치성 검증
      console.log('✅ [Debug] 일치성 검증 수행');

      if (verification.table_counts.total_not_deleted !== verification.stats_counts.total) {
        verification.discrepancies.push(
          `전체 회원 수 불일치: 테이블=${verification.table_counts.total_not_deleted}, 통계=${verification.stats_counts.total}`
        );
      }

      if (verification.table_counts.active_not_deleted !== verification.stats_counts.active) {
        verification.discrepancies.push(
          `활성 회원 수 불일치: 테이블=${verification.table_counts.active_not_deleted}, 통계=${verification.stats_counts.active}`
        );
      }

      if (verification.table_counts.inactive_not_deleted !== verification.stats_counts.inactive) {
        verification.discrepancies.push(
          `비활성 회원 수 불일치: 테이블=${verification.table_counts.inactive_not_deleted}, 통계=${verification.stats_counts.inactive}`
        );
      }

      // 5. 상세 분석
      verification.detailed_breakdown = {
        should_match: {
          total_not_deleted: verification.table_counts.total_not_deleted,
          stats_total: verification.stats_counts.total,
          matches: verification.table_counts.total_not_deleted === verification.stats_counts.total,
        },
        excluded_from_stats: {
          deleted_members: verification.table_counts.deleted,
          total_including_deleted: verification.table_counts.total_including_deleted,
        },
        summary: {
          table_shows_in_ui: verification.table_counts.active_not_deleted, // member-get-all 기본 결과
          stats_shows_total: verification.stats_counts.total, // 통계의 전체 수
          should_be_same:
            verification.table_counts.total_not_deleted === verification.stats_counts.total,
        },
      };

      // 6. 로그 출력
      console.log('📋 [Debug] 검증 결과 요약:');
      console.log(
        `  - 전체 회원 (삭제 포함): ${verification.table_counts.total_including_deleted}명`
      );
      console.log(`  - 삭제되지 않은 회원: ${verification.table_counts.total_not_deleted}명`);
      console.log(`  - 통계 API 전체 수: ${verification.stats_counts.total}명`);
      console.log(`  - 삭제된 회원: ${verification.table_counts.deleted}명`);
      console.log(`  - 불일치 항목: ${verification.discrepancies.length}개`);

      if (verification.discrepancies.length > 0) {
        console.log('⚠️ [Debug] 발견된 불일치:');
        verification.discrepancies.forEach(d => console.log(`    - ${d}`));
      } else {
        console.log('✅ [Debug] 모든 수치가 일치합니다');
      }

      return verification;
    } catch (error) {
      console.error('🚨 [Debug] 데이터 일치성 검증 실패:', error);
      throw error;
    }
  });

  // 디버그: UI 필터 분석 (어떤 필터가 적용되어 어떤 결과가 나오는지 확인)
  ipcMain.handle('member-debug-ui-filter', async (_, filter) => {
    try {
      console.log('🔍 [Debug] UI 필터 분석 시작');
      console.log('🔍 [Debug] 받은 필터:', filter);

      const analysis = {
        timestamp: new Date().toISOString(),
        input_filter: filter,
        expected_behavior: {} as any,
        actual_query: {} as any,
        result_counts: {} as any,
        filter_analysis: {} as any,
      };

      // 1. 필터 분석
      analysis.filter_analysis = {
        has_filter_object: !!filter,
        active_filter_value: filter?.active,
        active_filter_type: typeof filter?.active,
        will_show_only_active: !filter || (filter.active !== 'all' && filter.active !== false),
        effective_filter:
          filter?.active === 'all'
            ? 'all_members'
            : filter?.active === false
              ? 'inactive_only'
              : filter?.active === true
                ? 'active_only'
                : 'default_active_only',
      };

      // 2. 예상 동작
      if (!filter || (filter.active !== 'all' && filter.active !== false)) {
        analysis.expected_behavior = {
          description: '활성 회원만 표시 (기본 동작)',
          expected_count: 'active_members_only',
          sql_condition: 'WHERE deleted_at IS NULL AND active = 1',
        };
      } else if (filter.active === 'all') {
        analysis.expected_behavior = {
          description: '전체 회원 표시 (활성 + 비활성)',
          expected_count: 'all_non_deleted_members',
          sql_condition: 'WHERE deleted_at IS NULL',
        };
      } else if (filter.active === false) {
        analysis.expected_behavior = {
          description: '비활성 회원만 표시',
          expected_count: 'inactive_members_only',
          sql_condition: 'WHERE deleted_at IS NULL AND active = 0',
        };
      }

      // 3. 실제 쿼리 시뮬레이션
      let query = `
        SELECT m.*, s.name as assigned_staff_name, s.position as assigned_staff_position
        FROM members m
        LEFT JOIN staff s ON m.assigned_staff_id = s.id
        WHERE m.deleted_at IS NULL
      `;
      const params: any[] = [];

      if (filter) {
        if (filter.active === true) {
          query += ' AND m.active = 1';
        } else if (filter.active === false) {
          query += ' AND m.active = 0';
        } else if (filter.active !== 'all') {
          query += ' AND m.active = 1';
        }
      } else {
        query += ' AND m.active = 1';
      }

      analysis.actual_query = {
        sql: query,
        params: params,
        simplified: query.replace(/\s+/g, ' ').trim(),
      };

      // 4. 실제 결과 카운트
      const countQuery = query
        .replace(
          'SELECT m.*, s.name as assigned_staff_name, s.position as assigned_staff_position',
          'SELECT COUNT(*) as count'
        )
        .replace(/ORDER BY.*$/, '');

      const countStmt = db.prepare(countQuery);
      const result = countStmt.get(params) as { count: number };
      analysis.result_counts.ui_would_show = result.count;

      // 5. 비교용 직접 카운트
      const directCounts = {
        all_including_deleted: db.prepare('SELECT COUNT(*) as count FROM members').get() as {
          count: number;
        },
        all_not_deleted: db
          .prepare('SELECT COUNT(*) as count FROM members WHERE deleted_at IS NULL')
          .get() as { count: number },
        active_only: db
          .prepare('SELECT COUNT(*) as count FROM members WHERE deleted_at IS NULL AND active = 1')
          .get() as { count: number },
        inactive_only: db
          .prepare('SELECT COUNT(*) as count FROM members WHERE deleted_at IS NULL AND active = 0')
          .get() as { count: number },
        deleted: db
          .prepare('SELECT COUNT(*) as count FROM members WHERE deleted_at IS NOT NULL')
          .get() as { count: number },
      };

      analysis.result_counts = {
        ...analysis.result_counts,
        direct_counts: {
          all_including_deleted: directCounts.all_including_deleted.count,
          all_not_deleted: directCounts.all_not_deleted.count,
          active_only: directCounts.active_only.count,
          inactive_only: directCounts.inactive_only.count,
          deleted: directCounts.deleted.count,
        },
      };

      // 6. 로그 출력
      console.log('📋 [Debug] UI 필터 분석 결과:');
      console.log(`  - 입력된 필터:`, filter);
      console.log(`  - 효과적인 필터: ${analysis.filter_analysis.effective_filter}`);
      console.log(`  - UI가 표시할 회원 수: ${analysis.result_counts.ui_would_show}명`);
      console.log(
        `  - 전체 회원 (삭제 제외): ${analysis.result_counts.direct_counts.all_not_deleted}명`
      );
      console.log(`  - 활성 회원: ${analysis.result_counts.direct_counts.active_only}명`);
      console.log(`  - 비활성 회원: ${analysis.result_counts.direct_counts.inactive_only}명`);
      console.log(`  - 예상 동작: ${analysis.expected_behavior.description}`);

      return analysis;
    } catch (error) {
      console.error('🚨 [Debug] UI 필터 분석 실패:', error);
      throw error;
    }
  });

  // 디버그: assigned_staff_id 컬럼 수동 추가
  ipcMain.handle('member-fix-schema', async () => {
    try {
      console.log('🔧 [Debug] assigned_staff_id 컬럼 수동 추가 시도');

      // 1. 현재 스키마 확인
      const schemaStmt = db.prepare('PRAGMA table_info(members)');
      const schemaInfo = schemaStmt.all();
      const hasAssignedStaffColumn = schemaInfo.some(
        (col: any) => col.name === 'assigned_staff_id'
      );

      if (hasAssignedStaffColumn) {
        console.log('✅ [Debug] assigned_staff_id 컬럼이 이미 존재합니다');
        return { success: true, message: 'assigned_staff_id 컬럼이 이미 존재합니다' };
      }

      // 2. 컬럼 추가
      console.log('🔧 [Debug] assigned_staff_id 컬럼 추가 중...');
      db.exec('ALTER TABLE members ADD COLUMN assigned_staff_id INTEGER');

      // 3. 외래키 인덱스 추가
      console.log('🔧 [Debug] 인덱스 추가 중...');
      db.exec(
        'CREATE INDEX IF NOT EXISTS idx_members_assigned_staff ON members(assigned_staff_id)'
      );

      console.log('✅ [Debug] assigned_staff_id 컬럼 추가 완료');
      return { success: true, message: 'assigned_staff_id 컬럼이 성공적으로 추가되었습니다' };
    } catch (error) {
      console.error('🚨 [Debug] 컬럼 추가 실패:', error);
      throw error;
    }
  });

  // 모든 회원 조회 (고급 필터링 지원)
  ipcMain.handle('member-get-all', async (_, filter) => {
    try {
      console.log('🔍 [memberHandlers] member-get-all 호출됨');
      console.log('🔍 [memberHandlers] 받은 필터:', JSON.stringify(filter, null, 2));

      let query = `
        SELECT m.*, s.name as assigned_staff_name, s.position as assigned_staff_position
        FROM members m
        LEFT JOIN staff s ON m.assigned_staff_id = s.id
        WHERE m.deleted_at IS NULL
      `;
      const params: any[] = [];

      if (filter) {
        console.log('🔍 [memberHandlers] 필터 처리 시작');

        // 활성 상태 필터
        if (filter.active === true) {
          query += ' AND m.active = 1';
          console.log('🔍 [memberHandlers] 활성 회원 필터 적용');
        } else if (filter.active === false) {
          query += ' AND m.active = 0';
          console.log('🔍 [memberHandlers] 비활성 회원 필터 적용');
        }
        // filter.active === 'all' 또는 undefined인 경우 활성 상태 필터를 적용하지 않음

        // 통합 검색 (이름, 전화번호, 회원번호)
        if (filter.search) {
          query += ' AND (m.name LIKE ? OR m.phone LIKE ? OR m.member_number LIKE ?)';
          const searchTerm = `%${filter.search}%`;
          params.push(searchTerm, searchTerm, searchTerm);
        }

        // 성별 필터
        if (filter.gender && filter.gender !== '') {
          query += ' AND m.gender = ?';
          params.push(filter.gender);
        }

        // 생년월일 범위 필터
        if (filter.birth_date_from) {
          console.log('🔍 [memberHandlers] birth_date_from:', filter.birth_date_from);
          query += ' AND m.birth_date >= ?';
          params.push(filter.birth_date_from);
        }
        if (filter.birth_date_to) {
          console.log('🔍 [memberHandlers] birth_date_to:', filter.birth_date_to);
          query += ' AND m.birth_date <= ?';
          params.push(filter.birth_date_to);
        }

        // 가입일 범위 필터
        if (filter.join_date_from) {
          console.log('🔍 [memberHandlers] join_date_from:', filter.join_date_from);
          query += ' AND m.join_date >= ?';
          params.push(filter.join_date_from);
        }
        if (filter.join_date_to) {
          console.log('🔍 [memberHandlers] join_date_to:', filter.join_date_to);
          query += ' AND m.join_date <= ?';
          params.push(filter.join_date_to);
        }

        // 나이 범위 필터 (SQLite에서 계산)
        if (filter.age_min || filter.age_max) {
          const ageSubquery = `(
            CASE 
              WHEN m.birth_date IS NOT NULL 
              THEN CAST((julianday('now') - julianday(m.birth_date)) / 365.25 AS INTEGER)
              ELSE NULL 
            END
          )`;

          if (filter.age_min) {
            query += ` AND ${ageSubquery} >= ?`;
            params.push(filter.age_min);
          }
          if (filter.age_max) {
            query += ` AND ${ageSubquery} <= ?`;
            params.push(filter.age_max);
          }
        }

        // 연락처 유무 필터
        if (filter.has_phone === true) {
          query += ' AND m.phone IS NOT NULL AND m.phone != ""';
        } else if (filter.has_phone === false) {
          query += ' AND (m.phone IS NULL OR m.phone = "")';
        }

        // 이메일 유무 필터
        if (filter.has_email === true) {
          query += ' AND m.email IS NOT NULL AND m.email != ""';
        } else if (filter.has_email === false) {
          query += ' AND (m.email IS NULL OR m.email = "")';
        }

        // 담당직원 필터
        if (filter.assigned_staff_id && filter.assigned_staff_id !== 'all') {
          if (filter.assigned_staff_id === 'unassigned') {
            query += ' AND m.assigned_staff_id IS NULL';
          } else {
            query += ' AND m.assigned_staff_id = ?';
            params.push(parseInt(filter.assigned_staff_id));
          }
        }

        // 회원권 보유 필터 (membership_history 테이블과 조인)
        if (filter.has_membership === true) {
          query += ` AND EXISTS (
            SELECT 1 FROM membership_history mh 
            WHERE mh.member_id = m.id 
            AND mh.is_active = 1 
            AND mh.end_date >= date('now')
          )`;
        } else if (filter.has_membership === false) {
          query += ` AND NOT EXISTS (
            SELECT 1 FROM membership_history mh 
            WHERE mh.member_id = m.id 
            AND mh.is_active = 1 
            AND mh.end_date >= date('now')
          )`;
        }
      }
      // 필터가 없는 경우에도 모든 회원을 표시 (삭제되지 않은 회원만)

      // 정렬 옵션 적용
      if (filter && filter.sort) {
        const { field, direction } = filter.sort;
        const validSortFields = ['name', 'join_date', 'created_at', 'updated_at', 'birth_date'];

        if (validSortFields.includes(field)) {
          query += ` ORDER BY m.${field} ${direction.toUpperCase()}`;
        } else if (field === 'age') {
          // 나이 정렬은 생년월일 역순
          query += ` ORDER BY m.birth_date ${direction === 'asc' ? 'DESC' : 'ASC'}`;
        } else {
          // 기본 정렬
          query += ' ORDER BY m.created_at DESC';
        }
      } else {
        query += ' ORDER BY m.created_at DESC';
      }

      // 페이지네이션 지원
      let limitParamCount = 0; // 페이지네이션으로 추가된 파라미터 개수 추적
      if (filter && filter.limit) {
        query += ' LIMIT ?';
        params.push(filter.limit);
        limitParamCount = 1;

        if (filter.page && filter.page > 1) {
          query += ' OFFSET ?';
          params.push((filter.page - 1) * filter.limit);
          limitParamCount = 2;
        }
      }

      console.log('회원 목록 쿼리:', query);
      console.log('파라미터:', params);
      console.log('🔍 [memberHandlers] 파라미터 개수:', params.length);
      console.log('🔍 [memberHandlers] 쿼리의 ? 개수:', (query.match(/\?/g) || []).length);
      console.log('🔍 [memberHandlers] 페이지네이션 파라미터 개수:', limitParamCount);

      const stmt = db.prepare(query);
      const results = stmt.all(params);

      // 페이지네이션 정보가 요청된 경우 총 개수도 조회
      if (filter && filter.limit) {
        // 같은 조건으로 총 개수 조회 (LIMIT/OFFSET 제외)
        console.log('🔍 [memberHandlers] 원본 쿼리:', query);

        // ORDER BY와 LIMIT 절을 제거
        let countQuery = query;

        // ORDER BY 절 제거 (더 정확한 정규식 사용)
        countQuery = countQuery.replace(/\s+ORDER BY[^]*$/i, '');
        console.log('🔍 [memberHandlers] ORDER BY 제거 후:', countQuery);

        // LIMIT 절 제거 (더 정확한 정규식 사용)  
        countQuery = countQuery.replace(/\s+LIMIT[^]*$/i, '');
        console.log('🔍 [memberHandlers] LIMIT 제거 후:', countQuery);

        // SELECT 절 교체
        countQuery = countQuery.replace(
          'SELECT m.*, s.name as assigned_staff_name, s.position as assigned_staff_position',
          'SELECT COUNT(*) as total'
        );
        console.log('🔍 [memberHandlers] 최종 COUNT 쿼리:', countQuery);

        // COUNT 쿼리의 ? 개수 확인
        const countQueryParamCount = (countQuery.match(/\?/g) || []).length;
        console.log('🔍 [memberHandlers] COUNT 쿼리의 ? 개수:', countQueryParamCount);

        const countStmt = db.prepare(countQuery);
        const countParams = params.slice(0, -limitParamCount); // 페이지네이션 파라미터만 제외
        console.log('🔍 [memberHandlers] COUNT 파라미터:', countParams);
        console.log('🔍 [memberHandlers] COUNT 파라미터 개수:', countParams.length);

        if (countParams.length !== countQueryParamCount) {
          console.error('🚨 [memberHandlers] COUNT 쿼리 파라미터 개수 불일치!');
          console.error('🚨 [memberHandlers] 필요:', countQueryParamCount, '제공:', countParams.length);
          throw new Error(`COUNT 쿼리 파라미터 개수 불일치: 필요 ${countQueryParamCount}개, 제공 ${countParams.length}개`);
        }

        const countResult = countStmt.get(countParams) as { total: number };

        const total = countResult.total;
        const totalPages = Math.ceil(total / filter.limit);
        const currentPage = filter.page || 1;

        return {
          members: results,
          pagination: {
            page: currentPage,
            limit: filter.limit,
            total: total,
            totalPages: totalPages,
            hasNext: currentPage < totalPages,
            hasPrev: currentPage > 1,
          },
        };
      }

      return results;
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

  // 회원 상세 정보 조회 (통합)
  ipcMain.handle('member-get-detail', async (_, id) => {
    try {
      // 기본 회원 정보
      const memberStmt = db.prepare(`
        SELECT m.*, s.name as assigned_staff_name, s.position as assigned_staff_position
        FROM members m
        LEFT JOIN staff s ON m.assigned_staff_id = s.id
        WHERE m.id = ?
      `);
      const member = memberStmt.get(id);

      if (!member) {
        throw new Error('회원을 찾을 수 없습니다.');
      }

      // 회원권 이력 조회 (현재 활성 회원권 포함)
      const membershipHistoryStmt = db.prepare(`
        SELECT mh.*, 
               mt.name as membership_type_name,
               mt.description as membership_type_description,
               mt.price as membership_type_price,
               mt.duration_months,
               p.payment_number,
               p.payment_date,
               p.amount as payment_amount,
               CASE
                 WHEN mh.end_date >= date('now') AND mh.is_active = 1 THEN 1
                 ELSE 0
               END as is_current,
               CASE
                 WHEN mh.end_date >= date('now') AND mh.is_active = 1 
                 THEN CAST((julianday(mh.end_date) - julianday('now')) AS INTEGER)
                 ELSE 0
               END as days_remaining,
               CASE
                 WHEN mh.end_date >= date('now') AND mh.is_active = 1 
                 AND CAST((julianday(mh.end_date) - julianday('now')) AS INTEGER) <= 30
                 THEN 1
                 ELSE 0
               END as is_expiring_soon
        FROM membership_history mh
        JOIN membership_types mt ON mh.membership_type_id = mt.id
        LEFT JOIN payments p ON mh.payment_id = p.id
        WHERE mh.member_id = ?
        ORDER BY mh.start_date DESC
      `);
      const membershipHistory = membershipHistoryStmt.all(id);

      // 현재 활성 회원권 찾기
      const currentMembership = membershipHistory.find((m: any) => m.is_current === 1);

      // 결제 내역 조회
      const paymentHistoryStmt = db.prepare(`
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
      const paymentHistory = paymentHistoryStmt.all(id);

      // 활동 통계 계산
      const totalPayments = paymentHistory.reduce((sum, payment: any) => sum + payment.amount, 0);

      // 출석 관련 통계 (임시 - 출석 시스템 구현 후 실제 데이터로 교체)
      const mockVisitStats = {
        visitCount: 85,
        lastVisit: '2024-01-15',
        averageVisitsPerMonth: 8.5,
      };

      // 회원권 상태 결정
      let membershipStatus = 'none';
      if (currentMembership) {
        if ((currentMembership as any).is_expiring_soon) {
          membershipStatus = 'expiring_soon';
        } else {
          membershipStatus = 'active';
        }
      } else {
        // 만료된 회원권이 있는지 확인
        const hasExpiredMembership = membershipHistory.some(
          (m: any) => m.end_date < new Date().toISOString().split('T')[0]
        );
        if (hasExpiredMembership) {
          membershipStatus = 'expired';
        }
      }

      // 나이 계산
      let age = null;
      if ((member as any).birth_date) {
        const today = new Date();
        const birth = new Date((member as any).birth_date);
        age = today.getFullYear() - birth.getFullYear();
        const monthDiff = today.getMonth() - birth.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
          age--;
        }
      }

      return {
        ...member,
        age,
        membershipStatus,
        currentMembership: currentMembership
          ? {
            ...currentMembership,
            membershipType: {
              id: (currentMembership as any).membership_type_id,
              name: (currentMembership as any).membership_type_name,
              description: (currentMembership as any).membership_type_description,
              price: (currentMembership as any).membership_type_price,
              durationMonths: (currentMembership as any).duration_months,
              isActive: true,
              createdAt: (currentMembership as any).created_at,
            },
            daysRemaining: (currentMembership as any).days_remaining,
            isExpiringSoon: (currentMembership as any).is_expiring_soon === 1,
          }
          : null,
        membershipHistory: membershipHistory.map((mh: any) => ({
          ...(mh as any),
          membershipType: {
            id: mh.membership_type_id,
            name: mh.membership_type_name,
            description: mh.membership_type_description,
            price: mh.membership_type_price,
            durationMonths: mh.duration_months,
          },
          isActive: mh.is_active === 1,
          isCurrent: mh.is_current === 1,
          daysRemaining: mh.days_remaining,
          isExpiringSoon: mh.is_expiring_soon === 1,
        })),
        paymentHistory,
        totalPayments,
        totalSpent: totalPayments,
        visitCount: mockVisitStats.visitCount,
        lastVisit: mockVisitStats.lastVisit,
        averageVisitsPerMonth: mockVisitStats.averageVisitsPerMonth,
        profileImage: null, // 추후 구현
      };
    } catch (error) {
      console.error('회원 상세 정보 조회 실패:', error);
      throw error;
    }
  });

  // 회원 생성
  ipcMain.handle('member-create', async (_, data) => {
    try {
      console.log('🔍 [memberHandlers] member-create 호출됨');
      console.log('🔍 [memberHandlers] 받은 데이터:', data);
      console.log('🔍 [memberHandlers] assigned_staff_id:', data.assigned_staff_id);

      // 테이블 스키마 확인
      const schemaStmt = db.prepare('PRAGMA table_info(members)');
      const schemaInfo = schemaStmt.all();
      console.log('🔍 [memberHandlers] members 테이블 스키마:', schemaInfo);

      const hasAssignedStaffColumn = schemaInfo.some(
        (col: any) => col.name === 'assigned_staff_id'
      );
      console.log('🔍 [memberHandlers] assigned_staff_id 컬럼 존재 여부:', hasAssignedStaffColumn);

      // 회원번호 생성 (YYYYMMDD-###)
      const today = new Date().toISOString().split('T')[0].replace(/-/g, '');
      const countStmt = db.prepare(
        'SELECT COUNT(*) as count FROM members WHERE member_number LIKE ?'
      );
      const count = (countStmt.get(`${today}-%`) as { count: number }).count + 1;
      const memberNumber = `${today}-${count.toString().padStart(3, '0')}`;

      let stmt, result;

      if (hasAssignedStaffColumn) {
        // assigned_staff_id 컬럼이 있는 경우
        stmt = db.prepare(`
          INSERT INTO members (
            member_number, name, phone, email, gender, birth_date,
            join_date, address, notes, assigned_staff_id
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);

        console.log('🔍 [memberHandlers] SQL 파라미터들 (assigned_staff_id 포함):');
        console.log('  - member_number:', memberNumber);
        console.log('  - name:', data.name);
        console.log('  - phone:', data.phone || null);
        console.log('  - email:', data.email || null);
        console.log('  - gender:', data.gender || null);
        console.log('  - birth_date:', data.birth_date || null);
        console.log('  - join_date:', data.join_date || new Date().toISOString().split('T')[0]);
        console.log('  - address:', data.address || null);
        console.log('  - notes:', data.notes || null);
        console.log('  - assigned_staff_id:', data.assigned_staff_id || null);

        result = stmt.run(
          memberNumber,
          data.name,
          data.phone || null,
          data.email || null,
          data.gender || null,
          data.birth_date || null,
          data.join_date || new Date().toISOString().split('T')[0],
          data.address || null,
          data.notes || null,
          data.assigned_staff_id || null
        );
      } else {
        // assigned_staff_id 컬럼이 없는 경우
        console.log(
          '⚠️ [memberHandlers] assigned_staff_id 컬럼이 존재하지 않습니다. 기본 INSERT 사용'
        );
        stmt = db.prepare(`
          INSERT INTO members (
            member_number, name, phone, email, gender, birth_date,
            join_date, address, notes
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);

        result = stmt.run(
          memberNumber,
          data.name,
          data.phone || null,
          data.email || null,
          data.gender || null,
          data.birth_date || null,
          data.join_date || new Date().toISOString().split('T')[0],
          data.address || null,
          data.notes || null
        );
      }

      console.log('🔍 [memberHandlers] 회원 생성 결과:', result);
      return { id: result.lastInsertRowid, member_number: memberNumber };
    } catch (error) {
      console.error('🚨 [memberHandlers] 회원 생성 실패:', error);
      throw error;
    }
  });

  // 회원 정보 수정
  ipcMain.handle('member-update', async (_, id, data) => {
    try {
      console.log('🔍 [memberHandlers] member-update 호출됨');
      console.log('🔍 [memberHandlers] 회원 ID:', id);
      console.log('🔍 [memberHandlers] 받은 데이터:', data);
      console.log('🔍 [memberHandlers] assigned_staff_id:', data.assigned_staff_id);

      // 테이블 스키마 확인
      const schemaStmt = db.prepare('PRAGMA table_info(members)');
      const schemaInfo = schemaStmt.all();
      console.log('🔍 [memberHandlers] members 테이블 스키마:', schemaInfo);

      const hasAssignedStaffColumn = schemaInfo.some(
        (col: any) => col.name === 'assigned_staff_id'
      );
      console.log('🔍 [memberHandlers] assigned_staff_id 컬럼 존재 여부:', hasAssignedStaffColumn);

      let stmt, result;

      if (hasAssignedStaffColumn) {
        // assigned_staff_id 컬럼이 있는 경우
        stmt = db.prepare(`
          UPDATE members SET
            name = ?, phone = ?, email = ?, gender = ?, birth_date = ?,
            address = ?, notes = ?, assigned_staff_id = ?, updated_at = CURRENT_TIMESTAMP
          WHERE id = ?
        `);

        console.log('🔍 [memberHandlers] UPDATE SQL 파라미터들 (assigned_staff_id 포함):');
        console.log('  - name:', data.name);
        console.log('  - phone:', data.phone || null);
        console.log('  - email:', data.email || null);
        console.log('  - gender:', data.gender || null);
        console.log('  - birth_date:', data.birth_date || null);
        console.log('  - address:', data.address || null);
        console.log('  - notes:', data.notes || null);
        console.log('  - assigned_staff_id:', data.assigned_staff_id || null);
        console.log('  - id:', id);

        result = stmt.run(
          data.name,
          data.phone || null,
          data.email || null,
          data.gender || null,
          data.birth_date || null,
          data.address || null,
          data.notes || null,
          data.assigned_staff_id || null,
          id
        );
      } else {
        // assigned_staff_id 컬럼이 없는 경우
        console.log(
          '⚠️ [memberHandlers] assigned_staff_id 컬럼이 존재하지 않습니다. 기본 UPDATE 사용'
        );
        stmt = db.prepare(`
          UPDATE members SET
            name = ?, phone = ?, email = ?, gender = ?, birth_date = ?,
            address = ?, notes = ?, updated_at = CURRENT_TIMESTAMP
          WHERE id = ?
        `);

        result = stmt.run(
          data.name,
          data.phone || null,
          data.email || null,
          data.gender || null,
          data.birth_date || null,
          data.address || null,
          data.notes || null,
          id
        );
      }

      console.log('🔍 [memberHandlers] 회원 수정 결과:', result);
      return { changes: result.changes };
    } catch (error) {
      console.error('🚨 [memberHandlers] 회원 수정 실패:', error);
      throw error;
    }
  });

  // 회원 삭제 (비활성화)
  ipcMain.handle('member-delete', async (_, id) => {
    try {
      const stmt = db.prepare(
        'UPDATE members SET active = 0, deleted_at = CURRENT_TIMESTAMP WHERE id = ?'
      );
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
        WHERE active = 1 AND deleted_at IS NULL
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

  // 회원 통계 조회
  ipcMain.handle('member-get-stats', async () => {
    try {
      const base_condition = 'deleted_at IS NULL';

      // 기본 회원 통계
      const totalStmt = db.prepare(`
        SELECT 
          COUNT(*) as total,
          COUNT(CASE WHEN active = 1 THEN 1 END) as active,
          COUNT(CASE WHEN active = 0 THEN 1 END) as inactive
        FROM members
        WHERE ${base_condition}
      `);
      const basicStats = totalStmt.get() as { total: number; active: number; inactive: number };

      // 성별 분포
      const genderStmt = db.prepare(`
        SELECT 
          COUNT(CASE WHEN gender = '남성' THEN 1 END) as male,
          COUNT(CASE WHEN gender = '여성' THEN 1 END) as female
        FROM members
        WHERE ${base_condition} AND active = 1
      `);
      const genderStats = genderStmt.get() as { male: number; female: number };

      // 신규 회원 통계
      const newMembersStmt = db.prepare(`
        SELECT 
          COUNT(CASE WHEN join_date >= date('now', '-30 days') THEN 1 END) as new_this_month,
          COUNT(CASE WHEN join_date >= date('now', '-7 days') THEN 1 END) as new_this_week
        FROM members
        WHERE ${base_condition} AND active = 1
      `);
      const newStats = newMembersStmt.get() as { new_this_month: number; new_this_week: number };

      // 평균 나이 계산
      const avgAgeStmt = db.prepare(`
        SELECT 
          ROUND(AVG(CASE 
            WHEN birth_date IS NOT NULL 
            THEN (julianday('now') - julianday(birth_date)) / 365.25 
          END), 1) as average_age
        FROM members
        WHERE ${base_condition} AND active = 1 AND birth_date IS NOT NULL
      `);
      const ageStats = avgAgeStmt.get() as { average_age: number };

      // 나이대별 분포
      const ageDistributionStmt = db.prepare(`
        SELECT 
          CASE 
            WHEN age < 20 THEN '10-19'
            WHEN age < 30 THEN '20-29'
            WHEN age < 40 THEN '30-39'
            WHEN age < 50 THEN '40-49'
            WHEN age < 60 THEN '50-59'
            ELSE '60+'
          END as age_group,
          COUNT(*) as count
        FROM (
          SELECT 
            CASE 
              WHEN birth_date IS NOT NULL 
              THEN CAST((julianday('now') - julianday(birth_date)) / 365.25 AS INTEGER)
              ELSE NULL 
            END as age
          FROM members
          WHERE ${base_condition} AND active = 1 AND birth_date IS NOT NULL
        ) 
        GROUP BY age_group
        ORDER BY age_group
      `);
      const ageDistribution = ageDistributionStmt.all() as Array<{
        age_group: string;
        count: number;
      }>;

      // 회원권 보유 현황 (임시 - 실제 membership_history 테이블 연동 필요)
      const membershipStmt = db.prepare(`
        SELECT 
          COUNT(DISTINCT CASE WHEN mh.id IS NOT NULL AND mh.end_date >= date('now') THEN m.id END) as with_membership
        FROM members m
        LEFT JOIN membership_history mh ON m.id = mh.member_id AND mh.is_active = 1
        WHERE m.${base_condition} AND m.active = 1
      `);
      const membershipStats = membershipStmt.get() as {
        with_membership: number;
      };

      // 최근 등록 회원
      const recentMembersStmt = db.prepare(`
        SELECT id, name, member_number, join_date, phone
        FROM members
        WHERE ${base_condition} AND active = 1
        ORDER BY join_date DESC, created_at DESC
        LIMIT 5
      `);
      const recentRegistrations = recentMembersStmt.all();

      // 곧 만료될 회원권 수 (30일 이내)
      const expiringStmt = db.prepare(`
        SELECT COUNT(DISTINCT m.id) as upcoming_expiry
        FROM membership_history mh
        JOIN members m ON mh.member_id = m.id
        WHERE m.${base_condition} AND m.active = 1 
        AND mh.is_active = 1
        AND mh.end_date BETWEEN date('now') AND date('now', '+30 days')
      `);
      const expiringStats = expiringStmt.get() as { upcoming_expiry: number };

      // 나이 분포를 객체로 변환
      const ageDistributionMap = {
        '10-19': 0,
        '20-29': 0,
        '30-39': 0,
        '40-49': 0,
        '50-59': 0,
        '60+': 0,
      };

      ageDistribution.forEach(item => {
        ageDistributionMap[item.age_group as keyof typeof ageDistributionMap] = item.count;
      });

      const without_membership = basicStats.active - membershipStats.with_membership;

      return {
        total: basicStats.total,
        active: basicStats.active,
        inactive: basicStats.inactive,
        new_this_month: newStats.new_this_month,
        new_this_week: newStats.new_this_week,
        male: genderStats.male,
        female: genderStats.female,
        with_membership: membershipStats.with_membership,
        without_membership: without_membership > 0 ? without_membership : 0,
        average_age: ageStats.average_age || 0,
        age_distribution: ageDistributionMap,
        recent_registrations: recentRegistrations,
        upcoming_membership_expiry: expiringStats.upcoming_expiry,
      };
    } catch (error) {
      console.error('회원 통계 조회 실패:', error);
      throw error;
    }
  });

  // 회원 일괄 작업 처리
  ipcMain.handle('member-bulk-action', async (_, action, memberIds) => {
    try {
      if (!memberIds || !Array.isArray(memberIds) || memberIds.length === 0) {
        throw new Error('처리할 회원 ID가 없습니다.');
      }

      console.log(`회원 일괄 작업 시작: ${action}, 대상: ${memberIds.length}명`);

      // 트랜잭션으로 안전하게 처리
      const transaction = db.transaction(() => {
        let processedCount = 0;
        const errors: string[] = [];

        for (const memberId of memberIds) {
          try {
            switch (action) {
              case 'activate':
                // 회원 활성화
                const activateStmt = db.prepare(
                  'UPDATE members SET active = 1, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
                );
                const activateResult = activateStmt.run(memberId);
                if (activateResult.changes > 0) {
                  processedCount++;
                }
                break;

              case 'deactivate':
                // 회원 비활성화
                const deactivateStmt = db.prepare(
                  'UPDATE members SET active = 0, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
                );
                const deactivateResult = deactivateStmt.run(memberId);
                if (deactivateResult.changes > 0) {
                  processedCount++;
                }
                break;

              case 'delete':
                // soft delete 방식으로 변경
                const deleteStmt = db.prepare(
                  'UPDATE members SET active = 0, deleted_at = CURRENT_TIMESTAMP WHERE id = ?'
                );
                const deleteResult = deleteStmt.run(memberId);
                if (deleteResult.changes > 0) {
                  processedCount++;
                }
                break;

              case 'export':
                // 내보내기는 실제 파일 생성 없이 성공으로 처리
                processedCount++;
                break;

              default:
                errors.push(`알 수 없는 작업: ${action}`);
                break;
            }
          } catch (memberError) {
            console.error(`회원 ID ${memberId} 처리 실패:`, memberError);
            errors.push(
              `회원 ID ${memberId}: ${memberError instanceof Error ? memberError.message : String(memberError)}`
            );
          }
        }

        return {
          success: true,
          processed_count: processedCount,
          total_count: memberIds.length,
          errors: errors,
          action: action,
        };
      });

      const result = transaction();
      console.log(`회원 일괄 작업 완료:`, result);

      return result;
    } catch (error) {
      console.error('회원 일괄 작업 실패:', error);
      throw new Error(
        `일괄 작업 처리 중 오류가 발생했습니다: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  });

  // 담당 직원 일괄 변경
  ipcMain.handle('member-bulk-assign-staff', async (_, memberIds, staffId) => {
    try {
      if (!memberIds || !Array.isArray(memberIds) || memberIds.length === 0) {
        throw new Error('처리할 회원 ID가 없습니다.');
      }

      console.log(`담당 직원 일괄 변경: ${memberIds.length}명 → 직원 ID ${staffId}`);

      // 직원 존재 여부 확인
      if (staffId) {
        const staffExistsStmt = db.prepare('SELECT id FROM staff WHERE id = ? AND is_active = 1');
        const staffExists = staffExistsStmt.get(staffId);
        if (!staffExists) {
          throw new Error('존재하지 않거나 비활성화된 직원입니다.');
        }
      }

      // 트랜잭션으로 일괄 처리
      const transaction = db.transaction(() => {
        const updateStmt = db.prepare(
          'UPDATE members SET assigned_staff_id = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND active = 1'
        );
        let processedCount = 0;

        for (const memberId of memberIds) {
          const result = updateStmt.run(staffId || null, memberId);
          if (result.changes > 0) {
            processedCount++;
          }
        }

        return {
          success: true,
          processed_count: processedCount,
          total_count: memberIds.length,
          staff_id: staffId,
        };
      });

      const result = transaction();
      console.log('담당 직원 일괄 변경 완료:', result);

      return result;
    } catch (error) {
      console.error('담당 직원 일괄 변경 실패:', error);
      throw error;
    }
  });
};
