'use client';

import React from 'react';

import { Loading } from '@/component/ui/loading';
import { useWsPlayers, useWsState } from '@/hook/use-ws-state';
import {
  GameCardPlayerType,
  GameCardType,
  generateGameDeckByRole,
  getRandomGameCards,
  isCardApplicableToNode,
  isCardTargetNode,
} from '@/lib/game-card';
import { processGameCardEffect } from '@/lib/game-card-effect';
import { defaultGameNodePlayer, defaultGameTopology, GameNodePlayerType, GameTopologyType } from '@/lib/game-topology';

import { useUserTourContext } from './user-tour-provider';
import { useWsContext } from './ws-provider';

export type GameRoleType = 'attacker' | 'defender';

export enum GameConstant {
  MaxRounds = 10,
  TokensToWin = 3,
}

export enum GamePlayerPhase {
  WaitGame = 'wait-game',
  SelectCard = 'select-card',
  SelectNode = 'select-node',
  WaitTurn = 'wait-turn',
  WaitResult = 'wait-result',
  EndRound = 'end-round',
  EndGame = 'end-game',
}

export type GamePlayerStateType = {
  cards: GameCardPlayerType[];
  nodes: GameNodePlayerType[];
  usedCardId?: string;
  targetNodeId?: string;
};

export type GameMessageType = {
  key: string;
  params?: Record<string, any>;
};

export type GamePlayerHistoryType = {
  usedCardId?: string;
  targetNodeId?: string;
  opponentCards?: string[];
  messages?: GameMessageType[];
}[];

export type GameHistoryType = {
  round: number;
  topology: GameTopologyType;
  stolenTokens: number;
  isCalculated: boolean;
}[];

export type GameStateType = {
  role?: GameRoleType;

  //? Set by host
  round: number;
  history: GameHistoryType;

  //? Set by players
  playerPhase: GamePlayerPhase;
  playerState: GamePlayerStateType;
  playerHistory: GamePlayerHistoryType;

  //? Player Action
  clickCard: (cardId: string) => void;
  clickNode: (nodeId: string) => void;
  clickUseCard: (cardId: string) => void;
  clickTargetNode: (nodeId: string) => void;
  clickNextRound: () => void;
  checkIsNodeTargetable: (nodeId: string) => boolean;
  getGameTopology: () => GameTopologyType;
  getGamePlayerCards: () => GameCardPlayerType[];
  getGamePlayerNodes: () => GameNodePlayerType[];
  getGameStolenTokens: () => number;
};

const GameStateContext = React.createContext<GameStateType>({
  round: 0,
  history: [],
  playerPhase: GamePlayerPhase.WaitGame,
  playerState: {
    cards: [],
    nodes: [],
  },
  playerHistory: [],
  clickCard: () => {},
  clickNode: () => {},
  clickUseCard: () => {},
  clickTargetNode: () => {},
  clickNextRound: () => {},
  checkIsNodeTargetable: () => false,
  getGameTopology: () => defaultGameTopology,
  getGamePlayerNodes: () => [],
  getGamePlayerCards: () => [],
  getGameStolenTokens: () => 0,
});

export const useGameStateContext = () => {
  const context = React.useContext(GameStateContext);
  if (!context) {
    throw new Error('useGameStateContext must be used within a <GameStateProvider>');
  }
  return context;
};

export interface GameStateProviderProps {
  children: React.ReactNode;
}

