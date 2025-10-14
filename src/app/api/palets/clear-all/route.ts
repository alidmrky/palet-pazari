import { NextRequest, NextResponse } from 'next/server';
import { connectToMongoDB } from '@/packages/libs/Database/mongodb';
import { PaletKategori } from '@/packages/models/PaletKategori';
import { UstKategori } from '@/packages/models/UstKategori';

export async function DELETE(request: NextRequest) {
  try {
    await connectToMongoDB();
    const PaletKategoriModel = await PaletKategori();
    const UstKategoriModel = await UstKategori();

    // Tüm kategorileri sil
    const kategoriResult = await PaletKategoriModel.deleteMany({});

    // Tüm üst kategorileri sil
    const ustKategoriResult = await UstKategoriModel.deleteMany({});

    return NextResponse.json({
      success: true,
      message: 'Tüm veriler temizlendi',
      deletedKategoriler: kategoriResult.deletedCount,
      deletedUstKategoriler: ustKategoriResult.deletedCount
    });

  } catch (error) {
    console.error('Veriler temizleme hatası:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Veriler temizlenemedi',
        error: error instanceof Error ? error.message : 'Bilinmeyen hata'
      },
      { status: 500 }
    );
  }
}
