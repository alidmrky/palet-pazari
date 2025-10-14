'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Package, Weight, Ruler, Shield, Edit, Trash2, Hammer, Box, Drill, Truck, Layers, Wrench } from 'lucide-react';

interface PaletTeknik {
  yapi_tipi: string;
  ust_tablo: {
    tahta_sayisi: number;
    tahtalar: Array<{
      genislik: number;
      kalinlik: number;
      konum: string;
    }>;
    tahta_araliklari: number[];
  };
  alt_tablo: {
    tahta_sayisi: number;
    tahtalar: Array<{
      genislik: number;
      kalinlik: number;
      konum: string;
    }>;
  };
  bloklar: {
    adet: number;
    olcu: {
      uzunluk: number;
      genislik: number;
      yukseklik: number;
    };
    dizilim: string;
  };
  civi: {
    adet: number;
    tip: string;
  };
  forklift_acikliklari: {
    sol_sag_yukseklik: number;
    on_arka_yukseklik: number;
  };
  toleranslar: {
    uzunluk: string;
    genislik: string;
    yukseklik: string;
  };
}

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
  teknik: PaletTeknik;
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

export default function ViewVaryantPage() {
  const params = useParams();
  const router = useRouter();
  const [varyant, setVaryant] = useState<PaletVaryant | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.id) {
      fetchVaryant();
    }
  }, [params.id]);

  const fetchVaryant = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/palets/varyantlar/${params.id}`);
      const data = await response.json();

      if (data.success) {
        setVaryant(data.data);
      }
    } catch (error) {
      console.error('Varyant yüklenemedi:', error);
    } finally {
      setLoading(false);
    }
  };

  const getMalzemeIcon = (malzeme: string) => {
    switch (malzeme) {
      case 'ahsap':
        return <Package className="h-6 w-6 text-amber-600" />;
      case 'plastik':
        return <Package className="h-6 w-6 text-blue-600" />;
      case 'metal':
        return <Package className="h-6 w-6 text-gray-600" />;
      case 'karton':
        return <Package className="h-6 w-6 text-yellow-600" />;
      default:
        return <Package className="h-6 w-6 text-gray-400" />;
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
        <div className="animate-pulse">
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!varyant) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-12 text-center">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Varyant Bulunamadı</h3>
            <p className="text-gray-500 mb-4">Aradığınız varyant bulunamadı.</p>
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
            <h1 className="text-2xl font-bold text-gray-900">{varyant.varyant_id}</h1>
            <p className="text-gray-600">Varyant Detayları</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => router.push(`/admin/palets/types/edit/${varyant._id}`)}
          >
            <Edit className="h-4 w-4 mr-2" />
            Düzenle
          </Button>
          <Button
            variant="destructive"
            onClick={() => {
              if (confirm('Bu varyantı silmek istediğinizden emin misiniz?')) {
                // Silme işlemi
                router.push('/admin/palets/types');
              }
            }}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Sil
          </Button>
        </div>
      </div>

      {/* Varyant Bilgileri */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            {getMalzemeIcon(varyant.malzeme)}
            {varyant.varyant_id}
            {getMalzemeBadge(varyant.malzeme)}
            {getYuzeyBadge(varyant.yuzey)}
          </CardTitle>
          <CardDescription>
            {varyant.kategori_id} / {varyant.standart_id} / {varyant.model_id}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Ağırlık */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Weight className="h-5 w-5 text-gray-600" />
                <h4 className="font-medium text-gray-900">Ağırlık</h4>
              </div>
              <p className="text-2xl font-bold text-orange-600">{varyant.agirlik_kg} kg</p>
            </div>

            {/* Dinamik Kapasite */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Ruler className="h-5 w-5 text-blue-600" />
                <h4 className="font-medium text-gray-900">Dinamik Kapasite</h4>
              </div>
              <p className="text-2xl font-bold text-blue-600">{varyant.kapasite_kg.dinamik} kg</p>
            </div>

            {/* Statik Kapasite */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Ruler className="h-5 w-5 text-green-600" />
                <h4 className="font-medium text-gray-900">Statik Kapasite</h4>
              </div>
              <p className="text-2xl font-bold text-green-600">{varyant.kapasite_kg.statik} kg</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Uyumluluk */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Uyumluluk
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-green-600" />
                <span className="font-medium">ISPM 15:</span>
                <Badge className={varyant.uyumluluk.ispm15 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                  {varyant.uyumluluk.ispm15 ? 'Uyumlu' : 'Uyumsuz'}
                </Badge>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-blue-600" />
                <span className="font-medium">Gıda Hijyeni:</span>
                <Badge className="bg-blue-100 text-blue-800">
                  {varyant.uyumluluk.gida_hijyen}
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Teknik Detaylar */}
      {varyant.teknik && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Hammer className="h-5 w-5" />
              Teknik Detaylar
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Yapı Tipi */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Wrench className="h-4 w-4 text-gray-600" />
                <h4 className="font-medium text-gray-900">Yapı Tipi</h4>
              </div>
              <p className="text-lg font-semibold text-gray-700">{varyant.teknik.yapi_tipi}</p>
            </div>

            {/* Üst Tablo */}
            <div className="border-t pt-4">
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Box className="h-4 w-4" />
                Üst Tablo
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-blue-50 p-3 rounded">
                  <p className="text-sm text-gray-600">Tahta Sayısı</p>
                  <p className="font-semibold text-blue-700">{varyant.teknik.ust_tablo.tahta_sayisi}</p>
                </div>
                <div className="bg-blue-50 p-3 rounded">
                  <p className="text-sm text-gray-600">Tahta Aralıkları</p>
                  <p className="font-semibold text-blue-700">{varyant.teknik.ust_tablo.tahta_araliklari.join(', ')} mm</p>
                </div>
              </div>

              {/* Tahta Detayları */}
              {varyant.teknik.ust_tablo.tahtalar && varyant.teknik.ust_tablo.tahtalar.length > 0 && (
                <div className="mt-4">
                  <h5 className="font-medium text-gray-700 mb-2">Tahta Detayları:</h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {varyant.teknik.ust_tablo.tahtalar.map((tahta, index) => (
                      <div key={index} className="bg-gray-50 p-3 rounded border">
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div><span className="font-medium">Genişlik:</span> {tahta.genislik} mm</div>
                          <div><span className="font-medium">Kalınlık:</span> {tahta.kalinlik} mm</div>
                          <div className="col-span-2"><span className="font-medium">Konum:</span> {tahta.konum}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Alt Tablo */}
            <div className="border-t pt-4">
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Box className="h-4 w-4" />
                Alt Tablo
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-green-50 p-3 rounded">
                  <p className="text-sm text-gray-600">Tahta Sayısı</p>
                  <p className="font-semibold text-green-700">{varyant.teknik.alt_tablo.tahta_sayisi}</p>
                </div>
              </div>

              {/* Alt Tablo Tahta Detayları */}
              {varyant.teknik.alt_tablo.tahtalar && varyant.teknik.alt_tablo.tahtalar.length > 0 && (
                <div className="mt-4">
                  <h5 className="font-medium text-gray-700 mb-2">Tahta Detayları:</h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {varyant.teknik.alt_tablo.tahtalar.map((tahta, index) => (
                      <div key={index} className="bg-gray-50 p-3 rounded border">
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div><span className="font-medium">Genişlik:</span> {tahta.genislik} mm</div>
                          <div><span className="font-medium">Kalınlık:</span> {tahta.kalinlik} mm</div>
                          <div className="col-span-2"><span className="font-medium">Konum:</span> {tahta.konum}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Bloklar */}
            <div className="border-t pt-4">
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Layers className="h-4 w-4" />
                Bloklar
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-purple-50 p-3 rounded">
                  <p className="text-sm text-gray-600">Adet</p>
                  <p className="font-semibold text-purple-700">{varyant.teknik.bloklar.adet}</p>
                </div>
                <div className="bg-purple-50 p-3 rounded">
                  <p className="text-sm text-gray-600">Ölçüler</p>
                  <p className="font-semibold text-purple-700">
                    {varyant.teknik.bloklar.olcu.uzunluk} x {varyant.teknik.bloklar.olcu.genislik} x {varyant.teknik.bloklar.olcu.yukseklik} mm
                  </p>
                </div>
                <div className="bg-purple-50 p-3 rounded">
                  <p className="text-sm text-gray-600">Dizilim</p>
                  <p className="font-semibold text-purple-700">{varyant.teknik.bloklar.dizilim}</p>
                </div>
              </div>
            </div>

            {/* Çivi */}
            <div className="border-t pt-4">
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Drill className="h-4 w-4" />
                Çivi
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-orange-50 p-3 rounded">
                  <p className="text-sm text-gray-600">Adet</p>
                  <p className="font-semibold text-orange-700">{varyant.teknik.civi.adet}</p>
                </div>
                <div className="bg-orange-50 p-3 rounded">
                  <p className="text-sm text-gray-600">Tip</p>
                  <p className="font-semibold text-orange-700">{varyant.teknik.civi.tip}</p>
                </div>
              </div>
            </div>

            {/* Forklift Açıklıkları */}
            <div className="border-t pt-4">
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Truck className="h-4 w-4" />
                Forklift Açıklıkları
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-cyan-50 p-3 rounded">
                  <p className="text-sm text-gray-600">Sol-Sağ Yükseklik</p>
                  <p className="font-semibold text-cyan-700">{varyant.teknik.forklift_acikliklari.sol_sag_yukseklik} mm</p>
                </div>
                <div className="bg-cyan-50 p-3 rounded">
                  <p className="text-sm text-gray-600">Ön-Arka Yükseklik</p>
                  <p className="font-semibold text-cyan-700">{varyant.teknik.forklift_acikliklari.on_arka_yukseklik} mm</p>
                </div>
              </div>
            </div>

            {/* Toleranslar */}
            <div className="border-t pt-4">
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Ruler className="h-4 w-4" />
                Toleranslar
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-indigo-50 p-3 rounded">
                  <p className="text-sm text-gray-600">Uzunluk</p>
                  <p className="font-semibold text-indigo-700">{varyant.teknik.toleranslar.uzunluk}</p>
                </div>
                <div className="bg-indigo-50 p-3 rounded">
                  <p className="text-sm text-gray-600">Genişlik</p>
                  <p className="font-semibold text-indigo-700">{varyant.teknik.toleranslar.genislik}</p>
                </div>
                <div className="bg-indigo-50 p-3 rounded">
                  <p className="text-sm text-gray-600">Yükseklik</p>
                  <p className="font-semibold text-indigo-700">{varyant.teknik.toleranslar.yukseklik}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
