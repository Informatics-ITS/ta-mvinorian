'use server';

import { cookies } from 'next/headers';

import { defaultLocale, Locale } from '@/i18n/config';

export const getUserLocale = async () => {
  return ((await cookies()).get('@node-clash/locale')?.value ?? defaultLocale) as Locale;
};

export const setUserLocale = async (locale: Locale) => {
  (await cookies()).set('@node-clash/locale', locale);
};
