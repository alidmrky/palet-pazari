import { NextRequest, NextResponse } from 'next/server';
import { connectToMongoDB } from '@/packages/libs/Database/mongodb';
import { PaletKategori } from '@/packages/models/PaletKategori';
import { UstKategori } from '@/packages/models/UstKategori';
import paletVeritabani from '@/lib/palet_veritabani.json';

export async function POST(request: NextRequest) {
  try {
    await connectToMongoDB();
    const PaletKategoriModel = await PaletKategori();
    const UstKategoriModel = await UstKategori();

    // Önce "paletler" üst kategorisini oluştur
    const paletlerUstKategori = await UstKategoriModel.findOne({ ust_kategori_id: 'paletler' });
    if (!paletlerUstKategori) {
      const yeniUstKategori = new UstKategoriModel({
        ust_kategori_id: 'paletler',
        ad: 'Paletler',
        aciklama: 'Standart ve özel paletler',
        icon: '📦',
        hiyerarsi_seviyeleri: ['Kategori', 'Standart', 'Model', 'Varyant'],
        sira: 1
      });
      await yeniUstKategori.save();
      console.log('✅ "Paletler" üst kategorisi oluşturuldu');
    }

    // Mevcut kategorileri temizle (opsiyonel)
    const { clearExisting } = await request.json().catch(() => ({ clearExisting: false }));
    if (clearExisting) {
      await PaletKategoriModel.deleteMany({});
      console.log('🗑️ Mevcut kategoriler temizlendi');
    }

    let toplamKategori = 0;
    let toplamStandart = 0;
    let toplamModel = 0;
    let toplamVaryant = 0;

    // JSON'dan kategorileri import et
    for (const kategoriData of paletVeritabani.kategoriler) {
      const kategori = new PaletKategoriModel({
        kategori_id: kategoriData.kategori_id,
        ust_kategori_id: 'paletler', // Tüm kategoriler "paletler" altında
        ad: kategoriData.ad,
        aciklama: kategoriData.aciklama,
        standartlar: kategoriData.standartlar.map(standart => ({
          standart_id: standart.standart_id,
          ad: standart.ad,
          yonetici_kurum: standart.yonetici_kurum || 'Bilinmeyen',
          notlar: standart.notlar || '',
          modeller: standart.modeller.map(model => ({
            model_id: model.model_id,
            ad: model.ad,
            olcu: {
              uzunluk: model.olcu.u,
              genislik: model.olcu.g,
              yukseklik: model.olcu.y
            },
            kullanim: {
              havuz: model.kullanim?.havuz || false,
              tip: model.kullanim?.tip || [],
              sektor: model.kullanim?.sektor || []
            },
            varyantlar: model.varyantlar.map(varyant => ({
              varyant_id: varyant.varyant_id,
              malzeme: varyant.malzeme,
              yuzey: varyant.yuzey || 'pürüzlü',
              agirlik_kg: varyant.agirlik_kg || 0,
              kapasite_kg: {
                dinamik: varyant.kapasite_kg?.dinamik || 1000,
                statik: varyant.kapasite_kg?.statik || 2000,
                raf: varyant.kapasite_kg?.raf || 500
              },
              teknik: {
                yapi_tipi: varyant.teknik?.yapi_tipi || 'bloklu_4_yon',
                yapi_alt_tipi: varyant.yapi_alt_tipi || '',
                ust_tablo: {
                  tahta_sayisi: varyant.teknik?.ust_tablo?.tahta_sayisi || 0,
                  tahtalar: varyant.teknik?.ust_tablo?.tahtalar || [],
                  tahta_araliklari: varyant.teknik?.ust_tablo?.tahta_araliklari || [],
                  tip: varyant.teknik?.ust_tablo?.tip || '',
                  kaymaz: varyant.teknik?.ust_tablo?.kaymaz || false
                },
                alt_tablo: {
                  tahta_sayisi: varyant.teknik?.alt_tablo?.tahta_sayisi || 0,
                  tahtalar: varyant.teknik?.alt_tablo?.tahtalar || [],
                  tip: varyant.teknik?.alt_tablo?.tip || ''
                },
                bloklar: {
                  adet: varyant.teknik?.bloklar?.adet || 0,
                  olcu: {
                    uzunluk: varyant.teknik?.bloklar?.olcu?.u || 0,
                    genislik: varyant.teknik?.bloklar?.olcu?.g || 0,
                    yukseklik: varyant.teknik?.bloklar?.olcu?.y || 0
                  },
                  dizilim: varyant.teknik?.bloklar?.dizilim || '3x3',
                  tip: varyant.teknik?.bloklar?.tip || ''
                },
                civi: {
                  adet: varyant.teknik?.civi?.adet || 0,
                  tip: varyant.teknik?.civi?.tip || 'spiral'
                },
                forklift_acikliklari: {
                  sol_sag_yukseklik: varyant.teknik?.forklift_acikliklari?.sol_sag_yukseklik || 0,
                  on_arka_yukseklik: varyant.teknik?.forklift_acikliklari?.on_arka_yukseklik || 0
                },
                toleranslar: {
                  uzunluk: varyant.teknik?.toleranslar?.uzunluk || '±5',
                  genislik: varyant.teknik?.toleranslar?.genislik || '±3',
                  yukseklik: varyant.teknik?.toleranslar?.yukseklik || '±3'
                },
                kirisler: varyant.teknik?.kirisler || {}
              },
              uyumluluk: {
                ispm15: typeof varyant.uyumluluk?.ispm15 === 'boolean' ? varyant.uyumluluk.ispm15 : (varyant.uyumluluk?.ispm15 === 'gereksiz' ? false : false),
                gida_hijyen: varyant.uyumluluk?.gida_hijyen || 'orta',
                iata: varyant.uyumluluk?.iata || false
              }
            }))
          }))
        }))
      });

      await kategori.save();
      toplamKategori++;
      toplamStandart += kategori.standartlar.length;
      toplamModel += kategori.standartlar.reduce((acc, s) => acc + s.modeller.length, 0);
      toplamVaryant += kategori.standartlar.reduce((acc, s) =>
        acc + s.modeller.reduce((acc2, m) => acc2 + m.varyantlar.length, 0), 0
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Genişletilmiş palet kataloğu başarıyla import edildi',
      data: {
        toplamKategori,
        toplamStandart,
        toplamModel,
        toplamVaryant,
        ustKategori: 'paletler'
      }
    });

  } catch (error) {
    console.error('Katalog import hatası:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Katalog import edilemedi',
        error: error instanceof Error ? error.message : 'Bilinmeyen hata'
      },
      { status: 500 }
    );
  }
}
