import { NextRequest, NextResponse } from 'next/server';
import { connectToMongoDB } from '@/packages/libs/Database/mongodb';
import { Ilan } from '@/packages/models/Ilan';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectToMongoDB();
    const IlanModel = await Ilan();

    const ilan = await IlanModel.findById(params.id)
      .populate('user_id', 'email individualInfo companyInfo userType')
      .lean();

    if (!ilan) {
      return NextResponse.json(
        {
          success: false,
          message: 'İlan bulunamadı'
        },
        { status: 404 }
      );
    }

    // Görüntülenme sayısını artır
    await IlanModel.findByIdAndUpdate(params.id, {
      $inc: { goruntulenme_sayisi: 1 }
    });

    return NextResponse.json({
      success: true,
      data: ilan,
      message: 'İlan detayı başarıyla getirildi'
    });

  } catch (error) {
    console.error('İlan detayı getirilirken hata oluştu:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'İlan detayı getirilemedi',
        error: error instanceof Error ? error.message : 'Bilinmeyen hata'
      },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectToMongoDB();
    const IlanModel = await Ilan();

    const body = await request.json();
    const { user_id } = body;

    // İlan sahibi kontrolü
    const mevcutIlan = await IlanModel.findById(params.id);
    if (!mevcutIlan) {
      return NextResponse.json(
        {
          success: false,
          message: 'İlan bulunamadı'
        },
        { status: 404 }
      );
    }

    if (mevcutIlan.user_id.toString() !== user_id) {
      return NextResponse.json(
        {
          success: false,
          message: 'Bu ilanı düzenleme yetkiniz yok'
        },
        { status: 403 }
      );
    }

    const guncellenenIlan = await IlanModel.findByIdAndUpdate(
      params.id,
      { ...body, updatedAt: new Date() },
      { new: true }
    ).populate('user_id', 'email individualInfo companyInfo userType');

    return NextResponse.json({
      success: true,
      data: guncellenenIlan,
      message: 'İlan başarıyla güncellendi'
    });

  } catch (error) {
    console.error('İlan güncellenirken hata oluştu:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'İlan güncellenemedi',
        error: error instanceof Error ? error.message : 'Bilinmeyen hata'
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectToMongoDB();
    const IlanModel = await Ilan();

    const body = await request.json();
    const { user_id } = body;

    // İlan sahibi kontrolü
    const mevcutIlan = await IlanModel.findById(params.id);
    if (!mevcutIlan) {
      return NextResponse.json(
        {
          success: false,
          message: 'İlan bulunamadı'
        },
        { status: 404 }
      );
    }

    if (mevcutIlan.user_id.toString() !== user_id) {
      return NextResponse.json(
        {
          success: false,
          message: 'Bu ilanı silme yetkiniz yok'
        },
        { status: 403 }
      );
    }

    await IlanModel.findByIdAndDelete(params.id);

    return NextResponse.json({
      success: true,
      message: 'İlan başarıyla silindi'
    });

  } catch (error) {
    console.error('İlan silinirken hata oluştu:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'İlan silinemedi',
        error: error instanceof Error ? error.message : 'Bilinmeyen hata'
      },
      { status: 500 }
    );
  }
}
