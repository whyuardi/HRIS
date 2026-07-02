'use client';

import { useState, useEffect, useMemo } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { format } from 'date-fns';
import { id as localeId } from 'date-fns/locale';
import { useSidebar } from '@/hooks/use-sidebar';
import { notifications } from '@/lib/data/dashboard';
import { NAVIGATION_ITEMS, COMPANY_NAME } from '@/lib/constants';
import { dbGetEmployees } from '@/lib/db';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetHeader } from '@/components/ui/sheet';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription
} from '@/components/ui/dialog';
import {
  Search, Bell, Menu, CalendarDays, LogOut, User, Settings, ChevronDown, Hexagon,
  LayoutDashboard, Users, Clock, Wallet, BarChart3, FileText, Network, Sun, Moon,
  ArrowRight, FileBadge, Keyboard
} from 'lucide-react';
import { Employee } from '@/types';

const iconMap: Record<string, React.ElementType> = {
  LayoutDashboard, Users, Network, Clock, Wallet, CalendarDays, BarChart3, FileText, Settings,
};

export function Header() {
  const router = useRouter();
  const { setMobileOpen } = useSidebar();
  const pathname = usePathname();
  
  // Notification states
  const [showNotifications, setShowNotifications] = useState(false);
  const unreadCount = notifications.filter(n => !n.read).length;
  const today = format(new Date(), 'EEEE, d MMMM yyyy', { locale: localeId });

  // Theme states
  const [isDark, setIsDark] = useState(false);

  // Search states
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [employees, setEmployees] = useState<Employee[]>([]);

  useEffect(() => {
    // Check local storage or prefers-color-scheme
    const isDarkMode = localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
    setIsDark(isDarkMode);
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    // Load employees for search
    setEmployees(dbGetEmployees());

    // Listen to Ctrl+K
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setIsSearchOpen((open) => !open);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const toggleTheme = () => {
    if (isDark) {
      document.documentElement.classList.remove('dark');
      localStorage.theme = 'light';
      setIsDark(false);
    } else {
      document.documentElement.classList.add('dark');
      localStorage.theme = 'dark';
      setIsDark(true);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('hr_pro_logged_in');
    router.push('/login');
  };

  const currentPage = NAVIGATION_ITEMS.find(item =>
    item.href === '/' ? pathname === '/' : pathname.startsWith(item.href)
  );

  // Filtered search results
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return { employees: [], menus: [] };
    
    const query = searchQuery.toLowerCase();

    // Match employees
    const matchedEmps = employees.filter(emp => 
      emp.name.toLowerCase().includes(query) ||
      emp.nik.toLowerCase().includes(query) ||
      emp.position.toLowerCase().includes(query) ||
      emp.division.toLowerCase().includes(query)
    ).slice(0, 5);

    // Match menus
    const matchedMenus = NAVIGATION_ITEMS.filter(item => 
      item.label.toLowerCase().includes(query)
    );

    return { employees: matchedEmps, menus: matchedMenus };
  }, [searchQuery, employees]);

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 lg:px-6">
      {/* Left Side */}
      <div className="flex items-center gap-3">
        {/* Mobile Menu */}
        <Sheet>
          <SheetTrigger className="lg:hidden p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-850 transition-colors">
            <Menu className="w-5 h-5 text-slate-600 dark:text-slate-400" />
          </SheetTrigger>
          <SheetContent side="left" className="w-72 p-0">
            <SheetHeader className="sr-only">
              <SheetTitle>Navigation Menu</SheetTitle>
            </SheetHeader>
            <div className="flex items-center h-16 px-4 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                  <Hexagon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900 dark:text-white">HR Pro</p>
                  <p className="text-[10px] text-slate-500">{COMPANY_NAME}</p>
                </div>
              </div>
            </div>
            <nav className="py-4 px-3 space-y-1">
              {NAVIGATION_ITEMS.map((item) => {
                const Icon = iconMap[item.icon];
                const isActive = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-450'
                        : 'text-slate-600 hover:bg-slate-50 dark:text-slate-450 dark:hover:bg-slate-900'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </SheetContent>
        </Sheet>

        {/* Page Title */}
        <div className="hidden sm:block">
          <h1 className="text-lg font-bold text-slate-900 dark:text-white">
            {currentPage?.label || 'Dashboard'}
          </h1>
        </div>
      </div>

      {/* Center: Search Trigger (Command Palette layout) */}
      <div className="hidden md:flex flex-1 max-w-md mx-8">
        <button 
          onClick={() => { setEmployees(dbGetEmployees()); setIsSearchOpen(true); }}
          className="relative w-full h-10 px-3 pl-10 rounded-xl bg-slate-50 hover:bg-slate-100/80 dark:bg-slate-900 dark:hover:bg-slate-900/80 border border-slate-200 dark:border-slate-800 text-left text-slate-400 dark:text-slate-500 text-sm transition-colors flex items-center justify-between group"
        >
          <div className="flex items-center gap-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-hover:text-emerald-600 transition-colors" />
            <span>Cari karyawan, menu, dokumen...</span>
          </div>
          <kbd className="hidden sm:inline-flex h-5 select-none items-center gap-1 rounded border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-1.5 font-mono text-[10px] font-medium text-slate-400 opacity-100">
            <span className="text-xs">⌘</span>K
          </kbd>
        </button>
      </div>

      {/* Right Side */}
      <div className="flex items-center gap-2">
        {/* Date */}
        <div className="hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-900 text-xs font-medium text-slate-600 dark:text-slate-400">
          <CalendarDays className="w-3.5 h-3.5 text-emerald-650" />
          {today}
        </div>

        {/* Dark Mode Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors text-slate-500 dark:text-slate-400"
          title={isDark ? 'Mode Terang' : 'Mode Gelap'}
        >
          {isDark ? <Sun className="w-5 h-5 text-amber-500" /> : <Moon className="w-5 h-5 text-slate-600" />}
        </button>

        {/* Notifications */}
        <DropdownMenu open={showNotifications} onOpenChange={setShowNotifications}>
          <DropdownMenuTrigger className="relative p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors">
            <Bell className="w-5 h-5 text-slate-650 dark:text-slate-400" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-rose-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center shadow-md shadow-rose-500/20">
                {unreadCount}
              </span>
            )}
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80 p-0 rounded-2xl overflow-hidden shadow-xl border-slate-200 dark:border-slate-800">
            <div className="px-4 py-3 bg-slate-50 dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <p className="text-sm font-bold text-slate-900 dark:text-white">Notifikasi</p>
                <Badge variant="secondary" className="text-[10px] bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900">
                  {unreadCount} Baru
                </Badge>
              </div>
            </div>
            <div className="max-h-72 overflow-y-auto">
              {notifications.slice(0, 5).map((notif) => (
                <DropdownMenuItem key={notif.id} className="px-4 py-3 cursor-pointer focus:bg-slate-50 dark:focus:bg-slate-900/60 border-b last:border-0 border-slate-100/50 dark:border-slate-900/50">
                  <div className="flex gap-3 w-full">
                    <div className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${
                      notif.priority === 'high' ? 'bg-rose-500 shadow-sm shadow-rose-500/30' :
                      notif.priority === 'medium' ? 'bg-amber-500 shadow-sm shadow-amber-500/30' : 'bg-emerald-500'
                    }`} />
                    <div className="min-w-0 space-y-0.5">
                      <p className="text-xs font-semibold text-slate-850 dark:text-white">{notif.title}</p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal line-clamp-2">{notif.message}</p>
                    </div>
                  </div>
                </DropdownMenuItem>
              ))}
            </div>
            <DropdownMenuSeparator />
            <div className="p-2 bg-slate-50 dark:bg-slate-900/20">
              <button className="w-full text-xs text-center text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 py-1.5 font-bold">
                Lihat Semua Notifikasi
              </button>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Profile */}
        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors">
            <Avatar className="w-8 h-8 shadow-sm">
              <AvatarImage src="https://api.dicebear.com/9.x/notionists/svg?seed=Admin" />
              <AvatarFallback className="bg-emerald-100 text-emerald-700 text-xs font-semibold">AD</AvatarFallback>
            </Avatar>
            <div className="hidden lg:block text-left">
              <p className="text-xs font-bold text-slate-900 dark:text-white">Admin HRD</p>
              <p className="text-[9px] text-slate-450 dark:text-slate-500 font-semibold uppercase tracking-wider">Super Admin</p>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden lg:block" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 rounded-xl shadow-lg border-slate-200 dark:border-slate-800">
            <DropdownMenuItem className="cursor-pointer text-xs font-medium py-2">
              <User className="w-4 h-4 mr-2 text-slate-400" /> Profil Saya
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer text-xs font-medium py-2" onClick={() => router.push('/settings')}>
              <Settings className="w-4 h-4 mr-2 text-slate-400" /> Pengaturan
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="cursor-pointer text-xs font-bold py-2 text-rose-600 dark:text-rose-450 focus:bg-rose-50/50 dark:focus:bg-rose-950/20" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" /> Keluar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Global Search Dialog (Command Palette) */}
      <Dialog open={isSearchOpen} onOpenChange={setIsSearchOpen}>
        <DialogContent className="sm:max-w-xl p-0 overflow-hidden border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl">
          <div className="flex items-center border-b border-slate-150 dark:border-slate-850 px-3 h-12 bg-slate-50 dark:bg-slate-900">
            <Search className="w-4 h-4 text-slate-400 mr-3 flex-shrink-0" />
            <input 
              type="text" 
              placeholder="Ketik nama karyawan, jabatan, atau halaman menu..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent border-0 outline-none text-slate-850 dark:text-slate-150 placeholder-slate-400 dark:placeholder-slate-500 text-sm focus:ring-0"
              autoFocus
            />
            <div className="flex items-center gap-1 bg-white dark:bg-slate-950 px-2 py-0.5 border border-slate-200 dark:border-slate-800 rounded-lg text-[10px] text-slate-400 font-mono flex-shrink-0">
              <Keyboard className="w-3.5 h-3.5" /> ESC
            </div>
          </div>
          
          <div className="max-h-[350px] overflow-y-auto p-4 space-y-4">
            {!searchQuery.trim() ? (
              <div className="space-y-3">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Navigasi Cepat</p>
                <div className="grid grid-cols-2 gap-2">
                  {NAVIGATION_ITEMS.map((item) => {
                    const Icon = iconMap[item.icon];
                    return (
                      <Link 
                        key={item.href} 
                        href={item.href}
                        onClick={() => setIsSearchOpen(false)}
                        className="flex items-center gap-2.5 p-2 bg-slate-50 hover:bg-emerald-50 dark:bg-slate-900/40 dark:hover:bg-emerald-950/20 border border-slate-100 dark:border-slate-900 rounded-xl transition-all duration-200 text-xs font-semibold text-slate-700 dark:text-slate-300 group"
                      >
                        <Icon className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 transition-colors" />
                        <span>{item.label}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Menu Results */}
                {searchResults.menus.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-[9px] font-bold text-slate-450 dark:text-slate-500 uppercase tracking-wider">Halaman Ditemukan</p>
                    <div className="space-y-1">
                      {searchResults.menus.map(item => {
                        const Icon = iconMap[item.icon];
                        return (
                          <Link 
                            key={item.href} 
                            href={item.href}
                            onClick={() => setIsSearchOpen(false)}
                            className="flex items-center justify-between p-2.5 hover:bg-slate-50 dark:hover:bg-slate-900 rounded-xl text-xs font-medium group transition-colors"
                          >
                            <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                              <Icon className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 transition-colors" />
                              <span>{item.label}</span>
                            </div>
                            <ArrowRight className="w-3.5 h-3.5 text-slate-300 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Employee Results */}
                {searchResults.employees.length > 0 ? (
                  <div className="space-y-2">
                    <p className="text-[9px] font-bold text-slate-450 dark:text-slate-500 uppercase tracking-wider">Karyawan Ditemukan</p>
                    <div className="space-y-2">
                      {searchResults.employees.map(emp => (
                        <Link 
                          key={emp.id} 
                          href={`/employees/${emp.id}`}
                          onClick={() => setIsSearchOpen(false)}
                          className="flex items-center justify-between p-2 hover:bg-slate-50 dark:hover:bg-slate-900 rounded-xl transition-colors group"
                        >
                          <div className="flex items-center gap-3">
                            <Avatar className="w-8 h-8">
                              <AvatarImage src={emp.avatar} />
                              <AvatarFallback className="text-[10px] bg-emerald-100 text-emerald-700">{emp.name[0]}</AvatarFallback>
                            </Avatar>
                            <div className="text-left">
                              <p className="text-xs font-bold text-slate-900 dark:text-white">{emp.name}</p>
                              <p className="text-[10px] text-slate-400 font-medium">{emp.position} · {emp.division}</p>
                            </div>
                          </div>
                          <Badge variant="outline" className="text-[9px] font-semibold border-slate-200 dark:border-slate-800 text-slate-500 font-mono">
                            {emp.nik}
                          </Badge>
                        </Link>
                      ))}
                    </div>
                  </div>
                ) : (
                  searchResults.menus.length === 0 && (
                    <div className="text-center py-6">
                      <p className="text-xs text-slate-500 font-medium">Tidak ada hasil pencarian untuk &ldquo;{searchQuery}&rdquo;</p>
                    </div>
                  )
                )}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

    </header>
  );
}
