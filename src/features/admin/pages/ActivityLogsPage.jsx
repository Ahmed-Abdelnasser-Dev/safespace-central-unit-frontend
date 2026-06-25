import UserManagementCards from '../components/UserManagementCards';
import UserActivityTable from '../components/UserActivityTable';

function ActivityLogsPage() {
  return (
    <div className="flex flex-col h-full bg-safe-bg overflow-hidden">
      <div className="flex-1 overflow-y-auto p-7">
        <UserManagementCards />
        <UserActivityTable />
      </div>
    </div>
  );
}

export default ActivityLogsPage;
