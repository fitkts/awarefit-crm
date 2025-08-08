declare module '@/utils/lucide-shim' {
  import type { RefAttributes, ForwardRefExoticComponent } from 'react';
  import type { LucideProps } from 'lucide-react';

  // lucide-react의 아이콘 타입과 호환되도록 정의
  export type LucideIcon = ForwardRefExoticComponent<
    Omit<LucideProps, 'ref'> & RefAttributes<SVGSVGElement>
  >;

  export const Activity: LucideIcon;
  export const AlertCircle: LucideIcon;
  export const AlertTriangle: LucideIcon;
  export const ArrowLeft: LucideIcon;
  export const ArrowRight: LucideIcon;
  export const BarChart3: LucideIcon;
  export const Bell: LucideIcon;
  export const Calendar: LucideIcon;
  export const CheckCircle: LucideIcon;
  export const ChevronDown: LucideIcon;
  export const ChevronLeft: LucideIcon;
  export const ChevronRight: LucideIcon;
  export const ChevronUp: LucideIcon;
  export const Clock: LucideIcon;
  export const Code: LucideIcon;
  export const Copy: LucideIcon;
  export const CreditCard: LucideIcon;
  export const DollarSign: LucideIcon;
  export const Download: LucideIcon;
  export const Edit: LucideIcon;
  export const ExternalLink: LucideIcon;
  export const Eye: LucideIcon;
  export const EyeOff: LucideIcon;
  export const FileText: LucideIcon;
  export const Filter: LucideIcon;
  export const Heart: LucideIcon;
  export const Home: LucideIcon;
  export const Info: LucideIcon;
  export const Link: LucideIcon;
  export const Mail: LucideIcon;
  export const MapPin: LucideIcon;
  export const Menu: LucideIcon;
  export const Minus: LucideIcon;
  export const Moon: LucideIcon;
  export const MoreHorizontal: LucideIcon;
  export const MoreVertical: LucideIcon;
  export const Palette: LucideIcon;
  export const Paperclip: LucideIcon;
  export const Phone: LucideIcon;
  export const PieChart: LucideIcon;
  export const Plus: LucideIcon;
  export const Receipt: LucideIcon;
  export const Save: LucideIcon;
  export const Search: LucideIcon;
  export const Settings: LucideIcon;
  export const Star: LucideIcon;
  export const Sun: LucideIcon;
  export const Trash2: LucideIcon;
  export const TrendingUp: LucideIcon;
  export const Upload: LucideIcon;
  export const User: LucideIcon;
  export const UserCog: LucideIcon;
  export const UserMinus: LucideIcon;
  export const UserPlus: LucideIcon;
  export const Users: LucideIcon;
  export const X: LucideIcon;
  export const XCircle: LucideIcon;
  export const Zap: LucideIcon;
  export const ArrowUpDown: LucideIcon;
  export const Award: LucideIcon;
  export const Bookmark: LucideIcon;
  export const Briefcase: LucideIcon;
  export const Building: LucideIcon;
  export const Calculator: LucideIcon;
  export const History: LucideIcon;
  export const Lock: LucideIcon;
  export const Package: LucideIcon;
  export const RefreshCw: LucideIcon;
  export const RotateCcw: LucideIcon;
  export const Shield: LucideIcon;
  export const CheckSquare: LucideIcon;
  export const Square: LucideIcon;
  export const TrendingDown: LucideIcon;
  export const UserCheck: LucideIcon;
  export const UserX: LucideIcon;
}

