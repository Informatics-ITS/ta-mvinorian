import { NextIntlClientProvider } from 'next-intl';

import { ReactQueryProvider } from './react-query-provider';
import { ToastProvider } from './toast-provider';

export const Provider = ({ children }: { children: React.ReactNode }) => {
  return (
    <NextIntlClientProvider>
      <ReactQueryProvider>
        {children}
        <ToastProvider />
      </ReactQueryProvider>
    </NextIntlClientProvider>
  );
};
