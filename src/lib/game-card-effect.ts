import { GameMessageType, GamePlayerStateType } from '@/provider/game-state-provider';

import { getGameCardEffect } from './game-card';
import { getGameDefenseById } from './game-defense';
import { GameTopologyType, getGameNodeById, getGameTopologyNodeById } from './game-topology';

//* ===== Types =====
export type GameCardEffectType = {
  //? Node IDs effected by the card
  nodes?: string[];

  //? Attacker's effect
  stealTokens?: number;
  ignoredDefenses?: number;

  //? Defender's effect
  addDefense?: string;
  ignoreAttack?: boolean;
};

interface GameCardEffectContext {
  attackerState: GamePlayerStateType;
  defenderState: GamePlayerStateType;
  topology: GameTopologyType;
}

interface GameCardEffectResult {
  attackerMessages: GameMessageType[];
  defenderMessages: GameMessageType[];
  stolenTokens: number;
  topology: GameTopologyType;
}

interface GameCardEffectHandler {
  canHandle: (effect: GameCardEffectType) => boolean;
  apply: (context: GameCardEffectContext, result: GameCardEffectResult) => GameCardEffectResult;
}

//* ===== Utility Functions =====
const t = (key: string, params?: Record<string, any>): GameMessageType => {
  return { key, params };
};

//* ===== Effect Handler: stealTokens =====
const stealTokensHandler: GameCardEffectHandler = {
  canHandle: (effect) => !!effect.stealTokens,
  apply: (context, result) => {
    const { attackerState, defenderState } = context;

    const attackerEffect = getGameCardEffect(attackerState.usedCardId);
    const defenderEffect = getGameCardEffect(defenderState.usedCardId);

    const attackerNodeId = attackerState.targetNodeId;
    const defenderNodeId = defenderState.targetNodeId;

    if (attackerEffect?.stealTokens === undefined) return result;

    const stealTokens = attackerEffect.stealTokens;
    const ignoredDefenses = attackerEffect.ignoredDefenses ?? 0;
    const ignoreAttack = defenderEffect?.ignoreAttack ?? false;

    if (ignoreAttack && attackerNodeId === defenderNodeId) {
      return {
        ...result,
        attackerMessages: [...result.attackerMessages, t('game-effect.attack-ignored-by-defender-effect')],
        defenderMessages: [...result.defenderMessages, t('game-effect.successfully-ignored-attack')],
      };
    }

    const targetNode = getGameTopologyNodeById(result.topology, attackerNodeId);
    const gameNode = getGameNodeById(attackerNodeId);

    if (!targetNode || !gameNode) return result;

    const currentTokens = gameNode.token - targetNode.stolenToken;
    const tokensToSteal = Math.min(currentTokens, stealTokens);
    const remainingDefenses = Math.max(0, targetNode.defenses.length - ignoredDefenses);
    const isBlocked = remainingDefenses > 0;

    const updatedTopology = {
      ...result.topology,
      nodes: result.topology.nodes.map((node) => {
        if (node.id !== attackerNodeId) return node;
        if (isBlocked) return { ...node, defenses: node.defenses.slice(1) };
        return { ...node, stolenToken: node.stolenToken + tokensToSteal };
      }),
    };

    const attackerMessages: GameMessageType[] = [];
    const defenderMessages: GameMessageType[] = [];

    if (ignoredDefenses > 0) {
      attackerMessages.push(
        isBlocked
          ? t('game-effect.ignored-ignoreddefenses-defense-s-but-attack-blocked-by-remaining-defenses', {
              ignoredDefenses,
            })
          : t('game-effect.successfully-ignored-ignoreddefenses-defense-s', { ignoredDefenses }),
      );
      defenderMessages.push(t('game-effect.attacker-ignored-ignoreddefenses-defense-s', { ignoredDefenses }));
    }

    if (isBlocked) {
      if (ignoredDefenses === 0) attackerMessages.push(t('game-effect.attack-blocked-by-defense-no-data-token-stolen'));
      defenderMessages.push(
        t('game-effect.gamenode-name-defense-blocked-the-attempted-attack-no-data-token-stolen', {
          gameNode: gameNode.name,
        }),
      );
    } else if (currentTokens === 0) {
      attackerMessages.push(t('game-effect.no-data-token-in-target-node'));
    } else if (tokensToSteal > 0) {
      attackerMessages.push(t('game-effect.successfully-stole-tokenstosteal-data-token-s', { tokensToSteal }));
      defenderMessages.push(t('game-effect.attacker-has-stolen-tokenstosteal-data-token-s', { tokensToSteal }));
    }

    return {
      ...result,
      attackerMessages: [...result.attackerMessages, ...attackerMessages],
      defenderMessages: [...result.defenderMessages, ...defenderMessages],
      stolenTokens: result.stolenTokens + (isBlocked ? 0 : tokensToSteal),
      topology: updatedTopology,
    };
  },
};

