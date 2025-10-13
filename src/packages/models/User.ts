import mongoose, { Document, Schema } from 'mongoose';
import { UserType, IIndividualUser, ICompanyUser } from '@/packages/types/User';

// Interfaces are now imported from types/User.ts

// Ana kullanıcı interface'i
export interface IUser extends Document {
  email: string;
  password?: string; // OAuth kullanıcıları için opsiyonel
  userType: UserType;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  isActive: boolean;

  // Bireysel veya şirket bilgileri
  individualInfo?: IIndividualUser;
  companyInfo?: ICompanyUser;

  // OAuth bilgileri
  googleId?: string;
  facebookId?: string;

  // Sistem bilgileri
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;

  // Metodlar
  getFullName(): string;
  getDisplayName(): string;
}

// Bireysel kullanıcı şeması
const IndividualUserSchema = new Schema<IIndividualUser>({
  firstName: { type: String, required: true, trim: true },
  lastName: { type: String, required: true, trim: true },
  phone: { type: String, trim: true },
  address: {
    street: { type: String, trim: true },
    city: { type: String, trim: true },
    district: { type: String, trim: true },
    postalCode: { type: String, trim: true },
    country: { type: String, trim: true, default: 'Turkey' }
  },
  birthDate: { type: Date },
  identityNumber: { type: String, trim: true }
}, { _id: false });

// Şirket kullanıcı şeması
const CompanyUserSchema = new Schema<ICompanyUser>({
  companyName: { type: String, required: true, trim: true },
  taxNumber: { type: String, required: true, trim: true },
  taxOffice: { type: String, required: true, trim: true },
  phone: { type: String, trim: true },
  address: {
    street: { type: String, trim: true },
    city: { type: String, trim: true },
    district: { type: String, trim: true },
    postalCode: { type: String, trim: true },
    country: { type: String, trim: true, default: 'Turkey' }
  },
  authorizedPerson: {
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    position: { type: String, required: true, trim: true },
    phone: { type: String, trim: true },
    email: { type: String, trim: true }
  },
  companyType: { type: String, trim: true },
  website: { type: String, trim: true }
}, { _id: false });

// Ana kullanıcı şeması
const UserSchema = new Schema<IUser>({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Geçerli bir email adresi giriniz']
  },
  password: { type: String, minlength: 6 },
  userType: {
    type: String,
    enum: Object.values(UserType),
    required: true
  },
  isEmailVerified: { type: Boolean, default: false },
  isPhoneVerified: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },

  // Bireysel veya şirket bilgileri
  individualInfo: IndividualUserSchema,
  companyInfo: CompanyUserSchema,

  // OAuth bilgileri
  googleId: { type: String, unique: true, sparse: true },
  facebookId: { type: String, unique: true, sparse: true },

  // Sistem bilgileri
  lastLoginAt: { type: Date },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Index'ler
UserSchema.index({ email: 1 });
UserSchema.index({ googleId: 1 });
UserSchema.index({ facebookId: 1 });
UserSchema.index({ userType: 1 });

// Virtual alanlar
UserSchema.virtual('fullName').get(function() {
  if (this.userType === UserType.INDIVIDUAL && this.individualInfo) {
    return `${this.individualInfo.firstName} ${this.individualInfo.lastName}`;
  } else if (this.userType === UserType.COMPANY && this.companyInfo) {
    return this.companyInfo.companyName;
  }
  return this.email;
});

// Metodlar
UserSchema.methods.getFullName = function(): string {
  return this.fullName;
};

UserSchema.methods.getDisplayName = function(): string {
  if (this.userType === UserType.INDIVIDUAL && this.individualInfo) {
    return `${this.individualInfo.firstName} ${this.individualInfo.lastName}`;
  } else if (this.userType === UserType.COMPANY && this.companyInfo) {
    return this.companyInfo.companyName;
  }
  return this.email.split('@')[0];
};

// Pre-save middleware
UserSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Model oluştur
export const User = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default User;
