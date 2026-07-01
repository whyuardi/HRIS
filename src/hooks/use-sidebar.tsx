// =============================================
// HRIS System — Sidebar Hook
// =============================================

'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';

interface SidebarContextType {
  isCollapsed: boolean;
  isMobileOpen: boolean;
  toggle: () => void;
  setMobileOpen: (open: boolean) => void;
}

const SidebarContext = createContext<SidebarContextType>({
  isCollapsed: false,
  isMobileOpen: false,
  toggle: () => {},
  setMobileOpen: () => {},
});

export function SidebarProvider({ children }: { children: ReactNode }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const toggle = useCallback(() => {
    setIsCollapsed(prev => !prev);
  }, []);

  const setMobileOpen = useCallback((open: boolean) => {
    setIsMobileOpen(open);
  }, []);

  return (
    <SidebarContext.Provider value={{ isCollapsed, isMobileOpen, toggle, setMobileOpen }}>
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  return useContext(SidebarContext);
}
