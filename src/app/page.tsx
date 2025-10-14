'use client';

import { useSession, signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Package,
  Search,
  ArrowRight,
  CheckCircle,
  Star,
  Shield,
  Truck,
  Globe,
  TrendingUp,
  Users,
  MapPin,
  Filter,
  Eye,
  Heart,
  Share2,
  LogIn,
  UserPlus,
  BarChart3,
  Settings
} from 'lucide-react';
import Link from 'next/link';

interface UstKategori {
  _id: string;
  ust_kategori_id: string;
  ad: string;
  aciklama: string;
  hiyerarsi_seviyeleri: string[];
}

interface Ilan {
  _id: string;
  baslik: string;
  aciklama: string;
  sehir: string;
  ilce: string;
  fotograflar: string[];
  goruntulenme_sayisi: number;
  createdAt: string;
  ilan_tipi: 'satilik' | 'araniyor';
  durum: 'sifir' | 'ikinci_el';
  user_id: {
    individualInfo?: {
      ad: string;
      soyad: string;
    };
    companyInfo?: {
      sirket_adi: string;
    };
  };
}

export default function HomePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [ustKategoriler, setUstKategoriler] = useState<UstKategori[]>([]);
  const [sonIlanlar, setSonIlanlar] = useState<Ilan[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async() => {
    try {
      setLoading(true);

      // Üst kategorileri çek
      const kategorilerResponse = await fetch('/api/ust-kategoriler');
      const kategorilerData = await kategorilerResponse.json();
      if (kategorilerData.success) {
        setUstKategoriler(kategorilerData.data);
      }

      // Son ilanları çek
      const ilanlarResponse = await fetch('/api/ilans?limit=6&siralama=createdAt&yon=desc');
      const ilanlarData = await ilanlarResponse.json();
      if (ilanlarData.success) {
        setSonIlanlar(ilanlarData.data);
      }
    } catch (error) {
      console.error('Veri yüklenirken hata:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleIlanVer = () => {
    if (!session) {
      // Giriş yapmamışsa login'e yönlendir, sonra ilan verme sayfasına dönsün
      const currentUrl = window.location.href;
      router.push(`/auth/login?callbackUrl=${encodeURIComponent('/ilans/create')}`);
    } else {
      router.push('/ilans/create');
    }
  };

  const handleSearch = () => {
    if (searchTerm.trim()) {
      router.push(`/ilans?arama=${encodeURIComponent(searchTerm)}`);
    } else {
      router.push('/ilans');
    }
  };

  const getIlanTipiBadge = (tip: string) => {
    const variants = {
      satilik: { label: 'Satılık', color: 'bg-green-100 text-green-800' },
      araniyor: { label: 'Aranıyor', color: 'bg-blue-100 text-blue-800' }
    };
    const variant = variants[tip as keyof typeof variants] || { label: tip, color: 'bg-gray-100 text-gray-800' };
    return <Badge className={variant.color}>{variant.label}</Badge>;
  };

  const getDurumBadge = (durum: string) => {
    const variants = {
      sifir: { label: 'Sıfır', color: 'bg-emerald-100 text-emerald-800' },
      ikinci_el: { label: 'İkinci El', color: 'bg-orange-100 text-orange-800' }
    };
    const variant = variants[durum as keyof typeof variants] || { label: durum, color: 'bg-gray-100 text-gray-800' };
    return <Badge className={variant.color}>{variant.label}</Badge>;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'short'
    });
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-blue-50">
      {/* Hero Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Palet Pazarı
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Türkiye'nin en büyük palet alım-satım platformu.
            Binlerce palet çeşidi, güvenli alışveriş, hızlı teslimat.
          </p>

          {/* Arama Çubuğu */}
          <div className="max-w-2xl mx-auto mb-8">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <Input
                  placeholder="Palet ara... (örn: EUR1, GMA, plastik)"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="pl-10 h-12 text-lg"
                />
              </div>
              <Button onClick={handleSearch} size="lg" className="h-12 px-6">
                <Search className="h-5 w-5 mr-2" />
                Ara
              </Button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" onClick={handleIlanVer} className="bg-orange-600 hover:bg-orange-700">
              <Package className="h-5 w-5 mr-2" />
              {session ? 'İlan Ver' : 'Giriş Yap & İlan Ver'}
              <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
            <Button size="lg" variant="outline" onClick={() => router.push('/ilans')}>
              <Eye className="h-5 w-5 mr-2" />
              İlanları Görüntüle
            </Button>
          </div>
        </div>
      </section>

      {/* Kategoriler */}
      {ustKategoriler.length > 0 && (
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Kategoriler
              </h2>
              <p className="text-lg text-gray-600">
                Geniş ürün yelpazesi ile ihtiyacınıza uygun palet bulun
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {ustKategoriler.map((kategori) => (
                <Card key={kategori._id} className="hover:shadow-lg transition-shadow cursor-pointer group">
                  <CardHeader className="text-center">
                    <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-orange-200 transition-colors">
                      <Package className="h-8 w-8 text-orange-600" />
                    </div>
                    <CardTitle className="text-lg">{kategori.ad}</CardTitle>
                    <CardDescription>{kategori.aciklama}</CardDescription>
                  </CardHeader>
                  <CardContent className="text-center">
                    <Button
                      variant="outline"
                      className="w-full group-hover:bg-orange-50 group-hover:border-orange-200"
                      onClick={() => router.push(`/ilans?ust_kategori_id=${kategori.ust_kategori_id}`)}
                    >
                      İlanları Gör
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Son İlanlar */}
      {sonIlanlar.length > 0 && (
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                  Son İlanlar
                </h2>
                <p className="text-lg text-gray-600">
                  En yeni palet ilanları
                </p>
              </div>
              <Button variant="outline" onClick={() => router.push('/ilans')}>
                Tümünü Gör
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sonIlanlar.map((ilan) => (
                <Card key={ilan._id} className="hover:shadow-lg transition-shadow">
                  <div className="relative">
                    {ilan.fotograflar.length > 0 && (
                      <img
                        src={ilan.fotograflar[0]}
                        alt={ilan.baslik}
                        className="w-full h-48 object-cover rounded-t-lg"
                      />
                    )}
                    <div className="absolute top-2 left-2 flex gap-2">
                      {getIlanTipiBadge(ilan.ilan_tipi)}
                      {getDurumBadge(ilan.durum)}
                    </div>
                    <div className="absolute top-2 right-2 flex gap-1">
                      <Badge variant="outline" className="bg-white/90">
                        <Eye className="h-3 w-3 mr-1" />
                        {ilan.goruntulenme_sayisi}
                      </Badge>
                    </div>
                  </div>

                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div>
                        <h3 className="font-semibold text-lg line-clamp-2 mb-2">{ilan.baslik}</h3>
                        <p className="text-sm text-muted-foreground line-clamp-2">{ilan.aciklama}</p>
                      </div>

                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        <span>{ilan.sehir} {ilan.ilce}</span>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="text-sm text-muted-foreground">
                          {formatDate(ilan.createdAt)}
                        </div>
                        <div className="flex gap-1">
                          <Button size="sm" variant="outline">
                            <Heart className="h-3 w-3" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <Share2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Features */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Neden Palet Pazarı?
            </h2>
            <p className="text-lg text-gray-600">
              Güvenilir, hızlı ve kolay palet alım-satım deneyimi
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="text-center">
              <CardHeader>
                <Shield className="h-12 w-12 text-green-600 mx-auto mb-4" />
                <CardTitle>Güvenli Alışveriş</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Doğrulanmış satıcılar ve güvenli ödeme sistemi ile
                  güvenle alışveriş yapın.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <Truck className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <CardTitle>Hızlı Teslimat</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Türkiye genelinde hızlı ve güvenli teslimat seçenekleri.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <Globe className="h-12 w-12 text-purple-600 mx-auto mb-4" />
                <CardTitle>Geniş Katalog</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Binlerce farklı palet çeşidi ve standart seçeneği.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-orange-600 mb-2">1000+</div>
              <div className="text-gray-600">Aktif İlan</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-orange-600 mb-2">500+</div>
              <div className="text-gray-600">Kayıtlı Kullanıcı</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-orange-600 mb-2">50+</div>
              <div className="text-gray-600">Şehir</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-orange-600 mb-2">24/7</div>
              <div className="text-gray-600">Destek</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-orange-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Hemen Başlayın
          </h2>
          <p className="text-xl text-orange-100 mb-8">
            Ücretsiz hesap oluşturun ve ilk ilanınızı verin
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" onClick={() => router.push('/auth/register')}>
              <UserPlus className="h-5 w-5 mr-2" />
              Ücretsiz Kayıt Ol
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-orange-600" onClick={() => router.push('/ilans')}>
              <Package className="h-5 w-5 mr-2" />
              İlanları İncele
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Package className="h-6 w-6 text-orange-600" />
                <h3 className="text-lg font-bold">Palet Pazarı</h3>
              </div>
              <p className="text-gray-400">
                Türkiye'nin en büyük palet alım-satım platformu.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Hızlı Linkler</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/ilans" className="hover:text-white">İlanlar</Link></li>
                <li><Link href="/auth/register" className="hover:text-white">Kayıt Ol</Link></li>
                <li><Link href="/auth/login" className="hover:text-white">Giriş Yap</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Destek</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="#" className="hover:text-white">Yardım Merkezi</Link></li>
                <li><Link href="#" className="hover:text-white">İletişim</Link></li>
                <li><Link href="#" className="hover:text-white">SSS</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">İletişim</h4>
              <div className="text-gray-400">
                <p>info@paletpazari.com</p>
                <p>+90 212 555 0123</p>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Palet Pazarı. Tüm hakları saklıdır.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
