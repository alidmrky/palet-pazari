import { NextRequest, NextResponse } from 'next/server';
import { connectToMongoDB } from '@/packages/libs/Database/mongodb';
import { Ilan } from '@/packages/models/Ilan';

export async function GET(request: NextRequest) {
  try {
    await connectToMongoDB();
    const IlanModel = await Ilan();

    // Query parametrelerini al
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const ust_kategori_id = searchParams.get('ust_kategori_id');
    const kategori_id = searchParams.get('kategori_id');
    const standart_id = searchParams.get('standart_id');
    const model_id = searchParams.get('model_id');
    const varyant_id = searchParams.get('varyant_id');
    const ilan_tipi = searchParams.get('ilan_tipi');
    const durum = searchParams.get('durum');
    const sehir = searchParams.get('sehir');
    const ilce = searchParams.get('ilce');
    const malzeme = searchParams.get('malzeme');
    const min_kapasite = searchParams.get('min_kapasite');
    const max_kapasite = searchParams.get('max_kapasite');
    const min_olcu = searchParams.get('min_olcu');
    const max_olcu = searchParams.get('max_olcu');
    const siralama = searchParams.get('siralama') || 'createdAt';
    const yon = searchParams.get('yon') || 'desc';
    const arama = searchParams.get('arama');

    // Filtre oluştur
    const filter: any = { ilan_durumu: 'aktif' };

    if (ust_kategori_id) filter.ust_kategori_id = ust_kategori_id;
    if (kategori_id) filter.kategori_id = kategori_id;
    if (standart_id) filter.standart_id = standart_id;
    if (model_id) filter.model_id = model_id;
    if (varyant_id) filter.varyant_id = varyant_id;
    if (ilan_tipi) filter.ilan_tipi = ilan_tipi;
    if (durum) filter.durum = durum;
    if (sehir) filter.sehir = sehir;
    if (ilce) filter.ilce = ilce;
    if (malzeme) filter.malzeme = malzeme;

    // Arama
    if (arama) {
      filter.$or = [
        { baslik: { $regex: arama, $options: 'i' } },
        { aciklama: { $regex: arama, $options: 'i' } }
      ];
    }

    // Sıralama
    const sort: any = {};
    sort[siralama] = yon === 'desc' ? -1 : 1;

    // Sayfalama
    const skip = (page - 1) * limit;

    const [ilanlar, toplam] = await Promise.all([
      IlanModel.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .populate('user_id', 'email individualInfo companyInfo userType')
        .lean(),
      IlanModel.countDocuments(filter)
    ]);

    return NextResponse.json({
      success: true,
      data: ilanlar,
      pagination: {
        page,
        limit,
        total: toplam,
        pages: Math.ceil(toplam / limit)
      },
      filters: {
        ust_kategori_id,
        kategori_id,
        standart_id,
        model_id,
        varyant_id,
        ilan_tipi,
        durum,
        sehir,
        ilce,
        malzeme,
        arama
      }
    });

  } catch (error) {
    console.error('İlanlar getirilirken hata oluştu:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'İlanlar getirilemedi',
        error: error instanceof Error ? error.message : 'Bilinmeyen hata'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectToMongoDB();
    const IlanModel = await Ilan();

    const body = await request.json();
    const {
      ilan_tipi,
      ust_kategori_id,
      kategori_id,
      standart_id,
      model_id,
      varyant_id,
      durum,
      miktar,
      miktar_birimi,
      baslik,
      aciklama,
      sehir,
      ilce,
      mahalle,
      google_maps_lat,
      google_maps_lng,
      adres_detay,
      fotograflar,
      teslimat_secenekleri,
      sertifikalar,
      ozel_sartlar,
      iletisim_telefon,
      iletisim_email,
      user_id
    } = body;

    // Validation
    if (!ilan_tipi || !ust_kategori_id || !kategori_id || !standart_id || !model_id || !varyant_id) {
      return NextResponse.json(
        {
          success: false,
          message: 'Gerekli alanlar eksik'
        },
        { status: 400 }
      );
    }

    if (!aciklama || aciklama.length < 50) {
      return NextResponse.json(
        {
          success: false,
          message: 'Açıklama en az 50 karakter olmalı'
        },
        { status: 400 }
      );
    }

    if (!fotograflar || fotograflar.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: 'En az 1 fotoğraf gerekli'
        },
        { status: 400 }
      );
    }

    if (fotograflar.length > 5) {
      return NextResponse.json(
        {
          success: false,
          message: 'Maksimum 5 fotoğraf yüklenebilir'
        },
        { status: 400 }
      );
    }

    const yeniIlan = new IlanModel({
      ilan_tipi,
      ust_kategori_id,
      kategori_id,
      standart_id,
      model_id,
      varyant_id,
      durum: durum || 'sifir',
      miktar: miktar || 1,
      miktar_birimi: miktar_birimi || 'adet',
      baslik: baslik || `${ust_kategori_id} ${kategori_id} ${model_id} - ${durum || 'sifir'}`,
      aciklama,
      sehir,
      ilce,
      mahalle,
      google_maps_lat,
      google_maps_lng,
      adres_detay,
      fotograflar,
      teslimat_secenekleri: teslimat_secenekleri || ['yerinde_teslim'],
      sertifikalar: sertifikalar || [],
      ozel_sartlar,
      iletisim_telefon,
      iletisim_email,
      user_id,
      ilan_durumu: 'pasif', // Onay bekliyor durumunda başlat
      isApproved: false, // Onay bekliyor
      goruntulenme_sayisi: 0
    });

    await yeniIlan.save();

    // Onay kaydı oluştur
    const { IlanOnay } = await import('@/packages/models/IlanOnay');
    const IlanOnayModel = await IlanOnay();

    const onayKaydi = new IlanOnayModel({
      ilanId: yeniIlan._id,
      userId: user_id,
      onayDurumu: 'bekliyor',
      onayAsamasi: 'ilk_kontrol'
    });

    await onayKaydi.save();

    return NextResponse.json({
      success: true,
      data: yeniIlan,
      message: 'İlan başarıyla oluşturuldu'
    });

  } catch (error) {
    console.error('İlan oluşturulurken hata oluştu:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'İlan oluşturulamadı',
        error: error instanceof Error ? error.message : 'Bilinmeyen hata'
      },
      { status: 500 }
    );
  }
}
