'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Save, X } from 'lucide-react';

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
  }>;
  createdAt: string;
  updatedAt: string;
}

export default function EditKategoriPage() {
  const params = useParams();
  const router = useRouter();
  const [kategori, setKategori] = useState<PaletKategori | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    ad: '',
    aciklama: ''
  });

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
        setFormData({
          ad: data.data.ad,
          aciklama: data.data.aciklama
        });
      }
    } catch (error) {
      console.error('Kategori yüklenemedi:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const response = await fetch(`/api/palets/kategoriler/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        router.push('/admin/palets/categories');
      } else {
        alert('Güncelleme başarısız: ' + data.message);
      }
    } catch (error) {
      console.error('Güncelleme hatası:', error);
      alert('Güncelleme sırasında bir hata oluştu');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    router.push('/admin/palets/categories');
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
            <h1 className="text-2xl font-bold text-gray-900">Kategori Düzenle</h1>
            <p className="text-gray-600">{kategori.ad} - {kategori.kategori_id}</p>
          </div>
        </div>
      </div>

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle>Kategori Bilgileri</CardTitle>
          <CardDescription>
            Kategori bilgilerini düzenleyin
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Kategori Adı
            </label>
            <Input
              value={formData.ad}
              onChange={(e) => setFormData({ ...formData, ad: e.target.value })}
              placeholder="Kategori adını girin"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Açıklama
            </label>
            <Textarea
              value={formData.aciklama}
              onChange={(e) => setFormData({ ...formData, aciklama: e.target.value })}
              placeholder="Kategori açıklaması"
              rows={4}
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              onClick={handleSave}
              disabled={saving}
              className="bg-orange-600 hover:bg-orange-700"
            >
              <Save className="h-4 w-4 mr-2" />
              {saving ? 'Kaydediliyor...' : 'Kaydet'}
            </Button>
            <Button
              variant="outline"
              onClick={handleCancel}
              disabled={saving}
            >
              <X className="h-4 w-4 mr-2" />
              İptal
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

