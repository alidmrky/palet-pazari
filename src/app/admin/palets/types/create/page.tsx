'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Save, X } from 'lucide-react';

export default function CreateVaryantPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    varyant_id: '',
    malzeme: 'ahsap',
    yuzey: 'pürüzlü',
    agirlik_kg: 0,
    kapasite_kg: {
      dinamik: 0,
      statik: 0,
      raf: 0
    },
    kategori_id: '',
    standart_id: '',
    model_id: '',
    uyumluluk: {
      ispm15: false,
      gida_hijyen: 'uygun'
    }
  });

  const handleSave = async () => {
    try {
      setSaving(true);
      const response = await fetch('/api/palets/varyantlar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        router.push('/admin/palets/types');
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
    router.push('/admin/palets/types');
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
            <h1 className="text-2xl font-bold text-gray-900">Yeni Varyant</h1>
            <p className="text-gray-600">Yeni palet varyantı oluşturun</p>
          </div>
        </div>
      </div>

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle>Varyant Bilgileri</CardTitle>
          <CardDescription>
            Yeni varyant için gerekli bilgileri girin
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Varyant ID
              </label>
              <Input
                value={formData.varyant_id}
                onChange={(e) => setFormData({ ...formData, varyant_id: e.target.value })}
                placeholder="Varyant ID"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Kategori ID
              </label>
              <Input
                value={formData.kategori_id}
                onChange={(e) => setFormData({ ...formData, kategori_id: e.target.value })}
                placeholder="EU, US, ASIA"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Standart ID
              </label>
              <Input
                value={formData.standart_id}
                onChange={(e) => setFormData({ ...formData, standart_id: e.target.value })}
                placeholder="Standart ID"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Model ID
            </label>
            <Input
              value={formData.model_id}
              onChange={(e) => setFormData({ ...formData, model_id: e.target.value })}
              placeholder="Model ID"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Malzeme
              </label>
              <select
                value={formData.malzeme}
                onChange={(e) => setFormData({ ...formData, malzeme: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="ahsap">Ahşap</option>
                <option value="plastik">Plastik</option>
                <option value="metal">Metal</option>
                <option value="karton">Karton</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Yüzey
              </label>
              <select
                value={formData.yuzey}
                onChange={(e) => setFormData({ ...formData, yuzey: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="pürüzlü">Pürüzlü</option>
                <option value="düz">Düz</option>
                <option value="kaplamalı">Kaplamalı</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ağırlık (kg)
            </label>
            <Input
              type="number"
              value={formData.agirlik_kg}
              onChange={(e) => setFormData({ ...formData, agirlik_kg: parseFloat(e.target.value) || 0 })}
              placeholder="Ağırlık"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Dinamik Kapasite (kg)
              </label>
              <Input
                type="number"
                value={formData.kapasite_kg.dinamik}
                onChange={(e) => setFormData({
                  ...formData,
                  kapasite_kg: {
                    ...formData.kapasite_kg,
                    dinamik: parseFloat(e.target.value) || 0
                  }
                })}
                placeholder="Dinamik kapasite"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Statik Kapasite (kg)
              </label>
              <Input
                type="number"
                value={formData.kapasite_kg.statik}
                onChange={(e) => setFormData({
                  ...formData,
                  kapasite_kg: {
                    ...formData.kapasite_kg,
                    statik: parseFloat(e.target.value) || 0
                  }
                })}
                placeholder="Statik kapasite"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Raf Kapasitesi (kg)
              </label>
              <Input
                type="number"
                value={formData.kapasite_kg.raf}
                onChange={(e) => setFormData({
                  ...formData,
                  kapasite_kg: {
                    ...formData.kapasite_kg,
                    raf: parseFloat(e.target.value) || 0
                  }
                })}
                placeholder="Raf kapasitesi"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.uyumluluk.ispm15}
                  onChange={(e) => setFormData({
                    ...formData,
                    uyumluluk: {
                      ...formData.uyumluluk,
                      ispm15: e.target.checked
                    }
                  })}
                  className="rounded"
                />
                <span className="text-sm font-medium text-gray-700">ISPM 15 Uyumlu</span>
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Gıda Hijyeni
              </label>
              <select
                value={formData.uyumluluk.gida_hijyen}
                onChange={(e) => setFormData({
                  ...formData,
                  uyumluluk: {
                    ...formData.uyumluluk,
                    gida_hijyen: e.target.value
                  }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="uygun">Uygun</option>
                <option value="uygun_değil">Uygun Değil</option>
                <option value="belirsiz">Belirsiz</option>
              </select>
            </div>
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

