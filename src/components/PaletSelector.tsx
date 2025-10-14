'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChevronRight, Package, Check } from 'lucide-react';

interface PaletSelectorProps {
  onSelectionChange: (selection: {
    ust_kategori_id: string;
    kategori_id: string;
    standart_id: string;
    model_id: string;
    varyant_id: string;
  }) => void;
  initialSelection?: {
    ust_kategori_id?: string;
    kategori_id?: string;
    standart_id?: string;
    model_id?: string;
    varyant_id?: string;
  };
}

interface Kategori {
  _id: string;
  kategori_id: string;
  ad: string;
  aciklama: string;
  standartlar: Standart[];
}

interface Standart {
  standart_id: string;
  ad: string;
  yonetici_kurum: string;
  modeller: Model[];
}

interface Model {
  model_id: string;
  ad: string;
  olcu: {
    uzunluk: number;
    genislik: number;
    yukseklik: number;
  };
  varyantlar: Varyant[];
}

interface Varyant {
  varyant_id: string;
  malzeme: string;
  yuzey: string;
  agirlik_kg: number;
  kapasite_kg: {
    dinamik: number;
    statik: number;
    raf: number;
  };
}

export default function PaletSelector({ onSelectionChange, initialSelection }: PaletSelectorProps) {
  const [ustKategoriler, setUstKategoriler] = useState<any[]>([]);
  const [kategoriler, setKategoriler] = useState<Kategori[]>([]);
  const [standartlar, setStandartlar] = useState<Standart[]>([]);
  const [modeller, setModeller] = useState<Model[]>([]);
  const [varyantlar, setVaryantlar] = useState<Varyant[]>([]);

  const [selectedUstKategori, setSelectedUstKategori] = useState<string>('');
  const [selectedKategori, setSelectedKategori] = useState<string>('');
  const [selectedStandart, setSelectedStandart] = useState<string>('');
  const [selectedModel, setSelectedModel] = useState<string>('');
  const [selectedVaryant, setSelectedVaryant] = useState<string>('');

  const [loading, setLoading] = useState(false);

  // İlk yükleme - üst kategorileri getir
  useEffect(() => {
    fetchUstKategoriler();
  }, []);

  // Initial selection varsa set et (sadece component mount olduğunda)
  useEffect(() => {
    if (initialSelection) {
      if (initialSelection.ust_kategori_id) {
        setSelectedUstKategori(initialSelection.ust_kategori_id);
        setSelectedKategori(initialSelection.kategori_id || '');
        if (initialSelection.kategori_id) {
          fetchStandartlar(initialSelection.kategori_id);
        }
        if (initialSelection.standart_id) {
          setSelectedStandart(initialSelection.standart_id);
          fetchModeller(initialSelection.kategori_id!, initialSelection.standart_id);
        }
        if (initialSelection.model_id) {
          setSelectedModel(initialSelection.model_id);
          fetchVaryantlar(initialSelection.kategori_id!, initialSelection.standart_id!, initialSelection.model_id);
        }
        if (initialSelection.varyant_id) {
          setSelectedVaryant(initialSelection.varyant_id);
        }
      }
    }
  }, []); // Sadece mount olduğunda çalış

  const fetchUstKategoriler = async() => {
    try {
      setLoading(true);
      const response = await fetch('/api/ust-kategoriler');
      const data = await response.json();

      if (data.success) {
        setUstKategoriler(data.data);
      }
    } catch (error) {
      console.error('Üst kategoriler yüklenemedi:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchKategoriler = async(ustKategoriId: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/palets/kategoriler?ust_kategori_id=${ustKategoriId}`);
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

  const fetchStandartlar = async(kategoriId: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/palets/standartlar?kategori_id=${kategoriId}`);
      const data = await response.json();

      if (data.success) {
        setStandartlar(data.data);
        setModeller([]);
        setVaryantlar([]);
        setSelectedStandart('');
        setSelectedModel('');
        setSelectedVaryant('');
      }
    } catch (error) {
      console.error('Standartlar yüklenemedi:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchModeller = async(kategoriId: string, standartId: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/palets/modeller?kategori_id=${kategoriId}&standart_id=${standartId}`);
      const data = await response.json();

      if (data.success) {
        setModeller(data.data);
        setVaryantlar([]);
        setSelectedModel('');
        setSelectedVaryant('');
      }
    } catch (error) {
      console.error('Modeller yüklenemedi:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchVaryantlar = async(kategoriId: string, standartId: string, modelId: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/palets/varyantlar?kategori_id=${kategoriId}&standart_id=${standartId}&model_id=${modelId}`);
      const data = await response.json();

      if (data.success) {
        setVaryantlar(data.data);
        setSelectedVaryant('');
      }
    } catch (error) {
      console.error('Varyantlar yüklenemedi:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUstKategoriSelect = (ustKategoriId: string) => {
    setSelectedUstKategori(ustKategoriId);
    setKategoriler([]);
    setStandartlar([]);
    setModeller([]);
    setVaryantlar([]);
    setSelectedKategori('');
    setSelectedStandart('');
    setSelectedModel('');
    setSelectedVaryant('');

    // Ust kategori ID'sini bul ve ust_kategori_id'yi al
    const selectedUstKategoriObj = ustKategoriler.find(u => u._id === ustKategoriId);
    if (selectedUstKategoriObj) {
      fetchKategoriler(selectedUstKategoriObj.ust_kategori_id);
    }
  };

  const handleKategoriSelect = (kategoriId: string) => {
    setSelectedKategori(kategoriId);
    fetchStandartlar(kategoriId);
  };

  const handleStandartSelect = (standartId: string) => {
    setSelectedStandart(standartId);
    fetchModeller(selectedKategori, standartId);
  };

  const handleModelSelect = (modelId: string) => {
    setSelectedModel(modelId);
    fetchVaryantlar(selectedKategori, selectedStandart, modelId);
  };

  const handleVaryantSelect = (varyantId: string) => {
    setSelectedVaryant(varyantId);

    // Selection'ı parent'a gönder
    onSelectionChange({
      ust_kategori_id: selectedUstKategori,
      kategori_id: selectedKategori,
      standart_id: selectedStandart,
      model_id: selectedModel,
      varyant_id: varyantId
    });
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

  return (
    <div className="space-y-6">
      {/* Seçilen Ürün Özeti */}
      {selectedVaryant && (
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-blue-800 flex items-center justify-between">
              <span>Seçilen Ürün</span>
              <Button variant="outline" size="sm" onClick={() => {
                setSelectedUstKategori('');
                setSelectedKategori('');
                setSelectedStandart('');
                setSelectedModel('');
                setSelectedVaryant('');
                setKategoriler([]);
                setStandartlar([]);
                setModeller([]);
                setVaryantlar([]);
              }}>
                Değiştir
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                <Package className="h-8 w-8 text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-blue-900 mb-3">
                  {kategoriler.find(k => k.kategori_id === selectedKategori)?.ad} - {modeller.find(m => m.model_id === selectedModel)?.ad}
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Üst Kategori:</span>
                      <span className="text-sm font-medium">{ustKategoriler.find(u => u._id === selectedUstKategori)?.ad}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Kategori:</span>
                      <span className="text-sm font-medium">{kategoriler.find(k => k.kategori_id === selectedKategori)?.ad}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Standart:</span>
                      <span className="text-sm font-medium">{standartlar.find(s => s.standart_id === selectedStandart)?.ad}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Model:</span>
                      <span className="text-sm font-medium">{modeller.find(m => m.model_id === selectedModel)?.ad}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Varyant:</span>
                      <span className="text-sm font-medium">{varyantlar.find(v => v.varyant_id === selectedVaryant)?.varyant_id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Malzeme:</span>
                      <span className="text-sm font-medium">{varyantlar.find(v => v.varyant_id === selectedVaryant)?.malzeme}</span>
                    </div>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-blue-200">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="text-xs text-gray-600 mb-1">Ölçüler</div>
                      <div className="text-sm font-medium">
                        {modeller.find(m => m.model_id === selectedModel)?.olcu.uzunluk} x {modeller.find(m => m.model_id === selectedModel)?.olcu.genislik} x {modeller.find(m => m.model_id === selectedModel)?.olcu.yukseklik} mm
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-xs text-gray-600 mb-1">Ağırlık</div>
                      <div className="text-sm font-medium">
                        {varyantlar.find(v => v.varyant_id === selectedVaryant)?.agirlik_kg} kg
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-xs text-gray-600 mb-1">Kapasite</div>
                      <div className="text-sm font-medium">
                        {varyantlar.find(v => v.varyant_id === selectedVaryant)?.kapasite_kg.dinamik} kg
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Adım Adım Kategori Seçimi */}
      {!selectedVaryant && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Adım Adım Kategori Seç
            </CardTitle>
            <CardDescription>
              Ürününüzü kategorilere göre seçin
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-6 overflow-x-auto pb-4 min-h-[400px]">
              {/* 1. Üst Kategori */}
              <div className="flex-shrink-0 w-80">
                <h4 className="font-semibold mb-3 text-sm text-gray-600">1. Üst Kategori</h4>
                <div className="border rounded-lg max-h-96 overflow-y-auto">
                  {ustKategoriler.map((ustKategori) => (
                    <button
                      key={ustKategori._id}
                      className={`w-full p-3 text-left hover:bg-gray-50 flex items-center justify-between ${
                        selectedUstKategori === ustKategori._id ? 'bg-blue-50 border-r-2 border-blue-500' : ''
                      }`}
                      onClick={() => handleUstKategoriSelect(ustKategori._id)}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{ustKategori.icon}</span>
                        <span className="font-medium">{ustKategori.ad}</span>
                      </div>
                      {selectedUstKategori === ustKategori._id && <ChevronRight className="h-4 w-4 text-blue-500" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* 2. Alt Kategori */}
              {selectedUstKategori && (
                <div className="flex-shrink-0 w-80">
                  <h4 className="font-semibold mb-3 text-sm text-gray-600">2. Alt Kategori</h4>
                  <div className="border rounded-lg max-h-96 overflow-y-auto">
                    {kategoriler.map((kategori) => (
                      <button
                        key={kategori.kategori_id}
                        className={`w-full p-3 text-left hover:bg-gray-50 flex items-center justify-between ${
                          selectedKategori === kategori.kategori_id ? 'bg-blue-50 border-r-2 border-blue-500' : ''
                        }`}
                        onClick={() => handleKategoriSelect(kategori.kategori_id)}
                      >
                        <div>
                          <div className="font-medium">{kategori.ad}</div>
                          <div className="text-xs text-gray-500">{kategori.aciklama}</div>
                        </div>
                        {selectedKategori === kategori.kategori_id && <ChevronRight className="h-4 w-4 text-blue-500" />}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* 3. Standart */}
              {selectedKategori && (
                <div className="flex-shrink-0 w-80">
                  <h4 className="font-semibold mb-3 text-sm text-gray-600">3. Standart</h4>
                  <div className="border rounded-lg max-h-96 overflow-y-auto">
                    {standartlar.map((standart) => (
                      <button
                        key={standart.standart_id}
                        className={`w-full p-3 text-left hover:bg-gray-50 flex items-center justify-between ${
                          selectedStandart === standart.standart_id ? 'bg-blue-50 border-r-2 border-blue-500' : ''
                        }`}
                        onClick={() => handleStandartSelect(standart.standart_id)}
                      >
                        <div>
                          <div className="font-medium">{standart.ad}</div>
                          <div className="text-xs text-gray-500">{standart.yonetici_kurum}</div>
                        </div>
                        {selectedStandart === standart.standart_id && <ChevronRight className="h-4 w-4 text-blue-500" />}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* 4. Model */}
              {selectedStandart && (
                <div className="flex-shrink-0 w-80">
                  <h4 className="font-semibold mb-3 text-sm text-gray-600">4. Model</h4>
                  <div className="border rounded-lg max-h-96 overflow-y-auto">
                    {modeller.map((model) => (
                      <button
                        key={model.model_id}
                        className={`w-full p-3 text-left hover:bg-gray-50 flex items-center justify-between ${
                          selectedModel === model.model_id ? 'bg-blue-50 border-r-2 border-blue-500' : ''
                        }`}
                        onClick={() => handleModelSelect(model.model_id)}
                      >
                        <div>
                          <div className="font-medium">{model.ad}</div>
                          <div className="text-xs text-gray-500">
                            {model.olcu.uzunluk} x {model.olcu.genislik} x {model.olcu.yukseklik} mm
                          </div>
                        </div>
                        {selectedModel === model.model_id && <ChevronRight className="h-4 w-4 text-blue-500" />}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* 5. Varyant */}
              {selectedModel && (
                <div className="flex-shrink-0 w-80">
                  <h4 className="font-semibold mb-3 text-sm text-gray-600">5. Varyant</h4>
                  <div className="border rounded-lg max-h-96 overflow-y-auto">
                    {varyantlar.map((varyant) => (
                      <button
                        key={varyant.varyant_id}
                        className={`w-full p-3 text-left hover:bg-gray-50 flex items-center justify-between ${
                          selectedVaryant === varyant.varyant_id ? 'bg-blue-50 border-r-2 border-blue-500' : ''
                        }`}
                        onClick={() => handleVaryantSelect(varyant.varyant_id)}
                      >
                        <div>
                          <div className="font-medium">{varyant.varyant_id}</div>
                          <div className="text-xs text-gray-500 flex gap-2">
                            {getMalzemeBadge(varyant.malzeme)}
                            <span>{varyant.agirlik_kg} kg</span>
                          </div>
                        </div>
                        {selectedVaryant === varyant.varyant_id && <Check className="h-4 w-4 text-green-500" />}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
