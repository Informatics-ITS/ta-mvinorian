import { GameMessageType, GamePlayerStateType } from '@/provider/game-state-provider';

import { getGameCardEffect } from './game-card';
import { getGameDefenseById } from './game-defense';
import { GameTopologyType, getGameNodeById, getGameTopologyNodeById } from './game-topology';

//* ===== Types =====
export type GameCardEffectType = {
  //? Node IDs effected by the card
  nodes?: string[];

  //? Shared effects
  revealCards?: number;
  revealOpponentCards?: number;

  //? Attacker's effect
  stealTokens?: number;
  ignoreDefenses?: number;
  ignoreDefense?: boolean;
  revealDefenses?: number;
  revealNode?: boolean;

  //? Defender's effect
  addDefense?: string;
  ignoreAttack?: boolean;
  healNode?: number;
  hideDefenses?: number;
  hideNode?: boolean;
};

interface GameCardEffectContext {
  attackerState: GamePlayerStateType;
  defenderState: GamePlayerStateType;
  topology: GameTopologyType;
  stolenTokens: number;
}

interface GameCardEffectResult {
  attackerMessages: GameMessageType[];
  defenderMessages: GameMessageType[];
  stolenTokens: number;
  topology: GameTopologyType;
  attackerRevealedCards: string[];
  defenderRevealedCards: string[];
}

interface GameCardSharedEffectHandler {
  name: string;
  canHandle: (attackerEffect?: GameCardEffectType, defenderEffect?: GameCardEffectType) => boolean;
  apply: (context: GameCardEffectContext, result: GameCardEffectResult) => GameCardEffectResult;
}

interface GameCardEffectHandler {
  name: string;
  canHandle: (effect: GameCardEffectType) => boolean;
  apply: (context: GameCardEffectContext, result: GameCardEffectResult) => GameCardEffectResult;
}

//* ===== Utility Functions =====
const t = (key: string, params?: Record<string, any>): GameMessageType => {
  return { key, params };
};

//* ===== Effect Handler: revealCards =====
const revealCardsHandler: GameCardSharedEffectHandler = {
  name: 'revealCardsHandler',
  canHandle: (attackerEffect, defenderEffect) => !!attackerEffect?.revealCards || !!defenderEffect?.revealCards,
  apply: (context, result) => {
    const { attackerState, defenderState } = context;

    const attackerEffect = getGameCardEffect(attackerState.usedCardId);
    const defenderEffect = getGameCardEffect(defenderState.usedCardId);

    const attackerCards = attackerState.cards;
    const defenderCards = defenderState.cards;

    const attackerMessages: GameMessageType[] = [];
    const defenderMessages: GameMessageType[] = [];

    let attackerRevealedCards: string[] = [];
    let defenderRevealedCards: string[] = [];

    if (!!attackerEffect?.revealCards) {
      const revealCards = attackerEffect.revealCards;

      attackerRevealedCards = attackerCards
        .sort(() => Math.random() - 0.5)
        .slice(0, revealCards)
        .map((card) => card.id);

      attackerMessages.push(
        t('game-effect.revealcards-cards-revealed-from-your-hand-to-the-to', { revealCards, to: 'defender' }),
      );
      defenderMessages.push(
        t('game-effect.from-has-revealed-revealcards-cards-from-their-hand-to-you', { revealCards, from: 'attacker' }),
      );
    }

    if (!!defenderEffect?.revealCards) {
      const revealCards = defenderEffect.revealCards;

      defenderRevealedCards = defenderCards
        .sort(() => Math.random() - 0.5)
        .slice(0, revealCards)
        .map((card) => card.id);

      defenderMessages.push(
        t('game-effect.revealcards-cards-revealed-from-your-hand-to-the-to', { revealCards, to: 'attacker' }),
      );
      attackerMessages.push(
        t('game-effect.from-has-revealed-revealcards-cards-from-their-hand-to-you', { revealCards, from: 'defender' }),
      );
    }

    return {
      ...result,
      attackerMessages: [...result.attackerMessages, ...attackerMessages],
      defenderMessages: [...result.defenderMessages, ...defenderMessages],
      attackerRevealedCards: [...result.attackerRevealedCards, ...attackerRevealedCards],
      defenderRevealedCards: [...result.defenderRevealedCards, ...defenderRevealedCards],
    };
  },
};

