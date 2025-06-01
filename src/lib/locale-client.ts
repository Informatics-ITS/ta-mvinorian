import { createTranslator } from 'next-intl';

import { getClientLocale } from './cookies';

export const getClientTranslations = async (namespace?: string) => {
  const locale = getClientLocale();
  const t = createTranslator({
    namespace,
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
  });

  return t;
};
