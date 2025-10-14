'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Package, 
  Search, 
  Filter, 
  Eye, 
  CheckCircle, 
  XCircle, 
  Clock,
  AlertTriangle,
  CheckCircle2,
  Ban,
  MapPin,
  Calendar,
  Users,
  FileText,
  Image,
  Map,
  Shield,
  ArrowRight,
  MessageSquare
} from 'lucide-react';
import Link from 'next/link';

interface OnayKaydi {
  _id: string;
  ilanId: {
    _id: string;
    baslik: string;
    aciklama: string;
    sehir: string;
    ilce: string;
    fotograflar: string[];
    ilan_tipi: 'satilik' | 'araniyor';
    durum: 'sifir' | 'ikinci_el';
    miktar: number;
    miktar_birimi: string;
    ust_kategori_id: string;
    kategori_id: string;
    standart_id: string;
    model_id: string;
    varyant_id: string;
    createdAt: string;
  };
  userId: {
    _id: string;
    email: string;
    individualInfo?: {
      ad: string;
      soyad: string;
    };
    companyInfo?: {
      sirket_adi: string;
    };
    userType: string;
  };
  onayDurumu: 'bekliyor' | 'onaylandi' | 'reddedildi' | 'geri_gonderildi';
  onayAsamasi: 'ilk_kontrol' | 'icerik_kontrol' | 'foto_kontrol' | 'konum_kontrol' | 'final_onay';
  onaylayanAdminId?: {
    _id: string;
    email: string;
    individualInfo?: {
      ad: string;
      soyad: string;
    };
  };
  onayTarihi?: string;
  redNedeni?: string;
  notlar?: string;
  onayAsamalari: {
    asama: string;
    durum: 'bekliyor' | 'onaylandi' | 'reddedildi';
    onaylayanAdminId?: string;
    onayTarihi?: string;
    notlar?: string;
  }[];
  createdAt: string;
  updatedAt: string;
}

