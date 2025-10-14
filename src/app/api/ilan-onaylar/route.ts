import { NextRequest, NextResponse } from 'next/server';
import { connectToMongoDB } from '@/packages/libs/Database/mongodb';
import { IlanOnay, OnayDurumu, OnayAsamasi } from '@/packages/models/IlanOnay';
import { Ilan } from '@/packages/models/Ilan';

export async function GET(request: NextRequest) {
  try {
    await connectToMongoDB();
    const IlanOnayModel = await IlanOnay();
    const IlanModel = await Ilan();

    // Query parametrelerini al
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const onayDurumu = searchParams.get('onayDurumu');
    const onayAsamasi = searchParams.get('onayAsamasi');
    const userId = searchParams.get('userId');
    const siralama = searchParams.get('siralama') || 'createdAt';
    const yon = searchParams.get('yon') || 'desc';

    // Filtre oluştur
    const filter: any = {};
    if (onayDurumu) filter.onayDurumu = onayDurumu;
    if (onayAsamasi) filter.onayAsamasi = onayAsamasi;
    if (userId) filter.userId = userId;

    // Sıralama
    const sort: any = {};
    sort[siralama] = yon === 'desc' ? -1 : 1;

    // Sayfalama
    const skip = (page - 1) * limit;

    const [onaylar, toplam] = await Promise.all([
      IlanOnayModel.find(filter)
        .populate('ilanId')
        .populate('userId', 'email individualInfo companyInfo userType')
        .populate('onaylayanAdminId', 'email individualInfo companyInfo')
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),
      IlanOnayModel.countDocuments(filter)
    ]);

    return NextResponse.json({
      success: true,
      data: onaylar,
      pagination: {
        page,
        limit,
        total: toplam,
        pages: Math.ceil(toplam / limit)
      },
      filters: {
        onayDurumu,
        onayAsamasi,
        userId
      }
    });

  } catch (error) {
    console.error('İlan onayları getirilirken hata oluştu:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'İlan onayları getirilemedi',
        error: error instanceof Error ? error.message : 'Bilinmeyen hata'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectToMongoDB();
    const IlanOnayModel = await IlanOnay();
    const IlanModel = await Ilan();

    const body = await request.json();
    const { ilanId, userId } = body;

    // Validation
    if (!ilanId || !userId) {
      return NextResponse.json(
        {
          success: false,
          message: 'İlan ID ve Kullanıcı ID gerekli'
        },
        { status: 400 }
      );
    }

    // İlan var mı kontrol et
    const ilan = await IlanModel.findById(ilanId);
    if (!ilan) {
      return NextResponse.json(
        {
          success: false,
          message: 'İlan bulunamadı'
        },
        { status: 404 }
      );
    }

    // Zaten onay kaydı var mı kontrol et
    const existingOnay = await IlanOnayModel.findOne({ ilanId });
    if (existingOnay) {
      return NextResponse.json(
        {
          success: false,
          message: 'Bu ilan için zaten onay kaydı mevcut'
        },
        { status: 400 }
      );
    }

    // Onay kaydı oluştur
    const yeniOnay = new IlanOnayModel({
      ilanId,
      userId,
      onayDurumu: OnayDurumu.BEKLIYOR,
      onayAsamasi: OnayAsamasi.ILK_KONTROL,
      onayAsamalari: [
        {
          asama: OnayAsamasi.ILK_KONTROL,
          durum: 'bekliyor'
        },
        {
          asama: OnayAsamasi.ICERIK_KONTROL,
          durum: 'bekliyor'
        },
        {
          asama: OnayAsamasi.FOTO_KONTROL,
          durum: 'bekliyor'
        },
        {
          asama: OnayAsamasi.KONUM_KONTROL,
          durum: 'bekliyor'
        },
        {
          asama: OnayAsamasi.FINAL_ONAY,
          durum: 'bekliyor'
        }
      ]
    });

    await yeniOnay.save();

    return NextResponse.json({
      success: true,
      data: yeniOnay,
      message: 'Onay kaydı oluşturuldu'
    });

  } catch (error) {
    console.error('Onay kaydı oluşturulurken hata oluştu:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Onay kaydı oluşturulamadı',
        error: error instanceof Error ? error.message : 'Bilinmeyen hata'
      },
      { status: 500 }
    );
  }
}
