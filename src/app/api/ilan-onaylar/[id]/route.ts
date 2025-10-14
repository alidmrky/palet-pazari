import { NextRequest, NextResponse } from 'next/server';
import { connectToMongoDB } from '@/packages/libs/Database/mongodb';
import { IlanOnay, OnayDurumu, OnayAsamasi } from '@/packages/models/IlanOnay';
import { Ilan } from '@/packages/models/Ilan';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectToMongoDB();
    const IlanOnayModel = await IlanOnay();

    const onay = await IlanOnayModel.findById(params.id)
      .populate('ilanId')
      .populate('userId', 'email individualInfo companyInfo userType')
      .populate('onaylayanAdminId', 'email individualInfo companyInfo')
      .lean();

    if (!onay) {
      return NextResponse.json(
        {
          success: false,
          message: 'Onay kaydı bulunamadı'
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: onay,
      message: 'Onay kaydı başarıyla getirildi'
    });

  } catch (error) {
    console.error('Onay kaydı getirilirken hata oluştu:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Onay kaydı getirilemedi',
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
    const IlanOnayModel = await IlanOnay();
    const IlanModel = await Ilan();

    const body = await request.json();
    const { 
      onayDurumu, 
      onayAsamasi, 
      onaylayanAdminId, 
      redNedeni, 
      notlar,
      asamaNotlari 
    } = body;

    // Onay kaydını bul
    const onay = await IlanOnayModel.findById(params.id);
    if (!onay) {
      return NextResponse.json(
        {
          success: false,
          message: 'Onay kaydı bulunamadı'
        },
        { status: 404 }
      );
    }

    // Güncelleme verilerini hazırla
    const updateData: any = {};
    
    if (onayDurumu) {
      updateData.onayDurumu = onayDurumu;
      if (onayDurumu === OnayDurumu.ONAYLANDI || onayDurumu === OnayDurumu.REDDEDILDI) {
        updateData.onayTarihi = new Date();
      }
    }
    
    if (onayAsamasi) updateData.onayAsamasi = onayAsamasi;
    if (onaylayanAdminId) updateData.onaylayanAdminId = onaylayanAdminId;
    if (redNedeni) updateData.redNedeni = redNedeni;
    if (notlar) updateData.notlar = notlar;

    // Aşama notlarını güncelle
    if (asamaNotlari && onayAsamasi) {
      const asamaIndex = onay.onayAsamalari.findIndex(a => a.asama === onayAsamasi);
      if (asamaIndex !== -1) {
        onay.onayAsamalari[asamaIndex].durum = onayDurumu === OnayDurumu.ONAYLANDI ? 'onaylandi' : 
                                              onayDurumu === OnayDurumu.REDDEDILDI ? 'reddedildi' : 'bekliyor';
        onay.onayAsamalari[asamaIndex].onaylayanAdminId = onaylayanAdminId;
        onay.onayAsamalari[asamaIndex].onayTarihi = new Date();
        onay.onayAsamalari[asamaIndex].notlar = asamaNotlari;
        updateData.onayAsamalari = onay.onayAsamalari;
      }
    }

    // Onay kaydını güncelle
    const guncellenenOnay = await IlanOnayModel.findByIdAndUpdate(
      params.id,
      updateData,
      { new: true }
    ).populate('ilanId')
     .populate('userId', 'email individualInfo companyInfo userType')
     .populate('onaylayanAdminId', 'email individualInfo companyInfo');

    // Eğer onaylandıysa, ilanı da güncelle
    if (onayDurumu === OnayDurumu.ONAYLANDI) {
      await IlanModel.findByIdAndUpdate(onay.ilanId, {
        isApproved: true,
        ilan_durumu: 'aktif'
      });
    } else if (onayDurumu === OnayDurumu.REDDEDILDI) {
      await IlanModel.findByIdAndUpdate(onay.ilanId, {
        isApproved: false,
        ilan_durumu: 'pasif'
      });
    }

    return NextResponse.json({
      success: true,
      data: guncellenenOnay,
      message: 'Onay kaydı başarıyla güncellendi'
    });

  } catch (error) {
    console.error('Onay kaydı güncellenirken hata oluştu:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Onay kaydı güncellenemedi',
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
    const IlanOnayModel = await IlanOnay();

    const onay = await IlanOnayModel.findById(params.id);
    if (!onay) {
      return NextResponse.json(
        {
          success: false,
          message: 'Onay kaydı bulunamadı'
        },
        { status: 404 }
      );
    }

    await IlanOnayModel.findByIdAndDelete(params.id);

    return NextResponse.json({
      success: true,
      message: 'Onay kaydı başarıyla silindi'
    });

  } catch (error) {
    console.error('Onay kaydı silinirken hata oluştu:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Onay kaydı silinemedi',
        error: error instanceof Error ? error.message : 'Bilinmeyen hata'
      },
      { status: 500 }
    );
  }
}
