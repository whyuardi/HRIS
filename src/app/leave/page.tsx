'use client';

import { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { dbGetLeaveRequests, dbSaveLeaveRequest, dbGetEmployees } from '@/lib/db';
import { PageHeader } from '@/components/shared/page-header';
import { StatusBadge } from '@/components/shared/status-badge';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog';
import {
  Search, CalendarPlus, CheckCircle2, XCircle, Eye, CalendarDays,
  Clock, FileWarning, Briefcase, Filter, AlertTriangle, User,
} from 'lucide-react';
import { LeaveRequest, LeaveType } from '@/types';

export default function LeavePage() {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [leaveList, setLeaveList] = useState<LeaveRequest[]>([]);
  const [selectedLeave, setSelectedLeave] = useState<LeaveRequest | null>(null);
  const [isNewDialogOpen, setIsNewDialogOpen] = useState(false);

  // New leave form
  const [newLeave, setNewLeave] = useState({
    employeeId: '',
    type: 'cuti' as LeaveType,
    startDate: '',
    endDate: '',
    reason: '',
  });

  useEffect(() => {
    setLeaveList(dbGetLeaveRequests());
  }, []);

  const activeEmployees = useMemo(() => {
    return dbGetEmployees().filter(e => e.status === 'active' || e.status === 'probation');
  }, []);

  const summary = useMemo(() => {
    return {
      total: leaveList.length,
      pending: leaveList.filter(l => l.status === 'pending').length,
      approved: leaveList.filter(l => l.status === 'approved').length,
      rejected: leaveList.filter(l => l.status === 'rejected').length,
      cuti: leaveList.filter(l => l.type === 'cuti').length,
      izin: leaveList.filter(l => l.type === 'izin').length,
      sakit: leaveList.filter(l => l.type === 'sakit').length,
      dinas: leaveList.filter(l => l.type === 'dinas').length,
    };
  }, [leaveList]);

  const handleApproveReject = (id: string, newStatus: 'approved' | 'rejected') => {
    const list = dbGetLeaveRequests();
    const request = list.find(r => r.id === id);
    if (!request) return;

    request.status = newStatus;
    request.approvedBy = 'Admin HRD';
    request.approvedDate = new Date().toISOString();

    dbSaveLeaveRequest(request);
    setLeaveList(dbGetLeaveRequests());
    if (selectedLeave && selectedLeave.id === id) {
      setSelectedLeave(null);
    }

    const statusLabel = newStatus === 'approved' ? 'disetujui' : 'ditolak';
    if (newStatus === 'approved') {
      toast.success(`Pengajuan ${statusLabel}`, {
        description: `${request.employeeName} — ${request.type} telah ${statusLabel}.`,
      });
    } else {
      toast.error(`Pengajuan ${statusLabel}`, {
        description: `${request.employeeName} — ${request.type} telah ${statusLabel}.`,
      });
    }
  };

  const handleAddLeave = () => {
    if (!newLeave.employeeId || !newLeave.startDate || !newLeave.endDate || !newLeave.reason) {
      toast.error('Semua field wajib diisi');
      return;
    }

    const emp = activeEmployees.find(e => e.id === newLeave.employeeId);
    if (!emp) return;

    const leaveRequest: LeaveRequest = {
      id: `leave-${Date.now()}`,
      employeeId: emp.id,
      employeeName: emp.name,
      division: emp.division,
      type: newLeave.type,
      startDate: newLeave.startDate,
      endDate: newLeave.endDate,
      reason: newLeave.reason,
      status: 'pending',
      approvedBy: null,
      approvedDate: null,
      createdAt: new Date().toISOString(),
    };

    dbSaveLeaveRequest(leaveRequest);
    setLeaveList(dbGetLeaveRequests());
    setIsNewDialogOpen(false);
    setNewLeave({ employeeId: '', type: 'cuti', startDate: '', endDate: '', reason: '' });
    
    toast.success('Pengajuan berhasil dibuat', {
      description: `${emp.name} — ${newLeave.type} (${newLeave.startDate} s/d ${newLeave.endDate})`,
    });
  };

  const stats = [
    { label: 'Total Pengajuan', value: summary.total, icon: CalendarDays, gradient: 'from-blue-500 to-indigo-600', bg: 'bg-blue-50 dark:bg-blue-950/30', text: 'text-blue-600 dark:text-blue-400' },
    { label: 'Menunggu', value: summary.pending, icon: Clock, gradient: 'from-amber-500 to-orange-600', bg: 'bg-amber-50 dark:bg-amber-950/30', text: 'text-amber-600 dark:text-amber-400' },
    { label: 'Disetujui', value: summary.approved, icon: CheckCircle2, gradient: 'from-emerald-500 to-green-600', bg: 'bg-emerald-50 dark:bg-emerald-950/30', text: 'text-emerald-600 dark:text-emerald-400' },
    { label: 'Ditolak', value: summary.rejected, icon: XCircle, gradient: 'from-rose-500 to-red-600', bg: 'bg-rose-50 dark:bg-rose-950/30', text: 'text-rose-600 dark:text-rose-400' },
    { label: 'Cuti', value: summary.cuti, icon: CalendarDays, gradient: 'from-cyan-500 to-teal-600', bg: 'bg-cyan-50 dark:bg-cyan-950/30', text: 'text-cyan-600 dark:text-cyan-400' },
    { label: 'Izin', value: summary.izin, icon: FileWarning, gradient: 'from-violet-500 to-purple-600', bg: 'bg-violet-50 dark:bg-violet-950/30', text: 'text-violet-600 dark:text-violet-400' },
    { label: 'Sakit', value: summary.sakit, icon: FileWarning, gradient: 'from-orange-500 to-amber-600', bg: 'bg-orange-50 dark:bg-orange-950/30', text: 'text-orange-600 dark:text-orange-400' },
    { label: 'Dinas', value: summary.dinas, icon: Briefcase, gradient: 'from-indigo-500 to-violet-600', bg: 'bg-indigo-50 dark:bg-indigo-950/30', text: 'text-indigo-600 dark:text-indigo-400' },
  ];

  const filteredData = useMemo(() => {
    return leaveList.filter(item => {
      const matchSearch = search === '' ||
        item.employeeName.toLowerCase().includes(search.toLowerCase());
      const matchType = typeFilter === 'all' || item.type === typeFilter;
      const matchStatus = statusFilter === 'all' || item.status === statusFilter;
      return matchSearch && matchType && matchStatus;
    });
  }, [search, typeFilter, statusFilter, leaveList]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Izin & Cuti"
        description="Kelola pengajuan izin dan cuti karyawan"
      >
        <Button size="sm" className="gap-2 text-xs rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white btn-premium shadow-lg shadow-emerald-500/20" onClick={() => setIsNewDialogOpen(true)}>
          <CalendarPlus className="w-4 h-4" /> Tambah Pengajuan
        </Button>
      </PageHeader>

      {/* New Leave Request Dialog */}
      <Dialog open={isNewDialogOpen} onOpenChange={setIsNewDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 shadow-lg shadow-emerald-500/20">
                <CalendarPlus className="w-5 h-5 text-white" />
              </div>
              <div>
                <DialogTitle className="text-base">Pengajuan Izin / Cuti Baru</DialogTitle>
                <DialogDescription className="text-xs mt-0.5">
                  Buat pengajuan baru untuk karyawan.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          <div className="space-y-4 py-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Karyawan <span className="text-rose-500">*</span></Label>
              <Select value={newLeave.employeeId} onValueChange={(v) => v && setNewLeave({ ...newLeave, employeeId: v })}>
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue placeholder="Pilih Karyawan..." />
                </SelectTrigger>
                <SelectContent>
                  {activeEmployees.map(emp => (
                    <SelectItem key={emp.id} value={emp.id}>{emp.name} — {emp.division}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Jenis Pengajuan</Label>
              <Select value={newLeave.type} onValueChange={(v) => v && setNewLeave({ ...newLeave, type: v as LeaveType })}>
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue placeholder="Pilih Jenis" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cuti">🏖️ Cuti Tahunan</SelectItem>
                  <SelectItem value="izin">📝 Izin</SelectItem>
                  <SelectItem value="sakit">🏥 Sakit</SelectItem>
                  <SelectItem value="dinas">💼 Dinas Luar</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Tanggal Mulai <span className="text-rose-500">*</span></Label>
                <Input type="date" value={newLeave.startDate} onChange={(e) => setNewLeave({ ...newLeave, startDate: e.target.value })} className="h-9 text-sm" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Tanggal Selesai <span className="text-rose-500">*</span></Label>
                <Input type="date" value={newLeave.endDate} onChange={(e) => setNewLeave({ ...newLeave, endDate: e.target.value })} className="h-9 text-sm" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Alasan <span className="text-rose-500">*</span></Label>
              <Textarea placeholder="Jelaskan alasan pengajuan..." value={newLeave.reason} onChange={(e) => setNewLeave({ ...newLeave, reason: e.target.value })} className="text-sm min-h-[80px]" />
            </div>
          </div>
          <DialogFooter>
            <div className="flex gap-3 w-full">
              <Button variant="outline" className="flex-1 text-xs h-10 rounded-xl" onClick={() => setIsNewDialogOpen(false)}>Batal</Button>
              <Button className="flex-1 text-xs h-10 rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white btn-premium shadow-lg shadow-emerald-500/20" onClick={handleAddLeave}>
                <CalendarPlus className="w-4 h-4 mr-1.5" /> Ajukan
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.03 }}
            >
              <Card className="border-slate-200/60 dark:border-slate-800/60 overflow-hidden card-hover-lift">
                <div className={`h-1 bg-gradient-to-r ${stat.gradient}`} />
                <CardContent className="p-3 text-center pt-3">
                  <div className={`inline-flex p-1.5 rounded-lg ${stat.bg} mb-1.5`}>
                    <Icon className={`w-3.5 h-3.5 ${stat.text}`} />
                  </div>
                  <p className="text-xl font-bold text-slate-900 dark:text-white">{stat.value}</p>
                  <p className="text-[9px] text-slate-500 uppercase tracking-wider mt-0.5 font-medium">{stat.label}</p>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Visual Leave Calendar */}
      <Card className="border-slate-200/60 dark:border-slate-800/60">
        <div className="p-5 border-b border-slate-100 dark:border-slate-800">
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <CalendarDays className="w-4 h-4 text-emerald-600" />
            Kalender Cuti Bulan Ini
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">Visualisasi jadwal cuti & izin karyawan</p>
        </div>
        <CardContent className="p-4">
          {(() => {
            const now = new Date();
            const year = now.getFullYear();
            const month = now.getMonth();
            const daysInMonth = new Date(year, month + 1, 0).getDate();
            const firstDay = new Date(year, month, 1).getDay();
            const dayNames = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
            const monthName = now.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });

            // Map leave to calendar days
            const leaveDays = new Map<number, { count: number; types: string[] }>();
            leaveList.forEach(leave => {
              if (leave.status !== 'rejected') {
                const start = new Date(leave.startDate);
                const end = new Date(leave.endDate);
                for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
                  if (d.getMonth() === month && d.getFullYear() === year) {
                    const day = d.getDate();
                    if (!leaveDays.has(day)) leaveDays.set(day, { count: 0, types: [] });
                    const entry = leaveDays.get(day)!;
                    entry.count++;
                    if (!entry.types.includes(leave.type)) entry.types.push(leave.type);
                  }
                }
              }
            });

            const cells = [];
            // Empty cells for alignment
            for (let i = 0; i < firstDay; i++) {
              cells.push(<div key={`empty-${i}`} className="h-10" />);
            }
            // Day cells
            for (let day = 1; day <= daysInMonth; day++) {
              const isToday = day === now.getDate();
              const leaveInfo = leaveDays.get(day);
              const hasLeave = !!leaveInfo;
              cells.push(
                <div
                  key={day}
                  className={`h-10 rounded-lg flex flex-col items-center justify-center relative text-xs transition-all ${
                    isToday ? 'bg-emerald-600 text-white font-bold shadow-lg shadow-emerald-500/20' :
                    hasLeave ? 'bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/30' :
                    'hover:bg-slate-50 dark:hover:bg-slate-900/50'
                  }`}
                >
                  <span className={isToday ? 'text-white' : 'text-slate-700 dark:text-slate-300 font-medium'}>{day}</span>
                  {hasLeave && (
                    <div className="flex gap-0.5 mt-0.5">
                      {leaveInfo.types.slice(0, 3).map((type, i) => (
                        <span key={i} className={`w-1 h-1 rounded-full ${
                          type === 'cuti' ? 'bg-cyan-500' : type === 'sakit' ? 'bg-orange-500' : type === 'izin' ? 'bg-violet-500' : 'bg-indigo-500'
                        }`} />
                      ))}
                    </div>
                  )}
                </div>
              );
            }

            return (
              <div>
                <p className="text-sm font-semibold text-center text-slate-900 dark:text-white mb-3">{monthName}</p>
                <div className="grid grid-cols-7 gap-1 mb-1">
                  {dayNames.map(d => (
                    <div key={d} className="h-6 flex items-center justify-center text-[9px] font-semibold text-slate-400 uppercase">{d}</div>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-1">{cells}</div>
                <div className="flex items-center gap-4 mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <span className="flex items-center gap-1.5 text-[9px] text-slate-400"><span className="w-2 h-2 rounded-full bg-cyan-500" /> Cuti</span>
                  <span className="flex items-center gap-1.5 text-[9px] text-slate-400"><span className="w-2 h-2 rounded-full bg-violet-500" /> Izin</span>
                  <span className="flex items-center gap-1.5 text-[9px] text-slate-400"><span className="w-2 h-2 rounded-full bg-orange-500" /> Sakit</span>
                  <span className="flex items-center gap-1.5 text-[9px] text-slate-400"><span className="w-2 h-2 rounded-full bg-indigo-500" /> Dinas</span>
                </div>
              </div>
            );
          })()}
        </CardContent>
      </Card>

      {/* Filters */}
      <Card className="border-slate-200/60 dark:border-slate-800/60">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Cari nama karyawan..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 h-9 text-sm bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-xl"
              />
            </div>
            <Select value={typeFilter} onValueChange={(v) => v && setTypeFilter(v)}>
              <SelectTrigger className="w-full sm:w-36 h-9 text-xs rounded-xl">
                <Filter className="w-3 h-3 mr-1.5" />
                <SelectValue placeholder="Semua Jenis" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Jenis</SelectItem>
                <SelectItem value="cuti">Cuti</SelectItem>
                <SelectItem value="izin">Izin</SelectItem>
                <SelectItem value="sakit">Sakit</SelectItem>
                <SelectItem value="dinas">Dinas Luar</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={(v) => v && setStatusFilter(v)}>
              <SelectTrigger className="w-full sm:w-36 h-9 text-xs rounded-xl">
                <SelectValue placeholder="Semua Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Status</SelectItem>
                <SelectItem value="pending">Menunggu</SelectItem>
                <SelectItem value="approved">Disetujui</SelectItem>
                <SelectItem value="rejected">Ditolak</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="border-slate-200/60 dark:border-slate-800/60 overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50/80 dark:bg-slate-900/50">
                <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Nama</TableHead>
                <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Jenis</TableHead>
                <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Tanggal</TableHead>
                <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 hidden lg:table-cell">Alasan</TableHead>
                <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Status</TableHead>
                <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 hidden lg:table-cell">Approval</TableHead>
                <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.map((item) => (
                <TableRow key={item.id} className="table-row-hover group">
                  <TableCell>
                    <div>
                      <p className="text-sm font-medium text-slate-900 dark:text-white">{item.employeeName}</p>
                      <p className="text-[10px] text-slate-500">{item.division.split(' ')[0]}</p>
                    </div>
                  </TableCell>
                  <TableCell><StatusBadge status={item.type} /></TableCell>
                  <TableCell className="text-xs text-slate-600 dark:text-slate-400">
                    {new Date(item.startDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                    {item.startDate !== item.endDate && (
                      <> — {new Date(item.endDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}</>
                    )}
                  </TableCell>
                  <TableCell className="text-xs text-slate-500 max-w-48 truncate hidden lg:table-cell">{item.reason}</TableCell>
                  <TableCell><StatusBadge status={item.status} /></TableCell>
                  <TableCell className="text-xs text-slate-500 hidden lg:table-cell">{item.approvedBy || '—'}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 rounded-lg" onClick={() => setSelectedLeave(item)}>
                        <Eye className="w-3.5 h-3.5" />
                      </Button>
                      {item.status === 'pending' && (
                        <>
                          <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 rounded-lg" onClick={() => handleApproveReject(item.id, 'approved')}>
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          </Button>
                          <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg" onClick={() => handleApproveReject(item.id, 'rejected')}>
                            <XCircle className="w-3.5 h-3.5" />
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Detail Dialog */}
      <Dialog open={!!selectedLeave} onOpenChange={() => setSelectedLeave(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/20">
                <Eye className="w-5 h-5 text-white" />
              </div>
              <div>
                <DialogTitle className="text-base">Detail Pengajuan</DialogTitle>
                <DialogDescription className="text-xs mt-0.5">
                  Pengajuan {selectedLeave?.type} dari {selectedLeave?.employeeName}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          {selectedLeave && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900">
                  <p className="text-[10px] text-slate-500 mb-1 uppercase tracking-wider font-medium">Nama</p>
                  <p className="font-semibold text-slate-900 dark:text-white text-sm">{selectedLeave.employeeName}</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900">
                  <p className="text-[10px] text-slate-500 mb-1 uppercase tracking-wider font-medium">Divisi</p>
                  <p className="font-semibold text-slate-900 dark:text-white text-sm">{selectedLeave.division}</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900">
                  <p className="text-[10px] text-slate-500 mb-1 uppercase tracking-wider font-medium">Jenis</p>
                  <StatusBadge status={selectedLeave.type} />
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900">
                  <p className="text-[10px] text-slate-500 mb-1 uppercase tracking-wider font-medium">Status</p>
                  <StatusBadge status={selectedLeave.status} />
                </div>
                <div className="col-span-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-900">
                  <p className="text-[10px] text-slate-500 mb-1 uppercase tracking-wider font-medium">Tanggal</p>
                  <p className="font-semibold text-slate-900 dark:text-white text-sm">
                    {new Date(selectedLeave.startDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                    {selectedLeave.startDate !== selectedLeave.endDate && (
                      <> — {new Date(selectedLeave.endDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</>
                    )}
                  </p>
                </div>
                <div className="col-span-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-900">
                  <p className="text-[10px] text-slate-500 mb-1 uppercase tracking-wider font-medium">Alasan</p>
                  <p className="font-medium text-slate-700 dark:text-slate-300 text-sm">{selectedLeave.reason}</p>
                </div>
                {selectedLeave.approvedBy && (
                  <div className="col-span-2 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30">
                    <p className="text-[10px] text-emerald-600 dark:text-emerald-400 mb-1 uppercase tracking-wider font-medium">Disetujui oleh</p>
                    <p className="font-semibold text-emerald-700 dark:text-emerald-300 text-sm">{selectedLeave.approvedBy}</p>
                  </div>
                )}
              </div>
            </div>
          )}
          <DialogFooter>
            {selectedLeave?.status === 'pending' && (
              <div className="flex gap-3 w-full">
                <Button variant="outline" className="flex-1 gap-2 text-xs h-10 rounded-xl text-rose-600 border-rose-200 hover:bg-rose-50 dark:border-rose-800 dark:hover:bg-rose-950/30 btn-premium" onClick={() => handleApproveReject(selectedLeave.id, 'rejected')}>
                  <XCircle className="w-4 h-4" /> Tolak
                </Button>
                <Button className="flex-1 gap-2 text-xs h-10 rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white btn-premium shadow-lg shadow-emerald-500/20" onClick={() => handleApproveReject(selectedLeave.id, 'approved')}>
                  <CheckCircle2 className="w-4 h-4" /> Setujui
                </Button>
              </div>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
