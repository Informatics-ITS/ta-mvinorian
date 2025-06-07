import { and, eq, or } from 'drizzle-orm';

import { db } from '@/db';
import { GameInsertType, gameTable, GameType } from '@/db/schema';

export const createGame = async (game: GameInsertType) => {
  const newGame = await db.insert(gameTable).values(game).returning();
  return newGame[0];
};

export const updateGame = async (game: GameType) => {
  const updatedGame = await db.update(gameTable).set(game).where(eq(gameTable.id, game.id)).returning();
  return updatedGame[0];
};

export const deleteGame = async (code: string) => {
  const deletedGame = await db.delete(gameTable).where(eq(gameTable.code, code)).returning();
  return deletedGame[0];
};

export const getGameByCode = async (code: string) => {
  const game = await db.select().from(gameTable).where(eq(gameTable.code, code)).limit(1);
  if (!game[0]) return null;
  return game[0];
};

export const getGameByUserId = async (userId: string) => {
  const game = await db
    .select()
    .from(gameTable)
    .where(or(eq(gameTable.attacker, userId), eq(gameTable.defender, userId)))
    .limit(1);
  if (!game[0]) return null;
  return game[0];
};

export const getAllGameCodes = async () => {
  const games = await db.select({ code: gameTable.code }).from(gameTable);
  return games.map((game) => game.code);
};

export const getAllGameUserIds = async () => {
  const games = await db.select({ attacker: gameTable.attacker, defender: gameTable.defender }).from(gameTable);
  return games
    .map((game) => [game.attacker, game.defender])
    .flat()
    .filter((userId) => userId !== null);
};

export const getGameByUserIdAndCode = async (userId: string, code: string) => {
  const game = await db
    .select()
    .from(gameTable)
    .where(and(or(eq(gameTable.attacker, userId), eq(gameTable.defender, userId)), eq(gameTable.code, code)))
    .limit(1);
  if (!game[0]) return null;
  return game[0];
};
