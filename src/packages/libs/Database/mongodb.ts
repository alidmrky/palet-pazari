import mongoose from 'mongoose';
import { MONGODB_URI } from '@/configs/envs';

// MongoDB bağlantı durumunu takip etmek için
let isConnected = false;

/**
 * MongoDB'ye bağlan
 * @returns Promise<boolean> - Bağlantı başarılı ise true
 */
export async function connectToMongoDB(): Promise<boolean> {
  try {
    // Eğer zaten bağlıysa, mevcut bağlantıyı kullan
    if (isConnected && mongoose.connection.readyState === 1) {
      console.log('MongoDB: Zaten bağlı');
      return true;
    }

    // Mevcut bağlantıyı temizle
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }

    // Yeni bağlantı kur
    await mongoose.connect(MONGODB_URI, {
      // Modern mongoose için gerekli ayarlar
      bufferCommands: false,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    isConnected = true;
    console.log('✅ MongoDB bağlantısı başarılı:', MONGODB_URI);
    return true;
  } catch (error) {
    console.error('❌ MongoDB bağlantı hatası:', error);
    isConnected = false;
    return false;
  }
}

/**
 * MongoDB bağlantısını kapat
 */
export async function disconnectFromMongoDB(): Promise<void> {
  try {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
      isConnected = false;
      console.log('MongoDB bağlantısı kapatıldı');
    }
  } catch (error) {
    console.error('MongoDB bağlantısı kapatılırken hata:', error);
  }
}

/**
 * MongoDB bağlantı durumunu kontrol et
 * @returns boolean - Bağlı ise true
 */
export function isMongoDBConnected(): boolean {
  return isConnected && mongoose.connection.readyState === 1;
}

/**
 * MongoDB bağlantı durumunu al
 * @returns string - Bağlantı durumu
 */
export function getMongoDBStatus(): string {
  const states = {
    0: 'Disconnected',
    1: 'Connected',
    2: 'Connecting',
    3: 'Disconnecting'
  };

  return states[mongoose.connection.readyState as keyof typeof states] || 'Unknown';
}
