import { GAME_CARD_EFFECTS } from '@/constant/game-card-effect';
import { GameRoleType } from '@/provider/game-engine-provider';

export type GameCardEffectType = {
  //? Immediate effect
  stealTokens?: number;
  revealCard?: {
    role: GameRoleType;
    count: number;
  };
  revealNode?: string[];
  revealNodeDefense?: {
    nodeId: string;
    count: number;
  };
  addDefense?: {
    nodeId: string;
    defenseId: string;
  };
};

export const getGameCardEffect = (cardId: string): GameCardEffectType | undefined => {
  const effect = GAME_CARD_EFFECTS[cardId];
  if (!effect) return undefined;

  return effect;
};

// export const applyCardEffect = (cardId: string, nodeId: string | null): boolean => {
//   const effect = getGameCardEffect(cardId);
//   if (!effect) return false;

//   let effectApplied = false;

//   if (!!effect.revealNode) {
//   }

//   return effectApplied;
// };
