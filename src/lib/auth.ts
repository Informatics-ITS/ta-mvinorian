import { UserType } from '@/db/schema';

import { verifyAuthToken } from './jwt';
import { createResponse, ResponseType } from './response';

export const authUserService = (token: string | undefined) => {
  if (!token) return createResponse({ success: false, message: 'invalid token', data: undefined });

  const user = verifyAuthToken(token);
  if (!user) return createResponse({ success: false, message: 'invalid token', data: undefined });

  return createResponse({ success: true, message: 'token verified', data: user });
};

export const withAuthUser = <TData>(token: string | undefined, onSuccess: (user: UserType) => ResponseType<TData>) => {
  const res = authUserService(token);
  if (!res.success) return createResponse({ success: false, message: res.message, data: undefined });

  const { data } = res;
  if (!data) return createResponse({ success: false, message: 'invalid token', data: undefined });

  return onSuccess(data);
};

export const withAsyncAuthUser = async <TData>(
  token: string | undefined,
  onSuccess: (user: UserType) => Promise<ResponseType<TData>>,
) => {
  const res = authUserService(token);
  if (!res.success) return createResponse({ success: false, message: res.message, data: undefined });

  const { data } = res;
  if (!data) return createResponse({ success: false, message: 'invalid token', data: undefined });

  return await onSuccess(data);
};
