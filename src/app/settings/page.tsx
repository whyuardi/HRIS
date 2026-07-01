'use client';

import { motion } from 'framer-motion';
import { PageHeader } from '@/components/shared/page-header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Building2, Globe, Mail, Phone, MapPin, Save } from 'lucide-react';

export default function SettingsPage() {
  return (
    <div className="space-y-6 max-w-4xl">
      <PageHeader
        title="Pengaturan"
        description="Konfigurasi sistem dan preferensi"
      />

      {/* Company Profile */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="border-gray-200 dark:border-gray-800">
          <CardHeader>
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Building2 className="w-4 h-4 text-green-600" /> Profil Perusahaan
            </CardTitle>
            <CardDescription className="text-xs">Informasi dasar perusahaan yang ditampilkan di sistem</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="companyName" className="text-xs">Nama Perusahaan</Label>
                <Input id="companyName" defaultValue="PT. Nusantara Digital Teknologi" className="h-9 text-sm" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="companyCode" className="text-xs">Kode Perusahaan</Label>
                <Input id="companyCode" defaultValue="NDT" className="h-9 text-sm" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-xs flex items-center gap-1.5"><Mail className="w-3 h-3" /> Email</Label>
                <Input id="email" defaultValue="hrd@nusantaradigital.co.id" className="h-9 text-sm" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-xs flex items-center gap-1.5"><Phone className="w-3 h-3" /> Telepon</Label>
                <Input id="phone" defaultValue="+62 21 5555 0000" className="h-9 text-sm" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="website" className="text-xs flex items-center gap-1.5"><Globe className="w-3 h-3" /> Website</Label>
                <Input id="website" defaultValue="https://nusantaradigital.co.id" className="h-9 text-sm" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="npwp" className="text-xs">NPWP</Label>
                <Input id="npwp" defaultValue="01.234.567.8-012.345" className="h-9 text-sm" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="address" className="text-xs flex items-center gap-1.5"><MapPin className="w-3 h-3" /> Alamat</Label>
              <Textarea id="address" defaultValue="Jl. Sudirman No. 100, Lantai 15, Jakarta Selatan, 12190" className="text-sm min-h-[80px]" />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* System Preferences */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <Card className="border-gray-200 dark:border-gray-800">
          <CardHeader>
            <CardTitle className="text-base font-semibold">Preferensi Sistem</CardTitle>
            <CardDescription className="text-xs">Pengaturan tampilan dan perilaku sistem</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {[
              { id: 'darkMode', label: 'Dark Mode', desc: 'Aktifkan tema gelap untuk tampilan sistem', defaultChecked: false },
              { id: 'emailNotif', label: 'Notifikasi Email', desc: 'Kirim notifikasi ke email untuk event penting', defaultChecked: true },
              { id: 'autoPayroll', label: 'Auto Generate Payroll', desc: 'Generate payroll otomatis setiap akhir bulan', defaultChecked: false },
              { id: 'reminderContract', label: 'Reminder Kontrak', desc: 'Ingatkan 30 hari sebelum kontrak berakhir', defaultChecked: true },
              { id: 'attendanceLock', label: 'Lock Absensi', desc: 'Kunci input absensi setelah jam 10:00 WIB', defaultChecked: true },
            ].map((setting) => (
              <div key={setting.id} className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{setting.label}</p>
                  <p className="text-xs text-gray-500">{setting.desc}</p>
                </div>
                <Switch id={setting.id} defaultChecked={setting.defaultChecked} />
              </div>
            ))}
          </CardContent>
        </Card>
      </motion.div>

      {/* Working Hours */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        <Card className="border-gray-200 dark:border-gray-800">
          <CardHeader>
            <CardTitle className="text-base font-semibold">Jam Kerja</CardTitle>
            <CardDescription className="text-xs">Konfigurasi jam kerja standar perusahaan</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startTime" className="text-xs">Jam Masuk</Label>
                <Input id="startTime" type="time" defaultValue="08:00" className="h-9 text-sm" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endTime" className="text-xs">Jam Pulang</Label>
                <Input id="endTime" type="time" defaultValue="17:00" className="h-9 text-sm" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lateThreshold" className="text-xs">Batas Terlambat (menit)</Label>
                <Input id="lateThreshold" type="number" defaultValue="15" className="h-9 text-sm" />
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <Separator />

      {/* Save */}
      <div className="flex justify-end">
        <Button className="gap-2 bg-green-600 hover:bg-green-700 text-white">
          <Save className="w-4 h-4" /> Simpan Pengaturan
        </Button>
      </div>
    </div>
  );
}
