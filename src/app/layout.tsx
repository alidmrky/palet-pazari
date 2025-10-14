import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import '../designs/styles/globals.css';
import { Providers } from './providers';
import Header from '@/components/Header';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Palet Pazarı - Palet Alım Satım Platformu',
  description: 'Palet alım satım işlemlerinizi kolayca yönetin. Bireysel ve kurumsal kullanıcılar için özel çözümler.',
  keywords: 'palet, alım, satım, platform, bireysel, kurumsal, ilan, sahibinden',
  authors: [{ name: 'Palet Pazarı' }],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr">
      <body className={inter.className}>
        <Providers>
          <Header />
          {children}
        </Providers>
      </body>
    </html>
  );
}
