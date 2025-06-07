import { sql } from 'drizzle-orm';
import { char, pgTable, text, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';

export const userTable = pgTable('users', {
  id: uuid().primaryKey().defaultRandom(),
  name: varchar({ length: 255 }).notNull(),
  email: varchar({ length: 255 }).notNull().unique(),
  password: varchar({ length: 255 }).notNull(),
  createdAt: timestamp('created_at', { mode: 'string' }).default(sql.raw('CURRENT_TIMESTAMP')).notNull(),
  updatedAt: timestamp('updated_at', { mode: 'string' }).default(sql.raw('CURRENT_TIMESTAMP')).notNull(),
});

export type UserSelectType = typeof userTable.$inferSelect;
export type UserInsertType = typeof userTable.$inferInsert;
export type UserType = Omit<UserSelectType, 'password'>;

export const gameTable = pgTable('games', {
  id: uuid().primaryKey().defaultRandom(),
  code: char({ length: 6 }).notNull().unique(),
  attacker: uuid(),
  defender: uuid(),
  states: text().default('{}').notNull(),
  createdAt: timestamp('created_at', { mode: 'string' }).default(sql.raw('CURRENT_TIMESTAMP')).notNull(),
  updatedAt: timestamp('updated_at', { mode: 'string' }).default(sql.raw('CURRENT_TIMESTAMP')).notNull(),
});

export type GameType = typeof gameTable.$inferSelect;
export type GameInsertType = typeof gameTable.$inferInsert;
