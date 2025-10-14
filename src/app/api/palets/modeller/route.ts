import { NextRequest, NextResponse } from 'next/server';
import { connectToMongoDB } from '@/packages/libs/Database/mongodb';
import { PaletKategori } from '@/packages/models/PaletKategori';

/**
 * GET /api/palets/modeller
 * Belirli kategorinin standartının modellerini getir
 * Query params:
 * - kategori_id (zorunlu)
 * - standart_id (zorunlu)
 */
export async function GET(request: NextRequest) {
  try {
    await connectToMongoDB();

    const { searchParams } = new URL(request.url);
    const kategori_id = searchParams.get('kategori_id');
    const standart_id = searchParams.get('standart_id');

    if (!kategori_id || !standart_id) {
      return NextResponse.json({
        success: false,
        message: 'kategori_id ve standart_id parametreleri gerekli'
      }, { status: 400 });
    }

    const PaletKategoriModel = await PaletKategori();

    // Kategoriyi bul ve belirli standartın modellerini getir
    const kategori = await PaletKategoriModel.findOne({ kategori_id }).lean();

    if (!kategori) {
      return NextResponse.json({
        success: false,
        message: 'Kategori bulunamadı'
      }, { status: 404 });
    }

    // Belirli standartı bul
    const standart = kategori.standartlar?.find(s => s.standart_id === standart_id);

    if (!standart) {
      return NextResponse.json({
        success: false,
        message: 'Standart bulunamadı'
      }, { status: 404 });
    }

    const modeller = standart.modeller || [];

    return NextResponse.json({
      success: true,
      data: modeller,
      count: modeller.length,
      filters: {
        kategori_id,
        standart_id
      },
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('Modeller getirme hatası:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Modeller getirilemedi',
        error: error.message,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/palets/modeller
 * Yeni palet modeli oluştur
 */
export async function POST(request: NextRequest) {
  try {
    await connectToMongoDB();

    const body = await request.json();
    const PaletModelModel = await PaletModel();

    // Model ID kontrolü
    const existingModel = await PaletModelModel.findOne({
      model_id: body.model_id
    });

    if (existingModel) {
      return NextResponse.json({
        success: false,
        message: 'Bu model ID zaten kullanılıyor'
      }, { status: 400 });
    }

    const yeniModel = new PaletModelModel(body);
    await yeniModel.save();

    return NextResponse.json({
      success: true,
      message: 'Model başarıyla oluşturuldu',
      data: yeniModel,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('Model oluşturma hatası:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Model oluşturulamadı',
        error: error.message,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

