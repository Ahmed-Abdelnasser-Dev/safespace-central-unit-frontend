import { Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Sidebar from './Sidebar';
import { getNavItems } from '@/config/navigation';

/**
 * Shared application layout for all authenticated pages.
 * Renders the dynamic role-based sidebar alongside the page content.
 */
function AppLayout() {
  const { user } = useSelector((state) => state.auth);
  const roleName = user?.role?.name;
  const navItems = getNavItems(roleName);

  return (
    <div className="flex h-screen bg-safe-dark">
      <Sidebar navItems={navItems} />
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}

export default AppLayout;
