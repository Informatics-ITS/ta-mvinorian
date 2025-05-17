import { GameInsertType } from '@/db/schema';
import { createResponse } from '@/lib/response';
import {
  createGame,
  deleteGame,
  getAllGameCodes,
  getGameByCode,
  getGameByUserId,
  updateGame,
} from '@/repository/game-repository';

export const createGameService = async (userId: string) => {
  try {
    const gameByUserId = await getGameByUserId(userId);
    if (gameByUserId) return createResponse({ success: false, message: 'user already in game', data: gameByUserId });

    const allGameCodes = await getAllGameCodes();
    let code = '';
    do {
      code = Math.random().toString(36).substring(2, 8).toUpperCase();
    } while (allGameCodes.includes(code));

    const role = Math.random() < 0.5 ? 'attacker' : 'defender';
    const game: GameInsertType = {
      code: code,
      attacker: role === 'attacker' ? userId : null,
      defender: role === 'defender' ? userId : null,
    };

    const newGame = await createGame(game);
    if (!newGame) return createResponse({ success: false, message: 'failed to create game', data: undefined });

    return createResponse({ success: true, message: 'game created', data: newGame });
  } catch (_) {
    return createResponse({ success: false, message: 'failed to create game', data: undefined });
  }
};

export const joinGameService = async (userId: string, code: string) => {
  try {
    const gameByUserId = await getGameByUserId(userId);
    if (gameByUserId) return createResponse({ success: false, message: 'user already in game', data: gameByUserId });

    const game = await getGameByCode(code);
    if (!game) return createResponse({ success: false, message: 'game not found', data: undefined });

    if (game.attacker === null) game.attacker = userId;
    else if (game.defender === null) game.defender = userId;
    else return createResponse({ success: false, message: 'game already full', data: undefined });

    const updatedGame = await updateGame(game);
    if (!updatedGame) return createResponse({ success: false, message: 'failed to join game', data: undefined });

    return createResponse({ success: true, message: 'game joined', data: updatedGame });
  } catch (_) {
    return createResponse({ success: false, message: 'failed to join game', data: undefined });
  }
};

export const leaveGameService = async (userId: string) => {
  try {
    const game = await getGameByUserId(userId);
    if (!game) return createResponse({ success: false, message: 'user not in game', data: undefined });

    if (game.attacker === userId) game.attacker = null;
    else if (game.defender === userId) game.defender = null;

    if (game.attacker === null && game.defender === null) {
      const deletedGame = await deleteGame(game.code);
      if (!deletedGame) return createResponse({ success: false, message: 'failed to leave game', data: undefined });
      return createResponse({ success: true, message: 'game left', data: deletedGame });
    } else {
      const updatedGame = await updateGame(game);
      if (!updatedGame) return createResponse({ success: false, message: 'failed to leave game', data: undefined });
      return createResponse({ success: true, message: 'game left', data: updatedGame });
    }
  } catch (_) {
    return createResponse({ success: false, message: 'failed to leave game', data: undefined });
  }
};

export const getGameByUserIdService = async (userId: string) => {
  try {
    const game = await getGameByUserId(userId);
    if (!game) return createResponse({ success: false, message: 'user not in game', data: undefined });

    return createResponse({ success: true, message: 'game found', data: game });
  } catch (_) {
    return createResponse({ success: false, message: 'failed to get game', data: undefined });
  }
};
