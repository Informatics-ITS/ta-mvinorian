import { ReactQueryProvider } from './react-query-provider';
import { ToastProvider } from './toast-provider';

export const Provider = ({ children }: { children: React.ReactNode }) => {
  return (
    <ReactQueryProvider>
      {children}
      <ToastProvider />
    </ReactQueryProvider>
  );
};
