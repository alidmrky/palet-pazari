import mongoose, { Document, Schema } from 'mongoose';
import { connectToMongoDB } from '@/packages/libs/Database/mongodb';

export interface IIlanDocument extends Document {
  ilan_tipi: 'satilik' | 'araniyor';
  baslik: string;
  aciklama: string;

  // Ürün seçimi
  ust_kategori_id: string;
  kategori_id: string;
  standart_id: string;
  model_id: string;
  varyant_id: string;

  // Durum ve miktar
  durum: 'sifir' | 'ikinci_el' | 'sertifikali';
  miktar: number;
  miktar_birimi: 'adet' | 'kamyon' | 'konteyner';

  // Konum bilgileri
  sehir: string;
  ilce: string;
  mahalle: string;
  google_maps_lat?: number;
  google_maps_lng?: number;
  adres_detay?: string;

  // Medya
  fotograflar: string[];

  // Teslimat ve sertifikalar
  teslimat_secenekleri: string[];
  sertifikalar: string[];
  ozel_sartlar?: string;

  // İletişim
  iletisim_telefon: string;
  iletisim_email: string;

  // Durum ve izleme
  ilan_durumu: 'aktif' | 'pasif' | 'tamamlandi' | 'iptal';
  goruntulenme_sayisi: number;
  user_id: mongoose.Types.ObjectId;

  // Tarihler
  createdAt: Date;
  updatedAt: Date;
  expiresAt?: Date;
}

const IlanSchema: Schema = new Schema({
  ilan_tipi: {
    type: String,
    required: true,
    enum: ['satilik', 'araniyor'],
    index: true
  },
  baslik: {
    type: String,
    required: true,
    maxlength: 200,
    index: true
  },
  aciklama: {
    type: String,
    required: true,
    minlength: 50,
    maxlength: 2000
  },

  // Ürün seçimi
  ust_kategori_id: {
    type: String,
    required: true,
    index: true
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
  varyant_id: {
    type: String,
    required: true,
    index: true
  },

  // Durum ve miktar
  durum: {
    type: String,
    required: true,
    enum: ['sifir', 'ikinci_el', 'sertifikali'],
    index: true
  },
  miktar: {
    type: Number,
    required: true,
    min: 1
  },
  miktar_birimi: {
    type: String,
    required: true,
    enum: ['adet', 'kamyon', 'konteyner'],
    default: 'adet'
  },

  // Konum bilgileri
  sehir: {
    type: String,
    required: true,
    index: true
  },
  ilce: {
    type: String,
    required: true,
    index: true
  },
  mahalle: {
    type: String,
    required: true,
    index: true
  },
  google_maps_lat: {
    type: Number
  },
  google_maps_lng: {
    type: Number
  },
  adres_detay: {
    type: String,
    maxlength: 500
  },

  // Medya
  fotograflar: [{
    type: String,
    required: true
  }],

  // Teslimat ve sertifikalar
  teslimat_secenekleri: [{
    type: String,
    enum: ['yerinde_teslim', 'kargo', 'nakliye']
  }],
  sertifikalar: [{
    type: String
  }],
  ozel_sartlar: {
    type: String,
    maxlength: 1000
  },

  // İletişim
  iletisim_telefon: {
    type: String,
    required: true
  },
  iletisim_email: {
    type: String,
    required: true,
    lowercase: true
  },

  // Durum ve izleme
  ilan_durumu: {
    type: String,
    required: true,
    enum: ['aktif', 'pasif', 'tamamlandi', 'iptal'],
    default: 'aktif',
    index: true
  },
  goruntulenme_sayisi: {
    type: Number,
    default: 0
  },
  user_id: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },

  // Tarihler
  expiresAt: {
    type: Date,
    index: { expireAfterSeconds: 0 } // TTL index
  }
}, {
  timestamps: true
});

// Index'ler
IlanSchema.index({ ust_kategori_id: 1, kategori_id: 1, standart_id: 1, model_id: 1, varyant_id: 1 });
IlanSchema.index({ sehir: 1, ilce: 1, mahalle: 1 });
IlanSchema.index({ ilan_durumu: 1, createdAt: -1 });
IlanSchema.index({ user_id: 1, ilan_durumu: 1 });
IlanSchema.index({ baslik: 'text', aciklama: 'text' }); // Text search

// Pre-save middleware
IlanSchema.pre('save', function(next) {
  this.updatedAt = new Date();

  // Otomatik başlık oluştur (eğer yoksa)
  if (!this.baslik || this.baslik.trim() === '') {
    this.baslik = `${this.ust_kategori_id} ${this.kategori_id} ${this.model_id} - ${this.durum}`;
  }

  // Varsayılan süre (30 gün)
  if (!this.expiresAt) {
    this.expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  }

  next();
});

// Model oluştur
let IlanModel: mongoose.Model<IIlanDocument>;

export const Ilan = async () => {
  if (!IlanModel) {
    await connectToMongoDB();
    IlanModel = mongoose.models.Ilan || mongoose.model<IIlanDocument>('Ilan', IlanSchema);
  }
  return IlanModel;
};

export default Ilan;
