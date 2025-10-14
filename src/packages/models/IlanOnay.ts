import mongoose, { Document, Schema } from 'mongoose';
import { connectToMongoDB } from '@/packages/libs/Database/mongodb';

export enum OnayDurumu {
  BEKLIYOR = 'bekliyor',
  ONAYLANDI = 'onaylandi',
  REDDEDILDI = 'reddedildi',
  GERI_GONDERILDI = 'geri_gonderildi'
}

export enum OnayAsamasi {
  ILK_KONTROL = 'ilk_kontrol',
  ICERIK_KONTROL = 'icerik_kontrol',
  FOTO_KONTROL = 'foto_kontrol',
  KONUM_KONTROL = 'konum_kontrol',
  FINAL_ONAY = 'final_onay'
}

export interface IIlanOnay {
  ilanId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  onayDurumu: OnayDurumu;
  onayAsamasi: OnayAsamasi;
  onaylayanAdminId?: mongoose.Types.ObjectId;
  onayTarihi?: Date;
  redNedeni?: string;
  notlar?: string;
  onayAsamalari: {
    asama: OnayAsamasi;
    durum: 'bekliyor' | 'onaylandi' | 'reddedildi';
    onaylayanAdminId?: mongoose.Types.ObjectId;
    onayTarihi?: Date;
    notlar?: string;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

export interface IIlanOnayDocument extends IIlanOnay, Document {}

const IlanOnaySchema: Schema = new Schema({
  ilanId: {
    type: Schema.Types.ObjectId,
    ref: 'Ilan',
    required: true,
    index: true
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  onayDurumu: {
    type: String,
    enum: Object.values(OnayDurumu),
    default: OnayDurumu.BEKLIYOR,
    index: true
  },
  onayAsamasi: {
    type: String,
    enum: Object.values(OnayAsamasi),
    default: OnayAsamasi.ILK_KONTROL,
    index: true
  },
  onaylayanAdminId: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  onayTarihi: {
    type: Date
  },
  redNedeni: {
    type: String
  },
  notlar: {
    type: String
  },
  onayAsamalari: [{
    asama: {
      type: String,
      enum: Object.values(OnayAsamasi),
      required: true
    },
    durum: {
      type: String,
      enum: ['bekliyor', 'onaylandi', 'reddedildi'],
      default: 'bekliyor'
    },
    onaylayanAdminId: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    onayTarihi: {
      type: Date
    },
    notlar: {
      type: String
    }
  }]
}, { timestamps: true });

// Index'ler
IlanOnaySchema.index({ onayDurumu: 1, onayAsamasi: 1 });
IlanOnaySchema.index({ userId: 1, onayDurumu: 1 });
IlanOnaySchema.index({ createdAt: -1 });

let IlanOnayModel: mongoose.Model<IIlanOnayDocument>;

export const IlanOnay = async () => {
  if (!IlanOnayModel) {
    await connectToMongoDB();
    IlanOnayModel = mongoose.models.IlanOnay || mongoose.model<IIlanOnayDocument>('IlanOnay', IlanOnaySchema);
  }
  return IlanOnayModel;
};

export default IlanOnay;
