import { WsGameType } from '@/app/(_api)/api/ws/route';
import { GameHistoryInsertType, GameInsertType } from '@/db/schema';
import { createResponse } from '@/lib/response';
import { createService } from '@/lib/service';
import {
  createGame,
  createGameHistory,
  deleteGame,
  getAllGameCodes,
  getGameByCode,
  getGameByUserId,
  updateGame,
} from '@/repository/game-repository';

export const createGameService = createService(async (t, userId: string) => {
  try {
    const gameByUserId = await getGameByUserId(userId);
    if (gameByUserId)
      return createResponse({ success: false, message: t('response.user-already-in-game'), data: gameByUserId });

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
      states: '{}',
    };

    const newGame = await createGame(game);
    if (!newGame)
      return createResponse({ success: false, message: t('response.failed-to-create-game'), data: undefined });

    return createResponse({ success: true, message: t('response.game-created'), data: newGame });
  } catch (_) {
    return createResponse({ success: false, message: t('response.failed-to-create-game'), data: undefined });
  }
});

export const joinGameService = createService(async (t, userId: string, code: string) => {
  try {
    const gameByUserId = await getGameByUserId(userId);
    if (gameByUserId)
      return createResponse({ success: false, message: t('response.user-already-in-game'), data: gameByUserId });

    const game = await getGameByCode(code);
    if (!game) return createResponse({ success: false, message: t('response.game-not-found'), data: undefined });

    if (game.attacker === null) game.attacker = userId;
    else if (game.defender === null) game.defender = userId;
    else return createResponse({ success: false, message: t('response.game-already-full'), data: undefined });

    const updatedGame = await updateGame(game);
    if (!updatedGame)
      return createResponse({ success: false, message: t('response.failed-to-join-game'), data: undefined });

    return createResponse({ success: true, message: t('response.game-joined'), data: updatedGame });
  } catch (_) {
    return createResponse({ success: false, message: t('response.failed-to-join-game'), data: undefined });
  }
});

export const leaveGameService = createService(async (t, userId: string) => {
  try {
    const game = await getGameByUserId(userId);
    if (!game) return createResponse({ success: false, message: t('response.user-not-in-game'), data: undefined });

    if (game.attacker === userId) game.attacker = null;
    else if (game.defender === userId) game.defender = null;

    if (game.attacker === null && game.defender === null) {
      const deletedGame = await deleteGame(game.code);
      if (!deletedGame)
        return createResponse({ success: false, message: t('response.failed-to-leave-game'), data: undefined });
      return createResponse({ success: true, message: t('response.game-left'), data: deletedGame });
    } else {
      const updatedGame = await updateGame(game);
      if (!updatedGame)
        return createResponse({ success: false, message: t('response.failed-to-leave-game'), data: undefined });
      return createResponse({ success: true, message: t('response.game-left'), data: updatedGame });
    }
  } catch (_) {
    return createResponse({ success: false, message: t('response.failed-to-leave-game'), data: undefined });
  }
});

export const getGameByUserIdService = createService(async (t, userId: string) => {
  try {
    const game = await getGameByUserId(userId);
    if (!game) return createResponse({ success: false, message: t('response.user-not-in-game'), data: undefined });

    return createResponse({ success: true, message: t('response.game-found'), data: game });
  } catch (_) {
    return createResponse({ success: false, message: t('response.failed-to-get-game'), data: undefined });
  }
});

export const saveGameHistoryService = createService(async (t, gameHistory: GameHistoryInsertType) => {
  try {
    const newGameHistory = await createGameHistory(gameHistory);
    if (!newGameHistory) {
      return createResponse({ success: false, message: t('response.failed-to-save-game-history'), data: undefined });
    }

    return createResponse({
      success: true,
      message: t('response.successfully-saved-game-history'),
      data: newGameHistory,
    });
  } catch (_) {
    return createResponse({ success: false, message: t('response.failed-to-save-game-history'), data: undefined });
  }
});

export const saveGameService = async (code: string, game: WsGameType) => {
  try {
    const states = JSON.stringify(game.states);

    const existingGame = await getGameByCode(code);
    if (!existingGame) return createResponse({ success: false, message: 'game not found', data: undefined });

    const updatedGame = await updateGame({
      ...existingGame,
      states,
      updatedAt: new Date().toISOString(),
    });

    if (!updatedGame) return createResponse({ success: false, message: 'failed to update game', data: undefined });
    return createResponse({ success: true, message: 'game saved successfully', data: updatedGame });
  } catch (_) {
    return createResponse({ success: false, message: 'failed to save game', data: undefined });
  }
};

export const getGameByCodeService = async (code: string) => {
  try {
    const game = await getGameByCode(code);
    if (!game) return createResponse({ success: false, message: 'game not found', data: undefined });

    const gameData = {
      ...game,
      states: JSON.parse(game.states) as { [k: string]: string | null },
    };

    return createResponse({ success: true, message: 'game found', data: gameData });
  } catch (_) {
    return createResponse({ success: false, message: 'failed to get game', data: undefined });
  }
};
