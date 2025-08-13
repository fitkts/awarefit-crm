// 🚀 Lucide React Tree Shaking 최적화 Shim
// 개별 아이콘 파일에서만 export하여 번들 크기 최소화

// 🎯 핵심 아이콘들만 미리 로드 (실사용만 유지)
export { default as AlertCircle } from 'lucide-react/dist/esm/icons/alert-circle.js';
// 미사용 제거: AlertTriangle
export { default as ArrowLeft } from 'lucide-react/dist/esm/icons/arrow-left.js';
export { default as ArrowRight } from 'lucide-react/dist/esm/icons/arrow-right.js';
// 📊 대시보드 & 통계
// 미사용 제거: BarChart3, Bell
// 📅 스케줄 관련
export { default as Calendar } from 'lucide-react/dist/esm/icons/calendar.js';
// ⚠️ 상태 표시
export { default as CheckCircle } from 'lucide-react/dist/esm/icons/check-circle.js';
export { default as ChevronDown } from 'lucide-react/dist/esm/icons/chevron-down.js';
export { default as ChevronLeft } from 'lucide-react/dist/esm/icons/chevron-left.js';
export { default as ChevronRight } from 'lucide-react/dist/esm/icons/chevron-right.js';
export { default as ChevronUp } from 'lucide-react/dist/esm/icons/chevron-up.js';
export { default as Clock } from 'lucide-react/dist/esm/icons/clock.js';
// 💻 개발 관련
// 미사용 제거: Code
export { default as Copy } from 'lucide-react/dist/esm/icons/copy.js';
// 💳 결제 관련
export { default as CreditCard } from 'lucide-react/dist/esm/icons/credit-card.js';
// 미사용 제거: DollarSign, Download
export { default as Edit } from 'lucide-react/dist/esm/icons/edit.js';
// 미사용 제거: ExternalLink
// 미사용 제거: EyeOff
export { default as Eye } from 'lucide-react/dist/esm/icons/eye.js';
// 미사용 제거: FileText
export { default as Filter } from 'lucide-react/dist/esm/icons/filter.js';
// 미사용 제거: Heart
// 📱 내비게이션 & 레이아웃
export { default as Home } from 'lucide-react/dist/esm/icons/home.js';
// 미사용 제거: Info
export { default as Link } from 'lucide-react/dist/esm/icons/link.js';
// 📱 연락처
export { default as Mail } from 'lucide-react/dist/esm/icons/mail.js';
// 미사용 제거: MapPin
export { default as Menu } from 'lucide-react/dist/esm/icons/menu.js';
export { default as Minus } from 'lucide-react/dist/esm/icons/minus.js';
export { default as Moon } from 'lucide-react/dist/esm/icons/moon.js';
// 🔧 기타 유틸리티
export { default as MoreHorizontal } from 'lucide-react/dist/esm/icons/more-horizontal.js';
export { default as MoreVertical } from 'lucide-react/dist/esm/icons/more-vertical.js';
// 미사용 제거: Palette, Paperclip
export { default as Phone } from 'lucide-react/dist/esm/icons/phone.js';
// 미사용 제거: PieChart
export { default as Plus } from 'lucide-react/dist/esm/icons/plus.js';
// 미사용 제거: Receipt
export { default as Save } from 'lucide-react/dist/esm/icons/save.js';
export { default as Search } from 'lucide-react/dist/esm/icons/search.js';
// ⚙️ 설정 & 액션
export { default as Settings } from 'lucide-react/dist/esm/icons/settings.js';
// 🎨 UI 요소
export { default as Star } from 'lucide-react/dist/esm/icons/star.js';
// 🎨 테마 관련
export { default as Sun } from 'lucide-react/dist/esm/icons/sun.js';
// 미사용 제거: Trash2
export { default as TrendingUp } from 'lucide-react/dist/esm/icons/trending-up.js';
export { default as Upload } from 'lucide-react/dist/esm/icons/upload.js';
// 👥 사용자 관련
export { default as UserCog } from 'lucide-react/dist/esm/icons/user-cog.js';
// 미사용 제거: UserMinus
export { default as UserPlus } from 'lucide-react/dist/esm/icons/user-plus.js';
export { default as User } from 'lucide-react/dist/esm/icons/user.js';
export { default as Users } from 'lucide-react/dist/esm/icons/users.js';
export { default as XCircle } from 'lucide-react/dist/esm/icons/x-circle.js';
export { default as X } from 'lucide-react/dist/esm/icons/x.js';
export { default as Zap } from 'lucide-react/dist/esm/icons/zap.js';

