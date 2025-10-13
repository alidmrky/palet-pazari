import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import '../designs/styles/globals.css';
import { Providers } from './providers';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Palet Pazarı - Palet Alım Satım Platformu',
  description: 'Palet alım satım işlemlerinizi kolayca yönetin. Bireysel ve kurumsal kullanıcılar için özel çözümler.',
  keywords: 'palet, alım, satım, platform, bireysel, kurumsal',
  authors: [{ name: 'Palet Pazarı' }],
  viewport: 'width=device-width, initial-scale=1',
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
          {children}
        </Providers>
      </body>
    </html>
  );
}
