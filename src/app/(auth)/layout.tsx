import Image from 'next/image';
import React from 'react';

import { LocaleSwitcher } from '@/component/ui/locale-switcher';

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <React.Fragment>
      <div className='bg-background-100 absolute top-0 left-0 z-50 flex w-full items-center justify-between border-b border-gray-400 px-4 py-2'>
        <div className='flex h-8 items-center gap-2'>
          <Image alt='icon' src='/node-clash.svg' width={24} height={24} />
          <p className='text-label-18 mb-0.5 font-semibold'>
            <span className='text-blue-900'>node-</span>
            <span className='text-red-900'>clash.</span>
          </p>
        </div>
        <LocaleSwitcher />
      </div>
      <div className='w-full max-w-md'>{children}</div>
    </React.Fragment>
  );
}
