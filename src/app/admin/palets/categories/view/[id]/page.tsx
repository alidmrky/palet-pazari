'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Package, Globe, Building, Edit, Trash2 } from 'lucide-react';

interface PaletKategori {
  _id: string;
  kategori_id: string;
  ad: string;
  aciklama: string;
  standartlar: Array<{
    standart_id: string;
    ad: string;
    yonetici_kurum: string;
    notlar?: string;
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

export default function ViewKategoriPage() {
  const params = useParams();
  const router = useRouter();
  const [kategori, setKategori] = useState<PaletKategori | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.id) {
      fetchKategori();
    }
  }, [params.id]);

  const fetchKategori = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/palets/kategoriler/${params.id}`);
      const data = await response.json();

      if (data.success) {
        setKategori(data.data);
      }
    } catch (error) {
      console.error('Kategori yüklenemedi:', error);
    } finally {
      setLoading(false);
    }
  };

  const getKategoriIcon = (kategoriId: string) => {
    switch (kategoriId) {
      case 'EU':
        return <Globe className="h-6 w-6 text-blue-600" />;
      case 'US':
        return <Building className="h-6 w-6 text-red-600" />;
      case 'ASIA':
        return <Package className="h-6 w-6 text-green-600" />;
      default:
        return <Package className="h-6 w-6 text-gray-600" />;
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
        <div className="animate-pulse">
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!kategori) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-12 text-center">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Kategori Bulunamadı</h3>
            <p className="text-gray-500 mb-4">Aradığınız kategori bulunamadı.</p>
            <Button onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Geri Dön
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Geri Dön
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{kategori.ad}</h1>
            <p className="text-gray-600">Kategori Detayları</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => router.push(`/admin/palets/categories/edit/${kategori._id}`)}
          >
            <Edit className="h-4 w-4 mr-2" />
            Düzenle
          </Button>
          <Button
            variant="destructive"
            onClick={() => {
              if (confirm('Bu kategoriyi silmek istediğinizden emin misiniz?')) {
                // Silme işlemi
                router.push('/admin/palets/categories');
              }
            }}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Sil
          </Button>
        </div>
      </div>

      {/* Kategori Bilgileri */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            {getKategoriIcon(kategori.kategori_id)}
            {kategori.ad}
            {getKategoriBadge(kategori.kategori_id)}
          </CardTitle>
          <CardDescription>
            ID: {kategori.kategori_id}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Açıklama</h4>
              <p className="text-gray-600">{kategori.aciklama}</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-1">Standartlar</h4>
                <p className="text-2xl font-bold text-orange-600">{kategori.standartlar.length}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-1">Modeller</h4>
                <p className="text-2xl font-bold text-blue-600">
                  {kategori.standartlar.reduce((total, standart) => total + standart.modeller.length, 0)}
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-1">Varyantlar</h4>
                <p className="text-2xl font-bold text-green-600">
                  {kategori.standartlar.reduce((total, standart) =>
                    total + standart.modeller.reduce((modelTotal, model) =>
                      modelTotal + model.varyantlar.length, 0), 0)}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Standartlar */}
      <Card>
        <CardHeader>
          <CardTitle>Standartlar ({kategori.standartlar.length})</CardTitle>
          <CardDescription>
            Bu kategoriye ait standartlar
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {kategori.standartlar.map((standart, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900">{standart.ad}</h4>
                  <Badge variant="outline">{standart.yonetici_kurum}</Badge>
                </div>
                <p className="text-sm text-gray-600 mb-2">ID: {standart.standart_id}</p>
                {standart.notlar && (
                  <p className="text-sm text-gray-500">{standart.notlar}</p>
                )}
                <div className="mt-3">
                  <p className="text-sm text-gray-600">
                    {standart.modeller.length} model,{' '}
                    {standart.modeller.reduce((total, model) => total + model.varyantlar.length, 0)} varyant
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

