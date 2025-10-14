'use client';

import React, { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, ArrowRight, Upload, X, MapPin, Phone, Mail, Package, CheckCircle } from 'lucide-react';
import PaletSelector from '@/components/PaletSelector';

interface PaletSelection {
  ust_kategori_id: string;
  kategori_id: string;
  standart_id: string;
  model_id: string;
  varyant_id: string;
}

export default function IlanOlusturPage() {
  const { data: session } = useSession();
  const router = useRouter();

  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Form verileri
  const [formData, setFormData] = useState({
    ilan_tipi: 'satilik',
    durum: 'sifir',
    miktar: 1,
    miktar_birimi: 'adet',
    baslik: '',
    aciklama: '',
    sehir: '',
    ilce: '',
    mahalle: '',
    adres_detay: '',
    fotograflar: [] as string[],
    teslimat_secenekleri: ['yerinde_teslim'],
    sertifikalar: [] as string[],
    ozel_sartlar: '',
    iletisim_telefon: '',
    iletisim_email: session?.user?.email || ''
  });

  const [paletSelection, setPaletSelection] = useState<PaletSelection | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

  const steps = [
    { id: 1, title: 'İlan Tipi', description: 'Satılık veya Aranıyor' },
    { id: 2, title: 'Ürün Seçimi', description: 'Palet kategorisi ve varyantı' },
    { id: 3, title: 'Durum & Miktar', description: 'Ürün durumu ve miktarı' },
    { id: 4, title: 'Açıklama', description: 'Detaylı ilan açıklaması' },
    { id: 5, title: 'Konum', description: 'Şehir, ilçe ve mahalle' },
    { id: 6, title: 'Fotoğraflar', description: 'Ürün fotoğrafları' },
    { id: 7, title: 'Teslimat', description: 'Teslimat seçenekleri' },
    { id: 8, title: 'İletişim', description: 'İletişim bilgileri' }
  ];

  const handleNext = () => {
    if (currentStep < 8) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);

    if (files.length + uploadedFiles.length > 5) {
      alert('Maksimum 5 fotoğraf yükleyebilirsiniz');
      return;
    }

    for (const file of files) {
      const formData = new FormData();
      formData.append('file', file);

      try {
        const response = await fetch('/api/upload/image', {
          method: 'POST',
          body: formData
        });

        const data = await response.json();

        if (data.success) {
          setFormData(prev => ({
            ...prev,
            fotograflar: [...prev.fotograflar, data.data.fileUrl]
          }));
          setUploadedFiles(prev => [...prev, file]);
        }
      } catch (error) {
        console.error('Dosya yükleme hatası:', error);
      }
    }
  };

  const removePhoto = (index: number) => {
    setFormData(prev => ({
      ...prev,
      fotograflar: prev.fotograflar.filter((_, i) => i !== index)
    }));
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!paletSelection) {
      alert('Lütfen bir palet seçin');
      return;
    }

    if (formData.aciklama.length < 50) {
      alert('Açıklama en az 50 karakter olmalı');
      return;
    }

    if (formData.fotograflar.length === 0) {
      alert('En az 1 fotoğraf yükleyin');
      return;
    }

    try {
      setLoading(true);

      const response = await fetch('/api/ilans', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          ...paletSelection,
          user_id: session?.user?.id
        })
      });

      const data = await response.json();

      if (data.success) {
        router.push(`/ilans/${data.data._id}`);
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error('İlan oluşturma hatası:', error);
      alert('İlan oluşturulurken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Button
                variant={formData.ilan_tipi === 'satilik' ? 'default' : 'outline'}
                onClick={() => setFormData(prev => ({ ...prev, ilan_tipi: 'satilik' }))}
                className="h-20"
              >
                <Package className="h-6 w-6 mr-2" />
                Satılık
              </Button>
              <Button
                variant={formData.ilan_tipi === 'araniyor' ? 'default' : 'outline'}
                onClick={() => setFormData(prev => ({ ...prev, ilan_tipi: 'araniyor' }))}
                className="h-20"
              >
                <Package className="h-6 w-6 mr-2" />
                Aranıyor
              </Button>
            </div>
          </div>
        );

      case 2:
        return (
          <PaletSelector
            onSelectionChange={setPaletSelection}
            initialSelection={paletSelection || undefined}
          />
        );

      case 3:
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Button
                variant={formData.durum === 'sifir' ? 'default' : 'outline'}
                onClick={() => setFormData(prev => ({ ...prev, durum: 'sifir' }))}
                className="h-20"
              >
                <CheckCircle className="h-6 w-6 mr-2" />
                Sıfır
              </Button>
              <Button
                variant={formData.durum === 'ikinci_el' ? 'default' : 'outline'}
                onClick={() => setFormData(prev => ({ ...prev, durum: 'ikinci_el' }))}
                className="h-20"
              >
                <Package className="h-6 w-6 mr-2" />
                İkinci El
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="miktar">Miktar</Label>
                <Input
                  id="miktar"
                  type="number"
                  value={formData.miktar}
                  onChange={(e) => setFormData(prev => ({ ...prev, miktar: parseInt(e.target.value) || 1 }))}
                  min="1"
                />
              </div>
              <div>
                <Label htmlFor="miktar_birimi">Birim</Label>
                <Select value={formData.miktar_birimi} onValueChange={(value) => setFormData(prev => ({ ...prev, miktar_birimi: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="adet">Adet</SelectItem>
                    <SelectItem value="kamyon">Kamyon</SelectItem>
                    <SelectItem value="konteyner">Konteyner</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="baslik">İlan Başlığı</Label>
              <Input
                id="baslik"
                value={formData.baslik}
                onChange={(e) => setFormData(prev => ({ ...prev, baslik: e.target.value }))}
                placeholder="Örn: EUR1 Ahşap Palet - Sıfır"
              />
            </div>
            <div>
              <Label htmlFor="aciklama">Açıklama (En az 50 karakter)</Label>
              <Textarea
                id="aciklama"
                value={formData.aciklama}
                onChange={(e) => setFormData(prev => ({ ...prev, aciklama: e.target.value }))}
                placeholder="Ürün hakkında detaylı bilgi verin..."
                rows={6}
              />
              <p className="text-sm text-muted-foreground mt-1">
                {formData.aciklama.length}/2000 karakter
              </p>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="sehir">Şehir</Label>
                <Input
                  id="sehir"
                  value={formData.sehir}
                  onChange={(e) => setFormData(prev => ({ ...prev, sehir: e.target.value }))}
                  placeholder="İstanbul"
                />
              </div>
              <div>
                <Label htmlFor="ilce">İlçe</Label>
                <Input
                  id="ilce"
                  value={formData.ilce}
                  onChange={(e) => setFormData(prev => ({ ...prev, ilce: e.target.value }))}
                  placeholder="Kadıköy"
                />
              </div>
              <div>
                <Label htmlFor="mahalle">Mahalle</Label>
                <Input
                  id="mahalle"
                  value={formData.mahalle}
                  onChange={(e) => setFormData(prev => ({ ...prev, mahalle: e.target.value }))}
                  placeholder="Fenerbahçe"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="adres_detay">Adres Detayı (Opsiyonel)</Label>
              <Textarea
                id="adres_detay"
                value={formData.adres_detay}
                onChange={(e) => setFormData(prev => ({ ...prev, adres_detay: e.target.value }))}
                placeholder="Detaylı adres bilgisi..."
                rows={3}
              />
            </div>
          </div>
        );

      case 6:
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="fotograflar">Fotoğraflar (Maksimum 5)</Label>
              <Input
                id="fotograflar"
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileUpload}
                className="mb-4"
              />
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {formData.fotograflar.map((url, index) => (
                  <div key={index} className="relative">
                    <img
                      src={url}
                      alt={`Fotoğraf ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    <Button
                      size="sm"
                      variant="destructive"
                      className="absolute top-2 right-2"
                      onClick={() => removePhoto(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 7:
        return (
          <div className="space-y-4">
            <div>
              <Label>Teslimat Seçenekleri</Label>
              <div className="space-y-2 mt-2">
                {['yerinde_teslim', 'kargo', 'anlasmali_kargo'].map((option) => (
                  <Button
                    key={option}
                    variant={formData.teslimat_secenekleri.includes(option) ? 'default' : 'outline'}
                    onClick={() => {
                      const newOptions = formData.teslimat_secenekleri.includes(option)
                        ? formData.teslimat_secenekleri.filter(o => o !== option)
                        : [...formData.teslimat_secenekleri, option];
                      setFormData(prev => ({ ...prev, teslimat_secenekleri: newOptions }));
                    }}
                    className="w-full justify-start"
                  >
                    {option === 'yerinde_teslim' && 'Yerinde Teslim'}
                    {option === 'kargo' && 'Kargo'}
                    {option === 'anlasmali_kargo' && 'Anlaşmalı Kargo'}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        );

      case 8:
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="iletisim_telefon">Telefon</Label>
                <Input
                  id="iletisim_telefon"
                  value={formData.iletisim_telefon}
                  onChange={(e) => setFormData(prev => ({ ...prev, iletisim_telefon: e.target.value }))}
                  placeholder="+90 555 123 45 67"
                />
              </div>
              <div>
                <Label htmlFor="iletisim_email">E-posta</Label>
                <Input
                  id="iletisim_email"
                  type="email"
                  value={formData.iletisim_email}
                  onChange={(e) => setFormData(prev => ({ ...prev, iletisim_email: e.target.value }))}
                  placeholder="ornek@email.com"
                />
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <h2 className="text-xl font-semibold mb-4">Giriş Gerekli</h2>
            <p className="text-muted-foreground mb-4">
              İlan vermek için giriş yapmanız gerekiyor.
            </p>
            <Button onClick={() => router.push('/auth/login')}>
              Giriş Yap
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Geri Dön
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">İlan Ver</h1>
          <p className="text-gray-600">Palet ilanınızı oluşturun</p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Adım {currentStep} / 8</span>
            <span className="text-sm text-muted-foreground">
              {Math.round((currentStep / 8) * 100)}% tamamlandı
            </span>
          </div>
          <Progress value={(currentStep / 8) * 100} className="h-2" />
        </div>

        {/* Step Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  currentStep >= step.id ? 'bg-primary text-primary-foreground' : 'bg-gray-200 text-gray-600'
                }`}>
                  {currentStep > step.id ? <CheckCircle className="h-4 w-4" /> : step.id}
                </div>
                <span className="text-xs mt-2 text-center max-w-20">{step.title}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>{steps[currentStep - 1].title}</CardTitle>
              <CardDescription>{steps[currentStep - 1].description}</CardDescription>
            </CardHeader>
            <CardContent>
              {renderStepContent()}
            </CardContent>
          </Card>
        </div>

        {/* Navigation */}
        <div className="flex justify-between mt-8">
          <Button
            variant="outline"
            onClick={handlePrev}
            disabled={currentStep === 1}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Önceki
          </Button>

          {currentStep < 8 ? (
            <Button onClick={handleNext}>
              Sonraki
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={loading}>
              {loading ? 'Oluşturuluyor...' : 'İlanı Oluştur'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
