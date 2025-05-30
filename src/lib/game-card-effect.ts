import { GAME_CARD_EFFECTS } from '@/constant/game-card-effect';
import { GamePlayerStateType } from '@/provider/game-state-provider';

import { getGameDefenseById } from './game-defense';
import { GameTopologyType, getGameNodeById, getGameTopologyNodeById } from './game-topology';

export type GameCardEffectType = {
  //? Node IDs effected by the card
  nodes?: string[];

  //? Attacker's effect
  stealTokens?: number;

  //? Defender's effect
  addDefense?: string;
  // revealCard?: {
  //   role: GameRoleType;
  //   count: number;
  // };
  // revealNode?: string[];
  // revealNodeDefense?: {
  //   nodeId: string;
  //   count: number;
  // };
  // addDefense?: {
  //   nodeId: string;
  //   defenseId: string;
  // };
};

export const getGameCardEffect = (cardId?: string): GameCardEffectType | undefined => {
  if (!cardId) return undefined;
  const effect = GAME_CARD_EFFECTS[cardId];
  if (!effect) return undefined;

  return effect;
};

export const isCardTargetNode = (cardId: string): boolean => {
  const effect = getGameCardEffect(cardId);
  if (!effect) return false;
  if (!effect.nodes) return false;
  if (effect.nodes.length === 0) return false;
  return true;
};

export const isCardApplicableToNode = (cardId?: string, nodeId?: string): boolean => {
  if (!cardId || !nodeId) return false;

  const effect = getGameCardEffect(cardId);
  if (!effect) return false;

  if (!effect.nodes) return false;
  if (effect.nodes.includes('all')) return true;

  return effect.nodes.includes(nodeId);
};

interface ApplyCardEffectParams {
  attackerState: GamePlayerStateType;
  defenderState: GamePlayerStateType;
  topology: GameTopologyType;
}

interface ApplyCardEffectReturn {
  attackerResult: string[];
  defenderResult: string[];
  stolenTokens: number;
  topology: GameTopologyType;
}

export const calculateCardEffect = ({
  attackerState,
  defenderState,
  topology,
}: ApplyCardEffectParams): ApplyCardEffectReturn => {
  const attackerEffect = getGameCardEffect(attackerState.usedCardId);
  const defenderEffect = getGameCardEffect(defenderState.usedCardId);

  const attackerNodeId = attackerState.targetNodeId;
  const defenderNodeId = defenderState.targetNodeId;

  const attackerResult: string[] = [];
  const defenderResult: string[] = [];

  let topologyResult: GameTopologyType = topology;
  let stolenTokens = 0;

  //* ===== Attacker Effect: Steal Tokens =====
  if (attackerEffect?.stealTokens) {
    const effectStealTokens = attackerEffect.stealTokens;

    const targetNode = getGameTopologyNodeById(topologyResult, attackerNodeId);
    const gameNode = getGameNodeById(attackerNodeId);

    let blocked = false;

    if (targetNode && gameNode) {
      const currentTokens = gameNode.token - targetNode.stolenToken;
      stolenTokens = Math.min(currentTokens, effectStealTokens);
      blocked = targetNode.defenses.length > 0;

      topologyResult = {
        ...topologyResult,
        nodes: topologyResult.nodes.map((node) => {
          if (node.id !== attackerNodeId) return node;
          if (blocked) return { ...node, defenses: node.defenses.slice(1) };
          return { ...node, stolenToken: node.stolenToken + stolenTokens };
        }),
      };
    }

    if (blocked) {
      stolenTokens = 0;
      attackerResult.push(`attack blocked by defense, no data token stolen`);
      defenderResult.push(`${gameNode?.name} defense blocked the attempted attack, no data token stolen`);
    } else if (stolenTokens > 0) {
      attackerResult.push(`successfully stole ${stolenTokens} data token(s)`);
      defenderResult.push(`attacker has stolen ${stolenTokens} data token(s)`);
    } else {
      attackerResult.push('no data token in target node');
    }
  }

  //* ===== Defender Effect: Add Defense =====
  if (defenderEffect?.addDefense) {
    const defenseId = defenderEffect.addDefense;

    const targetNode = getGameTopologyNodeById(topologyResult, defenderNodeId);
    const gameNode = getGameNodeById(defenderNodeId);

    let isDefenseMaxed = false;

    if (targetNode && gameNode) {
      topologyResult = {
        ...topologyResult,
        nodes: topologyResult.nodes.map((node) => {
          if (node.id !== defenderNodeId) return node;
          if (node.defenses.length >= 3) {
            isDefenseMaxed = true;
            return node;
          }
          return { ...node, defenses: [...node.defenses, { id: defenseId, revealed: false }] };
        }),
      };
    }

    if (isDefenseMaxed) {
      defenderResult.push(`${gameNode?.name} defense is already maxed, no new defense added`);
    } else {
      defenderResult.push(`added ${getGameDefenseById(defenseId)?.name} defense to ${gameNode?.name}`);
    }
  }

  return {
    attackerResult,
    defenderResult,
    stolenTokens,
    topology: topologyResult,
  };
};
