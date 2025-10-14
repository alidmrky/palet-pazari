'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Save, X } from 'lucide-react';

export default function CreateKategoriPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    kategori_id: '',
    ad: '',
    aciklama: ''
  });

  const handleSave = async () => {
    try {
      setSaving(true);
      const response = await fetch('/api/palets/kategoriler', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        router.push('/admin/palets/categories');
      } else {
        alert('Oluşturma başarısız: ' + data.message);
      }
    } catch (error) {
      console.error('Oluşturma hatası:', error);
      alert('Oluşturma sırasında bir hata oluştu');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    router.push('/admin/palets/categories');
  };

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
            <h1 className="text-2xl font-bold text-gray-900">Yeni Kategori</h1>
            <p className="text-gray-600">Yeni palet kategorisi oluşturun</p>
          </div>
        </div>
      </div>

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle>Kategori Bilgileri</CardTitle>
          <CardDescription>
            Yeni kategori için gerekli bilgileri girin
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Kategori ID
            </label>
            <Input
              value={formData.kategori_id}
              onChange={(e) => setFormData({ ...formData, kategori_id: e.target.value })}
              placeholder="EU, US, ASIA gibi"
            />
          </div>

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
              {saving ? 'Oluşturuluyor...' : 'Oluştur'}
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

