import { BarChart3, CreditCard, UserCog, Users } from '@/utils/lucide-shim';
import React from 'react';

type ActionColor = 'blue' | 'green' | 'purple' | 'orange';

export interface QuickActionItem {
  id: string;
  label: string;
  iconKey: 'users' | 'credit-card' | 'bar-chart-3' | 'user-cog';
  color: ActionColor;
}

interface QuickActionsProps {
  items: QuickActionItem[];
}

const colorClasses: Record<ActionColor, { bg: string; text: string }> = {
  blue: { bg: 'bg-blue-100', text: 'text-blue-600' },
  green: { bg: 'bg-green-100', text: 'text-green-600' },
  purple: { bg: 'bg-purple-100', text: 'text-purple-600' },
  orange: { bg: 'bg-orange-100', text: 'text-orange-600' },
};

const iconMap = {
  'users': Users,
  'credit-card': CreditCard,
  'bar-chart-3': BarChart3,
  'user-cog': UserCog,
} as const;

const QuickActions: React.FC<QuickActionsProps> = ({ items }) => {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">빠른 액션</h3>
      <div className="space-y-3">
        {items.map(action => {
          const IconComponent = iconMap[action.iconKey];
          const palette = colorClasses[action.color];
          return (
            <button
              key={action.id}
              className="w-full flex items-center space-x-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors text-left"
            >
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${palette.bg}`}>
                <IconComponent className={`w-5 h-5 ${palette.text}`} />
              </div>
              <span className="font-medium text-gray-900">{action.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default QuickActions;


