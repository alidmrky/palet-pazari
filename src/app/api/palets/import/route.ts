import { NextRequest, NextResponse } from 'next/server';
import { connectToMongoDB } from '@/packages/libs/Database/mongodb';
import { PaletKategori } from '@/packages/models/PaletKategori';
import { PaletStandart } from '@/packages/models/PaletStandart';
import { PaletModel } from '@/packages/models/PaletModel';
import { PaletVaryant } from '@/packages/models/PaletVaryant';

/**
 * POST /api/palets/import
 * JSON katalog verilerini MongoDB'ye yükle
 */
export async function POST(request: NextRequest) {
  try {
    await connectToMongoDB();

    const body = await request.json();
    const { kategoriler } = body;

    if (!kategoriler || !Array.isArray(kategoriler)) {
      return NextResponse.json({
        success: false,
        message: 'Geçersiz katalog verisi'
      }, { status: 400 });
    }

    const results = {
      kategoriler: 0,
      standartlar: 0,
      modeller: 0,
      varyantlar: 0,
      hatalar: [] as string[]
    };

    // Kategorileri işle
    for (const kategori of kategoriler) {
      try {
        // Kategori oluştur
        const PaletKategoriModel = await PaletKategori();
        const kategoriDoc = new PaletKategoriModel(kategori);
        await kategoriDoc.save();
        results.kategoriler++;

        // Standartları işle
        for (const standart of kategori.standartlar) {
          try {
            const PaletStandartModel = await PaletStandart();
            const standartDoc = new PaletStandartModel({
              ...standart,
              kategori_id: kategori.kategori_id
            });
            await standartDoc.save();
            results.standartlar++;

            // Modelleri işle
            for (const model of standart.modeller) {
              try {
                const PaletModelModel = await PaletModel();
                const modelDoc = new PaletModelModel({
                  ...model,
                  kategori_id: kategori.kategori_id,
                  standart_id: standart.standart_id
                });
                await modelDoc.save();
                results.modeller++;

                // Varyantları işle
                for (const varyant of model.varyantlar) {
                  try {
                    const PaletVaryantModel = await PaletVaryant();
                    const varyantDoc = new PaletVaryantModel({
                      ...varyant,
                      kategori_id: kategori.kategori_id,
                      standart_id: standart.standart_id,
                      model_id: model.model_id
                    });
                    await varyantDoc.save();
                    results.varyantlar++;
                  } catch (varyantError: any) {
                    results.hatalar.push(`Varyant ${varyant.varyant_id}: ${varyantError.message}`);
                  }
                }
              } catch (modelError: any) {
                results.hatalar.push(`Model ${model.model_id}: ${modelError.message}`);
              }
            }
          } catch (standartError: any) {
            results.hatalar.push(`Standart ${standart.standart_id}: ${standartError.message}`);
          }
        }
      } catch (kategoriError: any) {
        results.hatalar.push(`Kategori ${kategori.kategori_id}: ${kategoriError.message}`);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Katalog verileri başarıyla yüklendi',
      results,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('Katalog import hatası:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Katalog verileri yüklenemedi',
        error: error.message,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

