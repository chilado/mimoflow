import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Outlet } from 'react-router-dom';
import { memo } from 'react';

export const AppLayout = memo(() => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header 
            className="h-14 flex items-center justify-between border-b bg-card/80 backdrop-blur-sm px-4 sticky top-0 z-30"
            role="banner"
          >
            <SidebarTrigger className="mr-4" aria-label="Alternar menu lateral" />
            <ThemeToggle />
          </header>
          <main className="flex-1 p-4 md:p-6 overflow-auto" role="main">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
});
AppLayout.displayName = 'AppLayout';
