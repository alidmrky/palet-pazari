'use client';

import { useSession } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Package,
  LogIn,
  UserPlus,
  Settings,
  User,
  LogOut
} from 'lucide-react';
import Link from 'next/link';

export default function Header() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  // Admin sayfalarında header'ı gizle
  if (pathname?.startsWith('/admin')) {
    return null;
  }

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center gap-2 text-orange-600">
              <Package className="h-8 w-8" />
              <h1 className="text-xl font-bold">Palet Pazarı</h1>
            </Link>
          </div>

          <nav className="flex items-center gap-4">
            {session ? (
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-600">
                  Hoş geldin, {session.user?.name || session.user?.email}
                </span>
                <Button variant="outline" onClick={() => router.push('/api/auth/signout')}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Çıkış
                </Button>
                {(session.user as any)?.userType === 'admin' && (
                  <Button asChild>
                    <Link href="/admin">
                      <Settings className="h-4 w-4 mr-2" />
                      Admin
                    </Link>
                  </Button>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Button variant="outline" onClick={() => router.push('/auth/login')}>
                  <LogIn className="h-4 w-4 mr-2" />
                  Giriş Yap
                </Button>
                <Button asChild>
                  <Link href="/auth/register">
                    <UserPlus className="h-4 w-4 mr-2" />
                    Kayıt Ol
                  </Link>
                </Button>
              </div>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
