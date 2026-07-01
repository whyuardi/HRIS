'use client';

import { use } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { dbGetEmployees } from '@/lib/db';
import { jobHistories, salaryHistories } from '@/lib/data/dashboard';
import { getDocumentsByEmployee } from '@/lib/data/documents';
import { StatusBadge } from '@/components/shared/status-badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  ArrowLeft, Mail, Phone, MapPin, Calendar, Building2, Briefcase,
  FileCheck, Download, Eye, TrendingUp, CreditCard,
} from 'lucide-react';

export default function EmployeeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const employeeList = dbGetEmployees();
  const employee = employeeList.find(e => e.id === id);

  if (!employee) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-gray-500">Karyawan tidak ditemukan.</p>
      </div>
    );
  }

  const jobs = jobHistories.filter(j => j.employeeId === id);
  const salaries = salaryHistories.filter(s => s.employeeId === id);
  const documents = getDocumentsByEmployee(id);

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Link href="/employees">
        <Button variant="ghost" size="sm" className="gap-2 text-xs text-gray-500 hover:text-gray-900 -ml-2">
          <ArrowLeft className="w-4 h-4" /> Kembali ke Daftar Karyawan
        </Button>
      </Link>

      {/* Profile Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Card className="border-gray-200 dark:border-gray-800 overflow-hidden">
          <div className="h-24 bg-gradient-to-r from-green-500 to-emerald-600 relative">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml,...')] opacity-10" />
          </div>
          <CardContent className="relative pb-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4 -mt-12">
              <Avatar className="w-24 h-24 border-4 border-white dark:border-gray-950 shadow-lg">
                <AvatarImage src={employee.avatar} />
                <AvatarFallback className="text-2xl bg-green-100 text-green-700">
                  {employee.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-3 flex-wrap">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">{employee.name}</h2>
                  <StatusBadge status={employee.status} />
                  <StatusBadge status={employee.contractStatus} />
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {employee.position} · {employee.division}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">{employee.nik}</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="gap-2 text-xs">
                  <Download className="w-3.5 h-3.5" /> Download CV
                </Button>
                <Button size="sm" className="gap-2 text-xs bg-green-600 hover:bg-green-700 text-white">
                  Edit Profil
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Tabs */}
      <Tabs defaultValue="info" className="space-y-4">
        <TabsList className="bg-gray-100 dark:bg-gray-800">
          <TabsTrigger value="info" className="text-xs">Info Pribadi</TabsTrigger>
          <TabsTrigger value="history" className="text-xs">Riwayat Jabatan</TabsTrigger>
          <TabsTrigger value="salary" className="text-xs">Riwayat Gaji</TabsTrigger>
          <TabsTrigger value="documents" className="text-xs">Dokumen</TabsTrigger>
        </TabsList>

        {/* Info Tab */}
        <TabsContent value="info">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="border-gray-200 dark:border-gray-800">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold">Informasi Personal</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { icon: Mail, label: 'Email', value: employee.email },
                  { icon: Phone, label: 'No HP', value: employee.phone },
                  { icon: MapPin, label: 'Alamat', value: employee.address },
                  { icon: Calendar, label: 'Tanggal Lahir', value: new Date(employee.birthDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) },
                ].map(item => (
                  <div key={item.label} className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-gray-50 dark:bg-gray-800">
                      <item.icon className="w-4 h-4 text-gray-400" />
                    </div>
                    <div>
                      <p className="text-[11px] text-gray-500 uppercase tracking-wider">{item.label}</p>
                      <p className="text-sm text-gray-900 dark:text-white">{item.value}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="border-gray-200 dark:border-gray-800">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold">Informasi Pekerjaan</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { icon: Briefcase, label: 'Jabatan', value: employee.position },
                  { icon: Building2, label: 'Divisi', value: employee.division },
                  { icon: Calendar, label: 'Tanggal Bergabung', value: new Date(employee.joinDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) },
                  { icon: FileCheck, label: 'Kontrak Berakhir', value: new Date(employee.contractEnd).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) },
                ].map(item => (
                  <div key={item.label} className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-gray-50 dark:bg-gray-800">
                      <item.icon className="w-4 h-4 text-gray-400" />
                    </div>
                    <div>
                      <p className="text-[11px] text-gray-500 uppercase tracking-wider">{item.label}</p>
                      <p className="text-sm text-gray-900 dark:text-white">{item.value}</p>
                    </div>
                  </div>
                ))}
                <Separator />
                <div className="flex items-center gap-4">
                  <div>
                    <p className="text-[11px] text-gray-500 uppercase tracking-wider">BPJS</p>
                    <StatusBadge status={employee.bpjs ? 'active' : 'inactive'} />
                  </div>
                  <div>
                    <p className="text-[11px] text-gray-500 uppercase tracking-wider">Gaji</p>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      Rp {employee.salary.toLocaleString('id-ID')}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-gray-200 dark:border-gray-800 lg:col-span-2">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-green-600" /> Informasi Rekening Bank
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[
                    { label: 'Nama Bank', value: employee.bankName },
                    { label: 'Nomor Rekening', value: employee.bankAccount, highlight: true },
                    { label: 'Nama Pemilik Rekening', value: employee.bankAccountName },
                  ].map(item => (
                    <div key={item.label} className="space-y-1">
                      <p className="text-[11px] text-gray-500 uppercase tracking-wider">{item.label}</p>
                      <p className={`text-sm ${item.highlight ? 'font-mono font-semibold text-green-600 dark:text-green-400' : 'font-medium text-gray-900 dark:text-white'}`}>
                        {item.value || '—'}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Job History Tab */}
        <TabsContent value="history">
          <Card className="border-gray-200 dark:border-gray-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-green-600" /> Riwayat Jabatan
              </CardTitle>
            </CardHeader>
            <CardContent>
              {jobs.length === 0 ? (
                <p className="text-sm text-gray-500 py-8 text-center">Belum ada riwayat jabatan</p>
              ) : (
                <div className="space-y-0">
                  {jobs.sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime()).map((job, idx) => (
                    <div key={job.id} className="flex gap-4 pb-4 last:pb-0">
                      <div className="flex flex-col items-center">
                        <div className={`w-3 h-3 rounded-full ${idx === 0 ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`} />
                        {idx < jobs.length - 1 && <div className="w-px flex-1 bg-gray-200 dark:bg-gray-700" />}
                      </div>
                      <div className="flex-1 pb-4">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{job.position}</p>
                          <Badge variant="secondary" className="text-[10px] capitalize">{job.type}</Badge>
                        </div>
                        <p className="text-xs text-gray-500">{job.division}</p>
                        <p className="text-[11px] text-gray-400 mt-1">
                          {new Date(job.startDate).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}
                          {' — '}
                          {job.endDate ? new Date(job.endDate).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' }) : 'Sekarang'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Salary History Tab */}
        <TabsContent value="salary">
          <Card className="border-gray-200 dark:border-gray-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">Riwayat Gaji</CardTitle>
            </CardHeader>
            <CardContent>
              {salaries.length === 0 ? (
                <p className="text-sm text-gray-500 py-8 text-center">Belum ada riwayat gaji</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-[11px] font-semibold">Tanggal Efektif</TableHead>
                      <TableHead className="text-[11px] font-semibold">Gaji</TableHead>
                      <TableHead className="text-[11px] font-semibold">Keterangan</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {salaries.sort((a, b) => new Date(b.effectiveDate).getTime() - new Date(a.effectiveDate).getTime()).map(s => (
                      <TableRow key={s.id}>
                        <TableCell className="text-xs">
                          {new Date(s.effectiveDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </TableCell>
                        <TableCell className="text-sm font-semibold text-gray-900 dark:text-white">
                          Rp {s.amount.toLocaleString('id-ID')}
                        </TableCell>
                        <TableCell className="text-xs text-gray-500">{s.reason}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Documents Tab */}
        <TabsContent value="documents">
          <Card className="border-gray-200 dark:border-gray-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">Dokumen Karyawan</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-[11px] font-semibold">Kategori</TableHead>
                    <TableHead className="text-[11px] font-semibold">File</TableHead>
                    <TableHead className="text-[11px] font-semibold">Ukuran</TableHead>
                    <TableHead className="text-[11px] font-semibold">Status</TableHead>
                    <TableHead className="text-[11px] font-semibold text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {documents.map(doc => (
                    <TableRow key={doc.id}>
                      <TableCell className="text-xs font-medium">{doc.category}</TableCell>
                      <TableCell className="text-xs text-gray-500">{doc.fileName || '—'}</TableCell>
                      <TableCell className="text-xs text-gray-500">{doc.fileSize || '—'}</TableCell>
                      <TableCell><StatusBadge status={doc.status} /></TableCell>
                      <TableCell className="text-right">
                        {doc.status !== 'not_uploaded' && (
                          <div className="flex items-center justify-end gap-1">
                            <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-gray-500">
                              <Eye className="w-3.5 h-3.5" />
                            </Button>
                            <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-gray-500">
                              <Download className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
