import { NextRequest, NextResponse } from 'next/server';
import { connectToMongoDB } from '@/packages/libs/Database/mongodb';
import { PaletKategori } from '@/packages/models/PaletKategori';

/**
 * GET /api/palets/varyantlar
 * Belirli kategorinin standartının modelinin varyantlarını getir
 * Query params:
 * - kategori_id (zorunlu)
 * - standart_id (zorunlu)
 * - model_id (zorunlu)
 */
export async function GET(request: NextRequest) {
  try {
    await connectToMongoDB();

    const { searchParams } = new URL(request.url);
    const kategori_id = searchParams.get('kategori_id');
    const standart_id = searchParams.get('standart_id');
    const model_id = searchParams.get('model_id');

    if (!kategori_id || !standart_id || !model_id) {
      return NextResponse.json({
        success: false,
        message: 'kategori_id, standart_id ve model_id parametreleri gerekli'
      }, { status: 400 });
    }

    const PaletKategoriModel = await PaletKategori();

    // Kategoriyi bul ve belirli standartın modelinin varyantlarını getir
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

    // Belirli modeli bul
    const model = standart.modeller?.find(m => m.model_id === model_id);

    if (!model) {
      return NextResponse.json({
        success: false,
        message: 'Model bulunamadı'
      }, { status: 404 });
    }

    const varyantlar = model.varyantlar || [];

    return NextResponse.json({
      success: true,
      data: varyantlar,
      count: varyantlar.length,
      filters: {
        kategori_id,
        standart_id,
        model_id
      },
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('Varyantlar getirme hatası:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Varyantlar getirilemedi',
        error: error.message,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/palets/varyantlar
 * Yeni palet varyantı oluştur
 */
export async function POST(request: NextRequest) {
  try {
    await connectToMongoDB();

    const body = await request.json();
    const PaletVaryantModel = await PaletVaryant();

    // Varyant ID kontrolü
    const existingVaryant = await PaletVaryantModel.findOne({
      varyant_id: body.varyant_id
    });

    if (existingVaryant) {
      return NextResponse.json({
        success: false,
        message: 'Bu varyant ID zaten kullanılıyor'
      }, { status: 400 });
    }

    const yeniVaryant = new PaletVaryantModel(body);
    await yeniVaryant.save();

    return NextResponse.json({
      success: true,
      message: 'Varyant başarıyla oluşturuldu',
      data: yeniVaryant,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('Varyant oluşturma hatası:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Varyant oluşturulamadı',
        error: error.message,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

