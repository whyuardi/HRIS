'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { format } from 'date-fns';
import { id as localeId } from 'date-fns/locale';
import { useSidebar } from '@/hooks/use-sidebar';
import { notifications } from '@/lib/data/dashboard';
import { NAVIGATION_ITEMS, COMPANY_NAME } from '@/lib/constants';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetHeader } from '@/components/ui/sheet';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
  Search, Bell, Menu, CalendarDays, LogOut, User, Settings, ChevronDown, Hexagon,
  LayoutDashboard, Users, Clock, Wallet, BarChart3, FileText,
} from 'lucide-react';

const iconMap: Record<string, React.ElementType> = {
  LayoutDashboard, Users, Clock, Wallet, CalendarDays, BarChart3, FileText, Settings,
};

export function Header() {
  const { setMobileOpen } = useSidebar();
  const pathname = usePathname();
  const [showNotifications, setShowNotifications] = useState(false);
  const unreadCount = notifications.filter(n => !n.read).length;
  const today = format(new Date(), 'EEEE, d MMMM yyyy', { locale: localeId });

  const currentPage = NAVIGATION_ITEMS.find(item =>
    item.href === '/' ? pathname === '/' : pathname.startsWith(item.href)
  );

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/80 dark:bg-gray-950/80 backdrop-blur-xl border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-4 lg:px-6">
      {/* Left Side */}
      <div className="flex items-center gap-3">
        {/* Mobile Menu */}
        <Sheet>
          <SheetTrigger className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            <Menu className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </SheetTrigger>
          <SheetContent side="left" className="w-72 p-0">
            <SheetHeader className="sr-only">
              <SheetTitle>Navigation Menu</SheetTitle>
            </SheetHeader>
            <div className="flex items-center h-16 px-4 border-b border-gray-200 dark:border-gray-800">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                  <Hexagon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900 dark:text-white">HR Pro</p>
                  <p className="text-[10px] text-gray-500">{COMPANY_NAME}</p>
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
                        ? 'bg-green-50 text-green-700 dark:bg-green-950/50 dark:text-green-400'
                        : 'text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-900'
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
          <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
            {currentPage?.label || 'Dashboard'}
          </h1>
        </div>
      </div>

      {/* Center: Search */}
      <div className="hidden md:flex flex-1 max-w-md mx-8">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Cari karyawan, menu, dokumen..."
            className="pl-10 bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-800 rounded-xl h-10 text-sm focus-visible:ring-green-500"
          />
        </div>
      </div>

      {/* Right Side */}
      <div className="flex items-center gap-2">
        {/* Date */}
        <div className="hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-50 dark:bg-gray-900 text-xs text-gray-600 dark:text-gray-400">
          <CalendarDays className="w-3.5 h-3.5" />
          {today}
        </div>

        {/* Notifications */}
        <DropdownMenu open={showNotifications} onOpenChange={setShowNotifications}>
          <DropdownMenuTrigger className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            <Bell className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80 p-0">
            <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-gray-900 dark:text-white">Notifikasi</p>
                <Badge variant="secondary" className="text-[10px] bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
                  {unreadCount} baru
                </Badge>
              </div>
            </div>
            <div className="max-h-72 overflow-y-auto">
              {notifications.slice(0, 5).map((notif) => (
                <DropdownMenuItem key={notif.id} className="px-4 py-3 cursor-pointer focus:bg-gray-50 dark:focus:bg-gray-900">
                  <div className="flex gap-3 w-full">
                    <div className={`mt-0.5 w-2 h-2 rounded-full flex-shrink-0 ${
                      notif.priority === 'high' ? 'bg-red-500' :
                      notif.priority === 'medium' ? 'bg-amber-500' : 'bg-blue-500'
                    }`} />
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-gray-900 dark:text-white">{notif.title}</p>
                      <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2">{notif.message}</p>
                    </div>
                  </div>
                </DropdownMenuItem>
              ))}
            </div>
            <DropdownMenuSeparator />
            <div className="p-2">
              <button className="w-full text-xs text-center text-green-600 dark:text-green-400 hover:text-green-700 py-1.5 font-medium">
                Lihat Semua Notifikasi
              </button>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Profile */}
        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            <Avatar className="w-8 h-8">
              <AvatarImage src="https://api.dicebear.com/9.x/notionists/svg?seed=Admin" />
              <AvatarFallback className="bg-green-100 text-green-700 text-xs font-semibold">AD</AvatarFallback>
            </Avatar>
            <div className="hidden lg:block text-left">
              <p className="text-xs font-semibold text-gray-900 dark:text-white">Admin HRD</p>
              <p className="text-[10px] text-gray-500">Super Admin</p>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-gray-400 hidden lg:block" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem className="cursor-pointer">
              <User className="w-4 h-4 mr-2" /> Profil Saya
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer">
              <Settings className="w-4 h-4 mr-2" /> Pengaturan
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="cursor-pointer text-red-600 dark:text-red-400">
              <LogOut className="w-4 h-4 mr-2" /> Keluar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
