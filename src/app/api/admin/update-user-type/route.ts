import { NextRequest, NextResponse } from 'next/server';
import { connectToMongoDB } from '@/packages/libs/Database/mongodb';
import { User } from '@/packages/models/User';

/**
 * PATCH /api/admin/update-user-type
 * Kullanıcının userType'ını güncelle (sadece development için)
 */
export async function PATCH(request: NextRequest) {
  try {
    await connectToMongoDB();

    const body = await request.json();
    const { email, userType } = body;

    // Kullanıcıyı bul ve güncelle
    const user = await User.findOneAndUpdate(
      { email: email.toLowerCase() },
      { userType: userType },
      { new: true }
    );

    if (!user) {
      return NextResponse.json({
        success: false,
        message: 'Kullanıcı bulunamadı'
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Kullanıcı userType başarıyla güncellendi',
      data: {
        id: user._id,
        email: user.email,
        userType: user.userType
      },
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('UserType güncelleme hatası:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'UserType güncellenemedi',
        error: error.message,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}
