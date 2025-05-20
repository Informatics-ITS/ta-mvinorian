'use client';

import React from 'react';

import { WsMessageType } from '@/app/(_api)/api/ws/route';
import { useAuthStore } from '@/hook/use-auth-store';
import { useWsPlayers, useWsState } from '@/hook/use-ws-state';
import { defaultGameDeckType, GameCardType, GameDeckType, generateGameDeck, getRandomGameCards } from '@/lib/game-card';
import { generateTopology, TopologyType } from '@/lib/topology';

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
  RoundEnd = 'round-end',
}

type GameRoundPhaseType = Record<GameRoleType, GameRoundPhase>;
const defaultGameRoundPhaseType: GameRoundPhaseType = {
  attacker: GameRoundPhase.CardSelect,
  defender: GameRoundPhase.CardSelect,
};

type GameUsedCardType = Record<GameRoleType, string | null>;
const defaultGameUsedCardType: GameUsedCardType = {
  attacker: null,
  defender: null,
};

export enum GameConstant {
  MaxRounds = 10,
}

export type GameEngineType = {
  phase: GamePhase;
  round: number;
  roundPhase: GameRoundPhaseType;
  role: GameRoleType | null;
  deck: GameDeckType;
  topology: TopologyType | null;
  stolenTokens: number;
  usedCard: GameUsedCardType;
  setDeck: (deck: GameDeckType) => void;
  setUsedCard: (cardId: string) => void;
};

const GameEngineContext = React.createContext<GameEngineType>({
  phase: GamePhase.WaitingJoin,
  round: 1,
  roundPhase: defaultGameRoundPhaseType,
  role: null,
  deck: defaultGameDeckType,
  topology: null,
  stolenTokens: 0,
  usedCard: defaultGameUsedCardType,
  setDeck: () => {},
  setUsedCard: () => {},
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
  const { user } = useAuthStore();
  const { sendMessage } = useWsContext();

  const [phase, setPhase] = useWsState<GameEngineType['phase']>('phase', GamePhase.WaitingJoin);
  const [round, setRound] = useWsState<GameEngineType['round']>('round', 1);
  const [deck, setDeck] = useWsState<GameEngineType['deck']>('deck', defaultGameDeckType);
  const [topology, setTopology] = useWsState<GameEngineType['topology']>('topology', null);
  const [stolenTokens, setStolenTokens] = useWsState<GameEngineType['stolenTokens']>('stolen-tokens', 0);
  const [usedCard, setUsedCard] = useWsState<GameEngineType['usedCard']>('usedCard', defaultGameUsedCardType);
  const [roundPhase, setRoundPhase] = useWsState<GameEngineType['roundPhase']>(
    'round-phase',
    defaultGameRoundPhaseType,
  );

  const roleRef = React.useRef<GameRoleType>(null);
  const role = React.useMemo(() => {
    if (roleRef.current !== null) return roleRef.current;
    if (!user) return;
    if (user.id === players.attacker) return 'attacker';
    if (user.id === players.defender) return 'defender';
  }, [players, user]);

  const setUsedCardClient = (cardId: string) => {
    if (!role) return;
    const newUsedCard = {
      ...usedCard,
      [role]: cardId,
    };
    setUsedCard(newUsedCard);

    let newCard: GameCardType;
    do {
      newCard = getRandomGameCards(role, 1)[0];
    } while (deck[role].some((card) => card.id === newCard.id));
    const newRoleDeck = [...deck[role].filter((card) => card.id !== cardId), { id: newCard.id, selected: false }];
    const newDeck = {
      ...deck,
      [role]: newRoleDeck,
    };
    setDeck(newDeck);
  };

  const gameEngine: GameEngineType = {
    phase,
    roundPhase,
    round,
    role: role ?? null,
    deck,
    topology,
    stolenTokens,
    usedCard,
    setDeck,
    setUsedCard: setUsedCardClient,
  };

  const startGame = React.useCallback(() => {
    setPhase(GamePhase.Play);
    setRound(1);
    setTopology(generateTopology());
    setDeck(generateGameDeck(5, 5));
    setStolenTokens(0);
    setRoundPhase(defaultGameRoundPhaseType);
    setUsedCard(defaultGameUsedCardType);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  React.useEffect(() => {
    switch (phase) {
      case GamePhase.WaitingJoin:
        if (players.attacker && players.defender) startGame();
        break;
      case GamePhase.Play:
        if (round > GameConstant.MaxRounds) setPhase(GamePhase.End);
        break;
      default:
        break;
    }
  }, [players, phase, setPhase, round, startGame]);

  React.useEffect(() => {
    const message: WsMessageType = {
      state: 'refresh',
      data: 'refresh',
    };
    sendMessage(message);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <GameEngineContext.Provider value={gameEngine}>{children}</GameEngineContext.Provider>;
};
