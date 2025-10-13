import mongoose from 'mongoose';
import { connectToLogMongoDB } from '@/packages/libs/Database/log-mongodb';
import { Log, LogLevel, LogCategory, LogType } from '@/packages/models/Log';
import { UserLogin, LoginStatus, LoginMethod } from '@/packages/models/UserLogin';

interface LogData {
  level: LogLevel;
  category: LogCategory;
  type: LogType;
  message: string;
  details?: any;
  userId?: string;
  sessionId?: string;
  ipAddress?: string;
  userAgent?: string;
  requestId?: string;
  duration?: number;
  statusCode?: number;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
  metadata?: {
    [key: string]: any;
  };
}

/**
 * Genel log yazma fonksiyonu
 */
export async function writeLog(data: LogData): Promise<void> {
  try {
    await connectToLogMongoDB();

    // userId geçerli ObjectId mi kontrol et
    let validUserId = undefined;
    if (data.userId && data.userId !== 'unknown' && data.userId !== 'test-user-id') {
      try {
        // ObjectId geçerli mi kontrol et
        if (data.userId.match(/^[0-9a-fA-F]{24}$/)) {
          validUserId = data.userId as any;
        }
      } catch (error) {
        console.log('Invalid userId in writeLog:', data.userId);
      }
    }

    const log = new Log({
      ...data,
      userId: validUserId,
      createdAt: new Date()
    });

    await log.save();
  } catch (error) {
    console.error('Log yazma hatası:', error);
  }
}

/**
 * Login tracking fonksiyonu
 */
export async function trackLogin(data: {
  userId: string;
  email: string;
  loginMethod: LoginMethod;
  status: LoginStatus;
  ipAddress: string;
  userAgent: string;
  location?: {
    country?: string;
    city?: string;
    region?: string;
  };
  deviceInfo?: {
    type: string;
    os: string;
    browser: string;
  };
  sessionId?: string;
  failureReason?: string;
  loginAttempts?: number;
  isSuspicious?: boolean;
}): Promise<void> {
  try {
    await connectToLogMongoDB();

    // userId geçerli ObjectId mi kontrol et
    let validUserId = null;
    if (data.userId && data.userId !== 'unknown' && data.userId !== 'test-user-id') {
      try {
        // ObjectId geçerli mi kontrol et
        if (data.userId.match(/^[0-9a-fA-F]{24}$/)) {
          validUserId = data.userId;
        }
      } catch (error) {
        console.log('Invalid userId:', data.userId);
      }
    }

    const UserLoginModel = await UserLogin();
    const userLogin = new UserLoginModel({
      userId: validUserId || new mongoose.Types.ObjectId(), // Geçerli ObjectId oluştur
      email: data.email,
      loginMethod: data.loginMethod,
      status: data.status,
      ipAddress: data.ipAddress,
      userAgent: data.userAgent,
      location: data.location,
      deviceInfo: data.deviceInfo || {
        type: 'unknown',
        os: 'unknown',
        browser: 'unknown'
      },
      sessionId: data.sessionId,
      failureReason: data.failureReason,
      loginAttempts: data.loginAttempts || 1,
      isSuspicious: data.isSuspicious || false
    });

    await userLogin.save();

    // Ayrıca genel log'a da yaz
    await writeLog({
      level: data.status === LoginStatus.SUCCESS ? LogLevel.INFO : LogLevel.WARN,
      category: LogCategory.AUTH,
      type: LogType.LOGIN,
      message: `Login ${data.status}: ${data.email}`,
      details: {
        loginMethod: data.loginMethod,
        ipAddress: data.ipAddress,
        isSuspicious: data.isSuspicious,
        failureReason: data.failureReason
      },
      userId: data.userId,
      sessionId: data.sessionId,
      ipAddress: data.ipAddress,
      userAgent: data.userAgent
    });
  } catch (error) {
    console.error('Login tracking hatası:', error);
  }
}

/**
 * Hata log yazma fonksiyonu
 */
export async function logError(error: Error, context?: {
  userId?: string;
  sessionId?: string;
  ipAddress?: string;
  requestId?: string;
  metadata?: any;
}): Promise<void> {
  await writeLog({
    level: LogLevel.ERROR,
    category: LogCategory.SYSTEM,
    type: LogType.ERROR,
    message: error.message,
    details: {
      errorName: error.name,
      stack: error.stack
    },
    userId: context?.userId,
    sessionId: context?.sessionId,
    ipAddress: context?.ipAddress,
    requestId: context?.requestId,
    error: {
      name: error.name,
      message: error.message,
      stack: error.stack
    },
    metadata: context?.metadata
  });
}

/**
 * API çağrı log yazma fonksiyonu
 */
export async function logApiCall(data: {
  method: string;
  url: string;
  statusCode: number;
  duration: number;
  userId?: string;
  sessionId?: string;
  ipAddress?: string;
  userAgent?: string;
  requestId?: string;
  metadata?: any;
}): Promise<void> {
  await writeLog({
    level: data.statusCode >= 400 ? LogLevel.WARN : LogLevel.INFO,
    category: LogCategory.API,
    type: LogType.API_CALL,
    message: `${data.method} ${data.url} - ${data.statusCode}`,
    details: {
      method: data.method,
      url: data.url,
      statusCode: data.statusCode,
      duration: data.duration
    },
    userId: data.userId,
    sessionId: data.sessionId,
    ipAddress: data.ipAddress,
    userAgent: data.userAgent,
    requestId: data.requestId,
    duration: data.duration,
    statusCode: data.statusCode,
    metadata: data.metadata
  });
}

/**
 * Güvenlik uyarı log yazma fonksiyonu
 */
export async function logSecurityAlert(data: {
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  userId?: string;
  sessionId?: string;
  ipAddress?: string;
  userAgent?: string;
  details?: any;
}): Promise<void> {
  const level = data.severity === 'critical' ? LogLevel.FATAL :
                data.severity === 'high' ? LogLevel.ERROR :
                data.severity === 'medium' ? LogLevel.WARN : LogLevel.INFO;

  await writeLog({
    level,
    category: LogCategory.SECURITY,
    type: LogType.SECURITY_ALERT,
    message: data.message,
    details: {
      severity: data.severity,
      ...data.details
    },
    userId: data.userId,
    sessionId: data.sessionId,
    ipAddress: data.ipAddress,
    userAgent: data.userAgent
  });
}

/**
 * İş mantığı log yazma fonksiyonu
 */
export async function logBusinessAction(data: {
  action: string;
  message: string;
  userId: string;
  sessionId?: string;
  ipAddress?: string;
  details?: any;
}): Promise<void> {
  await writeLog({
    level: LogLevel.INFO,
    category: LogCategory.BUSINESS,
    type: LogType.BUSINESS_ACTION,
    message: data.message,
    details: {
      action: data.action,
      ...data.details
    },
    userId: data.userId,
    sessionId: data.sessionId,
    ipAddress: data.ipAddress
  });
}
