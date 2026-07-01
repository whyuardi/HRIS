'use client';

import { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { dbGetPayroll, dbSavePayroll, dbGeneratePayroll, dbGetEmployees } from '@/lib/db';
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
import { PayrollChart } from '@/components/charts/payroll-chart';
import {
  Search, Download, Wallet, FileText, Printer, DollarSign,
  TrendingDown, CreditCard, Filter, ChevronLeft, ChevronRight,
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
    { label: 'Total Gaji Bersih', value: formatCurrency(summary.totalNet), icon: Wallet, color: 'from-green-500 to-emerald-600', bg: 'bg-green-50 dark:bg-green-950/30', text: 'text-green-600 dark:text-green-400' },
    { label: 'Total Tunjangan', value: formatCurrency(summary.totalAllowance), icon: CreditCard, color: 'from-blue-500 to-blue-600', bg: 'bg-blue-50 dark:bg-blue-950/30', text: 'text-blue-600 dark:text-blue-400' },
    { label: 'Total Potongan', value: formatCurrency(summary.totalDeduction), icon: TrendingDown, color: 'from-red-500 to-red-600', bg: 'bg-red-50 dark:bg-red-950/30', text: 'text-red-600 dark:text-red-400' },
    { label: 'Sudah Dibayar', value: `${summary.paid} / ${payrollList.length}`, icon: DollarSign, color: 'from-emerald-500 to-green-600', bg: 'bg-emerald-50 dark:bg-emerald-950/30', text: 'text-emerald-600 dark:text-emerald-400' },
  ];

  const handleGeneratePayroll = () => {
    dbGeneratePayroll('Juni 2026');
    setPayrollList(dbGetPayroll());
    alert('Payroll untuk periode Juni 2026 berhasil digenerate untuk seluruh karyawan!');
  };

  const handlePayPayroll = (id: string) => {
    const list = dbGetPayroll();
    const item = list.find(r => r.id === id);
    if (!item) return;

    // Fetch employee bank details
    const emps = dbGetEmployees();
    const emp = emps.find(e => e.id === item.employeeId);

    const bankDetails = emp 
      ? `\n\nTransfer dikirim ke:\nBank: ${emp.bankName}\nNo. Rekening: ${emp.bankAccount}\na.n. ${emp.bankAccountName}`
      : '\n\nTransfer dikirim ke rekening default karyawan.';

    if (confirm(`Apakah Anda yakin ingin memproses pembayaran gaji sebesar ${formatCurrency(item.netSalary)} untuk ${item.employeeName}?${bankDetails}`)) {
      item.status = 'paid';
      item.transferDate = new Date().toISOString().split('T')[0];

      dbSavePayroll(item);
      setPayrollList(dbGetPayroll());
      alert(`Pembayaran Gaji Sukses!${bankDetails}`);
    }
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
        <Button variant="outline" size="sm" className="gap-2 text-xs">
          <Printer className="w-4 h-4" /> Cetak Slip Gaji
        </Button>
        <Button variant="outline" size="sm" className="gap-2 text-xs">
          <Download className="w-4 h-4" /> Export Excel
        </Button>
        <Button size="sm" className="gap-2 text-xs bg-green-600 hover:bg-green-700 text-white cursor-pointer" onClick={handleGeneratePayroll}>
          <Wallet className="w-4 h-4" /> Generate Payroll
        </Button>
      </PageHeader>

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
              <Card className="border-gray-200 dark:border-gray-800 hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">{stat.label}</p>
                      <p className="text-lg font-bold text-gray-900 dark:text-white">{stat.value}</p>
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
      <Card className="border-gray-200 dark:border-gray-800">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Cari nama karyawan..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="pl-10 h-9 text-sm bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-800"
              />
            </div>
            <Select value={divisionFilter} onValueChange={(v) => { if (v) { setDivisionFilter(v); setPage(1); } }}>
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
            <Select value={statusFilter} onValueChange={(v) => { if (v) { setStatusFilter(v); setPage(1); } }}>
              <SelectTrigger className="w-full sm:w-36 h-9 text-xs">
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
      <Card className="border-gray-200 dark:border-gray-800 overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50/50 dark:bg-gray-900/50">
                <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">Nama</TableHead>
                <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-gray-500 text-right">Gaji Pokok</TableHead>
                <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-gray-500 text-right hidden lg:table-cell">Tunjangan</TableHead>
                <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-gray-500 text-right hidden lg:table-cell">Bonus</TableHead>
                <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-gray-500 text-right hidden xl:table-cell">Lembur</TableHead>
                <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-gray-500 text-right hidden xl:table-cell">Potongan</TableHead>
                <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-gray-500 text-right hidden xl:table-cell">BPJS</TableHead>
                <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-gray-500 text-right hidden xl:table-cell">PPh</TableHead>
                <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-gray-500 text-right">Gaji Bersih</TableHead>
                <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">Status</TableHead>
                <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-gray-500 text-right hidden lg:table-cell">Transfer</TableHead>
                <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-gray-500 text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedData.map((item) => (
                <TableRow key={item.id} className="table-row-hover">
                  <TableCell>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{item.employeeName}</p>
                      <p className="text-[10px] text-gray-500">{item.division.split(' ')[0]}</p>
                    </div>
                  </TableCell>
                  <TableCell className="text-xs text-right font-mono">{formatCurrency(item.basicSalary)}</TableCell>
                  <TableCell className="text-xs text-right font-mono hidden lg:table-cell text-green-600">{formatCurrency(item.allowance)}</TableCell>
                  <TableCell className="text-xs text-right font-mono hidden lg:table-cell text-green-600">{item.bonus > 0 ? formatCurrency(item.bonus) : '—'}</TableCell>
                  <TableCell className="text-xs text-right font-mono hidden xl:table-cell text-green-600">{item.overtime > 0 ? formatCurrency(item.overtime) : '—'}</TableCell>
                  <TableCell className="text-xs text-right font-mono hidden xl:table-cell text-red-500">{item.deduction + item.attendanceDeduction > 0 ? `-${formatCurrency(item.deduction + item.attendanceDeduction)}` : '—'}</TableCell>
                  <TableCell className="text-xs text-right font-mono hidden xl:table-cell text-red-500">-{formatCurrency(item.bpjs)}</TableCell>
                  <TableCell className="text-xs text-right font-mono hidden xl:table-cell text-red-500">-{formatCurrency(item.pph)}</TableCell>
                  <TableCell className="text-sm text-right font-semibold text-gray-900 dark:text-white">{formatCurrency(item.netSalary)}</TableCell>
                  <TableCell><StatusBadge status={item.status} /></TableCell>
                  <TableCell className="text-xs text-right text-gray-500 hidden lg:table-cell">
                    {item.transferDate ? new Date(item.transferDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }) : '—'}
                  </TableCell>
                  <TableCell className="text-right">
                    {item.status !== 'paid' ? (
                      <Button size="sm" variant="outline" className="h-7 text-[10px] text-green-600 border-green-200 hover:bg-green-50 cursor-pointer" onClick={() => handlePayPayroll(item.id)}>
                        Bayar
                      </Button>
                    ) : (
                      <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-gray-400 hover:text-gray-600 cursor-pointer">
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
        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 dark:border-gray-800">
          <p className="text-xs text-gray-500">
            {((page - 1) * ITEMS_PER_PAGE) + 1}–{Math.min(page * ITEMS_PER_PAGE, filteredData.length)} dari {filteredData.length}
          </p>
          <div className="flex items-center gap-1">
            <Button variant="outline" size="sm" className="h-8 w-8 p-0" disabled={page === 1} onClick={() => setPage(p => p - 1)}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
              <Button
                key={p}
                variant={p === page ? 'default' : 'outline'}
                size="sm"
                className={`h-8 w-8 p-0 text-xs ${p === page ? 'bg-green-600 hover:bg-green-700 text-white' : ''}`}
                onClick={() => setPage(p)}
              >
                {p}
              </Button>
            ))}
            <Button variant="outline" size="sm" className="h-8 w-8 p-0" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </Card>

      {/* Chart */}
      <PayrollChart />
    </div>
  );
}
