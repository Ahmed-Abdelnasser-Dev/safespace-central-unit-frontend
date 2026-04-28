import UserManagementCards from '../components/UserManagementCards';
import UserActivityTable from '../components/UserActivityTable';
import UserManagementHeader from '../components/UserManagementHeader';

function ActivityLogsPage() {
  return (
    <div className="flex flex-col h-full bg-safe-bg overflow-hidden">
      <UserManagementHeader
        title="Activity Logs"
        description="Monitor and audit all system activities and user actions"
      />
      
      <div className="flex-1 overflow-y-auto p-8">
        <div className="max-w-7xl">
          <UserManagementCards />
          <UserActivityTable />
        </div>
      </div>
    </div>
  );
}

export default ActivityLogsPage;
