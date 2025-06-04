import { NextIntlClientProvider } from 'next-intl';

import { ReactQueryProvider } from './react-query-provider';
import { ToastProvider } from './toast-provider';
import { UserTourProvider } from './user-tour-provider';

export const Provider = ({ children }: { children: React.ReactNode }) => {
  return (
    <NextIntlClientProvider>
      <ReactQueryProvider>
        <UserTourProvider>{children}</UserTourProvider>
        <ToastProvider />
      </ReactQueryProvider>
    </NextIntlClientProvider>
  );
};