//* ===== Effect Handler: revealOpponentCards =====
const revealOpponentCardsHandler: GameCardSharedEffectHandler = {
  name: 'revealOpponentCardsHandler',
  canHandle: (attackerEffect, defenderEffect) =>
    !!attackerEffect?.revealOpponentCards || !!defenderEffect?.revealOpponentCards,
  apply: (context, result) => {
    const { attackerState, defenderState } = context;

    const attackerEffect = getGameCardEffect(attackerState.usedCardId);
    const defenderEffect = getGameCardEffect(defenderState.usedCardId);

    const attackerCards = attackerState.cards;
    const defenderCards = defenderState.cards;

    const attackerMessages: GameMessageType[] = [];
    const defenderMessages: GameMessageType[] = [];

    let attackerRevealedCards: string[] = [];
    let defenderRevealedCards: string[] = [];

    if (!!attackerEffect?.revealOpponentCards) {
      const revealCards = attackerEffect.revealOpponentCards;

      defenderRevealedCards = defenderCards
        .sort(() => Math.random() - 0.5)
        .slice(0, revealCards)
        .map((card) => card.id);

      attackerMessages.push(
        t('game-effect.successfully-revealed-revealcards-from-card-s', { revealCards, from: 'defender' }),
      );
      defenderMessages.push(
        t('game-effect.revealcards-card-s-revealed-from-your-hand-by-the-by', { revealCards, by: 'attacker' }),
      );
    }

    if (!!defenderEffect?.revealOpponentCards) {
      const revealCards = defenderEffect.revealOpponentCards;

      attackerRevealedCards = attackerCards
        .sort(() => Math.random() - 0.5)
        .slice(0, revealCards)
        .map((card) => card.id);

      defenderMessages.push(
        t('game-effect.successfully-revealed-revealcards-from-card-s', { revealCards, from: 'attacker' }),
      );
      attackerMessages.push(
        t('game-effect.revealcards-card-s-revealed-from-your-hand-by-the-by', { revealCards, by: 'defender' }),
      );
    }

    return {
      ...result,
      attackerMessages: [...result.attackerMessages, ...attackerMessages],
      defenderMessages: [...result.defenderMessages, ...defenderMessages],
      attackerRevealedCards: [...result.attackerRevealedCards, ...attackerRevealedCards],
      defenderRevealedCards: [...result.defenderRevealedCards, ...defenderRevealedCards],
    };
  },
};

