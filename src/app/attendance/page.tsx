'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { todayAttendance, monthlyAttendanceStats } from '@/lib/data/attendance';
import { divisions } from '@/lib/data/divisions';
import { employees } from '@/lib/data/employees';
import { PageHeader } from '@/components/shared/page-header';
import { StatusBadge } from '@/components/shared/status-badge';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger
} from '@/components/ui/dialog';
import { AttendanceChart } from '@/components/charts/attendance-chart';
import {
  Search, Download, Clock, UserCheck, AlertTriangle, Home, CalendarOff, FileWarning, Filter, ClipboardList,
} from 'lucide-react';
import { AttendanceStatus } from '@/types';

export default function AttendancePage() {
  const [search, setSearch] = useState('');
  const [divisionFilter, setDivisionFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Interactive local state for attendance list
  const [attendanceList, setAttendanceList] = useState(todayAttendance);

  // Dialog input states
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedEmpId, setSelectedEmpId] = useState('');
  const [checkInTime, setCheckInTime] = useState('08:00');
  const [checkOutTime, setCheckOutTime] = useState('17:00');
  const [attStatus, setAttStatus] = useState<AttendanceStatus>('hadir');
  const [attNote, setAttNote] = useState('');

  // Only allow check-in for active/probation employees
  const activeEmployees = useMemo(() => {
    return employees.filter(e => e.status === 'active' || e.status === 'probation');
  }, []);

  // Compute live statistics based on state
  const summary = useMemo(() => {
    return {
      total: attendanceList.length,
      hadir: attendanceList.filter(a => a.status === 'hadir').length,
      terlambat: attendanceList.filter(a => a.status === 'terlambat').length,
      wfh: attendanceList.filter(a => a.status === 'wfh').length,
      izin: attendanceList.filter(a => a.status === 'izin').length,
      cuti: attendanceList.filter(a => a.status === 'cuti').length,
      tidak_hadir: attendanceList.filter(a => a.status === 'tidak_hadir').length,
    };
  }, [attendanceList]);

  const stats = [
    { label: 'Total', value: summary.total, icon: UserCheck, color: 'bg-blue-50 text-blue-600 dark:bg-blue-950/30 dark:text-blue-400' },
    { label: 'Hadir', value: summary.hadir, icon: UserCheck, color: 'bg-green-50 text-green-600 dark:bg-green-950/30 dark:text-green-400' },
    { label: 'Terlambat', value: summary.terlambat, icon: AlertTriangle, color: 'bg-amber-50 text-amber-600 dark:bg-amber-950/30 dark:text-amber-400' },
    { label: 'WFH', value: summary.wfh, icon: Home, color: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/30 dark:text-indigo-400' },
    { label: 'Izin', value: summary.izin, icon: FileWarning, color: 'bg-purple-50 text-purple-600 dark:bg-purple-950/30 dark:text-purple-400' },
    { label: 'Cuti', value: summary.cuti, icon: CalendarOff, color: 'bg-cyan-50 text-cyan-600 dark:bg-cyan-950/30 dark:text-cyan-400' },
    { label: 'Tidak Hadir', value: summary.tidak_hadir, icon: Clock, color: 'bg-red-50 text-red-600 dark:bg-red-950/30 dark:text-red-400' },
  ];

  const filteredData = useMemo(() => {
    return attendanceList.filter(att => {
      const matchSearch = search === '' ||
        att.employeeName.toLowerCase().includes(search.toLowerCase());
      const matchDivision = divisionFilter === 'all' || att.division === divisions.find(d => d.id === divisionFilter)?.name;
      const matchStatus = statusFilter === 'all' || att.status === statusFilter;
      return matchSearch && matchDivision && matchStatus;
    });
  }, [search, divisionFilter, statusFilter, attendanceList]);

  // Handle Save/Submit Attendance
  const handleSaveAttendance = () => {
    if (!selectedEmpId) return;

    const emp = employees.find(e => e.id === selectedEmpId);
    if (!emp) return;

    const existingIdx = attendanceList.findIndex(a => a.employeeId === selectedEmpId);

    const hasTime = attStatus !== 'tidak_hadir' && attStatus !== 'cuti' && attStatus !== 'izin';
    const computedCheckIn = hasTime ? checkInTime : null;
    const computedCheckOut = hasTime && attStatus !== 'wfh' ? checkOutTime : (attStatus === 'wfh' ? '17:00' : null);

    let computedWorkHours = 0;
    if (hasTime) {
      const [inH, inM] = checkInTime.split(':').map(Number);
      const [outH, outM] = checkOutTime.split(':').map(Number);
      computedWorkHours = Math.max(0, (outH + outM / 60) - (inH + inM / 60));
    }

    const newRecord = {
      id: existingIdx >= 0 ? attendanceList[existingIdx].id : `att-${Date.now()}`,
      employeeId: emp.id,
      employeeName: emp.name,
      division: emp.division,
      date: new Date().toISOString().split('T')[0],
      checkIn: computedCheckIn,
      checkOut: computedCheckOut,
      workHours: Math.round(computedWorkHours * 10) / 10,
      status: attStatus,
      note: attNote || (attStatus === 'wfh' ? 'Work from home' : ''),
    };

    if (existingIdx >= 0) {
      const updated = [...attendanceList];
      updated[existingIdx] = newRecord;
      setAttendanceList(updated);
    } else {
      setAttendanceList([newRecord, ...attendanceList]);
    }

    // Reset fields
    setSelectedEmpId('');
    setCheckInTime('08:00');
    setCheckOutTime('17:00');
    setAttStatus('hadir');
    setAttNote('');
    setIsDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Absensi"
        description="Monitoring & pencatatan kehadiran karyawan hari ini"
      >
        <Button variant="outline" size="sm" className="gap-2 text-xs">
          <Download className="w-4 h-4" /> Export
        </Button>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger className="inline-flex items-center justify-center gap-2 rounded-lg text-xs font-medium h-9 px-3 bg-green-600 hover:bg-green-700 text-white transition-colors cursor-pointer">
            <ClipboardList className="w-4 h-4" /> Input Absensi
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Input Kehadiran Karyawan</DialogTitle>
              <DialogDescription>
                Catat absensi masuk/pulang, dinas, cuti, atau izin untuk karyawan hari ini.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-3">
              <div className="space-y-2">
                <Label htmlFor="employee" className="text-xs">Pilih Karyawan</Label>
                <Select value={selectedEmpId} onValueChange={(v) => v && setSelectedEmpId(v)}>
                  <SelectTrigger className="h-9 text-sm">
                    <SelectValue placeholder="Pilih Karyawan..." />
                  </SelectTrigger>
                  <SelectContent>
                    {activeEmployees.map(emp => (
                      <SelectItem key={emp.id} value={emp.id}>{emp.name} ({emp.nik})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="status" className="text-xs">Status Kehadiran</Label>
                  <Select value={attStatus} onValueChange={(v) => v && setAttStatus(v as AttendanceStatus)}>
                    <SelectTrigger className="h-9 text-sm">
                      <SelectValue placeholder="Pilih Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hadir">Hadir</SelectItem>
                      <SelectItem value="terlambat">Terlambat</SelectItem>
                      <SelectItem value="wfh">WFH</SelectItem>
                      <SelectItem value="izin">Izin</SelectItem>
                      <SelectItem value="cuti">Cuti</SelectItem>
                      <SelectItem value="tidak_hadir">Tidak Hadir</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="date" className="text-xs">Tanggal</Label>
                  <Input id="date" type="text" readOnly defaultValue={new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })} className="h-9 text-sm bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-800" />
                </div>
              </div>

              {attStatus !== 'tidak_hadir' && attStatus !== 'cuti' && attStatus !== 'izin' && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="checkIn" className="text-xs">Jam Masuk</Label>
                    <Input id="checkIn" type="time" value={checkInTime} onChange={(e) => setCheckInTime(e.target.value)} className="h-9 text-sm" />
                  </div>
                  {attStatus !== 'wfh' && (
                    <div className="space-y-2">
                      <Label htmlFor="checkOut" className="text-xs">Jam Pulang</Label>
                      <Input id="checkOut" type="time" value={checkOutTime} onChange={(e) => setCheckOutTime(e.target.value)} className="h-9 text-sm" />
                    </div>
                  )}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="note" className="text-xs">Keterangan / Catatan</Label>
                <Textarea id="note" placeholder="Alasan terlambat, detail izin/cuti..." value={attNote} onChange={(e) => setAttNote(e.target.value)} className="text-sm min-h-[80px]" />
              </div>
            </div>
            <DialogFooter>
              <div className="flex gap-2 w-full">
                <Button variant="outline" className="flex-1 text-xs" onClick={() => setIsDialogOpen(false)}>Batal</Button>
                <Button className="flex-1 text-xs bg-green-600 hover:bg-green-700 text-white" disabled={!selectedEmpId} onClick={handleSaveAttendance}>Simpan Kehadiran</Button>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </PageHeader>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.04 }}
            >
              <Card className="border-gray-200 dark:border-gray-800">
                <CardContent className="p-3 text-center">
                  <div className={`inline-flex p-2 rounded-lg ${stat.color} mb-2`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                  <p className="text-[10px] text-gray-500 uppercase tracking-wider mt-0.5">{stat.label}</p>
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
            <Select value={divisionFilter} onValueChange={(v) => v && setDivisionFilter(v)}>
              <SelectTrigger className="w-full sm:w-44 h-9 text-xs">
                <Filter className="w-3 h-3 mr-1.5" />
                <SelectValue placeholder="Semua Divisi" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Divisi</SelectItem>
                {divisions.map(d => (
                  <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={(v) => v && setStatusFilter(v)}>
              <SelectTrigger className="w-full sm:w-36 h-9 text-xs">
                <SelectValue placeholder="Semua Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Status</SelectItem>
                <SelectItem value="hadir">Hadir</SelectItem>
                <SelectItem value="terlambat">Terlambat</SelectItem>
                <SelectItem value="wfh">WFH</SelectItem>
                <SelectItem value="izin">Izin</SelectItem>
                <SelectItem value="cuti">Cuti</SelectItem>
                <SelectItem value="tidak_hadir">Tidak Hadir</SelectItem>
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
                <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">Karyawan</TableHead>
                <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">Divisi</TableHead>
                <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">Check In</TableHead>
                <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">Check Out</TableHead>
                <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">Jam Kerja</TableHead>
                <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">Status</TableHead>
                <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-gray-500 hidden lg:table-cell">Keterangan</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.map((att) => (
                <TableRow key={att.id} className="table-row-hover">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="w-7 h-7">
                        <AvatarImage src={`https://api.dicebear.com/9.x/notionists/svg?seed=${att.employeeName.split(' ')[0]}`} />
                        <AvatarFallback className="text-[9px]">{att.employeeName.split(' ').map(n => n[0]).join('').slice(0, 2)}</AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{att.employeeName}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-xs text-gray-500">{att.division.split(' ')[0]}</TableCell>
                  <TableCell className="text-xs font-mono text-gray-700 dark:text-gray-300">{att.checkIn || '—'}</TableCell>
                  <TableCell className="text-xs font-mono text-gray-700 dark:text-gray-300">{att.checkOut || '—'}</TableCell>
                  <TableCell className="text-xs font-mono text-gray-700 dark:text-gray-300">{att.workHours > 0 ? `${att.workHours}h` : '—'}</TableCell>
                  <TableCell><StatusBadge status={att.status} /></TableCell>
                  <TableCell className="text-xs text-gray-500 hidden lg:table-cell">{att.note || '—'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Chart */}
      <AttendanceChart />
    </div>
  );
}
