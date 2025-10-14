import mongoose, { Document, Schema } from 'mongoose';
import { connectToMongoDB } from '@/packages/libs/Database/mongodb';
import { PaletVaryant as IPaletVaryant } from '@/packages/types/Palet';

export interface IPaletVaryantDocument extends IPaletVaryant, Document {
  kategori_id: string;
  standart_id: string;
  model_id: string;
  createdAt: Date;
  updatedAt: Date;
}

const PaletVaryantSchema: Schema = new Schema({
  varyant_id: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  malzeme: {
    type: String,
    required: true,
    index: true
  },
  yuzey: {
    type: String,
    required: true,
    index: true
  },
  agirlik_kg: {
    type: Number,
    required: true,
    index: true
  },
  kapasite_kg: {
    dinamik: { type: Number, required: true },
    statik: { type: Number, required: true },
    raf: { type: Number, required: true }
  },
  kategori_id: {
    type: String,
    required: true,
    index: true
  },
  standart_id: {
    type: String,
    required: true,
    index: true
  },
  model_id: {
    type: String,
    required: true,
    index: true
  },
  teknik: {
    yapi_tipi: { type: String, required: true },
    ust_tablo: {
      tahta_sayisi: { type: Number, required: true },
      tahtalar: [{
        genislik: { type: Number, required: true },
        kalinlik: { type: Number, required: true },
        konum: { type: String, required: true }
      }],
      tahta_araliklari: [{ type: Number }]
    },
    alt_tablo: {
      tahta_sayisi: { type: Number, required: true },
      tahtalar: [{
        genislik: { type: Number, required: true },
        kalinlik: { type: Number, required: true },
        konum: { type: String, required: true }
      }]
    },
    bloklar: {
      adet: { type: Number, required: true },
      olcu: {
        uzunluk: { type: Number, required: true },
        genislik: { type: Number, required: true },
        yukseklik: { type: Number, required: true }
      },
      dizilim: { type: String, required: true }
    },
    civi: {
      adet: { type: Number, required: true },
      tip: { type: String, required: true }
    },
    forklift_acikliklari: {
      sol_sag_yukseklik: { type: Number, required: true },
      on_arka_yukseklik: { type: Number, required: true }
    },
    toleranslar: {
      uzunluk: { type: String, required: true },
      genislik: { type: String, required: true },
      yukseklik: { type: String, required: true }
    }
  },
  uyumluluk: {
    ispm15: { type: Boolean, required: true },
    gida_hijyen: { type: String, required: true }
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Index'ler
PaletVaryantSchema.index({ 'kapasite_kg.dinamik': 1 });
PaletVaryantSchema.index({ 'kapasite_kg.statik': 1 });
PaletVaryantSchema.index({ 'uyumluluk.ispm15': 1 });
PaletVaryantSchema.index({ 'uyumluluk.gida_hijyen': 1 });
PaletVaryantSchema.index({ 'teknik.yapi_tipi': 1 });

// Pre-save middleware
PaletVaryantSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Model oluştur
let PaletVaryantModel: mongoose.Model<IPaletVaryantDocument>;

export const PaletVaryant = async () => {
  if (!PaletVaryantModel) {
    await connectToMongoDB();
    PaletVaryantModel = mongoose.models.PaletVaryant || mongoose.model<IPaletVaryantDocument>('PaletVaryant', PaletVaryantSchema);
  }
  return PaletVaryantModel;
};

export default PaletVaryant;

