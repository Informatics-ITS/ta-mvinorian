import './globals.css';

import type { Metadata } from 'next';
import { Outfit } from 'next/font/google';

import { Provider } from '@/provider';

const outfit = Outfit({
  variable: '--font-outfit',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Node Clash',
  description: 'Cyber Network Security Attack and Defense Educational Game',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='en'>
      <body className={`${outfit.variable} bg-background-200 antialiased`}>
        <Provider>{children}</Provider>
      </body>
    </html>
  );
}
