import { Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Sidebar from './Sidebar';
import AppTopBar from './AppTopBar';
import { PageConfigProvider } from '@/contexts/PageConfigContext';
import { getNavItems } from '@/config/navigation';

function AppLayout() {
  const { user } = useSelector((state) => state.auth);
  const roleName = user?.role?.name;
  const navItems = getNavItems(roleName);

  return (
    <div className="flex h-screen bg-safe-dark">
      <Sidebar navItems={navItems} />

      {/* Main content column */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <PageConfigProvider>
          <AppTopBar />
          <main className="flex-1 overflow-auto min-h-0">
            <Outlet />
          </main>
        </PageConfigProvider>
      </div>
    </div>
  );
}

export default AppLayout;
