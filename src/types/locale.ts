import { Locale as LocaleType } from '@/i18n/config';

import messages from '../../messages/en.json';

declare module 'next-intl' {
  interface AppConfig {
    Locale: LocaleType;
    Messages: typeof messages;
  }
}
