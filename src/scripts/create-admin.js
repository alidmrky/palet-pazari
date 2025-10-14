const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// MongoDB bağlantısı
const connectToMongoDB = async() => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB bağlantısı başarılı');
  } catch (error) {
    console.error('❌ MongoDB bağlantı hatası:', error);
    process.exit(1);
  }
};

// User modeli (basit versiyon)
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  userType: {
    type: String,
    enum: ['individual', 'company', 'admin'],
    default: 'individual'
  },
  isActive: { type: Boolean, default: true },
  isEmailVerified: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  lastLoginAt: { type: Date }
});

const User = mongoose.model('User', userSchema);

const createAdmin = async() => {
  try {
    await connectToMongoDB();

    // Admin email ve şifre
    const adminEmail = 'admin@paletpazari.com';
    const adminPassword = 'admin123'; // Güvenli bir şifre seçin

    // Mevcut admin kontrolü
    const existingAdmin = await User.findOne({ email: adminEmail });
    if (existingAdmin) {
      console.log('⚠️  Admin kullanıcısı zaten mevcut');
      console.log(`📧 Email: ${adminEmail}`);
      console.log(`🔑 Şifre: ${adminPassword}`);
      return;
    }

    // Şifreyi hash'le
    const hashedPassword = await bcrypt.hash(adminPassword, 12);

    // Admin kullanıcısı oluştur
    const adminUser = new User({
      email: adminEmail,
      password: hashedPassword,
      userType: 'admin',
      isActive: true,
      isEmailVerified: true
    });

    await adminUser.save();

    console.log('✅ Admin kullanıcısı başarıyla oluşturuldu!');
    console.log(`📧 Email: ${adminEmail}`);
    console.log(`🔑 Şifre: ${adminPassword}`);
    console.log('🔐 Admin paneline giriş yapabilirsiniz');

  } catch (error) {
    console.error('❌ Admin oluşturma hatası:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 MongoDB bağlantısı kapatıldı');
  }
};

createAdmin();
