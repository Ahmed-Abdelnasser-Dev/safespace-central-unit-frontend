import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

function RecentActivityCard({ activities }) {
  return (
    <div className="bg-white rounded-xl border border-safe-border p-7">
      <h3 className="text-base font-bold text-safe-text-dark mb-4">Recent Activity</h3>
      <div className="border-b border-safe-border mb-5" />

      <div className="space-y-3">
        {activities.map((activity) => (
          <div key={activity.id} className="flex items-center gap-4 p-4 border bg-safe-bg rounded-lg">
            <div className={`w-9 h-9 rounded-lg ${activity.iconBg} ${activity.iconColor} flex items-center justify-center flex-shrink-0`}>
              <FontAwesomeIcon icon={activity.icon} className="text-sm" />
            </div>
            <div>
              <p className="text-sm font-medium text-safe-text-dark">{activity.title}</p>
              <p className="text-xs text-safe-text-gray mt-0.5">{activity.subtitle}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default RecentActivityCard;
