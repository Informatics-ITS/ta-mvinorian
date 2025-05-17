'use client';

import React from 'react';

import { useWsPlayers, useWsState } from '@/hook/use-ws-state';

export const WAITING_JOIN_PHASE = 'waiting-join';
export const GAME_PHASE = 'game';
export const GAME_END_PHASE = 'game-end';
const MAX_ROUNDS = 10;

type GameEngineType = {
  phase: string;
  setPhase: (phase: string) => void;
};

const GameEngineContext = React.createContext<GameEngineType>({
  phase: WAITING_JOIN_PHASE,
  setPhase: () => {},
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
  const [phase, setPhase] = useWsState<string>('phase', WAITING_JOIN_PHASE);
  const [round, _setRound] = useWsState<number>('round', 1);

  const gameEngine: GameEngineType = {
    phase,
    setPhase,
  };

  React.useEffect(() => {
    switch (phase) {
      case WAITING_JOIN_PHASE:
        if (players.attacker && players.defender) setPhase('game');
        break;
      case 'game':
        if (round > MAX_ROUNDS) setPhase('game-end');
        break;
      default:
        break;
    }
  }, [players, phase, setPhase, round]);

  return <GameEngineContext.Provider value={gameEngine}>{children}</GameEngineContext.Provider>;
};
