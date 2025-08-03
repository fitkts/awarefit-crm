import { QueryBuilder } from '../../utils/queryBuilder';

describe('QueryBuilder', () => {
  let queryBuilder: QueryBuilder;

  beforeEach(() => {
    queryBuilder = new QueryBuilder('members');
  });

  test('기본 SELECT 쿼리 생성', () => {
    const { query, params } = queryBuilder.select(['name', 'email']).build();

    expect(query).toBe('SELECT name, email FROM members');
    expect(params).toEqual([]);
  });

  test('WHERE 조건 추가', () => {
    const { query, params } = queryBuilder.select(['*']).where('name', '=', '홍길동').build();

    expect(query).toBe('SELECT * FROM members WHERE name = ?');
    expect(params).toEqual(['홍길동']);
  });

  test('복합 WHERE 조건', () => {
    const { query, params } = queryBuilder
      .select(['*'])
      .where('name', '=', '홍길동')
      .where('age', '>', 20)
      .build();

    expect(query).toBe('SELECT * FROM members WHERE name = ? AND age > ?');
    expect(params).toEqual(['홍길동', 20]);
  });

  test('LIMIT 및 OFFSET', () => {
    const { query, params } = queryBuilder.select(['*']).limit(10).offset(5).build();

    expect(query).toBe('SELECT * FROM members LIMIT ? OFFSET ?');
    expect(params).toEqual([10, 5]);
  });
});