// 🚀 동적 로딩을 위한 헬퍼 함수
export const loadIcon = async iconName => {
  try {
    // 케밥 케이스로 변환
    const kebabName = iconName
      .replace(/([A-Z])/g, '-$1')
      .toLowerCase()
      .replace(/^-/, '');

    // 개별 아이콘 파일 로드
    const iconModule = await import(`lucide-react/dist/esm/icons/${kebabName}.js`);
    return iconModule.default || iconModule[iconName];
  } catch (error) {
    console.warn(`아이콘 로드 실패: ${iconName}`, error);
    return null;
  }
};

// 👉 추가로 필요한 아이콘(신버전 lucide-react index에 없는 경우) 직접 매핑
export { default as ArrowUpDown } from 'lucide-react/dist/esm/icons/arrow-up-down.js';
export { default as Bookmark } from 'lucide-react/dist/esm/icons/bookmark.js';
export { default as Calculator } from 'lucide-react/dist/esm/icons/calculator.js';
export { default as Lock } from 'lucide-react/dist/esm/icons/lock.js';
export { default as Package } from 'lucide-react/dist/esm/icons/package.js';
export { default as RefreshCw } from 'lucide-react/dist/esm/icons/refresh-cw.js';
export { default as RotateCcw } from 'lucide-react/dist/esm/icons/rotate-ccw.js';
export { default as CheckSquare } from 'lucide-react/dist/esm/icons/square-check.js';
export { default as Square } from 'lucide-react/dist/esm/icons/square.js';
export { default as UserCheck } from 'lucide-react/dist/esm/icons/user-check.js';

// ✅ A안: 경고 발생 아이콘 최소 복원
export { default as Activity } from 'lucide-react/dist/esm/icons/activity.js';
export { default as AlertTriangle } from 'lucide-react/dist/esm/icons/alert-triangle.js';
export { default as Award } from 'lucide-react/dist/esm/icons/award.js';
export { default as BarChart3 } from 'lucide-react/dist/esm/icons/bar-chart-3.js';
export { default as Bell } from 'lucide-react/dist/esm/icons/bell.js';
export { default as Briefcase } from 'lucide-react/dist/esm/icons/briefcase.js';
export { default as Building } from 'lucide-react/dist/esm/icons/building.js';
export { default as Code } from 'lucide-react/dist/esm/icons/code.js';
export { default as DollarSign } from 'lucide-react/dist/esm/icons/dollar-sign.js';
export { default as Download } from 'lucide-react/dist/esm/icons/download.js';
export { default as FileText } from 'lucide-react/dist/esm/icons/file-text.js';
export { default as Heart } from 'lucide-react/dist/esm/icons/heart.js';
export { default as History } from 'lucide-react/dist/esm/icons/history.js';
export { default as Info } from 'lucide-react/dist/esm/icons/info.js';
export { default as MapPin } from 'lucide-react/dist/esm/icons/map-pin.js';
export { default as Palette } from 'lucide-react/dist/esm/icons/palette.js';
export { default as Shield } from 'lucide-react/dist/esm/icons/shield.js';
export { default as Trash2 } from 'lucide-react/dist/esm/icons/trash-2.js';
export { default as TrendingDown } from 'lucide-react/dist/esm/icons/trending-down.js';
export { default as UserX } from 'lucide-react/dist/esm/icons/user-x.js';

// 기본 export는 제공하지 않습니다. 필요한 아이콘은 위의 개별 export 또는 loadIcon()을 사용하세요.
