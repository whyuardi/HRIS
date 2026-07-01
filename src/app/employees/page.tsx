'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { employees } from '@/lib/data/employees';
import { divisions } from '@/lib/data/divisions';
import { PageHeader } from '@/components/shared/page-header';
import { StatusBadge } from '@/components/shared/status-badge';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Search, UserPlus, Eye, Pencil, Filter, Download, ChevronLeft, ChevronRight, Check, X } from 'lucide-react';

const ITEMS_PER_PAGE = 10;

export default function EmployeesPage() {
  const [search, setSearch] = useState('');
  const [divisionFilter, setDivisionFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [contractFilter, setContractFilter] = useState('all');
  const [page, setPage] = useState(1);

  const filteredEmployees = useMemo(() => {
    return employees.filter(emp => {
      const matchSearch = search === '' ||
        emp.name.toLowerCase().includes(search.toLowerCase()) ||
        emp.nik.toLowerCase().includes(search.toLowerCase()) ||
        emp.email.toLowerCase().includes(search.toLowerCase());
      const matchDivision = divisionFilter === 'all' || emp.divisionId === divisionFilter;
      const matchStatus = statusFilter === 'all' || emp.status === statusFilter;
      const matchContract = contractFilter === 'all' || emp.contractStatus === contractFilter;
      return matchSearch && matchDivision && matchStatus && matchContract;
    });
  }, [search, divisionFilter, statusFilter, contractFilter]);

  const totalPages = Math.ceil(filteredEmployees.length / ITEMS_PER_PAGE);
  const paginatedEmployees = filteredEmployees.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Data Karyawan"
        description={`${employees.length} karyawan terdaftar dalam sistem`}
      >
        <Button variant="outline" size="sm" className="gap-2 text-xs">
          <Download className="w-4 h-4" /> Export
        </Button>
        <Button size="sm" className="gap-2 text-xs bg-green-600 hover:bg-green-700 text-white">
          <UserPlus className="w-4 h-4" /> Tambah Karyawan
        </Button>
      </PageHeader>

      {/* Filters */}
      <Card className="border-gray-200 dark:border-gray-800">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Cari nama, NIK, atau email..."
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
                <SelectItem value="active">Aktif</SelectItem>
                <SelectItem value="probation">Probation</SelectItem>
                <SelectItem value="inactive">Tidak Aktif</SelectItem>
                <SelectItem value="terminated">Keluar</SelectItem>
              </SelectContent>
            </Select>
            <Select value={contractFilter} onValueChange={(v) => { if (v) { setContractFilter(v); setPage(1); } }}>
              <SelectTrigger className="w-full sm:w-36 h-9 text-xs">
                <SelectValue placeholder="Semua Kontrak" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Kontrak</SelectItem>
                <SelectItem value="permanent">Tetap</SelectItem>
                <SelectItem value="contract">Kontrak</SelectItem>
                <SelectItem value="intern">Magang</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="border-gray-200 dark:border-gray-800 overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50/50 dark:bg-gray-900/50">
                  <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-gray-500 w-28">NIK</TableHead>
                  <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">Nama</TableHead>
                  <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">Jabatan</TableHead>
                  <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">Divisi</TableHead>
                  <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">Status</TableHead>
                  <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-gray-500 hidden xl:table-cell">Bergabung</TableHead>
                  <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-gray-500 hidden lg:table-cell">No HP</TableHead>
                  <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-gray-500 hidden xl:table-cell">Kontrak</TableHead>
                  <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-gray-500 hidden xl:table-cell">BPJS</TableHead>
                  <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-gray-500 text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedEmployees.map((emp) => (
                  <TableRow key={emp.id} className="table-row-hover group">
                    <TableCell className="text-xs font-mono text-gray-500">{emp.nik}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={emp.avatar} />
                          <AvatarFallback className="text-[10px] bg-green-100 text-green-700">{emp.name.split(' ').map(n => n[0]).join('').slice(0, 2)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{emp.name}</p>
                          <p className="text-[11px] text-gray-500 dark:text-gray-400">{emp.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs text-gray-700 dark:text-gray-300">{emp.position}</TableCell>
                    <TableCell className="text-xs text-gray-700 dark:text-gray-300">{emp.division.split(' ')[0]}</TableCell>
                    <TableCell><StatusBadge status={emp.status} /></TableCell>
                    <TableCell className="text-xs text-gray-500 hidden xl:table-cell">
                      {new Date(emp.joinDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </TableCell>
                    <TableCell className="text-xs text-gray-500 hidden lg:table-cell">{emp.phone}</TableCell>
                    <TableCell className="hidden xl:table-cell"><StatusBadge status={emp.contractStatus} /></TableCell>
                    <TableCell className="hidden xl:table-cell">
                      {emp.bpjs ? (
                        <span className="inline-flex items-center gap-1 text-emerald-600"><Check className="w-3.5 h-3.5" /></span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-red-500"><X className="w-3.5 h-3.5" /></span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Link href={`/employees/${emp.id}`}>
                          <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-gray-500 hover:text-green-600">
                            <Eye className="w-3.5 h-3.5" />
                          </Button>
                        </Link>
                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-gray-500 hover:text-blue-600">
                          <Pencil className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 dark:border-gray-800">
            <p className="text-xs text-gray-500">
              Menampilkan {((page - 1) * ITEMS_PER_PAGE) + 1}–{Math.min(page * ITEMS_PER_PAGE, filteredEmployees.length)} dari {filteredEmployees.length} karyawan
            </p>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                className="h-8 w-8 p-0"
                disabled={page === 1}
                onClick={() => setPage(p => p - 1)}
              >
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
              <Button
                variant="outline"
                size="sm"
                className="h-8 w-8 p-0"
                disabled={page === totalPages}
                onClick={() => setPage(p => p + 1)}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
