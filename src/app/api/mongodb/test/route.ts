import { NextRequest, NextResponse } from 'next/server';
import { connectToMongoDB, isMongoDBConnected, getMongoDBStatus } from '@/packages/libs/Database/mongodb';

/**
 * MongoDB bağlantı test endpoint'i
 * GET /api/mongodb/test
 */
export async function GET(request: NextRequest) {
  try {
    // MongoDB'ye bağlan
    const connected = await connectToMongoDB();

    if (connected) {
      return NextResponse.json({
        success: true,
        message: 'MongoDB bağlantısı başarılı!',
        status: getMongoDBStatus(),
        isConnected: isMongoDBConnected(),
        timestamp: new Date().toISOString()
      });
    } else {
      return NextResponse.json({
        success: false,
        message: 'MongoDB bağlantısı başarısız!',
        status: getMongoDBStatus(),
        isConnected: isMongoDBConnected(),
        timestamp: new Date().toISOString()
      }, { status: 500 });
    }
  } catch (error) {
    console.error('MongoDB test hatası:', error);
    return NextResponse.json({
      success: false,
      message: 'MongoDB test sırasında hata oluştu',
      error: error instanceof Error ? error.message : 'Bilinmeyen hata',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
