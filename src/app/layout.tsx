import './globals.css';

import type { Metadata } from 'next';
import { Outfit } from 'next/font/google';
import { getLocale } from 'next-intl/server';

import { Provider } from '@/provider';

const outfit = Outfit({
  variable: '--font-outfit',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'node-clash.',
  description: 'Cyber Network Security Attack and Defense Educational Game',
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();

  return (
    <html lang={locale}>
      <body
        className={`${outfit.variable} bg-background-200 relative flex h-svh w-full items-center justify-center overflow-hidden antialiased`}
      >
        <Provider>{children}</Provider>
      </body>
    </html>
  );
}
