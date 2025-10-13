import mongoose, { Document, Schema } from 'mongoose';
import { connectToLogMongoDB } from '@/packages/libs/Database/log-mongodb';

// Login durumu enum
export enum LoginStatus {
  SUCCESS = 'success',
  FAILED = 'failed',
  BLOCKED = 'blocked',
  EXPIRED = 'expired'
}

// Login yöntemi enum
export enum LoginMethod {
  EMAIL = 'email',
  GOOGLE = 'google',
  FACEBOOK = 'facebook'
}

// User login interface
export interface IUserLogin extends Document {
  userId: mongoose.Types.ObjectId;
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
    type: string; // mobile, desktop, tablet
    os: string;
    browser: string;
  };
  sessionId?: string;
  failureReason?: string; // Şifre hatalı, hesap bloklu, vs.
  loginAttempts: number; // Bu IP'den kaç kez denendi
  isSuspicious: boolean; // Şüpheli aktivite
  createdAt: Date;
  updatedAt: Date;
}

// User login şeması
const UserLoginSchema = new Schema<IUserLogin>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
    index: true
  },
  loginMethod: {
    type: String,
    enum: Object.values(LoginMethod),
    required: true
  },
  status: {
    type: String,
    enum: Object.values(LoginStatus),
    required: true,
    index: true
  },
  ipAddress: {
    type: String,
    required: true,
    index: true
  },
  userAgent: {
    type: String,
    required: true
  },
  location: {
    country: { type: String },
    city: { type: String },
    region: { type: String }
  },
  deviceInfo: {
    type: { type: String, required: true },
    os: { type: String, required: true },
    browser: { type: String, required: true }
  },
  sessionId: {
    type: String,
    index: true
  },
  failureReason: {
    type: String
  },
  loginAttempts: {
    type: Number,
    default: 1
  },
  isSuspicious: {
    type: Boolean,
    default: false,
    index: true
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Index'ler
UserLoginSchema.index({ userId: 1, createdAt: -1 });
UserLoginSchema.index({ email: 1, createdAt: -1 });
UserLoginSchema.index({ ipAddress: 1, createdAt: -1 });
UserLoginSchema.index({ status: 1, createdAt: -1 });
UserLoginSchema.index({ isSuspicious: 1, createdAt: -1 });

// Compound index'ler
UserLoginSchema.index({ userId: 1, status: 1 });
UserLoginSchema.index({ ipAddress: 1, status: 1 });
UserLoginSchema.index({ email: 1, status: 1 });

// Pre-save middleware
UserLoginSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Log database'de model oluştur
let UserLoginModel: mongoose.Model<IUserLogin>;

export const UserLogin = async () => {
  if (!UserLoginModel) {
    await connectToLogMongoDB();
    UserLoginModel = mongoose.models.UserLogin || mongoose.model<IUserLogin>('UserLogin', UserLoginSchema);
  }
  return UserLoginModel;
};

export default UserLogin;
