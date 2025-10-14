'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Search,
  Plus,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  Package,
  Globe,
  Building
} from 'lucide-react';

interface PaletKategori {
  _id: string;
  kategori_id: string;
  ad: string;
  aciklama: string;
  standartlar: Array<{
    standart_id: string;
    ad: string;
    yonetici_kurum: string;
    modeller: Array<{
      model_id: string;
      ad: string;
      olcu: {
        uzunluk: number;
        genislik: number;
        yukseklik: number;
      };
      varyantlar: Array<{
        varyant_id: string;
        malzeme: string;
        yuzey: string;
      }>;
    }>;
  }>;
  createdAt: string;
  updatedAt: string;
}

export default function AdminPaletCategoriesPage() {
  const [kategoriler, setKategoriler] = useState<PaletKategori[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchKategoriler();
  }, []);

  const fetchKategoriler = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/palets/kategoriler');
      const data = await response.json();

      if (data.success) {
        setKategoriler(data.data);
      }
    } catch (error) {
      console.error('Kategoriler yüklenemedi:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteKategori = async (kategoriId: string) => {
    if (!confirm('Bu kategoriyi silmek istediğinizden emin misiniz?')) {
      return;
    }

    try {
      const response = await fetch(`/api/palets/kategoriler/${kategoriId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        await fetchKategoriler(); // Refresh the list
      }
    } catch (error) {
      console.error('Kategori silme başarısız:', error);
    }
  };

  const handleViewKategori = (kategori: PaletKategori) => {
    window.location.href = `/admin/palets/categories/view/${kategori._id}`;
  };

  const handleEditKategori = (kategori: PaletKategori) => {
    window.location.href = `/admin/palets/categories/edit/${kategori._id}`;
  };

  const filteredKategoriler = kategoriler.filter(kategori =>
    kategori.ad.toLowerCase().includes(searchTerm.toLowerCase()) ||
    kategori.aciklama.toLowerCase().includes(searchTerm.toLowerCase()) ||
    kategori.kategori_id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getKategoriIcon = (kategoriId: string) => {
    switch (kategoriId) {
      case 'EU':
        return <Globe className="h-4 w-4 text-blue-600" />;
      case 'US':
        return <Building className="h-4 w-4 text-red-600" />;
      case 'ASIA':
        return <Package className="h-4 w-4 text-green-600" />;
      default:
        return <Package className="h-4 w-4 text-gray-600" />;
    }
  };

  const getKategoriBadge = (kategoriId: string) => {
    const variants = {
      EU: { label: 'Avrupa', color: 'bg-blue-100 text-blue-800' },
      US: { label: 'Amerika', color: 'bg-red-100 text-red-800' },
      ASIA: { label: 'Asya', color: 'bg-green-100 text-green-800' }
    };

    const variant = variants[kategoriId as keyof typeof variants] || { label: kategoriId, color: 'bg-gray-100 text-gray-800' };
    return <Badge className={variant.color}>{variant.label}</Badge>;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Palet Kategorileri</h1>
            <p className="text-gray-600">Palet kategorilerini yönetin</p>
          </div>
        </div>
        <div className="animate-pulse">
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Palet Kategorileri</h1>
          <p className="text-gray-600">Palet kategorilerini ve standartlarını yönetin</p>
        </div>
        <Button onClick={() => window.location.href = '/admin/palets/categories/create'}>
          <Plus className="h-4 w-4 mr-2" />
          Yeni Kategori
        </Button>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Kategori ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Categories Table */}
      <Card>
        <CardHeader>
          <CardTitle>Kategoriler ({filteredKategoriler.length})</CardTitle>
          <CardDescription>
            Sistemde tanımlı palet kategorileri
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Kategori</TableHead>
                  <TableHead>Bölge</TableHead>
                  <TableHead>Standartlar</TableHead>
                  <TableHead>Modeller</TableHead>
                  <TableHead>Varyantlar</TableHead>
                  <TableHead>Oluşturma</TableHead>
                  <TableHead className="text-right">İşlemler</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredKategoriler.map((kategori) => (
                  <TableRow key={kategori._id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 bg-orange-100 rounded-full flex items-center justify-center">
                          {getKategoriIcon(kategori.kategori_id)}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {kategori.ad}
                          </p>
                          <p className="text-sm text-gray-500">{kategori.kategori_id}</p>
                          <p className="text-xs text-gray-400 max-w-xs truncate">
                            {kategori.aciklama}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {getKategoriBadge(kategori.kategori_id)}
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-gray-600">
                        {kategori.standartlar.length} standart
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-gray-600">
                        {kategori.standartlar.reduce((total, standart) => total + standart.modeller.length, 0)} model
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-gray-600">
                        {kategori.standartlar.reduce((total, standart) =>
                          total + standart.modeller.reduce((modelTotal, model) =>
                            modelTotal + model.varyantlar.length, 0), 0)} varyant
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-gray-600">
                        {new Date(kategori.createdAt).toLocaleDateString('tr-TR')}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleViewKategori(kategori)}>
                            <Eye className="h-4 w-4 mr-2" />
                            Detayları Görüntüle
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEditKategori(kategori)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Düzenle
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDeleteKategori(kategori._id)}
                            className="text-red-600"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Sil
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Empty State */}
      {filteredKategoriler.length === 0 && !loading && (
        <Card>
          <CardContent className="p-12 text-center">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm ? 'Arama sonucu bulunamadı' : 'Henüz kategori yok'}
            </h3>
            <p className="text-gray-500 mb-4">
              {searchTerm
                ? 'Arama kriterlerinizi değiştirmeyi deneyin'
                : 'İlk palet kategorisini oluşturun'
              }
            </p>
            {!searchTerm && (
              <Button onClick={() => window.location.href = '/admin/palets/categories/create'}>
                <Plus className="h-4 w-4 mr-2" />
                Yeni Kategori Oluştur
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
