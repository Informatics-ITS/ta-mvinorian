'use client';

import { useMutation } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { LoaderCircleIcon } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import React from 'react';

import { Button } from '@/component/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/component/ui/card';
import { GameType } from '@/db/schema';
import { api } from '@/lib/api';
import { ResponseType } from '@/lib/response';

export default function GamePage() {
  const t = useTranslations('game');
  const router = useRouter();

  const { mutate: createGame, isPending: createGameIsPending } = useMutation({
    mutationFn: async () => {
      const res = await api.post('/api/game/create', {}, { toastify: true });
      const { code } = res.data.data;
      return code;
    },
    onSuccess: (code) => router.replace(`/game/${code}`),
    onError: (error: AxiosError<ResponseType<GameType>>) => {
      if (error.response?.data.message === 'user already in game') {
        const { code } = error.response?.data.data ?? {};
        router.replace(`/game/${code}`);
      }
    },
  });

  return (
    <Card className='w-full max-w-md'>
      <CardHeader>
        <CardTitle className='text-heading-32 my-4 text-center'>{t('node-clash')}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className='flex flex-col gap-3'>
          <Button size='lg' onClick={() => createGame()} disabled={createGameIsPending} className='cursor-pointer'>
            {t('create-game')}
            {createGameIsPending && <LoaderCircleIcon className='ml-2 animate-spin' />}
          </Button>
          <Button size='lg' variant='outline' asChild>
            <Link href='/lobby/join'>{t('join-game')}</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
