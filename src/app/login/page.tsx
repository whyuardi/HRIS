'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Hexagon, Lock, Mail, Eye, EyeOff } from 'lucide-react';
import { COMPANY_NAME, APP_NAME } from '@/lib/constants';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('hrd@benuagreenenergy.co.id');
  const [password, setPassword] = useState('admin123');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    setTimeout(() => {
      if (email === 'hrd@benuagreenenergy.co.id' && password === 'admin123') {
        toast.success('Login Berhasil', {
          description: 'Selamat datang kembali di portal HR Pro.',
        });
        // Store simple auth flag in localStorage
        localStorage.setItem('hr_pro_logged_in', 'true');
        router.push('/');
      } else {
        toast.error('Login Gagal', {
          description: 'Email atau password salah.',
        });
        setIsLoading(false);
      }
    }, 1200);
  };

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-slate-950">
      
      {/* Left side: Premium Branding Column */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-emerald-600 to-green-800 relative items-center justify-center p-12 overflow-hidden">
        {/* Decorative background grid pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-green-500/20 via-transparent to-transparent opacity-60" />
        <div className="absolute top-0 left-0 right-0 bottom-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-30" />
        
        <div className="relative space-y-6 max-w-md text-white z-10">
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="w-14 h-14 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl flex items-center justify-center shadow-lg"
          >
            <Hexagon className="w-8 h-8 text-white" />
          </motion.div>
          
          <div className="space-y-2">
            <motion.h1 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-4xl font-extrabold tracking-tight"
            >
              {APP_NAME}
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-lg text-emerald-100 font-medium"
            >
              Portal Administrasi Internal {COMPANY_NAME}
            </motion.p>
          </div>
          
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.8 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="text-sm text-slate-100/80 leading-relaxed"
          >
            Sistem informasi terintegrasi untuk pengelolaan data karyawan, monitoring kehadiran real-time, kalkulasi penggajian otomatis, dan modul izin cuti terpusat.
          </motion.p>

          {/* Decorative stats snippet */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="pt-6 border-t border-white/20 grid grid-cols-3 gap-4"
          >
            <div>
              <p className="text-2xl font-bold">100%</p>
              <p className="text-[10px] text-emerald-200 uppercase font-semibold">Paperless</p>
            </div>
            <div>
              <p className="text-2xl font-bold">Auto</p>
              <p className="text-[10px] text-emerald-200 uppercase font-semibold">Payroll</p>
            </div>
            <div>
              <p className="text-2xl font-bold">GPS</p>
              <p className="text-[10px] text-emerald-200 uppercase font-semibold">Presence</p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right side: Login Form Column */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12">
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md space-y-8"
        >
          <div className="flex flex-col items-center lg:items-start text-center lg:text-left space-y-2">
            <div className="lg:hidden w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center mb-2">
              <Hexagon className="w-6 h-6 text-emerald-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Selamat Datang Kembali</h2>
            <p className="text-sm text-slate-500">Silakan login untuk mengakses dashboard HRD Anda</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs font-semibold">Alamat Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  id="email"
                  type="email"
                  required
                  placeholder="hrd@benuagreenenergy.co.id"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 h-10 rounded-xl bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <Label htmlFor="password" className="text-xs font-semibold">Password</Label>
                <a href="#" className="text-xs text-emerald-600 hover:text-emerald-700 font-medium">Lupa Password?</a>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10 h-10 rounded-xl bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember me checkbox */}
            <div className="flex items-center space-x-2">
              <input
                id="remember"
                type="checkbox"
                defaultChecked
                className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
              />
              <label htmlFor="remember" className="text-xs text-slate-500 font-medium select-none cursor-pointer">
                Ingat saya di perangkat ini
              </label>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-11 rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white font-semibold shadow-lg shadow-emerald-500/20 btn-premium flex items-center justify-center"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                'Masuk Ke Portal'
              )}
            </Button>
          </form>

          {/* Footer note */}
          <div className="text-center text-[11px] text-slate-450 dark:text-slate-500">
            &copy; {new Date().getFullYear()} {COMPANY_NAME}. All rights reserved.
          </div>
        </motion.div>
      </div>

    </div>
  );
}
