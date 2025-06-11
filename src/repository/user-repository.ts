import bcrypt from 'bcrypt';
import { eq } from 'drizzle-orm';

import { db } from '@/db';
import { UserActionInsertType, userActionTable, UserInsertType, userTable } from '@/db/schema';

export const getUserById = async (id: string) => {
  const user = await db.select().from(userTable).where(eq(userTable.id, id)).limit(1);
  if (!user[0]) return null;

  const { password: _, ...userWithoutPassword } = user[0];
  return userWithoutPassword;
};

export const getUserByEmail = async (email: string) => {
  const user = await db.select().from(userTable).where(eq(userTable.email, email)).limit(1);
  if (!user[0]) return null;

  const { password: _, ...userWithoutPassword } = user[0];
  return userWithoutPassword;
};

export const createUser = async (user: UserInsertType) => {
  const passwordHash = await bcrypt.hash(user.password, 10);
  const newUser = await db
    .insert(userTable)
    .values({ ...user, password: passwordHash })
    .returning();
  const { password: _, ...userWithoutPassword } = newUser[0];
  return userWithoutPassword;
};

export const loginUser = async (email: string, password: string) => {
  const users = await db.select().from(userTable).where(eq(userTable.email, email)).limit(1);
  if (!users) return null;

  const { password: hashedPassword, ...user } = users[0];
  const passwordMatch = await bcrypt.compare(password, hashedPassword);
  return passwordMatch ? user : null;
};

export const createUserAction = async (userAction: UserActionInsertType) => {
  const newUserAction = await db.insert(userActionTable).values(userAction).returning();
  return newUserAction[0];
};
