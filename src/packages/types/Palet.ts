// Palet Katalogu TypeScript Interface'leri

export interface PaletOlcu {
  uzunluk: number;  // mm
  genislik: number;  // mm
  yukseklik: number; // mm
}

export interface PaletKapasite {
  dinamik: number;   // kg - hareket halindeyken
  statik: number;    // kg - sabit durumda
  raf: number;       // kg - raf sisteminde
}

export interface PaletTahta {
  genislik: number;   // mm
  kalinlik: number;   // mm
  konum: string;      // kenar_sol, iç_sol, orta, iç_sag, kenar_sag
}

export interface PaletTablo {
  tahta_sayisi: number;
  tahtalar: PaletTahta[];
  tahta_araliklari?: number[]; // mm
}

export interface PaletBlok {
  adet: number;
  olcu: PaletOlcu;
  dizilim: string;    // 3x3, 2x2, vb.
}

export interface PaletCivi {
  adet: number;
  tip: string;        // spiral, düz, vb.
}

export interface PaletForkliftAcikliklari {
  sol_sag_yukseklik: number;  // mm
  on_arka_yukseklik: number;  // mm
}

export interface PaletToleranslar {
  uzunluk: string;    // ±5, ±3, vb.
  genislik: string;
  yukseklik: string;
}

export interface PaletTeknik {
  yapi_tipi: string;  // bloklu_4_yon, stringer_2_yon, tam_ayak
  ust_tablo: PaletTablo;
  alt_tablo: PaletTablo;
  bloklar: PaletBlok;
  civi: PaletCivi;
  forklift_acikliklari: PaletForkliftAcikliklari;
  toleranslar: PaletToleranslar;
}

export interface PaletUyumluluk {
  ispm15: boolean;
  gida_hijyen: string; // düşük, orta, yüksek
}

export interface PaletKullanim {
  havuz: boolean;
  tip: string[];      // cok_kullanimlik, tek_kullanimlik
  sektor: string[];   // perakende, FMCG, genel_lojistik
}

export interface PaletVaryant {
  varyant_id: string;
  malzeme: string;     // ahsap, plastik, metal, karton
  yuzey: string;       // pürüzlü, düz, kaplamalı
  agirlik_kg: number;
  kapasite_kg: PaletKapasite;
  teknik: PaletTeknik;
  uyumluluk: PaletUyumluluk;
}

export interface PaletModel {
  model_id: string;
  ad: string;
  olcu: PaletOlcu;
  kullanim: PaletKullanim;
  varyantlar: PaletVaryant[];
}

export interface PaletStandart {
  standart_id: string;
  ad: string;
  yonetici_kurum: string;
  notlar: string;
  modeller: PaletModel[];
}

export interface PaletKategori {
  kategori_id: string;
  ad: string;
  aciklama: string;
  standartlar: PaletStandart[];
}

export interface PaletKatalog {
  _meta: {
    versiyon: string;
    olusturma_tarihi: string;
    olcu_birimleri: string;
    aciklama: string;
  };
  kategoriler: PaletKategori[];
  referanslar: {
    uyumluluk: Record<string, string>;
    sozluk: Record<string, string>;
    index_onerileri: string[];
  };
}

