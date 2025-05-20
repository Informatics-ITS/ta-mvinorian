import { LucideIcon } from 'lucide-react';

import { GAME_CARDS } from '@/constant/game-card';
import { GameRoleType } from '@/provider/game-engine-provider';

export type GameCardType = {
  id: string;
  name: string;
  desc: string;
  role: GameRoleType;
  type: 'stealth' | 'attack' | 'disrupt' | 'block' | 'detect' | 'recover';
  icon: LucideIcon;
};

export type GameDeckCardType = {
  id: string;
  selected: boolean;
};

export type GameDeckType = {
  attacker: GameDeckCardType[];
  defender: GameDeckCardType[];
};

export const defaultGameDeckType: GameDeckType = {
  attacker: [],
  defender: [],
};

export const getRandomGameCards = (role: GameRoleType, count: number) => {
  const cards = GAME_CARDS.filter((card) => card.role === role);
  const randomCards = cards.sort(() => Math.random() - 0.5).slice(0, count);
  return randomCards;
};

export const generateGameDeck = (attackerCount: number, defenderCount: number): GameDeckType => {
  const attackerDeck = getRandomGameCards('attacker', attackerCount);
  const defenderDeck = getRandomGameCards('defender', defenderCount);

  return {
    attacker: attackerDeck.map((card) => ({ id: card.id, selected: false })),
    defender: defenderDeck.map((card) => ({ id: card.id, selected: false })),
  };
};

export const getGameCardById = (id: string): GameCardType | undefined => {
  const card = GAME_CARDS.find((card) => card.id === id);

  return card;
};
