import mongoose, { Document, Schema } from 'mongoose';
import { connectToMongoDB } from '@/packages/libs/Database/mongodb';
import { PaletKategori as IPaletKategori } from '@/packages/types/Palet';

export interface IPaletKategoriDocument extends IPaletKategori, Document {
  createdAt: Date;
  updatedAt: Date;
}

const PaletKategoriSchema: Schema = new Schema({
  kategori_id: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  ust_kategori_id: {
    type: String,
    required: true,
    index: true,
    default: 'paletler'
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
  standartlar: [{
    standart_id: {
      type: String,
      required: true,
      index: true
    },
    ad: {
      type: String,
      required: true
    },
    yonetici_kurum: {
      type: String,
      required: true
    },
    notlar: {
      type: String
    },
    modeller: [{
      model_id: {
        type: String,
        required: true,
        index: true
      },
      ad: {
        type: String,
        required: true
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
      }]
    }]
  }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Index'ler
PaletKategoriSchema.index({ 'standartlar.modeller.model_id': 1 });
PaletKategoriSchema.index({ 'standartlar.modeller.varyantlar.varyant_id': 1 });
PaletKategoriSchema.index({ 'standartlar.modeller.varyantlar.malzeme': 1 });
PaletKategoriSchema.index({ 'standartlar.modeller.olcu.uzunluk': 1, 'standartlar.modeller.olcu.genislik': 1 });

// Pre-save middleware
PaletKategoriSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Model oluştur
let PaletKategoriModel: mongoose.Model<IPaletKategoriDocument>;

export const PaletKategori = async() => {
  if (!PaletKategoriModel) {
    await connectToMongoDB();
    PaletKategoriModel = mongoose.models.PaletKategori || mongoose.model<IPaletKategoriDocument>('PaletKategori', PaletKategoriSchema);
  }
  return PaletKategoriModel;
};

export default PaletKategori;
