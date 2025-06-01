'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { LoaderCircleIcon } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import React from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Button } from '@/component/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/component/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/component/ui/form';
import { Input } from '@/component/ui/input';
import { useAuthStore } from '@/hook/use-auth-store';
import { api } from '@/lib/api';
import { setAuthToken } from '@/lib/cookies';

const authLoginSchema = z.object({
  email: z.string(),
  password: z.string(),
});

type AuthLoginSchema = z.infer<typeof authLoginSchema>;

export default function AuthLoginPage() {
  const t = useTranslations('auth');

  const router = useRouter();
  const { login } = useAuthStore();

  const form = useForm<AuthLoginSchema>({
    resolver: zodResolver(authLoginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const { handleSubmit, control } = form;

  const { mutate, isPending } = useMutation({
    mutationFn: async (data: AuthLoginSchema) => {
      const res = await api.post('/api/user/login', data, { toastify: true });
      const { token } = res.data.data;

      setAuthToken(token);

      const user = await api.get('/api/user/me');
      login(user.data.data, token);
    },
    onSuccess: async () => router.push('/'),
  });

  const onSubmit = (data: AuthLoginSchema) => {
    mutate(data);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className='text-2xl'>{t('login')}</CardTitle>
        <CardDescription>{t('enter-your-email-and-password-to-login-to-your-account')}</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className='flex flex-col gap-6'>
              <FormField
                control={control}
                name='email'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('email')}</FormLabel>
                    <FormControl>
                      <Input type='email' placeholder='mail@example.com' autoComplete='email' {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={control}
                name='password'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('password')}</FormLabel>
                    <FormControl>
                      <Input type='password' autoComplete='current-password' {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <Button type='submit' size='lg' disabled={isPending} className='w-full'>
                {t('login')}
                {isPending && <LoaderCircleIcon className='ml-2 animate-spin' />}
              </Button>
            </div>

            <div className='mt-4 text-center text-sm font-light'>
              {t('dont-have-an-account')}{' '}
              <Link href='/register' className='font-normal underline underline-offset-4'>
                {t('sign-up')}
              </Link>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
