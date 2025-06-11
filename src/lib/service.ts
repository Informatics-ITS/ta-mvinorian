import { ResponseType } from './response';

export type ServiceType<T, TArgs extends readonly unknown[] = []> = (
  t: (key: string) => string,
  ...args: TArgs
) => Promise<ResponseType<T>>;

export const createService = <T, TArgs extends readonly unknown[] = []>(service: ServiceType<T, TArgs>) => {
  return async (t: (key: string) => string, ...args: TArgs) => {
    try {
      const res = await service(t, ...args);
      return res;
    } catch (error) {
      return {
        success: false,
        message: t('response.service-error'),
        data: error,
      } as ResponseType<T>;
    }
  };
};
