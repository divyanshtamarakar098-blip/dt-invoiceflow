import { Outlet } from 'react-router-dom';
import AppSidebar from './AppSidebar';
import MobileNav from './MobileNav';

const AppLayout = () => (
  <div className="flex min-h-screen">
    <AppSidebar />
    <main className="flex-1 p-4 md:p-8 pb-20 md:pb-8 max-w-5xl">
      <Outlet />
    </main>
    <MobileNav />
  </div>
);

export default AppLayout;
