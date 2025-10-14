'use client';

import React, { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { UserType } from '@/packages/types/User';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Package, Mail, Lock, User, Building, ArrowLeft, Eye, EyeOff, Phone, MapPin, UserCheck } from 'lucide-react';

interface RegisterFormData {
  userType: UserType;
  email: string;
  password: string;
  confirmPassword: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
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
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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

    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Geçerli bir email adresi giriniz');
      return false;
    }

    if (formData.userType === UserType.INDIVIDUAL) {
      if (!formData.firstName || !formData.lastName) {
        setError('Ad ve soyad alanları zorunludur');
        return false;
      }
    }

    if (formData.userType === UserType.COMPANY) {
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
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
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
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-orange-600 mb-6">
            <ArrowLeft className="h-4 w-4" />
            <span className="text-sm font-medium">Ana Sayfaya Dön</span>
          </Link>

          <div className="flex items-center justify-center gap-2 text-orange-600 mb-4">
            <Package className="h-8 w-8" />
            <h1 className="text-2xl font-bold">Palet Pazarı</h1>
          </div>

          <h2 className="text-3xl font-bold text-gray-900">
            Hesap Oluştur
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Palet Pazarı'na hoş geldiniz
          </p>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Account Type & OAuth */}
          <div className="space-y-6">
            {/* Account Type Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="text-center">Hesap Tipi Seçin</CardTitle>
                <CardDescription className="text-center">
                  Hangi tür hesap oluşturmak istiyorsunuz?
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <Button
                    variant={formData.userType === UserType.INDIVIDUAL ? "default" : "outline"}
                    className={`h-24 flex flex-col items-center justify-center gap-2 ${
                      formData.userType === UserType.INDIVIDUAL
                        ? 'bg-orange-600 hover:bg-orange-700 text-white'
                        : ''
                    }`}
                    onClick={() => handleUserTypeChange(UserType.INDIVIDUAL)}
                  >
                    <User className="h-6 w-6" />
                    <span className="font-medium">Bireysel</span>
                    <span className="text-xs opacity-80">Kişisel hesap</span>
                  </Button>

                  <Button
                    variant={formData.userType === UserType.COMPANY ? "default" : "outline"}
                    className={`h-24 flex flex-col items-center justify-center gap-2 ${
                      formData.userType === UserType.COMPANY
                        ? 'bg-orange-600 hover:bg-orange-700 text-white'
                        : ''
                    }`}
                    onClick={() => handleUserTypeChange(UserType.COMPANY)}
                  >
                    <Building className="h-6 w-6" />
                    <span className="font-medium">Şirket</span>
                    <span className="text-xs opacity-80">Kurumsal hesap</span>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* OAuth Buttons */}
            <div className="space-y-3">
              <Button
                onClick={() => handleOAuthSignIn('google')}
                disabled={isLoading}
                variant="outline"
                className="w-full h-12"
              >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Google ile Kayıt Ol
              </Button>

              <Button
                onClick={() => handleOAuthSignIn('facebook')}
                disabled={isLoading}
                variant="outline"
                className="w-full h-12"
              >
                <svg className="w-5 h-5 mr-2" fill="#1877F2" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                Facebook ile Kayıt Ol
              </Button>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <Separator />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-background text-muted-foreground">veya</span>
              </div>
            </div>
          </div>

          {/* Right Column - Registration Form */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-center">Email ile Kayıt</CardTitle>
                <CardDescription className="text-center">
                  Email adresiniz ve şifrenizle hesap oluşturun
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form className="space-y-4" onSubmit={handleSubmit}>
                  {error && (
                    <Alert variant="destructive">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  {/* Email */}
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Adresi *</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        required
                        value={formData.email}
                        onChange={handleInputChange}
                        className="pl-10"
                        placeholder="ornek@email.com"
                      />
                    </div>
                  </div>

                  {/* Password Fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="password">Şifre *</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <Input
                          id="password"
                          name="password"
                          type={showPassword ? "text" : "password"}
                          required
                          value={formData.password}
                          onChange={handleInputChange}
                          className="pl-10 pr-10"
                          placeholder="••••••••"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4 text-gray-400" />
                          ) : (
                            <Eye className="h-4 w-4 text-gray-400" />
                          )}
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Şifre Tekrar *</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <Input
                          id="confirmPassword"
                          name="confirmPassword"
                          type={showConfirmPassword ? "text" : "password"}
                          required
                          value={formData.confirmPassword}
                          onChange={handleInputChange}
                          className="pl-10 pr-10"
                          placeholder="••••••••"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="h-4 w-4 text-gray-400" />
                          ) : (
                            <Eye className="h-4 w-4 text-gray-400" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Individual User Fields */}
                  {formData.userType === UserType.INDIVIDUAL && (
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 text-orange-600">
                        <User className="h-5 w-5" />
                        <h3 className="text-lg font-medium">Kişisel Bilgiler</h3>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="firstName">Ad *</Label>
                          <Input
                            id="firstName"
                            name="firstName"
                            type="text"
                            required
                            value={formData.firstName || ''}
                            onChange={handleInputChange}
                            placeholder="Adınız"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="lastName">Soyad *</Label>
                          <Input
                            id="lastName"
                            name="lastName"
                            type="text"
                            required
                            value={formData.lastName || ''}
                            onChange={handleInputChange}
                            placeholder="Soyadınız"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="phone">Telefon</Label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                          <Input
                            id="phone"
                            name="phone"
                            type="tel"
                            value={formData.phone || ''}
                            onChange={handleInputChange}
                            className="pl-10"
                            placeholder="+90 5XX XXX XX XX"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Company User Fields */}
                  {formData.userType === UserType.COMPANY && (
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 text-orange-600">
                        <Building className="h-5 w-5" />
                        <h3 className="text-lg font-medium">Şirket Bilgileri</h3>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="companyName">Şirket Adı *</Label>
                        <Input
                          id="companyName"
                          name="companyName"
                          type="text"
                          required
                          value={formData.companyName || ''}
                          onChange={handleInputChange}
                          placeholder="Şirket adınız"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="taxNumber">Vergi Numarası *</Label>
                          <Input
                            id="taxNumber"
                            name="taxNumber"
                            type="text"
                            required
                            value={formData.taxNumber || ''}
                            onChange={handleInputChange}
                            placeholder="1234567890"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="taxOffice">Vergi Dairesi *</Label>
                          <Input
                            id="taxOffice"
                            name="taxOffice"
                            type="text"
                            required
                            value={formData.taxOffice || ''}
                            onChange={handleInputChange}
                            placeholder="Vergi dairesi"
                          />
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-orange-600 mt-6">
                        <UserCheck className="h-5 w-5" />
                        <h3 className="text-lg font-medium">Yetkili Kişi Bilgileri</h3>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="authorizedPersonFirstName">Ad *</Label>
                          <Input
                            id="authorizedPersonFirstName"
                            name="authorizedPersonFirstName"
                            type="text"
                            required
                            value={formData.authorizedPersonFirstName || ''}
                            onChange={handleInputChange}
                            placeholder="Ad"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="authorizedPersonLastName">Soyad *</Label>
                          <Input
                            id="authorizedPersonLastName"
                            name="authorizedPersonLastName"
                            type="text"
                            required
                            value={formData.authorizedPersonLastName || ''}
                            onChange={handleInputChange}
                            placeholder="Soyad"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="authorizedPersonPosition">Pozisyon *</Label>
                        <Input
                          id="authorizedPersonPosition"
                          name="authorizedPersonPosition"
                          type="text"
                          required
                          value={formData.authorizedPersonPosition || ''}
                          onChange={handleInputChange}
                          placeholder="Pozisyon"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="authorizedPersonPhone">Telefon</Label>
                          <div className="relative">
                            <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                            <Input
                              id="authorizedPersonPhone"
                              name="authorizedPersonPhone"
                              type="tel"
                              value={formData.authorizedPersonPhone || ''}
                              onChange={handleInputChange}
                              className="pl-10"
                              placeholder="+90 5XX XXX XX XX"
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="authorizedPersonEmail">Email</Label>
                          <div className="relative">
                            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                            <Input
                              id="authorizedPersonEmail"
                              name="authorizedPersonEmail"
                              type="email"
                              value={formData.authorizedPersonEmail || ''}
                              onChange={handleInputChange}
                              className="pl-10"
                              placeholder="ornek@email.com"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full h-12 bg-orange-600 hover:bg-orange-700"
                  >
                    {isLoading ? 'Hesap Oluşturuluyor...' : 'Hesap Oluştur'}
                  </Button>
                </form>
              </CardContent>
            </Card>

            <div className="text-center">
              <p className="text-sm text-gray-600">
                Zaten hesabınız var mı?{' '}
                <Link href="/auth/login" className="font-medium text-orange-600 hover:text-orange-500">
                  Giriş yapın
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
