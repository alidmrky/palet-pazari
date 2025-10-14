import { NextRequest, NextResponse } from 'next/server';
import { connectToMongoDB } from '@/packages/libs/Database/mongodb';
import { PaletVaryant } from '@/packages/models/PaletVaryant';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectToMongoDB();

    const PaletVaryantModel = await PaletVaryant();
    const varyant = await PaletVaryantModel.findById(params.id);

    if (!varyant) {
      return NextResponse.json(
        { success: false, message: 'Varyant bulunamadı' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: varyant
    });
  } catch (error) {
    console.error('Varyant getirme hatası:', error);
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

    const PaletVaryantModel = await PaletVaryant();
    const varyant = await PaletVaryantModel.findByIdAndUpdate(
      params.id,
      body,
      { new: true, runValidators: true }
    );

    if (!varyant) {
      return NextResponse.json(
        { success: false, message: 'Varyant bulunamadı' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: varyant,
      message: 'Varyant başarıyla güncellendi'
    });
  } catch (error) {
    console.error('Varyant güncelleme hatası:', error);
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

    const PaletVaryantModel = await PaletVaryant();
    const varyant = await PaletVaryantModel.findByIdAndDelete(params.id);

    if (!varyant) {
      return NextResponse.json(
        { success: false, message: 'Varyant bulunamadı' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Varyant başarıyla silindi'
    });
  } catch (error) {
    console.error('Varyant silme hatası:', error);
    return NextResponse.json(
      { success: false, message: 'Sunucu hatası' },
      { status: 500 }
    );
  }
}
