import { NextRequest, NextResponse } from 'next/server';
import { connectToMongoDB } from '@/packages/libs/Database/mongodb';
import { User } from '@/packages/models/User';
import { UserType } from '@/packages/types/User';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    await connectToMongoDB();

    const adminEmail = 'admin@paletpazari.com';
    const adminPassword = 'admin123';

    // Mevcut admin kontrolü
    const existingAdmin = await User.findOne({ email: adminEmail });
    if (existingAdmin) {
      return NextResponse.json({
        success: true,
        message: 'Admin kullanıcısı zaten mevcut',
        credentials: {
          email: adminEmail,
          password: adminPassword
        }
      });
    }

    // Şifreyi hash'le
    const hashedPassword = await bcrypt.hash(adminPassword, 12);

    // Admin kullanıcısı oluştur
    const adminUser = new User({
      email: adminEmail,
      password: hashedPassword,
      userType: UserType.ADMIN,
      isActive: true,
      isEmailVerified: true,
      individualInfo: {
        firstName: 'Admin',
        lastName: 'User'
      }
    });

    await adminUser.save();

    return NextResponse.json({
      success: true,
      message: 'Admin kullanıcısı başarıyla oluşturuldu',
      credentials: {
        email: adminEmail,
        password: adminPassword
      }
    });

  } catch (error) {
    console.error('Admin oluşturma hatası:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Admin oluşturulamadı',
        error: error instanceof Error ? error.message : 'Bilinmeyen hata'
      },
      { status: 500 }
    );
  }
}