export default function AdminOnaylarPage() {
  const [onaylar, setOnaylar] = useState<OnayKaydi[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [onayDurumuFilter, setOnayDurumuFilter] = useState('all');
  const [onayAsamasiFilter, setOnayAsamasiFilter] = useState('all');
  const [stats, setStats] = useState({
    toplam: 0,
    bekliyor: 0,
    onaylandi: 0,
    reddedildi: 0,
    geriGonderildi: 0
  });
  const [selectedOnay, setSelectedOnay] = useState<OnayKaydi | null>(null);
  const [onayNotlari, setOnayNotlari] = useState('');
  const [redNedeni, setRedNedeni] = useState('');

  useEffect(() => {
    fetchOnaylar();
  }, []);

  const fetchOnaylar = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/ilan-onaylar');
      const data = await response.json();
      
      if (data.success) {
        setOnaylar(data.data);
        calculateStats(data.data);
      }
    } catch (error) {
      console.error('Onaylar yüklenemedi:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (onaylar: OnayKaydi[]) => {
    const stats = {
      toplam: onaylar.length,
      bekliyor: onaylar.filter(o => o.onayDurumu === 'bekliyor').length,
      onaylandi: onaylar.filter(o => o.onayDurumu === 'onaylandi').length,
      reddedildi: onaylar.filter(o => o.onayDurumu === 'reddedildi').length,
      geriGonderildi: onaylar.filter(o => o.onayDurumu === 'geri_gonderildi').length
    };
    setStats(stats);
  };

  const handleOnay = async (onayId: string, onayDurumu: string) => {
    try {
      const response = await fetch(`/api/ilan-onaylar/${onayId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          onayDurumu,
          onaylayanAdminId: 'admin', // Admin ID
          notlar: onayNotlari,
          redNedeni: onayDurumu === 'reddedildi' ? redNedeni : undefined
        })
      });

      if (response.ok) {
        fetchOnaylar();
        setSelectedOnay(null);
        setOnayNotlari('');
        setRedNedeni('');
      }
    } catch (error) {
      console.error('Onay işlemi başarısız:', error);
    }
  };

  const getOnayDurumuBadge = (durum: string) => {
    const variants = {
      bekliyor: { label: 'Bekliyor', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
      onaylandi: { label: 'Onaylandı', color: 'bg-green-100 text-green-800', icon: CheckCircle },
      reddedildi: { label: 'Reddedildi', color: 'bg-red-100 text-red-800', icon: XCircle },
      geri_gonderildi: { label: 'Geri Gönderildi', color: 'bg-orange-100 text-orange-800', icon: ArrowRight }
    };
    const variant = variants[durum as keyof typeof variants] || { label: durum, color: 'bg-gray-100 text-gray-800', icon: Clock };
    const Icon = variant.icon;
    return (
      <Badge className={variant.color}>
        <Icon className="h-3 w-3 mr-1" />
        {variant.label}
      </Badge>
    );
  };

  const getOnayAsamasiBadge = (asama: string) => {
    const variants = {
      ilk_kontrol: { label: 'İlk Kontrol', color: 'bg-blue-100 text-blue-800', icon: Shield },
      icerik_kontrol: { label: 'İçerik Kontrol', color: 'bg-purple-100 text-purple-800', icon: FileText },
      foto_kontrol: { label: 'Foto Kontrol', color: 'bg-pink-100 text-pink-800', icon: Image },
      konum_kontrol: { label: 'Konum Kontrol', color: 'bg-cyan-100 text-cyan-800', icon: Map },
      final_onay: { label: 'Final Onay', color: 'bg-green-100 text-green-800', icon: CheckCircle2 }
    };
    const variant = variants[asama as keyof typeof variants] || { label: asama, color: 'bg-gray-100 text-gray-800', icon: Shield };
    const Icon = variant.icon;
    return (
      <Badge className={variant.color}>
        <Icon className="h-3 w-3 mr-1" />
        {variant.label}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredOnaylar = onaylar.filter(onay => {
    const matchesSearch = onay.ilanId.baslik.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         onay.ilanId.aciklama.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         onay.userId.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDurum = onayDurumuFilter === 'all' || onay.onayDurumu === onayDurumuFilter;
    const matchesAsama = onayAsamasiFilter === 'all' || onay.onayAsamasi === onayAsamasiFilter;
    return matchesSearch && matchesDurum && matchesAsama;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">İlan Onayları</h1>
          <p className="text-gray-600">İlanları aşamalı olarak onaylayın</p>
        </div>

        {/* İstatistikler */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Package className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Toplam</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.toplam}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Clock className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Bekliyor</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.bekliyor}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Onaylandı</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.onaylandi}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-red-100 rounded-lg">
                  <XCircle className="h-6 w-6 text-red-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Reddedildi</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.reddedildi}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <ArrowRight className="h-6 w-6 text-orange-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Geri Gönderildi</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.geriGonderildi}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filtreler */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="İlan, kullanıcı ara..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex gap-4">
                <Select value={onayDurumuFilter} onValueChange={setOnayDurumuFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Onay Durumu" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tümü</SelectItem>
                    <SelectItem value="bekliyor">Bekliyor</SelectItem>
                    <SelectItem value="onaylandi">Onaylandı</SelectItem>
                    <SelectItem value="reddedildi">Reddedildi</SelectItem>
                    <SelectItem value="geri_gonderildi">Geri Gönderildi</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={onayAsamasiFilter} onValueChange={setOnayAsamasiFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Onay Aşaması" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tümü</SelectItem>
                    <SelectItem value="ilk_kontrol">İlk Kontrol</SelectItem>
                    <SelectItem value="icerik_kontrol">İçerik Kontrol</SelectItem>
                    <SelectItem value="foto_kontrol">Foto Kontrol</SelectItem>
                    <SelectItem value="konum_kontrol">Konum Kontrol</SelectItem>
                    <SelectItem value="final_onay">Final Onay</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Onaylar */}
        {filteredOnaylar.length > 0 ? (
          <div className="space-y-4">
            {filteredOnaylar.map((onay) => (
              <Card key={onay._id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            {onay.ilanId.baslik}
                          </h3>
                          <p className="text-sm text-gray-600 line-clamp-2">
                            {onay.ilanId.aciklama}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          {getOnayDurumuBadge(onay.onayDurumu)}
                          {getOnayAsamasiBadge(onay.onayAsamasi)}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Users className="h-4 w-4" />
                          <span>
                            {onay.userId.individualInfo 
                              ? `${onay.userId.individualInfo.ad} ${onay.userId.individualInfo.soyad}`
                              : onay.userId.companyInfo?.sirket_adi || 'Kullanıcı'
                            }
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <MapPin className="h-4 w-4" />
                          <span>{onay.ilanId.sehir} {onay.ilanId.ilce}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Calendar className="h-4 w-4" />
                          <span>{formatDate(onay.createdAt)}</span>
                        </div>
                      </div>

                      {/* Onay Aşamaları */}
                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-gray-900 mb-2">Onay Aşamaları</h4>
                        <div className="flex gap-2 flex-wrap">
                          {onay.onayAsamalari.map((asama, index) => (
                            <Badge 
                              key={index}
                              className={
                                asama.durum === 'onaylandi' ? 'bg-green-100 text-green-800' :
                                asama.durum === 'reddedildi' ? 'bg-red-100 text-red-800' :
                                'bg-gray-100 text-gray-800'
                              }
                            >
                              {asama.asama.replace('_', ' ')}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      {/* Aksiyonlar */}
                      {onay.onayDurumu === 'bekliyor' && (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => setSelectedOnay(onay)}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            İncele
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleOnay(onay._id, 'onaylandi')}
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Onayla
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => setSelectedOnay(onay)}
                          >
                            <XCircle className="h-4 w-4 mr-2" />
                            Reddet
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-12 text-center">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm || onayDurumuFilter !== 'all' || onayAsamasiFilter !== 'all' ? 'Onay Bulunamadı' : 'Henüz Onay Yok'}
              </h3>
              <p className="text-gray-500">
                {searchTerm || onayDurumuFilter !== 'all' || onayAsamasiFilter !== 'all'
                  ? 'Arama kriterlerinize uygun onay bulunamadı.'
                  : 'Henüz onay bekleyen ilan yok.'
                }
              </p>
            </CardContent>
          </Card>
        )}

        {/* Onay Modal */}
        {selectedOnay && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <CardHeader>
                <CardTitle>İlan Onay Detayı</CardTitle>
                <CardDescription>
                  {selectedOnay.ilanId.baslik}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">İlan Bilgileri</h4>
                  <div className="space-y-2 text-sm">
                    <p><strong>Başlık:</strong> {selectedOnay.ilanId.baslik}</p>
                    <p><strong>Açıklama:</strong> {selectedOnay.ilanId.aciklama}</p>
                    <p><strong>Konum:</strong> {selectedOnay.ilanId.sehir} {selectedOnay.ilanId.ilce}</p>
                    <p><strong>Miktar:</strong> {selectedOnay.ilanId.miktar} {selectedOnay.ilanId.miktar_birimi}</p>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Onay Notları</h4>
                  <Textarea
                    placeholder="Onay notlarınızı yazın..."
                    value={onayNotlari}
                    onChange={(e) => setOnayNotlari(e.target.value)}
                    rows={3}
                  />
                </div>

                <div>
                  <h4 className="font-medium mb-2">Red Nedeni (Reddetmek için)</h4>
                  <Textarea
                    placeholder="Red nedenini yazın..."
                    value={redNedeni}
                    onChange={(e) => setRedNedeni(e.target.value)}
                    rows={2}
                  />
                </div>

                <div className="flex gap-2 pt-4">
                  <Button
                    onClick={() => handleOnay(selectedOnay._id, 'onaylandi')}
                    className="flex-1"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Onayla
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => handleOnay(selectedOnay._id, 'reddedildi')}
                    className="flex-1"
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Reddet
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setSelectedOnay(null)}
                  >
                    İptal
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
