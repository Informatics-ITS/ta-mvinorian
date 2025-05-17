'use client';

import { redirect } from 'next/navigation';
import * as React from 'react';

import { UserType } from '@/db/schema';
import { useAuthStore } from '@/hook/use-auth-store';
import { api } from '@/lib/api';
import { getAuthToken } from '@/lib/cookies';
import { ResponseType } from '@/lib/response';

import { Loading } from '../ui/loading';

async function getUser() {
  const res = await api.get<ResponseType<UserType>>('/api/user/me');
  return res.data.data;
}

interface WithAuthProps {
  user: UserType;
}

export function withAuth<T>(Component: React.ComponentType<T>) {
  function ComponentWithAuth(props: Omit<T, keyof WithAuthProps>) {
    const { user, isAuthed, isLoading, login, logout, stopLoading } = useAuthStore();

    const checkAuth = React.useCallback(async () => {
      const token = getAuthToken();
      if (!token) {
        isAuthed && logout();
        stopLoading();
        return;
      }

      if (isAuthed) {
        stopLoading();
        return;
      }

      try {
        const newUser = await getUser();
        if (!newUser) logout();
        else login(newUser, token);
      } catch {
        logout();
      } finally {
        stopLoading();
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isAuthed]);

    React.useEffect(() => {
      checkAuth();
    }, [checkAuth]);

    if (isLoading) return <Loading />;
    if (!isLoading && !isAuthed) redirect('/login');

    return <Component {...(props as T)} user={user} />;
  }

  return ComponentWithAuth;
}
