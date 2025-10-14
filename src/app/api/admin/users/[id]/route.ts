import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { connectToMongoDB } from '@/packages/libs/Database/mongodb';
import { User } from '@/packages/models/User';

/**
 * GET /api/admin/users/[id]
 * Belirli kullanıcıyı getir (sadece admin)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Admin kontrolü
    const session = await getServerSession();
    if (!session || (session.user as any)?.userType !== 'admin') {
      return NextResponse.json({
        success: false,
        message: 'Bu işlem için admin yetkisi gerekli'
      }, { status: 403 });
    }

    await connectToMongoDB();

    const user = await User.findById(params.id).select('-password').lean();

    if (!user) {
      return NextResponse.json({
        success: false,
        message: 'Kullanıcı bulunamadı'
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: user,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('Kullanıcı getirme hatası:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Kullanıcı getirilemedi',
        error: error.message,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/admin/users/[id]
 * Kullanıcıyı güncelle (sadece admin)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Admin kontrolü
    const session = await getServerSession();
    if (!session || (session.user as any)?.userType !== 'admin') {
      return NextResponse.json({
        success: false,
        message: 'Bu işlem için admin yetkisi gerekli'
      }, { status: 403 });
    }

    await connectToMongoDB();

    const body = await request.json();
    const { action, ...updateData } = body;

    const user = await User.findById(params.id);
    if (!user) {
      return NextResponse.json({
        success: false,
        message: 'Kullanıcı bulunamadı'
      }, { status: 404 });
    }

    // Özel işlemler
    if (action === 'activate') {
      user.isActive = true;
    } else if (action === 'deactivate') {
      user.isActive = false;
    } else if (action === 'delete') {
      await User.findByIdAndDelete(params.id);
      return NextResponse.json({
        success: true,
        message: 'Kullanıcı başarıyla silindi',
        timestamp: new Date().toISOString()
      });
    } else {
      // Normal güncelleme
      Object.assign(user, updateData);
    }

    await user.save();

    return NextResponse.json({
      success: true,
      message: 'Kullanıcı başarıyla güncellendi',
      data: {
        id: user._id,
        email: user.email,
        userType: user.userType,
        isActive: user.isActive
      },
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('Kullanıcı güncelleme hatası:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Kullanıcı güncellenemedi',
        error: error.message,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/users/[id]
 * Kullanıcıyı sil (sadece admin)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Admin kontrolü
    const session = await getServerSession();
    if (!session || (session.user as any)?.userType !== 'admin') {
      return NextResponse.json({
        success: false,
        message: 'Bu işlem için admin yetkisi gerekli'
      }, { status: 403 });
    }

    await connectToMongoDB();

    const user = await User.findByIdAndDelete(params.id);
    if (!user) {
      return NextResponse.json({
        success: false,
        message: 'Kullanıcı bulunamadı'
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Kullanıcı başarıyla silindi',
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('Kullanıcı silme hatası:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Kullanıcı silinemedi',
        error: error.message,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

