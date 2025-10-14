import mongoose, { Document, Schema } from 'mongoose';
import { connectToMongoDB } from '@/packages/libs/Database/mongodb';
import { PaletModel as IPaletModel } from '@/packages/types/Palet';

export interface IPaletModelDocument extends IPaletModel, Document {
  kategori_id: string;
  standart_id: string;
  createdAt: Date;
  updatedAt: Date;
}

const PaletModelSchema: Schema = new Schema({
  model_id: {
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
  olcu: {
    uzunluk: { type: Number, required: true },
    genislik: { type: Number, required: true },
    yukseklik: { type: Number, required: true }
  },
  kullanim: {
    havuz: { type: Boolean, default: false },
    tip: [{ type: String }],
    sektor: [{ type: String }]
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
  varyantlar: [{
    varyant_id: {
      type: String,
      required: true,
      index: true
    },
    malzeme: {
      type: String,
      required: true,
      index: true
    },
    yuzey: {
      type: String,
      required: true
    },
    agirlik_kg: {
      type: Number,
      required: true
    },
    kapasite_kg: {
      dinamik: { type: Number, required: true },
      statik: { type: Number, required: true },
      raf: { type: Number, required: true }
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
    }
  }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Index'ler
PaletModelSchema.index({ 'varyantlar.varyant_id': 1 });
PaletModelSchema.index({ 'varyantlar.malzeme': 1 });
PaletModelSchema.index({ 'olcu.uzunluk': 1, 'olcu.genislik': 1 });
PaletModelSchema.index({ 'kullanim.sektor': 1 });
PaletModelSchema.index({ 'kullanim.tip': 1 });

// Pre-save middleware
PaletModelSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Model oluştur
let PaletModelModel: mongoose.Model<IPaletModelDocument>;

export const PaletModel = async () => {
  if (!PaletModelModel) {
    await connectToMongoDB();
    PaletModelModel = mongoose.models.PaletModel || mongoose.model<IPaletModelDocument>('PaletModel', PaletModelSchema);
  }
  return PaletModelModel;
};

export default PaletModel;

