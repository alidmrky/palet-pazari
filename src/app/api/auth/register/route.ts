import { NextRequest, NextResponse } from 'next/server';
import { connectToMongoDB } from '@/packages/libs/Database/mongodb';
import { User } from '@/packages/models/User';
import { UserType } from '@/packages/types/User';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    await connectToMongoDB();

    // Request body'yi güvenli şekilde parse et
    let body;
    try {
      body = await request.json();
    } catch (error) {
      console.error('JSON parse error:', error);
      return NextResponse.json({ message: 'Geçersiz JSON formatı.' }, { status: 400 });
    }
    const {
      userType,
      email,
      password,
      confirmPassword,
      firstName,
      lastName,
      phone,
      companyName,
      taxNumber,
      taxOffice,
      authorizedPersonFirstName,
      authorizedPersonLastName,
      authorizedPersonPosition,
      authorizedPersonPhone,
      authorizedPersonEmail
    } = body;

    // Validasyon
    if (!email || !password || !confirmPassword) {
      return NextResponse.json({
        success: false,
        message: 'Email, şifre ve şifre tekrar alanları zorunludur'
      }, { status: 400 });
    }

    if (password !== confirmPassword) {
      return NextResponse.json({
        success: false,
        message: 'Şifreler eşleşmiyor'
      }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({
        success: false,
        message: 'Şifre en az 6 karakter olmalıdır'
      }, { status: 400 });
    }

    // Email format kontrolü
    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({
        success: false,
        message: 'Geçerli bir email adresi giriniz'
      }, { status: 400 });
    }

    // Bireysel kullanıcı validasyonu
    if (userType === UserType.INDIVIDUAL) {
      if (!firstName || !lastName) {
        return NextResponse.json({
          success: false,
          message: 'Ad ve soyad alanları zorunludur'
        }, { status: 400 });
      }
    }

    // Şirket kullanıcı validasyonu
    if (userType === UserType.COMPANY) {
      if (!companyName || !taxNumber || !taxOffice ||
          !authorizedPersonFirstName || !authorizedPersonLastName ||
          !authorizedPersonPosition) {
        return NextResponse.json({
          success: false,
          message: 'Şirket bilgileri eksik'
        }, { status: 400 });
      }
    }

    // Email kontrolü
    const existingUser = await User.findOne({
      email: email.toLowerCase()
    });

    if (existingUser) {
      return NextResponse.json({
        success: false,
        message: 'Bu email adresi zaten kullanılıyor'
      }, { status: 400 });
    }

    // Şifre hash'leme
    const hashedPassword = await bcrypt.hash(password, 12);

    // Kullanıcı verilerini hazırla
    const userData: any = {
      email: email.toLowerCase(),
      password: hashedPassword,
      userType,
      isEmailVerified: false,
      isPhoneVerified: false,
      isActive: true
    };

    // Bireysel kullanıcı bilgileri
    if (userType === UserType.INDIVIDUAL) {
      userData.individualInfo = {
        firstName,
        lastName,
        phone: phone || undefined
      };
    }

    // Şirket kullanıcı bilgileri
    if (userType === UserType.COMPANY) {
      userData.companyInfo = {
        companyName,
        taxNumber,
        taxOffice,
        phone: phone || undefined,
        authorizedPerson: {
          firstName: authorizedPersonFirstName,
          lastName: authorizedPersonLastName,
          position: authorizedPersonPosition,
          phone: authorizedPersonPhone || undefined,
          email: authorizedPersonEmail || undefined
        }
      };
    }

    // Kullanıcı oluştur
    const newUser = new User(userData);
    await newUser.save();

    return NextResponse.json({
      success: true,
      message: 'Hesap başarıyla oluşturuldu',
      user: {
        id: newUser._id,
        email: newUser.email,
        userType: newUser.userType,
        displayName: newUser.getDisplayName()
      }
    });

  } catch (error) {
    console.error('Register error:', error);
    return NextResponse.json({
      success: false,
      message: 'Kayıt sırasında bir hata oluştu'
    }, { status: 500 });
  }
}
