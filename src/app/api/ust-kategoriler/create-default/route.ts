import { NextRequest, NextResponse } from 'next/server';
import { connectToMongoDB } from '@/packages/libs/Database/mongodb';
import { UstKategori } from '@/packages/models/UstKategori';

export async function POST(request: NextRequest) {
  try {
    await connectToMongoDB();
    const UstKategoriModel = await UstKategori();

    // Varsayılan üst kategoriler
    const defaultUstKategoriler = [
      {
        ust_kategori_id: 'paletler',
        ad: 'Paletler',
        aciklama: 'Standart ve özel paletler',
        icon: '📦',
        hiyerarsi_seviyeleri: ['Kategori', 'Standart', 'Model', 'Varyant'],
        aktif: true,
        sira: 1
      },
      {
        ust_kategori_id: 'separatorler',
        ad: 'Separatörler',
        aciklama: 'Palet separatörleri ve ayırıcılar',
        icon: '🔲',
        hiyerarsi_seviyeleri: ['Tip', 'Malzeme', 'Boyut'],
        aktif: true,
        sira: 2
      },
      {
        ust_kategori_id: 'tomruklar',
        ad: 'Tomruklar',
        aciklama: 'Ahşap tomruklar ve kereste',
        icon: '🪵',
        hiyerarsi_seviyeleri: ['Tür', 'Çap', 'Uzunluk'],
        aktif: true,
        sira: 3
      },
      {
        ust_kategori_id: 'ozel_olculer',
        ad: 'Özel Ölçüler',
        aciklama: 'Özel boyutlarda ürünler',
        icon: '📏',
        hiyerarsi_seviyeleri: ['Kategori', 'Boyut', 'Malzeme'],
        aktif: true,
        sira: 4
      },
      {
        ust_kategori_id: 'is_makineleri',
        ad: 'İş Makineleri',
        aciklama: 'İnşaat ve tarım makineleri',
        icon: '🚜',
        hiyerarsi_seviyeleri: ['Marka', 'Model', 'Tip'],
        aktif: true,
        sira: 5
      }
    ];

    // Mevcut kategorileri kontrol et ve eksik olanları ekle
    const existingCategories = await UstKategoriModel.find({});
    const existingIds = existingCategories.map(cat => cat.ust_kategori_id);

    const newCategories = defaultUstKategoriler.filter(cat => !existingIds.includes(cat.ust_kategori_id));

    if (newCategories.length > 0) {
      await UstKategoriModel.insertMany(newCategories);
    }

    return NextResponse.json({
      success: true,
      message: `${newCategories.length} yeni üst kategori eklendi`,
      added: newCategories.length,
      total: defaultUstKategoriler.length
    });

  } catch (error: any) {
    console.error('Üst kategori oluşturma hatası:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Üst kategoriler oluşturulamadı',
        error: error.message
      },
      { status: 500 }
    );
  }
}
