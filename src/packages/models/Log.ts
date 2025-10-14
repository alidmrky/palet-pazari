import mongoose, { Document, Schema } from 'mongoose';
import { connectToLogMongoDB } from '@/packages/libs/Database/log-mongodb';

// Log seviyeleri
export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
  FATAL = 'fatal'
}

// Log kategorileri
export enum LogCategory {
  AUTH = 'auth',
  USER = 'user',
  SYSTEM = 'system',
  API = 'api',
  DATABASE = 'database',
  SECURITY = 'security',
  BUSINESS = 'business'
}

// Log tipi
export enum LogType {
  LOGIN = 'login',
  LOGOUT = 'logout',
  REGISTER = 'register',
  PASSWORD_CHANGE = 'password_change',
  PROFILE_UPDATE = 'profile_update',
  API_CALL = 'api_call',
  ERROR = 'error',
  SECURITY_ALERT = 'security_alert',
  BUSINESS_ACTION = 'business_action'
}

// Ana log interface
export interface ILog extends Document {
  level: LogLevel;
  category: LogCategory;
  type: LogType;
  message: string;
  details?: any; // JSON object
  userId?: mongoose.Types.ObjectId;
  sessionId?: string;
  ipAddress?: string;
  userAgent?: string;
  requestId?: string;
  duration?: number; // milliseconds
  statusCode?: number;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
  metadata?: {
    [key: string]: any;
  };
  createdAt: Date;
}

// Log şeması
const LogSchema = new Schema<ILog>({
  level: {
    type: String,
    enum: Object.values(LogLevel),
    required: true,
    index: true
  },
  category: {
    type: String,
    enum: Object.values(LogCategory),
    required: true,
    index: true
  },
  type: {
    type: String,
    enum: Object.values(LogType),
    required: true,
    index: true
  },
  message: {
    type: String,
    required: true,
    maxlength: 1000
  },
  details: {
    type: Schema.Types.Mixed
  },
  userId: {
    type: Schema.Types.ObjectId,
    index: true
  },
  sessionId: {
    type: String,
    index: true
  },
  ipAddress: {
    type: String,
    index: true
  },
  userAgent: {
    type: String
  },
  requestId: {
    type: String,
    index: true
  },
  duration: {
    type: Number
  },
  statusCode: {
    type: Number,
    index: true
  },
  error: {
    name: { type: String },
    message: { type: String },
    stack: { type: String }
  },
  metadata: {
    type: Schema.Types.Mixed
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  }
}, {
  timestamps: false, // createdAt manuel olarak yönetiyoruz
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Index'ler
LogSchema.index({ level: 1, createdAt: -1 });
LogSchema.index({ category: 1, createdAt: -1 });
LogSchema.index({ type: 1, createdAt: -1 });
LogSchema.index({ userId: 1, createdAt: -1 });
LogSchema.index({ ipAddress: 1, createdAt: -1 });
LogSchema.index({ sessionId: 1, createdAt: -1 });

// Compound index'ler
LogSchema.index({ level: 1, category: 1, createdAt: -1 });
LogSchema.index({ userId: 1, type: 1, createdAt: -1 });
LogSchema.index({ ipAddress: 1, level: 1, createdAt: -1 });

// TTL index - 90 gün sonra otomatik sil
LogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 90 * 24 * 60 * 60 });

// Aynı database'de model oluştur
let LogModel: mongoose.Model<ILog>;

export const Log = async () => {
  if (!LogModel) {
    const { connectToLogMongoDB } = await import('@/packages/libs/Database/log-mongodb');
    await connectToLogMongoDB();
    LogModel = mongoose.models.Log || mongoose.model<ILog>('Log', LogSchema);
  }
  return LogModel;
};

export default Log;
