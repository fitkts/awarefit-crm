import {
  Activity,
  AlertCircle,
  Award,
  Calendar,
  CheckCircle,
  Clock,
  CreditCard,
  Edit,
  FileText,
  Mail,
  MapPin,
  Phone,
  TrendingUp,
  User,
  Users,
  X,
  XCircle,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { Member, MemberDetail } from '../../types/member';
import { formatAddress, formatDate, formatEmail, formatPhoneNumber } from '../../utils/memberUtils';

interface MemberDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  member: Member | null;
  onEdit: (member: Member) => void;
}

const MemberDetailModal: React.FC<MemberDetailModalProps> = ({
  isOpen,
  onClose,
  member,
  onEdit,
}) => {
  const [loading, setLoading] = useState(false);
  const [memberDetail, setMemberDetail] = useState<MemberDetail | null>(null);
  const [activeTab, setActiveTab] = useState<
    'overview' | 'membership' | 'payments' | 'attendance' | 'activity'
  >('overview');

  // 회원 상세 정보 로드
  useEffect(() => {
    if (member && isOpen) {
      loadMemberDetail();
    }
  }, [member, isOpen]);

  const loadMemberDetail = async () => {
    try {
      setLoading(true);

      // 새로운 통합 API 사용
      const detail = await window.electronAPI.database.member.getDetail(member!.id);
      setMemberDetail(detail);
    } catch (error) {
      console.error('회원 상세 정보 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const getMembershipStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'expiring_soon':
        return <AlertCircle className="w-5 h-5 text-orange-500" />;
      case 'expired':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-400" />;
    }
  };

  const getMembershipStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return { text: '활성', color: 'text-green-600 bg-green-100' };
      case 'expiring_soon':
        return { text: '만료 임박', color: 'text-orange-600 bg-orange-100' };
      case 'expired':
        return { text: '만료됨', color: 'text-red-600 bg-red-100' };
      default:
        return { text: '없음', color: 'text-gray-600 bg-gray-100' };
    }
  };

  if (!isOpen || !member) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
        {/* 헤더 */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center text-2xl font-bold">
              {member.name.charAt(0)}
            </div>
            <div>
              <h2 className="text-2xl font-bold">{member.name}</h2>
              <p className="text-blue-100">{member.phone || member.email || '연락처 없음'}</p>
              {memberDetail && (
                <div className="flex items-center space-x-2 mt-1">
                  {getMembershipStatusIcon(memberDetail.membershipStatus)}
                  <span className="text-sm">
                    {getMembershipStatusText(memberDetail.membershipStatus).text}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => onEdit(member)}
              className="flex items-center space-x-2 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors"
            >
              <Edit className="w-4 h-4" />
              <span>수정</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* 탭 네비게이션 */}
        <div className="flex border-b border-gray-200 bg-gray-50">
          {[
            { id: 'overview', label: '개요', icon: User },
            { id: 'membership', label: '회원권', icon: Award },
            { id: 'payments', label: '결제내역', icon: CreditCard },
            { id: 'attendance', label: '출석기록', icon: Calendar },
            { id: 'activity', label: '활동로그', icon: Activity },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 px-6 py-4 font-medium transition-colors ${
                activeTab === tab.id
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-white'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <tab.icon className="w-5 h-5" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* 탭 컨텐츠 */}
        <div className="flex-1 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 200px)' }}>
          {loading ? (
            <div className="flex items-center justify-center p-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-500">로딩 중...</span>
            </div>
          ) : (
            <>
              {/* 개요 탭 */}
              {activeTab === 'overview' && memberDetail && (
                <div className="p-6 space-y-6">
                  {/* 기본 정보 카드 */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* 개인 정보 */}
                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <User className="w-5 h-5 mr-2" />
                        개인 정보
                      </h3>
                      <div className="space-y-3">
                        <div className="flex items-center space-x-3">
                          <Phone className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-600">
                            {formatPhoneNumber(member.phone)}
                          </span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <Mail className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-600">{formatEmail(member.email)}</span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-600">
                            {member.birth_date
                              ? `${formatDate(member.birth_date)} (${memberDetail.age}세)`
                              : '미등록'}
                          </span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <MapPin className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-600">
                            {formatAddress(member.address)}
                          </span>
                        </div>
                        {member.gender && (
                          <div className="flex items-center space-x-3">
                            <Users className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-600">{member.gender}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* 활동 통계 */}
                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <TrendingUp className="w-5 h-5 mr-2" />
                        활동 통계
                      </h3>
                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-sm text-gray-600">총 방문 횟수</span>
                            <span className="text-lg font-bold text-blue-600">
                              {memberDetail.visitCount}회
                            </span>
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-sm text-gray-600">월 평균 방문</span>
                            <span className="text-lg font-bold text-green-600">
                              {memberDetail.averageVisitsPerMonth}회
                            </span>
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-sm text-gray-600">최근 방문</span>
                            <span className="text-sm text-gray-900">
                              {memberDetail.lastVisit
                                ? formatDate(memberDetail.lastVisit)
                                : '기록 없음'}
                            </span>
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-sm text-gray-600">총 결제 금액</span>
                            <span className="text-lg font-bold text-purple-600">
                              {memberDetail.totalSpent.toLocaleString()}원
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* 현재 회원권 */}
                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <Award className="w-5 h-5 mr-2" />
                        현재 회원권
                      </h3>
                      {memberDetail.currentMembership ? (
                        <div className="space-y-3">
                          <div>
                            <div className="font-medium text-gray-900">
                              {memberDetail.currentMembership.membershipType.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {memberDetail.currentMembership.membershipType.description}
                            </div>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">기간</span>
                            <span className="text-sm text-gray-900">
                              {formatDate(memberDetail.currentMembership.startDate)} ~
                              {formatDate(memberDetail.currentMembership.endDate)}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">남은 기간</span>
                            <span
                              className={`text-sm font-medium ${
                                memberDetail.currentMembership.daysRemaining <= 7
                                  ? 'text-red-600'
                                  : 'text-green-600'
                              }`}
                            >
                              {memberDetail.currentMembership.daysRemaining}일
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${
                                memberDetail.currentMembership.daysRemaining <= 7
                                  ? 'bg-red-500'
                                  : memberDetail.currentMembership.daysRemaining <= 30
                                    ? 'bg-orange-500'
                                    : 'bg-green-500'
                              }`}
                              style={{
                                width: `${Math.max(5, (memberDetail.currentMembership.daysRemaining / 365) * 100)}%`,
                              }}
                            ></div>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-4">
                          <div className="text-gray-400 mb-2">
                            <Award className="w-8 h-8 mx-auto" />
                          </div>
                          <p className="text-gray-500">활성 회원권이 없습니다</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 메모 */}
                  {member.notes && (
                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <FileText className="w-5 h-5 mr-2" />
                        메모
                      </h3>
                      <p className="text-gray-700 whitespace-pre-wrap">{member.notes}</p>
                    </div>
                  )}
                </div>
              )}

              {/* 회원권 탭 */}
              {activeTab === 'membership' && memberDetail && (
                <div className="p-6 space-y-6">
                  {/* 현재 회원권 */}
                  {memberDetail.currentMembership ? (
                    <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-6 border border-green-200">
                      <h3 className="text-lg font-semibold text-green-800 mb-4 flex items-center">
                        <Award className="w-5 h-5 mr-2" />
                        현재 활성 회원권
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <div className="text-sm text-green-600 mb-1">회원권 유형</div>
                          <div className="font-medium text-green-900">
                            {memberDetail.currentMembership.membershipType.name}
                          </div>
                          <div className="text-sm text-green-700 mt-1">
                            {memberDetail.currentMembership.membershipType.description}
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-green-600 mb-1">이용 기간</div>
                          <div className="font-medium text-green-900">
                            {formatDate(memberDetail.currentMembership.startDate)} ~{' '}
                            {formatDate(memberDetail.currentMembership.endDate)}
                          </div>
                          <div
                            className={`text-sm mt-1 ${memberDetail.currentMembership.daysRemaining <= 7 ? 'text-red-600' : 'text-green-700'}`}
                          >
                            남은 기간: {memberDetail.currentMembership.daysRemaining}일
                          </div>
                        </div>
                      </div>
                      <div className="mt-4">
                        <div className="w-full bg-green-200 rounded-full h-3">
                          <div
                            className={`h-3 rounded-full ${
                              memberDetail.currentMembership.daysRemaining <= 7
                                ? 'bg-red-500'
                                : memberDetail.currentMembership.daysRemaining <= 30
                                  ? 'bg-orange-500'
                                  : 'bg-green-500'
                            }`}
                            style={{
                              width: `${Math.max(5, (memberDetail.currentMembership.daysRemaining / 365) * 100)}%`,
                            }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-gray-50 rounded-lg p-6 border border-gray-200 text-center">
                      <Award className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                      <h3 className="text-lg font-medium text-gray-700 mb-2">
                        현재 활성 회원권이 없습니다
                      </h3>
                      <p className="text-gray-500">새로운 회원권을 등록해보세요.</p>
                    </div>
                  )}

                  {/* 회원권 이력 */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">회원권 이용 이력</h3>
                    {memberDetail.membershipHistory && memberDetail.membershipHistory.length > 0 ? (
                      <div className="space-y-4">
                        {memberDetail.membershipHistory.map((membership: any, index: number) => (
                          <div
                            key={index}
                            className="bg-white border border-gray-200 rounded-lg p-4"
                          >
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center space-x-3">
                                <div
                                  className={`w-3 h-3 rounded-full ${
                                    membership.isCurrent
                                      ? 'bg-green-500'
                                      : new Date(membership.endDate) > new Date()
                                        ? 'bg-blue-500'
                                        : 'bg-gray-400'
                                  }`}
                                ></div>
                                <h4 className="font-medium text-gray-900">
                                  {membership.membershipType.name}
                                </h4>
                                {membership.isCurrent && (
                                  <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                                    현재 이용중
                                  </span>
                                )}
                              </div>
                              <div className="text-sm text-gray-500">
                                {formatDate(membership.startDate)} ~{' '}
                                {formatDate(membership.endDate)}
                              </div>
                            </div>
                            <div className="text-sm text-gray-600">
                              {membership.membershipType.description}
                            </div>
                            {membership.paymentNumber && (
                              <div className="text-xs text-gray-500 mt-2">
                                결제번호: {membership.paymentNumber}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <FileText className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                        <p className="text-gray-500">회원권 이용 이력이 없습니다.</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* 결제내역 탭 */}
              {activeTab === 'payments' && memberDetail && (
                <div className="p-6 space-y-6">
                  {/* 결제 요약 */}
                  <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
                    <h3 className="text-lg font-semibold text-blue-800 mb-4 flex items-center">
                      <CreditCard className="w-5 h-5 mr-2" />
                      결제 요약
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">
                          {memberDetail.paymentHistory?.length || 0}
                        </div>
                        <div className="text-sm text-blue-600">총 결제 건수</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">
                          {memberDetail.totalSpent?.toLocaleString() || 0}원
                        </div>
                        <div className="text-sm text-blue-600">총 결제 금액</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">
                          {memberDetail.paymentHistory && memberDetail.paymentHistory.length > 0
                            ? Math.round(
                                memberDetail.totalSpent / memberDetail.paymentHistory.length
                              ).toLocaleString()
                            : 0}
                          원
                        </div>
                        <div className="text-sm text-blue-600">평균 결제 금액</div>
                      </div>
                    </div>
                  </div>

                  {/* 결제 내역 목록 */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">결제 내역</h3>
                    {memberDetail.paymentHistory && memberDetail.paymentHistory.length > 0 ? (
                      <div className="space-y-3">
                        {memberDetail.paymentHistory.map((payment: any, index: number) => (
                          <div
                            key={index}
                            className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                          >
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center space-x-3">
                                <div
                                  className={`w-3 h-3 rounded-full ${
                                    payment.status === 'completed'
                                      ? 'bg-green-500'
                                      : payment.status === 'pending'
                                        ? 'bg-yellow-500'
                                        : 'bg-red-500'
                                  }`}
                                ></div>
                                <div>
                                  <div className="font-medium text-gray-900">
                                    {payment.payment_number}
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    {payment.payment_type === 'membership' &&
                                      payment.membership_type_name}
                                    {payment.payment_type === 'pt' && payment.pt_package_name}
                                    {payment.payment_type === 'locker' && '락커'}
                                    {payment.payment_type === 'other' && '기타'}
                                  </div>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="font-semibold text-gray-900">
                                  {payment.amount?.toLocaleString()}원
                                </div>
                                <div className="text-sm text-gray-500">
                                  {formatDate(payment.payment_date)}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center justify-between text-sm text-gray-600">
                              <div>
                                결제방법:{' '}
                                {payment.payment_method === 'card'
                                  ? '카드'
                                  : payment.payment_method === 'cash'
                                    ? '현금'
                                    : payment.payment_method === 'transfer'
                                      ? '계좌이체'
                                      : payment.payment_method}
                              </div>
                              <div>담당자: {payment.staff_name}</div>
                            </div>
                            {payment.notes && (
                              <div className="mt-2 text-sm text-gray-600 bg-gray-50 p-2 rounded">
                                {payment.notes}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <CreditCard className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                        <p className="text-gray-500">결제 내역이 없습니다.</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* 출석기록 탭 */}
              {activeTab === 'attendance' && (
                <div className="p-6">
                  <div className="text-center py-12">
                    <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">출석 기록을 준비 중입니다.</p>
                  </div>
                </div>
              )}

              {/* 활동로그 탭 */}
              {activeTab === 'activity' && (
                <div className="p-6">
                  <div className="text-center py-12">
                    <Activity className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">활동 로그를 준비 중입니다.</p>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default MemberDetailModal;
