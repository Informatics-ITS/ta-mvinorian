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

const authRegisterSchema = z.object({
  name: z.string(),
  email: z.string(),
  password: z.string(),
});

type AuthRegisterSchema = z.infer<typeof authRegisterSchema>;

export default function AuthRegisterPage() {
  const t = useTranslations('Auth');

  const router = useRouter();
  const { login } = useAuthStore();

  const form = useForm<AuthRegisterSchema>({
    resolver: zodResolver(authRegisterSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
    },
  });

  const { handleSubmit, control } = form;

  const { mutate, isPending } = useMutation({
    mutationFn: async (data: AuthRegisterSchema) => {
      const res = await api.post('/api/user/create', data, { toastify: true });
      const { token } = res.data.data;

      setAuthToken(token);

      const user = await api.get('/api/user/me');
      login(user.data.data, token);
    },
    onSuccess: async () => router.push('/'),
  });

  const onSubmit = (data: AuthRegisterSchema) => {
    mutate(data);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className='text-2xl'>{t('sign-up')}</CardTitle>
        <CardDescription>{t('enter-your-name-email-and-password-to-create-an-account')}</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className='flex flex-col gap-6'>
              <FormField
                control={control}
                name='name'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('name')}</FormLabel>
                    <FormControl>
                      <Input type='name' placeholder='John Doe' autoComplete='name' {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={control}
                name='email'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
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
                      <Input type='password' {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <Button type='submit' size='lg' disabled={isPending} className='w-full'>
                {t('sign-up')}
                {isPending && <LoaderCircleIcon className='ml-2 animate-spin' />}
              </Button>
            </div>

            <div className='mt-4 text-center text-sm font-light'>
              {t('already-have-an-account')}{' '}
              <Link href='/login' className='font-normal underline underline-offset-4'>
                {t('login')}
              </Link>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
