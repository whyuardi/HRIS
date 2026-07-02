'use client';

import { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { monthlyAttendanceStats } from '@/lib/data/attendance';
import { divisions } from '@/lib/data/divisions';
import { dbGetAttendance, dbSaveAttendance, dbGetEmployees } from '@/lib/db';
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
  Search, Download, Clock, UserCheck, AlertTriangle, Home, CalendarOff, FileWarning, Filter, ClipboardList, CalendarDays, MapPin, RefreshCw, CheckCircle2
} from 'lucide-react';
import { AttendanceStatus } from '@/types';

export default function AttendancePage() {
  const [search, setSearch] = useState('');
  const [divisionFilter, setDivisionFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [attendanceList, setAttendanceList] = useState<any[]>([]);

  useEffect(() => {
    setAttendanceList(dbGetAttendance());
  }, []);

  // Dialog input states
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedEmpId, setSelectedEmpId] = useState('');
  const [checkInTime, setCheckInTime] = useState('08:00');
  const [checkOutTime, setCheckOutTime] = useState('17:00');
  const [attStatus, setAttStatus] = useState<AttendanceStatus>('hadir');
  const [attNote, setAttNote] = useState('');

  // GPS Simulation states
  const [isGpsLoading, setIsGpsLoading] = useState(false);
  const [gpsCoords, setGpsCoords] = useState('-6.2088, 106.8456');
  const [gpsLocation, setGpsLocation] = useState('PT. Benua Green Energy HQ, Jakarta');

  const activeEmployees = useMemo(() => {
    return dbGetEmployees().filter(e => e.status === 'active' || e.status === 'probation');
  }, [attendanceList]);

  // Simulate GPS coordinates retrieval on status change
  useEffect(() => {
    if (!isDialogOpen) return;
    
    setIsGpsLoading(true);
    const timer = setTimeout(() => {
      setIsGpsLoading(false);
      if (attStatus === 'wfh') {
        setGpsCoords('-6.2297, 106.6621');
        setGpsLocation('Rumah Karyawan (WFH Geofence Terdeteksi)');
      } else if (attStatus === 'hadir' || attStatus === 'terlambat') {
        setGpsCoords('-6.2088, 106.8456');
        setGpsLocation('PT. Benua Green Energy HQ, Sudirman Jakarta');
      } else {
        setGpsCoords('—');
        setGpsLocation('Presensi Tanpa Lokasi (Dinas/Izin/Cuti)');
      }
    }, 600);

    return () => clearTimeout(timer);
  }, [attStatus, isDialogOpen]);

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
    { label: 'Total', value: summary.total, icon: UserCheck, gradient: 'from-blue-500 to-indigo-600', bg: 'bg-blue-50 dark:bg-blue-950/30', text: 'text-blue-600 dark:text-blue-400' },
    { label: 'Hadir', value: summary.hadir, icon: UserCheck, gradient: 'from-emerald-500 to-green-600', bg: 'bg-emerald-50 dark:bg-emerald-950/30', text: 'text-emerald-600 dark:text-emerald-400' },
    { label: 'Terlambat', value: summary.terlambat, icon: AlertTriangle, gradient: 'from-amber-500 to-orange-600', bg: 'bg-amber-50 dark:bg-amber-950/30', text: 'text-amber-600 dark:text-amber-400' },
    { label: 'WFH', value: summary.wfh, icon: Home, gradient: 'from-indigo-500 to-violet-600', bg: 'bg-indigo-50 dark:bg-indigo-950/30', text: 'text-indigo-600 dark:text-indigo-400' },
    { label: 'Izin', value: summary.izin, icon: FileWarning, gradient: 'from-violet-500 to-purple-600', bg: 'bg-violet-50 dark:bg-violet-950/30', text: 'text-violet-600 dark:text-violet-400' },
    { label: 'Cuti', value: summary.cuti, icon: CalendarOff, gradient: 'from-cyan-500 to-teal-600', bg: 'bg-cyan-50 dark:bg-cyan-950/30', text: 'text-cyan-600 dark:text-cyan-400' },
    { label: 'Tidak Hadir', value: summary.tidak_hadir, icon: Clock, gradient: 'from-rose-500 to-red-600', bg: 'bg-rose-50 dark:bg-rose-950/30', text: 'text-rose-600 dark:text-rose-400' },
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

  const handleSaveAttendance = () => {
    if (!selectedEmpId) {
      toast.error('Pilih karyawan terlebih dahulu');
      return;
    }

    const activeEmps = dbGetEmployees();
    const emp = activeEmps.find(e => e.id === selectedEmpId);
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

    dbSaveAttendance(newRecord);

    if (existingIdx >= 0) {
      const updated = [...attendanceList];
      updated[existingIdx] = newRecord;
      setAttendanceList(updated);
    } else {
      setAttendanceList([newRecord, ...attendanceList]);
    }

    setSelectedEmpId('');
    setCheckInTime('08:00');
    setCheckOutTime('17:00');
    setAttStatus('hadir');
    setAttNote('');
    setIsDialogOpen(false);

    toast.success('Absensi berhasil dicatat', {
      description: `${emp.name} — ${attStatus === 'hadir' ? 'Hadir' : attStatus === 'terlambat' ? 'Terlambat' : attStatus === 'wfh' ? 'WFH' : attStatus === 'izin' ? 'Izin' : attStatus === 'cuti' ? 'Cuti' : 'Tidak Hadir'}`,
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Absensi"
        description="Monitoring & pencatatan kehadiran karyawan hari ini"
      >
        <Button variant="outline" size="sm" className="gap-2 text-xs print-visible" onClick={() => {
          toast.success('Mempersiapkan rekap absensi PDF...', {
            description: 'Gunakan dialog cetak browser dan pilih "Simpan sebagai PDF" (Save as PDF).',
          });
          setTimeout(() => {
            window.print();
          }, 500);
        }}>
          <Download className="w-4 h-4" /> Export PDF
        </Button>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger className="inline-flex items-center justify-center gap-2 rounded-xl text-xs font-semibold h-9 px-4 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white transition-all duration-200 btn-premium cursor-pointer shadow-lg shadow-emerald-500/20">
            <ClipboardList className="w-4 h-4" /> Input Absensi
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 shadow-lg shadow-emerald-500/20">
                  <ClipboardList className="w-5 h-5 text-white" />
                </div>
                <div>
                  <DialogTitle className="text-base">Input Kehadiran Karyawan</DialogTitle>
                  <DialogDescription className="text-xs mt-0.5">
                    Catat absensi untuk karyawan hari ini.
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>
            <div className="space-y-4 py-3">
              {/* Employee Select */}
              <div className="space-y-1.5">
                <Label htmlFor="employee" className="text-xs font-medium">Pilih Karyawan <span className="text-rose-500">*</span></Label>
                <Select value={selectedEmpId} onValueChange={(v) => v && setSelectedEmpId(v)}>
                  <SelectTrigger className="w-full h-9 text-sm">
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
                <div className="space-y-1.5">
                  <Label htmlFor="status" className="text-xs font-medium">Status Kehadiran</Label>
                  <Select value={attStatus} onValueChange={(v) => v && setAttStatus(v as AttendanceStatus)}>
                    <SelectTrigger className="w-full h-9 text-sm">
                      <SelectValue placeholder="Pilih Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hadir">✅ Hadir</SelectItem>
                      <SelectItem value="terlambat">⚠️ Terlambat</SelectItem>
                      <SelectItem value="wfh">🏠 WFH</SelectItem>
                      <SelectItem value="izin">📝 Izin</SelectItem>
                      <SelectItem value="cuti">🏖️ Cuti</SelectItem>
                      <SelectItem value="tidak_hadir">❌ Tidak Hadir</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="date" className="text-xs font-medium flex items-center gap-1.5"><CalendarDays className="w-3 h-3" /> Tanggal</Label>
                  <Input id="date" type="text" readOnly defaultValue={new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })} className="h-9 text-sm bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800" />
                </div>
              </div>

              {attStatus !== 'tidak_hadir' && attStatus !== 'cuti' && attStatus !== 'izin' && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="checkIn" className="text-xs font-medium flex items-center gap-1.5"><Clock className="w-3 h-3 text-emerald-500" /> Jam Masuk</Label>
                    <Input id="checkIn" type="time" value={checkInTime} onChange={(e) => setCheckInTime(e.target.value)} className="h-9 text-sm" />
                  </div>
                  {attStatus !== 'wfh' && (
                    <div className="space-y-1.5">
                      <Label htmlFor="checkOut" className="text-xs font-medium flex items-center gap-1.5"><Clock className="w-3 h-3 text-rose-500" /> Jam Pulang</Label>
                      <Input id="checkOut" type="time" value={checkOutTime} onChange={(e) => setCheckOutTime(e.target.value)} className="h-9 text-sm" />
                    </div>
                  )}
                </div>
              )}

              {/* Geolocation Geofence Tracker Card */}
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-150 dark:border-slate-850 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                    <MapPin className="w-3 h-3 text-emerald-600" /> Geofence Geolokasi GPS
                  </span>
                  {isGpsLoading ? (
                    <RefreshCw className="w-3 h-3 text-slate-400 animate-spin" />
                  ) : (
                    (attStatus === 'hadir' || attStatus === 'terlambat' || attStatus === 'wfh') && (
                      <span className="inline-flex items-center gap-1 text-[9px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.5 rounded-md border border-emerald-100 dark:border-emerald-900">
                        Presensi Sah
                      </span>
                    )
                  )}
                </div>
                
                {isGpsLoading ? (
                  <div className="space-y-1.5 py-1">
                    <div className="h-3 w-28 bg-slate-200 dark:bg-slate-800 animate-pulse rounded" />
                    <div className="h-3.5 w-full bg-slate-200 dark:bg-slate-800 animate-pulse rounded" />
                  </div>
                ) : (
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between font-mono text-[10px] text-slate-500">
                      <span>Coordinates:</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-350">{gpsCoords}</span>
                    </div>
                    <div className="flex justify-between text-slate-600 dark:text-slate-400">
                      <span>Radius / Akurasi:</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-300">5 meter (Akurasi Tinggi)</span>
                    </div>
                    <p className="text-[11px] font-semibold text-slate-850 dark:text-slate-250 mt-1 truncate">
                      {gpsLocation}
                    </p>
                  </div>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="note" className="text-xs font-medium">Keterangan / Catatan</Label>
                <Textarea id="note" placeholder="Alasan terlambat, detail izin/cuti..." value={attNote} onChange={(e) => setAttNote(e.target.value)} className="text-sm min-h-[70px]" />
              </div>
            </div>
            <DialogFooter>
              <div className="flex gap-3 w-full">
                <Button variant="outline" className="flex-1 text-xs h-10 rounded-xl" onClick={() => setIsDialogOpen(false)}>Batal</Button>
                <Button className="flex-1 text-xs h-10 rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white btn-premium shadow-lg shadow-emerald-500/20" disabled={!selectedEmpId || isGpsLoading} onClick={handleSaveAttendance}>
                  <UserCheck className="w-4 h-4 mr-1.5" /> Simpan Kehadiran
                </Button>
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
              <Card className="border-slate-200/60 dark:border-slate-800/60 overflow-hidden card-hover-lift">
                <div className={`h-1 bg-gradient-to-r ${stat.gradient}`} />
                <CardContent className="p-3 text-center pt-3">
                  <div className={`inline-flex p-2 rounded-xl ${stat.bg} mb-2`}>
                    <Icon className={`w-4 h-4 ${stat.text}`} />
                  </div>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">{stat.value}</p>
                  <p className="text-[10px] text-slate-500 uppercase tracking-wider mt-0.5 font-medium">{stat.label}</p>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

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
            <Select value={divisionFilter} onValueChange={(v) => v && setDivisionFilter(v)}>
              <SelectTrigger className="w-full sm:w-44 h-9 text-xs rounded-xl">
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
              <SelectTrigger className="w-full sm:w-36 h-9 text-xs rounded-xl">
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
      <Card className="border-slate-200/60 dark:border-slate-800/60 overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50/80 dark:bg-slate-900/50">
                <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Karyawan</TableHead>
                <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Divisi</TableHead>
                <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Check In</TableHead>
                <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Check Out</TableHead>
                <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Jam Kerja</TableHead>
                <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Status</TableHead>
                <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 hidden lg:table-cell">Keterangan</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.map((att) => (
                <TableRow key={att.id} className="table-row-hover">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="w-7 h-7 ring-2 ring-white dark:ring-slate-800 shadow-sm">
                        <AvatarImage src={`https://api.dicebear.com/9.x/notionists/svg?seed=${att.employeeName.split(' ')[0]}`} />
                        <AvatarFallback className="text-[9px] bg-emerald-100 text-emerald-700 font-semibold">{att.employeeName.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}</AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium text-slate-900 dark:text-white">{att.employeeName}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-xs text-slate-500">{att.division.split(' ')[0]}</TableCell>
                  <TableCell className="text-xs font-mono text-slate-700 dark:text-slate-300">{att.checkIn || '—'}</TableCell>
                  <TableCell className="text-xs font-mono text-slate-700 dark:text-slate-300">{att.checkOut || '—'}</TableCell>
                  <TableCell className="text-xs font-mono text-slate-700 dark:text-slate-300">{att.workHours > 0 ? `${att.workHours}h` : '—'}</TableCell>
                  <TableCell><StatusBadge status={att.status} /></TableCell>
                  <TableCell className="text-xs text-slate-500 hidden lg:table-cell">{att.note || '—'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Chart */}
      <AttendanceChart />

      {/* Monthly Attendance History */}
      <Card className="border-slate-200/60 dark:border-slate-800/60">
        <div className="p-5 border-b border-slate-100 dark:border-slate-800">
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <CalendarDays className="w-4 h-4 text-emerald-600" />
            Ringkasan Absensi Bulanan
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">Rekap kehadiran per karyawan bulan ini</p>
        </div>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {(() => {
              // Group attendance by employee
              const empMap = new Map<string, { name: string; hadir: number; terlambat: number; izin: number; sakit: number; alpha: number; total: number }>();
              attendanceList.forEach((att: any) => {
                if (!empMap.has(att.employeeName)) {
                  empMap.set(att.employeeName, { name: att.employeeName, hadir: 0, terlambat: 0, izin: 0, sakit: 0, alpha: 0, total: 0 });
                }
                const emp = empMap.get(att.employeeName)!;
                emp.total++;
                if (att.status === 'hadir' || att.status === 'wfh') emp.hadir++;
                else if (att.status === 'terlambat') emp.terlambat++;
                else if (att.status === 'izin' || att.status === 'cuti' || att.status === 'dinas') emp.izin++;
                else if (att.status === 'sakit') emp.sakit++;
                else emp.alpha++;
              });

              return Array.from(empMap.values()).slice(0, 9).map((emp) => {
                const attendanceRate = emp.total > 0 ? Math.round(((emp.hadir + emp.terlambat) / emp.total) * 100) : 0;
                return (
                  <motion.div
                    key={emp.name}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800/50"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{emp.name}</p>
                      <span className={`text-xs font-bold ${attendanceRate >= 90 ? 'text-emerald-600' : attendanceRate >= 75 ? 'text-amber-600' : 'text-rose-600'}`}>
                        {attendanceRate}%
                      </span>
                    </div>
                    {/* Mini progress bar */}
                    <div className="flex gap-0.5 h-1.5 rounded-full overflow-hidden mb-2">
                      {emp.hadir > 0 && <div className="bg-emerald-500" style={{ flex: emp.hadir }} />}
                      {emp.terlambat > 0 && <div className="bg-amber-500" style={{ flex: emp.terlambat }} />}
                      {emp.izin > 0 && <div className="bg-blue-500" style={{ flex: emp.izin }} />}
                      {emp.sakit > 0 && <div className="bg-orange-500" style={{ flex: emp.sakit }} />}
                      {emp.alpha > 0 && <div className="bg-red-500" style={{ flex: emp.alpha }} />}
                    </div>
                    <div className="flex items-center gap-3 text-[9px] text-slate-400">
                      <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Hadir {emp.hadir}</span>
                      <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-amber-500" /> Terlambat {emp.terlambat}</span>
                      <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-blue-500" /> Izin {emp.izin}</span>
                      <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-red-500" /> Alpha {emp.alpha}</span>
                    </div>
                  </motion.div>
                );
              });
            })()}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