export const GameStateProvider = ({ children }: GameStateProviderProps) => {
  const [initialized, setInitialized] = React.useState(false);

  //* ===== Contexts =====
  const { isConnected } = useWsContext();
  const { players, isHost, role } = useWsPlayers();
  const { setIsReady: setIsUserTourReady } = useUserTourContext();

  //* ===== Game State Definition =====
  const [round, setRound] = useWsState('round', 0);
  const [history, setHistory] = useWsState<GameHistoryType>('history', []);

  const [attackerPhase, setAttackerPhase] = useWsState<GamePlayerPhase>('attackerPhase', GamePlayerPhase.WaitGame);
  const [defenderPhase, setDefenderPhase] = useWsState<GamePlayerPhase>('defenderPhase', GamePlayerPhase.WaitGame);

  const [attackerState, setAttackerState] = useWsState<GamePlayerStateType>('attackerState', { cards: [], nodes: [] });
  const [defenderState, setDefenderState] = useWsState<GamePlayerStateType>('defenderState', { cards: [], nodes: [] });

  const [attackerHistory, setAttackerHistory] = useWsState<GamePlayerHistoryType>('attackerHistory', []);
  const [defenderHistory, setDefenderHistory] = useWsState<GamePlayerHistoryType>('defenderHistory', []);

  const playerPhase = React.useMemo(() => {
    if (!role) return GamePlayerPhase.WaitGame;
    return role === 'attacker' ? attackerPhase : defenderPhase;
  }, [role, attackerPhase, defenderPhase]);

  const setPlayerPhase = React.useCallback(
    (phase: GamePlayerPhase | ((prevPhase: GamePlayerPhase) => GamePlayerPhase)) => {
      if (!role) return;

      if (role === 'attacker') {
        const newPhase =
          typeof phase === 'function'
            ? (phase as (prevPhase: GamePlayerPhase) => GamePlayerPhase)(attackerPhase)
            : phase;
        setAttackerPhase(newPhase);
      } else {
        const newPhase =
          typeof phase === 'function'
            ? (phase as (prevPhase: GamePlayerPhase) => GamePlayerPhase)(defenderPhase)
            : phase;
        setDefenderPhase(newPhase);
      }
    },
    [attackerPhase, defenderPhase, role, setAttackerPhase, setDefenderPhase],
  );

  const playerState = React.useMemo(() => {
    if (!role) return { cards: [], nodes: [] };
    return role === 'attacker' ? attackerState : defenderState;
  }, [role, attackerState, defenderState]);

  const setPlayerState = React.useCallback(
    (state: GamePlayerStateType | ((prevState: GamePlayerStateType) => GamePlayerStateType)) => {
      if (!role) return;

      if (role === 'attacker') {
        const newState =
          typeof state === 'function'
            ? (state as (prevState: GamePlayerStateType) => GamePlayerStateType)(attackerState)
            : state;
        setAttackerState(newState);
      } else {
        const newState =
          typeof state === 'function'
            ? (state as (prevState: GamePlayerStateType) => GamePlayerStateType)(defenderState)
            : state;
        setDefenderState(newState);
      }
    },
    [attackerState, defenderState, role, setAttackerState, setDefenderState],
  );

  const playerHistory = React.useMemo(() => {
    if (!role) return [];
    return role === 'attacker' ? attackerHistory : defenderHistory;
  }, [role, attackerHistory, defenderHistory]);

  const setPlayerHistory = React.useCallback(
    (history: GamePlayerHistoryType | ((prevHistory: GamePlayerHistoryType) => GamePlayerHistoryType)) => {
      if (!role) return;

      if (role === 'attacker') {
        const newHistory =
          typeof history === 'function'
            ? (history as (prevHistory: GamePlayerHistoryType) => GamePlayerHistoryType)(attackerHistory)
            : history;
        setAttackerHistory(newHistory);
      } else {
        const newHistory =
          typeof history === 'function'
            ? (history as (prevHistory: GamePlayerHistoryType) => GamePlayerHistoryType)(defenderHistory)
            : history;
        setDefenderHistory(newHistory);
      }
    },
    [attackerHistory, defenderHistory, role, setAttackerHistory, setDefenderHistory],
  );

  //* ===== Player Actions =====
  const clickCard = React.useCallback(
    (cardId: string) => {
      setPlayerState((prevState) => ({
        ...prevState,
        cards: prevState.cards.map((card) =>
          card.id === cardId ? { ...card, selected: !card.selected } : { ...card, selected: false },
        ),
        nodes: prevState.nodes.map((node) => ({ ...node, selected: false })),
      }));
    },
    [setPlayerState],
  );

  const clickNode = React.useCallback(
    (nodeId: string) => {
      setPlayerState((prevState) => ({
        ...prevState,
        nodes: prevState.nodes.map((node) =>
          node.id === nodeId ? { ...node, selected: !node.selected } : { ...node, selected: false },
        ),
        cards: prevState.cards.map((card) => ({ ...card, selected: false })),
      }));
    },
    [setPlayerState],
  );

  const clickUseCard = React.useCallback(
    (cardId: string) => {
      if (!role) return;

      let newCard: GameCardType;
      do {
        newCard = getRandomGameCards(role, 1)[0];
      } while (playerState.cards.some((card) => card.id === newCard.id));

      setPlayerState((prevState) => ({
        ...prevState,
        usedCardId: cardId,
        cards: [
          ...prevState.cards.filter((card) => card.id !== cardId).map((card) => ({ ...card, selected: false })),
          { id: newCard.id, selected: false },
        ],
      }));

      setPlayerPhase(() => (isCardTargetNode(cardId) ? GamePlayerPhase.SelectNode : GamePlayerPhase.WaitTurn));

      setPlayerHistory((prevHistory) => [
        ...prevHistory.slice(0, -1),
        { ...prevHistory[prevHistory.length - 1], usedCardId: cardId },
      ]);
    },
    [playerState.cards, role, setPlayerHistory, setPlayerPhase, setPlayerState],
  );

  const clickTargetNode = React.useCallback(
    (nodeId: string) => {
      setPlayerState((prevState) => ({
        ...prevState,
        targetNodeId: nodeId,
        nodes: prevState.nodes.map((node) => ({ ...node, selected: false })),
      }));

      setPlayerPhase(GamePlayerPhase.WaitTurn);

      setPlayerHistory((prevHistory) => [
        ...prevHistory.slice(0, -1),
        { ...prevHistory[prevHistory.length - 1], targetNodeId: nodeId },
      ]);
    },
    [setPlayerHistory, setPlayerPhase, setPlayerState],
  );

  const clickNextRound = React.useCallback(() => {
    setPlayerPhase(GamePlayerPhase.EndRound);
  }, [setPlayerPhase]);

  const checkIsNodeTargetable = React.useCallback(
    (nodeId: string) => {
      const usedCard = playerState.usedCardId;
      return isCardApplicableToNode(usedCard, nodeId);
    },
    [playerState.usedCardId],
  );

  const getGameTopology = React.useCallback(() => {
    return history[round]?.topology ?? defaultGameTopology;
  }, [history, round]);

  const getGamePlayerCards = React.useCallback(() => {
    return playerState.cards;
  }, [playerState.cards]);

  const getGamePlayerNodes = React.useCallback(() => {
    return playerState.nodes;
  }, [playerState.nodes]);

  const getGameStolenTokens = React.useCallback(() => {
    return history[round]?.stolenTokens ?? 0;
  }, [history, round]);

  //* ===== Game Engine =====
  const startGame = () => {
    React.startTransition(() => {
      setRound(1);
      setAttackerPhase(GamePlayerPhase.SelectCard);
      setDefenderPhase(GamePlayerPhase.SelectCard);

      setAttackerState({
        cards: generateGameDeckByRole('attacker', 5),
        nodes: defaultGameNodePlayer,
      });
      setDefenderState({
        cards: generateGameDeckByRole('defender', 5),
        nodes: defaultGameNodePlayer,
      });

      setAttackerHistory([{}, {}]);
      setDefenderHistory([{}, {}]);

      setHistory([
        {
          round: 0,
          stolenTokens: 0,
          topology: defaultGameTopology,
          isCalculated: false,
        },
        {
          round: 1,
          stolenTokens: 0,
          topology: defaultGameTopology,
          isCalculated: false,
        },
      ]);
    });
  };

  const calculateEffects = () => {
    const effect = processGameCardEffect({
      attackerState,
      defenderState,
      topology: getGameTopology(),
      stolenTokens: getGameStolenTokens(),
    });

    React.startTransition(() => {
      setAttackerPhase(GamePlayerPhase.WaitResult);
      setDefenderPhase(GamePlayerPhase.WaitResult);

      setAttackerHistory((prevHistory) => [
        ...prevHistory.slice(0, -1),
        {
          ...prevHistory[prevHistory.length - 1],
          messages: effect.attackerMessages,
          opponentCards: effect.defenderRevealedCards,
        },
      ]);
      setDefenderHistory((prevHistory) => [
        ...prevHistory.slice(0, -1),
        {
          ...prevHistory[prevHistory.length - 1],
          messages: effect.defenderMessages,
          opponentCards: effect.attackerRevealedCards,
        },
      ]);

      setHistory((prevHistory) => [
        ...prevHistory.slice(0, -1),
        {
          ...prevHistory[prevHistory.length - 1],
          stolenTokens: effect.stolenTokens,
          topology: effect.topology,
          isCalculated: true,
        },
      ]);
    });
  };

  const endRound = () => {
    if (history[round]?.stolenTokens >= GameConstant.TokensToWin) {
      setAttackerPhase(GamePlayerPhase.EndGame);
      setDefenderPhase(GamePlayerPhase.EndGame);
      return;
    }
    if (round >= GameConstant.MaxRounds) {
      setAttackerPhase(GamePlayerPhase.EndGame);
      setDefenderPhase(GamePlayerPhase.EndGame);
      return;
    }

    React.startTransition(() => {
      setRound((prevRound) => prevRound + 1);
      setAttackerPhase(GamePlayerPhase.SelectCard);
      setDefenderPhase(GamePlayerPhase.SelectCard);

      setAttackerState((prevState) => ({
        ...prevState,
        usedCardId: undefined,
        targetNodeId: undefined,
      }));
      setDefenderState((prevState) => ({
        ...prevState,
        usedCardId: undefined,
        targetNodeId: undefined,
      }));

      setAttackerHistory((prevHistory) => [
        ...prevHistory,
        {
          usedCardId: '',
          targetNodeId: '',
          result: [],
        },
      ]);
      setDefenderHistory((prevHistory) => [
        ...prevHistory,
        {
          usedCardId: '',
          targetNodeId: '',
          result: [],
        },
      ]);

      setHistory((prevHistory) => [
        ...prevHistory,
        {
          ...prevHistory[prevHistory.length - 1],
          round: prevHistory.length,
        },
      ]);
    });
  };

  //? Timer to initialize game state after connection
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setInitialized(true);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  //? Set user tour ready when game state is initialized
  React.useEffect(() => {
    if (playerPhase === GamePlayerPhase.WaitGame) return;
    setIsUserTourReady(true);
  }, [playerPhase, setIsUserTourReady]);

  //? Main game loop
  React.useEffect(() => {
    if (!isConnected || !isHost || !initialized) return;
    if (players.attacker === null || players.defender === null) return;

    //? Start game when both players are connected and in the wait phase
    if (attackerPhase === GamePlayerPhase.WaitGame && defenderPhase === GamePlayerPhase.WaitGame) {
      startGame();
      return;
    }

    //? Check if both players are in the end of action
    if (attackerPhase === GamePlayerPhase.WaitTurn && defenderPhase === GamePlayerPhase.WaitTurn) {
      calculateEffects();
      return;
    }

    //? Reset round if both players are in the end round phase
    if (attackerPhase === GamePlayerPhase.EndRound && defenderPhase === GamePlayerPhase.EndRound) {
      endRound();
      return;
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [players, attackerPhase, defenderPhase, isConnected, isHost, initialized]);

  const gameState: GameStateType = {
    role,
    round,
    history,
    playerPhase,
    playerState,
    playerHistory,
    clickCard,
    clickNode,
    clickUseCard,
    clickTargetNode,
    clickNextRound,
    checkIsNodeTargetable,
    getGameTopology,
    getGamePlayerCards,
    getGamePlayerNodes,
    getGameStolenTokens,
  };

  return (
    <GameStateContext.Provider value={gameState}>{initialized ? children : <Loading />}</GameStateContext.Provider>
  );
};
