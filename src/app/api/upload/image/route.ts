import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

export async function POST(request: NextRequest) {
  try {
    const data = await request.formData();
    const file: File | null = data.get('file') as unknown as File;

    if (!file) {
      return NextResponse.json(
        {
          success: false,
          message: 'Dosya bulunamadı'
        },
        { status: 400 }
      );
    }

    // Dosya boyutu kontrolü (5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        {
          success: false,
          message: 'Dosya boyutu 5MB\'dan büyük olamaz'
        },
        { status: 400 }
      );
    }

    // Dosya tipi kontrolü
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        {
          success: false,
          message: 'Sadece JPG, PNG ve WebP dosyaları kabul edilir'
        },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Benzersiz dosya adı oluştur
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const fileExtension = file.name.split('.').pop();
    const fileName = `${timestamp}_${randomString}.${fileExtension}`;

    // Upload klasörünü oluştur
    const uploadDir = join(process.cwd(), 'public', 'uploads', 'ilans');
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    // Dosyayı kaydet
    const filePath = join(uploadDir, fileName);
    await writeFile(filePath, buffer);

    const fileUrl = `/uploads/ilans/${fileName}`;

    return NextResponse.json({
      success: true,
      data: {
        fileName,
        fileUrl,
        originalName: file.name,
        size: file.size,
        type: file.type
      },
      message: 'Dosya başarıyla yüklendi'
    });

  } catch (error) {
    console.error('Dosya yükleme hatası:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Dosya yüklenemedi',
        error: error instanceof Error ? error.message : 'Bilinmeyen hata'
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const fileName = searchParams.get('fileName');

    if (!fileName) {
      return NextResponse.json(
        {
          success: false,
          message: 'Dosya adı gerekli'
        },
        { status: 400 }
      );
    }

    const filePath = join(process.cwd(), 'public', 'uploads', 'ilans', fileName);

    if (existsSync(filePath)) {
      const { unlink } = await import('fs/promises');
      await unlink(filePath);
    }

    return NextResponse.json({
      success: true,
      message: 'Dosya başarıyla silindi'
    });

  } catch (error) {
    console.error('Dosya silme hatası:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Dosya silinemedi',
        error: error instanceof Error ? error.message : 'Bilinmeyen hata'
      },
      { status: 500 }
    );
  }
}
