'use client';

import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { TooltipProvider } from '@/components/ui/tooltip';
import { SidebarProvider, useSidebar } from '@/hooks/use-sidebar';
import { Sidebar } from './sidebar';
import { Header } from './header';

import { useState, useEffect } from 'react';

function MainContent({ children }: { children: ReactNode }) {
  const { isCollapsed } = useSidebar();
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };
    
    handleResize(); // Initial check
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <motion.div
      initial={false}
      animate={{ marginLeft: isDesktop ? (isCollapsed ? 72 : 260) : 0 }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      className="min-h-screen flex flex-col ml-0 lg:ml-[260px]"
    >
      <Header />
      <main className="flex-1 p-4 lg:p-6 overflow-x-hidden">
        {children}
      </main>
    </motion.div>
  );
}

import { initDb } from '@/lib/db';

export function AppShell({ children }: { children: ReactNode }) {
  useEffect(() => {
    initDb();
  }, []);

  return (
    <TooltipProvider>
      <SidebarProvider>
        <Sidebar />
        <MainContent>{children}</MainContent>
      </SidebarProvider>
    </TooltipProvider>
  );
}
