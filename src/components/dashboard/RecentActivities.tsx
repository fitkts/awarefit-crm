import React from 'react';

export interface RecentActivityItem {
  id: number;
  action: string;
  member: string;
  time: string;
}

interface RecentActivitiesProps {
  items: RecentActivityItem[];
}

const RecentActivities: React.FC<RecentActivitiesProps> = ({ items }) => {
  return (
    <div className="lg:col-span-2 bg-white rounded-xl p-6 shadow-sm border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">최근 활동</h3>
      <div className="space-y-4">
        {items.map(activity => (
          <div key={activity.id} className="flex items-center justify-between py-2">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">{activity.action}</p>
              <p className="text-sm text-gray-600">{activity.member}</p>
            </div>
            <div className="text-sm text-gray-500">{activity.time}</div>
          </div>
        ))}
      </div>
      <div className="mt-4 pt-4 border-t border-gray-200">
        <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
          모든 활동 보기 →
        </button>
      </div>
    </div>
  );
};

export default RecentActivities;
