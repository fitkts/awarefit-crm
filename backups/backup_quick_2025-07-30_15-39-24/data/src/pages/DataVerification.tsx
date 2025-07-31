import React, { useState } from 'react';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';

interface VerificationResult {
  timestamp: string;
  table_counts: {
    total_including_deleted: number;
    total_not_deleted: number;
    active_not_deleted: number;
    inactive_not_deleted: number;
    deleted: number;
  };
  stats_counts: {
    total: number;
    active: number;
    inactive: number;
  };
  discrepancies: string[];
  deleted_members: {
    count: number;
    list: any[];
    active_when_deleted: number;
    inactive_when_deleted: number;
  };
  detailed_breakdown: {
    should_match: {
      total_not_deleted: number;
      stats_total: number;
      matches: boolean;
    };
    excluded_from_stats: {
      deleted_members: number;
      total_including_deleted: number;
    };
    summary: {
      table_shows_in_ui: number;
      stats_shows_total: number;
      should_be_same: boolean;
    };
  };
}

const DataVerification: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const runVerification = async () => {
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      console.log('🔍 회원 데이터 일치성 검증 시작...');

      // Electron 환경 확인
      if (typeof window !== 'undefined' && (window as any).electronAPI) {
        const verificationResult = await (
          window as any
        ).electronAPI.database.member.verifyDataConsistency();
        setResult(verificationResult);

        // 콘솔에도 결과 출력
        console.log('📊 검증 결과:', verificationResult);
        if (verificationResult.discrepancies.length > 0) {
          console.error('❌ 발견된 불일치:', verificationResult.discrepancies);
        } else {
          console.log('✅ 모든 수치가 일치합니다!');
        }
      } else {
        // 웹 환경에서는 시뮬레이션 데이터 표시
        setError('이 기능은 Electron 환경에서만 사용할 수 있습니다. npm run dev로 실행해주세요.');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.';
      setError(errorMessage);
      console.error('검증 실패:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const renderComparisonTable = () => {
    if (!result) return null;

    const comparisons = [
      {
        name: '전체 회원 수',
        table: result.table_counts.total_not_deleted,
        stats: result.stats_counts.total,
        match: result.table_counts.total_not_deleted === result.stats_counts.total,
        description: '삭제되지 않은 모든 회원 수 (활성 + 비활성)',
      },
      {
        name: '활성 회원 수',
        table: result.table_counts.active_not_deleted,
        stats: result.stats_counts.active,
        match: result.table_counts.active_not_deleted === result.stats_counts.active,
        description: '삭제되지 않은 활성 회원 수',
      },
      {
        name: '비활성 회원 수',
        table: result.table_counts.inactive_not_deleted,
        stats: result.stats_counts.inactive,
        match: result.table_counts.inactive_not_deleted === result.stats_counts.inactive,
        description: '삭제되지 않은 비활성 회원 수',
      },
    ];

    return (
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                항목
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                테이블 직접 카운트
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                통계 API 결과
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                일치 여부
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                설명
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {comparisons.map((item, index) => (
              <tr key={index} className={item.match ? '' : 'bg-red-50'}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {item.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {item.table.toLocaleString()}명
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {item.stats.toLocaleString()}명
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {item.match ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      ✅ 일치
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      ❌ 불일치
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">{item.description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const renderDeletedMembersInfo = () => {
    if (!result || result.deleted_members.count === 0) return null;

    return (
      <Card className="mt-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          🗑️ 삭제된 회원 정보 ({result.deleted_members.count}명)
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="bg-red-50 p-4 rounded-lg">
            <div className="text-sm font-medium text-red-900">총 삭제된 회원</div>
            <div className="text-2xl font-bold text-red-600">{result.deleted_members.count}명</div>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg">
            <div className="text-sm font-medium text-yellow-900">삭제 시 활성 상태</div>
            <div className="text-2xl font-bold text-yellow-600">
              {result.deleted_members.active_when_deleted}명
            </div>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="text-sm font-medium text-gray-900">삭제 시 비활성 상태</div>
            <div className="text-2xl font-bold text-gray-600">
              {result.deleted_members.inactive_when_deleted}명
            </div>
          </div>
        </div>
        <div className="text-sm text-gray-600">
          💡 삭제된 회원들은 통계에 포함되지 않아야 합니다. 이는 정상적인 동작입니다.
        </div>
      </Card>
    );
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">회원 데이터 일치성 검증</h1>
        <p className="mt-2 text-sm text-gray-600">
          회원 테이블의 데이터와 통계 API가 반환하는 수치가 일치하는지 확인합니다. 특히 삭제된
          회원이 통계에 포함되지 않는지 검증합니다.
        </p>
      </div>

      <Card className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-medium text-gray-900">검증 실행</h2>
            <p className="text-sm text-gray-600 mt-1">
              데이터베이스의 실제 값과 통계 계산 결과를 비교합니다.
            </p>
          </div>
          <Button onClick={runVerification} disabled={isLoading} className="ml-4">
            {isLoading ? '검증 중...' : '검증 실행'}
          </Button>
        </div>
      </Card>

      {error && (
        <Card className="mb-6 border-red-200 bg-red-50">
          <div className="flex">
            <div className="flex-shrink-0">
              <span className="text-red-400">❌</span>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">오류 발생</h3>
              <div className="mt-2 text-sm text-red-700">{error}</div>
            </div>
          </div>
        </Card>
      )}

      {result && (
        <>
          {/* 전체 요약 */}
          <Card className="mb-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">📊 검증 결과 요약</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="text-sm font-medium text-blue-900">전체 회원 (삭제 포함)</div>
                <div className="text-2xl font-bold text-blue-600">
                  {result.table_counts.total_including_deleted.toLocaleString()}명
                </div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="text-sm font-medium text-green-900">삭제되지 않은 회원</div>
                <div className="text-2xl font-bold text-green-600">
                  {result.table_counts.total_not_deleted.toLocaleString()}명
                </div>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="text-sm font-medium text-purple-900">통계 API 전체</div>
                <div className="text-2xl font-bold text-purple-600">
                  {result.stats_counts.total.toLocaleString()}명
                </div>
              </div>
              <div className="bg-red-50 p-4 rounded-lg">
                <div className="text-sm font-medium text-red-900">삭제된 회원</div>
                <div className="text-2xl font-bold text-red-600">
                  {result.table_counts.deleted.toLocaleString()}명
                </div>
              </div>
            </div>
          </Card>

          {/* 불일치 항목 */}
          {result.discrepancies.length > 0 && (
            <Card className="mb-6 border-red-200 bg-red-50">
              <h3 className="text-lg font-medium text-red-900 mb-4">⚠️ 발견된 불일치</h3>
              <ul className="space-y-2">
                {result.discrepancies.map((discrepancy, index) => (
                  <li key={index} className="text-sm text-red-700">
                    • {discrepancy}
                  </li>
                ))}
              </ul>
            </Card>
          )}

          {/* 성공 메시지 */}
          {result.discrepancies.length === 0 && (
            <Card className="mb-6 border-green-200 bg-green-50">
              <div className="flex">
                <div className="flex-shrink-0">
                  <span className="text-green-400">✅</span>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-green-800">검증 성공</h3>
                  <div className="mt-2 text-sm text-green-700">
                    모든 수치가 일치합니다! 데이터 무결성이 유지되고 있습니다.
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* 상세 비교 테이블 */}
          <Card className="mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">🔍 상세 비교</h3>
            {renderComparisonTable()}
          </Card>

          {/* 삭제된 회원 정보 */}
          {renderDeletedMembersInfo()}

          {/* 검증 시간 */}
          <Card>
            <div className="text-sm text-gray-500">
              검증 실행 시간: {new Date(result.timestamp).toLocaleString('ko-KR')}
            </div>
          </Card>
        </>
      )}
    </div>
  );
};

export default DataVerification;
