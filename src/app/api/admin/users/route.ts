import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { connectToMongoDB } from '@/packages/libs/Database/mongodb';
import { User } from '@/packages/models/User';

/**
 * GET /api/admin/users
 * Tüm kullanıcıları getir (sadece admin)
 */
export async function GET(request: NextRequest) {
  try {
    // Admin kontrolü (geçici olarak devre dışı)
    // const session = await getServerSession();
    // if (!session || (session.user as any)?.userType !== 'admin') {
    //   return NextResponse.json({
    //     success: false,
    //     message: 'Bu işlem için admin yetkisi gerekli'
    //   }, { status: 403 });
    // }

    await connectToMongoDB();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const search = searchParams.get('search') || '';
    const userType = searchParams.get('userType') || '';
    const isActive = searchParams.get('isActive');

    let query: any = {};

    // Arama filtresi
    if (search) {
      query.$or = [
        { email: { $regex: search, $options: 'i' } },
        { 'individualInfo.firstName': { $regex: search, $options: 'i' } },
        { 'individualInfo.lastName': { $regex: search, $options: 'i' } },
        { 'companyInfo.companyName': { $regex: search, $options: 'i' } }
      ];
    }

    // Kullanıcı tipi filtresi
    if (userType) {
      query.userType = userType;
    }

    // Aktiflik filtresi
    if (isActive !== null && isActive !== undefined) {
      query.isActive = isActive === 'true';
    }

    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      User.find(query)
        .select('-password') // Şifreleri hariç tut
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      User.countDocuments(query)
    ]);

    return NextResponse.json({
      success: true,
      data: users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      },
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('Kullanıcılar getirme hatası:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Kullanıcılar getirilemedi',
        error: error.message,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/users
 * Yeni kullanıcı oluştur (sadece admin)
 */
export async function POST(request: NextRequest) {
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
    const { email, password, userType, individualInfo, companyInfo } = body;

    // Email kontrolü
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return NextResponse.json({
        success: false,
        message: 'Bu email adresi zaten kullanılıyor'
      }, { status: 400 });
    }

    // Kullanıcı oluştur
    const newUser = new User({
      email: email.toLowerCase(),
      password,
      userType,
      individualInfo,
      companyInfo,
      isActive: true,
      isEmailVerified: false
    });

    await newUser.save();

    return NextResponse.json({
      success: true,
      message: 'Kullanıcı başarıyla oluşturuldu',
      data: {
        id: newUser._id,
        email: newUser.email,
        userType: newUser.userType
      },
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('Kullanıcı oluşturma hatası:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Kullanıcı oluşturulamadı',
        error: error.message,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}
