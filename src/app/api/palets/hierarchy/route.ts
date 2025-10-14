import { NextRequest, NextResponse } from 'next/server';
import { connectToMongoDB } from '@/packages/libs/Database/mongodb';
import { PaletKategori } from '@/packages/models/PaletKategori';

export async function GET(request: NextRequest) {
  try {
    await connectToMongoDB();
    const PaletKategoriModel = await PaletKategori();

    // Tüm kategorileri ve içindeki tüm verileri getir
    const kategoriler = await PaletKategoriModel.find({})
      .populate('standartlar.modeller.varyantlar')
      .lean();

    // Hiyerarşik yapıyı düzenle
    const hierarchyData = {
      kategoriler: kategoriler.map(kategori => ({
        _id: kategori._id,
        kategori_id: kategori.kategori_id,
        ad: kategori.ad,
        aciklama: kategori.aciklama,
        standartlar: kategori.standartlar.map(standart => ({
          _id: standart._id,
          standart_id: standart.standart_id,
          ad: standart.ad,
          yonetici_kurum: standart.yonetici_kurum,
          notlar: standart.notlar,
          modeller: standart.modeller.map(model => ({
            _id: model._id,
            model_id: model.model_id,
            ad: model.ad,
            olcu: model.olcu,
            kullanim: model.kullanim,
            varyantlar: model.varyantlar.map(varyant => ({
              _id: varyant._id,
              varyant_id: varyant.varyant_id,
              malzeme: varyant.malzeme,
              yuzey: varyant.yuzey,
              agirlik_kg: varyant.agirlik_kg,
              kapasite_kg: varyant.kapasite_kg,
              teknik: {
                yapi_tipi: varyant.teknik?.yapi_tipi || '',
                ust_tablo: varyant.teknik?.ust_tablo || {},
                alt_tablo: varyant.teknik?.alt_tablo || {},
                bloklar: varyant.teknik?.bloklar || {},
                civi: varyant.teknik?.civi || {},
                forklift_acikliklari: varyant.teknik?.forklift_acikliklari || {},
                toleranslar: varyant.teknik?.toleranslar || {}
              },
              uyumluluk: varyant.uyumluluk
            }))
          }))
        }))
      }))
    };

    return NextResponse.json({
      success: true,
      data: hierarchyData,
      message: 'Hiyerarşi verisi başarıyla getirildi'
    });

  } catch (error) {
    console.error('Hiyerarşi verisi getirilirken hata oluştu:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Hiyerarşi verisi getirilemedi',
        error: error instanceof Error ? error.message : 'Bilinmeyen hata'
      },
      { status: 500 }
    );
  }
}

