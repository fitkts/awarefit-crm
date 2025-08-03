/**
 * SQL 쿼리 빌더 - 파라미터 안전성 보장
 *
 * 이 클래스는 동적 SQL 쿼리를 안전하게 생성하고 파라미터 바인딩을 보장합니다.
 * 방금 겪은 "Too few parameter values" 오류 같은 문제를 사전에 방지합니다.
 */

export interface QueryResult {
  query: string;
  params: any[];
}

export class QueryBuilder {
  private query: string = '';
  private params: any[] = [];
  private debugMode: boolean = process.env.NODE_ENV === 'development';

  constructor(baseQuery: string) {
    this.query = baseQuery;
    this.log('🔍 [QueryBuilder] 초기 쿼리:', baseQuery);
  }

  /**
   * 조건 추가 (WHERE 절)
   */
  addCondition(field: string, value: any, operator: string = '='): this {
    if (value !== undefined && value !== null && value !== '') {
      this.query += ` AND ${field} ${operator} ?`;
      this.params.push(value);
      this.log(`🔍 [QueryBuilder] 조건 추가: ${field} ${operator} ?`, value);
    }
    return this;
  }

  /**
   * 날짜 범위 필터 추가
   */
  addDateRange(field: string, from?: string, to?: string): this {
    if (from) {
      this.query += ` AND ${field} >= ?`;
      this.params.push(from);
      this.log(`🔍 [QueryBuilder] 날짜 시작: ${field} >= ?`, from);
    }
    if (to) {
      this.query += ` AND ${field} <= ?`;
      this.params.push(to);
      this.log(`🔍 [QueryBuilder] 날짜 끝: ${field} <= ?`, to);
    }
    return this;
  }

  /**
   * 숫자 범위 필터 추가
   */
  addNumberRange(field: string, min?: number, max?: number): this {
    if (min !== undefined && min !== null) {
      this.query += ` AND ${field} >= ?`;
      this.params.push(min);
      this.log(`🔍 [QueryBuilder] 숫자 최소: ${field} >= ?`, min);
    }
    if (max !== undefined && max !== null) {
      this.query += ` AND ${field} <= ?`;
      this.params.push(max);
      this.log(`🔍 [QueryBuilder] 숫자 최대: ${field} <= ?`, max);
    }
    return this;
  }

  /**
   * IN 조건 추가
   */
  addInCondition(field: string, values: any[]): this {
    if (values && values.length > 0) {
      const placeholders = values.map(() => '?').join(', ');
      this.query += ` AND ${field} IN (${placeholders})`;
      this.params.push(...values);
      this.log(`🔍 [QueryBuilder] IN 조건: ${field} IN (${placeholders})`, values);
    }
    return this;
  }

  /**
   * LIKE 조건 추가 (검색)
   */
  addLikeCondition(field: string, value: string): this {
    if (value && value.trim()) {
      this.query += ` AND ${field} LIKE ?`;
      this.params.push(`%${value}%`);
      this.log(`🔍 [QueryBuilder] LIKE 조건: ${field} LIKE ?`, `%${value}%`);
    }
    return this;
  }

  /**
   * OR 조건 그룹 추가
   */
  addOrGroup(conditions: Array<{ field: string; value: any; operator?: string }>): this {
    const validConditions = conditions.filter(
      c => c.value !== undefined && c.value !== null && c.value !== ''
    );

    if (validConditions.length > 0) {
      const orClauses = validConditions.map(c => {
        const operator = c.operator || '=';
        this.params.push(c.value);
        return `${c.field} ${operator} ?`;
      });

      this.query += ` AND (${orClauses.join(' OR ')})`;
      this.log('🔍 [QueryBuilder] OR 그룹 추가:', orClauses);
    }
    return this;
  }

  /**
   * ORDER BY 절 추가
   */
  addOrderBy(field: string, direction: 'ASC' | 'DESC' = 'ASC'): this {
    this.query += ` ORDER BY ${field} ${direction}`;
    this.log(`🔍 [QueryBuilder] 정렬 추가: ${field} ${direction}`);
    return this;
  }

  /**
   * LIMIT 절 추가
   */
  addLimit(limit: number, offset?: number): this {
    this.query += ` LIMIT ?`;
    this.params.push(limit);
    this.log('🔍 [QueryBuilder] LIMIT 추가:', limit);

    if (offset !== undefined && offset > 0) {
      this.query += ' OFFSET ?';
      this.params.push(offset);
      this.log('🔍 [QueryBuilder] OFFSET 추가:', offset);
    }
    return this;
  }

  /**
   * COUNT 쿼리로 변환 (페이지네이션용)
   */
  toCountQuery(): QueryResult {
    // ORDER BY, LIMIT, OFFSET 제거
    let countQuery = this.query.replace(/\s+ORDER BY[^]*$/i, '').replace(/\s+LIMIT[^]*$/i, '');

    // SELECT 절을 COUNT(*)로 교체
    countQuery = countQuery.replace(/SELECT\s+.*?\s+FROM/i, 'SELECT COUNT(*) as total FROM');

    // LIMIT과 OFFSET 파라미터 제거
    const limitCount = (this.query.match(/LIMIT|OFFSET/g) || []).length;
    const countParams = this.params.slice(0, -limitCount);

    this.log('🔍 [QueryBuilder] COUNT 쿼리 생성:', countQuery);
    this.log('🔍 [QueryBuilder] COUNT 파라미터:', countParams);

    this.validateQuery(countQuery, countParams);

    return {
      query: countQuery,
      params: countParams,
    };
  }

