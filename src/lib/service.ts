import { ResponseType } from './response';

export type ServiceType<T> = (t: (key: string) => string, ...args: any[]) => Promise<ResponseType<T>>;

export const createService = <T>(service: ServiceType<T>) => {
  return async (t: (key: string) => string, ...args: any[]) => {
    try {
      const res = await service(t, ...args);
      return res;
    } catch (error) {
      return {
        success: false,
        message: t('Response.service-error'),
        data: error,
      } as ResponseType<T>;
    }
  };
};
