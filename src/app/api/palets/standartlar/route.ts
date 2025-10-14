import { NextRequest, NextResponse } from 'next/server';
import { connectToMongoDB } from '@/packages/libs/Database/mongodb';
import { PaletKategori } from '@/packages/models/PaletKategori';

/**
 * GET /api/palets/standartlar
 * Belirli kategorinin standartlarını getir
 * Query params: kategori_id (zorunlu)
 */
export async function GET(request: NextRequest) {
  try {
    await connectToMongoDB();

    const { searchParams } = new URL(request.url);
    const kategori_id = searchParams.get('kategori_id');

    if (!kategori_id) {
      return NextResponse.json({
        success: false,
        message: 'kategori_id parametresi gerekli'
      }, { status: 400 });
    }

    const PaletKategoriModel = await PaletKategori();

    // Kategoriyi bul ve standartlarını getir
    const kategori = await PaletKategoriModel.findOne({ kategori_id }).lean();

    if (!kategori) {
      return NextResponse.json({
        success: false,
        message: 'Kategori bulunamadı'
      }, { status: 404 });
    }

    const standartlar = kategori.standartlar || [];

    return NextResponse.json({
      success: true,
      data: standartlar,
      count: standartlar.length,
      filters: { kategori_id },
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('Standartlar getirme hatası:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Standartlar getirilemedi',
        error: error.message,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/palets/standartlar
 * Yeni palet standardı oluştur
 */
export async function POST(request: NextRequest) {
  try {
    await connectToMongoDB();

    const body = await request.json();
    const PaletStandartModel = await PaletStandart();

    // Standart ID kontrolü
    const existingStandart = await PaletStandartModel.findOne({
      standart_id: body.standart_id
    });

    if (existingStandart) {
      return NextResponse.json({
        success: false,
        message: 'Bu standart ID zaten kullanılıyor'
      }, { status: 400 });
    }

    const yeniStandart = new PaletStandartModel(body);
    await yeniStandart.save();

    return NextResponse.json({
      success: true,
      message: 'Standart başarıyla oluşturuldu',
      data: yeniStandart,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('Standart oluşturma hatası:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Standart oluşturulamadı',
        error: error.message,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

