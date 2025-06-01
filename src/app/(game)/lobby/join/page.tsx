'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { LoaderCircleIcon } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import React from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Button } from '@/component/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/component/ui/card';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/component/ui/form';
import { Input } from '@/component/ui/input';
import { GameType } from '@/db/schema';
import { api } from '@/lib/api';
import { ResponseType } from '@/lib/response';

const gameJoinSchema = z.object({
  code: z.string(),
});

type GameJoinSchema = z.infer<typeof gameJoinSchema>;

export default function GameJoinPage() {
  const t = useTranslations('Game');
  const router = useRouter();

  const form = useForm<GameJoinSchema>({
    resolver: zodResolver(gameJoinSchema),
    defaultValues: { code: '' },
  });

  const { handleSubmit, control } = form;

  const { mutate, isPending } = useMutation({
    mutationFn: async (data: GameJoinSchema) => {
      const res = await api.post('/api/game/join', data, { toastify: true });
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

  const onSubmit = (data: GameJoinSchema) => {
    mutate(data);
  };

  return (
    <Card className='w-full max-w-md'>
      <CardTitle>
        <CardHeader className='text-center'>
          <CardTitle className='text-2xl'>{t('join-game')}</CardTitle>
          <CardDescription className='font-normal'>
            {t('get-the-game-code-from-other-player-and-copy-here')}
          </CardDescription>
        </CardHeader>
        <CardContent className='mt-6'>
          <Form {...form}>
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className='flex flex-col gap-6'>
                <FormField
                  control={control}
                  name='code'
                  render={({ field: { onChange, ...field } }) => (
                    <FormItem>
                      <FormControl>
                        <Input
                          placeholder='ABC123'
                          onChange={(e) => {
                            onChange(e.target.value.toUpperCase());
                          }}
                          className='!text-heading-40 h-fit text-center tracking-wide placeholder:text-gray-400'
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className='flex flex-col gap-3'>
                  <Button type='submit' size='lg' disabled={isPending} className='cursor-pointer'>
                    {t('join-game')}
                    {isPending && <LoaderCircleIcon className='ml-2 animate-spin' />}
                  </Button>

                  <Button size='lg' variant='outline' asChild>
                    <Link href='/lobby'>{t('go-back')}</Link>
                  </Button>
                </div>
              </div>
            </form>
          </Form>
        </CardContent>
      </CardTitle>
    </Card>
  );
}
