'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  ChevronDown,
  ChevronRight,
  Package,
  Layers,
  Ruler,
  Weight,
  Search,
  Eye,
  Edit,
  Plus,
  Building,
  FileText,
  Box
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
  teknik: {
    yapi_tipi: string;
  };
  uyumluluk: {
    ispm15: boolean;
    gida_hijyen: string;
  };
}

interface PaletModel {
  _id: string;
  model_id: string;
  ad: string;
  olcu: {
    uzunluk: number;
    genislik: number;
    yukseklik: number;
  };
  varyantlar: PaletVaryant[];
}

interface PaletStandart {
  _id: string;
  standart_id: string;
  ad: string;
  yonetici_kurum: string;
  modeller: PaletModel[];
}

interface PaletKategori {
  _id: string;
  kategori_id: string;
  ad: string;
  aciklama: string;
  standartlar: PaletStandart[];
}

interface HierarchyData {
  kategoriler: PaletKategori[];
}

export default function HierarchyPage() {
  const router = useRouter();
  const [data, setData] = useState<HierarchyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchHierarchyData();
  }, []);

  const fetchHierarchyData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/palets/hierarchy');
      const result = await response.json();

      if (result.success) {
        setData(result.data);
        // İlk kategoriyi otomatik aç
        if (result.data.kategoriler.length > 0) {
          setExpandedItems(new Set([result.data.kategoriler[0]._id]));
        }
      }
    } catch (error) {
      console.error('Hiyerarşi verisi yüklenemedi:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleExpanded = (id: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedItems(newExpanded);
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

  const filteredData = data ? {
    kategoriler: data.kategoriler.filter(kategori =>
      kategori.ad.toLowerCase().includes(searchTerm.toLowerCase()) ||
      kategori.standartlar.some(standart =>
        standart.ad.toLowerCase().includes(searchTerm.toLowerCase()) ||
        standart.modeller.some(model =>
          model.ad.toLowerCase().includes(searchTerm.toLowerCase()) ||
          model.varyantlar.some(varyant =>
            varyant.varyant_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            varyant.malzeme.toLowerCase().includes(searchTerm.toLowerCase())
          )
        )
      )
    )
  } : null;

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-12 text-center">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Veri Bulunamadı</h3>
            <p className="text-gray-500 mb-4">Hiyerarşi verisi yüklenemedi.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Palet Hiyerarşisi</h1>
          <p className="text-gray-600">Tüm paletleri hiyerarşik olarak görüntüleyin</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => router.push('/admin/palets/categories')}>
            <Building className="h-4 w-4 mr-2" />
            Kategoriler
          </Button>
          <Button onClick={() => router.push('/admin/palets/types')}>
            <Box className="h-4 w-4 mr-2" />
            Varyantlar
          </Button>
        </div>
      </div>

      {/* Arama */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Kategori, standart, model veya varyant ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Hiyerarşi */}
      <div className="space-y-4">
        {filteredData?.kategoriler.map((kategori) => (
          <Card key={kategori._id} className="overflow-hidden">
            <CardHeader
              className="bg-gradient-to-r from-blue-50 to-indigo-50 cursor-pointer hover:from-blue-100 hover:to-indigo-100 transition-colors"
              onClick={() => toggleExpanded(kategori._id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {expandedItems.has(kategori._id) ? (
                    <ChevronDown className="h-5 w-5 text-blue-600" />
                  ) : (
                    <ChevronRight className="h-5 w-5 text-blue-600" />
                  )}
                  <Building className="h-6 w-6 text-blue-600" />
                  <div>
                    <CardTitle className="text-xl text-blue-900">{kategori.ad}</CardTitle>
                    <CardDescription className="text-blue-700">{kategori.aciklama}</CardDescription>
                  </div>
                </div>
                <Badge variant="outline" className="bg-blue-100 text-blue-800">
                  {kategori.standartlar.length} Standart
                </Badge>
              </div>
            </CardHeader>

            {expandedItems.has(kategori._id) && (
              <CardContent className="p-0">
                <div className="space-y-2">
                  {kategori.standartlar.map((standart) => (
                    <div key={standart._id} className="border-l-4 border-blue-200 bg-gray-50">
                      <div
                        className="p-4 cursor-pointer hover:bg-gray-100 transition-colors"
                        onClick={() => toggleExpanded(standart._id)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            {expandedItems.has(standart._id) ? (
                              <ChevronDown className="h-4 w-4 text-gray-600" />
                            ) : (
                              <ChevronRight className="h-4 w-4 text-gray-600" />
                            )}
                            <FileText className="h-5 w-5 text-gray-600" />
                            <div>
                              <h3 className="font-semibold text-gray-900">{standart.ad}</h3>
                              <p className="text-sm text-gray-600">{standart.yonetici_kurum}</p>
                            </div>
                          </div>
                          <Badge variant="outline" className="bg-gray-100 text-gray-800">
                            {standart.modeller.length} Model
                          </Badge>
                        </div>
                      </div>

                      {expandedItems.has(standart._id) && (
                        <div className="border-l-4 border-gray-300 bg-white">
                          {standart.modeller.map((model) => (
                            <div key={model._id} className="border-b border-gray-200 last:border-b-0">
                              <div
                                className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                                onClick={() => toggleExpanded(model._id)}
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-3">
                                    {expandedItems.has(model._id) ? (
                                      <ChevronDown className="h-4 w-4 text-gray-500" />
                                    ) : (
                                      <ChevronRight className="h-4 w-4 text-gray-500" />
                                    )}
                                    <Ruler className="h-4 w-4 text-gray-500" />
                                    <div>
                                      <h4 className="font-medium text-gray-900">{model.ad}</h4>
                                      <p className="text-sm text-gray-600">
                                        {model.olcu.uzunluk} x {model.olcu.genislik} x {model.olcu.yukseklik} mm
                                      </p>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Badge variant="outline" className="bg-gray-100 text-gray-800">
                                      {model.varyantlar.length} Varyant
                                    </Badge>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        router.push(`/admin/palets/types/view/${model.varyantlar[0]?._id}`);
                                      }}
                                    >
                                      <Eye className="h-3 w-3" />
                                    </Button>
                                  </div>
                                </div>
                              </div>

                              {expandedItems.has(model._id) && (
                                <div className="bg-gray-50 border-l-4 border-gray-400">
                                  {model.varyantlar.map((varyant) => (
                                    <div key={varyant._id} className="p-4 border-b border-gray-200 last:border-b-0 hover:bg-gray-100 transition-colors">
                                      <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                          <Package className="h-4 w-4 text-gray-500" />
                                          <div>
                                            <h5 className="font-medium text-gray-900">{varyant.varyant_id}</h5>
                                            <div className="flex items-center gap-2 mt-1">
                                              {getMalzemeBadge(varyant.malzeme)}
                                              {getYuzeyBadge(varyant.yuzey)}
                                            </div>
                                          </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                          <div className="text-right">
                                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                              <Weight className="h-3 w-3" />
                                              {varyant.agirlik_kg} kg
                                            </div>
                                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                              <Layers className="h-3 w-3" />
                                              {varyant.kapasite_kg.dinamik} kg
                                            </div>
                                          </div>
                                          <div className="flex gap-1">
                                            <Button
                                              size="sm"
                                              variant="ghost"
                                              onClick={() => router.push(`/admin/palets/types/view/${varyant._id}`)}
                                            >
                                              <Eye className="h-3 w-3" />
                                            </Button>
                                            <Button
                                              size="sm"
                                              variant="ghost"
                                              onClick={() => router.push(`/admin/palets/types/edit/${varyant._id}`)}
                                            >
                                              <Edit className="h-3 w-3" />
                                            </Button>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}

