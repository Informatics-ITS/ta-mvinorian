import jwt from 'jsonwebtoken';

import { JWT_SECRET } from '@/config';
import { UserType } from '@/db/schema';

export const generateAuthToken = (user: UserType) => {
  const token = jwt.sign(user, JWT_SECRET, { expiresIn: '4h' });
  return token;
};

export const verifyAuthToken = (token: string) => {
  try {
    const user = jwt.verify(token, JWT_SECRET);
    return user as UserType;
  } catch (_) {
    return null;
  }
};
