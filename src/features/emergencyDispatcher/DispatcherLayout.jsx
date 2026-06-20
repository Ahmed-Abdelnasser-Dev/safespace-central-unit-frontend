import { Outlet } from 'react-router-dom';
import { DispatcherProvider } from './context/DispatcherProvider';
import NewIncidentDialog from './components/NewIncidentDialog';

export default function DispatcherLayout() {
  return (
    <DispatcherProvider>
      {/* Global new-incident alert — fires for every dispatcher in dispatcher:global */}
      <NewIncidentDialog />
      <Outlet />
    </DispatcherProvider>
  );
}
