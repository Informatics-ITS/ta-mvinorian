'use client';

import { LogOutIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { withAuth } from '@/component/hoc/with-auth';
import { Avatar, AvatarFallback } from '@/component/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/component/ui/dropdown-menu';
import { LocaleSwitcher } from '@/component/ui/locale-switcher';
import { useAuthStore } from '@/hook/use-auth-store';

export default withAuth(GameLayout);

export function GameLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const t = useTranslations('Game');
  const { user, logout } = useAuthStore();

  return (
    <div className='relative flex h-svh w-full items-center justify-center overflow-hidden'>
      {user && (
        <div className='bg-background-100 absolute top-0 left-0 z-50 flex w-full items-center justify-between border-b border-gray-400 px-4 py-2 text-gray-900'>
          <div className='flex items-center gap-2'>
            <p>{t('node-clash')}</p>
          </div>

          <div className='flex items-center gap-3'>
            <LocaleSwitcher />

            <DropdownMenu>
              <DropdownMenuTrigger>
                <Avatar>
                  <AvatarFallback className='bg-gray-400 text-gray-900'>
                    {user.name
                      .split(' ')
                      .map((word) => word[0])
                      .join('')
                      .substring(0, 2)}
                  </AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align='end'>
                <DropdownMenuLabel className='!text-copy-16'>{user.name}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout}>
                  <LogOutIcon className='mr-1 h-4 w-4' />
                  {t('logout')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      )}
      {children}
    </div>
  );
}
