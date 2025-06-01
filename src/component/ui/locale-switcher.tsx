'use client';

import { LanguagesIcon } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import React from 'react';

import { Locale, locales } from '@/i18n/config';
import { setUserLocale } from '@/lib/locale';

import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger } from './select';

export const LocaleSwitcher = () => {
  const t = useTranslations('locale-switcher');
  const locale = useLocale();

  const [isPending, startTransition] = React.useTransition();

  const switchLocale = (value: string) => {
    const locale = value as Locale;

    startTransition(async () => {
      await setUserLocale(locale);
    });
  };

  return (
    <Select defaultValue={locale} onValueChange={switchLocale} disabled={isPending}>
      <SelectTrigger
        noChevron
        className='flex aspect-square !size-8 shrink-0 items-center justify-center border-0 bg-gray-100 p-0 shadow-none'
      >
        <LanguagesIcon className='h-2 w-2' />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>{t('language')}</SelectLabel>
          {locales.map((locale) => (
            <SelectItem key={locale} value={locale}>
              {t(locale)}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
};
