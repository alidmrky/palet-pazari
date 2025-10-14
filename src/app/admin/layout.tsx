'use client';

import React, { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';
import {
  Users,
  Package,
  Settings,
  BarChart3,
  Menu,
  X,
  LogOut,
  Home,
  ChevronRight,
  Layers,
  CheckCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  // Geçici olarak session kontrolü devre dışı
  // const { data: session, status } = useSession();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Geçici olarak session kontrolü devre dışı
  // useEffect(() => {
  //   if (status === 'loading') return;

  //   if (!session) {
  //     router.push('/auth/login');
  //     return;
  //   }

  //   // Admin kontrolü
  //   if ((session.user as any)?.userType !== 'admin') {
  //     router.push('/');
  //     return;
  //   }
  // }, [session, status, router]);

  // if (status === 'loading') {
  //   return (
  //     <div className="min-h-screen flex items-center justify-center bg-gray-50">
  //       <div className="text-center">
  //         <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto mb-4"></div>
  //         <p className="text-gray-600">Yükleniyor...</p>
  //       </div>
  //     </div>
  //   );
  // }

  // if (!session || (session.user as any)?.userType !== 'admin') {
  //   return null;
  // }

  const menuItems = [
    {
      title: 'Genel',
      items: [
        { icon: BarChart3, label: 'Dashboard', href: '/admin', active: true },
        { icon: Home, label: 'Ana Sayfa', href: '/', external: true },
      ]
    },
    {
      title: 'Yönetim',
      items: [
        { icon: Users, label: 'Kullanıcılar', href: '/admin/users' },
        { icon: Layers, label: 'Palet Hiyerarşisi', href: '/admin/palets/hierarchy' },
        { icon: Package, label: 'Palet Kategorileri', href: '/admin/palets/categories' },
        { icon: Package, label: 'Palet Türleri', href: '/admin/palets/types' },
        { icon: Package, label: 'İlanlar', href: '/admin/ilans' },
        { icon: CheckCircle, label: 'İlan Onayları', href: '/admin/onaylar' },
      ]
    },
    {
      title: 'Sistem',
      items: [
        { icon: Settings, label: 'Ayarlar', href: '/admin/settings' },
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 lg:z-auto lg:flex-shrink-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex items-center justify-between h-16 px-6 border-b">
          <div className="flex items-center gap-2">
            <Package className="h-8 w-8 text-orange-600" />
            <h1 className="text-xl font-bold text-gray-900">Admin Panel</h1>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <nav className="mt-6 px-3">
          {menuItems.map((section, sectionIndex) => (
            <div key={sectionIndex} className="mb-6">
              <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                {section.title}
              </h3>
              <div className="space-y-1">
                {section.items.map((item, itemIndex) => (
                  <Link
                    key={itemIndex}
                    href={item.href}
                    target={item.external ? '_blank' : undefined}
                    className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-orange-50 hover:text-orange-700 transition-colors"
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.label}</span>
                    {item.external && (
                      <ChevronRight className="h-3 w-3 ml-auto" />
                    )}
                  </Link>
                ))}
              </div>
            </div>
          ))}

          <Separator className="my-6" />

          {/* User info and logout */}
          <div className="px-3">
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="h-8 w-8 bg-orange-100 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-orange-600">
                  A
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  Admin
                </p>
                <p className="text-xs text-gray-500 truncate">
                  admin@paletpazari.com
                </p>
              </div>
            </div>

            <Button
              variant="ghost"
              size="sm"
              className="w-full mt-3 text-gray-600 hover:text-red-600"
              onClick={() => router.push('/api/auth/signout')}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Çıkış Yap
            </Button>
          </div>
        </nav>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <div className="bg-white shadow-sm border-b h-16 flex items-center justify-between px-6 sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-4 w-4" />
            </Button>
            <h2 className="text-lg font-semibold text-gray-900">
              Palet Pazarı Admin Panel
            </h2>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500">
              Hoş geldin, Admin
            </span>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
