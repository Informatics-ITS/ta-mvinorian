import { LucideIcon } from 'lucide-react';

import { GAME_CARDS } from '@/constant/game-card';

export type GameCardType = {
  id: string;
  name: string;
  desc: string;
  role: 'attacker' | 'defender';
  type: 'stealth' | 'attack' | 'disrupt' | 'block' | 'detect' | 'recover';
  icon: LucideIcon;
};

export type GameDeckCardType = {
  id: string;
  selected: boolean;
};

export type GameDeckCardDetailType = GameCardType & {
  selected: boolean;
};

export type GameDeckType = {
  attacker: GameDeckCardType[];
  defender: GameDeckCardType[];
};

export const getRandomGameCards = (role: GameCardType['role'], count: number) => {
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

export const getGameDeckDetails = (deck: GameDeckType, role: GameCardType['role']): GameDeckCardDetailType[] => {
  const cards = role === 'attacker' ? deck.attacker : deck.defender;
  return cards
    .map((card) => {
      const cardDetail = GAME_CARDS.find((c) => c.id === card.id);
      return cardDetail ? { ...cardDetail, selected: card.selected } : null;
    })
    .filter(Boolean) as GameDeckCardDetailType[];
};
