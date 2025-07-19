import axios, { AxiosError, AxiosResponse } from 'axios';
import { toast } from 'sonner';

import { getAuthToken } from './cookies';
import { ResponseType } from './response';

const isBrowser = typeof window !== 'undefined';
let toastId: string | number;

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BASE_PATH ?? '',
  headers: {
    'Content-Type': 'aplication/json',
  },
  withCredentials: false,
  timeout: 120000,
  timeoutErrorMessage: 'No internet connection',
});

api.interceptors.request.use(async (config) => {
  if (!config.headers) return config;

  let token: string | undefined;

  if (isBrowser) token = getAuthToken();
  else {
    const { cookies } = await import('next/headers');
    const cookieStore = await cookies();
    token = cookieStore.get('@node-clash/token')?.value;
  }

  if (isBrowser && config.toastify) {
    toastId = toast.loading(config.loadingMessage ?? 'Loading...');
  }

  config.headers.setAuthorization(token ? `Bearer ${token}` : '');

  return config;
});

api.interceptors.response.use(
  (response: AxiosResponse<ResponseType>) => {
    if (isBrowser && response.config.toastify) {
      const { message } = response.data;
      const toastMessage = message.charAt(0).toUpperCase() + message.slice(1) + '.';
      if (response.data.success) toast.success(toastMessage, { id: toastId });
      else toast.error(toastMessage, { id: toastId });
    }

    return response;
  },
  (error: AxiosError<ResponseType>) => {
    const response = error.response;

    if (isBrowser && error.config?.toastify) {
      const message = response?.data.message || error.message;
      const toastMessage = message.charAt(0).toUpperCase() + message.slice(1) + '.';
      toast.error(toastMessage, { id: toastId });
    }

    return Promise.reject({ ...error });
  },
);

export { api };
