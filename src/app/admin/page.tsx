'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Users,
  Package,
  TrendingUp,
  Activity,
  UserCheck,
  Package2,
  BarChart3,
  AlertCircle
} from 'lucide-react';

interface DashboardStats {
  totalUsers: number;
  totalPalets: number;
  totalCategories: number;
  totalVariants: number;
  recentUsers: any[];
  recentPalets: any[];
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalPalets: 0,
    totalCategories: 0,
    totalVariants: 0,
    recentUsers: [],
    recentPalets: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Paralel API çağrıları
      const [usersRes, paletsRes] = await Promise.all([
        fetch('/api/admin/users/stats'),
        fetch('/api/palets/test')
      ]);

      const usersData = await usersRes.json();
      const paletsData = await paletsRes.json();

      setStats({
        totalUsers: usersData.data?.totalUsers || 0,
        totalPalets: paletsData.ornek_veriler?.model ? 1 : 0,
        totalCategories: paletsData.ornek_veriler?.kategori ? 1 : 0,
        totalVariants: paletsData.ornek_veriler?.varyant ? 1 : 0,
        recentUsers: usersData.data?.recentUsers || [],
        recentPalets: []
      });
    } catch (error) {
      console.error('Dashboard verileri yüklenemedi:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Toplam Kullanıcılar',
      value: stats.totalUsers,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      description: 'Kayıtlı kullanıcı sayısı'
    },
    {
      title: 'Palet Kategorileri',
      value: stats.totalCategories,
      icon: Package,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      description: 'Aktif kategori sayısı'
    },
    {
      title: 'Palet Modelleri',
      value: stats.totalPalets,
      icon: Package2,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      description: 'Toplam model sayısı'
    },
    {
      title: 'Palet Varyantları',
      value: stats.totalVariants,
      icon: TrendingUp,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      description: 'Toplam varyant sayısı'
    }
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Palet Pazarı yönetim paneline hoş geldiniz</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">
                    {stat.title}
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stat.value}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {stat.description}
                  </p>
                </div>
                <div className={`p-3 rounded-full ${stat.bgColor}`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-orange-600" />
              Hızlı İşlemler
            </CardTitle>
            <CardDescription>
              Sık kullanılan yönetim işlemleri
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full justify-start" variant="outline">
              <Users className="h-4 w-4 mr-2" />
              Kullanıcıları Yönet
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <Package className="h-4 w-4 mr-2" />
              Palet Kategorileri
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <Package2 className="h-4 w-4 mr-2" />
              Palet Türleri
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <BarChart3 className="h-4 w-4 mr-2" />
              Raporlar
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-yellow-600" />
              Sistem Durumu
            </CardTitle>
            <CardDescription>
              Platform sağlık durumu
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">MongoDB Bağlantısı</span>
              <span className="px-2 py-1 text-xs font-medium text-green-800 bg-green-100 rounded-full">
                Aktif
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">API Durumu</span>
              <span className="px-2 py-1 text-xs font-medium text-green-800 bg-green-100 rounded-full">
                Çalışıyor
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Auth Sistemi</span>
              <span className="px-2 py-1 text-xs font-medium text-green-800 bg-green-100 rounded-full">
                Aktif
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Log Sistemi</span>
              <span className="px-2 py-1 text-xs font-medium text-green-800 bg-green-100 rounded-full">
                Aktif
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      {stats.recentUsers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserCheck className="h-5 w-5 text-blue-600" />
              Son Kullanıcılar
            </CardTitle>
            <CardDescription>
              Son kayıt olan kullanıcılar
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.recentUsers.slice(0, 5).map((user: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 bg-orange-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-orange-600">
                        {user.name?.charAt(0) || user.email?.charAt(0) || 'U'}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {user.name || 'Kullanıcı'}
                      </p>
                      <p className="text-xs text-gray-500">
                        {user.email}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs text-gray-500">
                    {new Date(user.createdAt).toLocaleDateString('tr-TR')}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

