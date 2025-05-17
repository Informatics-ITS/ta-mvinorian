import 'axios';

declare module 'axios' {
  export interface AxiosRequestConfig {
    toastify?: boolean;
    loadingMessage?: string;
  }
}
