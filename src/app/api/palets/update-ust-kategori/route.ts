import { NextRequest, NextResponse } from 'next/server';
import { connectToMongoDB } from '@/packages/libs/Database/mongodb';
import { PaletKategori } from '@/packages/models/PaletKategori';

export async function POST(request: NextRequest) {
  try {
    await connectToMongoDB();
    const PaletKategoriModel = await PaletKategori();

    // Tüm kategorileri bul ve ust_kategori_id'yi 'paletler' olarak güncelle
    const result = await PaletKategoriModel.updateMany(
      { ust_kategori_id: { $exists: false } },
      { $set: { ust_kategori_id: 'paletler' } }
    );

    return NextResponse.json({
      success: true,
      message: `${result.modifiedCount} kategori güncellendi`,
      modifiedCount: result.modifiedCount
    });

  } catch (error: any) {
    console.error('Kategori güncelleme hatası:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Kategoriler güncellenemedi',
        error: error.message
      },
      { status: 500 }
    );
  }
}