//* ===== Effect Handler: addDefense =====
const addDefenseHandler: GameCardEffectHandler = {
  canHandle: (effect) => !!effect.addDefense,
  apply: (context, result) => {
    const { defenderState } = context;

    const defenderEffect = getGameCardEffect(defenderState.usedCardId);
    const defenderNodeId = defenderState.targetNodeId;

    if (defenderEffect?.addDefense === undefined) return result;

    const defenseId = defenderEffect.addDefense;
    const targetNode = getGameTopologyNodeById(result.topology, defenderNodeId);
    const gameNode = getGameNodeById(defenderNodeId);
    const gameDefense = getGameDefenseById(defenseId);

    if (!targetNode || !gameNode || !gameDefense) return result;

    const isDefenseMaxed = targetNode.defenses.length >= 3;

    const updatedTopology = {
      ...result.topology,
      nodes: result.topology.nodes.map((node) => {
        if (node.id !== defenderNodeId || isDefenseMaxed) return node;
        return { ...node, defenses: [...node.defenses, { id: defenseId, revealed: false }] };
      }),
    };

    const message = isDefenseMaxed
      ? t('game-effect.gamenode-name-defense-is-already-maxed-no-new-defense-added', { gameNode: gameNode.name })
      : t('game-effect.added-gamedefense-name-defense-to-gamenode-name', {
          gameDefense: gameDefense.name,
          gameNode: gameNode.name,
        });

    return {
      ...result,
      defenderMessages: [...result.defenderMessages, message],
      topology: updatedTopology,
    };
  },
};

//* ===== Effect Handler: ignoreAttack =====
const ignoreAttackHandler: GameCardEffectHandler = {
  canHandle: (effect) => !!effect.ignoreAttack,
  apply: (context, result) => {
    const { attackerState, defenderState } = context;

    const defenderEffect = getGameCardEffect(defenderState.usedCardId);

    const attackerNodeId = attackerState.targetNodeId;
    const defenderNodeId = defenderState.targetNodeId;

    if (defenderEffect?.ignoreAttack === undefined) return result;
    if (defenderEffect.ignoreAttack && attackerNodeId !== defenderNodeId) {
      const message = t('game-effect.no-attempted-attack-to-ignore-in-target-node');

      return {
        ...result,
        defenderMessages: [...result.defenderMessages, message],
      };
    }

    return result;
  },
};

//* ===== Effect Processor =====
const effectHandlers: GameCardEffectHandler[] = [stealTokensHandler, addDefenseHandler, ignoreAttackHandler];

export const processGameCardEffect = (context: GameCardEffectContext): GameCardEffectResult => {
  const { attackerState, defenderState } = context;
  const attackerEffect = getGameCardEffect(attackerState.usedCardId);
  const defenderEffect = getGameCardEffect(defenderState.usedCardId);

  let result: GameCardEffectResult = {
    attackerMessages: [],
    defenderMessages: [],
    stolenTokens: 0,
    topology: context.topology,
  };

  if (attackerEffect)
    effectHandlers.forEach((handler) => {
      if (handler.canHandle(attackerEffect)) {
        result = handler.apply(context, result);
      }
    });

  if (defenderEffect)
    effectHandlers.forEach((handler) => {
      if (handler.canHandle(defenderEffect)) {
        result = handler.apply(context, result);
      }
    });

  return result;
};
