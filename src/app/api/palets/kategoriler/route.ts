import { NextRequest, NextResponse } from 'next/server';
import { connectToMongoDB } from '@/packages/libs/Database/mongodb';
import { PaletKategori } from '@/packages/models/PaletKategori';

/**
 * GET /api/palets/kategoriler
 * Tüm palet kategorilerini getir
 */
export async function GET(request: NextRequest) {
  try {
    await connectToMongoDB();

    const PaletKategoriModel = await PaletKategori();

    // Query parametrelerini al
    const { searchParams } = new URL(request.url);
    const ust_kategori_id = searchParams.get('ust_kategori_id');

    // Filtre oluştur
    const filter: any = {};
    if (ust_kategori_id) {
      filter.ust_kategori_id = ust_kategori_id;
    }

    const kategoriler = await PaletKategoriModel.find(filter).lean();

    return NextResponse.json({
      success: true,
      data: kategoriler,
      count: kategoriler.length,
      filter: ust_kategori_id ? { ust_kategori_id } : null,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('Kategoriler getirme hatası:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Kategoriler getirilemedi',
        error: error.message,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/palets/kategoriler
 * Yeni palet kategorisi oluştur
 */
export async function POST(request: NextRequest) {
  try {
    await connectToMongoDB();

    const body = await request.json();
    const PaletKategoriModel = await PaletKategori();

    // Kategori ID kontrolü
    const existingKategori = await PaletKategoriModel.findOne({
      kategori_id: body.kategori_id
    });

    if (existingKategori) {
      return NextResponse.json({
        success: false,
        message: 'Bu kategori ID zaten kullanılıyor'
      }, { status: 400 });
    }

    const yeniKategori = new PaletKategoriModel(body);
    await yeniKategori.save();

    return NextResponse.json({
      success: true,
      message: 'Kategori başarıyla oluşturuldu',
      data: yeniKategori,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('Kategori oluşturma hatası:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Kategori oluşturulamadı',
        error: error.message,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

