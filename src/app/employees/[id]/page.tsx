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
  FileCheck, Download, Eye, TrendingUp, CreditCard, Camera, IdCard,
} from 'lucide-react';
import { toast } from 'sonner';

export default function EmployeeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const employeeList = dbGetEmployees();
  const employee = employeeList.find(e => e.id === id);

  if (!employee) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-slate-500">Karyawan tidak ditemukan.</p>
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
        <Button variant="ghost" size="sm" className="gap-2 text-xs text-slate-500 hover:text-slate-900 -ml-2 rounded-lg">
          <ArrowLeft className="w-4 h-4" /> Kembali ke Daftar Karyawan
        </Button>
      </Link>

      {/* Profile Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Card className="border-slate-200/60 dark:border-slate-800/60 overflow-hidden shadow-sm">
          <div className="h-28 bg-gradient-to-r from-emerald-600 to-green-600 relative">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml,...')] opacity-10" />
          </div>
          <CardContent className="relative pb-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4 -mt-10">
              <Avatar className="w-24 h-24 border-4 border-white dark:border-slate-950 shadow-md relative group">
                <AvatarImage src={employee.avatar} />
                <AvatarFallback className="text-2xl bg-emerald-100 text-emerald-700 font-bold">
                  {employee.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                </AvatarFallback>
                <button
                  onClick={() => {
                    toast.success('Foto profil berhasil diperbarui', {
                      description: 'Simulasi upload — foto baru telah disimpan.',
                    });
                  }}
                  className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                >
                  <Camera className="w-6 h-6 text-white" />
                </button>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white truncate">{employee.name}</h2>
                  <StatusBadge status={employee.status} />
                  <StatusBadge status={employee.contractStatus} />
                </div>
                <p className="text-sm text-slate-500 mt-1.5 font-medium">
                  {employee.position} · {employee.division}
                </p>
                <p className="text-xs text-slate-400 font-mono mt-0.5">{employee.nik}</p>
              </div>
              <div className="flex gap-2 w-full sm:w-auto mt-4 sm:mt-0">
                <Button variant="outline" size="sm" className="gap-2 text-xs rounded-xl flex-1 sm:flex-initial">
                  <Download className="w-3.5 h-3.5" /> Download CV
                </Button>
                <Link href="/employees" className="flex-1 sm:flex-initial">
                  <Button size="sm" className="gap-2 text-xs bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white btn-premium rounded-xl w-full">
                    Edit Profil
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Tabs */}
      <Tabs defaultValue="info" className="space-y-4">
        <TabsList className="bg-slate-100 dark:bg-slate-800 rounded-xl p-1">
          <TabsTrigger value="info" className="text-xs rounded-lg">Info Pribadi</TabsTrigger>
          <TabsTrigger value="history" className="text-xs rounded-lg">Riwayat Jabatan</TabsTrigger>
          <TabsTrigger value="salary" className="text-xs rounded-lg">Riwayat Gaji</TabsTrigger>
          <TabsTrigger value="documents" className="text-xs rounded-lg">Dokumen</TabsTrigger>
          <TabsTrigger value="id-card" className="text-xs rounded-lg">Kartu ID</TabsTrigger>
        </TabsList>

        {/* Info Tab */}
        <TabsContent value="info">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="border-slate-200/60 dark:border-slate-800/60 shadow-sm">
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
                    <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800/60">
                      <item.icon className="w-4 h-4 text-slate-400" />
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">{item.label}</p>
                      <p className="text-sm font-medium text-slate-850 dark:text-slate-200">{item.value}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="border-slate-200/60 dark:border-slate-800/60 shadow-sm">
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
                    <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800/60">
                      <item.icon className="w-4 h-4 text-slate-400" />
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">{item.label}</p>
                      <p className="text-sm font-medium text-slate-850 dark:text-slate-200">{item.value}</p>
                    </div>
                  </div>
                ))}
                <Separator />
                <div className="flex items-center gap-6">
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold mb-1">BPJS</p>
                    <StatusBadge status={employee.bpjs ? 'active' : 'inactive'} />
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold mb-0.5">Gaji</p>
                    <p className="text-sm font-extrabold text-slate-850 dark:text-white font-mono">
                      Rp {employee.salary.toLocaleString('id-ID')}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-200/60 dark:border-slate-800/60 lg:col-span-2 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-emerald-600" /> Informasi Rekening Bank
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
                      <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">{item.label}</p>
                      <p className={`text-sm ${item.highlight ? 'font-mono font-bold text-emerald-600 dark:text-emerald-400' : 'font-semibold text-slate-850 dark:text-white'}`}>
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
          <Card className="border-slate-200/60 dark:border-slate-800/60 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-600" /> Riwayat Jabatan
              </CardTitle>
            </CardHeader>
            <CardContent>
              {jobs.length === 0 ? (
                <p className="text-sm text-slate-500 py-8 text-center">Belum ada riwayat jabatan</p>
              ) : (
                <div className="space-y-0">
                  {jobs.sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime()).map((job, idx) => (
                    <div key={job.id} className="flex gap-4 pb-4 last:pb-0">
                      <div className="flex flex-col items-center">
                        <div className={`w-3 h-3 rounded-full ${idx === 0 ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-600'}`} />
                        {idx < jobs.length - 1 && <div className="w-px flex-1 bg-slate-200 dark:bg-slate-700" />}
                      </div>
                      <div className="flex-1 pb-4">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold text-slate-850 dark:text-white">{job.position}</p>
                          <Badge variant="secondary" className="text-[10px] capitalize font-medium">{job.type}</Badge>
                        </div>
                        <p className="text-xs text-slate-500">{job.division}</p>
                        <p className="text-[10px] text-slate-400 mt-1 font-medium">
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
          <Card className="border-slate-200/60 dark:border-slate-800/60 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">Riwayat Gaji</CardTitle>
            </CardHeader>
            <CardContent>
              {salaries.length === 0 ? (
                <p className="text-sm text-slate-500 py-8 text-center">Belum ada riwayat gaji</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Tanggal Efektif</TableHead>
                      <TableHead className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Gaji</TableHead>
                      <TableHead className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Keterangan</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {salaries.sort((a, b) => new Date(b.effectiveDate).getTime() - new Date(a.effectiveDate).getTime()).map(s => (
                      <TableRow key={s.id}>
                        <TableCell className="text-xs font-medium text-slate-500">
                          {new Date(s.effectiveDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </TableCell>
                        <TableCell className="text-xs font-bold text-slate-900 dark:text-white font-mono">Rp {s.amount.toLocaleString('id-ID')}</TableCell>
                        <TableCell className="text-xs text-slate-500">{s.reason}</TableCell>
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
          <Card className="border-slate-200/60 dark:border-slate-800/60 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">Berkas Administrasi Karyawan</CardTitle>
            </CardHeader>
            <CardContent>
              {documents.length === 0 ? (
                <p className="text-sm text-slate-500 py-8 text-center">Belum ada dokumen yang diunggah</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Nama Dokumen</TableHead>
                      <TableHead className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Kategori</TableHead>
                      <TableHead className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Status</TableHead>
                      <TableHead className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Tanggal Upload</TableHead>
                      <TableHead className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider text-right">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {documents.map(doc => (
                      <TableRow key={doc.id} className="table-row-hover">
                        <TableCell className="text-xs font-semibold text-slate-850 dark:text-white">{doc.fileName || '—'}</TableCell>
                        <TableCell className="text-xs text-slate-500">{doc.category}</TableCell>
                        <TableCell><StatusBadge status={doc.status} /></TableCell>
                        <TableCell className="text-xs text-slate-500 font-medium">
                          {doc.uploadDate ? new Date(doc.uploadDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-slate-400 hover:text-emerald-600 rounded-lg">
                              <Eye className="w-3.5 h-3.5" />
                            </Button>
                            <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-slate-400 hover:text-slate-600 rounded-lg">
                              <Download className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Kartu ID Digital Tab */}
        <TabsContent value="id-card">
          <Card className="border-slate-200/60 dark:border-slate-800/60 shadow-sm overflow-hidden">
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-sm font-semibold">Kartu ID Digital Karyawan</CardTitle>
                <p className="text-xs text-slate-500">Klik kartu untuk membalik dan melihat bagian belakang</p>
              </div>
              <Button size="sm" variant="outline" className="gap-2 text-xs rounded-xl" onClick={() => window.print()}>
                <Download className="w-3.5 h-3.5" />
                Cetak Kartu
              </Button>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center py-10 bg-slate-50/50 dark:bg-slate-900/20">
              {(() => {
                // Interactive 3D flip card state simulation using HTML input or framer-motion tap
                return (
                  <div className="perspective-1000 w-[320px] h-[480px] cursor-pointer group">
                    <motion.div
                      className="w-full h-full relative transition-transform duration-700 preserve-3d group-hover:rotate-y-180"
                      style={{ transformStyle: 'preserve-3d' }}
                    >
                      {/* FRONT OF ID CARD */}
                      <div 
                        className="absolute inset-0 w-full h-full rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden backface-hidden flex flex-col justify-between"
                        style={{ backfaceVisibility: 'hidden' }}
                      >
                        {/* Header Branding */}
                        <div className="p-4 bg-gradient-to-br from-emerald-600 to-green-600 text-white text-center relative overflow-hidden flex-shrink-0">
                          <div className="absolute top-0 right-0 w-16 h-16 bg-white/10 rounded-full blur-xl translate-x-4 -translate-y-4" />
                          <h4 className="font-bold text-xs uppercase tracking-widest">PT. Benua Green Energy</h4>
                          <p className="text-[8px] text-emerald-100 tracking-wider">ENTERPRISE HR SYSTEM</p>
                        </div>

                        {/* Employee Visual Information */}
                        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
                          <div className="relative mb-4">
                            <div className="absolute -inset-1.5 bg-gradient-to-tr from-emerald-500 to-green-600 rounded-full blur-sm opacity-40 animate-pulse" />
                            <Avatar className="w-24 h-24 border-4 border-white dark:border-slate-950 shadow-lg relative">
                              <AvatarImage src={employee.avatar} />
                              <AvatarFallback className="text-3xl bg-emerald-100 text-emerald-700 font-bold">
                                {employee.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                              </AvatarFallback>
                            </Avatar>
                          </div>
                          
                          <h3 className="font-bold text-base text-slate-850 dark:text-white leading-tight">{employee.name}</h3>
                          <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold mt-1">{employee.position}</p>
                          <p className="text-[10px] text-slate-500 font-medium">{employee.division}</p>

                          <div className="mt-6 px-4 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-full">
                            <span className="text-[9px] font-mono font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest">NIK: {employee.nik}</span>
                          </div>
                        </div>

                        {/* Footer Logo/Design */}
                        <div className="p-3 border-t border-slate-100 dark:border-slate-900 text-center flex-shrink-0 flex items-center justify-center gap-1 bg-slate-50/50 dark:bg-slate-900/30">
                          <div className="w-4 h-4 bg-gradient-to-br from-green-500 to-emerald-600 rounded-md flex items-center justify-center shadow-sm">
                            <span className="text-[9px] font-bold text-white">BG</span>
                          </div>
                          <span className="text-[9px] font-semibold text-slate-500">PT. Benua Green Energy</span>
                        </div>
                      </div>

                      {/* BACK OF ID CARD */}
                      <div 
                        className="absolute inset-0 w-full h-full rounded-2xl bg-slate-950 border border-slate-800 shadow-xl overflow-hidden flex flex-col justify-between p-6 text-white rotate-y-180"
                        style={{ 
                          backfaceVisibility: 'hidden',
                          transform: 'rotateY(180deg)'
                        }}
                      >
                        {/* Title */}
                        <div className="text-center">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Ketentuan & Syarat</h4>
                          <div className="w-8 h-0.5 bg-emerald-500 mx-auto mt-2 rounded-full" />
                        </div>

                        {/* ID Rules */}
                        <div className="flex-1 flex flex-col justify-center space-y-2 text-[8px] text-slate-400 leading-relaxed text-left py-4">
                          <p>1. Kartu identitas ini adalah milik PT. Benua Green Energy.</p>
                          <p>2. Wajib dikenakan selama jam kerja di lingkungan kantor perusahaan.</p>
                          <p>3. Jika kartu ini hilang atau rusak, segera laporkan ke bagian Human Resource Department (HRD).</p>
                          <p>4. Penyalahgunaan kartu ini dapat dikenakan sanksi sesuai aturan perusahaan.</p>
                        </div>

                        {/* Barcode & QR Code simulation */}
                        <div className="flex flex-col items-center gap-3">
                          {/* QR Code Placeholder */}
                          <div className="p-2 bg-white rounded-lg">
                            {/* Render a custom canvas/SVG simulating QR code */}
                            <svg className="w-16 h-16 text-slate-950" viewBox="0 0 100 100" fill="currentColor">
                              <rect x="0" y="0" width="20" height="20" />
                              <rect x="0" y="80" width="20" height="20" />
                              <rect x="80" y="0" width="20" height="20" />
                              <rect x="30" y="30" width="40" height="40" fillOpacity="0.4" />
                              <rect x="30" y="0" width="10" height="20" />
                              <rect x="60" y="0" width="10" height="10" />
                              <rect x="0" y="30" width="20" height="10" />
                              <rect x="80" y="30" width="20" height="20" />
                              <rect x="0" y="60" width="10" height="10" />
                              <rect x="30" y="80" width="30" height="20" />
                              <rect x="70" y="70" width="20" height="30" />
                            </svg>
                          </div>
                          
                          <span className="text-[8px] font-mono text-slate-500 uppercase tracking-widest">
                            GEN-ID-{employee.id.toUpperCase()}
                          </span>
                        </div>

                        {/* Back Footer */}
                        <div className="text-center pt-2 border-t border-slate-800 text-[8px] text-slate-500">
                          Hubungi: info@benuagreenenergy.co.id
                        </div>
                      </div>
                    </motion.div>
                  </div>
                );
              })()}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
