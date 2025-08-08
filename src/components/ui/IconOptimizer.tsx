// 🚀 아이콘 최적화 컴포넌트 - 미리 정의된 아이콘만 사용하여 번들 최소화
import React from 'react';

// 🎯 자주 사용되는 핵심 아이콘만 미리 로드 (shim 경유로 번들 축소)
import { Calendar, Copy, Edit, Eye, Mail, Phone, Save, Settings, Star, User } from '@/utils/lucide-shim';

interface OptimizedIconProps {
  name: string;
  className?: string;
  size?: number;
  color?: string;
  [key: string]: any;
}

// 자주 사용되는 아이콘 맵핑
const preloadedIcons = {
  Calendar,
  User,
  Mail,
  Phone,
  Save,
  Edit,
  Eye,
  Settings,
  Star,
  Copy,
};

export const OptimizedIcon: React.FC<OptimizedIconProps> = ({
  name,
  className = 'w-4 h-4',
  ...props
}) => {
  // 🚀 미리 로드된 아이콘만 사용
  const PreloadedIcon = preloadedIcons[name as keyof typeof preloadedIcons];
  if (PreloadedIcon) {
    return <PreloadedIcon className={className} {...props} />;
  }

  // ⚠️ 동적 import를 사용하지 않고, 미등록 아이콘은 플레이스홀더로 대체
  return <div className={`${className} bg-gray-200 dark:bg-gray-700 rounded`} {...props} />;
};

// 🚀 편의를 위한 래퍼 컴포넌트들
export const Icon = {
  // 자주 사용되는 아이콘들 (즉시 로드)
  Calendar: (props: any) => <Calendar {...props} />,
  User: (props: any) => <User {...props} />,
  Mail: (props: any) => <Mail {...props} />,
  Phone: (props: any) => <Phone {...props} />,
  Save: (props: any) => <Save {...props} />,
  Edit: (props: any) => <Edit {...props} />,
  Eye: (props: any) => <Eye {...props} />,
  Settings: (props: any) => <Settings {...props} />,
  Star: (props: any) => <Star {...props} />,
  Copy: (props: any) => <Copy {...props} />,

  // 동적 로딩 아이콘
  Dynamic: OptimizedIcon,
};

export default Icon;
