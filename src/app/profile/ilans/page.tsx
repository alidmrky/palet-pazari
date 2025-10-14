'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Package, 
  Plus, 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  Trash2, 
  MoreHorizontal,
  MapPin,
  Calendar,
  TrendingUp,
  BarChart3,
  Grid3X3,
  List,
  ArrowRight,
  CheckCircle,
  XCircle,
  Clock,
  Star
} from 'lucide-react';
import Link from 'next/link';

interface Ilan {
  _id: string;
  baslik: string;
  aciklama: string;
  sehir: string;
  ilce: string;
  fotograflar: string[];
  goruntulenme_sayisi: number;
  createdAt: string;
  ilan_tipi: 'satilik' | 'araniyor';
  durum: 'sifir' | 'ikinci_el';
  miktar: number;
  miktar_birimi: string;
  ilan_durumu: 'aktif' | 'pasif' | 'tamamlandi' | 'iptal';
  ust_kategori_id: string;
  kategori_id: string;
  standart_id: string;
  model_id: string;
  varyant_id: string;
}

export default function UserIlanlarPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [ilanlar, setIlanlar] = useState<Ilan[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [stats, setStats] = useState({
    toplam: 0,
    aktif: 0,
    pasif: 0,
    tamamlandi: 0,
    toplamGoruntulenme: 0
  });

  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      router.push('/auth/login');
      return;
    }
    fetchIlanlar();
  }, [session, status, router]);

  const fetchIlanlar = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/ilans?user_id=' + session?.user?.id);
      const data = await response.json();
      
      if (data.success) {
        setIlanlar(data.data);
        calculateStats(data.data);
      }
    } catch (error) {
      console.error('İlanlar yüklenemedi:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (ilanlar: Ilan[]) => {
    const stats = {
      toplam: ilanlar.length,
      aktif: ilanlar.filter(i => i.ilan_durumu === 'aktif').length,
      pasif: ilanlar.filter(i => i.ilan_durumu === 'pasif').length,
      tamamlandi: ilanlar.filter(i => i.ilan_durumu === 'tamamlandi').length,
      toplamGoruntulenme: ilanlar.reduce((sum, i) => sum + i.goruntulenme_sayisi, 0)
    };
    setStats(stats);
  };

  const handleStatusChange = async (ilanId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/ilans/${ilanId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ilan_durumu: newStatus,
          user_id: session?.user?.id
        })
      });

      if (response.ok) {
        fetchIlanlar(); // Refresh data
      }
    } catch (error) {
      console.error('Durum güncellenemedi:', error);
    }
  };

  const handleDelete = async (ilanId: string) => {
    if (!confirm('Bu ilanı silmek istediğinizden emin misiniz?')) return;

    try {
      const response = await fetch(`/api/ilans/${ilanId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          user_id: session?.user?.id
        })
      });

      if (response.ok) {
        fetchIlanlar(); // Refresh data
      }
    } catch (error) {
      console.error('İlan silinemedi:', error);
    }
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

  const getIlanDurumuBadge = (durum: string) => {
    const variants = {
      aktif: { label: 'Aktif', color: 'bg-green-100 text-green-800', icon: CheckCircle },
      pasif: { label: 'Pasif', color: 'bg-gray-100 text-gray-800', icon: Clock },
      tamamlandi: { label: 'Tamamlandı', color: 'bg-blue-100 text-blue-800', icon: CheckCircle },
      iptal: { label: 'İptal', color: 'bg-red-100 text-red-800', icon: XCircle }
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const filteredIlanlar = ilanlar.filter(ilan => {
    const matchesSearch = ilan.baslik.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ilan.aciklama.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || ilan.ilan_durumu === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">İlanlarım</h1>
              <p className="text-gray-600">İlanlarınızı yönetin ve takip edin</p>
            </div>
            <Button onClick={() => router.push('/ilans/create')}>
              <Plus className="h-4 w-4 mr-2" />
              Yeni İlan Ver
            </Button>
          </div>
        </div>

        {/* İstatistikler */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <BarChart3 className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Toplam İlan</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.toplam}</p>
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
                  <p className="text-sm font-medium text-gray-600">Aktif</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.aktif}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-gray-100 rounded-lg">
                  <Clock className="h-6 w-6 text-gray-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Pasif</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.pasif}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <CheckCircle className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Tamamlandı</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.tamamlandi}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Eye className="h-6 w-6 text-orange-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Toplam Görüntülenme</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.toplamGoruntulenme}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filtreler ve Arama */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="İlanlarınızda ara..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex gap-4">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Durum Seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tümü</SelectItem>
                    <SelectItem value="aktif">Aktif</SelectItem>
                    <SelectItem value="pasif">Pasif</SelectItem>
                    <SelectItem value="tamamlandi">Tamamlandı</SelectItem>
                    <SelectItem value="iptal">İptal</SelectItem>
                  </SelectContent>
                </Select>
                
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
              </div>
            </div>
          </CardContent>
        </Card>

        {/* İlanlar */}
        {filteredIlanlar.length > 0 ? (
          <div className={
            viewMode === 'grid' 
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
              : 'space-y-4'
          }>
            {filteredIlanlar.map((ilan) => (
              <Card key={ilan._id} className="hover:shadow-lg transition-shadow">
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
                    {getIlanDurumuBadge(ilan.ilan_durumu)}
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
                      <h3 className="font-semibold text-lg line-clamp-2 mb-2">{ilan.baslik}</h3>
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
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => router.push(`/ilans/${ilan._id}`)}
                          >
                            <Eye className="h-3 w-3 mr-1" />
                            Görüntüle
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => router.push(`/ilans/${ilan._id}/edit`)}
                          >
                            <Edit className="h-3 w-3 mr-1" />
                            Düzenle
                          </Button>
                        </div>
                        
                        <div className="flex gap-1">
                          {ilan.ilan_durumu === 'aktif' ? (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleStatusChange(ilan._id, 'pasif')}
                            >
                              Pasif Yap
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleStatusChange(ilan._id, 'aktif')}
                            >
                              Aktif Yap
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDelete(ilan._id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
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
                {searchTerm || statusFilter !== 'all' ? 'İlan Bulunamadı' : 'Henüz İlanınız Yok'}
              </h3>
              <p className="text-gray-500 mb-4">
                {searchTerm || statusFilter !== 'all' 
                  ? 'Arama kriterlerinize uygun ilan bulunamadı.'
                  : 'İlk ilanınızı vererek başlayın.'
                }
              </p>
              <Button onClick={() => router.push('/ilans/create')}>
                <Plus className="h-4 w-4 mr-2" />
                İlan Ver
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
