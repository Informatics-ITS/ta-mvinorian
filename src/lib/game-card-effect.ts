import { GAME_CARD_EFFECTS } from '@/constant/game-card-effect';
import { GameEngineType } from '@/provider/game-engine-provider';

import { getTopologyNodeById } from './topology';

export type GameCardEffectType = {
  //? Node IDs effected by the card
  nodes?: string[];

  //? Immediate effect
  aStealTokens?: number;
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
    attacker: string;
    defender: string;
  };
  tokenStolen: number;
  newTopology: GameEngineType['topology'];
}

// TODO: Continue to implement other card effects
export const applyCardEffect = ({ attacker, defender, topology }: ApplyCardEffectParams): ApplyCardEffectReturn => {
  const aEffect = getGameCardEffect(attacker.cardId);
  const _dEffect = getGameCardEffect(defender.cardId);
  const aNodeId = attacker.nodeId;
  const _dNodeId = defender.nodeId;

  let aMessage: string = '';
  let dMessage: string = '';
  let tokenStolen: number = 0;
  let newTopology: GameEngineType['topology'] = null;

  //* ===== Attacker Effect: Steal Token =====
  if (aEffect?.aStealTokens) {
    const stealTokens = aEffect.aStealTokens;

    if (topology) {
      const targetNode = topology.nodes.find((node) => node.id === aNodeId);
      if (targetNode) {
        const nodeDetail = getTopologyNodeById(targetNode.id);
        const currentToken = (nodeDetail?.token ?? 0) - targetNode.stolenToken;
        tokenStolen = Math.min(currentToken, stealTokens);

        newTopology = {
          ...topology,
          nodes: topology.nodes.map((node) => {
            if (node.id !== aNodeId) return node;
            return { ...node, stolenToken: node.stolenToken + tokenStolen };
          }),
        };
      }
    }

    if (tokenStolen > 0) {
      aMessage = `successfully stole ${tokenStolen} data token`;
      dMessage = `attacker has stolen ${tokenStolen} data token`;
    } else {
      aMessage = 'no data token in target node';
      dMessage = '';
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
