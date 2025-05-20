'use client';

import React from 'react';

import { WsMessageType } from '@/app/(_api)/api/ws/route';
import { useAuthStore } from '@/hook/use-auth-store';
import { useWsPlayers, useWsState } from '@/hook/use-ws-state';
import { GameDeckType, generateGameDeck } from '@/lib/game-card';
import { generateTopology, TopologyType } from '@/lib/topology';

import { useWsContext } from './ws-provider';

export enum GamePhase {
  WaitingJoin = 'waiting-join',
  Play = 'play',
  End = 'end',
}

export enum GameConstant {
  MaxRounds = 10,
}

export type GameEngineType = {
  phase: string;
  round: number;
  role: 'attacker' | 'defender' | null;
  deck: GameDeckType | null;
  setDeck: (deck: GameDeckType) => void;
  topology: TopologyType | null;
  stolenTokens: number;
};

const GameEngineContext = React.createContext<GameEngineType>({
  phase: GamePhase.WaitingJoin,
  round: 1,
  role: null,
  deck: null,
  setDeck: () => {},
  topology: null,
  stolenTokens: 0,
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

  const [phase, setPhase] = useWsState<string>('phase', GamePhase.WaitingJoin);
  const [round, setRound] = useWsState<number>('round', 1);
  const [deck, setDeck] = useWsState<GameDeckType | null>('deck', null);
  const [topology, setTopology] = useWsState<TopologyType | null>('topology', null);
  const [stolenTokens, setStolenTokens] = useWsState<number>('stolen-tokens', 0);

  const roleRef = React.useRef<GameEngineType['role']>(null);
  const role = React.useMemo(() => {
    if (roleRef.current !== null) return roleRef.current;
    if (!user) return;
    if (user.id === players.attacker) return 'attacker';
    if (user.id === players.defender) return 'defender';
  }, [players, user]);

  const gameEngine: GameEngineType = {
    phase,
    round,
    role: role ?? null,
    deck,
    setDeck,
    topology,
    stolenTokens,
  };

  const startGame = React.useCallback(() => {
    setPhase(GamePhase.Play);
    setRound(1);
    setTopology(generateTopology());
    setDeck(generateGameDeck(5, 5));
    setStolenTokens(0);
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
