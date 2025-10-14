'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Search,
  Filter,
  Grid3X3,
  List,
  MapPin,
  Calendar,
  Eye,
  Package,
  Phone,
  Mail,
  Star,
  ChevronDown,
  X
} from 'lucide-react';
import Link from 'next/link';

interface Ilan {
  _id: string;
  ilan_tipi: 'satilik' | 'araniyor';
  durum: 'sifir' | 'ikinci_el';
  miktar: number;
  miktar_birimi: string;
  baslik: string;
  aciklama: string;
  sehir: string;
  ilce: string;
  mahalle: string;
  fotograflar: string[];
  teslimat_secenekleri: string[];
  goruntulenme_sayisi: number;
  createdAt: string;
  user_id: {
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
  ust_kategori_id: string;
  kategori_id: string;
  standart_id: string;
  model_id: string;
  varyant_id: string;
}

export default function IlanlarPage() {
  const [ilanlar, setIlanlar] = useState<Ilan[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filtersOpen, setFiltersOpen] = useState(false);

  // Filtreler
  const [filters, setFilters] = useState({
    arama: '',
    ilan_tipi: '',
    durum: '',
    sehir: '',
    ilce: '',
    malzeme: '',
    min_kapasite: '',
    max_kapasite: '',
    siralama: 'createdAt',
    yon: 'desc'
  });

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  });

  useEffect(() => {
    fetchIlanlar();
  }, [filters, pagination.page]);

  const fetchIlanlar = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...filters
      });

      const response = await fetch(`/api/ilans?${params}`);
      const data = await response.json();

      if (data.success) {
        setIlanlar(data.data);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error('İlanlar yüklenemedi:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const clearFilters = () => {
    setFilters({
      arama: '',
      ilan_tipi: '',
      durum: '',
      sehir: '',
      ilce: '',
      malzeme: '',
      min_kapasite: '',
      max_kapasite: '',
      siralama: 'createdAt',
      yon: 'desc'
    });
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const getIlanTipiBadge = (tip: string) => {
    const variants = {
      satilik: { label: 'Satılık', color: 'bg-green-100 text-green-800' },
      araniyor: { label: 'Aranıyor', color: 'bg-blue-100 text-blue-800' }
    };
    const variant = variants[tip as keyof typeof variants] || { label: tip, color: 'bg-gray-100 text-gray-800' };
    return <Badge className={variant.color}>{variant.label}</Badge>;
  };

  const getDurumBadge = (durum: string) => {
    const variants = {
      sifir: { label: 'Sıfır', color: 'bg-emerald-100 text-emerald-800' },
      ikinci_el: { label: 'İkinci El', color: 'bg-orange-100 text-orange-800' }
    };
    const variant = variants[durum as keyof typeof variants] || { label: durum, color: 'bg-gray-100 text-gray-800' };
    return <Badge className={variant.color}>{variant.label}</Badge>;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const renderIlanCard = (ilan: Ilan) => (
    <Card key={ilan._id} className="h-full hover:shadow-lg transition-shadow">
      <div className="relative">
        {ilan.fotograflar.length > 0 && (
          <img
            src={ilan.fotograflar[0]}
            alt={ilan.baslik}
            className="w-full h-48 object-cover rounded-t-lg"
          />
        )}
        <div className="absolute top-2 left-2 flex gap-2">
          {getIlanTipiBadge(ilan.ilan_tipi)}
          {getDurumBadge(ilan.durum)}
        </div>
        <div className="absolute top-2 right-2 flex gap-1">
          <Badge variant="outline" className="bg-white/90">
            <Eye className="h-3 w-3 mr-1" />
            {ilan.goruntulenme_sayisi}
          </Badge>
        </div>
      </div>

      <CardContent className="p-4">
        <div className="space-y-3">
          <div>
            <h3 className="font-semibold text-lg line-clamp-2">{ilan.baslik}</h3>
            <p className="text-sm text-muted-foreground line-clamp-2">{ilan.aciklama}</p>
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4" />
            <span>{ilan.sehir} {ilan.ilce}</span>
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Package className="h-4 w-4" />
            <span>{ilan.miktar} {ilan.miktar_birimi}</span>
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>{formatDate(ilan.createdAt)}</span>
          </div>

          <div className="pt-2 border-t">
            <div className="flex items-center justify-between">
              <div className="text-sm">
                <span className="font-medium">
                  {ilan.user_id.individualInfo
                    ? `${ilan.user_id.individualInfo.ad} ${ilan.user_id.individualInfo.soyad}`
                    : ilan.user_id.companyInfo?.sirket_adi || 'Kullanıcı'
                  }
                </span>
              </div>
              <div className="flex gap-1">
                <Button size="sm" variant="outline">
                  <Phone className="h-3 w-3" />
                </Button>
                <Button size="sm" variant="outline">
                  <Mail className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Palet İlanları</h1>
          <p className="text-gray-600">Aradığınız paleti bulun veya kendi ilanınızı verin</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filtreler */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="h-5 w-5" />
                  Filtreler
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Arama */}
                <div>
                  <Label htmlFor="arama">Arama</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="arama"
                      placeholder="Palet ara..."
                      value={filters.arama}
                      onChange={(e) => handleFilterChange('arama', e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                {/* İlan Tipi */}
                <div>
                  <Label htmlFor="ilan_tipi">İlan Tipi</Label>
                  <Select value={filters.ilan_tipi} onValueChange={(value) => handleFilterChange('ilan_tipi', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Tümü" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Tümü</SelectItem>
                      <SelectItem value="satilik">Satılık</SelectItem>
                      <SelectItem value="araniyor">Aranıyor</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Durum */}
                <div>
                  <Label htmlFor="durum">Durum</Label>
                  <Select value={filters.durum} onValueChange={(value) => handleFilterChange('durum', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Tümü" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Tümü</SelectItem>
                      <SelectItem value="sifir">Sıfır</SelectItem>
                      <SelectItem value="ikinci_el">İkinci El</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Konum */}
                <div>
                  <Label htmlFor="sehir">Şehir</Label>
                  <Input
                    id="sehir"
                    placeholder="İstanbul"
                    value={filters.sehir}
                    onChange={(e) => handleFilterChange('sehir', e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="ilce">İlçe</Label>
                  <Input
                    id="ilce"
                    placeholder="Kadıköy"
                    value={filters.ilce}
                    onChange={(e) => handleFilterChange('ilce', e.target.value)}
                  />
                </div>

                {/* Sıralama */}
                <div>
                  <Label htmlFor="siralama">Sıralama</Label>
                  <Select value={filters.siralama} onValueChange={(value) => handleFilterChange('siralama', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="createdAt">En Yeni</SelectItem>
                      <SelectItem value="goruntulenme_sayisi">En Çok Görüntülenen</SelectItem>
                      <SelectItem value="baslik">Başlık A-Z</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Filtreleri Temizle */}
                <Button variant="outline" onClick={clearFilters} className="w-full">
                  <X className="h-4 w-4 mr-2" />
                  Filtreleri Temizle
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Ana İçerik */}
          <div className="lg:col-span-3">
            {/* Toolbar */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as 'grid' | 'list')}>
                  <TabsList>
                    <TabsTrigger value="grid">
                      <Grid3X3 className="h-4 w-4" />
                    </TabsTrigger>
                    <TabsTrigger value="list">
                      <List className="h-4 w-4" />
                    </TabsTrigger>
                  </TabsList>
                </Tabs>

                <span className="text-sm text-muted-foreground">
                  {pagination.total} ilan bulundu
                </span>
              </div>

              <Button asChild>
                <Link href="/ilans/create">
                  <Package className="h-4 w-4 mr-2" />
                  İlan Ver
                </Link>
              </Button>
            </div>

            {/* İlanlar */}
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <div className="h-48 bg-gray-200 rounded-t-lg"></div>
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div className="h-4 bg-gray-200 rounded"></div>
                        <div className="h-3 bg-gray-200 rounded"></div>
                        <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : ilanlar.length > 0 ? (
              <div className={
                viewMode === 'grid'
                  ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6'
                  : 'space-y-4'
              }>
                {ilanlar.map(renderIlanCard)}
              </div>
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">İlan Bulunamadı</h3>
                  <p className="text-gray-500 mb-4">Arama kriterlerinize uygun ilan bulunamadı.</p>
                  <Button onClick={clearFilters}>
                    Filtreleri Temizle
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="flex justify-center mt-8">
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
                    disabled={pagination.page === 1}
                  >
                    Önceki
                  </Button>

                  {[...Array(pagination.pages)].map((_, i) => (
                    <Button
                      key={i + 1}
                      variant={pagination.page === i + 1 ? 'default' : 'outline'}
                      onClick={() => setPagination(prev => ({ ...prev, page: i + 1 }))}
                    >
                      {i + 1}
                    </Button>
                  ))}

                  <Button
                    variant="outline"
                    onClick={() => setPagination(prev => ({ ...prev, page: Math.min(prev.pages, prev.page + 1) }))}
                    disabled={pagination.page === pagination.pages}
                  >
                    Sonraki
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
