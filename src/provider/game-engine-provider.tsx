'use client';

import React from 'react';

import { useAuthStore } from '@/hook/use-auth-store';
import { useWsPlayers, useWsState } from '@/hook/use-ws-state';
import {
  defaultGameDeckType,
  GameCardType,
  GameDeckType,
  generateGameDeck,
  getGameCardById,
  getRandomGameCards,
} from '@/lib/game-card';
import { defaultTopology, TopologyType } from '@/lib/topology';

import { useWsContext } from './ws-provider';

export type GameRoleType = 'attacker' | 'defender';

export enum GamePhase {
  WaitingJoin = 'waiting-join',
  Play = 'play',
  End = 'end',
}

export enum GameRoundPhase {
  CardSelect = 'card-select',
  NodeSelect = 'node-select',
  ActionEnd = 'action-end',
  RoundResult = 'round-result',
  RoundEnd = 'round-end',
}

type GameRoundPhaseType = Record<GameRoleType, GameRoundPhase>;
const defaultGameRoundPhaseType: GameRoundPhaseType = {
  attacker: GameRoundPhase.CardSelect,
  defender: GameRoundPhase.CardSelect,
};

type GameHistoryType = Record<
  string,
  {
    usedCard: Record<GameRoleType, string | null>;
    usedNode?: Record<GameRoleType, string | null>;
  }
>;

export enum GameConstant {
  MaxRounds = 10,
  TokensToWin = 3,
}

export type GameEngineType = {
  deck: GameDeckType;
  role: GameRoleType | null;
  round: number;
  phase: GamePhase;
  history: GameHistoryType;
  topology: TopologyType | null;
  roundPhase: GameRoundPhaseType;
  stolenTokens: number;
  clickCard: (cardId: string) => void;
  clickNode: (nodeId: string) => void;
  clickUseCard: (cardId: string) => void;
  clickNextRound: () => void;
};

const GameEngineContext = React.createContext<GameEngineType>({
  deck: defaultGameDeckType,
  role: null,
  round: 1,
  phase: GamePhase.WaitingJoin,
  history: {},
  topology: null,
  roundPhase: defaultGameRoundPhaseType,
  stolenTokens: 0,
  clickCard: () => {},
  clickNode: () => {},
  clickUseCard: () => {},
  clickNextRound: () => {},
});

export const useGameEngineContext = () => {
  const context = React.useContext(GameEngineContext);
  if (!context) {
    throw new Error('useGameEngineContext must be used within a <GameEngineProvider>');
  }
  return context;
};

export interface GameEngineProviderProps {
  children: React.ReactNode;
}

