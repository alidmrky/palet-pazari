import mongoose from 'mongoose';
import { NextRequest, NextResponse } from 'next/server';
import { connectToLogMongoDB, isLogMongoDBConnected, getLogMongoDBStatus } from '@/packages/libs/Database/log-mongodb';
import { writeLog, logError, logApiCall, logSecurityAlert, logBusinessAction } from '@/packages/utils/logger';
import { LogLevel, LogCategory, LogType } from '@/packages/models/Log';

/**
 * Log test endpoint'i
 * GET /api/logs/test
 */
export async function GET(request: NextRequest) {
  try {
    // Log MongoDB'ye bağlan
    const connected = await connectToLogMongoDB();

    if (!connected) {
      return NextResponse.json({
        success: false,
        message: 'Log MongoDB bağlantısı başarısız!',
        status: getLogMongoDBStatus(),
        isConnected: isLogMongoDBConnected(),
        timestamp: new Date().toISOString()
      }, { status: 500 });
    }

    // Test log'ları yaz
    await writeLog({
      level: LogLevel.INFO,
      category: LogCategory.SYSTEM,
      type: LogType.API_CALL,
      message: 'Log test endpoint çağrıldı',
      details: {
        endpoint: '/api/logs/test',
        method: 'GET'
      },
      ipAddress: request.ip || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown'
    });

    await logError(new Error('Test error'), {
      ipAddress: request.ip || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown'
    });

    await logApiCall({
      method: 'GET',
      url: '/api/logs/test',
      statusCode: 200,
      duration: 100,
      ipAddress: request.ip || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown'
    });

    await logSecurityAlert({
      message: 'Test security alert',
      severity: 'low',
      ipAddress: request.ip || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown'
    });

    // Test için geçerli ObjectId oluştur
    const testUserId = new mongoose.Types.ObjectId().toString();

    await logBusinessAction({
      action: 'test_action',
      message: 'Test business action',
      userId: testUserId,
      ipAddress: request.ip || 'unknown'
    });

    return NextResponse.json({
      success: true,
      message: 'Log sistemi başarıyla test edildi!',
      status: getLogMongoDBStatus(),
      isConnected: isLogMongoDBConnected(),
      timestamp: new Date().toISOString(),
      tests: [
        'writeLog - INFO log yazıldı',
        'logError - ERROR log yazıldı',
        'logApiCall - API call log yazıldı',
        'logSecurityAlert - Security alert log yazıldı',
        'logBusinessAction - Business action log yazıldı'
      ]
    });

  } catch (error) {
    console.error('Log test hatası:', error);
    return NextResponse.json({
      success: false,
      message: 'Log test sırasında hata oluştu',
      error: error instanceof Error ? error.message : 'Bilinmeyen hata',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
