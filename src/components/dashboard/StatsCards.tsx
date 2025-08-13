import { Clock, DollarSign, TrendingDown, TrendingUp, Users } from '@/utils/lucide-shim';
import React from 'react';

type ChangeType = 'increase' | 'decrease';
type StatColor = 'blue' | 'green' | 'purple' | 'orange';

export interface StatItem {
  title: string;
  value: string;
  change: string;
  changeType: ChangeType;
  iconKey: 'users' | 'dollar-sign' | 'trending-up' | 'trending-down' | 'clock';
  color: StatColor;
}

interface StatsCardsProps {
  items: StatItem[];
}

const colorClasses: Record<StatColor, { bg: string; text: string }> = {
  blue: { bg: 'bg-blue-100', text: 'text-blue-600' },
  green: { bg: 'bg-green-100', text: 'text-green-600' },
  purple: { bg: 'bg-purple-100', text: 'text-purple-600' },
  orange: { bg: 'bg-orange-100', text: 'text-orange-600' },
};

const iconMap = {
  'users': Users,
  'dollar-sign': DollarSign,
  'trending-up': TrendingUp,
  'trending-down': TrendingDown,
  'clock': Clock,
} as const;

const StatsCards: React.FC<StatsCardsProps> = ({ items }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {items.map(item => {
        const IconComponent = iconMap[item.iconKey];
        const palette = colorClasses[item.color];
        return (
          <div key={item.title} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${palette.bg}`}>
                <IconComponent className={`w-6 h-6 ${palette.text}`} />
              </div>
              <div
                className={`flex items-center space-x-1 text-sm ${
                  item.changeType === 'increase' ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {item.changeType === 'increase' ? (
                  <TrendingUp className="w-4 h-4" />
                ) : (
                  <TrendingDown className="w-4 h-4" />
                )}
                <span>{item.change}</span>
              </div>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-1">{item.value}</h3>
              <p className="text-sm text-gray-600">{item.title}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default StatsCards;


