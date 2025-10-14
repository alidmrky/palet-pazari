'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  ArrowLeft,
  MapPin,
  Calendar,
  Eye,
  Package,
  Phone,
  Mail,
  Star,
  Share2,
  Heart,
  Download,
  ChevronLeft,
  ChevronRight,
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
  adres_detay?: string;
  fotograflar: string[];
  teslimat_secenekleri: string[];
  sertifikalar: string[];
  ozel_sartlar?: string;
  iletisim_telefon?: string;
  iletisim_email?: string;
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

export default function IlanDetayPage() {
  const params = useParams();
  const [ilan, setIlan] = useState<Ilan | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  useEffect(() => {
    if (params.id) {
      fetchIlan();
    }
  }, [params.id]);

  const fetchIlan = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/ilans/${params.id}`);
      const data = await response.json();

      if (data.success) {
        setIlan(data.data);
      }
    } catch (error) {
      console.error('İlan yüklenemedi:', error);
    } finally {
      setLoading(false);
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const nextImage = () => {
    if (ilan && ilan.fotograflar.length > 0) {
      setCurrentImageIndex((prev) => (prev + 1) % ilan.fotograflar.length);
    }
  };

  const prevImage = () => {
    if (ilan && ilan.fotograflar.length > 0) {
      setCurrentImageIndex((prev) => (prev - 1 + ilan.fotograflar.length) % ilan.fotograflar.length);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (!ilan) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-12 text-center">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">İlan Bulunamadı</h3>
            <p className="text-gray-500 mb-4">Aradığınız ilan bulunamadı.</p>
            <Button asChild>
              <Link href="/ilans">
                <ArrowLeft className="h-4 w-4 mr-2" />
                İlanlara Dön
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button variant="ghost" asChild className="mb-4">
            <Link href="/ilans">
              <ArrowLeft className="h-4 w-4 mr-2" />
              İlanlara Dön
            </Link>
          </Button>

          <div className="flex items-center gap-4 mb-4">
            {getIlanTipiBadge(ilan.ilan_tipi)}
            {getDurumBadge(ilan.durum)}
            <Badge variant="outline">
              <Eye className="h-3 w-3 mr-1" />
              {ilan.goruntulenme_sayisi} görüntülenme
            </Badge>
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-2">{ilan.baslik}</h1>
          <p className="text-gray-600">{formatDate(ilan.createdAt)}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Ana İçerik */}
          <div className="lg:col-span-2 space-y-6">
            {/* Fotoğraflar */}
            {ilan.fotograflar.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Fotoğraflar</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Ana Fotoğraf */}
                    <div className="relative">
                      <img
                        src={ilan.fotograflar[currentImageIndex]}
                        alt={`${ilan.baslik} - Fotoğraf ${currentImageIndex + 1}`}
                        className="w-full h-96 object-cover rounded-lg cursor-pointer"
                        onClick={() => setLightboxOpen(true)}
                      />

                      {ilan.fotograflar.length > 1 && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            className="absolute left-2 top-1/2 transform -translate-y-1/2"
                            onClick={prevImage}
                          >
                            <ChevronLeft className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="absolute right-2 top-1/2 transform -translate-y-1/2"
                            onClick={nextImage}
                          >
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>

                    {/* Küçük Fotoğraflar */}
                    {ilan.fotograflar.length > 1 && (
                      <div className="grid grid-cols-4 gap-2">
                        {ilan.fotograflar.map((foto, index) => (
                          <img
                            key={index}
                            src={foto}
                            alt={`${ilan.baslik} - Fotoğraf ${index + 1}`}
                            className={`w-full h-20 object-cover rounded cursor-pointer border-2 ${
                              index === currentImageIndex ? 'border-orange-500' : 'border-transparent'
                            }`}
                            onClick={() => setCurrentImageIndex(index)}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Açıklama */}
            <Card>
              <CardHeader>
                <CardTitle>Açıklama</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 whitespace-pre-wrap">{ilan.aciklama}</p>
              </CardContent>
            </Card>

            {/* Teknik Detaylar */}
            <Card>
              <CardHeader>
                <CardTitle>Teknik Detaylar</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="font-medium">Kategori:</span>
                    <p className="text-gray-600">{ilan.kategori_id}</p>
                  </div>
                  <div>
                    <span className="font-medium">Standart:</span>
                    <p className="text-gray-600">{ilan.standart_id}</p>
                  </div>
                  <div>
                    <span className="font-medium">Model:</span>
                    <p className="text-gray-600">{ilan.model_id}</p>
                  </div>
                  <div>
                    <span className="font-medium">Varyant:</span>
                    <p className="text-gray-600">{ilan.varyant_id}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Teslimat Seçenekleri */}
            {ilan.teslimat_secenekleri.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Teslimat Seçenekleri</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {ilan.teslimat_secenekleri.map((secenek, index) => (
                      <Badge key={index} variant="outline">
                        {secenek === 'yerinde_teslim' && 'Yerinde Teslim'}
                        {secenek === 'kargo' && 'Kargo'}
                        {secenek === 'anlasmali_kargo' && 'Anlaşmalı Kargo'}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Özel Şartlar */}
            {ilan.ozel_sartlar && (
              <Card>
                <CardHeader>
                  <CardTitle>Özel Şartlar</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 whitespace-pre-wrap">{ilan.ozel_sartlar}</p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Satıcı Bilgileri */}
            <Card>
              <CardHeader>
                <CardTitle>Satıcı Bilgileri</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold">
                    {ilan.user_id.individualInfo
                      ? `${ilan.user_id.individualInfo.ad} ${ilan.user_id.individualInfo.soyad}`
                      : ilan.user_id.companyInfo?.sirket_adi || 'Kullanıcı'
                    }
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {ilan.user_id.userType === 'individual' ? 'Bireysel' : 'Kurumsal'}
                  </p>
                </div>

                <div className="space-y-2">
                  {ilan.iletisim_telefon && (
                    <Button variant="outline" className="w-full justify-start">
                      <Phone className="h-4 w-4 mr-2" />
                      {ilan.iletisim_telefon}
                    </Button>
                  )}
                  {ilan.iletisim_email && (
                    <Button variant="outline" className="w-full justify-start">
                      <Mail className="h-4 w-4 mr-2" />
                      {ilan.iletisim_email}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* İlan Bilgileri */}
            <Card>
              <CardHeader>
                <CardTitle>İlan Bilgileri</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Miktar:</span>
                  <span className="font-medium">{ilan.miktar} {ilan.miktar_birimi}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Durum:</span>
                  <span className="font-medium">{ilan.durum === 'sifir' ? 'Sıfır' : 'İkinci El'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Konum:</span>
                  <span className="font-medium">{ilan.sehir} {ilan.ilce}</span>
                </div>
                {ilan.mahalle && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Mahalle:</span>
                    <span className="font-medium">{ilan.mahalle}</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Konum */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Konum
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="font-medium">{ilan.sehir} {ilan.ilce}</p>
                  {ilan.mahalle && <p className="text-sm text-muted-foreground">{ilan.mahalle}</p>}
                  {ilan.adres_detay && (
                    <p className="text-sm text-muted-foreground">{ilan.adres_detay}</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Aksiyonlar */}
            <Card>
              <CardHeader>
                <CardTitle>Aksiyonlar</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button className="w-full">
                  <Heart className="h-4 w-4 mr-2" />
                  Favorilere Ekle
                </Button>
                <Button variant="outline" className="w-full">
                  <Share2 className="h-4 w-4 mr-2" />
                  Paylaş
                </Button>
                <Button variant="outline" className="w-full">
                  <Download className="h-4 w-4 mr-2" />
                  PDF İndir
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Lightbox */}
      {lightboxOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center">
          <div className="relative max-w-4xl max-h-full">
            <img
              src={ilan.fotograflar[currentImageIndex]}
              alt={`${ilan.baslik} - Fotoğraf ${currentImageIndex + 1}`}
              className="max-w-full max-h-full object-contain"
            />

            {ilan.fotograflar.length > 1 && (
              <>
                <Button
                  size="sm"
                  variant="outline"
                  className="absolute left-4 top-1/2 transform -translate-y-1/2"
                  onClick={prevImage}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="absolute right-4 top-1/2 transform -translate-y-1/2"
                  onClick={nextImage}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </>
            )}

            <Button
              size="sm"
              variant="outline"
              className="absolute top-4 right-4"
              onClick={() => setLightboxOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
