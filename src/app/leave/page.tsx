'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { leaveRequests, getLeaveSummary } from '@/lib/data/leave';
import { PageHeader } from '@/components/shared/page-header';
import { StatusBadge } from '@/components/shared/status-badge';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
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
  Clock, FileWarning, Briefcase, Filter,
} from 'lucide-react';
import { LeaveRequest } from '@/types';

export default function LeavePage() {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedLeave, setSelectedLeave] = useState<LeaveRequest | null>(null);
  const summary = getLeaveSummary();

  const stats = [
    { label: 'Total Pengajuan', value: summary.total, icon: CalendarDays, color: 'bg-blue-50 text-blue-600 dark:bg-blue-950/30 dark:text-blue-400' },
    { label: 'Menunggu', value: summary.pending, icon: Clock, color: 'bg-amber-50 text-amber-600 dark:bg-amber-950/30 dark:text-amber-400' },
    { label: 'Disetujui', value: summary.approved, icon: CheckCircle2, color: 'bg-green-50 text-green-600 dark:bg-green-950/30 dark:text-green-400' },
    { label: 'Ditolak', value: summary.rejected, icon: XCircle, color: 'bg-red-50 text-red-600 dark:bg-red-950/30 dark:text-red-400' },
    { label: 'Cuti', value: summary.cuti, icon: CalendarDays, color: 'bg-cyan-50 text-cyan-600 dark:bg-cyan-950/30 dark:text-cyan-400' },
    { label: 'Izin', value: summary.izin, icon: FileWarning, color: 'bg-purple-50 text-purple-600 dark:bg-purple-950/30 dark:text-purple-400' },
    { label: 'Sakit', value: summary.sakit, icon: FileWarning, color: 'bg-orange-50 text-orange-600 dark:bg-orange-950/30 dark:text-orange-400' },
    { label: 'Dinas', value: summary.dinas, icon: Briefcase, color: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/30 dark:text-indigo-400' },
  ];

  const filteredData = useMemo(() => {
    return leaveRequests.filter(item => {
      const matchSearch = search === '' ||
        item.employeeName.toLowerCase().includes(search.toLowerCase());
      const matchType = typeFilter === 'all' || item.type === typeFilter;
      const matchStatus = statusFilter === 'all' || item.status === statusFilter;
      return matchSearch && matchType && matchStatus;
    });
  }, [search, typeFilter, statusFilter]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Izin & Cuti"
        description="Kelola pengajuan izin dan cuti karyawan"
      >
        <Button size="sm" className="gap-2 text-xs bg-green-600 hover:bg-green-700 text-white">
          <CalendarPlus className="w-4 h-4" /> Tambah Pengajuan
        </Button>
      </PageHeader>

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
              <Card className="border-gray-200 dark:border-gray-800">
                <CardContent className="p-3 text-center">
                  <div className={`inline-flex p-1.5 rounded-lg ${stat.color} mb-1.5`}>
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                  <p className="text-[9px] text-gray-500 uppercase tracking-wider mt-0.5">{stat.label}</p>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Filters */}
      <Card className="border-gray-200 dark:border-gray-800">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Cari nama karyawan..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 h-9 text-sm bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-800"
              />
            </div>
            <Select value={typeFilter} onValueChange={(v) => v && setTypeFilter(v)}>
              <SelectTrigger className="w-full sm:w-36 h-9 text-xs">
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
              <SelectTrigger className="w-full sm:w-36 h-9 text-xs">
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
      <Card className="border-gray-200 dark:border-gray-800 overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50/50 dark:bg-gray-900/50">
                <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">Nama</TableHead>
                <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">Jenis</TableHead>
                <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">Tanggal</TableHead>
                <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-gray-500 hidden lg:table-cell">Alasan</TableHead>
                <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">Status</TableHead>
                <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-gray-500 hidden lg:table-cell">Approval</TableHead>
                <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-gray-500 text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.map((item) => (
                <TableRow key={item.id} className="table-row-hover group">
                  <TableCell>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{item.employeeName}</p>
                      <p className="text-[10px] text-gray-500">{item.division.split(' ')[0]}</p>
                    </div>
                  </TableCell>
                  <TableCell><StatusBadge status={item.type} /></TableCell>
                  <TableCell className="text-xs text-gray-600 dark:text-gray-400">
                    {new Date(item.startDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                    {item.startDate !== item.endDate && (
                      <> — {new Date(item.endDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}</>
                    )}
                  </TableCell>
                  <TableCell className="text-xs text-gray-500 max-w-48 truncate hidden lg:table-cell">{item.reason}</TableCell>
                  <TableCell><StatusBadge status={item.status} /></TableCell>
                  <TableCell className="text-xs text-gray-500 hidden lg:table-cell">{item.approvedBy || '—'}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-gray-500" onClick={() => setSelectedLeave(item)}>
                        <Eye className="w-3.5 h-3.5" />
                      </Button>
                      {item.status === 'pending' && (
                        <>
                          <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-green-600 hover:text-green-700 hover:bg-green-50">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          </Button>
                          <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-red-500 hover:text-red-600 hover:bg-red-50">
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
            <DialogTitle>Detail Pengajuan</DialogTitle>
            <DialogDescription>
              Pengajuan {selectedLeave?.type} dari {selectedLeave?.employeeName}
            </DialogDescription>
          </DialogHeader>
          {selectedLeave && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Nama</p>
                  <p className="font-medium">{selectedLeave.employeeName}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Divisi</p>
                  <p className="font-medium">{selectedLeave.division}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Jenis</p>
                  <StatusBadge status={selectedLeave.type} />
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Status</p>
                  <StatusBadge status={selectedLeave.status} />
                </div>
                <div className="col-span-2">
                  <p className="text-xs text-gray-500 mb-1">Tanggal</p>
                  <p className="font-medium">
                    {new Date(selectedLeave.startDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                    {selectedLeave.startDate !== selectedLeave.endDate && (
                      <> — {new Date(selectedLeave.endDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</>
                    )}
                  </p>
                </div>
                <div className="col-span-2">
                  <p className="text-xs text-gray-500 mb-1">Alasan</p>
                  <p className="font-medium">{selectedLeave.reason}</p>
                </div>
                {selectedLeave.approvedBy && (
                  <div className="col-span-2">
                    <p className="text-xs text-gray-500 mb-1">Disetujui oleh</p>
                    <p className="font-medium">{selectedLeave.approvedBy}</p>
                  </div>
                )}
              </div>
            </div>
          )}
          <DialogFooter>
            {selectedLeave?.status === 'pending' && (
              <div className="flex gap-2 w-full">
                <Button variant="outline" className="flex-1 gap-2 text-red-600 border-red-200 hover:bg-red-50">
                  <XCircle className="w-4 h-4" /> Tolak
                </Button>
                <Button className="flex-1 gap-2 bg-green-600 hover:bg-green-700 text-white">
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
