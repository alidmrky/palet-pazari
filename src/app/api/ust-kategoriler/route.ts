import { NextRequest, NextResponse } from 'next/server';
import { connectToMongoDB } from '@/packages/libs/Database/mongodb';
import { UstKategori } from '@/packages/models/UstKategori';

export async function GET(request: NextRequest) {
  try {
    await connectToMongoDB();
    const UstKategoriModel = await UstKategori();

    const ustKategoriler = await UstKategoriModel.find({ aktif: true })
      .sort({ sira: 1, ad: 1 })
      .lean();

    return NextResponse.json({
      success: true,
      data: ustKategoriler,
      message: 'Üst kategoriler başarıyla getirildi'
    });

  } catch (error) {
    console.error('Üst kategoriler getirilirken hata oluştu:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Üst kategoriler getirilemedi',
        error: error instanceof Error ? error.message : 'Bilinmeyen hata'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectToMongoDB();
    const UstKategoriModel = await UstKategori();

    const body = await request.json();
    const { ust_kategori_id, ad, aciklama, icon, hiyerarsi_seviyeleri, sira } = body;

    // Validation
    if (!ust_kategori_id || !ad || !aciklama) {
      return NextResponse.json(
        {
          success: false,
          message: 'Gerekli alanlar eksik'
        },
        { status: 400 }
      );
    }

    // Mevcut üst kategori kontrolü
    const existingUstKategori = await UstKategoriModel.findOne({ ust_kategori_id });
    if (existingUstKategori) {
      return NextResponse.json(
        {
          success: false,
          message: 'Bu üst kategori zaten mevcut'
        },
        { status: 400 }
      );
    }

    const yeniUstKategori = new UstKategoriModel({
      ust_kategori_id,
      ad,
      aciklama,
      icon: icon || '📦',
      hiyerarsi_seviyeleri: hiyerarsi_seviyeleri || ['Kategori', 'Standart', 'Model', 'Varyant'],
      sira: sira || 0
    });

    await yeniUstKategori.save();

    return NextResponse.json({
      success: true,
      data: yeniUstKategori,
      message: 'Üst kategori başarıyla oluşturuldu'
    });

  } catch (error) {
    console.error('Üst kategori oluşturulurken hata oluştu:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Üst kategori oluşturulamadı',
        error: error instanceof Error ? error.message : 'Bilinmeyen hata'
      },
      { status: 500 }
    );
  }
}
