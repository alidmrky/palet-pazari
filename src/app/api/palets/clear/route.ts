import { NextRequest, NextResponse } from 'next/server';
import { connectToMongoDB } from '@/packages/libs/Database/mongodb';
import { PaletKategori } from '@/packages/models/PaletKategori';

export async function DELETE(request: NextRequest) {
  try {
    await connectToMongoDB();
    const PaletKategoriModel = await PaletKategori();

    const result = await PaletKategoriModel.deleteMany({});

    return NextResponse.json({
      success: true,
      message: `${result.deletedCount} kategori silindi`,
      deletedCount: result.deletedCount
    });

  } catch (error) {
    console.error('Kategoriler temizleme hatası:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Kategoriler temizlenemedi',
        error: error instanceof Error ? error.message : 'Bilinmeyen hata'
      },
      { status: 500 }
    );
  }
}
