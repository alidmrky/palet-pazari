import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { connectToMongoDB } from '@/packages/libs/Database/mongodb';
import { User } from '@/packages/models/User';

/**
 * GET /api/admin/users/stats
 * Kullanıcı istatistiklerini getir (sadece admin)
 */
export async function GET(request: NextRequest) {
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

    // Paralel sorgular
    const [
      totalUsers,
      activeUsers,
      individualUsers,
      companyUsers,
      adminUsers,
      recentUsers,
      usersByMonth
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ isActive: true }),
      User.countDocuments({ userType: 'individual' }),
      User.countDocuments({ userType: 'company' }),
      User.countDocuments({ userType: 'admin' }),
      User.find({})
        .select('-password')
        .sort({ createdAt: -1 })
        .limit(10)
        .lean(),
      User.aggregate([
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' }
            },
            count: { $sum: 1 }
          }
        },
        { $sort: { '_id.year': -1, '_id.month': -1 } },
        { $limit: 12 }
      ])
    ]);

    const inactiveUsers = totalUsers - activeUsers;

    return NextResponse.json({
      success: true,
      data: {
        totalUsers,
        activeUsers,
        inactiveUsers,
        individualUsers,
        companyUsers,
        adminUsers,
        recentUsers,
        usersByMonth,
        stats: {
          activeRate: totalUsers > 0 ? Math.round((activeUsers / totalUsers) * 100) : 0,
          individualRate: totalUsers > 0 ? Math.round((individualUsers / totalUsers) * 100) : 0,
          companyRate: totalUsers > 0 ? Math.round((companyUsers / totalUsers) * 100) : 0
        }
      },
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('Kullanıcı istatistikleri getirme hatası:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Kullanıcı istatistikleri getirilemedi',
        error: error.message,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

