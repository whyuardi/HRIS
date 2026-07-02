'use client';

import { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { dbGetPayroll, dbSavePayroll, dbGeneratePayroll, dbGetEmployees, dbGetAttendance } from '@/lib/db';
import { divisions } from '@/lib/data/divisions';
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
import { PayrollChart } from '@/components/charts/payroll-chart';
import {
  Search, Download, Wallet, FileText, Printer, DollarSign,
  TrendingDown, CreditCard, Filter, ChevronLeft, ChevronRight, Banknote, CheckCircle2, AlertTriangle, Hexagon,
} from 'lucide-react';

const ITEMS_PER_PAGE = 10;

function formatCurrency(value: number): string {
  return `Rp ${value.toLocaleString('id-ID')}`;
}

export default function PayrollPage() {
  const [search, setSearch] = useState('');
  const [divisionFilter, setDivisionFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [payrollList, setPayrollList] = useState<any[]>([]);
  
  // Pay states
  const [payTarget, setPayTarget] = useState<any>(null);
  const [payEmpDetails, setPayEmpDetails] = useState<any>(null);

  // Payslip states
  const [selectedSlip, setSelectedSlip] = useState<any>(null);
  const [slipEmpDetails, setSlipEmpDetails] = useState<any>(null);

  useEffect(() => {
    setPayrollList(dbGetPayroll());
  }, []);

  const summary = useMemo(() => {
    return {
      totalGross: payrollList.reduce((sum, p) => sum + p.basicSalary + p.allowance + p.bonus + p.overtime, 0),
      totalNet: payrollList.reduce((sum, p) => sum + p.netSalary, 0),
      totalDeduction: payrollList.reduce((sum, p) => sum + p.deduction + p.attendanceDeduction + p.bpjs + p.pph, 0),
      totalAllowance: payrollList.reduce((sum, p) => sum + p.allowance, 0),
      paid: payrollList.filter(p => p.status === 'paid').length,
      pending: payrollList.filter(p => p.status === 'pending').length,
      draft: payrollList.filter(p => p.status === 'draft').length,
    };
  }, [payrollList]);

  const stats = [
    { label: 'Total Gaji Bersih', value: formatCurrency(summary.totalNet), icon: Wallet, gradient: 'from-emerald-500 to-green-600', bg: 'bg-emerald-50 dark:bg-emerald-950/30', text: 'text-emerald-600 dark:text-emerald-400' },
    { label: 'Total Tunjangan', value: formatCurrency(summary.totalAllowance), icon: CreditCard, gradient: 'from-blue-500 to-indigo-600', bg: 'bg-blue-50 dark:bg-blue-950/30', text: 'text-blue-600 dark:text-blue-400' },
    { label: 'Total Potongan', value: formatCurrency(summary.totalDeduction), icon: TrendingDown, gradient: 'from-rose-500 to-red-600', bg: 'bg-rose-50 dark:bg-rose-950/30', text: 'text-rose-600 dark:text-rose-400' },
    { label: 'Sudah Dibayar', value: `${summary.paid} / ${payrollList.length}`, icon: DollarSign, gradient: 'from-emerald-500 to-teal-600', bg: 'bg-emerald-50 dark:bg-emerald-950/30', text: 'text-emerald-600 dark:text-emerald-400' },
  ];

  const handleGeneratePayroll = () => {
    dbGeneratePayroll('Juni 2026');
    setPayrollList(dbGetPayroll());
    toast.success('Payroll berhasil digenerate', {
      description: 'Payroll untuk periode Juni 2026 telah dibuat untuk seluruh karyawan aktif.',
    });
  };

  const openPayDialog = (item: any) => {
    const emps = dbGetEmployees();
    const emp = emps.find(e => e.id === item.employeeId);
    setPayTarget(item);
    setPayEmpDetails(emp || null);
  };

  const handleConfirmPay = () => {
    if (!payTarget) return;
    payTarget.status = 'paid';
    payTarget.transferDate = new Date().toISOString().split('T')[0];
    dbSavePayroll(payTarget);
    setPayrollList(dbGetPayroll());
    
    const bankInfo = payEmpDetails 
      ? `Transfer ke ${payEmpDetails.bankName} (${payEmpDetails.bankAccount}) a.n. ${payEmpDetails.bankAccountName}`
      : 'Transfer ke rekening karyawan';

    toast.success('Pembayaran gaji berhasil', {
      description: `${payTarget.employeeName} — ${formatCurrency(payTarget.netSalary)}. ${bankInfo}`,
    });

    setPayTarget(null);
    setPayEmpDetails(null);
  };

  const openSlipDialog = (item: any) => {
    const emps = dbGetEmployees();
    const emp = emps.find(e => e.id === item.employeeId);
    setSelectedSlip(item);
    setSlipEmpDetails(emp || null);
  };

  const handlePrintSlip = () => {
    window.print();
  };

  const filteredData = useMemo(() => {
    return payrollList.filter(item => {
      const matchSearch = search === '' ||
        item.employeeName.toLowerCase().includes(search.toLowerCase());
      const matchDivision = divisionFilter === 'all' || item.division === divisions.find(d => d.id === divisionFilter)?.name;
      const matchStatus = statusFilter === 'all' || item.status === statusFilter;
      return matchSearch && matchDivision && matchStatus;
    });
  }, [search, divisionFilter, statusFilter, payrollList]);

  const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);
  const paginatedData = filteredData.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Payroll"
        description="Pengelolaan gaji dan kompensasi karyawan — Periode Juni 2026"
      >
        <Button variant="outline" size="sm" className="gap-2 text-xs rounded-xl">
          <Printer className="w-4 h-4" /> Cetak Slip Gaji
        </Button>
        <Button variant="outline" size="sm" className="gap-2 text-xs rounded-xl">
          <Download className="w-4 h-4" /> Export Excel
        </Button>
        <Button size="sm" className="gap-2 text-xs rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white cursor-pointer btn-premium shadow-lg shadow-emerald-500/20" onClick={handleGeneratePayroll}>
          <Wallet className="w-4 h-4" /> Generate Payroll
        </Button>
      </PageHeader>

      {/* Pay Confirmation Dialog */}
      <Dialog open={!!payTarget} onOpenChange={(o) => { if (!o) { setPayTarget(null); setPayEmpDetails(null); } }}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <div className="flex flex-col items-center text-center gap-3 pt-2">
              <div className="p-3 rounded-full bg-emerald-50 dark:bg-emerald-950/30">
                <Banknote className="w-8 h-8 text-emerald-600" />
              </div>
              <div>
                <DialogTitle className="text-base">Konfirmasi Pembayaran</DialogTitle>
                <DialogDescription className="text-xs mt-1.5">
                  Proses pembayaran gaji sebesar <strong className="text-slate-700 dark:text-slate-300">{payTarget ? formatCurrency(payTarget.netSalary) : ''}</strong> untuk <strong className="text-slate-700 dark:text-slate-300">{payTarget?.employeeName}</strong>?
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          {payEmpDetails && (
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 space-y-1.5 text-sm">
              <p className="text-[10px] text-slate-500 uppercase tracking-wider font-medium">Detail Rekening Tujuan</p>
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-emerald-600" />
                <span className="font-semibold text-slate-900 dark:text-white">{payEmpDetails.bankName} — {payEmpDetails.bankAccount}</span>
              </div>
              <p className="text-xs text-slate-500">a.n. {payEmpDetails.bankAccountName}</p>
            </div>
          )}
          <DialogFooter className="mt-2">
            <div className="flex gap-3 w-full">
              <Button variant="outline" className="flex-1 text-xs h-10 rounded-xl" onClick={() => { setPayTarget(null); setPayEmpDetails(null); }}>Batal</Button>
              <Button className="flex-1 text-xs h-10 rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white btn-premium shadow-lg shadow-emerald-500/20" onClick={handleConfirmPay}>
                <CheckCircle2 className="w-4 h-4 mr-1.5" /> Gaji Dibayar
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Slip Gaji Preview Dialog */}
      <Dialog open={!!selectedSlip} onOpenChange={(o) => { if (!o) { setSelectedSlip(null); setSlipEmpDetails(null); } }}>
        <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto print:max-h-none print:overflow-visible">
          <DialogHeader className="print:hidden">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 shadow-lg shadow-emerald-500/20">
                <Printer className="w-5 h-5 text-white" />
              </div>
              <div>
                <DialogTitle className="text-base">Pratinjau Slip Gaji</DialogTitle>
                <DialogDescription className="text-xs mt-0.5">
                  Rincian slip gaji formal untuk periode {selectedSlip?.period || 'Juni 2026'}.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {selectedSlip && (
            <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-6 text-slate-800 dark:text-slate-200">
              
              {/* Slip Header */}
              <div className="flex justify-between items-start border-b border-slate-100 dark:border-slate-800 pb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-md">
                    <Hexagon className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-slate-900 dark:text-white">PT. Benua Green Energy</h2>
                    <p className="text-[9px] text-slate-400">Green & Sustainable Energy Solutions</p>
                  </div>
                </div>
                <div className="text-right">
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white">SLIP GAJI KARYAWAN</h3>
                  <p className="text-[10px] text-slate-500 font-medium">Periode: {selectedSlip.period}</p>
                </div>
              </div>

              {/* Employee Information */}
              <div className="grid grid-cols-2 gap-y-2 text-xs">
                <div>
                  <span className="text-[9px] text-slate-400 uppercase tracking-wider font-semibold">Nama Karyawan</span>
                  <p className="font-semibold text-slate-900 dark:text-white">{selectedSlip.employeeName}</p>
                </div>
                <div>
                  <span className="text-[9px] text-slate-400 uppercase tracking-wider font-semibold">Nomor Induk Karyawan</span>
                  <p className="font-mono text-slate-700 dark:text-slate-300 font-semibold">{slipEmpDetails?.nik || '—'}</p>
                </div>
                <div>
                  <span className="text-[9px] text-slate-400 uppercase tracking-wider font-semibold">Divisi / Jabatan</span>
                  <p className="font-medium text-slate-800 dark:text-slate-300">{selectedSlip.division} / {slipEmpDetails?.position || '—'}</p>
                </div>
                <div>
                  <span className="text-[9px] text-slate-400 uppercase tracking-wider font-semibold">Rekening Penerima</span>
                  <p className="font-medium text-slate-800 dark:text-slate-300">
                    {slipEmpDetails?.bankName ? `${slipEmpDetails.bankName} — ${slipEmpDetails.bankAccount}` : '—'}
                  </p>
                </div>
              </div>

              {/* Salary Details Table */}
              <div className="grid grid-cols-2 gap-4 text-xs pt-2">
                {/* Receipts */}
                <div className="space-y-2">
                  <div className="font-bold text-slate-900 dark:text-white pb-1.5 border-b border-slate-100 dark:border-slate-800 flex justify-between">
                    <span>Penerimaan</span>
                    <span className="text-[10px] text-slate-400 font-normal">Amount</span>
                  </div>
                  <div className="space-y-1.5 font-medium text-slate-600 dark:text-slate-400">
                    <div className="flex justify-between">
                      <span>Gaji Pokok</span>
                      <span className="font-mono text-slate-800 dark:text-slate-200">{formatCurrency(selectedSlip.basicSalary)}</span>
                    </div>
                    <div className="flex justify-between text-green-600">
                      <span>Tunjangan</span>
                      <span className="font-mono">{formatCurrency(selectedSlip.allowance)}</span>
                    </div>
                    {selectedSlip.bonus > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>Bonus</span>
                        <span className="font-mono">{formatCurrency(selectedSlip.bonus)}</span>
                      </div>
                    )}
                    {selectedSlip.overtime > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>Lembur</span>
                        <span className="font-mono">{formatCurrency(selectedSlip.overtime)}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Deductions */}
                <div className="space-y-2">
                  <div className="font-bold text-slate-900 dark:text-white pb-1.5 border-b border-slate-100 dark:border-slate-800 flex justify-between">
                    <span>Potongan</span>
                    <span className="text-[10px] text-slate-400 font-normal">Amount</span>
                  </div>
                  <div className="space-y-1.5 font-medium text-slate-600 dark:text-slate-400">
                    {selectedSlip.deduction + selectedSlip.attendanceDeduction > 0 && (
                      <div className="flex justify-between text-rose-500">
                        <span>Ketidakhadiran</span>
                        <span className="font-mono">-{formatCurrency(selectedSlip.deduction + selectedSlip.attendanceDeduction)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-rose-500">
                      <span>BPJS Ketenagakerjaan</span>
                      <span className="font-mono">-{formatCurrency(selectedSlip.bpjs)}</span>
                    </div>
                    <div className="flex justify-between text-rose-500">
                      <span>PPh 21 Pajak</span>
                      <span className="font-mono">-{formatCurrency(selectedSlip.pph)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Total Calculation */}
              <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 flex justify-between items-center text-xs">
                <div>
                  <p className="text-[10px] text-emerald-600 dark:text-emerald-400 uppercase tracking-wider font-bold">Total Gaji Bersih (Net Take Home Pay)</p>
                  <p className="text-[9px] text-slate-400 mt-0.5">Sudah ditransfer pada {selectedSlip.transferDate ? new Date(selectedSlip.transferDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '—'}</p>
                </div>
                <span className="text-base font-extrabold text-emerald-700 dark:text-emerald-300 font-mono">
                  {formatCurrency(selectedSlip.netSalary)}
                </span>
              </div>

              {/* Signatures */}
              <div className="grid grid-cols-2 gap-4 text-center text-[10px] text-slate-400 pt-4">
                <div>
                  <p>Penerima,</p>
                  <div className="h-12" />
                  <p className="font-semibold text-slate-700 dark:text-slate-300 underline">{selectedSlip.employeeName}</p>
                </div>
                <div>
                  <p>HRD PT. Benua Green Energy,</p>
                  <div className="h-12" />
                  <p className="font-semibold text-slate-700 dark:text-slate-300 underline">Ahmad Wijaya</p>
                </div>
              </div>

            </div>
          )}

          <DialogFooter className="print:hidden">
            <div className="flex gap-3 w-full">
              <Button variant="outline" className="flex-1 text-xs h-10 rounded-xl" onClick={() => { setSelectedSlip(null); setSlipEmpDetails(null); }}>Tutup</Button>
              <Button className="flex-1 text-xs h-10 rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white btn-premium shadow-lg shadow-emerald-500/20" onClick={handlePrintSlip}>
                <Printer className="w-4 h-4 mr-1.5" /> Cetak Slip Gaji
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <Card className="border-slate-200/60 dark:border-slate-800/60 overflow-hidden card-hover-lift">
                <div className={`h-1 bg-gradient-to-r ${stat.gradient}`} />
                <CardContent className="p-4 pt-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1 font-medium">{stat.label}</p>
                      <p className="text-lg font-bold text-slate-900 dark:text-white">{stat.value}</p>
                    </div>
                    <div className={`p-2 rounded-xl ${stat.bg}`}>
                      <Icon className={`w-4 h-4 ${stat.text}`} />
                    </div>
                  </div>
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
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="pl-10 h-9 text-sm bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-xl"
              />
            </div>
            <Select value={divisionFilter} onValueChange={(v) => { if (v) { setDivisionFilter(v); setPage(1); } }}>
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
            <Select value={statusFilter} onValueChange={(v) => { if (v) { setStatusFilter(v); setPage(1); } }}>
              <SelectTrigger className="w-full sm:w-36 h-9 text-xs rounded-xl">
                <SelectValue placeholder="Semua Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Status</SelectItem>
                <SelectItem value="paid">Lunas</SelectItem>
                <SelectItem value="pending">Menunggu</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Payroll Table */}
      <Card className="border-slate-200/60 dark:border-slate-800/60 overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50/80 dark:bg-slate-900/50">
                <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Nama</TableHead>
                <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 text-right">Gaji Pokok</TableHead>
                <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 text-right hidden lg:table-cell">Tunjangan</TableHead>
                <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 text-right hidden lg:table-cell">Bonus</TableHead>
                <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 text-right hidden xl:table-cell">Lembur</TableHead>
                <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 text-right hidden xl:table-cell">Potongan</TableHead>
                <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 text-right hidden xl:table-cell">BPJS</TableHead>
                <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 text-right hidden xl:table-cell">PPh</TableHead>
                <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 text-right">Gaji Bersih</TableHead>
                <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Status</TableHead>
                <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 text-right hidden lg:table-cell">Transfer</TableHead>
                <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedData.map((item) => (
                <TableRow key={item.id} className="table-row-hover">
                  <TableCell>
                    <div>
                      <p className="text-sm font-medium text-slate-900 dark:text-white">{item.employeeName}</p>
                      <p className="text-[10px] text-slate-500">{item.division.split(' ')[0]}</p>
                    </div>
                  </TableCell>
                  <TableCell className="text-xs text-right font-mono">{formatCurrency(item.basicSalary)}</TableCell>
                  <TableCell className="text-xs text-right font-mono hidden lg:table-cell text-emerald-600">{formatCurrency(item.allowance)}</TableCell>
                  <TableCell className="text-xs text-right font-mono hidden lg:table-cell text-emerald-600">{item.bonus > 0 ? formatCurrency(item.bonus) : '—'}</TableCell>
                  <TableCell className="text-xs text-right font-mono hidden xl:table-cell text-emerald-600">{item.overtime > 0 ? formatCurrency(item.overtime) : '—'}</TableCell>
                  <TableCell className="text-xs text-right font-mono hidden xl:table-cell text-rose-500">{item.deduction + item.attendanceDeduction > 0 ? `-${formatCurrency(item.deduction + item.attendanceDeduction)}` : '—'}</TableCell>
                  <TableCell className="text-xs text-right font-mono hidden xl:table-cell text-rose-500">-{formatCurrency(item.bpjs)}</TableCell>
                  <TableCell className="text-xs text-right font-mono hidden xl:table-cell text-rose-500">-{formatCurrency(item.pph)}</TableCell>
                  <TableCell className="text-sm text-right font-semibold text-slate-900 dark:text-white">{formatCurrency(item.netSalary)}</TableCell>
                  <TableCell><StatusBadge status={item.status} /></TableCell>
                  <TableCell className="text-xs text-right text-slate-500 hidden lg:table-cell">
                    {item.transferDate ? new Date(item.transferDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }) : '—'}
                  </TableCell>
                  <TableCell className="text-right">
                    {item.status !== 'paid' ? (
                      <Button size="sm" variant="outline" className="h-7 text-[10px] text-emerald-600 border-emerald-200 hover:bg-emerald-50 dark:border-emerald-800 dark:hover:bg-emerald-950/30 cursor-pointer rounded-lg" onClick={() => openPayDialog(item)}>
                        <Banknote className="w-3 h-3 mr-1" /> Bayar
                      </Button>
                    ) : (
                      <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-slate-400 hover:text-slate-600 cursor-pointer rounded-lg" onClick={() => openSlipDialog(item)}>
                        <Printer className="w-3.5 h-3.5" />
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 dark:border-slate-800">
          <p className="text-xs text-slate-500">
            {((page - 1) * ITEMS_PER_PAGE) + 1}–{Math.min(page * ITEMS_PER_PAGE, filteredData.length)} dari {filteredData.length}
          </p>
          <div className="flex items-center gap-1">
            <Button variant="outline" size="sm" className="h-8 w-8 p-0 rounded-lg" disabled={page === 1} onClick={() => setPage(p => p - 1)}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
              <Button
                key={p}
                variant={p === page ? 'default' : 'outline'}
                size="sm"
                className={`h-8 w-8 p-0 text-xs rounded-lg ${p === page ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-500/20' : ''}`}
                onClick={() => setPage(p)}
              >
                {p}
              </Button>
            ))}
            <Button variant="outline" size="sm" className="h-8 w-8 p-0 rounded-lg" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </Card>

      {/* Chart */}
      <PayrollChart />

      {/* Payroll History per Month */}
      <Card className="border-slate-200/60 dark:border-slate-800/60">
        <div className="p-5 border-b border-slate-100 dark:border-slate-800">
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Wallet className="w-4 h-4 text-emerald-600" />
            Riwayat Payroll Bulanan
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">Ringkasan pembayaran gaji per bulan</p>
        </div>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {(() => {
              const months = [
                { month: 'Juli 2026', gross: 187500000, net: 156000000, employees: 15, status: 'active' },
                { month: 'Juni 2026', gross: 185000000, net: 154000000, employees: 15, status: 'paid' },
                { month: 'Mei 2026', gross: 182000000, net: 151500000, employees: 14, status: 'paid' },
                { month: 'April 2026', gross: 180000000, net: 150000000, employees: 14, status: 'paid' },
                { month: 'Maret 2026', gross: 178000000, net: 148000000, employees: 13, status: 'paid' },
                { month: 'Februari 2026', gross: 175000000, net: 145000000, employees: 13, status: 'paid' },
              ];
              return months.map((m, i) => (
                <motion.div
                  key={m.month}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className={`p-4 rounded-xl border ${m.status === 'active' ? 'bg-emerald-50/50 dark:bg-emerald-950/10 border-emerald-200 dark:border-emerald-800/30' : 'bg-slate-50 dark:bg-slate-900/50 border-slate-100 dark:border-slate-800/50'}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-bold text-slate-900 dark:text-white">{m.month}</p>
                    <span className={`text-[9px] px-2 py-0.5 rounded-full font-semibold ${m.status === 'active' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-400'}`}>
                      {m.status === 'active' ? 'Periode Aktif' : 'Selesai'}
                    </span>
                  </div>
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Gross</span>
                      <span className="font-semibold text-slate-700 dark:text-slate-300">{formatCurrency(m.gross)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Net</span>
                      <span className="font-bold text-emerald-600">{formatCurrency(m.net)}</span>
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-800/50 mt-1">
                      <span>{m.employees} karyawan</span>
                      <span>Potongan: {formatCurrency(m.gross - m.net)}</span>
                    </div>
                  </div>
                </motion.div>
              ));
            })()}
          </div>
        </CardContent>
      </Card>

      {/* Overtime Calculation Info */}
      <Card className="border-slate-200/60 dark:border-slate-800/60 overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-amber-500 to-orange-600" />
        <div className="p-5 border-b border-slate-100 dark:border-slate-800">
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            Kalkulasi Lembur Otomatis
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">Otomatis dihitung berdasarkan jam kerja di atas 8 jam/hari</p>
        </div>
        <CardContent className="p-4">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50/80 dark:bg-slate-900/50">
                  <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Karyawan</TableHead>
                  <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Jam Kerja</TableHead>
                  <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Jam Normal</TableHead>
                  <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Jam Lembur</TableHead>
                  <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Tarif/Jam</TableHead>
                  <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Total Lembur</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(() => {
                  // Calculate overtime from attendance data
                  const overtimeMap = new Map<string, { name: string; totalHours: number; overtimeHours: number }>();
                  const allAtt = dbGetAttendance();
                  allAtt.forEach((att: any) => {
                    if (att.workHours > 0) {
                      if (!overtimeMap.has(att.employeeName)) {
                        overtimeMap.set(att.employeeName, { name: att.employeeName, totalHours: 0, overtimeHours: 0 });
                      }
                      const emp = overtimeMap.get(att.employeeName)!;
                      emp.totalHours += att.workHours;
                      if (att.workHours > 8) {
                        emp.overtimeHours += (att.workHours - 8);
                      }
                    }
                  });

                  return Array.from(overtimeMap.values())
                    .filter(e => e.overtimeHours > 0)
                    .sort((a, b) => b.overtimeHours - a.overtimeHours)
                    .slice(0, 10)
                    .map(emp => {
                      const ratePerHour = 50000;
                      const totalOvertime = Math.round(emp.overtimeHours * ratePerHour);
                      return (
                        <TableRow key={emp.name} className="table-row-hover">
                          <TableCell className="text-sm font-medium text-slate-900 dark:text-white">{emp.name}</TableCell>
                          <TableCell className="text-xs font-mono text-slate-600 dark:text-slate-400">{emp.totalHours.toFixed(1)}h</TableCell>
                          <TableCell className="text-xs font-mono text-slate-600 dark:text-slate-400">8h/hari</TableCell>
                          <TableCell>
                            <span className="text-xs font-bold text-amber-600">{emp.overtimeHours.toFixed(1)}h</span>
                          </TableCell>
                          <TableCell className="text-xs text-slate-500">{formatCurrency(ratePerHour)}</TableCell>
                          <TableCell>
                            <span className="text-xs font-bold text-emerald-600">{formatCurrency(totalOvertime)}</span>
                          </TableCell>
                        </TableRow>
                      );
                    });
                })()}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
