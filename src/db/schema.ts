import { sql } from 'drizzle-orm';
import { pgTable, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';

export const userTable = pgTable('users', {
  id: uuid().primaryKey().defaultRandom(),
  name: varchar({ length: 255 }).notNull(),
  email: varchar({ length: 255 }).notNull().unique(),
  password: varchar({ length: 255 }).notNull(),
  createdAt: timestamp('created_at', { mode: 'string' }).default(sql.raw('CURRENT_TIMESTAMP')).notNull(),
});

export type UserSelectType = typeof userTable.$inferSelect;
export type UserInsertType = typeof userTable.$inferInsert;
export type UserType = Omit<UserSelectType, 'password'>;