//* ===== Effect Handler: stealTokens =====
const stealTokensHandler: GameCardEffectHandler = {
  name: 'stealTokensHandler',
  canHandle: (effect) => !!effect.stealTokens,
  apply: (context, result) => {
    const { attackerState, defenderState } = context;

    const attackerEffect = getGameCardEffect(attackerState.usedCardId);
    const defenderEffect = getGameCardEffect(defenderState.usedCardId);

    const attackerNodeId = attackerState.targetNodeId;
    const defenderNodeId = defenderState.targetNodeId;

    if (attackerEffect?.stealTokens === undefined) return result;

    const stealTokens = attackerEffect.stealTokens;
    const ignoreDefenses = attackerEffect.ignoreDefenses ?? 0;
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
    const remainingDefenses = Math.max(0, targetNode.defenses.length - ignoreDefenses);
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

    if (ignoreDefenses > 0) {
      attackerMessages.push(
        isBlocked
          ? t('game-effect.ignored-ignoreddefenses-defense-s-but-attack-blocked-by-remaining-defenses', {
              ignoreDefenses,
            })
          : t('game-effect.successfully-ignored-ignoreddefenses-defense-s', { ignoreDefenses }),
      );
      defenderMessages.push(t('game-effect.attacker-ignored-ignoreddefenses-defense-s', { ignoreDefenses }));
    }

    if (isBlocked) {
      if (ignoreDefenses === 0) attackerMessages.push(t('game-effect.attack-blocked-by-defense-no-data-token-stolen'));
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

//* ===== Effect Handler: ignoreDefense =====
const ignoreDefenseHandler: GameCardEffectHandler = {
  name: 'ignoreDefenseHandler',
  canHandle: (effect) => !!effect.ignoreDefense,
  apply: (context, result) => {
    const { attackerState, defenderState } = context;

    const attackerEffect = getGameCardEffect(attackerState.usedCardId);
    const defenderEffect = getGameCardEffect(defenderState.usedCardId);

    const attackerNodeId = attackerState.targetNodeId;
    const defenderNodeId = defenderState.targetNodeId;

    if (attackerEffect?.ignoreDefense === undefined) return result;

    const ignoreDefense = attackerEffect.ignoreDefense;
    const ignoreAttack = defenderEffect?.ignoreAttack ?? false;

    if (ignoreAttack && attackerNodeId === defenderNodeId) {
      return {
        ...result,
        attackerMessages: [...result.attackerMessages, t('game-effect.attack-ignored-by-defender-effect')],
        defenderMessages: [...result.defenderMessages, t('game-effect.successfully-ignored-attack')],
      };
    }

    if (ignoreDefense && attackerNodeId !== defenderNodeId) {
      const message = t('game-effect.no-attempted-defense-to-ignore-in-target-node');

      return {
        ...result,
        attackerMessages: [...result.attackerMessages, message],
      };
    }

    return result;
  },
};

//* ===== Effect Handler: revealDefenses =====
const revealDefensesHandler: GameCardEffectHandler = {
  name: 'revealDefensesHandler',
  canHandle: (effect) => !!effect.revealDefenses,
  apply: (context, result) => {
    const { attackerState, defenderState } = context;

    const attackerEffect = getGameCardEffect(attackerState.usedCardId);
    const defenderEffect = getGameCardEffect(defenderState.usedCardId);

    const attackerNodeId = attackerState.targetNodeId;
    const defenderNodeId = defenderState.targetNodeId;

    if (attackerEffect?.revealDefenses === undefined) return result;

    const revealDefenses = attackerEffect.revealDefenses;
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

    const updatedTopology = {
      ...result.topology,
      nodes: result.topology.nodes.map((node) => {
        if (node.id !== attackerNodeId) return node;
        return {
          ...node,
          defenses: node.defenses.map((defense, index) => {
            if (index + 1 > revealDefenses || defense.revealed) return defense;
            return { ...defense, revealed: true };
          }),
        };
      }),
    };

    const revealedDefenses = targetNode.defenses.filter(
      (defense, index) => index + 1 <= revealDefenses && !defense.revealed,
    ).length;

    if (revealedDefenses === 0) {
      return {
        ...result,
        attackerMessages: [...result.attackerMessages, t('game-effect.no-defenses-in-target-node-to-reveal')],
      };
    } else {
      return {
        ...result,
        attackerMessages: [
          ...result.attackerMessages,
          t('game-effect.successfully-revealed-revealeddefenses-defenses-from-gamenode-name', {
            revealedDefenses,
            gameNode: gameNode.name,
          }),
        ],
        defenderMessages: [
          ...result.defenderMessages,
          t('game-effect.attacker-has-revealed-revealeddefenses-defenses-from-gamenode-name', {
            revealedDefenses,
            gameNode: gameNode.name,
          }),
        ],
        topology: updatedTopology,
      };
    }
  },
};

//* ===== Effect Handler: revealNode =====
const revealNodeHandler: GameCardEffectHandler = {
  name: 'revealNodeHandler',
  canHandle: (effect) => !!effect.revealNode,
  apply: (context, result) => {
    const { attackerState, defenderState } = context;

    const attackerEffect = getGameCardEffect(attackerState.usedCardId);
    const defenderEffect = getGameCardEffect(defenderState.usedCardId);

    const attackerNodeId = attackerState.targetNodeId;
    const defenderNodeId = defenderState.targetNodeId;

    if (attackerEffect?.revealNode === undefined) return result;

    const revealNode = attackerEffect.revealNode;
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

    const updatedTopology = {
      ...result.topology,
      nodes: result.topology.nodes.map((node) => {
        if (node.id !== attackerNodeId) return node;
        return { ...node, revealed: true };
      }),
    };

    if (!revealNode || targetNode.revealed) {
      return {
        ...result,
        attackerMessages: [
          ...result.attackerMessages,
          t('game-effect.gamenode-name-is-already-revealed', { gameNode: gameNode.name }),
        ],
      };
    } else {
      return {
        ...result,
        attackerMessages: [
          ...result.attackerMessages,
          t('game-effect.successfully-revealed-gamenode-name', { gameNode: gameNode.name }),
        ],
        defenderMessages: [
          ...result.defenderMessages,
          t('game-effect.attacker-has-revealed-gamenode-name', { gameNode: gameNode.name }),
        ],
        topology: updatedTopology,
      };
    }
  },
};

//* ===== Effect Handler: addDefense =====
const addDefenseHandler: GameCardEffectHandler = {
  name: 'addDefenseHandler',
  canHandle: (effect) => !!effect.addDefense,
  apply: (context, result) => {
    const { attackerState, defenderState } = context;

    const attackerEffect = getGameCardEffect(attackerState.usedCardId);
    const defenderEffect = getGameCardEffect(defenderState.usedCardId);

    const attackerNodeId = attackerState.targetNodeId;
    const defenderNodeId = defenderState.targetNodeId;

    if (defenderEffect?.addDefense === undefined) return result;

    const defenseId = defenderEffect.addDefense;
    const ignoreDefense = attackerEffect?.ignoreDefense ?? false;

    if (ignoreDefense && attackerNodeId === defenderNodeId) {
      return {
        ...result,
        attackerMessages: [...result.attackerMessages, t('game-effect.successfully-ignored-defense')],
        defenderMessages: [...result.defenderMessages, t('game-effect.defense-ignored-by-attacker-effect')],
      };
    }

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
  name: 'ignoreAttackHandler',
  canHandle: (effect) => !!effect.ignoreAttack,
  apply: (context, result) => {
    const { attackerState, defenderState } = context;

    const attackerEffect = getGameCardEffect(attackerState.usedCardId);
    const defenderEffect = getGameCardEffect(defenderState.usedCardId);

    const attackerNodeId = attackerState.targetNodeId;
    const defenderNodeId = defenderState.targetNodeId;

    if (defenderEffect?.ignoreAttack === undefined) return result;

    const ignoreAttack = defenderEffect.ignoreAttack;
    const ignoreDefense = attackerEffect?.ignoreDefense ?? false;

    if (ignoreDefense && attackerNodeId === defenderNodeId) {
      return {
        ...result,
        attackerMessages: [...result.attackerMessages, t('game-effect.successfully-ignored-defense')],
        defenderMessages: [...result.defenderMessages, t('game-effect.defense-ignored-by-attacker-effect')],
      };
    }

    if (ignoreAttack && attackerNodeId !== defenderNodeId) {
      const message = t('game-effect.no-attempted-attack-to-ignore-in-target-node');

      return {
        ...result,
        defenderMessages: [...result.defenderMessages, message],
      };
    }

    return result;
  },
};

//* ===== Effect Handler: healNode =====
const healNodeHandler: GameCardEffectHandler = {
  name: 'healNodeHandler',
  canHandle: (effect) => !!effect.healNode,
  apply: (context, result) => {
    const { attackerState, defenderState } = context;

    const attackerEffect = getGameCardEffect(attackerState.usedCardId);
    const defenderEffect = getGameCardEffect(defenderState.usedCardId);

    const attackerNodeId = attackerState.targetNodeId;
    const defenderNodeId = defenderState.targetNodeId;

    if (defenderEffect?.healNode === undefined) return result;

    const healNode = defenderEffect.healNode;
    const ignoreDefense = attackerEffect?.ignoreDefense ?? false;

    if (ignoreDefense && attackerNodeId === defenderNodeId) {
      return {
        ...result,
        attackerMessages: [...result.attackerMessages, t('game-effect.successfully-ignored-defense')],
        defenderMessages: [...result.defenderMessages, t('game-effect.defense-ignored-by-attacker-effect')],
      };
    }

    const targetNode = getGameTopologyNodeById(result.topology, defenderNodeId);
    const gameNode = getGameNodeById(defenderNodeId);

    if (!targetNode || !gameNode) return result;

    const stolenTokens = result.stolenTokens;
    const tokenToHeal = Math.min(healNode, stolenTokens, targetNode.stolenToken);

    const updatedTopology = {
      ...result.topology,
      nodes: result.topology.nodes.map((node) => {
        if (node.id !== defenderNodeId) return node;
        return { ...node, stolenToken: node.stolenToken - tokenToHeal };
      }),
    };

    const attackerMessages: GameMessageType[] = [];
    const defenderMessages: GameMessageType[] = [];

    if (tokenToHeal > 0) {
      defenderMessages.push(
        t('game-effect.successfully-healed-tokentoheal-data-token-s-to-gamenode-name', {
          tokenToHeal,
          gameNode: gameNode.name,
        }),
      );
      attackerMessages.push(
        t(
          'game-effect.defender-has-healed-tokentoheal-data-token-s-from-gamenode-name-stolentokens-is-now-stolentokens',
          { tokenToHeal, gameNode: gameNode.name, stolenTokens: stolenTokens - tokenToHeal },
        ),
      );
    } else if (targetNode.stolenToken === 0) {
      defenderMessages.push(t('game-effect.no-data-tokens-to-heal-in-gamenode-name', { gameNode: gameNode.name }));
    } else if (stolenTokens === 0) {
      defenderMessages.push(t('game-effect.stolen-tokens-is-0-cannot-heal-gamenode-name', { gameNode: gameNode.name }));
    }

    return {
      ...result,
      attackerMessages: [...result.attackerMessages, ...attackerMessages],
      defenderMessages: [...result.defenderMessages, ...defenderMessages],
      topology: updatedTopology,
      stolenTokens: stolenTokens - tokenToHeal,
    };
  },
};

//* ===== Effect Handler: hideDefenses =====
const hideDefensesHandler: GameCardEffectHandler = {
  name: 'hideDefensesHandler',
  canHandle: (effect) => !!effect.hideDefenses,
  apply: (context, result) => {
    const { attackerState, defenderState } = context;

    const attackerEffect = getGameCardEffect(attackerState.usedCardId);
    const defenderEffect = getGameCardEffect(defenderState.usedCardId);

    const attackerNodeId = attackerState.targetNodeId;
    const defenderNodeId = defenderState.targetNodeId;

    if (defenderEffect?.hideDefenses === undefined) return result;

    const hideDefenses = defenderEffect.hideDefenses;
    const ignoreDefense = attackerEffect?.ignoreDefense ?? false;

    if (ignoreDefense && attackerNodeId === defenderNodeId) {
      return {
        ...result,
        attackerMessages: [...result.attackerMessages, t('game-effect.successfully-ignored-defense')],
        defenderMessages: [...result.defenderMessages, t('game-effect.defense-ignored-by-attacker-effect')],
      };
    }

    const targetNode = getGameTopologyNodeById(result.topology, defenderNodeId);
    const gameNode = getGameNodeById(defenderNodeId);

    if (!targetNode || !gameNode) return result;

    const updatedTopology = {
      ...result.topology,
      nodes: result.topology.nodes.map((node) => {
        if (node.id !== defenderNodeId) return node;
        return {
          ...node,
          defenses: node.defenses.map((defense, index) => {
            if (index + 1 > hideDefenses || !defense.revealed) return defense;
            return { ...defense, revealed: false };
          }),
        };
      }),
    };

    const hiddenDefenses = targetNode.defenses.filter(
      (defense, index) => index + 1 <= hideDefenses && defense.revealed,
    ).length;

    if (hiddenDefenses === 0) {
      return {
        ...result,
        defenderMessages: [...result.defenderMessages, t('game-effect.no-defenses-in-target-node-to-hide')],
      };
    } else {
      return {
        ...result,
        attackerMessages: [
          ...result.attackerMessages,
          t('game-effect.defender-hid-hiddendefenses-defenses-from-gamenode-name', {
            hiddenDefenses,
            gameNode: gameNode.name,
          }),
        ],
        defenderMessages: [
          ...result.defenderMessages,
          t('game-effect.successfully-hid-hiddendefenses-defenses-from-gamenode-name', {
            hiddenDefenses,
            gameNode: gameNode.name,
          }),
        ],
        topology: updatedTopology,
      };
    }
  },
};

//* ===== Effect Handler: hideNode =====
const hideNodeHandler: GameCardEffectHandler = {
  name: 'hideNodeHandler',
  canHandle: (effect) => !!effect.hideNode,
  apply: (context, result) => {
    const { attackerState, defenderState } = context;

    const attackerEffect = getGameCardEffect(attackerState.usedCardId);
    const defenderEffect = getGameCardEffect(defenderState.usedCardId);

    const attackerNodeId = attackerState.targetNodeId;
    const defenderNodeId = defenderState.targetNodeId;

    if (defenderEffect?.hideNode === undefined) return result;

    const hideNode = defenderEffect.hideNode;
    const ignoreDefense = attackerEffect?.ignoreDefense ?? false;

    if (ignoreDefense && attackerNodeId === defenderNodeId) {
      return {
        ...result,
        attackerMessages: [...result.attackerMessages, t('game-effect.successfully-ignored-defense')],
        defenderMessages: [...result.defenderMessages, t('game-effect.defense-ignored-by-attacker-effect')],
      };
    }

    const targetNode = getGameTopologyNodeById(result.topology, defenderNodeId);
    const gameNode = getGameNodeById(defenderNodeId);

    if (!targetNode || !gameNode) return result;

    const updatedTopology = {
      ...result.topology,
      nodes: result.topology.nodes.map((node) => {
        if (node.id !== defenderNodeId) return node;
        return { ...node, revealed: false };
      }),
    };

    if (!hideNode || !targetNode.revealed) {
      return {
        ...result,
        defenderMessages: [
          ...result.defenderMessages,
          t('game-effect.gamenode-name-data-token-is-still-hidden-to-attacker', { gameNode: gameNode.name }),
        ],
      };
    } else {
      return {
        ...result,
        attackerMessages: [
          ...result.attackerMessages,
          t('game-effect.defender-hid-gamenode-name-data-token', { gameNode: gameNode.name }),
        ],
        defenderMessages: [
          ...result.defenderMessages,
          t('game-effect.successfully-hid-gamenode-name-data-token', { gameNode: gameNode.name }),
        ],
        topology: updatedTopology,
      };
    }
  },
};

//* ===== Effect Processor =====
const sharedEffectHandlers: GameCardSharedEffectHandler[] = [revealCardsHandler, revealOpponentCardsHandler];

const effectHandlers: GameCardEffectHandler[] = [
  stealTokensHandler,
  ignoreDefenseHandler,
  revealDefensesHandler,
  revealNodeHandler,
  addDefenseHandler,
  ignoreAttackHandler,
  healNodeHandler,
  hideDefensesHandler,
  hideNodeHandler,
];

export const processGameCardEffect = (context: GameCardEffectContext): GameCardEffectResult => {
  const { attackerState, defenderState } = context;
  const attackerEffect = getGameCardEffect(attackerState.usedCardId);
  const defenderEffect = getGameCardEffect(defenderState.usedCardId);

  let result: GameCardEffectResult = {
    attackerMessages: [],
    defenderMessages: [],
    stolenTokens: context.stolenTokens,
    topology: context.topology,
    attackerRevealedCards: [],
    defenderRevealedCards: [],
  };

  sharedEffectHandlers.forEach((handler) => {
    if (handler.canHandle(attackerEffect, defenderEffect)) {
      result = handler.apply(context, result);
    }
  });

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
