'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { UserType } from '@/packages/types/User';

interface RegisterFormData {
  userType: UserType;
  email: string;
  password: string;
  confirmPassword: string;

  // Bireysel bilgiler
  firstName?: string;
  lastName?: string;
  phone?: string;

  // Şirket bilgileri
  companyName?: string;
  taxNumber?: string;
  taxOffice?: string;
  authorizedPersonFirstName?: string;
  authorizedPersonLastName?: string;
  authorizedPersonPosition?: string;
  authorizedPersonPhone?: string;
  authorizedPersonEmail?: string;
}

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<RegisterFormData>({
    userType: UserType.INDIVIDUAL,
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    phone: '',
    companyName: '',
    taxNumber: '',
    taxOffice: '',
    authorizedPersonFirstName: '',
    authorizedPersonLastName: '',
    authorizedPersonPosition: '',
    authorizedPersonPhone: '',
    authorizedPersonEmail: ''
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const handleUserTypeChange = (userType: UserType) => {
    setFormData(prev => ({
      ...prev,
      userType
    }));
    setError('');
  };

  const validateForm = () => {
    if (!formData.email || !formData.password || !formData.confirmPassword) {
      setError('Tüm alanları doldurunuz');
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Şifreler eşleşmiyor');
      return false;
    }

    if (formData.password.length < 6) {
      setError('Şifre en az 6 karakter olmalıdır');
      return false;
    }

    if (formData.userType === UserType.INDIVIDUAL) {
      if (!formData.firstName || !formData.lastName) {
        setError('Ad ve soyad alanları zorunludur');
        return false;
      }
    } else if (formData.userType === UserType.COMPANY) {
      if (!formData.companyName || !formData.taxNumber || !formData.taxOffice ||
          !formData.authorizedPersonFirstName || !formData.authorizedPersonLastName ||
          !formData.authorizedPersonPosition) {
        setError('Şirket bilgileri eksik');
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        // Başarılı kayıt sonrası giriş yap
        const result = await signIn('credentials', {
          email: formData.email,
          password: formData.password,
          redirect: false,
        });

        if (result?.ok) {
          router.push('/dashboard');
        } else {
          setError('Kayıt başarılı ancak giriş yapılamadı. Lütfen giriş sayfasından deneyin.');
        }
      } else {
        setError(data.message || 'Kayıt sırasında bir hata oluştu');
      }
    } catch (error) {
      setError('Bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuthSignIn = async (provider: 'google' | 'facebook') => {
    setIsLoading(true);
    try {
      await signIn(provider, { callbackUrl: '/dashboard' });
    } catch (error) {
      setError(`${provider} ile giriş yapılırken hata oluştu`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Hesap Oluştur
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Palet Pazarı'na hoş geldiniz
          </p>
        </div>

        {/* Kullanıcı Tipi Seçimi */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Hesap Tipi Seçin</h3>
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => handleUserTypeChange(UserType.INDIVIDUAL)}
              className={`p-4 border-2 rounded-lg text-center transition-colors ${
                formData.userType === UserType.INDIVIDUAL
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="text-2xl mb-2">👤</div>
              <div className="font-medium">Bireysel</div>
              <div className="text-sm text-gray-500">Kişisel hesap</div>
            </button>
            <button
              type="button"
              onClick={() => handleUserTypeChange(UserType.COMPANY)}
              className={`p-4 border-2 rounded-lg text-center transition-colors ${
                formData.userType === UserType.COMPANY
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="text-2xl mb-2">🏢</div>
              <div className="font-medium">Şirket</div>
              <div className="text-sm text-gray-500">Kurumsal hesap</div>
            </button>
          </div>
        </div>

        {/* OAuth Butonları */}
        <div className="space-y-3">
          <button
            onClick={() => handleOAuthSignIn('google')}
            disabled={isLoading}
            className="w-full flex justify-center items-center px-4 py-3 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Google ile Kayıt Ol
          </button>

          <button
            onClick={() => handleOAuthSignIn('facebook')}
            disabled={isLoading}
            className="w-full flex justify-center items-center px-4 py-3 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            <svg className="w-5 h-5 mr-2" fill="#1877F2" viewBox="0 0 24 24">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
            Facebook ile Kayıt Ol
          </button>
        </div>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">veya</span>
          </div>
        </div>

        {/* Kayıt Formu */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="bg-white p-6 rounded-lg shadow-md space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}

            {/* Temel Bilgiler */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email Adresi *
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleInputChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Şifre *
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                  Şifre Tekrar *
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Bireysel Kullanıcı Formu */}
            {formData.userType === UserType.INDIVIDUAL && (
              <div className="space-y-4">
                <h4 className="text-lg font-medium text-gray-900">Kişisel Bilgiler</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                      Ad *
                    </label>
                    <input
                      id="firstName"
                      name="firstName"
                      type="text"
                      required
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                      Soyad *
                    </label>
                    <input
                      id="lastName"
                      name="lastName"
                      type="text"
                      required
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                    Telefon
                  </label>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            )}

            {/* Şirket Kullanıcı Formu */}
            {formData.userType === UserType.COMPANY && (
              <div className="space-y-4">
                <h4 className="text-lg font-medium text-gray-900">Şirket Bilgileri</h4>

                <div>
                  <label htmlFor="companyName" className="block text-sm font-medium text-gray-700">
                    Şirket Adı *
                  </label>
                  <input
                    id="companyName"
                    name="companyName"
                    type="text"
                    required
                    value={formData.companyName}
                    onChange={handleInputChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="taxNumber" className="block text-sm font-medium text-gray-700">
                      Vergi No *
                    </label>
                    <input
                      id="taxNumber"
                      name="taxNumber"
                      type="text"
                      required
                      value={formData.taxNumber}
                      onChange={handleInputChange}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="taxOffice" className="block text-sm font-medium text-gray-700">
                      Vergi Dairesi *
                    </label>
                    <input
                      id="taxOffice"
                      name="taxOffice"
                      type="text"
                      required
                      value={formData.taxOffice}
                      onChange={handleInputChange}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                <h5 className="text-md font-medium text-gray-900">Yetkili Kişi Bilgileri</h5>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="authorizedPersonFirstName" className="block text-sm font-medium text-gray-700">
                      Ad *
                    </label>
                    <input
                      id="authorizedPersonFirstName"
                      name="authorizedPersonFirstName"
                      type="text"
                      required
                      value={formData.authorizedPersonFirstName}
                      onChange={handleInputChange}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="authorizedPersonLastName" className="block text-sm font-medium text-gray-700">
                      Soyad *
                    </label>
                    <input
                      id="authorizedPersonLastName"
                      name="authorizedPersonLastName"
                      type="text"
                      required
                      value={formData.authorizedPersonLastName}
                      onChange={handleInputChange}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="authorizedPersonPosition" className="block text-sm font-medium text-gray-700">
                    Pozisyon *
                  </label>
                  <input
                    id="authorizedPersonPosition"
                    name="authorizedPersonPosition"
                    type="text"
                    required
                    value={formData.authorizedPersonPosition}
                    onChange={handleInputChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label htmlFor="authorizedPersonPhone" className="block text-sm font-medium text-gray-700">
                    Telefon
                  </label>
                  <input
                    id="authorizedPersonPhone"
                    name="authorizedPersonPhone"
                    type="tel"
                    value={formData.authorizedPersonPhone}
                    onChange={handleInputChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label htmlFor="authorizedPersonEmail" className="block text-sm font-medium text-gray-700">
                    Email
                  </label>
                  <input
                    id="authorizedPersonEmail"
                    name="authorizedPersonEmail"
                    type="email"
                    value={formData.authorizedPersonEmail}
                    onChange={handleInputChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {isLoading ? 'Kayıt Olunuyor...' : 'Hesap Oluştur'}
            </button>
          </div>
        </form>

        <div className="text-center">
          <p className="text-sm text-gray-600">
            Zaten hesabınız var mı?{' '}
            <Link href="/auth/login" className="font-medium text-blue-600 hover:text-blue-500">
              Giriş yapın
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
