import { Outlet } from 'react-router-dom';
import AppSidebar from './AppSidebar';
import MobileNav from './MobileNav';

const AppLayout = () => (
  <div className="flex min-h-screen bg-background gradient-subtle">
    <AppSidebar />
    <main className="flex-1 min-w-0">
      <div className="max-w-6xl mx-auto p-4 md:p-8 pb-24 md:pb-12">
        <Outlet />
      </div>
    </main>
    <MobileNav />
  </div>
);

export default AppLayout;
