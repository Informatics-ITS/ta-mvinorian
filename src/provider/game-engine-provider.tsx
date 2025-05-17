'use client';

import React from 'react';

import { useWsState } from '@/hook/use-ws-state';

type GameEngineType = {
  phase: string;
  setPhase: (phase: string) => void;
};

const GameEngineContext = React.createContext<GameEngineType>({
  phase: 'lobby',
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
  const [phase, setPhase] = useWsState<string>('phase', 'lobby');

  const gameEngine: GameEngineType = {
    phase,
    setPhase,
  };

  return <GameEngineContext.Provider value={gameEngine}>{children}</GameEngineContext.Provider>;
};
