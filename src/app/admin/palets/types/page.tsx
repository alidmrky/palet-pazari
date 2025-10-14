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
  Ruler,
  Weight,
  Shield
} from 'lucide-react';

interface PaletVaryant {
  _id: string;
  varyant_id: string;
  malzeme: string;
  yuzey: string;
  agirlik_kg: number;
  kapasite_kg: {
    dinamik: number;
    statik: number;
    raf: number;
  };
  kategori_id: string;
  standart_id: string;
  model_id: string;
  uyumluluk: {
    ispm15: boolean;
    gida_hijyen: string;
  };
  createdAt: string;
  updatedAt: string;
}

export default function AdminPaletTypesPage() {
  const [varyantlar, setVaryantlar] = useState<PaletVaryant[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMalzeme, setFilterMalzeme] = useState('all');
  const [filterUyumluluk, setFilterUyumluluk] = useState('all');

  useEffect(() => {
    fetchVaryantlar();
  }, []);

  const fetchVaryantlar = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/palets/varyantlar');
      const data = await response.json();

      if (data.success) {
        setVaryantlar(data.data);
      }
    } catch (error) {
      console.error('Varyantlar yüklenemedi:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteVaryant = async (varyantId: string) => {
    if (!confirm('Bu varyantı silmek istediğinizden emin misiniz?')) {
      return;
    }

    try {
      const response = await fetch(`/api/palets/varyantlar/${varyantId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        await fetchVaryantlar(); // Refresh the list
      }
    } catch (error) {
      console.error('Varyant silme başarısız:', error);
    }
  };

  const handleViewVaryant = (varyant: PaletVaryant) => {
    window.location.href = `/admin/palets/types/view/${varyant._id}`;
  };

  const handleEditVaryant = (varyant: PaletVaryant) => {
    window.location.href = `/admin/palets/types/edit/${varyant._id}`;
  };

  const filteredVaryantlar = varyantlar.filter(varyant => {
    const matchesSearch = varyant.varyant_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         varyant.malzeme.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         varyant.yuzey.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesMalzeme = filterMalzeme === 'all' || varyant.malzeme === filterMalzeme;
    const matchesUyumluluk = filterUyumluluk === 'all' ||
                            (filterUyumluluk === 'ispm15' && varyant.uyumluluk.ispm15);

    return matchesSearch && matchesMalzeme && matchesUyumluluk;
  });

  const getMalzemeIcon = (malzeme: string) => {
    switch (malzeme) {
      case 'ahsap':
        return <Package className="h-4 w-4 text-amber-600" />;
      case 'plastik':
        return <Package className="h-4 w-4 text-blue-600" />;
      case 'metal':
        return <Package className="h-4 w-4 text-gray-600" />;
      case 'karton':
        return <Package className="h-4 w-4 text-yellow-600" />;
      default:
        return <Package className="h-4 w-4 text-gray-400" />;
    }
  };

  const getMalzemeBadge = (malzeme: string) => {
    const variants = {
      ahsap: { label: 'Ahşap', color: 'bg-amber-100 text-amber-800' },
      plastik: { label: 'Plastik', color: 'bg-blue-100 text-blue-800' },
      metal: { label: 'Metal', color: 'bg-gray-100 text-gray-800' },
      karton: { label: 'Karton', color: 'bg-yellow-100 text-yellow-800' }
    };

    const variant = variants[malzeme as keyof typeof variants] || { label: malzeme, color: 'bg-gray-100 text-gray-800' };
    return <Badge className={variant.color}>{variant.label}</Badge>;
  };

  const getYuzeyBadge = (yuzey: string) => {
    const variants = {
      pürüzlü: { label: 'Pürüzlü', color: 'bg-orange-100 text-orange-800' },
      düz: { label: 'Düz', color: 'bg-green-100 text-green-800' },
      kaplamalı: { label: 'Kaplamalı', color: 'bg-purple-100 text-purple-800' }
    };

    const variant = variants[yuzey as keyof typeof variants] || { label: yuzey, color: 'bg-gray-100 text-gray-800' };
    return <Badge className={variant.color}>{variant.label}</Badge>;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Palet Türleri</h1>
            <p className="text-gray-600">Palet varyantlarını yönetin</p>
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
          <h1 className="text-2xl font-bold text-gray-900">Palet Türleri</h1>
          <p className="text-gray-600">Palet varyantlarını ve özelliklerini yönetin</p>
        </div>
        <Button onClick={() => window.location.href = '/admin/palets/types/create'}>
          <Plus className="h-4 w-4 mr-2" />
          Yeni Varyant
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Varyant ara..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select
                value={filterMalzeme}
                onChange={(e) => setFilterMalzeme(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="all">Tüm Malzemeler</option>
                <option value="ahsap">Ahşap</option>
                <option value="plastik">Plastik</option>
                <option value="metal">Metal</option>
                <option value="karton">Karton</option>
              </select>
              <select
                value={filterUyumluluk}
                onChange={(e) => setFilterUyumluluk(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="all">Tüm Uyumluluklar</option>
                <option value="ispm15">ISPM 15 Uyumlu</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Variants Table */}
      <Card>
        <CardHeader>
          <CardTitle>Palet Varyantları ({filteredVaryantlar.length})</CardTitle>
          <CardDescription>
            Sistemde tanımlı palet varyantları
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Varyant</TableHead>
                  <TableHead>Malzeme</TableHead>
                  <TableHead>Yüzey</TableHead>
                  <TableHead>Ağırlık</TableHead>
                  <TableHead>Kapasite</TableHead>
                  <TableHead>Uyumluluk</TableHead>
                  <TableHead className="text-right">İşlemler</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredVaryantlar.map((varyant) => (
                  <TableRow key={varyant._id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 bg-orange-100 rounded-full flex items-center justify-center">
                          {getMalzemeIcon(varyant.malzeme)}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {varyant.varyant_id}
                          </p>
                          <p className="text-sm text-gray-500">
                            {varyant.kategori_id} / {varyant.standart_id} / {varyant.model_id}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {getMalzemeBadge(varyant.malzeme)}
                    </TableCell>
                    <TableCell>
                      {getYuzeyBadge(varyant.yuzey)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Weight className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-600">
                          {varyant.agirlik_kg} kg
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-1">
                          <Ruler className="h-3 w-3 text-blue-500" />
                          <span className="text-xs text-gray-600">
                            Dinamik: {varyant.kapasite_kg.dinamik} kg
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Ruler className="h-3 w-3 text-green-500" />
                          <span className="text-xs text-gray-600">
                            Statik: {varyant.kapasite_kg.statik} kg
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {varyant.uyumluluk.ispm15 && (
                          <Badge className="bg-green-100 text-green-800">
                            <Shield className="h-3 w-3 mr-1" />
                            ISPM 15
                          </Badge>
                        )}
                        <Badge className="bg-blue-100 text-blue-800">
                          {varyant.uyumluluk.gida_hijyen}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleViewVaryant(varyant)}>
                            <Eye className="h-4 w-4 mr-2" />
                            Detayları Görüntüle
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEditVaryant(varyant)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Düzenle
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDeleteVaryant(varyant._id)}
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
      {filteredVaryantlar.length === 0 && !loading && (
        <Card>
          <CardContent className="p-12 text-center">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm ? 'Arama sonucu bulunamadı' : 'Henüz varyant yok'}
            </h3>
            <p className="text-gray-500 mb-4">
              {searchTerm
                ? 'Arama kriterlerinizi değiştirmeyi deneyin'
                : 'İlk palet varyantını oluşturun'
              }
            </p>
            {!searchTerm && (
              <Button onClick={() => window.location.href = '/admin/palets/types/create'}>
                <Plus className="h-4 w-4 mr-2" />
                Yeni Varyant Oluştur
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
