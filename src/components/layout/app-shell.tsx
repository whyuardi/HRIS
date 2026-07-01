'use client';

import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { TooltipProvider } from '@/components/ui/tooltip';
import { SidebarProvider, useSidebar } from '@/hooks/use-sidebar';
import { Sidebar } from './sidebar';
import { Header } from './header';

function MainContent({ children }: { children: ReactNode }) {
  const { isCollapsed } = useSidebar();

  return (
    <motion.div
      initial={false}
      animate={{ marginLeft: isCollapsed ? 72 : 260 }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      className="min-h-screen flex flex-col ml-0 lg:ml-[260px]"
    >
      <Header />
      <main className="flex-1 p-4 lg:p-6">
        {children}
      </main>
    </motion.div>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <TooltipProvider>
      <SidebarProvider>
        <Sidebar />
        <MainContent>{children}</MainContent>
      </SidebarProvider>
    </TooltipProvider>
  );
}
