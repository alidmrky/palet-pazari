import mongoose, { Document, Schema } from 'mongoose';
import { connectToMongoDB } from '@/packages/libs/Database/mongodb';

export interface IUstKategoriDocument extends Document {
  ust_kategori_id: string;
  ad: string;
  aciklama: string;
  icon: string;
  hiyerarsi_seviyeleri: string[];
  aktif: boolean;
  sira: number;
  createdAt: Date;
  updatedAt: Date;
}

const UstKategoriSchema: Schema = new Schema({
  ust_kategori_id: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  ad: {
    type: String,
    required: true,
    index: true
  },
  aciklama: {
    type: String,
    required: true
  },
  icon: {
    type: String,
    required: true,
    default: '📦'
  },
  hiyerarsi_seviyeleri: [{
    type: String,
    required: true
  }],
  aktif: {
    type: Boolean,
    default: true,
    index: true
  },
  sira: {
    type: Number,
    default: 0,
    index: true
  }
}, {
  timestamps: true
});

// Index'ler
UstKategoriSchema.index({ aktif: 1, sira: 1 });

// Pre-save middleware
UstKategoriSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Model oluştur
let UstKategoriModel: mongoose.Model<IUstKategoriDocument>;

export const UstKategori = async() => {
  if (!UstKategoriModel) {
    await connectToMongoDB();
    UstKategoriModel = mongoose.models.UstKategori || mongoose.model<IUstKategoriDocument>('UstKategori', UstKategoriSchema);
  }
  return UstKategoriModel;
};

export default UstKategori;
