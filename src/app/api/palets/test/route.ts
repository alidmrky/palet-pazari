import { NextRequest, NextResponse } from 'next/server';
import { connectToMongoDB } from '@/packages/libs/Database/mongodb';
import { PaletKategori } from '@/packages/models/PaletKategori';
import { PaletStandart } from '@/packages/models/PaletStandart';
import { PaletModel } from '@/packages/models/PaletModel';
import { PaletVaryant } from '@/packages/models/PaletVaryant';

/**
 * GET /api/palets/test
 * Palet modellerini test et
 */
export async function GET(request: NextRequest) {
  try {
    await connectToMongoDB();

    const tests = [];

    // Test 1: Kategori sayısı
    const PaletKategoriModel = await PaletKategori();
    const kategoriSayisi = await PaletKategoriModel.countDocuments();
    tests.push(`Kategoriler: ${kategoriSayisi} adet`);

    // Test 2: Standart sayısı
    const PaletStandartModel = await PaletStandart();
    const standartSayisi = await PaletStandartModel.countDocuments();
    tests.push(`Standartlar: ${standartSayisi} adet`);

    // Test 3: Model sayısı
    const PaletModelModel = await PaletModel();
    const modelSayisi = await PaletModelModel.countDocuments();
    tests.push(`Modeller: ${modelSayisi} adet`);

    // Test 4: Varyant sayısı
    const PaletVaryantModel = await PaletVaryant();
    const varyantSayisi = await PaletVaryantModel.countDocuments();
    tests.push(`Varyantlar: ${varyantSayisi} adet`);

    // Test 5: Örnek veri getir
    const ornekKategori = await PaletKategoriModel.findOne().lean();
    const ornekStandart = await PaletStandartModel.findOne().lean();
    const ornekModel = await PaletModelModel.findOne().lean();
    const ornekVaryant = await PaletVaryantModel.findOne().lean();

    return NextResponse.json({
      success: true,
      message: 'Palet modelleri başarıyla test edildi!',
      tests,
      ornek_veriler: {
        kategori: ornekKategori ? {
          kategori_id: ornekKategori.kategori_id,
          ad: ornekKategori.ad,
          standart_sayisi: ornekKategori.standartlar?.length || 0
        } : null,
        standart: ornekStandart ? {
          standart_id: ornekStandart.standart_id,
          ad: ornekStandart.ad,
          model_sayisi: ornekStandart.modeller?.length || 0
        } : null,
        model: ornekModel ? {
          model_id: ornekModel.model_id,
          ad: ornekModel.ad,
          olcu: ornekModel.olcu,
          varyant_sayisi: ornekModel.varyantlar?.length || 0
        } : null,
        varyant: ornekVaryant ? {
          varyant_id: ornekVaryant.varyant_id,
          malzeme: ornekVaryant.malzeme,
          yuzey: ornekVaryant.yuzey,
          agirlik_kg: ornekVaryant.agirlik_kg,
          kapasite_kg: ornekVaryant.kapasite_kg
        } : null
      },
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('Palet test hatası:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Palet modelleri test edilemedi!',
        error: error.message,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

