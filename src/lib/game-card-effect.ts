import { GAME_CARD_EFFECTS } from '@/constant/game-card-effect';
import { GameEngineType } from '@/provider/game-engine-provider';

import { getGameDefenseById } from './game-defense';
import { getTopologyNodeById } from './topology';

export type GameCardEffectType = {
  //? Node IDs effected by the card
  nodes?: string[];

  //? Attacker's effect
  aStealTokens?: number;

  //? Defender's effect
  dAddDefense?: string;
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

export const getGameCardEffect = (cardId: string): GameCardEffectType | undefined => {
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

export const isCardApplicableToNode = (cardId: string, nodeId: string): boolean => {
  const effect = getGameCardEffect(cardId);
  if (!effect) return false;

  if (!effect.nodes) return false;
  if (effect.nodes.includes('all')) return true;

  return effect.nodes.includes(nodeId);
};

interface ApplyCardEffectRoleParams {
  cardId: string;
  nodeId: string;
}

interface ApplyCardEffectParams {
  attacker: ApplyCardEffectRoleParams;
  defender: ApplyCardEffectRoleParams;
  topology: GameEngineType['topology'];
}

interface ApplyCardEffectReturn {
  effectMsg: {
    attacker: string[];
    defender: string[];
  };
  tokenStolen: number;
  newTopology: GameEngineType['topology'];
}

// TODO: Continue to implement other card effects
export const applyCardEffect = ({ attacker, defender, topology }: ApplyCardEffectParams): ApplyCardEffectReturn => {
  const aEffect = getGameCardEffect(attacker.cardId);
  const dEffect = getGameCardEffect(defender.cardId);
  const aNodeId = attacker.nodeId;
  const dNodeId = defender.nodeId;
  const aMessage: string[] = [];
  const dMessage: string[] = [];

  let tokenStolen: number = 0;
  let newTopology: GameEngineType['topology'] = topology;

  //* ===== Attacker Effect: Steal Token =====
  if (aEffect?.aStealTokens) {
    const stealTokens = aEffect.aStealTokens;
    let nodeName = '';
    let blocked = false;

    if (newTopology) {
      const targetNode = newTopology.nodes.find((node) => node.id === aNodeId);
      if (targetNode) {
        const nodeDetail = getTopologyNodeById(targetNode.id);
        const currentToken = (nodeDetail?.token ?? 0) - targetNode.stolenToken;
        tokenStolen = Math.min(currentToken, stealTokens);
        blocked = targetNode.defenses.length > 0;
        nodeName = nodeDetail?.name ?? '';

        newTopology = {
          ...newTopology,
          nodes: newTopology.nodes.map((node) => {
            if (node.id !== aNodeId) return node;
            if (blocked) return { ...node, defenses: node.defenses.slice(1) };
            return { ...node, stolenToken: node.stolenToken + tokenStolen };
          }),
        };
      }
    }

    if (blocked) {
      tokenStolen = 0;
      aMessage.push(`attack blocked by defense, no data token stolen`);
      dMessage.push(`${nodeName} defense blocked the attempted attack, no data token stolen`);
    } else if (tokenStolen > 0) {
      aMessage.push(`successfully stole ${tokenStolen} data token`);
      dMessage.push(`attacker has stolen ${tokenStolen} data token`);
    } else {
      aMessage.push('no data token in target node');
    }
  }

  //* ===== Defender Effect: Add Defense =====
  if (dEffect?.dAddDefense) {
    const defenseId = dEffect.dAddDefense;
    let nodeName = '';
    let isDefenseMaxed = false;

    if (newTopology) {
      const targetNode = newTopology.nodes.find((node) => node.id === dNodeId);
      if (targetNode) {
        const nodeDetail = getTopologyNodeById(targetNode.id);
        nodeName = nodeDetail?.name ?? '';

        newTopology = {
          ...newTopology,
          nodes: newTopology.nodes.map((node) => {
            if (node.id !== dNodeId) return node;
            if (node.defenses.length >= 3) {
              isDefenseMaxed = true;
              return node;
            }
            return { ...node, defenses: [...node.defenses, { id: defenseId, revealed: false }] };
          }),
        };
      }
    }

    if (isDefenseMaxed) {
      dMessage.push(`${nodeName} defense is already maxed, no new defense added`);
    } else {
      dMessage.push(`added ${getGameDefenseById(defenseId)?.name} defense to ${nodeName}`);
    }
  }

  return {
    effectMsg: {
      attacker: aMessage,
      defender: dMessage,
    },
    tokenStolen,
    newTopology,
  };
};
