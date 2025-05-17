import { produce } from 'immer';
import { create } from 'zustand';

import { UserType } from '@/db/schema';
import { removeAuthToken, setAuthToken } from '@/lib/cookies';

export type useAuthStoreType = {
  user: UserType | null;
  isAuthed: boolean;
  isLoading: boolean;
  login: (user: UserType, token: string) => void;
  logout: () => void;
  stopLoading: () => void;
};

export const useAuthStore = create<useAuthStoreType>((set) => ({
  user: null,
  isAuthed: false,
  isLoading: true,
  login: (user, token) => {
    if (token) setAuthToken(token);
    set(
      produce<useAuthStoreType>((state) => {
        state.user = user;
        state.isAuthed = true;
      }),
    );
  },
  logout: () => {
    removeAuthToken();
    set(
      produce<useAuthStoreType>((state) => {
        state.user = null;
        state.isAuthed = false;
      }),
    );
  },
  stopLoading: () => {
    set(
      produce<useAuthStoreType>((state) => {
        state.isLoading = false;
      }),
    );
  },
}));
