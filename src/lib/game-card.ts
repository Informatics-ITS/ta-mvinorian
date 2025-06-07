import { LucideIcon } from 'lucide-react';

import { GAME_CARDS } from '@/constant/game-card';
import { GameRoleType } from '@/provider/game-state-provider';

import { GameCardEffectType } from './game-card-effect';

export type GameCardType = {
  id: string;
  name: string;
  desc: string;
  education: string;
  role: GameRoleType;
  type: 'stealth' | 'attack' | 'disrupt' | 'block' | 'detect' | 'recover';
  icon: LucideIcon;
  effect: GameCardEffectType;
};

export type GameCardPlayerType = {
  id: string;
  selected: boolean;
};

export const getRandomGameCards = (role: GameRoleType, count: number) => {
  const cards = GAME_CARDS.filter((card) => card.role === role);
  const randomCards = cards.sort(() => Math.random() - 0.5).slice(0, count);
  return randomCards;
};

export const generateGameDeckByRole = (role: GameRoleType, count: number): GameCardPlayerType[] => {
  const deck = getRandomGameCards(role, count);
  return deck.map((card) => ({ id: card.id, selected: false }));
};

export const getGameCardById = (id?: string): GameCardType | undefined => {
  if (!id) return undefined;

  const card = GAME_CARDS.find((card) => card.id === id);

  return card;
};

export const getGameCardEffect = (cardId?: string): GameCardEffectType | undefined => {
  if (!cardId) return undefined;

  const card = getGameCardById(cardId);
  if (!card) return undefined;

  return card.effect;
};

export const isCardTargetNode = (cardId: string): boolean => {
  const effect = getGameCardEffect(cardId);

  if (!effect) return false;
  if (!effect.nodes) return false;
  if (effect.nodes.length === 0) return false;

  return true;
};

export const isCardApplicableToNode = (cardId?: string, nodeId?: string): boolean => {
  if (!cardId || !nodeId) return false;

  const effect = getGameCardEffect(cardId);
  if (!effect) return false;

  if (!effect.nodes) return false;
  if (effect.nodes.includes('all')) return true;

  return effect.nodes.includes(nodeId);
};
