import { LucideIcon } from 'lucide-react';

import { GAME_DEFENSES } from '@/constant/game-defense';

export type GameDefenseType = {
  id: string;
  alias: string;
  name: string;
  desc: string;
  education: string;
  icon: LucideIcon;
  color: {
    primary: string;
    secondary: string;
    accent: string;
    strong: string;
  };
};

export const getGameDefenseById = (id?: string): GameDefenseType | undefined => {
  if (!id) return undefined;

  const defense = GAME_DEFENSES.find((defense) => defense.id === id);

  return defense;
};