  /**
   * 최종 쿼리 빌드
   */
  build(): QueryResult {
    this.validateQuery(this.query, this.params);

    this.log('🔍 [QueryBuilder] 최종 쿼리:', this.query);
    this.log('🔍 [QueryBuilder] 최종 파라미터:', this.params);

    return {
      query: this.query,
      params: this.params,
    };
  }

  /**
   * 파라미터 개수 검증
   */
  private validateQuery(query: string, params: any[]): void {
    const paramCount = (query.match(/\?/g) || []).length;

    if (paramCount !== params.length) {
      const error = new Error(
        `🚨 QueryBuilder 파라미터 개수 불일치: 쿼리 ${paramCount}개, 파라미터 ${params.length}개`
      );
      this.log('🚨 [QueryBuilder] 검증 실패:', error.message);
      this.log('🚨 [QueryBuilder] 쿼리:', query);
      this.log('🚨 [QueryBuilder] 파라미터:', params);
      throw error;
    }

    this.log('✅ [QueryBuilder] 파라미터 검증 통과');
  }

  /**
   * 디버그 로깅
   */
  private log(message: string, data?: any): void {
    if (this.debugMode) {
      if (data !== undefined) {
        console.log(message, data);
      } else {
        console.log(message);
      }
    }
  }

  /**
   * 현재 상태 디버깅
   */
  debug(): void {
    console.log('🔍 [QueryBuilder] 디버그 정보:');
    console.log('- 현재 쿼리:', this.query);
    console.log('- 현재 파라미터:', this.params);
    console.log('- ? 개수:', (this.query.match(/\?/g) || []).length);
    console.log('- 파라미터 개수:', this.params.length);
  }
}

/**
 * 편의 함수들
 */

/**
 * 회원 검색 쿼리 빌더
 */
export const buildMemberQuery = (filter: any) => {
  const builder = new QueryBuilder(`
    SELECT m.*, s.name as assigned_staff_name, s.position as assigned_staff_position
    FROM members m
    LEFT JOIN staff s ON m.assigned_staff_id = s.id
    WHERE m.deleted_at IS NULL
  `);

  // 활성 상태 필터
  if (filter.active === true) {
    builder.addCondition('m.active', 1);
  } else if (filter.active === false) {
    builder.addCondition('m.active', 0);
  }

  // 통합 검색 (이름, 전화번호, 회원번호)
  if (filter.search) {
    builder.addOrGroup([
      { field: 'm.name', value: filter.search, operator: 'LIKE' },
      { field: 'm.phone', value: filter.search, operator: 'LIKE' },
      { field: 'm.member_number', value: filter.search, operator: 'LIKE' },
    ]);
  }

  // 성별 필터
  builder.addCondition('m.gender', filter.gender);

  // 날짜 범위 필터
  builder.addDateRange('m.join_date', filter.join_date_from, filter.join_date_to);
  builder.addDateRange('m.birth_date', filter.birth_date_from, filter.birth_date_to);

  // 나이 범위 필터
  builder.addNumberRange(
    `CAST((julianday('now') - julianday(m.birth_date)) / 365.25 AS INTEGER)`,
    filter.age_min,
    filter.age_max
  );

  // 연락처/이메일 유무 필터
  if (filter.has_phone === true) {
    builder.addCondition('m.phone', '', '!=');
  } else if (filter.has_phone === false) {
    builder.addOrGroup([
      { field: 'm.phone', value: null },
      { field: 'm.phone', value: '' },
    ]);
  }

  if (filter.has_email === true) {
    builder.addCondition('m.email', '', '!=');
  } else if (filter.has_email === false) {
    builder.addOrGroup([
      { field: 'm.email', value: null },
      { field: 'm.email', value: '' },
    ]);
  }

  // 담당직원 필터
  if (filter.assigned_staff_id && filter.assigned_staff_id !== 'all') {
    if (filter.assigned_staff_id === 'unassigned') {
      builder.addCondition('m.assigned_staff_id', null, 'IS');
    } else {
      builder.addCondition('m.assigned_staff_id', parseInt(filter.assigned_staff_id));
    }
  }

  // 정렬
  if (filter.sort) {
    const { field, direction } = filter.sort;
    const sortField = field === 'age' ? 'm.birth_date' : `m.${field}`;
    const sortDirection = field === 'age' && direction === 'asc' ? 'DESC' : direction.toUpperCase();
    builder.addOrderBy(sortField, sortDirection as 'ASC' | 'DESC');
  } else {
    builder.addOrderBy('m.created_at', 'DESC');
  }

  // 페이지네이션
  if (filter.limit) {
    const offset = filter.page && filter.page > 1 ? (filter.page - 1) * filter.limit : 0;
    builder.addLimit(filter.limit, offset);
  }

  return builder;
};
