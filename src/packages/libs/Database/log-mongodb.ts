import mongoose from 'mongoose';

// Log MongoDB bağlantı durumunu takip etmek için
let isLogConnected = false;

/**
 * Log MongoDB'ye bağlan
 * @returns Promise<boolean> - Bağlantı başarılı ise true
 */
export async function connectToLogMongoDB(): Promise<boolean> {
  try {
    // Eğer zaten bağlıysa, mevcut bağlantıyı kullan
    if (isLogConnected && mongoose.connection.readyState === 1) {
      console.log('Log MongoDB: Zaten bağlı');
      return true;
    }

    // Log veritabanı URI'si
    const LOG_MONGODB_URI = process.env.LOG_MONGODB_URI || 'mongodb://localhost:27017/palet-pazari-log';

    // Mevcut bağlantıyı temizle
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }

    // Yeni bağlantı kur
    await mongoose.connect(LOG_MONGODB_URI, {
      // Modern mongoose için gerekli ayarlar
      bufferCommands: false,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    isLogConnected = true;
    console.log('✅ Log MongoDB bağlantısı başarılı:', LOG_MONGODB_URI);
    return true;
  } catch (error) {
    console.error('❌ Log MongoDB bağlantı hatası:', error);
    isLogConnected = false;
    return false;
  }
}

/**
 * Log MongoDB bağlantısını kapat
 */
export async function disconnectFromLogMongoDB(): Promise<void> {
  try {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
      isLogConnected = false;
      console.log('Log MongoDB bağlantısı kapatıldı');
    }
  } catch (error) {
    console.error('Log MongoDB bağlantısı kapatılırken hata:', error);
  }
}

/**
 * Log MongoDB bağlantı durumunu kontrol et
 * @returns boolean - Bağlı ise true
 */
export function isLogMongoDBConnected(): boolean {
  return isLogConnected && mongoose.connection.readyState === 1;
}

/**
 * Log MongoDB bağlantı durumunu al
 * @returns string - Bağlantı durumu
 */
export function getLogMongoDBStatus(): string {
  const states = {
    0: 'Disconnected',
    1: 'Connected',
    2: 'Connecting',
    3: 'Disconnecting'
  };

  return states[mongoose.connection.readyState as keyof typeof states] || 'Unknown';
}