export const GameEngineProvider = ({ children }: GameEngineProviderProps) => {
  const players = useWsPlayers();
  // const refresh = useWsRefresh();
  const { user } = useAuthStore();
  const { isConnected, lastMessage } = useWsContext();

  //* ===== Game Engine State =====
  const [deck, setDeck] = useWsState<GameEngineType['deck']>('deck', defaultGameDeckType);
  const [phase, setPhase] = useWsState<GameEngineType['phase']>('phase', GamePhase.WaitingJoin);
  const [round, setRound] = useWsState<GameEngineType['round']>('round', 1);
  const [history, setHistory] = useWsState<GameEngineType['history']>('history', {});
  const [topology, setTopology] = useWsState<GameEngineType['topology']>('topology', null);
  const [roundPhase, setRoundPhase] = useWsState<GameEngineType['roundPhase']>('roundPhase', defaultGameRoundPhaseType);
  const [stolenTokens, setStolenTokens] = useWsState<GameEngineType['stolenTokens']>('stolenTokens', 0);

  //* ===== Role Refresh =====
  const roleRef = React.useRef<GameRoleType>(null);
  const role = React.useMemo(() => {
    if (roleRef.current !== null) return roleRef.current;
    if (!user) return;
    if (user.id === players.attacker) return 'attacker';
    if (user.id === players.defender) return 'defender';
  }, [players, user]);

  //* ===== Player Actions =====
  const clickCard = (cardId: string) => {
    if (!role) return;
    const newDeck = {
      ...deck,
      [role]: deck[role].map((card) =>
        card.id === cardId ? { ...card, selected: !card.selected } : { ...card, selected: false },
      ),
    };
    setDeck(newDeck);
  };

  const clickNode = (nodeId: string) => {
    if (!role || !topology) return;
    const newTopology = {
      ...topology,
      nodes: topology?.nodes.map((node) =>
        node.id === nodeId
          ? {
              ...node,
              selected: {
                ...node.selected,
                [role]: !node.selected[role],
              },
            }
          : node,
      ),
    };
    setTopology(newTopology);
  };

  const clickUseCard = (cardId: string) => {
    if (!role || roundPhase[role] !== GameRoundPhase.CardSelect) return;

    //? Draw new card
    let newCard: GameCardType;
    do {
      newCard = getRandomGameCards(role, 1)[0];
    } while (deck[role].some((card) => card.id === newCard.id));

    //? Remove used card from deck
    const newRoleDeck = [...deck[role].filter((card) => card.id !== cardId), { id: newCard.id, selected: false }];
    const newDeck = {
      ...deck,
      [role]: newRoleDeck,
    };
    setDeck(newDeck);

    //? Update history
    const newHistory = {
      ...history,
      [round]: {
        usedCard: {
          ...history[round]?.usedCard,
          [role]: cardId,
        },
        usedNode: {
          ...history[round]?.usedNode,
          [role]: null,
        },
      },
    };
    setHistory(newHistory);

    //? Update round phase
    const card = getGameCardById(cardId);
    if (card && card.applicableToNodes) {
      const newRoundPhase = {
        ...roundPhase,
        [role]: GameRoundPhase.NodeSelect,
      };
      setRoundPhase(newRoundPhase);
    } else {
      const newRoundPhase = {
        ...roundPhase,
        [role]: GameRoundPhase.ActionEnd,
      };
      setRoundPhase(newRoundPhase);
    }
  };

  const clickNextRound = () => {
    if (!role) return;
    const newRoundPhase = {
      ...roundPhase,
      [role]: GameRoundPhase.RoundEnd,
    };
    setRoundPhase(newRoundPhase);
  };

  //* ===== Game Engine Logic =====
  // const isCardApplicableToNode = (cardId: string, nodeId: string) => {
  //   const card = getGameCardById(cardId);

  //   if (!card) return false;
  //   if (card.applicableToNodes) return card.applicableToNodes.includes(nodeId);

  //   return true;
  // };

  // const isNodeSelectable = (nodeId: string) => {
  //   if (!role || roundPhase[role] !== GameRoundPhase.NodeSelect) return false;

  //   const node = getTopologyNodeById(nodeId);
  //   if (!node) return false;

  //   const usedCard = history[round]?.usedCard;

  //   return isCardApplicableToNode(usedCard, nodeId);
  // };

  const runCardEffects = () => {
    if (!role) return;
    const newRoundPhase = {
      ...roundPhase,
      [role]: GameRoundPhase.RoundResult,
    };
    setRoundPhase(newRoundPhase);
  };

  const resetRoundPhase = () => {
    setRound(round + 1);
    setRoundPhase(defaultGameRoundPhaseType);
  };

  const checkRoundEnd = React.useCallback(() => {
    if (roundPhase.attacker === GameRoundPhase.ActionEnd && roundPhase.defender === GameRoundPhase.ActionEnd) {
      const newRoundPhase = {
        ...roundPhase,
        attacker: GameRoundPhase.RoundResult,
        defender: GameRoundPhase.RoundResult,
      };
      setRoundPhase(newRoundPhase);
    }

    if (roundPhase.attacker !== GameRoundPhase.RoundEnd || roundPhase.defender !== GameRoundPhase.RoundEnd) return;
    if (stolenTokens >= GameConstant.TokensToWin) {
      setPhase(GamePhase.End);
      return;
    }
    if (round >= GameConstant.MaxRounds) {
      setPhase(GamePhase.End);
      return;
    }
    runCardEffects();
    setTimeout(() => {
      resetRoundPhase();
    }, 3000);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roundPhase]);

  const startGame = React.useCallback(() => {
    setDeck(generateGameDeck(5, 5));
    setRound(1);
    setPhase(GamePhase.Play);
    setTopology(defaultTopology);
    setRoundPhase(defaultGameRoundPhaseType);
    setStolenTokens(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  React.useEffect(() => {
    if (!isConnected) return;

    switch (phase) {
      case GamePhase.WaitingJoin:
        if (players.attacker && players.defender) startGame();
        break;
      case GamePhase.Play:
        checkRoundEnd();
        break;
      default:
        break;
    }
  }, [players, phase, setPhase, round, startGame, checkRoundEnd, isConnected, lastMessage]);

  const gameEngine: GameEngineType = {
    deck,
    role: role ?? null,
    round,
    phase,
    history,
    topology,
    roundPhase,
    stolenTokens,
    clickCard,
    clickNode,
    clickUseCard,
    clickNextRound,
  };

  return <GameEngineContext.Provider value={gameEngine}>{children}</GameEngineContext.Provider>;
};
