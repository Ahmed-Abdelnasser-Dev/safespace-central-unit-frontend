import { Outlet } from 'react-router-dom';
import { DispatcherProvider } from './context/DispatcherProvider';

export default function DispatcherLayout() {
  return (
    <DispatcherProvider>
      <Outlet />
    </DispatcherProvider>
  );
}
