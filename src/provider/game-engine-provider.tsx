'use client';

import React from 'react';

import { useAuthStore } from '@/hook/use-auth-store';
import { useWsPlayers, useWsState } from '@/hook/use-ws-state';
import { GameDeckType, generateGameDeck } from '@/lib/game-card';
import { generateTopology, TopologyType } from '@/lib/topology';

export const WAITING_JOIN_PHASE = 'waiting-join';
export const GAME_PHASE = 'game';
export const GAME_END_PHASE = 'game-end';
const MAX_ROUNDS = 10;

export type GameEngineType = {
  phase: string;
  round: number;
  role: 'attacker' | 'defender' | null;
  deck: GameDeckType | null;
  setDeck: (deck: GameDeckType) => void;
  topology: TopologyType | null;
};

const GameEngineContext = React.createContext<GameEngineType>({
  phase: WAITING_JOIN_PHASE,
  round: 1,
  role: null,
  deck: null,
  setDeck: () => {},
  topology: null,
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

  const [phase, setPhase] = useWsState<string>('phase', WAITING_JOIN_PHASE);
  const [round, setRound] = useWsState<number>('round', 1);
  const [deck, setDeck] = useWsState<GameDeckType | null>('deck', null);
  const [topology, setTopology] = useWsState<TopologyType | null>('topology', null);

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
  };

  const startGame = React.useCallback(() => {
    setPhase(GAME_PHASE);
    setRound(1);
    setTopology(generateTopology());
    setDeck(generateGameDeck(5, 5));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  React.useEffect(() => {
    switch (phase) {
      case WAITING_JOIN_PHASE:
        if (players.attacker && players.defender) startGame();
        break;
      case 'game':
        if (round > MAX_ROUNDS) setPhase('game-end');
        break;
      default:
        break;
    }
  }, [players, phase, setPhase, round, startGame]);

  return <GameEngineContext.Provider value={gameEngine}>{children}</GameEngineContext.Provider>;
};
