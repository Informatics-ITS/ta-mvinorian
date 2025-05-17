import Cookies from 'universal-cookie';

const cookies = new Cookies();

export const getAuthToken = () => {
  return cookies.get('@node-clash/auth-token');
};

export const getServerAuthToken = async () => {
  const { cookies } = await import('next/headers');
  const cookieStore = await cookies();
  const token = cookieStore.get('@node-clash/auth-token')?.value;
  return token;
};

export const setAuthToken = (token: string) => {
  cookies.set('@node-clash/auth-token', token, { path: '/' });
};

export const removeAuthToken = () => {
  cookies.remove('@node-clash/auth-token', { path: '/' });
};
