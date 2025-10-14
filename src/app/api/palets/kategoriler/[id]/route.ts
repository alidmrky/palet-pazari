import { NextRequest, NextResponse } from 'next/server';
import { connectToMongoDB } from '@/packages/libs/Database/mongodb';
import { PaletKategori } from '@/packages/models/PaletKategori';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectToMongoDB();

    const PaletKategoriModel = await PaletKategori();
    const kategori = await PaletKategoriModel.findById(params.id);

    if (!kategori) {
      return NextResponse.json(
        { success: false, message: 'Kategori bulunamadı' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: kategori
    });
  } catch (error) {
    console.error('Kategori getirme hatası:', error);
    return NextResponse.json(
      { success: false, message: 'Sunucu hatası' },
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

    const body = await request.json();

    const PaletKategoriModel = await PaletKategori();
    const kategori = await PaletKategoriModel.findByIdAndUpdate(
      params.id,
      body,
      { new: true, runValidators: true }
    );

    if (!kategori) {
      return NextResponse.json(
        { success: false, message: 'Kategori bulunamadı' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: kategori,
      message: 'Kategori başarıyla güncellendi'
    });
  } catch (error) {
    console.error('Kategori güncelleme hatası:', error);
    return NextResponse.json(
      { success: false, message: 'Sunucu hatası' },
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

    const PaletKategoriModel = await PaletKategori();
    const kategori = await PaletKategoriModel.findByIdAndDelete(params.id);

    if (!kategori) {
      return NextResponse.json(
        { success: false, message: 'Kategori bulunamadı' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Kategori başarıyla silindi'
    });
  } catch (error) {
    console.error('Kategori silme hatası:', error);
    return NextResponse.json(
      { success: false, message: 'Sunucu hatası' },
      { status: 500 }
    );
  }
}
